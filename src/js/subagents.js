// ============================================================================
// SUB-AGENT NETWORK MANAGEMENT & PERFORMANCE TRACKING MODULAR SYSTEM
// ============================================================================

export const SubAgentModule = {
  renderSubAgentTab() {
    if (!this.currentUser || (this.currentUser.role !== "agent" && this.currentUser.role !== "subagent")) return;

    const myRatePct = (this.currentUser.commissionRate !== undefined) ? parseFloat(this.currentUser.commissionRate) : 5.0;
    
    // Update labels for agent rate limits in the UI
    document.querySelectorAll(".agent-my-comm-rate-lbl").forEach(el => {
      el.innerText = myRatePct.toFixed(1);
    });

    const subagentsTbody = document.getElementById("agent-subagents-tbody");
    if (!subagentsTbody) return;

    // Filter subagents under current user
    let subAgents = this.db.users.filter(u => 
      u.role === "subagent" && 
      u.referredBy && 
      u.referredBy.toLowerCase() === this.currentUser.username.toLowerCase()
    );

    // Update Stats Card Counts
    const subCountEl = document.getElementById("agent-substats-count");
    if (subCountEl) {
      subCountEl.innerText = `${subAgents.length} Operator${subAgents.length !== 1 ? 's' : ''}`;
    }

    // Pre-calculate volumes/earnings for ALL sub-agents so we can compute overall stats & support sorting
    const lotteries = this.db.lotteries || [];
    const lotteryFees = {};
    lotteries.forEach(l => {
      lotteryFees[l.id] = parseFloat(l.entryFee || 100);
    });

    const tickets = this.db.tickets || [];
    
    // Pre-calculate and decorate the sub-agents list with dynamic statistics
    let overallVolume = 0;
    let overallSubEarnings = 0;
    let overallOverride = 0;

    const decoratedSubs = subAgents.map(sub => {
      // Find referred players by this sub-agent
      const referredPlayers = this.db.users.filter(u => u.referredBy && u.referredBy.toLowerCase() === sub.username.toLowerCase());
      const playerIds = new Set(referredPlayers.map(p => p.id));

      // Calculate tickets sales referred/booked by this sub-agent
      let volume = 0;
      tickets.forEach(t => {
        if (playerIds.has(t.userId)) {
          const fee = lotteryFees[t.lotteryId] || 100;
          volume += fee;
        }
      });

      const subRate = (sub.commissionRate !== undefined) ? parseFloat(sub.commissionRate) : 3.0;
      const subEarned = volume * (subRate / 100);
      const overrideRate = Math.max(0, myRatePct - subRate);
      const overrideEarned = volume * (overrideRate / 100);

      overallVolume += volume;
      overallSubEarnings += subEarned;
      overallOverride += overrideEarned;

      return {
        ...sub,
        volume,
        subRate,
        subEarned,
        overrideRate,
        overrideEarned
      };
    });

    // Update global overall stats cards
    const substatsVolEl = document.getElementById("agent-substats-volume");
    if (substatsVolEl) substatsVolEl.innerText = `৳${overallVolume.toFixed(2)}`;

    const substatsEarnEl = document.getElementById("agent-substats-earnings");
    if (substatsEarnEl) substatsEarnEl.innerText = `৳${overallSubEarnings.toFixed(2)}`;

    const substatsOverEl = document.getElementById("agent-substats-override");
    if (substatsOverEl) substatsOverEl.innerText = `৳${overallOverride.toFixed(2)}`;

    // Read Search/Filter Values from DOM
    const searchVal = (document.getElementById("agent-subagents-search")?.value || "").trim().toLowerCase();
    const statusVal = document.getElementById("agent-subagents-filter-status")?.value || "all";
    const sortVal = document.getElementById("agent-subagents-sort")?.value || "name_asc";

    // Apply Search Filter
    let filteredSubs = decoratedSubs;
    if (searchVal) {
      filteredSubs = filteredSubs.filter(sub => 
        sub.username.toLowerCase().includes(searchVal) ||
        (sub.email || "").toLowerCase().includes(searchVal) ||
        (sub.phone || "").includes(searchVal)
      );
    }

    // Apply Status Filter
    if (statusVal !== "all") {
      filteredSubs = filteredSubs.filter(sub => {
        const isActive = (sub.status === "active");
        return statusVal === "active" ? isActive : !isActive;
      });
    }

    // Apply Sorting
    filteredSubs.sort((a, b) => {
      switch (sortVal) {
        case "name_asc":
          return a.username.localeCompare(b.username);
        case "name_desc":
          return b.username.localeCompare(a.username);
        case "volume_desc":
          return b.volume - a.volume;
        case "earnings_desc":
          return b.subEarned - a.subEarned;
        case "override_desc":
          return b.overrideEarned - a.overrideEarned;
        case "rate_desc":
          return b.subRate - a.subRate;
        default:
          return 0;
      }
    });

    // Render Table Rows
    subagentsTbody.innerHTML = "";
    if (filteredSubs.length === 0) {
      subagentsTbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-4 text-center text-slate-500 font-sans text-[11px]">
            No matching sub-agents found.
          </td>
        </tr>
      `;
    } else {
      filteredSubs.forEach(sub => {
        const row = document.createElement("tr");
        row.className = "border-b border-slate-800/30 hover:bg-slate-900/20 transition text-xs";
        row.innerHTML = `
          <td class="p-3">
            <div class="font-bold text-white flex items-center gap-1.5">
              <span class="cursor-pointer hover:underline hover:text-indigo-400 agent-sub-view-link font-sans" data-id="${sub.id}">@${sub.username}</span>
              ${sub.status !== 'active' ? `<span class="bg-rose-950 text-rose-450 border border-rose-900/30 text-[7px] font-black uppercase px-1 py-0.5 rounded">Suspended</span>` : ''}
            </div>
            <div class="text-[9.5px] text-slate-500 font-mono">${sub.email || "N/A"} • ${sub.phone || "N/A"}</div>
          </td>
          <td class="p-3 font-mono">
            <div class="flex items-center gap-1.5">
              <span class="text-indigo-400 font-bold">${sub.subRate.toFixed(1)}%</span>
              <button class="agent-change-sub-rate-btn text-[8px] bg-slate-850 hover:bg-slate-800 px-1 py-0.5 rounded border border-slate-750 text-slate-300 font-sans cursor-pointer" data-id="${sub.id}" data-username="${sub.username}" data-rate="${sub.subRate}">Edit</button>
            </div>
          </td>
          <td class="p-3 font-mono text-cyan-400 font-bold">৳${sub.volume.toFixed(2)}</td>
          <td class="p-3 font-mono text-amber-400 font-sans">৳${sub.subEarned.toFixed(2)}</td>
          <td class="p-3 font-mono text-emerald-400 font-black">৳${sub.overrideEarned.toFixed(2)} <span class="text-[8px] text-slate-550">(${sub.overrideRate.toFixed(1)}% diff)</span></td>
          <td class="p-3 text-right space-x-1 whitespace-nowrap">
            <button class="agent-sub-view-btn text-[9px] bg-indigo-950/80 hover:bg-indigo-900 text-indigo-450 border border-indigo-900/40 py-1 px-2 rounded-lg font-bold font-sans cursor-pointer" data-id="${sub.id}">
              Overview
            </button>
            <button class="agent-sub-toggle-btn text-[9px] py-1 px-2 rounded-lg border font-bold font-sans cursor-pointer ${sub.status === 'active' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/40' : 'bg-rose-950/40 text-rose-400 border-rose-900/30 hover:bg-rose-900/40'}" data-id="${sub.id}">
              ${sub.status === 'active' ? 'Suspend' : 'Activate'}
            </button>
            <button class="agent-sub-demote-btn text-[9px] bg-slate-950 hover:bg-slate-900 text-rose-450 border border-slate-800 py-1 px-2 rounded-lg font-bold font-sans cursor-pointer" data-id="${sub.id}" data-username="${sub.username}">
              Demote
            </button>
            <button class="agent-sub-cash-btn text-[9px] bg-indigo-950 hover:bg-indigo-900 text-indigo-400 border border-indigo-900/40 py-1 px-2 rounded-lg font-bold font-sans cursor-pointer" data-username="${sub.username}">
              Cash Load
            </button>
          </td>
        `;
        subagentsTbody.appendChild(row);
      });
    }

    // Bind Dynamic Action Button Listeners in Table Rows
    this.bindSubAgentTableActions(subagentsTbody, myRatePct);

    // Dynamic Back buttons list for details overview
    this.setupSubAgentDetailBackListener();

    // Populate Promote player dropdown
    const promoteSelect = document.getElementById("agent-promote-select-player");
    if (promoteSelect) {
      promoteSelect.innerHTML = "";
      const directL1Players = this.db.users.filter(u => 
        u.role === "user" && 
        u.referredBy && 
        u.referredBy.toLowerCase() === this.currentUser.username.toLowerCase()
      );
      if (directL1Players.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.innerText = "No direct referred players available";
        promoteSelect.appendChild(opt);
      } else {
        directL1Players.forEach(p => {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.innerText = `@${p.username} (${p.phone || 'No Phone'})`;
          promoteSelect.appendChild(opt);
        });
      }
    }
  },

  bindSubAgentTableActions(tbody, myRatePct) {
    const app = this;

    tbody.querySelectorAll(".agent-change-sub-rate-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const subId = btn.getAttribute("data-id");
        const matchedSub = app.db.users.find(u => u.id === subId);
        if (matchedSub) {
          const idField = document.getElementById("edit-subagent-id-field");
          const usernameLbl = document.getElementById("edit-subagent-modal-username");
          const emailInput = document.getElementById("edit-subagent-email");
          const phoneInput = document.getElementById("edit-subagent-phone");
          const passInput = document.getElementById("edit-subagent-password");
          const rateInput = document.getElementById("edit-subagent-rate");
          const statusSelect = document.getElementById("edit-subagent-status");
          const targetTicketsInput = document.getElementById("edit-subagent-target-tickets");
          const targetRewardInput = document.getElementById("edit-subagent-target-reward");

          if (idField) idField.value = matchedSub.id;
          if (usernameLbl) usernameLbl.innerText = `@${matchedSub.username}`;
          if (emailInput) emailInput.value = matchedSub.email || "";
          if (phoneInput) phoneInput.value = matchedSub.phone || "";
          if (passInput) passInput.value = ""; // leave blank initially
          if (rateInput) {
            rateInput.value = matchedSub.commissionRate || 3.0;
            rateInput.setAttribute("max", (myRatePct - 0.1).toFixed(1));
          }
          if (statusSelect) statusSelect.value = matchedSub.status === "active" ? "active" : "suspended";
           if (targetTicketsInput) {
            targetTicketsInput.value = matchedSub.monthlyTargetTickets !== undefined ? matchedSub.monthlyTargetTickets : 0;
          }
          if (targetRewardInput) {
            targetRewardInput.value = matchedSub.monthlyTargetReward !== undefined ? matchedSub.monthlyTargetReward : 0;
          }

          const targetLotterySelect = document.getElementById("edit-subagent-target-lottery");
          if (targetLotterySelect) {
            targetLotterySelect.innerHTML = '<option value="any">Any Active Pool</option>';
            const activeLotts = (app.db.lotteries || []).filter(l => l.status === "active");
            activeLotts.forEach(lot => {
              const opt = document.createElement("option");
              opt.value = lot.id;
              opt.innerText = `${lot.name} (৳${lot.entryFee})`;
              targetLotterySelect.appendChild(opt);
            });
            targetLotterySelect.value = matchedSub.monthlyTargetLotteryId || "any";
          }

          const modal = document.getElementById("agent-subagent-edit-modal");
          if (modal) modal.classList.remove("hidden");
        }
      });
    });

    tbody.querySelectorAll(".agent-sub-toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const subId = btn.getAttribute("data-id");
        const matchedSub = app.db.users.find(u => u.id === subId);
        if (matchedSub) {
          matchedSub.status = matchedSub.status === "active" ? "suspended" : "active";
          app.db.users.forEach(u => {
            if (u.id === subId) {
              u.status = matchedSub.status;
            }
          });
          app.saveDB();
          app.showToast(`Sub-agent @${matchedSub.username} status toggled to ${matchedSub.status.toUpperCase()}!`, "info");
          app.renderAgentWorkspace();
        }
      });
    });

    tbody.querySelectorAll(".agent-sub-demote-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const subId = btn.getAttribute("data-id");
        const username = btn.getAttribute("data-username");
        if (confirm(`Are you sure you want to demote sub-agent @${username} back to a standard player? They will no longer earn sales commission.`)) {
          const matchedSub = app.db.users.find(u => u.id === subId);
          if (matchedSub) {
            matchedSub.role = "user";
            app.db.users.forEach(u => {
              if (u.id === subId) {
                u.role = "user";
              }
            });
            app.saveDB();
            app.showToast(`Demoted sub-agent @${username} back to standard player user!`, "success");
            app.renderAgentWorkspace();
          }
        }
      });
    });

    tbody.querySelectorAll(".agent-sub-cash-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const subUser = btn.getAttribute("data-username");
        const matchedSub = app.db.users.find(u => u.username.toLowerCase() === subUser.toLowerCase());
        if (matchedSub) {
          const idField = document.getElementById("cash-subagent-id-field");
          const usernameLbl = document.getElementById("cash-subagent-modal-username");
          const balanceLbl = document.getElementById("cash-subagent-modal-balance");
          const amountInput = document.getElementById("cash-subagent-amount");

          if (idField) idField.value = matchedSub.id;
          if (usernameLbl) usernameLbl.innerText = `@${matchedSub.username}`;
          if (balanceLbl) balanceLbl.innerText = `৳${(matchedSub.balance || 0).toFixed(2)}`;
          if (amountInput) amountInput.value = "";

          const modal = document.getElementById("agent-subagent-cash-modal");
          if (modal) modal.classList.remove("hidden");
        }
      });
    });

    tbody.querySelectorAll(".agent-sub-view-btn, .agent-sub-view-link").forEach(el => {
      el.addEventListener("click", () => {
        const subId = el.getAttribute("data-id");
        app.showSubAgentDetailOverview(subId);
      });
    });
  },

  setupSubAgentSearchFilterAndSortListeners() {
    const app = this;

    const searchInput = document.getElementById("agent-subagents-search");
    const statusFilter = document.getElementById("agent-subagents-filter-status");
    const sortFilter = document.getElementById("agent-subagents-sort");

    if (searchInput) {
      // Input event listener for search input
      searchInput.addEventListener("input", () => {
        app.renderSubAgentTab();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener("change", () => {
        app.renderSubAgentTab();
      });
    }

    if (sortFilter) {
      sortFilter.addEventListener("change", () => {
        app.renderSubAgentTab();
      });
    }
  },

  setupSubAgentFormsAndListeners() {
    const app = this;

    // Sub-Agent: Promote Existing referred player
    const promoteForm = document.getElementById("agent-promote-subagent-form");
    if (promoteForm) {
      const newPromoteForm = promoteForm.cloneNode(true);
      promoteForm.parentNode.replaceChild(newPromoteForm, promoteForm);

      newPromoteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const playerId = newPromoteForm.querySelector("#agent-promote-select-player").value;
        const rateValStr = newPromoteForm.querySelector("#agent-promote-comm-rate").value;
        
        if (!playerId) {
          app.showToast("Please select a player to promote!", "error");
          return;
        }

        const myRatePct = (app.currentUser.commissionRate !== undefined) ? parseFloat(app.currentUser.commissionRate) : 5.0;
        const rateVal = parseFloat(rateValStr);
        if (isNaN(rateVal) || rateVal < 0.5 || rateVal >= myRatePct) {
          app.showToast(`Invalid Commission Rate! Must be between 0.5% and less than your total rate (${myRatePct.toFixed(1)}%).`, "error");
          return;
        }

        const targetUser = app.db.users.find(u => u.id === playerId);
        if (!targetUser) {
          app.showToast("Selected player not found in database!", "error");
          return;
        }

        targetUser.role = "subagent";
        targetUser.commissionRate = rateVal;
        
        // Log in agent ledger
        if (!app.db.agentLedger) app.db.agentLedger = [];
        app.db.agentLedger.push({
          id: "act_" + Date.now(),
          agentId: app.currentUser.id,
          timestamp: new Date().toISOString(),
          targetUser: targetUser.username,
          description: `Promoted player @${targetUser.username} to Sub-Agent with ${rateVal.toFixed(1)}% split`,
          amount: 0,
          commission: 0
        });

        app.saveDB();
        app.showToast(`Successfully promoted player @${targetUser.username} to Sub-Agent at ${rateVal.toFixed(1)}% rate split!`, "success");
        newPromoteForm.reset();
        app.renderAgentWorkspace();
      });
    }

    // Sub-Agent: Onboard direct registration
    const subRegForm = document.getElementById("agent-register-subagent-form");
    if (subRegForm) {
      const newSubRegForm = subRegForm.cloneNode(true);
      subRegForm.parentNode.replaceChild(newSubRegForm, subRegForm);

      newSubRegForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const usernameVal = newSubRegForm.querySelector("#agent-sub-username").value.trim();
        const passVal = newSubRegForm.querySelector("#agent-sub-password").value.trim();
        const phoneVal = newSubRegForm.querySelector("#agent-sub-phone").value.trim();
        const emailVal = newSubRegForm.querySelector("#agent-sub-email").value.trim();
        const rateValStr = newSubRegForm.querySelector("#agent-sub-comm-rate").value;

        if (!usernameVal || !passVal || !phoneVal || !emailVal || !rateValStr) {
          app.showToast("All fields are required to onboard a sub-agent!", "error");
          return;
        }

        const myRatePct = (app.currentUser.commissionRate !== undefined) ? parseFloat(app.currentUser.commissionRate) : 5.0;
        const rateVal = parseFloat(rateValStr);
        if (isNaN(rateVal) || rateVal < 0.5 || rateVal >= myRatePct) {
          app.showToast(`Invalid Commission Rate! Must be between 0.5% and less than your total rate (${myRatePct.toFixed(1)}%).`, "error");
          return;
        }

        // Validate duplicates
        const dupUser = app.db.users.find(u => u.username.toLowerCase() === usernameVal.toLowerCase() || u.email.toLowerCase() === emailVal.toLowerCase() || u.phone === phoneVal);
        if (dupUser) {
          app.showToast("Account Creation Failed: Username, Email or Phone Number already exists!", "error");
          return;
        }

        const welcomeBonus = (app.db && app.db.settings && app.db.settings.signupBonus !== undefined) 
          ? parseFloat(app.db.settings.signupBonus) 
          : 100;

        const referBonus = (app.db.settings && app.db.settings.agentReferralBonus !== undefined)
          ? parseFloat(app.db.settings.agentReferralBonus)
          : 100;

        // Create Sub-agent user object
        const newSubUser = {
          id: "u" + Date.now(),
          username: usernameVal,
          email: emailVal,
          password: passVal,
          phone: phoneVal,
          balance: welcomeBonus,
          totDeposit: 0,
          totWithdraw: 0,
          wins: 0,
          loss: 0,
          profit: 0,
          joinDate: new Date().toISOString().split("T")[0],
          status: "active",
          blockedUntil: null,
          refersCount: 0,
          referredUsers: [],
          rewardedMilestones: [],
          role: "subagent",
          referredBy: app.currentUser.username,
          commissionRate: rateVal
        };

        // Award referral bonus to Agent!
        app.currentUser.balance = (app.currentUser.balance || 0) + referBonus;
        
        const dbAgent = app.db.users.find(u => u.id === app.currentUser.id);
        if (dbAgent) {
          dbAgent.balance = app.currentUser.balance;
          dbAgent.refersCount = (dbAgent.refersCount || 0) + 1;
          if (!dbAgent.referredUsers) dbAgent.referredUsers = [];
          dbAgent.referredUsers.push({
            username: usernameVal,
            region: "Sub-Agent Recruit",
            date: new Date().toISOString()
          });
        }

        // Log agent activity ledger
        if (!app.db.agentLedger) app.db.agentLedger = [];
        app.db.agentLedger.push({
          id: "act_" + Date.now(),
          agentId: app.currentUser.id,
          timestamp: new Date().toISOString(),
          targetUser: usernameVal,
          description: `Onboarded Sub-Agent @${usernameVal} at ${rateVal.toFixed(1)}% split`,
          amount: referBonus,
          commission: 0
        });

        // Add subagent to system DB
        app.db.users.push(newSubUser);
        
        app.saveDB();
        app.showToast(`Sub-Agent @${usernameVal} registered successfully! Added ৳${referBonus} referral bonus to your agent wallet.`, "success");
        newSubRegForm.reset();
        app.renderAgentWorkspace();
      });
    }

    // Setup Custom Sub-Agent Modal Event Handlers
    // 1. Close buttons
    const closeEditBtn = document.getElementById("agent-close-subagent-edit-modal-btn");
    if (closeEditBtn) {
      closeEditBtn.addEventListener("click", () => {
        const modal = document.getElementById("agent-subagent-edit-modal");
        if (modal) modal.classList.add("hidden");
      });
    }

    const closeCashBtn = document.getElementById("agent-close-subagent-cash-modal-btn");
    if (closeCashBtn) {
      closeCashBtn.addEventListener("click", () => {
        const modal = document.getElementById("agent-subagent-cash-modal");
        if (modal) modal.classList.add("hidden");
      });
    }

    // 2. Preset cash load buttons
    document.querySelectorAll(".sub-preset-load-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("val");
        const amountInput = document.getElementById("cash-subagent-amount");
        if (amountInput) {
          amountInput.value = val;
        }
      });
    });

    // 3. Edit Form submission handler
    const editForm = document.getElementById("agent-subagent-edit-form");
    if (editForm) {
      const newEditForm = editForm.cloneNode(true);
      editForm.parentNode.replaceChild(newEditForm, editForm);

      newEditForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const subId = document.getElementById("edit-subagent-id-field").value;
        const email = document.getElementById("edit-subagent-email").value.trim();
        const phone = document.getElementById("edit-subagent-phone").value.trim();
        const password = document.getElementById("edit-subagent-password").value.trim();
        const rateValStr = document.getElementById("edit-subagent-rate").value;
        const status = document.getElementById("edit-subagent-status").value;
        const targetTickets = parseInt(document.getElementById("edit-subagent-target-tickets").value || "0");
        const targetReward = parseFloat(document.getElementById("edit-subagent-target-reward").value || "0");

        const myRatePct = (app.currentUser.commissionRate !== undefined) ? parseFloat(app.currentUser.commissionRate) : 5.0;
        const rateVal = parseFloat(rateValStr);
        if (isNaN(rateVal) || rateVal < 0.5 || rateVal >= myRatePct) {
          app.showToast(`Invalid Commission Rate! Must be between 0.5% and less than your total rate (${myRatePct.toFixed(1)}%).`, "error");
          return;
        }

        const targetUser = app.db.users.find(u => u.id === subId);
        if (!targetUser) {
          app.showToast("Selected sub-agent not found in database!", "error");
          return;
        }

        // Validate duplicates
        const dupUser = app.db.users.find(u => u.id !== subId && (u.email && u.email.toLowerCase() === email.toLowerCase() || u.phone === phone));
        if (dupUser) {
          app.showToast("Email or Phone Number already exists on another account!", "error");
          return;
        }

        // Apply changes
        targetUser.email = email;
        targetUser.phone = phone;
        targetUser.commissionRate = rateVal;
        targetUser.status = status;
        if (password) {
          targetUser.password = password;
        }

        const targetLotteryId = document.getElementById("edit-subagent-target-lottery").value;

        // Set monthly mission targets
        if (targetUser.monthlyTargetTickets !== targetTickets || targetUser.monthlyTargetReward !== targetReward || targetUser.monthlyTargetLotteryId !== targetLotteryId) {
          targetUser.monthlyTargetTickets = targetTickets;
          targetUser.monthlyTargetReward = targetReward;
          targetUser.monthlyTargetLotteryId = targetLotteryId;
          targetUser.monthlyTargetClaimed = false; // Reset claim status for new targets
          targetUser.monthlySalesProgress = 0; // Reset progress for the new target
        }

        // Sync into global user instances
        app.db.users.forEach(u => {
          if (u.id === subId) {
            u.email = email;
            u.phone = phone;
            u.commissionRate = rateVal;
            u.status = status;
            u.monthlyTargetTickets = targetTickets;
            u.monthlyTargetReward = targetReward;
            u.monthlyTargetLotteryId = targetLotteryId;
            if (password) {
              u.password = password;
            }
          }
        });

        // Log in agent activity ledger
        if (!app.db.agentLedger) app.db.agentLedger = [];
        app.db.agentLedger.push({
          id: "act_" + Date.now(),
          agentId: app.currentUser.id,
          timestamp: new Date().toISOString(),
          targetUser: targetUser.username,
          description: `Updated Sub-Agent @${targetUser.username}'s profile details and target missions`,
          amount: 0,
          commission: 0
        });

        app.saveDB();
        app.showToast(`Successfully updated sub-agent @${targetUser.username}'s information!`, "success");
        const editModal = document.getElementById("agent-subagent-edit-modal");
        if (editModal) editModal.classList.add("hidden");
        app.renderAgentWorkspace();
      });
    }

    // 4. Dedicated Cash Load form submission handler
    const cashForm = document.getElementById("agent-subagent-cash-form");
    if (cashForm) {
      const newCashForm = cashForm.cloneNode(true);
      cashForm.parentNode.replaceChild(newCashForm, cashForm);

      newCashForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const subId = document.getElementById("cash-subagent-id-field").value;
        const amountStr = document.getElementById("cash-subagent-amount").value;
        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount < 10) {
          app.showToast("Minimum load amount is ৳10!", "error");
          return;
        }

        const myBalance = app.currentUser.balance || 0;
        if (myBalance < amount) {
          app.showToast(`Insufficient balance! Your current wallet balance is ৳${myBalance.toFixed(2)}.`, "error");
          return;
        }

        const targetUser = app.db.users.find(u => u.id === subId);
        if (!targetUser) {
          app.showToast("Selected sub-agent not found in database!", "error");
          return;
        }

        // Deduct from agent wallet balance
        app.currentUser.balance -= amount;
        const dbAgent = app.db.users.find(u => u.id === app.currentUser.id);
        if (dbAgent) {
          dbAgent.balance = app.currentUser.balance;
        }

        // Add to sub-agent wallet balance
        targetUser.balance = (targetUser.balance || 0) + amount;

        // Log agent activity ledger
        if (!app.db.agentLedger) app.db.agentLedger = [];
        app.db.agentLedger.push({
          id: "act_" + Date.now(),
          agentId: app.currentUser.id,
          timestamp: new Date().toISOString(),
          targetUser: targetUser.username,
          description: `Dedicated Sub-Agent Cash Load: Sent ৳${amount.toFixed(2)} to @${targetUser.username}`,
          amount: amount,
          commission: 0
        });

        // Add transactions for both
        if (!app.db.transactions) app.db.transactions = [];
        
        // Agent transaction (Withdrawal / Outgoing)
        app.db.transactions.push({
          id: `tx_${Date.now()}_agent_out`,
          userId: app.currentUser.id,
          userName: app.currentUser.username,
          username: app.currentUser.username,
          paymentMethod: "Sub-Agent Cash Transfer",
          phone: "Internal App Wallet",
          amount: amount,
          transactionType: "Withdrawal",
          status: "complete",
          bonusAmount: 0,
          notes: `Sent Cash Load to Sub-Agent @${targetUser.username}`,
          date: new Date().toLocaleString("en-US", { hour12: true })
        });

        // Sub-Agent transaction (Deposit / Incoming)
        app.db.transactions.push({
          id: `tx_${Date.now()}_sub_in`,
          userId: targetUser.id,
          userName: targetUser.username,
          username: targetUser.username,
          paymentMethod: "Agent Cash Received",
          phone: "Internal App Wallet",
          amount: amount,
          transactionType: "Deposit",
          status: "complete",
          bonusAmount: 0,
          notes: `Received Cash Load from parent Agent @${app.currentUser.username}`,
          date: new Date().toLocaleString("en-US", { hour12: true })
        });

        app.saveDB();
        app.showToast(`Successfully transferred ৳${amount.toFixed(2)} to Sub-Agent @${targetUser.username}!`, "success");
        newCashForm.reset();
        const cashModal = document.getElementById("agent-subagent-cash-modal");
        if (cashModal) cashModal.classList.add("hidden");
        app.renderAgentWorkspace();
      });
    }

    // Setup Search & Filtering listeners
    this.setupSubAgentSearchFilterAndSortListeners();
  },

  setupSubAgentDetailBackListener() {
    const backBtn = document.getElementById("agent-subagents-detail-back-btn");
    if (backBtn && !backBtn.dataset.listenerAttached) {
      backBtn.addEventListener("click", () => {
        const detailView = document.getElementById("agent-subagents-detail-view");
        const listView = document.getElementById("agent-subagents-list-view");
        if (detailView) detailView.classList.add("hidden");
        if (listView) listView.classList.remove("hidden");
      });
      backBtn.dataset.listenerAttached = "true";
    }
  },

  showSubAgentDetailOverview(subId) {
    const sub = this.db.users.find(u => u.id === subId);
    if (!sub) return;

    // Switch views
    const detailView = document.getElementById("agent-subagents-detail-view");
    const listView = document.getElementById("agent-subagents-list-view");
    if (detailView) detailView.classList.remove("hidden");
    if (listView) listView.classList.add("hidden");

    // Populate profile fields
    const avatarInit = document.getElementById("detail-sub-avatar-initial");
    if (avatarInit) avatarInit.innerText = (sub.username || "S").charAt(0).toUpperCase();

    const usernameLbl = document.getElementById("detail-sub-username");
    if (usernameLbl) usernameLbl.innerText = `@${sub.username || "operator"}`;

    const emailLbl = document.getElementById("detail-sub-email");
    if (emailLbl) emailLbl.innerText = sub.email || "N/A";

    const phoneLbl = document.getElementById("detail-sub-phone");
    if (phoneLbl) phoneLbl.innerText = sub.phone || "N/A";

    const statusLbl = document.getElementById("detail-sub-status-lbl");
    if (statusLbl) {
      statusLbl.innerText = (sub.status || "active").toUpperCase();
      if (sub.status === "active") {
        statusLbl.className = "font-bold uppercase text-emerald-400 font-mono";
      } else {
        statusLbl.className = "font-bold uppercase text-rose-450 font-mono";
      }
    }

    const rateLbl = document.getElementById("detail-sub-rate-lbl");
    const subRate = sub.commissionRate || 3.0;
    if (rateLbl) rateLbl.innerText = `${subRate.toFixed(1)}%`;

    const myRatePct = (this.currentUser.commissionRate !== undefined) ? parseFloat(this.currentUser.commissionRate) : 5.0;
    const overrideRate = Math.max(0, myRatePct - subRate);
    const overrideRateLbl = document.getElementById("detail-sub-override-rate-lbl");
    if (overrideRateLbl) overrideRateLbl.innerText = `${overrideRate.toFixed(1)}%`;

    // Calculate sales, tickets, players
    const lotteries = this.db.lotteries || [];
    const tickets = this.db.tickets || [];
    const subPlayers = this.db.users.filter(u => u.referredBy && u.referredBy.toLowerCase() === sub.username.toLowerCase());
    const totalPlayersCount = subPlayers.length;

    let totalSalesVol = 0;
    const playerIds = new Set(subPlayers.map(p => p.id));
    tickets.forEach(t => {
      if (playerIds.has(t.userId)) {
        const lot = lotteries.find(l => l.id === t.lotteryId);
        if (lot) totalSalesVol += (lot.entryFee || 10);
      }
    });

    const subEarnings = totalSalesVol * (subRate / 100);
    const overrideEarnings = totalSalesVol * (overrideRate / 100);

    const target = sub.monthlyTargetTickets || 0;
    const progress = sub.monthlySalesProgress || 0;
    const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

    const progressLbl = document.getElementById("detail-sub-progress-lbl");
    if (progressLbl) progressLbl.innerText = progress;

    const targetLbl = document.getElementById("detail-sub-target-lbl");
    if (targetLbl) targetLbl.innerText = target;

    const rewardLbl = document.getElementById("detail-sub-reward-lbl");
    if (rewardLbl) rewardLbl.innerText = `৳${(sub.monthlyTargetReward || 0).toFixed(2)}`;

    const pctLbl = document.getElementById("detail-sub-pct-lbl");
    if (pctLbl) pctLbl.innerText = `${pct}%`;

    const progressBar = document.getElementById("detail-sub-progress-bar");
    if (progressBar) progressBar.style.width = `${pct}%`;

    const playersCountEl = document.getElementById("detail-sub-players-count");
    if (playersCountEl) playersCountEl.innerText = totalPlayersCount;

    const salesVolEl = document.getElementById("detail-sub-sales-volume");
    if (salesVolEl) salesVolEl.innerText = `৳${totalSalesVol.toFixed(2)}`;

    const earningsEl = document.getElementById("detail-sub-earnings");
    if (earningsEl) earningsEl.innerText = `৳${subEarnings.toFixed(2)}`;

    const overrideEl = document.getElementById("detail-sub-override");
    if (overrideEl) overrideEl.innerText = `৳${overrideEarnings.toFixed(2)}`;
  }
};
