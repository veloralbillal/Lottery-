/**
 * Lottery Winner - Tickets Extensions Module (tickets_extensions.js)
 * 
 * Implements advanced gamified tickets features:
 * 1. Interactive Tickets Statistics & Insights Dashboard (Win Rates, Total Invested)
 * 2. Lucky Quick Pick Ticket Generator with dynamic visual roller & instant bulk purchase engine
 * 3. Live Verification Checker Scanner Tool with cryptographic simulation loader
 * 4. Advanced searching, custom sorting, and multi-filtering controls
 */

export class TicketsExtensions {
  static init(appInstance) {
    console.log("Tickets Extensions Module successfully initialized.");

    // Event delegation for Tickets Extension interactions
    document.addEventListener("click", (e) => {
      const user = appInstance.currentUser;
      if (!user) return;

      // 1. Lucky Picker: Click Quick Pick button
      if (e.target.closest("#picker-generate-btn")) {
        TicketsExtensions.handleQuickPickGeneration(appInstance);
        return;
      }

      // 2. Lucky Picker: Click Bulk Purchase button
      if (e.target.closest("#picker-bulk-purchase-btn")) {
        TicketsExtensions.handleBulkPurchase(appInstance);
        return;
      }

      // 3. Live Scanner Checker: Click Verify Ticket button
      if (e.target.closest("#verifier-scan-btn")) {
        TicketsExtensions.handleLiveVerificationScan(appInstance);
        return;
      }

      // 4. Verification Match: View found ticket modal
      const viewFoundBtn = e.target.closest(".verifier-view-ticket-btn");
      if (viewFoundBtn) {
        const ticketId = viewFoundBtn.getAttribute("data-id");
        if (ticketId) {
          appInstance.openTicketLiveInfoPop(ticketId);
        }
        return;
      }
    });

    // Handle real-time filtering updates
    document.addEventListener("input", (e) => {
      if (e.target.id === "ticket-search-input") {
        TicketsExtensions.renderFilteredTicketList(appInstance);
      }
    });

    document.addEventListener("change", (e) => {
      if (
        e.target.id === "ticket-filter-pool" || 
        e.target.id === "ticket-filter-status" || 
        e.target.id === "ticket-sort-by"
      ) {
        TicketsExtensions.renderFilteredTicketList(appInstance);
      }
    });
  }

  static render(appInstance) {
    TicketsExtensions.renderStats(appInstance);
    TicketsExtensions.renderQuickPicker(appInstance);
    TicketsExtensions.renderVerificationScanner(appInstance);
    TicketsExtensions.renderFiltersRow(appInstance);
    TicketsExtensions.renderFilteredTicketList(appInstance);
  }

