export const AdminWithdrawals = {
  renderAdminWithdraws(this: any) {
    const listEl = document.getElementById("admin-withdraws-tbody");
    if (!listEl) return;

    listEl.innerHTML = "";
    const withdrawals = this.db.withdrawals || [];
    if (withdrawals.length === 0) {
      listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500 font-mono text-[10.5px]">No payouts registered in records.</td></tr>`;
      return;
    }

    const sorted = [...withdrawals].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sorted.forEach((w: any) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition";

      const badgeColor = w.status === "approved" ? "bg-green-950 text-green-400 border border-green-900/30" :
                         w.status === "pending" ? "bg-amber-950 text-amber-400 border border-amber-900/30" :
                         "bg-red-950 text-red-500 border border-red-900/30";

      let actionBtns = "";
      if (w.status === "pending") {
        actionBtns = `
          <div class="flex justify-end gap-1 font-mono">
            <button class="admin-approve-wd-btn bg-green-700 hover:bg-green-600 text-white font-bold py-1 px-2 rounded-lg transition text-[9px] cursor-pointer" data-id="${w.id}">Approve</button>
            <button class="admin-reject-wd-btn bg-red-700 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-lg transition text-[9px] cursor-pointer" data-id="${w.id}">Reject</button>
          </div>
        `;
      } else {
        actionBtns = `<span class="text-[9.5px] font-mono text-slate-600 font-semibold uppercase flex items-center justify-end gap-1"><i data-lucide="check-square" class=" text-emerald-500 text-[9px]"></i> Disbursed</span>`;
      }

      row.innerHTML = `
        <td class="p-3">
          <div class="font-bold text-white">@${w.username}</div>
          <div class="text-[9.5px] text-slate-500 font-mono">${new Date(w.date).toLocaleDateString()} at ${new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </td>
        <td class="p-3">
          <div class="font-bold text-slate-200 capitalize">${w.gateway || w.method || "bKash"}</div>
          <div class="text-[9.5px] text-slate-500 font-mono select-all">Acc: ${w.targetAccount || w.phone || ""}</div>
        </td>
        <td class="p-3">
          <div class="font-bold text-rose-400 font-mono text-[13px]">৳${w.amount}</div>
        </td>
        <td class="p-3">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${badgeColor}">${w.status.toUpperCase()}</span>
        </td>
        <td class="p-3 text-right">${actionBtns}</td>
      `;

      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".admin-approve-wd-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const wdId = btn.getAttribute("data-id");
        if (wdId) this.processWithdrawTransaction(wdId, "approved");
      });
    });

    listEl.querySelectorAll(".admin-reject-wd-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const wdId = btn.getAttribute("data-id");
        if (wdId) this.processWithdrawTransaction(wdId, "rejected");
      });
    });

    this.refreshIcons();
  },

  processWithdrawTransaction(this: any, withdrawalId: string, outcome: string) {
    const wd = this.db.withdrawals.find((w: any) => w.id === withdrawalId);
    if (!wd) return;

    if (wd.status !== "pending") {
      this.showToast("This withdrawal has already been processed.", "info");
      return;
    }

    if (!confirm(`Confirm payout ${outcome} for ৳${wd.amount}?`)) return;

    wd.status = outcome;

    if (outcome === "rejected") {
      const user = this.db.users.find((u: any) => u.id === wd.userId);
      if (user) {
        user.balance = (user.balance || 0) + (parseFloat(wd.amount) || 0);
        this.showToast(`৳${wd.amount} returned to @${user.username} wallet.`, "info");
      }
    } else {
      this.showToast(`Withdrawal ৳${wd.amount} marked as processed.`, "success");
    }

    this.saveDB();
    this.renderAdminWithdraws();
  }
};
