/**
 * Lottery Winner - User Profile & Identity Module (profile.js)
 * 
 * Manages photo synchronization with Google Photos, profile modifications,
 * and inbox notifications. Includes player leveling/XP gamification, daily claims,
 * lucky prediction index generator, vibe updates, and cashout PIN security setup.
 */

export class ProfileTab {
  static init(appInstance) {
    console.log("Profile Tab Module initialized successfully.");

    // Event delegation on document to avoid duplicates or missing elements when template re-loads
    document.addEventListener("click", (e) => {
      if (!appInstance.currentUser) return;

      // 1. Toggle Vibe Editor
      if (e.target.closest("#profile-edit-vibe-btn")) {
        const panel = document.getElementById("profile-vibe-editor-panel");
        if (panel) {
          panel.classList.toggle("hidden");
        }
        return;
      }

      // 2. Click Vibe Preset
      const presetBtn = e.target.closest(".com-vibe-preset");
      if (presetBtn) {
        const vibe = presetBtn.getAttribute("data-vibe");
        const input = document.getElementById("profile-custom-vibe-input");
        if (input) {
          input.value = vibe;
        }
        return;
      }

      // 3. Save Vibe Status
      if (e.target.closest("#profile-save-vibe-btn")) {
        const input = document.getElementById("profile-custom-vibe-input");
        if (input) {
          const val = input.value.trim() || "🍀 Feeling Lucky";
          appInstance.currentUser.vibe = val;
          appInstance.saveDB();
          
          const statusEl = document.getElementById("profile-vibe-status");
          if (statusEl) {
            statusEl.innerText = `"${val}"`;
          }

          const panel = document.getElementById("profile-vibe-editor-panel");
          if (panel) panel.classList.add("hidden");

          appInstance.showToast("Your status vibe has been synchronized!", "success");
        }
        return;
      }

      // 4. Daily Claim Bonus
      if (e.target.closest("#profile-claim-daily-btn")) {
        const user = appInstance.currentUser;
        const now = Date.now();
        const lastClaim = user.lastDailyClaim ? new Date(user.lastDailyClaim).getTime() : 0;
        const diff = now - lastClaim;
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours

        if (diff < cooldown) {
          const remaining = cooldown - diff;
          const hrs = Math.floor(remaining / (3600 * 1000));
          const mins = Math.floor((remaining % (3600 * 1000)) / (60 * 1000));
          appInstance.showToast(`Daily claim already collected! Try again in ${hrs}h ${mins}m.`, "warning");
          return;
        }

        // Generate random reward amount: ৳5 to ৳15
        const reward = Math.floor(Math.random() * 11) + 5;
        user.balance = (user.balance || 0) + reward;
        user.lastDailyClaim = new Date().toISOString();

        // Grant Experience points! E.g. 25 XP
        const xpGained = 25;
        user.xp = (user.xp || 0) + xpGained;
        
        appInstance.saveDB();
        appInstance.showToast(`৳${reward} credited to your wallet & +${xpGained} XP gained!`, "success");

        // Check level up inside standard checker helper
        this.checkLevelUp(appInstance);

        // Re-render ProfileTab & outer header balances
        this.render(appInstance);
        appInstance.render(); // This updates dashboard header values if any
        return;
      }

      // 5. Daily Lucky Number Generator
      if (e.target.closest("#profile-lucky-num-btn")) {
        const user = appInstance.currentUser;
        const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        if (user.lastLuckyPredictDate === todayStr) {
          appInstance.showToast(`You have already generated today's lucky number: ${user.luckyNumber || 7}`, "info");
          return;
        }

        const luckyVal = Math.floor(Math.random() * 100); // 0-99
        user.lastLuckyPredictDate = todayStr;
        user.luckyNumber = luckyVal;

        // Grant small XP boost (10 XP) for activity!
        user.xp = (user.xp || 0) + 10;
        appInstance.saveDB();

        this.checkLevelUp(appInstance);
        this.render(appInstance);
        appInstance.showToast(`Lucky number generated: ${luckyVal}! +10 XP gained.`, "success");
        return;
      }

      // 6. Toggle Security PIN setup panel
      if (e.target.closest("#profile-toggle-pin-setup")) {
        const panel = document.getElementById("profile-pin-setup-panel");
        if (panel) {
          panel.classList.toggle("hidden");
        }
        return;
      }

      // 7. Save Security PIN
      if (e.target.closest("#profile-save-pin-btn")) {
        const pin1 = document.getElementById("profile-new-pin")?.value;
        const pin2 = document.getElementById("profile-confirm-pin")?.value;

        if (!pin1 || pin1.length !== 4 || isNaN(parseInt(pin1))) {
          appInstance.showToast("Please enter a valid 4-digit numeric PIN code!", "error");
          return;
        }
        if (pin1 !== pin2) {
          appInstance.showToast("Confirm PIN does not match original PIN code!", "error");
          return;
        }

        appInstance.currentUser.securityPin = pin1;

        // Grant 20 XP for setting up security PIN first time!
        if (!(appInstance.currentUser.pinSetupBonusClaimed)) {
          appInstance.currentUser.xp = (appInstance.currentUser.xp || 0) + 20;
          appInstance.currentUser.pinSetupBonusClaimed = true;
          appInstance.showToast("Security PIN successfully set! +20 XP security setup bonus awarded.", "success");
        } else {
          appInstance.showToast("Security PIN updated successfully!", "success");
        }

        appInstance.saveDB();

        const panel = document.getElementById("profile-pin-setup-panel");
        if (panel) panel.classList.add("hidden");

        // Clear input fields
        const newPinEl = document.getElementById("profile-new-pin");
        if (newPinEl) newPinEl.value = "";
        const confirmPinEl = document.getElementById("profile-confirm-pin");
        if (confirmPinEl) confirmPinEl.value = "";

        this.checkLevelUp(appInstance);
        this.render(appInstance);
        return;
      }
    });

    // Setup an interval to update countdown timer smoothly if on profile tab
    setInterval(() => {
      const claimStatusEl = document.getElementById("profile-daily-claim-status");
      if (claimStatusEl && appInstance.currentTab === "profile" && appInstance.currentUser) {
        this.updateClaimCountdown(appInstance);
      }
    }, 1000);
  }

