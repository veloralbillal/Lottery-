export const AdminDeposits = {
  renderAdminDeposits(this: any) {
    const listEl = document.getElementById("admin-deposits-tbody");
    if (!listEl) return;

    listEl.innerHTML = "";
    const deps = this.db.deposits || [];
    if (deps.length === 0) {
      listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500 font-mono text-[10.5px]">No registered digital transactions found.</td></tr>`;
      return;
    }

    const sorted = [...deps].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sorted.forEach((d: any) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition";

      const badgeColor = d.status === "approved" ? "bg-green-950 text-green-400 border border-green-900/30" :
                         d.status === "pending" ? "bg-amber-950 text-amber-400 border border-amber-900/30" :
                         "bg-red-950 text-red-500 border border-red-900/30";

      let actionBtns = "";
      if (d.status === "pending") {
        actionBtns = `
          <div class="flex justify-end gap-1 font-mono">
            <button class="admin-approve-dep-btn bg-green-700 hover:bg-green-600 text-white font-bold py-1 px-2 rounded-lg transition text-[9px] cursor-pointer" data-id="${d.id}">Approve</button>
            <button class="admin-reject-dep-btn bg-red-700 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-lg transition text-[9px] cursor-pointer" data-id="${d.id}">Reject</button>
          </div>
        `;
      } else {
        actionBtns = `<span class="text-[9.5px] font-mono text-slate-600 font-semibold uppercase flex items-center justify-end gap-1"><i data-lucide="check-square" class=" text-emerald-500 text-[9px]"></i> Processed</span>`;
      }

      row.innerHTML = `
        <td class="p-3">
          <div class="font-bold text-white">@${d.username}</div>
          <div class="text-[9.5px] text-slate-500 font-mono">${new Date(d.date).toLocaleDateString()} at ${new Date(d.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </td>
        <td class="p-3">
          <div class="font-bold text-slate-200 capitalize">${d.gateway || d.method || "bKash"}</div>
          <div class="text-[9.5px] text-slate-500 font-mono select-all">TRX: ${d.trxId || "Unknown"}</div>
        </td>
        <td class="p-3 font-bold text-emerald-400 font-mono">৳${d.amount}</td>
        <td class="p-3">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${badgeColor}">${d.status.toUpperCase()}</span>
        </td>
        <td class="p-3 text-right">${actionBtns}</td>
      `;

      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".admin-approve-dep-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const depId = btn.getAttribute("data-id");
        if (depId) this.processDepositTransaction(depId, "approved");
      });
    });

    listEl.querySelectorAll(".admin-reject-dep-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const depId = btn.getAttribute("data-id");
        if (depId) this.processDepositTransaction(depId, "rejected");
      });
    });

    this.refreshIcons();
  },

  processDepositTransaction(this: any, depositId: string, outcome: string) {
    const dep = this.db.deposits.find((d: any) => d.id === depositId);
    if (!dep) return;

    if (dep.status !== "pending") {
      this.showToast("This transaction has already been processed.", "info");
      return;
    }

    if (!confirm(`Are you sure you want to mark this deposit as ${outcome}?`)) return;

    dep.status = outcome;

    if (outcome === "approved") {
      const user = this.db.users.find((u: any) => u.id === dep.userId);
      if (user) {
        user.balance = (user.balance || 0) + (parseFloat(dep.amount) || 0);
        this.showToast(`৳${dep.amount} successfully credited to @${user.username}.`, "success");

        const notification = {
          id: "notif_" + Date.now(),
          userId: user.id,
          title: "Deposit Approved! 💰",
          message: `Your deposit of ৳${dep.amount} has been verified and added to your wallet.`,
          date: new Date().toISOString(),
          read: false
        };
        if (!this.db.notifications) this.db.notifications = [];
        this.db.notifications.unshift(notification);
      }
    } else {
      this.showToast(`Deposit TRX:${dep.trxId} has been rejected.`, "error");
    }

    this.saveDB();
    this.renderAdminDeposits();
  }
};