  // Feature 1: Interactive Statistics & Insights Dashboard
  static renderStats(appInstance) {
    const container = document.getElementById("tickets-extensions-stats-placeholder");
    if (!container) return;

    const user = appInstance.currentUser;
    const tickets = (appInstance.db.tickets || []).filter(t => t.userId === user.id);

    const totalCount = tickets.length;
    const wonCount = tickets.filter(t => t.status === "won").length;
    const lostCount = tickets.filter(t => t.status === "lost").length;
    const runningCount = tickets.filter(t => t.status !== "won" && t.status !== "lost").length;

    // Calculate win rate
    const closedCount = wonCount + lostCount;
    const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

    // Calculate total investment (sum of entry fees)
    let totalInvested = 0;
    tickets.forEach(t => {
      const lot = appInstance.db.lotteries.find(l => l.id === t.lotteryId);
      totalInvested += lot ? (lot.entryFee || 10) : 10;
    });

    // Calculate total won prize money
    const totalWonPrize = tickets.filter(t => t.status === "won").reduce((sum, t) => sum + (t.prizeAmount || 0), 0);

    container.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-4 font-mono shadow-xl relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
        
        <div class="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-chart-pie text-rose-500"></i>
            <span class="text-[11px] font-extrabold uppercase text-slate-300">Lottery Entries Portfolio</span>
          </div>
          <span class="text-[8px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400">Live Statistics</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-slate-950/60 p-3 rounded-2xl border border-slate-850/50 space-y-0.5">
            <span class="text-[8px] text-slate-500 uppercase font-bold block">Total Entries</span>
            <span class="text-xs font-black text-white">${totalCount} Tickets</span>
            <span class="text-[8px] text-slate-600 block">${runningCount} Active Draw Pools</span>
          </div>
          
          <div class="bg-slate-950/60 p-3 rounded-2xl border border-slate-850/50 space-y-0.5">
            <span class="text-[8px] text-slate-500 uppercase font-bold block">Total Investment</span>
            <span class="text-xs font-black text-rose-400">৳${totalInvested.toLocaleString()}</span>
            <span class="text-[8px] text-slate-600 block">Funds placed in draws</span>
          </div>

          <div class="bg-slate-950/60 p-3 rounded-2xl border border-slate-850/50 space-y-0.5">
            <span class="text-[8px] text-slate-500 uppercase font-bold block">Prize Revenue</span>
            <span class="text-xs font-black text-emerald-400">৳${totalWonPrize.toLocaleString()}</span>
            <span class="text-[8px] text-emerald-500/70 block">${wonCount} Winning Tickets</span>
          </div>

          <div class="bg-slate-950/60 p-3 rounded-2xl border border-slate-850/50 space-y-0.5">
            <span class="text-[8px] text-slate-500 uppercase font-bold block">Win Rate Index</span>
            <span class="text-xs font-black text-indigo-400">${winRate}%</span>
            <span class="text-[8px] text-slate-600 block">${closedCount} Decided draws</span>
          </div>
        </div>

        <!-- Custom Graphical Progress Meter -->
        <div class="space-y-1.5 pt-1">
          <div class="flex justify-between items-center text-[9px] text-slate-500">
            <span class="uppercase font-bold">Closed draws win-loss distribution</span>
            <span class="font-extrabold text-slate-300">${wonCount} Won / ${lostCount} Lost</span>
          </div>
          <div class="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850 flex">
            <div class="bg-emerald-500 h-full transition-all duration-500" style="width: ${closedCount > 0 ? (wonCount / closedCount) * 100 : 0}%" title="Won"></div>
            <div class="bg-rose-600 h-full transition-all duration-500" style="width: ${closedCount > 0 ? (lostCount / closedCount) * 100 : 0}%" title="Lost"></div>
            <div class="bg-slate-800 h-full transition-all duration-500 flex-1" title="Unspent/Running"></div>
          </div>
        </div>
      </div>
    `;
  }

  // Feature 2: Lucky Quick Pick Ticket Generator
  static renderQuickPicker(appInstance) {
    const container = document.getElementById("tickets-extensions-picker-placeholder");
    if (!container) return;

    // Load active lottery options
    const activeLotteries = (appInstance.db.lotteries || []).filter(l => l.soldTickets < l.totalTickets);
    let optionsHTML = "";
    
    if (activeLotteries.length === 0) {
      optionsHTML = `<option value="">⚠️ No Active Draw Pools Available</option>`;
    } else {
      activeLotteries.forEach(l => {
        optionsHTML += `
          <option value="${l.id}">
            🎰 ${l.name} (৳${l.entryFee} Fee | Prize: ৳${l.prizeAmount.toLocaleString()})
          </option>
        `;
      });
    }

    container.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 p-4.5 rounded-3xl space-y-4 shadow-xl font-mono h-full flex flex-col justify-between">
        <div class="space-y-1.5">
          <div class="flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
            <i class="fa-solid fa-dice text-rose-500 text-sm"></i>
            <h3 class="text-xs font-extrabold uppercase text-white">🔮 Lucky Quick Pick Picker</h3>
          </div>
          <p class="text-[9px] text-slate-500 leading-normal font-sans">
            Roll randomized ticket combinations using cryptographic lottery seed codes. Generate and bulk buy in one click!
          </p>
        </div>

        <div class="space-y-3 pt-1">
          <div class="space-y-1">
            <label class="block text-[8px] uppercase text-slate-500 font-bold">Select Lottery Draw</label>
            <select id="picker-pool-select" class="w-full bg-slate-950 border border-slate-850 text-slate-300 rounded-xl py-2 px-3 text-[10.5px] outline-none cursor-pointer focus:border-rose-500/60">
              ${optionsHTML}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <label class="block text-[8px] uppercase text-slate-500 font-bold">Tickets to roll</label>
              <select id="picker-count" class="w-full bg-slate-950 border border-slate-850 text-slate-300 rounded-xl py-2 px-3 text-[10.5px] outline-none cursor-pointer focus:border-rose-500/60 font-bold">
                <option value="1">🎫 1 Ticket</option>
                <option value="3" selected>🎟️ 3 Tickets</option>
                <option value="5">🔮 5 Tickets (Lucky Stack)</option>
              </select>
            </div>
            
            <div class="flex flex-col justify-end">
              <button id="picker-generate-btn" type="button" class="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-rose-400 font-bold py-2 px-3 rounded-xl transition text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-rotate"></i> Roll Lucky Codes
              </button>
            </div>
          </div>
        </div>

        <!-- Generated Lucky List Display area -->
        <div id="picker-results-box" class="bg-slate-950/70 border border-slate-850/50 p-3 rounded-2xl min-h-[90px] flex flex-col items-center justify-center text-center py-4">
          <i class="fa-solid fa-circle-nodes text-slate-700 text-lg mb-1 animate-pulse"></i>
          <p class="text-[9px] text-slate-500">Generated ticket queue is empty. Choose parameters and click roll!</p>
        </div>
      </div>
    `;
  }

