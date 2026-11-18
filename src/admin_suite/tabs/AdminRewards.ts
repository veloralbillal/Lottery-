import { CheckinSettingsTab } from "../../admin_tabs/checkinSettings.js";

export const AdminRewards = {
  renderAdminRefer(this: any) {
    const s = this.db.settings;
    const refBonusEl = document.getElementById("sys-referral-bonus") as HTMLInputElement;
    const refMinDepEl = document.getElementById("sys-min-referral-deposit") as HTMLInputElement;

    if (refBonusEl) refBonusEl.value = String(s.referralBonus ?? 50);
    if (refMinDepEl) refMinDepEl.value = String(s.minReferralDeposit ?? 100);
  },

  renderAdminCheckin(this: any) {
    CheckinSettingsTab.renderCheckinSettings(this);
  },

  renderAdminVipClub(this: any) {
    const listEl = document.getElementById("admin-vip-levels-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    const levels = this.db.vipLevels || [
      { id: "bronze", label: "Bronze", minBalance: 1000, rewardMultiplier: 1.05 },
      { id: "silver", label: "Silver", minBalance: 5000, rewardMultiplier: 1.10 },
      { id: "gold", label: "Gold", minBalance: 15000, rewardMultiplier: 1.25 },
      { id: "platinum", label: "Platinum", minBalance: 50000, rewardMultiplier: 1.50 }
    ];

    levels.forEach((lvl: any) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 border-b border-slate-800/60 transition";
      row.innerHTML = `
        <td class="p-3 font-bold text-white">${lvl.label}</td>
        <td class="p-3 font-mono text-amber-400">৳${lvl.minBalance}</td>
        <td class="p-3 font-mono text-cyan-400">${lvl.rewardMultiplier}x</td>
        <td class="p-3 text-right">
           <button class="edit-vip-lvl-btn bg-slate-900 hover:bg-slate-800 text-slate-300 p-1.5 rounded-lg border border-slate-800" data-id="${lvl.id}"><i data-lucide="edit" class="w-3.5 h-3.5"></i></button>
        </td>
      `;
      listEl.appendChild(row);
    });

    this.refreshIcons();
  },

  renderAdminJackpot(this: any) {
    const s = this.db.settings;
    const jackpotPoolEl = document.getElementById("admin-jackpot-pool-display");
    const jackpotMinEl = document.getElementById("sys-jackpot-min-bet") as HTMLInputElement;
    const jackpotContribEl = document.getElementById("sys-jackpot-contribution") as HTMLInputElement;

    if (jackpotPoolEl) jackpotPoolEl.innerText = "৳" + (this.db.jackpotPool || 0).toLocaleString();
    if (jackpotMinEl) jackpotMinEl.value = String(s.jackpotMinBet ?? 50);
    if (jackpotContribEl) jackpotContribEl.value = String(s.jackpotContribution ?? 1);
  },

  renderAdminTasks(this: any) {
    const listEl = document.getElementById("admin-tasks-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    const tasks = this.db.missions || [];
    if (tasks.length === 0) {
      listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500 font-mono text-xs">No administrative tasks or missions configured.</td></tr>`;
      return;
    }

    tasks.forEach((t: any) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 border-b border-slate-800/60 transition";
      row.innerHTML = `
        <td class="p-3 font-bold text-white">${t.title}</td>
        <td class="p-3 text-xs text-slate-400">${t.requirement}</td>
        <td class="p-3 font-mono text-emerald-400">৳${t.reward}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-950 text-slate-500">${t.status || 'ACTIVE'}</span></td>
        <td class="p-3 text-right">
           <button class="delete-task-btn bg-rose-955 hover:bg-rose-900 border border-rose-900/40 text-rose-400 p-1.5 rounded-lg transition" data-id="${t.id}"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </td>
      `;
      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".delete-task-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.db.missions = (this.db.missions || []).filter((x: any) => x.id !== id);
        this.saveDB();
        this.renderAdminTasks();
      });
    });

    this.refreshIcons();
  }
};
