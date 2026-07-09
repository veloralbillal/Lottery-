// ============================================================================
// AGENT FIELD WORKSPACE & STAFF SERVICES MODULAR SYSTEM
// ============================================================================

export const AgentModule = {
  checkAndClaimMonthlyTarget(operatorUser) {
    if (!operatorUser) return;
    const target = parseInt(operatorUser.monthlyTargetTickets || 0);
    const reward = parseFloat(operatorUser.monthlyTargetReward || 0);
    const progress = parseInt(operatorUser.monthlySalesProgress || 0);
    const claimed = !!operatorUser.monthlyTargetClaimed;

    if (target > 0 && progress >= target && !claimed) {
      operatorUser.monthlyTargetClaimed = true;
      operatorUser.balance = (operatorUser.balance || 0) + reward;

      // Sync into the global database users list
      const dbUser = this.db.users.find(u => u.id === operatorUser.id);
      if (dbUser) {
        dbUser.balance = operatorUser.balance;
        dbUser.monthlyTargetClaimed = true;
      }

      // Add credit transaction entry
      if (!this.db.transactions) this.db.transactions = [];
      this.db.transactions.push({
        id: "tx_" + Date.now() + "_target_bonus",
        userId: operatorUser.id,
        userName: operatorUser.username,
        username: operatorUser.username,
        amount: reward,
        paymentMethod: "Monthly Target Bonus",
        phone: "System Reward System",
        transactionType: "Deposit",
        status: "complete",
        bonusAmount: 0,
        notes: `Completed Monthly Sales Target: Sold ${progress}/${target} tickets!`,
        date: new Date().toLocaleString("en-US", { hour12: true })
      });

      // Add to agent activity ledger
      if (!this.db.agentLedger) this.db.agentLedger = [];
      this.db.agentLedger.push({
        id: "act_" + Date.now() + "_bonus",
        agentId: operatorUser.id,
        timestamp: new Date().toISOString(),
        targetUser: operatorUser.username,
        description: `Completed Monthly Sales Target: Sold ${progress}/${target} tickets!`,
        amount: reward,
        commission: reward
      });

      this.saveDB();

      // Trigger standard sweet toast notification
      this.showToast(`🎯 CONGRATULATIONS! You completed your monthly ticket sales target of ${target} tickets and instantly claimed ৳${reward.toFixed(2)} Taka reward!`, "success");
      
      this.render();
    }
  },

  renderAgentWorkspace() {
    if (!this.currentUser || (this.currentUser.role !== "agent" && this.currentUser.role !== "subagent")) return;

    const ledger = (this.db.agentLedger || []).filter(l => l.agentId === this.currentUser.id);

    // Display basic identity
    const nameEl = document.getElementById("agent-display-name");
    if (nameEl) nameEl.innerText = `@${this.currentUser.username}`;

    // Update title and tab visibility for sub-agents
    const titleEl = document.getElementById("agent-suite-title");
    if (titleEl) {
      if (this.currentUser.role === "subagent") {
        titleEl.innerText = "FIELD SUB-AGENT SUITE v2.4";
        titleEl.className = "text-xs font-black tracking-wider text-indigo-400 font-mono";
      } else {
        titleEl.innerText = "FIELD AGENT SUITE v2.4";
        titleEl.className = "text-xs font-black tracking-wider text-emerald-400 font-mono";
      }
    }

    const subagentsBtn = document.getElementById("agent-btn-subagents");
    if (subagentsBtn) {
      if (this.currentUser.role === "subagent") {
        subagentsBtn.classList.add("hidden");
      } else {
        subagentsBtn.classList.remove("hidden");
      }
    }

    // Update Overview Stats
    const balOverview = document.getElementById("agent-overview-wallet-balance");
    if (balOverview) balOverview.innerText = `৳${(this.currentUser.balance || 0).toFixed(2)}`;

    const commOverview = document.getElementById("agent-overview-commission-earned");
    if (commOverview) commOverview.innerText = `৳${(this.currentUser.earnedCommission || 0).toFixed(2)}`;

    const bookingsOverview = document.getElementById("agent-overview-total-bookings");
    if (bookingsOverview) bookingsOverview.innerText = `${this.currentUser.totalBookings || 0}`;

    const rateOverview = document.getElementById("agent-overview-commission-rate");
    if (rateOverview) rateOverview.innerText = `${(this.currentUser.commissionRate || 5.0).toFixed(1)}%`;

    // Render dynamic Monthly Sales Target
    const monthlyTargetContainer = document.getElementById("agent-monthly-target-container");
    const target = parseInt(this.currentUser.monthlyTargetTickets || 0);
    const reward = parseFloat(this.currentUser.monthlyTargetReward || 0);
    const progress = parseInt(this.currentUser.monthlySalesProgress || 0);
    const claimed = !!this.currentUser.monthlyTargetClaimed;
    const targetPct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

    // Trigger auto claim on workspace load if target is reached but not claimed
    if (target > 0 && progress >= target && !claimed) {
      this.checkAndClaimMonthlyTarget(this.currentUser);
    }

    if (monthlyTargetContainer) {
      const progressTextEl = document.getElementById("agent-monthly-progress-text");
      const progressBarEl = document.getElementById("agent-monthly-progress-bar");
      const rewardTextEl = document.getElementById("agent-monthly-reward-text");
      const badgeEl = document.getElementById("agent-monthly-status-badge");
      const claimBtn = document.getElementById("agent-monthly-claim-btn");
      const poolValEl = document.getElementById("agent-monthly-pool-val");
      const countdownValEl = document.getElementById("agent-monthly-countdown-val");

      // Dynamic target pool name resolution
      let targetPoolName = "Any Active Pool";
      const targetLotteryId = this.currentUser.monthlyTargetLotteryId || "any";
      if (targetLotteryId !== "any") {
        const foundLot = (this.db.lotteries || []).find(l => l.id === targetLotteryId);
        if (foundLot) {
          targetPoolName = foundLot.name;
        } else {
          targetPoolName = "Archived Pool";
        }
      }
      if (poolValEl) poolValEl.innerText = targetPoolName;

      // Dynamic remaining tickets countdown
      const remaining = Math.max(0, target - progress);
      let countdownText = "";
      if (target <= 0) {
        countdownText = "Disabled";
      } else if (remaining === 0) {
        countdownText = "Target Achieved! 🎉";
      } else {
        countdownText = `${remaining} Tickets Left`;
      }
      if (countdownValEl) countdownValEl.innerText = countdownText;

      if (target <= 0) {
        if (badgeEl) {
          badgeEl.innerText = "No Target Set";
          badgeEl.className = "px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase bg-slate-950/60 border border-slate-800 text-slate-500";
        }
        if (progressTextEl) progressTextEl.innerText = "0 Pcs";
        if (progressBarEl) progressBarEl.style.width = "0%";
        if (rewardTextEl) rewardTextEl.innerText = "৳0.00 Taka";
        if (claimBtn) claimBtn.classList.add("hidden");
      } else {
        if (progressTextEl) progressTextEl.innerText = `${progress} / ${target} Pcs`;
        if (progressBarEl) progressBarEl.style.width = `${targetPct}%`;
        if (rewardTextEl) rewardTextEl.innerText = `৳${reward.toFixed(2)} Taka`;

        if (progress >= target) {
          if (claimed || this.currentUser.monthlyTargetClaimed) {
            if (badgeEl) {
              badgeEl.innerText = "Claimed 🎉";
              badgeEl.className = "px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase bg-emerald-950/60 border border-emerald-800 text-emerald-400";
            }
            if (claimBtn) claimBtn.classList.add("hidden");
          } else {
            if (badgeEl) {
              badgeEl.innerText = "Completed 🎯";
              badgeEl.className = "px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase bg-yellow-950/60 border border-yellow-850 text-yellow-450 animate-pulse";
            }
            if (claimBtn) {
              claimBtn.classList.remove("hidden");
              const claimRewardSpan = document.getElementById("agent-monthly-claim-btn-reward");
              if (claimRewardSpan) claimRewardSpan.innerText = reward.toFixed(0);
              
              const newClaimBtn = claimBtn.cloneNode(true);
              claimBtn.parentNode.replaceChild(newClaimBtn, claimBtn);
              newClaimBtn.addEventListener("click", () => {
                this.checkAndClaimMonthlyTarget(this.currentUser);
              });
            }
          }
        } else {
          if (badgeEl) {
            badgeEl.innerText = "In Progress ⏳";
            badgeEl.className = "px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase bg-indigo-950/60 border border-indigo-900 text-indigo-400";
          }
          if (claimBtn) claimBtn.classList.add("hidden");
        }
      }
    }

    // Target Overview Badge Progress Score
    const targetBadge = document.getElementById("agent-overview-target-progress");
    if (targetBadge) {
      targetBadge.innerText = `${targetPct}%`;
    }

    // Populate active lotteries dropdown list
    const selectEl = document.getElementById("agent-booking-lottery");
    const activeLotts = this.db.lotteries.filter(l => l.status === "active");

    if (selectEl) {
      const prevVal = selectEl.value;
      selectEl.innerHTML = "";
      activeLotts.forEach(lot => {
        const opt = document.createElement("option");
        opt.value = lot.id;
        opt.innerText = `${lot.name} (Entry: ৳${lot.entryFee})`;
        selectEl.appendChild(opt);
      });
      if (prevVal && activeLotts.some(l => l.id === prevVal)) {
        selectEl.value = prevVal;
      }
    }

    // Populate Active Pools interactive list card slots in Booker Tab
    const poolsListEl = document.getElementById("agent-active-pools-list");
    if (poolsListEl) {
      poolsListEl.innerHTML = "";
      if (activeLotts.length === 0) {
        poolsListEl.innerHTML = `
          <div class="text-center p-4 bg-slate-950 border border-slate-900 rounded-2xl text-slate-500 font-sans text-[11px]">
            No live draw event active at the moment.
          </div>
        `;
      } else {
        activeLotts.forEach(lot => {
          const cardDiv = document.createElement("div");
          cardDiv.className = "bg-slate-950 border border-slate-850 p-3.5 rounded-2xl flex justify-between items-center transition hover:border-emerald-500/20";
          cardDiv.innerHTML = `
            <div>
              <span class="text-[9px] uppercase font-bold tracking-wider text-emerald-400 font-mono">${lot.category}</span>
              <h5 class="text-xs font-bold text-white mt-0.5">${lot.name}</h5>
              <div class="text-[9.5px] text-slate-500 font-mono">Fee: ৳${lot.entryFee} • ${lot.soldTickets || 0}/${lot.totalTickets || 500} Sold</div>
            </div>
            <button class="fill-lottery-action bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-900/40 text-emerald-400 text-[10px] font-black py-1.5 px-3 rounded-xl transition cursor-pointer" data-id="${lot.id}">
              Select
            </button>
          `;
          poolsListEl.appendChild(cardDiv);
        });

        // Add direct selector button trigger action
        poolsListEl.querySelectorAll(".fill-lottery-action").forEach(btn => {
          btn.addEventListener("click", () => {
            const lotId = btn.getAttribute("data-id");
            if (selectEl) {
              selectEl.value = lotId;
              // Trigger change event to recompute estimates
              const event = new Event('change');
              selectEl.dispatchEvent(event);
              this.showToast(`Selected pool: ${lotId}`, "info");
            }
          });
        });
      }
    }

    // Render Searchable Active Player list registry
    const playersTbody = document.getElementById("agent-players-tbody");
    if (playersTbody) {
      playersTbody.innerHTML = "";
      
      const searchVal = (document.getElementById("agent-players-search-input")?.value || "").toLowerCase().trim();
      const allPlayers = this.db.users.filter(u => u.role === "user");
      
      const filteredPlayers = allPlayers.filter(p => {
        if (!searchVal) return true;
        return (p.username || "").toLowerCase().includes(searchVal) ||
               (p.email || "").toLowerCase().includes(searchVal) ||
               (p.phone || "").toLowerCase().includes(searchVal);
      });

      if (filteredPlayers.length === 0) {
        playersTbody.innerHTML = `
          <tr>
            <td colspan="5" class="p-6 text-center text-slate-500 font-mono">
              -- No matching registered players detected in workspace --
            </td>
          </tr>
        `;
      } else {
        filteredPlayers.forEach(p => {
          const row = document.createElement("tr");
          row.className = "border-b border-slate-800/30 hover:bg-slate-900/20 transition";
          
          row.innerHTML = `
            <td class="p-3">
              <div class="font-bold text-white flex items-center gap-1">
                <span class="text-xs text-slate-400">@</span>${p.username}
              </div>
              <div class="text-[9.5px] text-slate-500 font-mono select-all">${p.email || "N/A"}</div>
            </td>
            <td class="p-3 font-mono text-slate-350 select-all">${p.phone || "N/A"}</td>
            <td class="p-3 font-mono font-bold text-emerald-400">৳${(p.balance || 0).toFixed(2)}</td>
            <td class="p-3">
              <span class="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-[9px] font-mono leading-none font-bold ${p.status === 'active' ? 'bg-emerald-950 text-emerald-450 border border-emerald-900/30' : 'bg-rose-950 text-rose-450 border border-rose-900/30'}">
                <span class="w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}"></span>
                ${(p.status || "active").toUpperCase()}
              </span>
            </td>
            <td class="p-3 text-right space-x-1.5 whitespace-nowrap">
              <button class="agent-fill-user-load bg-emerald-950/40 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/40 py-1.5 px-3 rounded-lg text-[10px] uppercase font-black transition cursor-pointer" data-username="${p.username}">
                Load Cash
              </button>
              <button class="agent-fill-user-wdr bg-rose-955/40 hover:bg-rose-900 text-rose-450 border border-rose-900/40 py-1.5 px-3 rounded-lg text-[10px] uppercase font-black transition cursor-pointer" data-username="${p.username}">
                Cash Out
              </button>
            </td>
          </tr>
        `;
          playersTbody.appendChild(row);
        });

        // Add action triggers inside rows
        playersTbody.querySelectorAll(".agent-fill-user-load").forEach(btn => {
          btn.addEventListener("click", () => {
            const user = btn.getAttribute("data-username");
            // Set input details and navigate
            const depUserEl = document.getElementById("agent-cash-dep-username");
            if (depUserEl) depUserEl.value = user;

            const cashTabTrigger = document.getElementById("agent-btn-cash");
            if (cashTabTrigger) {
              cashTabTrigger.click();
              this.showToast(`Prefilled target player @${user} inside Cash Load`, "info");
            }
          });
        });

        playersTbody.querySelectorAll(".agent-fill-user-wdr").forEach(btn => {
          btn.addEventListener("click", () => {
            const user = btn.getAttribute("data-username");
            // Set input details and navigate
            const wdrUserEl = document.getElementById("agent-cash-wdr-username");
            if (wdrUserEl) wdrUserEl.value = user;

            const cashTabTrigger = document.getElementById("agent-btn-cash");
            if (cashTabTrigger) {
              cashTabTrigger.click();
              // Make sure withdrawal forms is toggled
              const wdrSubBtn = document.getElementById("btn-agent-sub-wdr");
              if (wdrSubBtn) wdrSubBtn.click();
              this.showToast(`Prefilled target player @${user} inside Cash Out Assist`, "info");
            }
          });
        });
      }
    }

    // Populate local activity / ledger table
    const tbody = document.getElementById("agent-activity-tbody");
    if (tbody) {
      tbody.innerHTML = "";
      
      if (ledger.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="p-5 text-center text-slate-500 font-sans">
              No direct field bookings or transfers logged in active session.
            </td>
          </tr>
        `;
      } else {
        // Render chronological order descending
        [...ledger].reverse().forEach(act => {
          const row = document.createElement("tr");
          row.className = "border-b border-slate-800/25 text-[11px] hover:bg-slate-900/30 transition";

          const dateObj = new Date(act.timestamp);
          const timeString = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          row.innerHTML = `
            <td class="p-3 select-none text-slate-500">${timeString}</td>
            <td class="p-3 text-white font-bold">@${act.targetUser}</td>
            <td class="p-3 text-slate-400 font-sans">${act.description}</td>
            <td class="p-3 text-slate-200">৳${act.amount.toFixed(2)}</td>
            <td class="p-3 ${act.commission > 0 ? "text-emerald-400 font-bold" : "text-slate-550"}">${act.commission > 0 ? `+৳${act.commission.toFixed(2)}` : "-"}</td>
          `;
          tbody.appendChild(row);
        });
      }
    }

    // --- Render Sub-Agents Tab Performance and Registry ---
    this.renderSubAgentTab();
    // --- End Render Sub-Agents ---
  },

  setupDistrictAgentsLookup() {
    const depDistrictSelect = document.getElementById("user-dep-agent-district-select");
    const depAgentSelect = document.getElementById("user-dep-agent-lookup-select");
    const depDetailsCard = document.getElementById("user-dep-agent-details-card");
    const depLblUsername = document.getElementById("user-dep-agent-lbl-username");
    const depLblPhone = document.getElementById("user-dep-agent-lbl-phone");

    const wdDistrictSelect = document.getElementById("user-wd-agent-district-select");
    const wdAgentSelect = document.getElementById("user-wd-agent-lookup-select");
    const wdDetailsCard = document.getElementById("user-wd-agent-details-card");
    const wdLblUsername = document.getElementById("user-wd-agent-lbl-username");
    const wdLblLocation = document.getElementById("user-wd-agent-lbl-location");
    const wdAccountInput = document.getElementById("wd-account");

    const refreshDepositAgents = () => {
      if (!depDistrictSelect || !depAgentSelect) return;
      const district = depDistrictSelect.value;
      const agents = this.db.users.filter(u => u.role === "agent" && u.status === "active" && (district === "all" || u.district === district));

      depAgentSelect.innerHTML = "";
      if (agents.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.text = "No active agents here";
        depAgentSelect.appendChild(option);
        if (depDetailsCard) depDetailsCard.classList.add("hidden");
      } else {
        agents.forEach(agent => {
          const option = document.createElement("option");
          option.value = agent.id;
          option.text = `@${agent.username} (${agent.district || "Dhaka"})`;
          depAgentSelect.appendChild(option);
        });
        
        const firstAgent = agents[0];
        if (depLblUsername) depLblUsername.innerText = `@${firstAgent.username}`;
        if (depLblPhone) depLblPhone.innerText = firstAgent.phone || "No phone";
        if (depDetailsCard) depDetailsCard.classList.remove("hidden");
      }
    };

    const refreshWithdrawAgents = () => {
      if (!wdDistrictSelect || !wdAgentSelect) return;
      const district = wdDistrictSelect.value;
      const agents = this.db.users.filter(u => u.role === "agent" && u.status === "active" && (district === "all" || u.district === district));

      wdAgentSelect.innerHTML = "";
      if (agents.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.text = "No active agents here";
        wdAgentSelect.appendChild(option);
        if (wdDetailsCard) wdDetailsCard.classList.add("hidden");
      } else {
        agents.forEach(agent => {
          const option = document.createElement("option");
          option.value = agent.id;
          option.text = `@${agent.username} (${agent.district || "Dhaka"})`;
          wdAgentSelect.appendChild(option);
        });

        const firstAgent = agents[0];
        if (wdLblUsername) wdLblUsername.innerText = `@${firstAgent.username}`;
        if (wdLblLocation) wdLblLocation.innerText = `${firstAgent.district || "Dhaka"} District Agent`;
        if (wdDetailsCard) wdDetailsCard.classList.remove("hidden");

        if (wdAccountInput && wdAgentSelect.closest("#user-wd-row-district-agents") && !wdRowDistrictAgents_is_hidden()) {
          wdAccountInput.value = firstAgent.phone || "";
        }
      }
    };

    const wdRowDistrictAgents_is_hidden = () => {
      const parent = document.getElementById("user-wd-row-district-agents");
      return !parent || parent.classList.contains("hidden");
    };

    if (depDistrictSelect) {
      depDistrictSelect.addEventListener("change", refreshDepositAgents);
    }
    if (depAgentSelect) {
      depAgentSelect.addEventListener("change", () => {
        const agentId = depAgentSelect.value;
        const agent = this.db.users.find(u => u.id === agentId);
        if (agent) {
          if (depLblUsername) depLblUsername.innerText = `@${agent.username}`;
          if (depLblPhone) depLblPhone.innerText = agent.phone || "";
          if (depDetailsCard) depDetailsCard.classList.remove("hidden");
        } else {
          if (depDetailsCard) depDetailsCard.classList.add("hidden");
        }
      });
    }

    if (wdDistrictSelect) {
      wdDistrictSelect.addEventListener("change", refreshWithdrawAgents);
    }
    if (wdAgentSelect) {
      wdAgentSelect.addEventListener("change", () => {
        const agentId = wdAgentSelect.value;
        const agent = this.db.users.find(u => u.id === agentId);
        if (agent) {
          if (wdLblUsername) wdLblUsername.innerText = `@${agent.username}`;
          if (wdLblLocation) wdLblLocation.innerText = `${agent.district || "Dhaka"} District Agent`;
          if (wdDetailsCard) wdDetailsCard.classList.remove("hidden");
          if (wdAccountInput) {
            wdAccountInput.value = agent.phone || "";
          }
        } else {
          if (wdDetailsCard) wdDetailsCard.classList.add("hidden");
        }
      });
    }

    refreshDepositAgents();
    refreshWithdrawAgents();
  },

  setupStaffAndAgentListeners() {
    const app = this;

    // --- Staff Management Triggers inside Admin ---
    const createStaffBtn = document.getElementById("admin-create-staff-btn");
    const staffWrapper = document.getElementById("admin-create-staff-wrapper");
    const cancelStaffBtn = document.getElementById("admin-cancel-staff-btn");
    const createStaffForm = document.getElementById("admin-create-staff-form");
    const agentsSearchInput = document.getElementById("agents-search-input");

    if (createStaffBtn && staffWrapper) {
      createStaffBtn.addEventListener("click", () => {
        staffWrapper.classList.toggle("hidden");
        if (!staffWrapper.classList.contains("hidden")) {
          createStaffBtn.innerHTML = `<i class="fa-solid fa-minus"></i> Hide Form`;
        } else {
          createStaffBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Create Staff Account`;
        }
      });
    }

    if (cancelStaffBtn && staffWrapper) {
      cancelStaffBtn.addEventListener("click", () => {
        staffWrapper.classList.add("hidden");
        if (createStaffBtn) {
          createStaffBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Create Staff Account`;
        }
      });
    }

    if (createStaffForm) {
      createStaffForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const usernameVal = document.getElementById("staff-username").value.trim();
        const emailVal = document.getElementById("staff-email").value.trim();
        const phoneVal = document.getElementById("staff-phone").value.trim();
        const passVal = document.getElementById("staff-password").value.trim();
        const roleVal = document.getElementById("staff-role").value;
        const commVal = parseFloat(document.getElementById("staff-commission").value || "5.0");
        const districtVal = document.getElementById("staff-district").value;

        if (app.db.users.some(u => u.username.toLowerCase() === usernameVal.toLowerCase())) {
          app.showToast(`Username @${usernameVal} already exists in database!`, "error");
          return;
        }

        const newStaff = {
          id: "u_staff_" + Date.now(),
          username: usernameVal,
          email: emailVal,
          phone: phoneVal,
          password: passVal,
          dob: "1995-01-01",
          balance: roleVal === "agent" ? 1000 : 0, // Starter funds for agents to facilitate field deposits
          totDeposit: roleVal === "agent" ? 1000 : 0,
          totWithdraw: 0,
          wins: 0,
          loss: 0,
          profit: 0,
          joinDate: new Date().toISOString().split("T")[0],
          status: "active",
          blockedUntil: null,
          role: roleVal,
          commissionRate: roleVal === "agent" ? commVal : undefined,
          earnedCommission: roleVal === "agent" ? 0 : undefined,
          totalBookings: roleVal === "agent" ? 0 : undefined,
          district: roleVal === "agent" ? districtVal : undefined
        };

        app.db.users.push(newStaff);
        app.saveDB();
        app.showToast(`Staff account @${usernameVal} (${roleVal}) successfully created!`, "success");
        createStaffForm.reset();
        staffWrapper.classList.add("hidden");
        if (createStaffBtn) createStaffBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Create Staff Account`;
        app.renderAdminAgents();
      });
    }

    if (agentsSearchInput) {
      agentsSearchInput.addEventListener("input", () => {
        app.renderAdminAgents();
      });
    }

    // --- Agent Workspace Triggers ---
    
    // --- Advanced Agent Workspace Sub-Tabs Switcher ---
    const tabBtns = document.querySelectorAll(".agent-tab-selector-btn");
    const tabPanels = [
      "agent-tab-overview",
      "agent-tab-booker",
      "agent-tab-cash",
      "agent-tab-players",
      "agent-tab-subagents",
      "agent-tab-ledger"
    ];

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const selectedTab = btn.getAttribute("val");
        
        // Update selection UI buttons active colors
        tabBtns.forEach(b => {
          b.className = "agent-tab-selector-btn text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-2 cursor-pointer transition whitespace-nowrap bg-slate-900 border border-slate-800 text-slate-400 hover:text-white";
        });
        btn.className = "agent-tab-selector-btn text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-2 cursor-pointer transition whitespace-nowrap bg-emerald-600 text-white shadow-lg shadow-emerald-600/15";

        // Hide all sub tab containers, show active one
        tabPanels.forEach(panelId => {
          const panelEl = document.getElementById(panelId);
          if (panelEl) {
            if (panelId === `agent-tab-${selectedTab}`) {
              panelEl.classList.remove("hidden");
            } else {
              panelEl.classList.add("hidden");
            }
          }
        });

        // Trigger dynamic metrics update
        app.renderAgentWorkspace();
      });
    });

    // Real-time search filter for field player registry table
    const playerSearchInput = document.getElementById("agent-players-search-input");
    if (playerSearchInput) {
      playerSearchInput.addEventListener("input", () => {
        app.renderAgentWorkspace();
      });
    }

    // Agent-assisted player quick registration
    const agentRegForm = document.getElementById("agent-player-quick-register-form");
    if (agentRegForm) {
      agentRegForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const usernameVal = document.getElementById("agent-reg-username").value.trim();
        const emailVal = document.getElementById("agent-reg-email").value.trim();
        const phoneVal = document.getElementById("agent-reg-phone").value.trim();
        const passVal = document.getElementById("agent-reg-password").value.trim();

        if (!usernameVal || !emailVal || !phoneVal || !passVal) {
          app.showToast("All registration fields are required!", "error");
          return;
        }

        // Validate duplicates
        const dupUser = app.db.users.find(u => u.username.toLowerCase() === usernameVal.toLowerCase() || u.email.toLowerCase() === emailVal.toLowerCase() || u.phone === phoneVal);
        if (dupUser) {
          app.showToast("Account Creation Failed: Username, Email or Phone Number is already registered!", "error");
          return;
        }

        const welcomeBonus = (app.db && app.db.settings && app.db.settings.signupBonus !== undefined) 
          ? parseFloat(app.db.settings.signupBonus) 
          : 100;

        const referBonus = (app.db.settings && app.db.settings.agentReferralBonus !== undefined)
          ? parseFloat(app.db.settings.agentReferralBonus)
          : 100;

        // Create player user object
        const newUser = {
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
          role: "user", // "user" role is filtered as a regular player in agent tab
          referredBy: app.currentUser.username
        };

        // Award referral bonus to the Agent!
        app.currentUser.balance = (app.currentUser.balance || 0) + referBonus;
        
        // Also keep DB user record matching current active agent session
        const dbAgent = app.db.users.find(u => u.id === app.currentUser.id);
        if (dbAgent) {
          dbAgent.balance = app.currentUser.balance;
          dbAgent.refersCount = (dbAgent.refersCount || 0) + 1;
          if (!dbAgent.referredUsers) dbAgent.referredUsers = [];
          dbAgent.referredUsers.push({
            username: usernameVal,
            region: "Assisted",
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
          description: `Assisted Player Quick-Registration (Referral Bonus)`,
          amount: referBonus,
          commission: 0
        });

        // Add player to system DB
        app.db.users.push(newUser);
        
        app.saveDB();
        app.showToast(`Player @${usernameVal} registered successfully! Added ৳${referBonus} referral bonus to your agent wallet.`, "success");
        agentRegForm.reset();
        app.renderAgentWorkspace();
      });
    }

    // Sub-Agent: Setup Forms and Listeners from Modular Module
    this.setupSubAgentFormsAndListeners();

    // District-based Agent Live Support List Change Event
    const supportDistrictSelect = document.getElementById("user-support-agent-district-select");
    if (supportDistrictSelect) {
      supportDistrictSelect.addEventListener("change", () => {
        app.renderSupportAgentsList();
      });
    }

    // Agent Booker Pre-booking generator
    const spinBtn = document.getElementById("btn-agent-test-spin");
    const testNumVal = document.getElementById("agent-booking-test-number");
    if (spinBtn && testNumVal) {
      spinBtn.addEventListener("click", () => {
        // Spin a mockup 6-digit sequence
        const randomNum = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
        testNumVal.value = randomNum;
        app.showToast("Lucky offline mock number generated!", "success");
      });
    }

    // Agent Wallet presets in Load/Deposit and Payout helper
    const loadPresetBtns = document.querySelectorAll(".preset-load-btn");
    const loadAmountInput = document.getElementById("agent-cash-dep-amount");
    loadPresetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("val");
        if (loadAmountInput) {
          loadAmountInput.value = val;
          app.showToast(`Applied preset loaded: ৳${val}`, "info");
        }
      });
    });

    const wdrPresetBtns = document.querySelectorAll(".preset-wdr-btn");
    const wdrAmountInput = document.getElementById("agent-cash-wdr-amount");
    wdrPresetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("val");
        if (wdrAmountInput) {
          wdrAmountInput.value = val;
          app.showToast(`Applied preset payout: ৳${val}`, "info");
        }
      });
    });

    // Export Session ledger copy
    const copyLedgerBtn = document.getElementById("btn-agent-copy-ledger");
    if (copyLedgerBtn) {
      copyLedgerBtn.addEventListener("click", () => {
        const ledgerLogs = (app.db.agentLedger || []).filter(l => l.agentId === app.currentUser.id);
        if (ledgerLogs.length === 0) {
          app.showToast("No active session transaction records to export!", "error");
          return;
        }

        let outputText = `== AGENT SUITE ACTIVE SESSION LEDGER REPORT ==\n`;
        outputText += `Active Operator: @${app.currentUser.username}\n`;
        outputText += `Generated Date: ${new Date().toLocaleString()}\n`;
        outputText += `----------------------------------------------\n`;
        
        ledgerLogs.forEach((act, idx) => {
          outputText += `[${idx + 1}] ${new Date(act.timestamp).toLocaleTimeString()} - Player: @${act.targetUser} • Action: ${act.description} • Value: ৳${act.amount} • Commission: ৳${act.commission}\n`;
        });
        outputText += `----------------------------------------------\n`;
        outputText += `Total Earned Commissions in logs: ৳${app.currentUser.earnedCommission || 0}\n`;

        navigator.clipboard.writeText(outputText)
          .then(() => {
            app.showToast("Full session tracker copied to clipboard successfully!", "success");
          })
          .catch(() => {
            app.showToast("Clipboard write permission failure!", "error");
          });
      });
    }

    const agentVerifyBtn = document.getElementById("agent-verify-btn");
    const agentBookingForm = document.getElementById("agent-booking-form");
    const bookingQtyInput = document.getElementById("agent-booking-qty");
    const bookingLotterySelect = document.getElementById("agent-booking-lottery");

    const agentCashDepositForm = document.getElementById("agent-cash-deposit-form");
    const agentCashWithdrawForm = document.getElementById("agent-cash-withdraw-form");
    const btnSubDep = document.getElementById("btn-agent-sub-dep");
    const btnSubWdr = document.getElementById("btn-agent-sub-wdr");

    const agentLogoutBtn = document.getElementById("agent-logout-btn");

    if (agentLogoutBtn) {
      agentLogoutBtn.addEventListener("click", () => {
        app.currentUser = null;
        localStorage.removeItem(app.sessionKey);
        app.showToast("Logged out from agent field workspace successfully.", "info");
        app.render();
      });
    }

    if (agentVerifyBtn) {
      agentVerifyBtn.addEventListener("click", () => {
        const usernameVal = document.getElementById("agent-verify-username").value.trim();
        const resultEl = document.getElementById("agent-verify-result");
        if (!resultEl) return;

        if (!usernameVal) {
          app.showToast("Enter target username first!", "error");
          return;
        }

        const targetUser = app.db.users.find(u => u.username.toLowerCase() === usernameVal.toLowerCase());
        resultEl.classList.remove("hidden");
        if (!targetUser) {
          resultEl.innerHTML = `
            <div class="text-rose-450 flex items-center gap-1 font-sans">
              <i class="fa-solid fa-circle-exclamation"></i> Player Not Found!
            </div>
          `;
          return;
        }

        const joinedDate = targetUser.joinDate || "N/A";

        resultEl.innerHTML = `
          <div class="border-b border-slate-800 pb-1.5 mb-1.5 text-center font-bold text-slate-250 font-sans">
            Profile Search for @${targetUser.username}
          </div>
          <div class="flex justify-between font-mono text-xs">
            <span class="text-slate-500">Wallet Balance:</span>
            <span class="text-emerald-400 font-bold">৳${(targetUser.balance || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between font-mono text-xs">
            <span class="text-slate-500">Email Address:</span>
            <span class="text-slate-300 select-all">${targetUser.email || "N/A"}</span>
          </div>
          <div class="flex justify-between font-mono text-xs">
            <span class="text-slate-500">Phone Mobile Link:</span>
            <span class="text-slate-300 select-all">${targetUser.phone || "N/A"}</span>
          </div>
          <div class="flex justify-between font-mono text-xs">
            <span class="text-slate-500">Registration Date:</span>
            <span class="text-slate-400">${joinedDate}</span>
          </div>
          <div class="flex justify-between font-mono text-xs">
            <span class="text-slate-500">Account Status:</span>
            <span class="uppercase font-bold ${targetUser.status === "active" ? "text-emerald-500" : "text-rose-500"}">${targetUser.status || "active"}</span>
          </div>
          <div class="flex justify-between font-mono text-xs">
            <span class="text-slate-500">dob Age Limit:</span>
            <span class="text-slate-300">${targetUser.dob || "N/A"}</span>
          </div>
        `;
      });
    }

    const recomputeBookingEstimates = () => {
      const lotteryId = bookingLotterySelect ? bookingLotterySelect.value : "";
      const qty = parseInt(bookingQtyInput ? bookingQtyInput.value : 1) || 1;
      const uPriceEl = document.getElementById("agent-book-unit-price");
      const tCostEl = document.getElementById("agent-book-total-cost");
      const estCommEl = document.getElementById("agent-book-est-commission");

      if (!uPriceEl || !tCostEl || !estCommEl) return;

      const lot = app.db.lotteries.find(l => l.id === lotteryId);
      if (!lot) {
        uPriceEl.innerText = "৳0.00";
        tCostEl.innerText = "৳0.00";
        estCommEl.innerText = "৳0.00";
        return;
      }

      const unitPrice = lot.entryFee || 0;
      const totalCost = unitPrice * qty;
      const agentRate = app.currentUser ? (app.currentUser.commissionRate || 5.0) : 5.0;
      const calculatedComm = (totalCost * agentRate) / 100;

      uPriceEl.innerText = `৳${unitPrice.toFixed(2)}`;
      tCostEl.innerText = `৳${totalCost.toFixed(2)}`;
      estCommEl.innerText = `৳${calculatedComm.toFixed(2)}`;
    };

    if (bookingQtyInput) {
      bookingQtyInput.addEventListener("input", recomputeBookingEstimates);
    }
    if (bookingLotterySelect) {
      bookingLotterySelect.addEventListener("change", recomputeBookingEstimates);
    }

    if (agentBookingForm) {
      agentBookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const targetUsername = document.getElementById("agent-booking-user").value.trim();
        const lotteryId = bookingLotterySelect ? bookingLotterySelect.value : "";
        const qty = parseInt(bookingQtyInput ? bookingQtyInput.value : 1) || 1;

        const targetUser = app.db.users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!targetUser) {
          app.showToast(`Invalid username: Target player @${targetUsername} does not exist!`, "error");
          return;
        }

        const lot = app.db.lotteries.find(l => l.id === lotteryId);
        if (!lot) {
          app.showToast("Invalid lottery selection!", "error");
          return;
        }

        const unitPrice = lot.entryFee || 0;
        const totalCost = unitPrice * qty;

        if (targetUser.balance < totalCost) {
          app.showToast(`Booking Failed: Player @${targetUser.username} has insufficient balance (৳${targetUser.balance.toFixed(2)}). Need ৳${totalCost.toFixed(2)}. Please load cash into their wallet first.`, "error");
          return;
        }

        // Deduct player balance
        targetUser.balance -= totalCost;

        // Populate tickets
        if (!app.db.tickets) app.db.tickets = [];
        for (let i = 0; i < qty; i++) {
          const numSeq = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
          app.db.tickets.push({
            id: "t_" + Date.now() + "_" + i,
            userId: targetUser.id,
            lotteryId: lot.id,
            ticketNumber: numSeq,
            purchaseDate: new Date().toISOString(),
            status: "active"
          });
        }

        // Add soldTickets limit
        lot.soldTickets = (lot.soldTickets || 0) + qty;

        // Credit Agent/Sub-Agent Commissions and handle parent Agent Overrides
        const isSubAgent = app.currentUser && app.currentUser.role === "subagent";
        const agentRate = app.currentUser ? (app.currentUser.commissionRate || (isSubAgent ? 3.0 : 5.0)) : 5.0;
        const calculatedComm = (totalCost * agentRate) / 100;
        
        app.currentUser.earnedCommission = (app.currentUser.earnedCommission || 0) + calculatedComm;
        app.currentUser.totalBookings = (app.currentUser.totalBookings || 0) + qty;

        // Store active session modifications also in DB registry users
        const dbAgent = app.db.users.find(u => u.id === app.currentUser.id);
        if (dbAgent) {
          dbAgent.earnedCommission = app.currentUser.earnedCommission;
          dbAgent.totalBookings = app.currentUser.totalBookings;
        }

        // Increment monthly progress if matches target lottery pool
        const myTargetLottery = app.currentUser.monthlyTargetLotteryId || "any";
        if (myTargetLottery === "any" || myTargetLottery === lotteryId) {
          app.currentUser.monthlySalesProgress = (app.currentUser.monthlySalesProgress || 0) + qty;
          if (dbAgent) {
            dbAgent.monthlySalesProgress = app.currentUser.monthlySalesProgress;
          }
        }

        // Trigger monthly target check for current operator
        app.checkAndClaimMonthlyTarget(app.currentUser);

        // Also check if they are a sub-agent and contribute progress to parent agent
        if (isSubAgent && app.currentUser.referredBy) {
          const parentAgent = app.db.users.find(u => u.username.toLowerCase() === app.currentUser.referredBy.toLowerCase() && u.role === "agent");
          if (parentAgent) {
            const parentTargetLottery = parentAgent.monthlyTargetLotteryId || "any";
            if (parentTargetLottery === "any" || parentTargetLottery === lotteryId) {
              parentAgent.monthlySalesProgress = (parentAgent.monthlySalesProgress || 0) + qty;
              app.checkAndClaimMonthlyTarget(parentAgent);
            }
          }
        }

        // Add direct booking activity log
        if (!app.db.agentLedger) app.db.agentLedger = [];
        app.db.agentLedger.push({
          id: "act_" + Date.now(),
          agentId: app.currentUser.id,
          timestamp: new Date().toISOString(),
          targetUser: targetUser.username,
          description: `Booked ticket on ${lot.name} x${qty} Pcs`,
          amount: totalCost,
          commission: calculatedComm
        });

        // Award override commission if logged-in operator is a sub-agent under an active parent agent
        if (isSubAgent && app.currentUser.referredBy) {
          const parentAgent = app.db.users.find(u => u.username.toLowerCase() === app.currentUser.referredBy.toLowerCase() && u.role === "agent");
          if (parentAgent) {
            const parentRate = parentAgent.commissionRate || 5.0;
            const overrideRate = Math.max(0, parentRate - agentRate);
            const overrideCommission = (totalCost * overrideRate) / 100;

            if (overrideCommission > 0) {
              parentAgent.earnedCommission = (parentAgent.earnedCommission || 0) + overrideCommission;
              
              // Log override commission to parent agent's ledger
              app.db.agentLedger.push({
                id: "act_" + Date.now() + "_over",
                agentId: parentAgent.id,
                timestamp: new Date().toISOString(),
                targetUser: targetUser.username,
                description: `Sub-Agent @${app.currentUser.username} Booking Override (${overrideRate.toFixed(1)}% split)`,
                amount: totalCost,
                commission: overrideCommission
              });

              // Send system notification/message to parent agent
              if (!app.db.messages) app.db.messages = [];
              app.db.messages.push({
                id: "msg_auto_" + Date.now() + "_" + Math.floor(Math.random() * 99),
                recipientType: "specific",
                targetUsername: parentAgent.username,
                category: "bonus",
                subject: `💸 Sub-Agent Override Gained: +৳${overrideCommission.toFixed(2)}!`,
                content: `Your Sub-Agent @${app.currentUser.username} just booked ${qty} tickets for @${targetUser.username} on ${lot.name}. You earned an override commission of ৳${overrideCommission.toFixed(2)} (${overrideRate.toFixed(1)}% split)!`,
                date: new Date().toISOString(),
                readBy: []
              });
            }
          }
        }

        app.saveDB();
        app.showToast(`Executed Order! Successfully booked ${qty} tickets for @${targetUser.username}. Earned ৳${calculatedComm.toFixed(2)} commission!`, "success");
        agentBookingForm.reset();
        recomputeBookingEstimates();
        app.renderAgentWorkspace();
      });
    }

    if (btnSubDep && btnSubWdr) {
      btnSubDep.addEventListener("click", () => {
        btnSubDep.className = "flex-1 py-1.5 rounded-lg text-center text-[10.5px] font-black cursor-pointer transition bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md";
        btnSubWdr.className = "flex-1 py-1.5 rounded-lg text-center text-[10.5px] font-black cursor-pointer transition text-slate-400 hover:text-white";
        document.getElementById("agent-cash-deposit-form").classList.remove("hidden");
        document.getElementById("agent-cash-withdraw-form").classList.add("hidden");
      });

      btnSubWdr.addEventListener("click", () => {
        btnSubWdr.className = "flex-1 py-1.5 rounded-lg text-center text-[10.5px] font-black cursor-pointer transition bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md";
        btnSubDep.className = "flex-1 py-1.5 rounded-lg text-center text-[10.5px] font-black cursor-pointer transition text-slate-400 hover:text-white";
        document.getElementById("agent-cash-deposit-form").classList.add("hidden");
        document.getElementById("agent-cash-withdraw-form").classList.remove("hidden");
      });
    }

    if (agentCashDepositForm) {
      agentCashDepositForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const targetUsername = document.getElementById("agent-cash-dep-username").value.trim();
        const amount = parseFloat(document.getElementById("agent-cash-dep-amount").value || "0");

        if (amount < 10) {
          app.showToast("Minimum wallet load is 10 Taka!", "error");
          return;
        }

        const targetUser = app.db.users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!targetUser) {
          app.showToast(`Invalid Player: Target player @${targetUsername} does not exist!`, "error");
          return;
        }

        // Dedect from agent funds
        if (app.currentUser.balance < amount) {
          app.showToast(`Load Failed: Insufficient Agent Wallet funds (Current Balance: ৳${app.currentUser.balance.toFixed(2)}). Contact Administrator for Agent Wallet limit refill!`, "error");
          return;
        }

        // Perform balance shift
        app.currentUser.balance -= amount;
        targetUser.balance = (targetUser.balance || 0) + amount;
        // Keep DB user record matching current active agent session
        const dbAgent = app.db.users.find(u => u.id === app.currentUser.id);
        if (dbAgent) {
          dbAgent.balance = app.currentUser.balance;
        }

        // Record a deposit ledger transaction as automatically approved
        if (!app.db.deposits) app.db.deposits = [];
        app.db.deposits.push({
          id: "dep_" + Date.now(),
          userId: targetUser.id,
          username: targetUser.username,
          gateway: "Agent Funds Assistance",
          amount: amount,
          txid: "AGN-DEP-" + Math.floor(Math.random() * 100000),
          status: "approved",
          date: new Date().toISOString()
        });

        // Log Agent activity ledger
        if (!app.db.agentLedger) app.db.agentLedger = [];
        app.db.agentLedger.push({
          id: "act_" + Date.now(),
          agentId: app.currentUser.id,
          timestamp: new Date().toISOString(),
          targetUser: targetUser.username,
          description: "Wallet Cash Deposit (Load assisted)",
          amount: amount,
          commission: 0
        });

        app.saveDB();
        app.showToast(`Successfully loaded ৳${amount.toFixed(2)} cash into @${targetUser.username}'s wallet. Agent Limit deducted.`, "success");
        agentCashDepositForm.reset();
        app.renderAgentWorkspace();
      });
    }

    if (agentCashWithdrawForm) {
      agentCashWithdrawForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const targetUsername = document.getElementById("agent-cash-wdr-username").value.trim();
        const amount = parseFloat(document.getElementById("agent-cash-wdr-amount").value || "0");
        const enteredOTP = document.getElementById("agent-cash-wdr-otp").value.trim();

        if (amount < 10) {
          app.showToast("Minimum cash out is 10 Taka!", "error");
          return;
        }

        if (!enteredOTP) {
          app.showToast("Please enter the 6-Digit Player Cashout OTP to proceed!", "error");
          return;
        }

        const targetUser = app.db.users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!targetUser) {
          app.showToast(`Invalid Player: Target player @${targetUsername} does not exist!`, "error");
          return;
        }

        // Verify player is active and has sufficient wallet balance
        if (targetUser.balance < amount) {
          app.showToast(`Cashout Failed: Player @${targetUser.username} has insufficient wallet balance (৳${targetUser.balance.toFixed(2)})!`, "error");
          return;
        }

        // --- SECURE OTP VERIFICATION ---
        const otpData = targetUser.cashoutOTP;
        if (!otpData) {
          app.showToast(`OTP Verification Failed: No active OTP code found for @${targetUser.username}. Ask them to generate one first on their profile.`, "error");
          return;
        }

        if (otpData.used) {
          app.showToast(`OTP Verification Failed: This OTP has already been used to deduct balance! Player must generate a new OTP.`, "error");
          return;
        }

        if (Date.now() > otpData.expiresAt) {
          app.showToast(`OTP Verification Failed: This OTP code has expired! Ask the player to generate a fresh one.`, "error");
          return;
        }

        if (otpData.code !== enteredOTP) {
          app.showToast(`OTP Verification Failed: Invalid 6-digit code! Please double-check with the player.`, "error");
          return;
        }

        // Mark OTP as used so it cannot be re-used under any circumstance within the 30 seconds
        otpData.used = true;

        // Perform balance deduction and physically reward offline cash
        targetUser.balance -= amount;

        // Save latest deduction details to trigger the 5-second popup on targetUser's panel in real-time
        targetUser.latestDeductionNotification = {
          id: "deduct_" + Date.now() + "_" + Math.floor(Math.random() * 100),
          amount: amount,
          agentUsername: app.currentUser.username,
          timestamp: new Date().toISOString()
        };

        // Record a withdrawal ledger transaction
        if (!app.db.withdrawals) app.db.withdrawals = [];
        app.db.withdrawals.push({
          id: "wdr_" + Date.now(),
          userId: targetUser.id,
          username: targetUser.username,
          gateway: "Agent Assisted Cashout",
          method: "Agent Assisted Cashout",
          targetAccount: targetUser.phone || targetUser.username,
          amount: amount,
          phone: targetUser.phone,
          status: "approved",
          date: new Date().toISOString()
        });

        // Log Agent activity ledger
        if (!app.db.agentLedger) app.db.agentLedger = [];
        app.db.agentLedger.push({
          id: "act_" + Date.now(),
          agentId: app.currentUser.id,
          timestamp: new Date().toISOString(),
          targetUser: targetUser.username,
          description: `Assisted offline Cashout (Verified with OTP: ${enteredOTP})`,
          amount: amount,
          commission: 0
        });

        app.saveDB();
        app.showToast(`Cashout approved! Deducted ৳${amount.toFixed(2)} from @${targetUser.username}. Hand physical money over to the player now.`, "success");
        agentCashWithdrawForm.reset();
        app.renderAgentWorkspace();
      });
    }
  }
};