  // Handle rolling lucky ticket codes
  static handleQuickPickGeneration(appInstance) {
    const poolId = document.getElementById("picker-pool-select")?.value;
    const countVal = parseInt(document.getElementById("picker-count")?.value || "3");

    if (!poolId) {
      appInstance.showToast("Please select an active lottery pool!", "error");
      return;
    }

    const lot = appInstance.db.lotteries.find(l => l.id === poolId);
    if (!lot) return;

    const resultsBox = document.getElementById("picker-results-box");
    if (!resultsBox) return;

    // Show a thrilling random code rolling visual effect!
    resultsBox.innerHTML = `
      <div class="space-y-2 text-center py-2 w-full">
        <div class="text-[10px] text-rose-500 font-extrabold animate-pulse"><i class="fa-solid fa-spinner fa-spin mr-1"></i> CYCLING SEED COMBINATIONS...</div>
        <div class="text-[24px] font-black text-slate-600 tracking-wider select-none animate-bounce">LW-${Math.floor(100000 + Math.random() * 900000)}</div>
      </div>
    `;

    setTimeout(() => {
      // Create dynamic lucky codes
      const rolledCodes = [];
      for (let i = 0; i < countVal; i++) {
        const digitCode = Math.floor(100000 + Math.random() * 900000);
        rolledCodes.push(`LW-${digitCode}`);
      }

      // Save rolled codes to picker-results-box dataset for bulk buying later
      resultsBox.setAttribute("data-rolled-pool-id", poolId);
      resultsBox.setAttribute("data-rolled-codes", JSON.stringify(rolledCodes));

      const totalFee = lot.entryFee * countVal;

      let codesHTML = "";
      rolledCodes.forEach(code => {
        codesHTML += `
          <div class="bg-slate-900 border border-slate-850 py-1.5 px-3 rounded-xl font-black text-xs text-rose-400 flex justify-between items-center select-all">
            <span>🎫 ${code}</span>
            <span class="text-[8px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 font-normal border border-slate-900">RANDOMIZED</span>
          </div>
        `;
      });

      resultsBox.innerHTML = `
        <div class="space-y-3 w-full text-left">
          <div class="flex justify-between items-center text-[9px] text-slate-500">
            <span>Rolled stack ready:</span>
            <span class="font-extrabold text-white">Cost: ৳${totalFee} BDT</span>
          </div>
          
          <div class="space-y-1.5 max-h-[120px] overflow-y-auto">
            ${codesHTML}
          </div>

          <button id="picker-bulk-purchase-btn" type="button" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-[10px] py-2 px-3 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-cart-shopping"></i> Bulk Purchase Stack Now
          </button>
        </div>
      `;

      appInstance.showToast(`Cypher generator rolled ${countVal} lucky combinations successfully!`, "success");
    }, 850);
  }

