import { removeCircularReferences, safeStringify } from "./utils";

export interface SessionModule {
  sessionKey: string;
  adminSessionKey: string;
  db: any;
  currentUser: any;
  isAdminMode: boolean;
  render: () => void;
  showToast: (m: string, t: string) => void;
}

export function loadSession(state: SessionModule) {
  let savedUser = localStorage.getItem(state.sessionKey);
  if (savedUser) {
    try {
      const userObj = JSON.parse(savedUser);
      const unameLower = userObj.username ? String(userObj.username).toLowerCase() : "";
      const allRecords = [
        ...(Array.isArray(state.db?.users) ? state.db.users : []),
        ...(Array.isArray(state.db?.staff) ? state.db.staff : []),
        ...(Array.isArray(state.db?.agents) ? state.db.agents : [])
      ].filter((u: any) => u && (
        (userObj.id && String(u.id) === String(userObj.id)) ||
        (unameLower && u.username && String(u.username).toLowerCase() === unameLower)
      ));

      if (allRecords.length > 0) {
        const matched = allRecords.reduce((acc: any, item: any) => {
          const next = { ...acc };
          for (const [k, v] of Object.entries(item)) {
            if (v !== undefined && v !== null && v !== "") next[k] = v;
          }
          if (item.role === "agent" || item.role === "subagent" || item.role === "admin") {
            next.role = item.role;
          }
          return next;
        }, {});
        if ((!matched.role || matched.role === "user" || matched.role === "player") && (userObj.role === "agent" || userObj.role === "subagent")) {
          matched.role = userObj.role;
        }
        state.currentUser = matched;
        if (state.currentUser.role === "admin" || state.currentUser.username?.toLowerCase() === "admin") {
          state.currentUser.role = "admin";
          state.isAdminMode = true;
          localStorage.setItem("lw_admin_mode", "true");
        } else {
          state.isAdminMode = false;
        }
      } else if (userObj.username && userObj.username.toLowerCase() === "admin") {
        userObj.role = "admin";
        state.currentUser = userObj;
        state.isAdminMode = true;
        localStorage.setItem("lw_admin_mode", "true");
      } else {
        localStorage.removeItem(state.sessionKey);
      }
    } catch (e) {
      localStorage.removeItem(state.sessionKey);
    }
  }

  let savedAdmin = localStorage.getItem(state.adminSessionKey);
  if (savedAdmin === "true" && (!state.currentUser || state.currentUser.role === "admin" || state.currentUser.username?.toLowerCase() === "admin")) {
    state.isAdminMode = true;
  } else if (state.currentUser && state.currentUser.role !== "admin" && state.currentUser.username?.toLowerCase() !== "admin") {
    state.isAdminMode = false;
  }

  reconcileBonusBalance(state);
}

export function reconcileBonusBalance(state: SessionModule) {
  if (!state.currentUser || !state.db) return;
  const user = state.currentUser;
  const currentBal = Number(user.balance) || 0;
  
  if (Array.isArray(state.db.transactions)) {
    const bonusTx = state.db.transactions.find((t: any) => 
      (t.userId === user.id || (t.username && user.username && t.username.toLowerCase() === user.username.toLowerCase())) &&
      (t.type === "bonus" || (t.description && t.description.toLowerCase().includes("bonus")))
    );
    if (bonusTx && Number(bonusTx.amount) > 0) {
      const debits = state.db.transactions
        .filter((t: any) => (t.userId === user.id || (t.username && user.username && t.username.toLowerCase() === user.username.toLowerCase())) && (t.type === "debit" || t.transactionType === "Withdrawal"))
        .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);
      
      const expectedMinBal = Math.max(0, Number(bonusTx.amount) - debits);
      if (currentBal < expectedMinBal) {
        user.balance = expectedMinBal;
        const dbUser = (state.db.users || []).find((u: any) => u.id === user.id || (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase()));
        if (dbUser) dbUser.balance = expectedMinBal;
        localStorage.setItem(state.sessionKey, safeStringify(user));
        if (typeof (state as any).saveDB === "function") (state as any).saveDB();
      }
    }
  }
}

