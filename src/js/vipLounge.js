// ============================================================================
// VIP LOUNGE SYSTEM MODULE
// ============================================================================

export const VipLoungeModule = {
  renderVipLoungePlans() {
    const list = document.getElementById("vip-lounge-plans-list");
    if (!list || !this.currentUser) return;

    list.innerHTML = "";
    
    const activeLevelId = this.currentUser.vipLevelId || "";
    const tiers = this.db.settings.vipTiers || [];

    tiers.forEach(tier => {
      const isActive = (activeLevelId === tier.id);
      
      let badgeHtml = "";
      let actionBtnHtml = "";

      if (isActive) {
        badgeHtml = '<span class="bg-amber-950 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded text-[8px] font-bold">✓ ACTIVE RANKS STATUS</span>';
        actionBtnHtml = `
          <button class="w-full bg-amber-950 border border-amber-850 text-amber-400 font-extrabold text-[10px] py-1.5 rounded-xl cursor-default flex items-center justify-center gap-1">
            <i class="fa-solid fa-square-check"></i> Already Activated Member
          </button>
        `;
      } else {
        badgeHtml = `<span class="bg-indigo-955 text-indigo-400 border border-indigo-900/60 px-2 py-0.5 rounded text-[8px] font-bold">৳${tier.price} TO BUY</span>`;
        actionBtnHtml = `
          <button onclick="window.appInstance.purchaseVipTier('${tier.id}')" class="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-extrabold text-[10px] py-2 rounded-xl transition shadow-md active:scale-[0.98] cursor-pointer">
            Activate ${tier.title} Upgrade
          </button>
        `;
      }

      list.innerHTML += `
        <div class="bg-slate-950 border ${isActive ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-slate-850'} p-3.5 rounded-2xl space-y-3 font-mono transition">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-gem text-amber-400 text-base"></i>
              <h5 class="text-xs font-black text-white">${tier.title}</h5>
            </div>
            ${badgeHtml}
          </div>
          
          <div class="grid grid-cols-3 gap-1 text-[9px] border-y border-slate-900/80 py-2 text-center">
            <div>
              <span class="text-slate-500 block hidden md:block">Payout mult</span>
              <span class="text-slate-500 block md:hidden">Boost</span>
              <strong class="text-white font-bold">${tier.multiplier.toFixed(2)}x Boost</strong>
            </div>
            <div>
              <span class="text-slate-500 block hidden md:block">Ticket Disc.</span>
              <span class="text-slate-500 block md:hidden">Disc.</span>
              <strong class="text-white font-bold">${tier.discount}% Off</strong>
            </div>
            <div>
              <span class="text-slate-500 block hidden md:block">Up bonus</span>
              <span class="text-slate-500 block md:hidden">Free</span>
              <strong class="text-emerald-400 font-bold">৳${tier.bonus} Free</strong>
            </div>
          </div>
          
          ${actionBtnHtml}
        </div>
      `;
    });

    // Update Banner Status
    const statusLabel = document.getElementById("vip-current-status-tier");
    if (statusLabel) {
      const activeTierObj = tiers.find(t => t.id === activeLevelId);
      statusLabel.innerText = activeTierObj ? activeTierObj.title.toUpperCase() : "BRONZE SYSTEM RECRUIT (NO VIP)";
    }

    const multLabel = document.getElementById("vip-current-status-mult");
    if (multLabel) {
      const activeTierObj = tiers.find(t => t.id === activeLevelId);
      multLabel.innerText = activeTierObj ? `${activeTierObj.multiplier.toFixed(2)}x (Boosted)` : "1.0x (Standard)";
    }
  },

  purchaseVipTier(tierId) {
    if (!this.currentUser) return;

    const tierObj = this.db.settings.vipTiers.find(t => t.id === tierId);
    if (!tierObj) return;

    if (this.currentUser.balance < tierObj.price) {
      this.showToast(`Insufficient balance! This VIP upgrade costs ৳${tierObj.price} Taka. Deposit funds first.`, "error");
      return;
    }

    // Deduct cost and save rank upgrade bonus
    this.currentUser.balance -= tierObj.price;
    this.currentUser.vipLevelId = tierObj.id;
    this.currentUser.balance += tierObj.bonus;

    // Log debit ledger transaction details
    this.db.transactions.push({
      id: "tx" + Date.now() + Math.floor(Math.random() * 100),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      type: "debit",
      amount: tierObj.price,
      method: "VIP Status Upgrade Purchase",
      walletNumber: `${tierObj.title} Club`,
      date: new Date().toISOString(),
      status: "approved"
    });

    // Log free welcome upgrade bonus cash ledger
    this.db.transactions.push({
      id: "tx" + (Date.now() + 1) + Math.floor(Math.random() * 100),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      type: "credit",
      amount: tierObj.bonus,
      method: "VIP Welcome Bonus Credit",
      walletNumber: `${tierObj.title} System Vault`,
      date: new Date().toISOString(),
      status: "approved"
    });

    this.saveDB();
    this.showToast(`👑 Congratulations! Upgraded to ${tierObj.title} Club status successfully. Welcome bonus credited!`, "success");
    if (navigator.vibrate) navigator.vibrate(200);

    this.renderVipLoungePlans();
    this.render(); // Redraw dashboard headers and balance display metrics
  }
};
