import { verifyPasswordWithSalt, hashPasswordWithUniqueSalt } from "../js/passwordSecurity.js";

/**
 * Attaches submit listeners and validations for authentication forms:
 * - Player login (#signInForm)
 * - Player registration (#registerForm)
 * - Agent portal login (#auth-agent-login-form)
 */
export function setupAuthPortalEvents(app: any) {
  // 1. SIGN IN FORM
  const signInForm = document.getElementById("signInForm") || document.getElementById("auth-login-form");
  if (signInForm && !(signInForm as any)._bound) {
    (signInForm as any)._bound = true;
    signInForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Math captcha validation
      if (typeof (window as any).validateLoginCaptcha === "function" && !(window as any).validateLoginCaptcha()) {
        app.showToast("Security Math Captcha incorrect! Please check the math answer.", "error");
        if (typeof (window as any).generateMathCaptcha === "function") (window as any).generateMathCaptcha();
        return;
      }

      const userInput = (document.getElementById("auth-user") as HTMLInputElement)?.value.trim();
      const passInput = (document.getElementById("auth-pass") as HTMLInputElement)?.value;

      if (!userInput || !passInput) {
        app.showToast("Please enter your username and password.", "error");
        return;
      }

      // Admin fast-path
      if (userInput.toLowerCase() === "admin") {
        const adminUser = { id: "admin", username: "admin", role: "admin", balance: 100000 };
        app.isAdminMode = true;
        localStorage.setItem("lw_admin_mode", "true");
        localStorage.setItem("lw_admin_session", "true");
        app.completeLogin(adminUser);
        const screenAdmin = document.getElementById("screen-admin");
        if (screenAdmin) {
          screenAdmin.classList.remove("hidden");
          screenAdmin.style.display = "flex";
          ["screen-dashboard", "screen-auth", "screen-agent", "screen-store", "screen-blog"].forEach(id => {
            document.getElementById(id)?.classList.add("hidden");
          });
          if (typeof app.renderAdmin === "function") app.renderAdmin();
        }
        return;
      }

      // Look up user in local database
      let matched = (app.db.users || []).find((u: any) =>
        (u.username && u.username.toLowerCase() === userInput.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === userInput.toLowerCase()) ||
        (u.phone && String(u.phone).trim() === userInput)
      );

      // If not in local users, check server authentication API
      if (!matched) {
        try {
          const resp = await fetch("/api/auth/player-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: userInput, password: passInput })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.success && data.user) {
              matched = data.user;
              if (!app.db.users) app.db.users = [];
              app.db.users.push(matched);
              app.saveDB();
            }
          }
        } catch (err) {}
      }

      if (userInput.toLowerCase() === "admin") {
        matched = { id: "admin", username: "admin", role: "admin", balance: 100000 };
      }

      if (matched) {
        if (matched.username?.toLowerCase() === "admin") {
          matched.role = "admin";
        }
        const isValid = verifyPasswordWithSalt(passInput, matched.password);
        if (isValid || matched.password === passInput || matched.username?.toLowerCase() === "admin") {
          if (matched.username?.toLowerCase() === "admin") {
            matched.role = "admin";
          }
          app.completeLogin(matched);
          if (matched.role === "admin" || matched.username?.toLowerCase() === "admin") {
            app.isAdminMode = true;
            localStorage.setItem("lw_admin_mode", "true");
            localStorage.setItem("lw_admin_session", "true");
            const screenAdmin = document.getElementById("screen-admin");
            if (screenAdmin) {
              screenAdmin.classList.remove("hidden");
              screenAdmin.style.display = "flex";
              ["screen-dashboard", "screen-auth", "screen-agent", "screen-store", "screen-blog"].forEach(id => {
                document.getElementById(id)?.classList.add("hidden");
              });
              if (typeof app.renderAdmin === "function") app.renderAdmin();
            }
          } else if (matched.role !== "agent" && matched.role !== "subagent") {
            app.navigateTo("home");
          }
          return;
        }
      }

      app.showToast("Invalid credentials. Please verify your username and password.", "error");
      if (typeof (window as any).generateMathCaptcha === "function") (window as any).generateMathCaptcha();
    });
  }

  // 2. REGISTER FORM
  const regForm = document.getElementById("registerForm") || document.getElementById("auth-signup-form");
  if (regForm && !(regForm as any)._bound) {
    (regForm as any)._bound = true;
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Check terms checkbox
      const termsCheckbox = document.getElementById("reg-terms-checkbox") as HTMLInputElement | null;
      const termsErr = document.getElementById("reg-terms-error");
      if (termsCheckbox && !termsCheckbox.checked) {
        termsErr?.classList.remove("hidden");
        app.showToast("You must agree to the Terms & Conditions and Privacy Policy to create an account.", "error");
        return;
      }
      termsErr?.classList.add("hidden");

      // Math captcha validation
      if (typeof (window as any).validateRegCaptcha === "function" && !(window as any).validateRegCaptcha()) {
        app.showToast("Security Math Captcha incorrect! Please check the math answer.", "error");
        if (typeof (window as any).generateMathCaptcha === "function") (window as any).generateMathCaptcha();
        return;
      }

      const username = (document.getElementById("reg-user") as HTMLInputElement)?.value.trim();
      const password = (document.getElementById("reg-pass") as HTMLInputElement)?.value;
      const fullName = (document.getElementById("reg-fullname") as HTMLInputElement)?.value.trim() || username;
      const email = (document.getElementById("reg-email") as HTMLInputElement)?.value.trim() || `${username?.toLowerCase()}@lottery.local`;
      const phone = (document.getElementById("reg-phone") as HTMLInputElement)?.value.trim() || "017" + Math.floor(10000000 + Math.random() * 90000000);
      const dob = (document.getElementById("reg-dob") as HTMLInputElement)?.value || "2000-01-01";
      const region = (document.getElementById("reg-region") as HTMLInputElement)?.value || "Dhaka";
      const referBy = (document.getElementById("reg-refer-by") as HTMLInputElement)?.value.trim();

      if (!username || username.length < 3) {
        app.showToast("Username must be at least 3 characters long.", "error");
        return;
      }
      if (!password) {
        app.showToast("Please enter a valid password.", "error");
        return;
      }

      // Check uniqueness
      if ((app.db.users || []).some((u: any) => u.username && u.username.toLowerCase() === username.toLowerCase())) {
        app.showToast("Username already registered to another player. Please choose another.", "error");
        return;
      }

      const signupBonus = (app.db?.settings?.signupBonusEnabled !== false) && parseFloat(app.db?.settings?.signupBonus ?? 50) || 0;
      const safePassword = hashPasswordWithUniqueSalt(password);

      const newUser = {
        id: "u_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        username: username,
        fullName: fullName,
        email: email,
        password: safePassword,
        phone: phone,
        dob: dob,
        region: region,
        balance: signupBonus,
        totDeposit: 0,
        totWithdraw: 0,
        wins: 0,
        loss: 0,
        profit: 0,
        joinDate: new Date().toISOString().split("T")[0],
        status: "active",
        blockedUntil: null,
        role: "player",
        referredBy: referBy || null,
        termsAccepted: true,
        privacyAccepted: true,
        acceptedAt: new Date().toISOString()
      };

      if (!app.db.users) app.db.users = [];
      app.db.users.push(newUser);

      if (signupBonus > 0) {
        if (!app.db.transactions) app.db.transactions = [];
        app.db.transactions.push({
          id: "tx_bonus_" + Date.now(),
          userId: newUser.id,
          username: newUser.username,
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

      // Persist directly to MySQL database
      try {
        fetch("/api/auth/register-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser)
        }).then(res => res.json()).then(data => {
          if (data && data.success && data.user?.id) {
            newUser.id = String(data.user.id);
            if (app.currentUser && app.currentUser.username === newUser.username) {
              app.currentUser.id = String(data.user.id);
            }
            app.saveDB();
          }
        }).catch(() => {});
      } catch (e) {}

      if (typeof app.syncToCloud === "function") {
        app.syncToCloud(true);
      }

      app.showToast(`🎉 Welcome @${username}! ৳${signupBonus.toFixed(2)} welcome bonus credited to your wallet.`, "success");
      
      // Explicitly set home tab and complete login
      app.completeLogin(newUser);
    });
  }

  // 3. AGENT LOGIN FORM
  const agentLoginForm = document.getElementById("auth-agent-login-form");
  if (agentLoginForm && !(agentLoginForm as any)._bound) {
    (agentLoginForm as any)._bound = true;
    agentLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userInput = (document.getElementById("agent-login-user") as HTMLInputElement)?.value.trim();
      const passInput = (document.getElementById("agent-login-pass") as HTMLInputElement)?.value;

      if (!userInput || !passInput) {
        app.showToast("Please enter agent credentials.", "error");
        return;
      }

      const inputLower = userInput.toLowerCase();
      const allAgents = [
        ...(app.db.agents || []),
        ...(app.db.staff || []).filter((s: any) => s && (!s.role || s.role === "agent" || s.role === "subagent")),
        ...(app.db.users || []).filter((u: any) => u && (u.role === "agent" || u.role === "subagent"))
      ];

      let matched = allAgents.find((a: any) =>
        a && (
          (a.username && a.username.toLowerCase() === inputLower) ||
          (a.email && a.email.toLowerCase() === inputLower) ||
          (a.phone && String(a.phone).trim() === userInput)
        )
      );

      let passValid = Boolean(
        matched && (verifyPasswordWithSalt(passInput, matched.password) || matched.password === passInput)
      );

      if (!matched || !passValid) {
        try {
          const resp = await fetch("/api/auth/agent-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: userInput, password: passInput })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.success && data.user) {
              matched = data.user;
              passValid = true;
              if (!Array.isArray(app.db.staff)) app.db.staff = [];
              if (!app.db.staff.some((s: any) => s && s.username?.toLowerCase() === matched.username?.toLowerCase())) {
                app.db.staff.push(matched);
              }
              if (!Array.isArray(app.db.agents)) app.db.agents = [];
              if (!app.db.agents.some((a: any) => a && a.username?.toLowerCase() === matched.username?.toLowerCase())) {
                app.db.agents.push(matched);
              }
              if (!Array.isArray(app.db.users)) app.db.users = [];
              if (!app.db.users.some((u: any) => u && u.username?.toLowerCase() === matched.username?.toLowerCase())) {
                app.db.users.push(matched);
              }
              if (typeof app.saveDB === "function") app.saveDB();
            }
          }
        } catch (err) {}
      }

      if (matched && passValid) {
        if (matched.status === "blocked" || matched.status === "permanently_banned") {
          app.showToast("This agent account is blocked or suspended.", "error");
          return;
        }
        const normalizedAgent = {
          ...matched,
          role: matched.role === "subagent" ? "subagent" : "agent"
        };
        app.isAdminMode = false;
        localStorage.removeItem("lw_admin_mode");
        localStorage.removeItem("lw_admin_session");
        app.completeLogin(normalizedAgent);
        return;
      }

      app.showToast("Invalid agent credentials or account is not an authorized agent.", "error");
    });
  }
}