  static checkLevelUp(appInstance) {
    const user = appInstance.currentUser;
    if (!user) return;

    let level = user.level || 1;
    let xp = user.xp || 0;
    let leveledUp = false;

    while (true) {
      let needed = level * 100;
      if (xp >= needed) {
        xp -= needed;
        level += 1;
        leveledUp = true;
      } else {
        break;
      }
    }

    user.level = level;
    user.xp = xp;

    if (leveledUp) {
      // Reward Level Up: ৳25 per level reward!
      const reward = level * 25; 
      user.balance = (user.balance || 0) + reward;
      
      // Send inbox message to user welcoming them to new level!
      if (!appInstance.db.messages) appInstance.db.messages = [];
      appInstance.db.messages.push({
        id: "msg_lvl_" + Date.now(),
        recipient: user.username,
        sender: "Administration",
        subject: `🎉 Level Up Congratulations (Level ${level})!`,
        body: `Congratulations @${user.username}! You have leveled up to Level ${level}! As a royal player reward, we have credited a ৳${reward} bonus directly to your wallet account. Keep playing and winning!`,
        date: new Date().toISOString(),
        status: "unread"
      });

      appInstance.saveDB();
      appInstance.showToast(`🎉 LEVEL UP! You reached Level ${level} & won ৳${reward} bonus!`, "success");
    }
  }

  static getLuckyMessage(luckyNumber) {
    if (luckyNumber === 7 || luckyNumber === 77) {
      return "👑 Double jackpot vibe! Buy premium ticket now.";
    }
    if (luckyNumber < 20) {
      return "🍀 Highly spiritual today. Great luck at Fast Cash draws!";
    }
    if (luckyNumber >= 20 && luckyNumber < 50) {
      return "🔥 Power-up active. Try the 20-Taka Premium Super Pool!";
    }
    if (luckyNumber >= 50 && luckyNumber < 80) {
      return "🎯 Precision jackpot hunting mode is recommended today.";
    }
    return "⚡ Pure raw fast energy. Perfect time to generate some codes!";
  }

  static updateClaimCountdown(appInstance) {
    const user = appInstance.currentUser;
    const claimStatusEl = document.getElementById("profile-daily-claim-status");
    const claimBtn = document.getElementById("profile-claim-daily-btn");
    if (!claimStatusEl || !user) return;

    const lastClaim = user.lastDailyClaim ? new Date(user.lastDailyClaim).getTime() : 0;
    const now = Date.now();
    const diff = now - lastClaim;
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours

    if (diff < cooldown) {
      const remaining = cooldown - diff;
      const hrs = Math.floor(remaining / (3600 * 1000));
      const mins = Math.floor((remaining % (3600 * 1000)) / (60 * 1000));
      const secs = Math.floor((remaining % (60 * 1000)) / 1000);

      claimStatusEl.innerHTML = `<span class="text-rose-500 font-mono"><i class="fa-solid fa-hourglass-half"></i> Claim lock: ${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s remaining</span>`;
      if (claimBtn) {
        claimBtn.innerText = "Claimed Today";
        claimBtn.disabled = true;
        claimBtn.classList.remove("from-emerald-600", "to-teal-600");
        claimBtn.classList.add("from-slate-800", "to-slate-900", "text-slate-500", "cursor-not-allowed");
      }
    } else {
      claimStatusEl.innerHTML = `<span class="text-emerald-400 font-mono"><i class="fa-solid fa-circle-check"></i> Reward is ready for collection!</span>`;
      if (claimBtn) {
        claimBtn.innerHTML = `<i class="fa-solid fa-circle-dollar-to-slot"></i> Claim Now`;
        claimBtn.disabled = false;
        claimBtn.classList.remove("from-slate-800", "to-slate-900", "text-slate-500", "cursor-not-allowed");
        claimBtn.classList.add("from-emerald-600", "to-teal-600");
      }
    }
  }

