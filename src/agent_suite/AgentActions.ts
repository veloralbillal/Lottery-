export const AgentActions = {
  async handleCommissionTransfer(system: any, app: any, e: Event) {
    e.preventDefault();
    const amtInput = document.getElementById("agent-wallet-transfer-amount") as HTMLInputElement | null;
    const amt = parseFloat(amtInput?.value || "0");
    const availComm = Number(app.currentUser?.earnedCommission) || 0;
    if (amt < 10) {
      app.showToast("Minimum transfer amount is ৳10!", "error");
      return;
    }
    if (amt > availComm) {
      app.showToast(`Insufficient commission balance (Available: ৳${availComm.toFixed(2)})!`, "error");
      return;
    }
    app.currentUser.earnedCommission = availComm - amt;
    app.currentUser.balance = (Number(app.currentUser.balance) || 0) + amt;
    system.syncAgentRecordEverywhere(app, app.currentUser);

    if (!Array.isArray(app.db.transactions)) app.db.transactions = [];
    app.db.transactions.push({
      id: "tx_comm_" + Date.now(),
      userId: app.currentUser.id,
      userName: app.currentUser.username,
      username: app.currentUser.username,
      paymentMethod: "Agent Commission Transfer",
      phone: app.currentUser.phone || "",
      amount: amt,
      transactionType: "Deposit",
      status: "complete",
      bonusAmount: 0,
      notes: "Transferred earned commission to operational wallet",
      date: new Date().toISOString()
    });

    await app.saveDB(true);
    const form = e.target as HTMLFormElement;
    form.reset();
    system.renderAllPanels(app);
    app.showToast(`Transferred ৳${amt.toFixed(2)} to your operational wallet balance!`, "success");
  },

  async handleRefillRequest(system: any, app: any, e: Event) {
    e.preventDefault();
    const amt = parseFloat((document.getElementById("agent-refill-amount") as HTMLInputElement | null)?.value || "0");
    const method = (document.getElementById("agent-refill-method") as HTMLSelectElement | null)?.value || "bKash Agent";
    const trxid = ((document.getElementById("agent-refill-trxid") as HTMLInputElement | null)?.value || "").trim();
    if (amt < 100 || !trxid) {
      app.showToast("Please enter valid amount (min ৳100) and TrxID!", "error");
      return;
    }
    if (!Array.isArray(app.db.deposits)) app.db.deposits = [];
    app.db.deposits.push({
      id: "dep_agn_" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      gateway: method,
      amount: amt,
      txid: trxid,
      status: "pending",
      date: new Date().toISOString()
    });
    await app.saveDB(true);
    const form = e.target as HTMLFormElement;
    form.reset();
    system.renderAllPanels(app);
    app.showToast(`Refill request of ৳${amt.toFixed(2)} (TrxID: ${trxid}) submitted to Admin!`, "success");
  },

  async handleProfileUpdate(system: any, app: any, e: Event) {
    e.preventDefault();
    if (!app.currentUser) return;
    const form = e.target as HTMLFormElement | null;
    app.currentUser.displayName = ((document.getElementById("agent-prof-displayname") as HTMLInputElement | null)?.value || "").trim();
    app.currentUser.name = app.currentUser.displayName || app.currentUser.username;
    app.currentUser.phone = ((document.getElementById("agent-prof-phone") as HTMLInputElement | null)?.value || "").trim();
    app.currentUser.email = ((document.getElementById("agent-prof-email") as HTMLInputElement | null)?.value || "").trim();
    const districtVal = ((document.getElementById("agent-prof-district") as HTMLInputElement | null)?.value || "").trim();
    if (districtVal) {
      app.currentUser.district = districtVal;
      app.currentUser.region = districtVal;
    }
    app.currentUser.availabilityStatus = (document.getElementById("agent-prof-availability") as HTMLSelectElement | null)?.value || "online";
    const photoVal = ((document.getElementById("agent-prof-photo") as HTMLInputElement | null)?.value || "").trim();
    app.currentUser.photo = photoVal;
    app.currentUser.avatar = photoVal;

    if (form) delete form.dataset.dirty;
    system.syncAgentRecordEverywhere(app, app.currentUser);
    await app.saveDB(true);
    system.populateProfileForm(app, true);
    system.renderAllPanels(app);
    if ((window as any).AffiliateAgentSystem?.renderAgents) {
      (window as any).AffiliateAgentSystem.renderAgents(app);
    }
    app.showToast("Agent profile & photo updated successfully!", "success");
  },

  async handleSecurityUpdate(system: any, app: any, e: Event) {
    e.preventDefault();
    if (!app.currentUser) return;
    const curPass = ((document.getElementById("agent-sec-current-pass") as HTMLInputElement | null)?.value || "").trim();
    const newPass = ((document.getElementById("agent-sec-new-pass") as HTMLInputElement | null)?.value || "").trim();
    const confPass = ((document.getElementById("agent-sec-confirm-pass") as HTMLInputElement | null)?.value || "").trim();

    const verifyFn = (window as any).verifyPasswordWithSalt || ((p: string, h: string) => p === h);
    const hashFn = (window as any).hashPasswordWithUniqueSalt || ((p: string) => p);

    if (app.currentUser.password && !verifyFn(curPass, app.currentUser.password) && curPass !== app.currentUser.password) {
      app.showToast("Current password does not match!", "error");
      return;
    }
    if (newPass.length < 4) {
      app.showToast("New password must be at least 4 characters!", "error");
      return;
    }
    if (newPass !== confPass) {
      app.showToast("New password and confirmation do not match!", "error");
      return;
    }

    app.currentUser.password = hashFn(newPass);
    system.syncAgentRecordEverywhere(app, app.currentUser);
    await app.saveDB(true);
    const form = e.target as HTMLFormElement;
    form.reset();
    app.showToast("Agent password updated securely across all tables!", "success");
  },

  async handleSupportTicket(system: any, app: any, e: Event) {
    e.preventDefault();
    const cat = (document.getElementById("agent-sup-category") as HTMLSelectElement | null)?.value || "Agent Support";
    const msg = ((document.getElementById("agent-sup-message") as HTMLTextAreaElement | null)?.value || "").trim();
    if (!msg) return;
    if (!Array.isArray(app.db.reports)) app.db.reports = [];
    app.db.reports.push({
      id: "rep_agn_" + Date.now(),
      username: app.currentUser?.username || "agent",
      category: `[AGENT DESK] ${cat}`,
      message: msg,
      status: "open",
      date: new Date().toISOString()
    });
    await app.saveDB(true);
    const form = e.target as HTMLFormElement;
    form.reset();
    app.showToast("Support ticket submitted to System Admin!", "success");
  }
};