  // Handle instant bulk purchase of rolled ticket codes
  static handleBulkPurchase(appInstance) {
    const user = appInstance.currentUser;
    const resultsBox = document.getElementById("picker-results-box");
    if (!resultsBox) return;

    const poolId = resultsBox.getAttribute("data-rolled-pool-id");
    const codesStr = resultsBox.getAttribute("data-rolled-codes");

    if (!poolId || !codesStr) return;

    const rolledCodes = JSON.parse(codesStr);
    const lot = appInstance.db.lotteries.find(l => l.id === poolId);
    if (!lot) return;

    const totalFee = lot.entryFee * rolledCodes.length;

    if (user.balance < totalFee) {
      appInstance.showToast(`Insufficient balance! Bulk purchase requires ৳${totalFee}.`, "error");
      appInstance.currentTab = "wallet";
      appInstance.render();
      return;
    }

    if (lot.soldTickets + rolledCodes.length > lot.totalTickets) {
      appInstance.showToast("Cannot purchase: Not enough available slots left in draw pool!", "error");
      return;
    }

    // Process Purchase for each rolled code
    user.balance -= totalFee;
    user.loss += totalFee;
    user.profit -= totalFee;
    lot.soldTickets += rolledCodes.length;

    // Add entry fee directly to progressive jackpot
    appInstance.db.settings.jackpotPool = (appInstance.db.settings.jackpotPool || 0) + totalFee;

    rolledCodes.forEach(code => {
      const newTicket = {
        id: "t" + Date.now() + Math.floor(Math.random() * 1000),
        userId: user.id,
        lotteryId: lot.id,
        code: code,
        purchaseDate: new Date().toISOString(),
        status: "pending",
        prizeAmount: 0
      };
      appInstance.db.tickets.unshift(newTicket);
    });

    appInstance.saveDB();

    appInstance.showToast(`Successfully purchased stack of ${rolledCodes.length} tickets for ৳${totalFee}!`, "success");
    
    // Broadcast notification
    if (window.FloatingToastNotification && window.FloatingToastNotification.broadcastCustom) {
      window.FloatingToastNotification.broadcastCustom("BULK BUY EVENT! 🎟️🎟️", `@<span class="text-white font-bold">${user.username}</span> purchased a stack of <strong class="text-emerald-400">${rolledCodes.length} tickets</strong> for the ${lot.name} draw!`, "success");
    }

    // Grant 15 XP for bulk purchase bonus!
    user.xp = (user.xp || 0) + 15;
    appInstance.saveDB();

    if (window.ProfileTab && window.ProfileTab.checkLevelUp) {
      window.ProfileTab.checkLevelUp(appInstance);
    }

    // Reset results view
    resultsBox.removeAttribute("data-rolled-pool-id");
    resultsBox.removeAttribute("data-rolled-codes");
    resultsBox.innerHTML = `
      <i class="fa-solid fa-circle-check text-emerald-400 text-lg mb-1 animate-bounce"></i>
      <p class="text-[9px] text-slate-400">Stack purchased successfully! Check your tickets ledger list below.</p>
    `;

    // Refresh layout
    appInstance.render();
  }