  static render(appInstance) {
    // Sync unread messages indicators
    window.chatProfileHelper?.updateNotificationBadgeOff();

    // Dynamically calculate live statistics from database
    const winCounts = (appInstance.db.tickets || []).filter(t => t.userId === appInstance.currentUser.id && t.status === "won").length + (appInstance.currentUser.wins || 0);
    
    const winsEl = document.getElementById("profile-wins");
    if (winsEl) winsEl.innerText = winCounts;
    const lossEl = document.getElementById("profile-loss");
    if (lossEl) lossEl.innerText = appInstance.currentUser.loss || 0;
    const profitEl = document.getElementById("profile-profit");
    if (profitEl) profitEl.innerText = (appInstance.currentUser.profit || 0).toFixed(2);
    const joinDateEl = document.getElementById("profile-join-date");
    if (joinDateEl) joinDateEl.innerText = appInstance.currentUser.joinDate || "N/A";

    // Gamification properties defaults
    const user = appInstance.currentUser;
    if (user) {
      if (user.level === undefined) user.level = 1;
      if (user.xp === undefined) user.xp = 0;
      if (user.vibe === undefined) user.vibe = "🍀 Feeling Lucky";
    }

    // 1. Level & XP UI render
    const levelNumEl = document.getElementById("profile-level-num");
    if (levelNumEl) levelNumEl.innerText = user.level || 1;

    const xpCurrEl = document.getElementById("profile-xp-curr");
    if (xpCurrEl) xpCurrEl.innerText = user.xp || 0;

    const neededXp = (user.level || 1) * 100;
    const xpNeededEl = document.getElementById("profile-xp-needed");
    if (xpNeededEl) xpNeededEl.innerText = neededXp;

    const xpBarEl = document.getElementById("profile-xp-bar");
    if (xpBarEl) {
      const percentage = Math.min(100, Math.max(0, ((user.xp || 0) / neededXp) * 100));
      xpBarEl.style.width = `${percentage}%`;
    }

    // 2. Vibe status rendering
    const vibeStatusEl = document.getElementById("profile-vibe-status");
    if (vibeStatusEl) {
      vibeStatusEl.innerText = `"${user.vibe || "🍀 Feeling Lucky"}"`;
    }

    const vibeInputEl = document.getElementById("profile-custom-vibe-input");
    if (vibeInputEl) {
      vibeInputEl.value = user.vibe || "";
    }

    // 3. Daily Claim status countdown refresh
    this.updateClaimCountdown(appInstance);

    // 4. Lucky prediction number of the day rendering
    const luckyResultEl = document.getElementById("profile-lucky-num-result");
    const luckyBtn = document.getElementById("profile-lucky-num-btn");
    const todayStr = new Date().toISOString().split("T")[0];

    if (luckyResultEl) {
      if (user.lastLuckyPredictDate === todayStr) {
        luckyResultEl.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="text-xs bg-rose-950 text-rose-400 border border-rose-900 px-2.5 py-1 rounded-lg font-black">${user.luckyNumber}</span>
            <span class="text-[9px] text-slate-400">
              ${this.getLuckyMessage(user.luckyNumber)}
            </span>
          </div>
        `;
        luckyResultEl.classList.remove("hidden");
        if (luckyBtn) {
          luckyBtn.innerText = "Generated";
          luckyBtn.disabled = true;
          luckyBtn.className = "w-full sm:w-auto bg-slate-900 border border-slate-800 text-slate-500 font-bold py-2.5 px-4 rounded-xl cursor-not-allowed text-[10px] flex items-center justify-center gap-1.5 whitespace-nowrap";
        }
      } else {
        luckyResultEl.classList.add("hidden");
        if (luckyBtn) {
          luckyBtn.innerHTML = `<i class="fa-solid fa-dice"></i> Predict Luck`;
          luckyBtn.disabled = false;
          luckyBtn.className = "w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-rose-400 font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-[10px] flex items-center justify-center gap-1.5 whitespace-nowrap";
        }
      }
    }

    // 5. Security PIN Badge setup rendering
    const pinBadgeEl = document.getElementById("profile-security-pin-badge");
    const togglePinBtn = document.getElementById("profile-toggle-pin-setup");
    if (pinBadgeEl) {
      if (user.securityPin) {
        pinBadgeEl.innerText = "🛡️ SECURED PIN ACTIVE";
        pinBadgeEl.className = "px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-955 text-emerald-400 border border-emerald-900/40";
        if (togglePinBtn) togglePinBtn.innerHTML = `<i class="fa-solid fa-rotate"></i> Change PIN`;
      } else {
        pinBadgeEl.innerText = "⚠️ PIN SECURITY NOT SET";
        pinBadgeEl.className = "px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-955 text-amber-500 border border-amber-900/40 animate-pulse";
        if (togglePinBtn) togglePinBtn.innerHTML = `<i class="fa-solid fa-key"></i> Setup PIN`;
      }
    }

    // Inject Dynamic Badge Badging Rack
    const badgeContainer = document.getElementById("profile-unlocked-badges");
    if (badgeContainer) {
      badgeContainer.innerHTML = "";
      
      const authorUser = appInstance.currentUser;
      const postsCount = (appInstance.db.communityPosts || []).filter(p => (p.userId === authorUser.id || p.username === authorUser.username) && p.status !== "banned").length;
      const commentsCount = (appInstance.db.communityComments || []).filter(c => (c.userId === authorUser.id || c.username === authorUser.username) && c.status !== "banned").length;
      const totalContribution = postsCount + commentsCount;

      const isLuckyWinner = winCounts > 0;
      const isTopContributor = totalContribution >= 3;

      let badgesHtml = "";
      
      // Admin custom badge override mapping
      if (authorUser.customBadge) {
        const badgeMap = {
          vip: { label: "💎 VIP Player", style: "bg-cyan-955/70 text-cyan-400 border-cyan-800/60" },
          moderator: { label: "🛡️ Staff Mod", style: "bg-indigo-955/70 text-indigo-400 border-indigo-800/60" },
          star: { label: "⭐ Elite Star", style: "bg-purple-955/70 text-purple-400 border-purple-800/60" },
          premium: { label: "✨ Premium Member", style: "bg-fuchsia-955/70 text-fuchsia-400 border-fuchsia-800/60" },
          pro: { label: "🔥 Pro Active", style: "bg-orange-955/70 text-orange-400 border-orange-800/60" },
          legend: { label: "👑 Royal Legend", style: "bg-rose-955/70 text-rose-400 border-rose-800/60" }
        };
        const conf = badgeMap[authorUser.customBadge];
        if (conf) {
          badgesHtml += `<span class="${conf.style} px-2 py-0.5 rounded-lg text-[9px] font-bold border flex items-center gap-1 shadow-md">${conf.label}</span>`;
        }
      }

      if (isLuckyWinner) {
        badgesHtml += `<span class="bg-amber-955/70 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-md animate-pulse" title="Unlocked by winning active lotteries"><i class="fa-solid fa-trophy text-amber-500 text-[8px]"></i> Lucky Winner (${winCounts})</span>`;
      }
      if (isTopContributor) {
        badgesHtml += `<span class="bg-emerald-955/70 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-md" title="Unlocked with 3+ shares/replies"><i class="fa-solid fa-medal text-emerald-400 text-[8px]"></i> Top Contributor (${totalContribution})</span>`;
      }
      
      // Default baseline standard badge
      badgesHtml += `<span class="bg-slate-955 border border-slate-800/80 text-slate-400 px-2 py-0.5 rounded-lg text-[9px] font-mono">🎖️ Active Player</span>`;
      
      badgeContainer.innerHTML = badgesHtml;
    }

    // Populate user details fields
    const emailEl = document.getElementById("profile-edit-email");
    if (emailEl) emailEl.value = appInstance.currentUser.email || "";
    const phoneEl = document.getElementById("profile-edit-phone");
    if (phoneEl) phoneEl.value = appInstance.currentUser.phone || "";
    const dobEl = document.getElementById("profile-edit-dob");
    if (dobEl) dobEl.value = appInstance.currentUser.dob || "";

    // Sync Avatar Image display
    const avatarImg = document.getElementById("profile-avatar-img");
    const avatarFallback = document.getElementById("profile-avatar-fallback");
    if (avatarImg && avatarFallback) {
      if (appInstance.currentUser.photo) {
        avatarImg.src = appInstance.currentUser.photo;
        avatarImg.classList.remove("hidden");
        avatarFallback.classList.add("hidden");
      } else {
        avatarImg.src = "";
        avatarImg.classList.add("hidden");
        avatarFallback.classList.remove("hidden");
      }
    }
    appInstance.renderProfileChart();
    appInstance.renderUserInbox();
  }
}

