/**
 * Early Core UI & Utility Logic
 * 
 * Extracted from index.html to improve maintainability and resolve "file too large" errors.
 * These handlers are needed early in the lifecycle for inline HTML onclick events.
 */

export function initEarlyLogic() {
  /**
   * Early Core UI Handlers
   * Defined immediately so inline HTML onclick handlers never throw ReferenceError
   */
  (window as any).switchTab = function(tab: string) {
    const formContainer = document.getElementById("formContainer");
    const signInTab = document.getElementById("signInTab");
    const registerTab = document.getElementById("registerTab");

    if (tab === 'register') {
      if (formContainer) formContainer.classList.add("show-register");
      if (registerTab) registerTab.classList.add("active");
      if (signInTab) signInTab.classList.remove("active");
    } else {
      if (formContainer) formContainer.classList.remove("show-register");
      if (signInTab) signInTab.classList.add("active");
      if (registerTab) registerTab.classList.remove("active");
    }
    if (typeof (window as any).generateMathCaptcha === 'function') {
      try { (window as any).generateMathCaptcha(); } catch(e) {}
    }
  };

  let E = 3, T = 4, S = 5, w = 2;
  function k() {
    E = Math.floor(Math.random() * 9) + 1;
    T = Math.floor(Math.random() * 9) + 1;
    const l = document.getElementById("loginQuestion");
    if (l) l.innerText = `${E} + ${T} =`;
    const r = document.getElementById("loginAnswer") as HTMLInputElement;
    if (r) r.value = "";
    S = Math.floor(Math.random() * 9) + 1;
    w = Math.floor(Math.random() * 9) + 1;
    const j = document.getElementById("regQuestion");
    if (j) j.innerText = `${S} + ${w} =`;
    const z = document.getElementById("regAnswer") as HTMLInputElement;
    if (z) z.value = "";
  }

  function _() {
    const l = document.getElementById("loginAnswer") as HTMLInputElement;
    if (!l || !l.value) return false;
    return parseInt(l.value, 10) === E + T;
  }

  function C() {
    const r = document.getElementById("regAnswer") as HTMLInputElement;
    if (!r || !r.value) return false;
    return parseInt(r.value, 10) === S + w;
  }

  function A(type: string) {
    if (type === "login") {
      const r = document.getElementById("loginAnswer") as HTMLInputElement;
      if (r) r.value = String(E + T);
    } else {
      const r = document.getElementById("regAnswer") as HTMLInputElement;
      if (r) r.value = String(S + w);
    }
  }

  (window as any).generateMathCaptcha = k;
  (window as any).validateLoginCaptcha = _;
  (window as any).validateRegCaptcha = C;
  (window as any).solveCaptcha = A;

  (window as any).handleOneClickReg = async () => {
    const app = (window as any).appInstance || (window as any).app;
    if (!app) {
      alert("App instance loading... Please try again in a moment.");
      return;
    }
    const L = document.getElementById("reg-terms-checkbox") as HTMLInputElement;
    const R = document.getElementById("reg-terms-error");
    if (L && !L.checked) {
      R && R.classList.remove("hidden");
      app.showToast("You must agree to the Terms & Conditions and Privacy Policy to create an account.", "error");
      return;
    }
    R && R.classList.add("hidden");

    const j = "winner_" + Math.floor(100000 + Math.random() * 900000);
    const Z = Math.random().toString(36).slice(-8);
    const oe = document.getElementById("genUser");
    const ne = document.getElementById("genPass");
    if (oe) oe.innerText = j;
    if (ne) ne.innerText = Z;

    const signupBonus = (app.db?.settings?.signupBonusEnabled !== false) && parseFloat(app.db?.settings?.signupBonus ?? 50) || 0;
    
    let clientIp = "127.0.0.1";
    try {
      if (typeof app.getClientIP === "function") {
        clientIp = await app.getClientIP();
      }
    } catch (e) {}

    const Me = {
      id: "u" + Date.now(),
      username: j,
      fullName: "Instant Player",
      email: `${j}@lottery.local`,
      password: Z,
      phone: "017" + Math.floor(10000000 + Math.random() * 90000000),
      dob: "2000-01-01",
      balance: signupBonus,
      totDeposit: 0,
      totWithdraw: 0,
      wins: 0,
      loss: 0,
      profit: 0,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      blockedUntil: null,
      region: "Dhaka",
      registeredIp: clientIp,
      refersCount: 0,
      referredUsers: [],
      rewardedMilestones: [],
      role: "player",
      referredBy: null,
      termsAccepted: true,
      privacyAccepted: true,
      acceptedAt: new Date().toISOString()
    };

    app.db.users.push(Me);
    if (signupBonus > 0 && app.db.transactions) {
      app.db.transactions.push({
        id: "tx_bonus_" + Date.now(),
        userId: Me.id,
        username: Me.username,
        type: "bonus",
        transactionType: "bonus",
        amount: signupBonus,
        description: "Welcome Registration Bonus Credit",
        notes: "Welcome Registration Bonus Credit",
        date: new Date().toISOString(),
        status: "completed"
      });
    }

    app.saveDB(true);
    (window as any).lastOneClickUser = Me;
    (window as any).lastOneClickPlainPass = Z;

    // Immediately persist user directly into MySQL database
    try {
      fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Me)
      }).then(res => res.json()).then(data => {
        if (data && data.success && data.user) {
          console.log("[1-Click Reg] Account saved directly into MySQL database:", data.user);
          if (data.user.id) {
            Me.id = String(data.user.id);
            if (app.currentUser && app.currentUser.username === Me.username) {
              app.currentUser.id = String(data.user.id);
            }
            app.saveDB();
          }
        }
      }).catch(err => {
        console.warn("[1-Click Reg] Direct save notice:", err);
      });
    } catch (e) {}

    if (typeof app.syncToCloud === "function") {
      app.syncToCloud(true);
    }

    const De = document.getElementById("copy-user-btn-text");
    const qe = document.getElementById("copy-pass-btn-text");
    const ct = document.getElementById("copy-all-btn-text");
    if (De) De.innerText = "Copy";
    if (qe) qe.innerText = "Copy";
    if (ct) ct.innerText = "Copy Both";

    const $e = document.getElementById("cred-modal-bonus-badge");
    if ($e) {
      if (signupBonus > 0) {
        $e.innerHTML = `<span>💵</span> $${signupBonus} FREE BONUS ADDED TO WALLET`;
        $e.classList.remove("hidden");
      } else {
        $e.classList.add("hidden");
      }
    }

    const dt = document.getElementById("credModal");
    if (dt) {
      if (dt.parentElement && dt.parentElement.id === "screen-auth") {
        document.body.appendChild(dt);
      }
      dt.style.display = "flex";
      dt.classList.remove("hidden");
    }

    app.currentTab = "home";
    app.completeLogin(Me);
    
    // Small timeout to ensure DOM transition is smooth
    setTimeout(() => {
      app.navigateTo("home");
    }, 50);
  };

  (window as any).copyCredItem = (itemType: string) => {
    const user = (window as any).lastOneClickUser;
    const username = document.getElementById("genUser")?.innerText.trim() || user?.username || "";
    const password = document.getElementById("genPass")?.innerText.trim() || (window as any).lastOneClickPlainPass || user?.password || "";
    const app = (window as any).appInstance || (window as any).app;

    if (itemType === "username") {
      if (!username) return;
      navigator.clipboard.writeText(username).then(() => {
        app?.showToast(`✅ Username copied: ${username}`, "success");
        const btnText = document.getElementById("copy-user-btn-text");
        if (btnText) {
          btnText.innerText = "Copied! ✓";
          setTimeout(() => { btnText.innerText = "Copy"; }, 2000);
        }
      }).catch(() => { app?.showToast(`Username: ${username}`, "info"); });
    } else if (itemType === "password") {
      if (!password) return;
      navigator.clipboard.writeText(password).then(() => {
        app?.showToast("✅ Password copied!", "success");
        const btnText = document.getElementById("copy-pass-btn-text");
        if (btnText) {
          btnText.innerText = "Copied! ✓";
          setTimeout(() => { btnText.innerText = "Copy"; }, 2000);
        }
      }).catch(() => { app?.showToast(`Password: ${password}`, "info"); });
    } else if (itemType === "all") {
      const text = `Username: ${username}\nPassword: ${password}`;
      navigator.clipboard.writeText(text).then(() => {
        app?.showToast("✅ Credentials copied!", "success");
        const btnText = document.getElementById("copy-all-btn-text");
        if (btnText) {
          btnText.innerText = "Copied! ✓";
          setTimeout(() => { btnText.innerText = "Copy Both"; }, 2000);
        }
      }).catch(() => { app?.showToast(text, "info"); });
    }
  };

  (window as any).downloadCredentialsTxt = () => {
    const user = (window as any).lastOneClickUser;
    const username = document.getElementById("genUser")?.innerText.trim() || user?.username || "user";
    const password = document.getElementById("genPass")?.innerText.trim() || (window as any).lastOneClickPlainPass || "password";
    const content = `========================================\n LOTTERY WINNER - ACCOUNT CREDENTIALS\n========================================\nUsername: ${username}\nPassword: ${password}\nCreated: ${new Date().toLocaleString()}\n========================================\nKeep your credentials safe!`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${username}_credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  setTimeout(() => { k(); }, 150);

  (window as any).switchAuthTab = function(mode: string) {
    (window as any).switchTab(mode === 'login' ? 'signin' : 'register');
  };

  (window as any).openBypass = function() {
    const splash = document.getElementById('splash-screen');
    const auth = document.getElementById('screen-auth');
    if (splash) splash.classList.add('hidden');
    if (auth) auth.classList.remove('hidden');
  };

  (window as any).closeModal = function(id: string) {
    const targetId = id || "credModal";
    const el = document.getElementById(targetId);
    if (el) {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
    const app = (window as any).appInstance || (window as any).app;
    if (app && app.currentUser && typeof app.navigateTo === "function") {
      app.navigateTo("home");
    }
  };

  /**
   * Production Error Logger
   */
  window.addEventListener('error', function(e: ErrorEvent) {
    const msgStr = (e && e.message) ? String(e.message).toLowerCase() : "";
    if (e && (msgStr.includes("script error") || msgStr.includes("scripterror") || !e.filename || e.filename.indexOf('http') !== 0)) {
      return;
    }
    console.warn('Application notice:', e.message || e);
  });

  /**
   * Console Filter for common non-critical errors
   */
  (function() {
    const filterWords = [
      "Could not reach Cloud Firestore backend", 
      "reach Cloud Firestore", 
      "@firebase/firestore", 
      "Firestore (10.8.0)", 
      "Firestore backend is currently unreachable", 
      "script error", 
      "scripterror"
    ];

    const shouldFilter = (args: any[]) => {
      try {
        for (let i = 0; i < args.length; i++) {
          const arg = args[i];
          if (!arg) continue;
          if (typeof arg === 'string') {
            if (filterWords.some(word => arg.includes(word))) return true;
          } else if (arg.message && typeof arg.message === 'string') {
            if (filterWords.some(word => arg.message.includes(word))) return true;
          } else if (arg.reason && arg.reason.message && typeof arg.reason.message === 'string') {
            if (filterWords.some(word => arg.reason.message.includes(word))) return true;
          }
        }
      } catch (e) {}
      return false;
    };

    const originalWarn = console.warn;
    console.warn = function(...args: any[]) {
      if (shouldFilter(args)) return;
      originalWarn.apply(console, args);
    };

    const originalError = console.error;
    console.error = function(...args: any[]) {
      if (shouldFilter(args)) return;
      originalError.apply(console, args);
    };

    const originalLog = console.log;
    console.log = function(...args: any[]) {
      if (shouldFilter(args)) return;
      originalLog.apply(console, args);
    };
  })();
}