  // Feature 3: Live Verification Scanner Checker Tool
  static renderVerificationScanner(appInstance) {
    const container = document.getElementById("tickets-extensions-verifier-placeholder");
    if (!container) return;

    container.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 p-4.5 rounded-3xl space-y-4 shadow-xl font-mono h-full flex flex-col justify-between">
        <div class="space-y-1.5">
          <div class="flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
            <i class="fa-solid fa-shield-halved text-rose-500 text-sm"></i>
            <h3 class="text-xs font-extrabold uppercase text-white">🔍 Cryptographic Ticket Verifier</h3>
          </div>
          <p class="text-[9px] text-slate-500 leading-normal font-sans">
            Verify if a ticket code exists, its validation status, or cryptographic proof signatures in draw results ledger.
          </p>
        </div>

        <div class="space-y-3 pt-1">
          <div class="space-y-1">
            <label class="block text-[8px] uppercase text-slate-500 font-bold">Input Ticket Reference Code</label>
            <div class="relative flex items-center bg-slate-950 border border-slate-850 rounded-xl overflow-hidden px-2.5">
              <i class="fa-solid fa-barcode text-slate-500 mr-2 text-[11px]"></i>
              <input type="text" id="verifier-code-input" placeholder="LW-123456 or LW-..." class="w-full bg-transparent border-none text-[11px] text-white py-2.5 outline-none font-bold placeholder-slate-750 uppercase" />
            </div>
          </div>

          <button id="verifier-scan-btn" type="button" class="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-rose-400 font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-[10px] flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-radar text-rose-500 animate-pulse"></i> Verify Signature Ledger
          </button>
        </div>

        <!-- Verification Scanner Display result area -->
        <div id="verifier-output-box" class="bg-slate-950/70 border border-slate-850/50 p-3 rounded-2xl min-h-[90px] flex flex-col items-center justify-center text-center py-4">
          <i class="fa-solid fa-network-wired text-slate-700 text-lg mb-1"></i>
          <p class="text-[9px] text-slate-500">Validation engine offline. Input ticket code and check ledger status!</p>
        </div>
      </div>
    `;
  }

  // Handle Scanning and verifier response
  static handleLiveVerificationScan(appInstance) {
    const inputVal = document.getElementById("verifier-code-input")?.value?.trim().toUpperCase();
    const outputBox = document.getElementById("verifier-output-box");
    if (!outputBox) return;

    if (!inputVal) {
      appInstance.showToast("Please enter a ticket code to verify!", "error");
      return;
    }

    // Show Scanning animation
    outputBox.innerHTML = `
      <div class="space-y-2 text-center py-1 w-full text-[9px] text-slate-500 font-bold">
        <div class="flex items-center justify-center gap-1.5 text-rose-500">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>[ SEARCHING CENTRAL CRYPTO DRAW DATABASE... ]</span>
        </div>
        <div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div class="bg-gradient-to-r from-red-600 via-rose-500 to-indigo-500 h-full rounded-full animate-pulse" style="width: 100%"></div>
        </div>
        <span class="text-[8px] text-slate-600">Sync status: SECURED SHA-256 LEDGER CHANNEL</span>
      </div>
    `;

    setTimeout(() => {
      // Find ticket anywhere in user database (or overall system tickets)
      const ticket = (appInstance.db.tickets || []).find(t => t.code.toUpperCase() === inputVal);
      
      if (!ticket) {
        outputBox.innerHTML = `
          <div class="space-y-1 text-center py-1.5">
            <i class="fa-solid fa-triangle-exclamation text-rose-500 text-base mb-1 block"></i>
            <span class="text-[10px] text-white uppercase font-black tracking-wider">VALIDATION FAILURE</span>
            <p class="text-[8.5px] text-slate-500">Signature mismatch: Code "${inputVal}" is not registered in our drawing database.</p>
          </div>
        `;
        appInstance.showToast("Ticket verification failed: Code not found in ledger.", "error");
        return;
      }

      // Ticket found!
      const lot = appInstance.db.lotteries.find(l => l.id === ticket.lotteryId) || { name: "Archived Pool", prizeAmount: 0 };
      
      let statusHTML = "";
      if (ticket.status === "won") {
        statusHTML = `<span class="px-2 py-0.5 rounded text-[8.5px] font-black bg-emerald-955 text-emerald-400 border border-emerald-900">🏆 WINNING TICKET</span>`;
      } else if (ticket.status === "lost") {
        statusHTML = `<span class="px-2 py-0.5 rounded text-[8.5px] font-black bg-rose-955 text-rose-400 border border-rose-900">❌ NO REWARDS DRAWN</span>`;
      } else {
        statusHTML = `<span class="px-2 py-0.5 rounded text-[8.5px] font-black bg-amber-955 text-amber-500 border border-amber-900 animate-pulse">⏳ DRAW ACTIVE / PENDING</span>`;
      }

      outputBox.innerHTML = `
        <div class="space-y-2.5 text-left w-full">
          <div class="flex justify-between items-center border-b border-slate-850 pb-1.5">
            <span class="text-[9px] text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> SECURE SIGNATURE OK</span>
            ${statusHTML}
          </div>
          
          <div class="space-y-1 text-[9px]">
            <div class="flex justify-between"><span class="text-slate-500">Ticket Code:</span> <strong class="text-white">${ticket.code}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Draw Pool:</span> <strong class="text-slate-300 truncate max-w-[150px]">${lot.name}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Purchase Date:</span> <strong class="text-slate-400">${new Date(ticket.purchaseDate).toLocaleDateString()}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Est. Pool Prize:</span> <strong class="text-white">৳${lot.prizeAmount.toLocaleString()}</strong></div>
          </div>

          <button type="button" data-id="${ticket.id}" class="verifier-view-ticket-btn w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-extrabold text-[9px] py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer">
            <i class="fa-solid fa-circle-info"></i> Open Receipt Invoice Invoice
          </button>
        </div>
      `;

      appInstance.showToast("Ticket verified! Signature matches database records.", "success");
    }, 1200);
  }

  // Feature 4: Search & Multi-Filters Panel
  static renderFiltersRow(appInstance) {
    const container = document.getElementById("tickets-extensions-filters-placeholder");
    if (!container) return;

    // Get all unique lottery pool names for custom search filtering
    const user = appInstance.currentUser;
    const tickets = (appInstance.db.tickets || []).filter(t => t.userId === user.id);
    const uniquePoolIds = [...new Set(tickets.map(t => t.lotteryId))];

    let poolOptionsHTML = `<option value="all">📁 All Lottery Pools</option>`;
    uniquePoolIds.forEach(pId => {
      const lot = appInstance.db.lotteries.find(l => l.id === pId);
      if (lot) {
        poolOptionsHTML += `<option value="${lot.id}">🎯 ${lot.name}</option>`;
      }
    });

    container.innerHTML = `
      <div class="bg-slate-950 border border-slate-850 p-3 rounded-2xl space-y-2.5 font-mono text-[10px] mt-4">
        <!-- Search bar -->
        <div class="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden px-2.5">
          <i class="fa-solid fa-magnifying-glass text-slate-500 mr-2 text-[10px]"></i>
          <input type="text" id="ticket-search-input" placeholder="Search by Ticket Code (e.g. LW-852401) or Pool Name..." class="w-full bg-transparent border-none text-[10.5px] text-white py-1.5 outline-none placeholder-slate-600" />
        </div>

        <!-- Filter Dropdowns Row -->
        <div class="grid grid-cols-3 gap-2">
          <div class="space-y-1">
            <label class="text-[8px] text-slate-500 uppercase font-bold block">Lottery Pool</label>
            <select id="ticket-filter-pool" class="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg py-1.5 px-2 outline-none cursor-pointer focus:border-rose-500/80">
              ${poolOptionsHTML}
            </select>
          </div>
          
          <div class="space-y-1">
            <label class="text-[8px] text-slate-500 uppercase font-bold block">Status</label>
            <select id="ticket-filter-status" class="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg py-1.5 px-2 outline-none cursor-pointer focus:border-rose-500/80">
              <option value="all">🔍 All Statuses</option>
              <option value="pending">⏳ Running</option>
              <option value="won">🏆 Won Draws</option>
              <option value="lost">❌ Lost Draws</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-[8px] text-slate-500 uppercase font-bold block">Sort order</label>
            <select id="ticket-sort-by" class="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg py-1.5 px-2 outline-none cursor-pointer focus:border-rose-500/80">
              <option value="date-desc">📅 Newest First</option>
              <option value="date-asc">📅 Oldest First</option>
              <option value="prize-desc">💰 Highest Prize</option>
              <option value="prize-asc">💰 Lowest Prize</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  // Live filtering and sorting stream render
  static renderFilteredTicketList(appInstance) {
    const listEl = document.getElementById("tickets-list-container");
    if (!listEl) return;

    const user = appInstance.currentUser;
    const tickets = (appInstance.db.tickets || []).filter(t => t.userId === user.id);

    // Read active multi-filter & search inputs
    const searchVal = document.getElementById("ticket-search-input")?.value?.trim().toLowerCase() || "";
    const filterPool = document.getElementById("ticket-filter-pool")?.value || "all";
    const filterStatus = document.getElementById("ticket-filter-status")?.value || "all";
    const sortBy = document.getElementById("ticket-sort-by")?.value || "date-desc";

    // Apply filtering stream
    let filtered = [...tickets];

    // Search filter
    if (searchVal) {
      filtered = filtered.filter(t => {
        const lot = appInstance.db.lotteries.find(l => l.id === t.lotteryId) || { name: "" };
        const codeMatch = t.code.toLowerCase().includes(searchVal);
        const nameMatch = lot.name.toLowerCase().includes(searchVal);
        return codeMatch || nameMatch;
      });
    }

    // Pool filter
    if (filterPool !== "all") {
      filtered = filtered.filter(t => t.lotteryId === filterPool);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Apply Sorting
    filtered.sort((a, b) => {
      const lotA = appInstance.db.lotteries.find(l => l.id === a.lotteryId) || { name: "", prizeAmount: 0 };
      const lotB = appInstance.db.lotteries.find(l => l.id === b.lotteryId) || { name: "", prizeAmount: 0 };

      if (sortBy === "date-desc") {
        return new Date(b.purchaseDate) - new Date(a.purchaseDate);
      } else if (sortBy === "date-asc") {
        return new Date(a.purchaseDate) - new Date(b.purchaseDate);
      } else if (sortBy === "prize-desc") {
        return lotB.prizeAmount - lotA.prizeAmount;
      } else if (sortBy === "prize-asc") {
        return lotA.prizeAmount - lotB.prizeAmount;
      }
      return 0;
    });

    // Clear and build the list
    listEl.innerHTML = "";

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-xs font-mono bg-slate-950/45 border border-slate-900/60 rounded-3xl mt-4">
          <i class="fa-solid fa-clock-rotate-left text-xl text-slate-700 block mb-2"></i>
          No tickets found matching your filter criteria.
        </div>
      `;
      return;
    }

    filtered.forEach(t => {
      const lot = appInstance.db.lotteries.find(l => l.id === t.lotteryId) || { name: "Expired Draw Event", prizeAmount: 0 };
      const card = document.createElement("div");
      card.className = "bg-slate-900 hover:bg-slate-850 border border-slate-800/80 p-4 rounded-3xl relative flex justify-between items-center cursor-pointer hover:border-rose-500/40 transition-all duration-300 shadow-sm relative group overflow-hidden active:scale-[0.99]";

      let statusBadge = "";
      if (t.status === "won") {
        statusBadge = `<span class="bg-emerald-950/55 border border-emerald-900 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">🏆 WON ৳${t.prizeAmount || lot.prizeAmount}</span>`;
      } else if (t.status === "lost") {
        statusBadge = `<span class="bg-slate-950 border border-slate-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">❌ LOST</span>`;
      } else {
        statusBadge = `<span class="bg-amber-950/55 border border-amber-900 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono animate-pulse">⏳ RUNNING</span>`;
      }

      card.innerHTML = `
        <div class="space-y-1 max-w-[70%] font-mono">
          <h4 class="text-xs font-black text-white leading-none flex items-center gap-1.5">
            <i class="fa-solid fa-ticket text-rose-500 text-[10px]"></i>
            ${lot.name}
          </h4>
          <span class="text-[9px] text-slate-500 font-mono block">Purchased: ${new Date(t.purchaseDate).toLocaleDateString()}</span>
          <div class="text-sm font-black tracking-widest text-rose-400 font-mono pt-1 select-all select-text">${t.code}</div>
        </div>
        <div class="text-right shrink-0">
          ${statusBadge}
        </div>
        <!-- Tap indicator icon visible on hover -->
        <div class="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-rose-500">
          <i class="fa-solid fa-up-right-from-square"></i>
        </div>
      `;

      card.addEventListener("click", () => {
        appInstance.openTicketLiveInfoPop(t.id);
      });

      listEl.appendChild(card);
    });
  }
}
