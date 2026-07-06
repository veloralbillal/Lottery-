/**
 * Lottery Winner - Referral Extensions Module (referralExtensions.js)
 * 
 * Provides interactive referral earnings calculator, social marketing templates, 
 * and dynamic level milestone progress bars.
 */

export class ReferralExtensions {
  static init(appInstance) {
    console.log("Referral Extensions Module loaded.");
    this.setupListeners(appInstance);
  }

  static setupListeners(appInstance) {
    // Handle calculator adjustments
    document.addEventListener("input", (e) => {
      if (e.target.id === "calc-friends-count" || e.target.id === "calc-tickets-avg") {
        this.updateCalculator();
      }
    });

    // Handle template share buttons
    document.addEventListener("click", (e) => {
      const shareBtn = e.target.closest("[data-share-platform]");
      if (shareBtn) {
        const platform = shareBtn.getAttribute("data-share-platform");
        const templateId = shareBtn.getAttribute("data-template-id");
        this.shareTemplate(appInstance, platform, templateId);
        return;
      }

      // Handle interactive referral milestones claim
      const claimBtn = e.target.closest(".claim-milestone-btn");
      if (claimBtn) {
        if (!appInstance.currentUser) {
          appInstance.showToast("Please register or login first!", "error");
          return;
        }

        const title = claimBtn.getAttribute("data-title");
        const levels = appInstance.db.settings.milestoneLevels || [];
        const matchedLvl = levels.find(l => l.title === title);

        if (matchedLvl) {
          const user = appInstance.currentUser;
          const count = user.refersCount || 0;

          if (count < matchedLvl.count) {
            appInstance.showToast("You have not reached the referral count for this milestone yet.", "error");
            return;
          }

          if (!user.rewardedMilestones) user.rewardedMilestones = [];
          if (user.rewardedMilestones.includes(title)) {
            appInstance.showToast("This milestone has already been claimed.", "warning");
            return;
          }

          // Complete claim
          const reward = parseFloat(matchedLvl.reward || 0);
          user.balance = (user.balance || 0) + reward;
          user.rewardedMilestones.push(title);

          // Add transaction log
          if (!appInstance.db.ledgers) appInstance.db.ledgers = [];
          appInstance.db.ledgers.push({
            id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 100),
            username: user.username,
            type: "bonus",
            amount: reward,
            date: new Date().toISOString(),
            description: `Claimed Referral Milestone Reward: ${title}`
          });

          // Add to agent activity logs if they are tracking it
          if (!appInstance.db.agentLedger) appInstance.db.agentLedger = [];
          appInstance.db.agentLedger.push({
            id: "act_" + Date.now() + "_" + Math.floor(Math.random() * 100),
            agentId: user.id,
            timestamp: new Date().toISOString(),
            targetUser: "self",
            description: `Claimed Milestone Reward: ${title}`,
            amount: reward,
            commission: 0
          });

          // Send an in-app inbox message notification
          const autoNotice = {
            id: "msg_auto_" + Date.now() + "_" + Math.floor(Math.random() * 99),
            recipientType: "specific",
            targetUsername: user.username,
            category: "bonus",
            subject: `🎁 Milestone Claimed: ${title}!`,
            content: `Congratulations! You have claimed the milestone "${title}" successfully. A bonus reward of ৳${reward} has been credited to your purse!`,
            date: new Date().toISOString(),
            readBy: []
          };
          if (!appInstance.db.messages) appInstance.db.messages = [];
          appInstance.db.messages.push(autoNotice);

          // Save and refresh
          appInstance.saveDB();
          
          // Trigger dynamic interactive congratulations splash screen and live confetti particle celebrate burst
          appInstance.showCongratsSplash(
            `MILESTONE CLAIMED: ${title}!`,
            `Congratulations! You have successfully achieved the referral threshold and unlocked the "${title}" milestone reward. The bonus cash has been added to your balance.`,
            `৳${reward.toFixed(2)}`
          );
          
          appInstance.render();
        }
      }
    });
  }

  static render(appInstance) {
    this.renderProgress(appInstance);
    this.renderCalculatorSection();
    this.renderMarketingTemplates(appInstance);
  }

  /**
   * Renders progress toward the next milestone level
   */
  static renderProgress(appInstance) {
    const progressContainer = document.getElementById("refer-milestone-progress-container");
    if (!progressContainer) return;

    const count = appInstance.currentUser.refersCount || 0;
    const levels = appInstance.db.settings.milestoneLevels || [];
    const sortedLevels = [...levels].sort((a, b) => a.count - b.count);

    let nextLvl = null;
    let prevLvlCount = 0;

    for (const lvl of sortedLevels) {
      if (count < lvl.count) {
        nextLvl = lvl;
        break;
      }
      prevLvlCount = lvl.count;
    }

    if (!nextLvl) {
      // Reached maximum milestone
      progressContainer.innerHTML = `
        <div class="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 p-4 rounded-2xl font-mono text-xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[9px] font-black text-emerald-400 uppercase tracking-wide">🏆 ULTIMATE ACHIEVER</span>
            <span class="text-[9px] text-emerald-500 font-bold">${count} refers</span>
          </div>
          <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
            <div class="bg-emerald-500 h-full rounded-full" style="width: 100%"></div>
          </div>
          <p class="text-[8px] text-slate-400 mt-2">Outstanding work! You have reached and cleared all the milestone awards set by the administration.</p>
        </div>
      `;
      return;
    }

    const goal = nextLvl.count;
    const needed = goal - count;
    const totalDiff = goal - prevLvlCount;
    const progressCount = count - prevLvlCount;
    const pct = Math.min(100, Math.max(0, (progressCount / totalDiff) * 100));

    progressContainer.innerHTML = `
      <div class="bg-slate-950/80 p-4 rounded-2xl border border-slate-900 font-mono text-xs">
        <div class="flex items-center justify-between mb-2">
          <div>
            <span class="block text-[8px] text-slate-500 uppercase font-black">Next Target Badge</span>
            <span class="text-white font-black text-[11px]">${appInstance.escapeHTML(nextLvl.title)}</span>
          </div>
          <div class="text-right">
            <span class="block text-[8px] text-slate-500 uppercase font-black">Progress</span>
            <span class="text-cyan-400 font-black text-xs font-mono">${count} / ${goal}</span>
          </div>
        </div>
        
        <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
          <div class="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>
        
        <p class="text-[8px] text-slate-400 mt-2 flex justify-between items-center">
          <span>🎯 Just <strong class="text-cyan-400">${needed}</strong> more referral${needed > 1 ? 's' : ''} to unlock <strong>৳${nextLvl.reward}</strong> cash bonus!</span>
          <span class="text-slate-500 font-mono text-[7px]">${pct.toFixed(0)}%</span>
        </p>
      </div>
    `;
  }

  /**
   * Renders the interactive commission estimator/calculator layout
   */
  static renderCalculatorSection() {
    const calcContainer = document.getElementById("refer-calculator-container");
    if (!calcContainer) return;

    calcContainer.innerHTML = `
      <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl font-mono text-xs">
        <h3 class="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
          <i class="fa-solid fa-calculator text-amber-500"></i> Interactive Commission Estimator
        </h3>
        
        <p class="text-[8px] text-slate-500 font-sans leading-relaxed">
          Estimate your potential automated passive income. When your referred friends register and buy lottery tickets, you receive commission rewards instantly!
        </p>

        <div class="space-y-4 pt-1">
          <!-- Friends Slider -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-slate-400 font-bold">Referred Friends:</span>
              <span id="calc-friends-val" class="text-cyan-400 font-black text-xs">25 Players</span>
            </div>
            <input type="range" id="calc-friends-count" min="1" max="250" value="25" class="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg border border-slate-800 appearance-none cursor-pointer">
          </div>

          <!-- Average ticket purchases per week slider -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-slate-400 font-bold">Tickets Per Friend / Week:</span>
              <span id="calc-tickets-val" class="text-cyan-400 font-black text-xs">5 Tickets</span>
            </div>
            <input type="range" id="calc-tickets-avg" min="1" max="30" value="5" class="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg border border-slate-800 appearance-none cursor-pointer">
          </div>

          <!-- Calculated Results block -->
          <div class="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-900 text-center">
            <div>
              <span class="block text-[7px] text-slate-500 font-bold uppercase">Daily Est.</span>
              <strong id="calc-res-daily" class="text-xs font-black text-emerald-400 block mt-0.5">৳17.85</strong>
            </div>
            <div>
              <span class="block text-[7px] text-slate-500 font-bold uppercase">Weekly Est.</span>
              <strong id="calc-res-weekly" class="text-xs font-black text-cyan-400 block mt-0.5">৳125.00</strong>
            </div>
            <div>
              <span class="block text-[7px] text-slate-500 font-bold uppercase">Monthly Est.</span>
              <strong id="calc-res-monthly" class="text-xs font-black text-indigo-400 block mt-0.5">৳535.70</strong>
            </div>
          </div>
          
          <div class="text-[7px] text-slate-600 text-center uppercase font-bold tracking-wide">
            * Estimates based on a baseline 2% system tickets rebate policy.
          </div>
        </div>
      </div>
    `;

    this.updateCalculator();
  }

  static updateCalculator() {
    const friendsInput = document.getElementById("calc-friends-count");
    const ticketsInput = document.getElementById("calc-tickets-avg");
    if (!friendsInput || !ticketsInput) return;

    const friendsCount = parseInt(friendsInput.value, 10);
    const ticketsCount = parseInt(ticketsInput.value, 10);

    // Update slider label labels
    document.getElementById("calc-friends-val").innerText = `${friendsCount} Player${friendsCount > 1 ? 's' : ''}`;
    document.getElementById("calc-tickets-val").innerText = `${ticketsCount} Ticket${ticketsCount > 1 ? 's' : ''}`;

    // Calculate payouts
    // A single ticket cost is typically 100 Taka (standard in this system)
    const TICKET_COST = 100;
    const REBATE_PCT = 0.02; // 2% commission per ticket purchase

    const weeklyVolume = friendsCount * ticketsCount * TICKET_COST;
    const weeklyComm = weeklyVolume * REBATE_PCT;
    const dailyComm = weeklyComm / 7;
    const monthlyComm = weeklyComm * 4.28; // ~30 days

    document.getElementById("calc-res-daily").innerText = `৳${dailyComm.toFixed(2)}`;
    document.getElementById("calc-res-weekly").innerText = `৳${weeklyComm.toFixed(2)}`;
    document.getElementById("calc-res-monthly").innerText = `৳${monthlyComm.toFixed(2)}`;
  }

  /**
   * Renders high-converting sharing templates with social direct buttons
   */
  static renderMarketingTemplates(appInstance) {
    const container = document.getElementById("refer-marketing-templates-container");
    if (!container) return;

    const username = appInstance.currentUser.username;
    const inviteUrl = window.location.origin + "/index.html?ref=" + encodeURIComponent(username);

    const templates = [
      {
        id: "promo_bangla",
        title: "🇧🇩 Bengali Promo Copy",
        text: `৳১,৫০০ প্রথম পুরস্কার! সম্পূর্ণ ফ্রিতে যোগ দিন এবং লটারি খেলে জিতুন। আমার ইনভাইট লিংক থেকে রেজিস্টার করলেই পাবেন বিশেষ বোনাস! \n\nরেজিস্ট্রেশন লিংক: ${inviteUrl}`
      },
      {
        id: "promo_eng",
        title: "🚀 English High-Yield Promo",
        text: `Bangladesh's premier automated draw lottery! Win huge cash prizes up to ৳2,000 daily. Fully secure, manual cashins and rapid bKash / Nagad payouts. Join now using my code: ${username}! \n\nSign up link: ${inviteUrl}`
      }
    ];

    let html = `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 font-mono text-xs">
        <h3 class="text-[10px] font-bold uppercase text-white tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
          <i class="fa-solid fa-bullhorn text-pink-500"></i> High-Converting Share Templates
        </h3>
        
        <p class="text-[8px] text-slate-500 font-sans">
          Tap any of the templates to quickly copy the text or immediately launch and share on social media channels!
        </p>

        <div class="space-y-3 pt-1">
    `;

    templates.forEach(t => {
      html += `
        <div class="bg-slate-950 p-3 rounded-2xl border border-slate-900 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[9px] font-black text-cyan-400 uppercase tracking-wide">${t.title}</span>
            <button class="text-[8px] text-slate-500 hover:text-cyan-400 font-bold uppercase transition flex items-center gap-1 cursor-pointer" onclick="navigator.clipboard.writeText(\`${t.text.replace(/`/g, '\\`').replace(/\n/g, '\\n')}\`); app.showToast('Promo template copied to clipboard!', 'success');">
              <i class="fa-solid fa-copy"></i> Copy Text
            </button>
          </div>
          <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-950 text-[9px] text-slate-400 line-clamp-3 select-all leading-relaxed whitespace-pre-line">
            ${appInstance.escapeHTML(t.text)}
          </div>
          
          <!-- Social triggers row -->
          <div class="flex gap-2 pt-1 text-[8px] font-black uppercase tracking-wide">
            <button data-share-platform="telegram" data-template-id="${t.id}" class="flex-1 bg-slate-900 border border-sky-950 text-sky-400 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-sky-950/20 transition cursor-pointer">
              <i class="fa-brands fa-telegram text-[11px]"></i> Telegram
            </button>
            <button data-share-platform="whatsapp" data-template-id="${t.id}" class="flex-1 bg-slate-900 border border-emerald-950 text-emerald-400 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-950/20 transition cursor-pointer">
              <i class="fa-brands fa-whatsapp text-[11px]"></i> WhatsApp
            </button>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  static shareTemplate(appInstance, platform, templateId) {
    const username = appInstance.currentUser.username;
    const inviteUrl = window.location.origin + "/index.html?ref=" + encodeURIComponent(username);
    
    let text = "";
    if (templateId === "promo_bangla") {
      text = `৳১,৫০০ প্রথম পুরস্কার! সম্পূর্ণ ফ্রিতে যোগ দিন এবং লটারি খেলে জিতুন। আমার ইনভাইট লিংক থেকে রেজিস্টার করলেই পাবেন বিশেষ বোনাস! \n\nরেজিস্ট্রেশন লিংক: ${inviteUrl}`;
    } else {
      text = `Bangladesh's premier automated draw lottery! Win huge cash prizes up to ৳2,000 daily. Fully secure, manual cashins and rapid bKash / Nagad payouts. Join now using my code: ${username}! \n\nSign up link: ${inviteUrl}`;
    }

    const encodedText = encodeURIComponent(text);
    let shareUrl = "";

    if (platform === "telegram") {
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodedText}`;
    } else if (platform === "whatsapp") {
      shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  }
}
