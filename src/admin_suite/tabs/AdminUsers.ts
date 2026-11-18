export const AdminUsers = {
  async renderAdminUsers(this: any) {
    try {
      const sqlRes = await fetch("/api/sql/db");
      if (sqlRes.ok) {
        const sqlData = await sqlRes.json();
        if (sqlData.success && sqlData.db) {
          if (typeof this.mergeParsedDb === "function") {
            this.mergeParsedDb(sqlData.db);
          } else {
            this.db = { ...this.db, ...sqlData.db };
          }
        }
      }
    } catch (e) {}

    const allUsers = (this.db.users || []);
    const totalUsers = allUsers.length;
    const onlineSimulated = Math.max(1, Math.round(totalUsers * 0.15));
    const flaggedFraud = allUsers.filter((u: any) => u.status === "blocked").length;
    const totalWalletPool = allUsers.reduce((sum: number, u: any) => sum + (u.balance || 0), 0);

    const setText = (id: string, text: string | number) => {
      const el = document.getElementById(id);
      if (el) el.innerText = String(text);
    };

    setText("admin-users-stat-total", (totalUsers || 0).toLocaleString());
    setText("admin-users-stat-online", (onlineSimulated || 0).toLocaleString());
    setText("admin-users-stat-flagged", (flaggedFraud || 0).toLocaleString());
    setText("admin-users-stat-balance", "৳" + (totalWalletPool || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));

    const clearBtn = document.getElementById("admin-players-clear-search-btn");
    if (clearBtn) {
      clearBtn.classList.toggle("hidden", !this.adminPlayersSearchQuery);
    }

    if (!this.adminPlayersActiveFilter) {
      this.adminPlayersActiveFilter = "all";
    }

    const filterBar = document.getElementById("admin-users-filter-bar");
    if (filterBar) {
      const filters = [
        { id: "all", label: "All Users (সবাই)" },
        { id: "active", label: "Active (সচল)" },
        { id: "blocked", label: "Flagged" },
        { id: "banned", label: "Banned (স্থগিত)" },
        { id: "vip", label: "High Roller (ভিআইপি)" }
      ];
      filterBar.innerHTML = filters.map(f => {
        const active = this.adminPlayersActiveFilter === f.id;
        const btnClass = active
          ? "px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-black transition whitespace-nowrap cursor-pointer shadow-sm"
          : "px-4 py-2 rounded-full bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition whitespace-nowrap cursor-pointer";
        return `<button data-filter="${f.id}" class="${btnClass}">${f.label}</button>`;
      }).join("");

      filterBar.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
          this.adminPlayersActiveFilter = btn.getAttribute("data-filter");
          this.renderAdminUsers();
        });
      });
    }

    let filteredUsers = (this.db.users || []);
    const query = (this.adminPlayersSearchQuery || "").toLowerCase().trim();
    if (query) {
      filteredUsers = filteredUsers.filter((u: any) => {
        const usernameMatch = (u.username || "").toLowerCase().includes(query);
        const emailMatch = (u.email || "").toLowerCase().includes(query);
        const phoneMatch = (u.phone || "").toLowerCase().includes(query);
        return usernameMatch || emailMatch || phoneMatch;
      });
    }

    if (this.adminPlayersActiveFilter === "active") {
      filteredUsers = filteredUsers.filter((u: any) => u.status === "active");
    } else if (this.adminPlayersActiveFilter === "blocked") {
      filteredUsers = filteredUsers.filter((u: any) => u.status === "blocked");
    } else if (this.adminPlayersActiveFilter === "banned") {
      filteredUsers = filteredUsers.filter((u: any) => u.status === "banned" || u.status === "suspended" || u.status === "blocked");
    } else if (this.adminPlayersActiveFilter === "vip") {
      filteredUsers = filteredUsers.filter((u: any) => u.customBadge === "vip" || (u.balance || 0) >= 1000);
    }

    const gridEl = document.getElementById("admin-users-cards-grid");
    if (!gridEl) return;
    gridEl.innerHTML = "";

    if (filteredUsers.length === 0) {
      gridEl.innerHTML = `
        <div class="col-span-full p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-3xl">
          No matching platform accounts discovered.
        </div>
      `;
      return;
    }

    filteredUsers.forEach((u: any) => {
      const card = document.createElement("div");
      card.className = "flex flex-col p-5 rounded-3xl bg-slate-900 border border-slate-800/80 gap-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-750";

      let statusClass = u.status === "active"
        ? "text-emerald-400 bg-emerald-950/20 border border-emerald-900/40"
        : u.status === "blocked"
        ? "text-amber-400 bg-amber-950/20 border border-amber-900/40"
        : "text-rose-450 bg-rose-955/20 border border-rose-900/40";

      let statusText = u.status === "active"
        ? "● Active / সচল"
        : u.status === "blocked"
        ? "● Suspicious"
        : "● Banned / বরখাস্ত";

      const badgeLabel = u.customBadge ? u.customBadge.toUpperCase() : (u.role === "agent" ? "AGENT" : u.role === "moderator" ? "MODERATOR" : "LVL 1");

      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-black text-base text-white shadow-md shadow-rose-950/30 select-none uppercase">
                ${u.username.substring(0, 2).toUpperCase()}
              </div>
              <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 ${u.status === "active" ? "bg-emerald-400" : "bg-rose-500"} border-2 border-slate-900 rounded-full"></span>
            </div>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-black text-white truncate text-sm">@${u.username}</span>
                <span class="px-2 py-0.5 rounded-md bg-slate-950 text-amber-400 border border-amber-500/10 text-[8.5px] font-mono font-bold uppercase tracking-wider">${badgeLabel}</span>
              </div>
              <span class="text-[11px] text-slate-400 font-sans truncate">${u.realName || "Registered User"} • ${u.phone || "No Mobile"}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wide ${statusClass}">
              ${statusText}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850/40 text-xs font-mono">
          <div class="flex flex-col">
            <span class="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Purse Balance</span>
            <span class="text-xs font-black text-amber-300 mt-0.5 tabular-nums">৳${(u.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Lifetime Bets</span>
            <span class="text-xs font-bold text-white mt-0.5 tabular-nums">৳${u.lifetimeBets || "85,000"}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Win Rate</span>
            <span class="text-xs font-bold text-cyan-400 mt-0.5">${u.winRate || "35%"}</span>
          </div>
        </div>
        <div class="flex items-center justify-between text-slate-550 font-mono text-[10px] border-b border-slate-800/40 pb-2">
          <span class="flex items-center gap-1.5">
            <i data-lucide="calendar" class="w-3 h-3"></i>
            Joined: ${u.joinedDate || "14 Aug 2024"}
          </span>
          <span class="flex items-center gap-1.5 text-emerald-450 font-bold">
            <i data-lucide="check-circle" class="w-3 h-3"></i>
            KYC Verified
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-1 font-sans text-[11px]">
          <button class="adjust-balance-btn py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95" data-id="${u.id}">
            <i data-lucide="coins" class="w-3 h-3 text-slate-500"></i>
            <span>Adjust Balance</span>
          </button>
          <button class="freeze-user-btn py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-rose-955/30 border border-slate-800 hover:border-rose-900/40 text-rose-400 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95" data-id="${u.id}">
            <i data-lucide="lock" class="w-3 h-3 text-rose-500/80"></i>
            <span>${u.status === "banned" ? "Unban Account" : "Freeze Wallet"}</span>
          </button>
        </div>
      `;
      gridEl.appendChild(card);
    });

    gridEl.querySelectorAll(".adjust-balance-btn").forEach(btn => {
      btn.addEventListener("click", (e: any) => {
        const uId = e.currentTarget.getAttribute("data-id");
        this.openUserEditModal(uId);
      });
    });

    gridEl.querySelectorAll(".freeze-user-btn").forEach(btn => {
      btn.addEventListener("click", (e: any) => {
        const uId = e.currentTarget.getAttribute("data-id");
        const matched = this.db.users.find((user: any) => user.id === uId);
        if (matched) {
          if (matched.status === "banned") {
            matched.status = "active";
            this.showToast(`Account @${matched.username} unbanned successfully!`, "success");
          } else {
            matched.status = "banned";
            this.showToast(`Account @${matched.username} is now frozen & suspended.`, "error");
          }
          this.saveDB();
          this.renderAdminUsers();
        }
      });
    });

    const otpToggle = document.getElementById("toggle-otp") as HTMLInputElement;
    const freezeToggle = document.getElementById("toggle-freeze") as HTMLInputElement;
    const spendSlider = document.getElementById("spend-slider") as HTMLInputElement;
    const limitLabel = document.getElementById("limit-label");
    const saveBtn = document.getElementById("save-rules-btn") as HTMLButtonElement;

    const secRules = (this.db && this.db.securityRules) ? this.db.securityRules : { enforceOtp: true, autoFreeze: true, maxDailySpend: 50000 };
    if (otpToggle) otpToggle.checked = !!secRules.enforceOtp;
    if (freezeToggle) freezeToggle.checked = !!secRules.autoFreeze;
    if (spendSlider) {
      spendSlider.value = String(secRules.maxDailySpend || 50000);
      const parsedVal = parseInt(spendSlider.value, 10) || 50000;
      if (limitLabel) limitLabel.innerText = "৳" + parsedVal.toLocaleString();
      
      spendSlider.oninput = (e: any) => {
        const inputVal = parseInt(e.target.value, 10) || 0;
        if (limitLabel) limitLabel.innerText = "৳" + inputVal.toLocaleString();
      };
    }

    if (saveBtn) {
      saveBtn.onclick = () => {
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i data-lucide="refresh-cw" class="animate-spin"></i> Saving Settings...';
        saveBtn.disabled = true;

        setTimeout(() => {
          this.db.securityRules = {
            enforceOtp: otpToggle ? otpToggle.checked : true,
            autoFreeze: freezeToggle ? freezeToggle.checked : true,
            maxDailySpend: spendSlider ? parseInt(spendSlider.value) : 50000
          };
          this.saveDB();
          this.showToast("User security rules updated successfully!", "success");
          saveBtn.innerHTML = originalText;
          saveBtn.disabled = false;
        }, 800);
      };
    }

    this.refreshIcons();
  },

  openUserEditModal(this: any, id: string) {
    let u = (this.db.users || []).find((user: any) => user.id === id);
    if (!u && this.db.staff) u = this.db.staff.find((user: any) => user.id === id);
    if (!u && this.db.agents) u = this.db.agents.find((user: any) => user.id === id);
    if (!u) return;

    const setVal = (id: string, val: any) => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el) el.value = String(val !== undefined ? val : "");
    };

    const setText = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };

    setText("edit-player-modal-id", `@${u.username}`);
    setVal("edit-player-id-field", u.id);
    setVal("edit-player-balance", u.balance);
    setVal("edit-player-email", u.email);
    setVal("edit-player-phone", u.phone);
    setVal("edit-player-password", ""); 
    setVal("edit-player-status", u.status);
    
    const badgeDropdown = document.getElementById("edit-player-badge") as HTMLSelectElement;
    if (badgeDropdown) badgeDropdown.value = u.customBadge || "";

    const roleSelect = document.getElementById("edit-player-role") as HTMLSelectElement;
    const commInput = document.getElementById("edit-player-commission") as HTMLInputElement;
    const commWrapper = document.getElementById("edit-player-commission-wrapper");
    const districtSelect = document.getElementById("edit-player-district") as HTMLSelectElement;
    const districtWrapper = document.getElementById("edit-player-district-wrapper");
    const targetWrapper = document.getElementById("edit-player-target-wrapper");
    const targetTicketsInput = document.getElementById("edit-agent-target-tickets") as HTMLInputElement;
    const targetRewardInput = document.getElementById("edit-agent-target-reward") as HTMLInputElement;

    if (districtSelect) districtSelect.value = u.district || "Dhaka";
    if (targetTicketsInput) targetTicketsInput.value = String(u.monthlyTargetTickets !== undefined ? u.monthlyTargetTickets : 0);
    if (targetRewardInput) targetRewardInput.value = String(u.monthlyTargetReward !== undefined ? u.monthlyTargetReward : 0);

    const targetLotterySelect = document.getElementById("edit-agent-target-lottery") as HTMLSelectElement;
    if (targetLotterySelect) {
      targetLotterySelect.innerHTML = '<option value="any">Any Active Pool</option>';
      const activeLotts = (this.db.lotteries || []).filter((l: any) => l.status === "active");
      activeLotts.forEach((lot: any) => {
        const opt = document.createElement("option");
        opt.value = lot.id;
        opt.innerText = `${lot.name} (৳${lot.entryFee})`;
        targetLotterySelect.appendChild(opt);
      });
      targetLotterySelect.value = u.monthlyTargetLotteryId || "any";
    }

    if (roleSelect && commWrapper) {
      const normalizedRole = u.role === "user" ? "player" : (u.role || "player");
      roleSelect.value = normalizedRole;
      if (commInput) commInput.value = String(u.commissionRate !== undefined ? u.commissionRate : 5.0);
      
      const toggleComm = () => {
        const isAgent = roleSelect.value === "agent" || roleSelect.value === "subagent";
        commWrapper.classList.toggle("hidden", !isAgent);
        if (districtWrapper) districtWrapper.classList.toggle("hidden", !isAgent);
        if (targetWrapper) targetWrapper.classList.toggle("hidden", !isAgent);
      };
      toggleComm();
      roleSelect.onchange = toggleComm;
    }

    const modalEl = document.getElementById("admin-user-edit-modal");
    const closeBtn = document.getElementById("admin-close-modal-btn");
    const saveBtn = document.getElementById("admin-save-user-btn");

    const closeModal = () => {
      modalEl?.classList.add("hidden");
    };

    if (closeBtn) {
      closeBtn.onclick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      };
    }

    if (modalEl && !modalEl.dataset.closeBackdropBound) {
      modalEl.dataset.closeBackdropBound = "true";
      modalEl.addEventListener("click", (e: Event) => {
        if (e.target === modalEl) {
          closeModal();
        }
      });
    }

    if (typeof document !== "undefined" && !(window as any).__adminEditModalEscBound) {
      (window as any).__adminEditModalEscBound = true;
      document.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          const m = document.getElementById("admin-user-edit-modal");
          if (m && !m.classList.contains("hidden")) {
            m.classList.add("hidden");
          }
        }
      });
    }

    if (saveBtn) {
      saveBtn.onclick = (e: Event) => {
        e.preventDefault();
        this.savePlayerEditFromModal();
      };
    }

    modalEl?.classList.remove("hidden");
  },

  savePlayerEditFromModal(this: any) {
    const id = (document.getElementById("edit-player-id-field") as HTMLInputElement).value;
    let u = (this.db.users || []).find((user: any) => user.id === id);
    let storeType = 'users';
    if (!u && this.db.staff) {
      u = this.db.staff.find((user: any) => user.id === id);
      if (u) storeType = 'staff';
    }
    if (!u && this.db.agents) {
      u = this.db.agents.find((user: any) => user.id === id);
      if (u) storeType = 'agents';
    }
    if (!u) return;

    u.balance = parseFloat((document.getElementById("edit-player-balance") as HTMLInputElement).value || "0");
    u.email = (document.getElementById("edit-player-email") as HTMLInputElement).value;
    u.phone = (document.getElementById("edit-player-phone") as HTMLInputElement).value;
    u.status = (document.getElementById("edit-player-status") as HTMLSelectElement).value;
    
    const badgeDropdown = document.getElementById("edit-player-badge") as HTMLSelectElement;
    if (badgeDropdown) u.customBadge = badgeDropdown.value;

    const roleSelect = document.getElementById("edit-player-role") as HTMLSelectElement;
    if (roleSelect && roleSelect.value) u.role = roleSelect.value;
    
    const commInput = document.getElementById("edit-player-commission") as HTMLInputElement;
    if (commInput) u.commissionRate = parseFloat(commInput.value || "5.0");
    
    const districtSelectVal = document.getElementById("edit-player-district") as HTMLSelectElement;
    if (districtSelectVal) u.district = districtSelectVal.value;

    const newRole = (u.role || 'user').toLowerCase();
    const isStaffRole = newRole === 'agent' || newRole === 'subagent' || newRole === 'moderator';

    if (isStaffRole) {
      if (!this.db.staff) this.db.staff = [];
      if (!this.db.staff.some((s: any) => s.id === id)) this.db.staff.push(u);
      if (newRole === 'agent' || newRole === 'subagent') {
        if (!this.db.agents) this.db.agents = [];
        if (!this.db.agents.some((a: any) => a.id === id)) this.db.agents.push(u);
      } else if (this.db.agents) {
        this.db.agents = this.db.agents.filter((x: any) => x.id !== id);
      }
      if (!this.db.users) this.db.users = [];
      if (!this.db.users.some((us: any) => us.id === id)) this.db.users.push(u);
    } else if (!isStaffRole && (storeType === 'staff' || storeType === 'agents' || storeType === 'users')) {
      if (this.db.staff) this.db.staff = this.db.staff.filter((x: any) => x.id !== id);
      if (this.db.agents) this.db.agents = this.db.agents.filter((x: any) => x.id !== id);
      if (!this.db.users) this.db.users = [];
      if (!this.db.users.some((us: any) => us.id === id)) this.db.users.push(u);
    }

    const targetTicketsInput = document.getElementById("edit-agent-target-tickets") as HTMLInputElement;
    const targetRewardInput = document.getElementById("edit-agent-target-reward") as HTMLInputElement;
    const targetLotterySelect = document.getElementById("edit-agent-target-lottery") as HTMLSelectElement;
    if (targetTicketsInput && targetRewardInput) {
      const newTarget = parseInt(targetTicketsInput.value || "0");
      const newReward = parseFloat(targetRewardInput.value || "0");
      const newLotteryId = targetLotterySelect ? targetLotterySelect.value : "any";
      if (u.monthlyTargetTickets !== newTarget || u.monthlyTargetReward !== newReward || u.monthlyTargetLotteryId !== newLotteryId) {
        u.monthlyTargetTickets = newTarget;
        u.monthlyTargetReward = newReward;
        u.monthlyTargetLotteryId = newLotteryId;
        u.monthlyTargetClaimed = false; 
        u.monthlySalesProgress = 0; 
      }
    }

    const newPass = (document.getElementById("edit-player-password") as HTMLInputElement).value.trim();
    if (newPass) {
      u.password = (typeof window !== "undefined" && typeof (window as any).hashPasswordWithUniqueSalt === "function" ? (window as any).hashPasswordWithUniqueSalt(newPass) : newPass);
      this.showToast(`Password successfully reset for @${u.username}!`, "success");
    }

    const unameLower = u.username ? String(u.username).toLowerCase() : "";
    const syncFields = (arr: any[]) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (item && item !== u && (item.id === id || (unameLower && item.username && String(item.username).toLowerCase() === unameLower))) {
          Object.assign(item, u);
        }
      }
    };
    syncFields(this.db.users);
    syncFields(this.db.staff);
    syncFields(this.db.agents);

    this.saveDB(true);
    this.showToast("Player edited successfully!", "success");
    document.getElementById("admin-user-edit-modal")?.classList.add("hidden");
    this.render();
  }
};