export function completeLogin(state: any, user: any) {
  state.currentUser = removeCircularReferences(user);
  const role = String(state.currentUser?.role || "").toLowerCase();
  const isAdmin = role === "admin" || state.currentUser?.username?.toLowerCase() === "admin";
  const isAgent = role === "agent" || role === "subagent";

  if (isAdmin) {
    state.currentUser.role = "admin";
    state.isAdminMode = true;
    localStorage.setItem("lw_admin_mode", "true");
    localStorage.setItem("lw_admin_session", "true");
  } else {
    state.isAdminMode = false;
    localStorage.removeItem("lw_admin_mode");
    localStorage.removeItem("lw_admin_session");
  }

  reconcileBonusBalance(state);
  localStorage.setItem(state.sessionKey, safeStringify(state.currentUser));

  if (!isAdmin && !isAgent) {
    const validTabs = [
      "home", "events", "tickets", "wallet", "deposit", "withdraw", "agent", 
      "history", "profile", "edit-profile", "settings", "customizer", "badge-request", 
      "refer", "jackpot", "tasks", "otp", "recovery", "video-bounty", "games", 
      "blog", "payment-success", "payment-cancel", "store"
    ];
    if (!state.currentTab || !validTabs.includes(state.currentTab)) {
      state.currentTab = "home";
      try {
        if (window.location.hash !== "#home") {
          history.replaceState({ tab: "home" }, "", "#home");
        }
      } catch (e) {}
    }
  } else if (isAgent) {
    try {
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    } catch (e) {}
  }

  state.showToast(`Login Successful! Welcome back, @${user.username}!`, "success");

  const applyPostLoginScreen = () => {
    if (!state.currentUser) return;
    const auth = document.getElementById("screen-auth");
    const splash = document.getElementById("splash-screen");
    const dashboard = document.getElementById("screen-dashboard");
    const adminScreen = document.getElementById("screen-admin");
    const agentScreen = document.getElementById("screen-agent");

    if (auth) {
      auth.classList.add("hidden");
      auth.style.display = "none";
    }
    if (splash) {
      splash.classList.add("hidden");
      splash.style.display = "none";
    }

    if (isAdmin) {
      if (adminScreen) {
        adminScreen.classList.remove("hidden");
        adminScreen.style.display = "flex";
      }
      if (dashboard) {
        dashboard.classList.add("hidden");
        dashboard.style.display = "none";
      }
      if (agentScreen) {
        agentScreen.classList.add("hidden");
        agentScreen.style.display = "none";
      }
      state.render();
      return;
    }

    if (isAgent) {
      if (agentScreen) {
        agentScreen.classList.remove("hidden");
        agentScreen.style.display = "flex";
        agentScreen.style.opacity = "1";
        agentScreen.style.visibility = "visible";
      }
      if (dashboard) {
        dashboard.classList.add("hidden");
        dashboard.style.display = "none";
      }
      if (adminScreen) {
        adminScreen.classList.add("hidden");
        adminScreen.style.display = "none";
      }
      state.render();
      return;
    }

    // Standard Player Dashboard
    const mainArea = dashboard?.querySelector('main');
    if (dashboard) {
      dashboard.classList.remove("hidden");
      dashboard.style.display = "flex";
      dashboard.style.opacity = "1";
      dashboard.style.visibility = "visible";
    }
    if (mainArea) {
      mainArea.classList.remove("hidden");
      (mainArea as HTMLElement).style.display = "block";
    }
    if (agentScreen) {
      agentScreen.classList.add("hidden");
      agentScreen.style.display = "none";
    }
    if (adminScreen) {
      adminScreen.classList.add("hidden");
      adminScreen.style.display = "none";
    }

    if (!state.currentTab) state.currentTab = "home";
    const tabEl = document.getElementById(`tab-${state.currentTab}`);
    if (tabEl) {
      tabEl.classList.remove("hidden");
      tabEl.style.display = "block";
    }

    state.render();
  };

  applyPostLoginScreen();
  setTimeout(applyPostLoginScreen, 100);
  setTimeout(applyPostLoginScreen, 500);
}

export function logout(state: any) {
  console.log("[Auth] Executing full account logout...");
  
  // 1. Clear session memory
  state.currentUser = null;
  state.isAdminMode = false;
  state.currentTab = "home";
  state.activeSubTab = "overview";

  // 2. Clear persisted browser storage
  try {
    localStorage.removeItem(state.sessionKey || "lw_user_session");
    localStorage.removeItem("lw_admin_mode");
    localStorage.removeItem(state.adminSessionKey || "lw_admin_session");
    localStorage.removeItem("lw_agent_active_tab");
    localStorage.removeItem("agent_active_tab");
  } catch (e) {
    console.warn("Storage removal notice:", e);
  }

  // 3. Clear URL hash if any
  try {
    if (window.location.hash) {
      history.replaceState({ tab: "home" }, "", window.location.pathname);
    }
  } catch (e) {}

  // 4. Close any open dialogs or overlays
  const modalsToClose = [
    "credModal", 
    "profile-edit-modal", 
    "cloud-sync-modal", 
    "two-factor-auth-modal", 
    "deposit-amount-modal",
    "lottery-refund-apology-modal"
  ];
  modalsToClose.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add("hidden");
      el.style.display = "none";
    }
  });

  // 5. Hide dashboard, admin, agent screens and unhide auth screen
  const screenDashboard = document.getElementById("screen-dashboard");
  const screenAdmin = document.getElementById("screen-admin");
  const screenAgent = document.getElementById("screen-agent");
  const screenMaintenance = document.getElementById("screen-maintenance");
  const screenBlog = document.getElementById("screen-blog");
  const screenSplash = document.getElementById("splash-screen");
  const screenAuth = document.getElementById("screen-auth");

  if (screenDashboard) {
    screenDashboard.classList.add("hidden");
    screenDashboard.style.display = "none";
  }
  if (screenAdmin) {
    screenAdmin.classList.add("hidden");
    screenAdmin.style.display = "none";
  }
  if (screenAgent) {
    screenAgent.classList.add("hidden");
    screenAgent.style.display = "none";
  }
  if (screenMaintenance) {
    screenMaintenance.classList.add("hidden");
    screenMaintenance.style.display = "none";
  }
  if (screenBlog) {
    screenBlog.classList.add("hidden");
    screenBlog.style.display = "none";
  }
  if (screenSplash) {
    screenSplash.classList.add("hidden");
    screenSplash.style.display = "none";
  }

  if (screenAuth) {
    screenAuth.classList.remove("hidden");
    screenAuth.style.display = "flex";
    screenAuth.style.opacity = "1";
    screenAuth.style.visibility = "visible";
  }

  // Switch to signin/login tab in auth portal
  if (typeof (window as any).switchTab === "function") {
    (window as any).switchTab("signin");
  } else if (typeof (window as any).switchAuthTab === "function") {
    (window as any).switchAuthTab("login");
  }

  // 6. Provide user feedback and render
  if (typeof state.showToast === "function") {
    state.showToast("Logged out successfully! / সফলভাবে লগআউট সম্পন্ন হয়েছে।", "info");
  }

  if (typeof state.render === "function") {
    state.render();
  }
}

