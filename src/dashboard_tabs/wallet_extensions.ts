/**
 * Lottery Winner - Wallet Extensions Module (wallet_extensions.js)
 * 
 * Implements advanced gamified wallet features:
 * 1. Preset Quick Deposit Amount selectors
 * 2. Daily Wallet limits & Tier level tracker
 * 3. Real-time Crypto (USDT/BTC/ETH) exchange converter calculator
 * 4. Savings Vault Piggy Bank (Locked Balance safety module)
 * 5. Advanced Wallet Statistics & velocity trackers
 * 6. [OMITTED AS REQUESTED] Peer-to-Peer (P2P) Balance Transfer
 * 7. Secure PIN Cashout Lock Toggler & verification system
 */

export class WalletExtensions {
  static init(appInstance) {
    console.log("Wallet Extensions Module successfully initialized.");

    // Event delegation for wallet extension interactions
    document.addEventListener("click", (e) => {
      const user = appInstance.currentUser;
      if (!user) return;

      // Ensure local state fields are initialized
      if (user.vaultBalance === undefined) user.vaultBalance = 0;
      if (user.pinLockEnabled === undefined) user.pinLockEnabled = false;

      // 1. Preset amount clicks
      const presetBtn = e.target.closest(".quick-dep-preset-btn");
      if (presetBtn) {
        const val = parseFloat(presetBtn.getAttribute("data-val") || "0");
        const depInput = document.getElementById("dep-amount");
        if (depInput) {
          depInput.value = val;
          // Trigger input event to update crypto conversion immediately
          depInput.dispatchEvent(new Event("input", { bubbles: true }));
          
          // Add visual active state
          document.querySelectorAll(".quick-dep-preset-btn").forEach(b => b.classList.remove("border-rose-500", "text-rose-400"));
          presetBtn.classList.add("border-rose-500", "text-rose-400");
          appInstance.showToast(`Autofilled amount: ৳${val.toLocaleString()}`, "info");
        }
        return;
      }

      // 2. Vault Deposit click
      if (e.target.closest("#vault-lock-btn")) {
        const amtInput = document.getElementById("vault-amount-input");
        const val = parseFloat(amtInput?.value || "0");
        if (!val || val <= 0) {
          appInstance.showToast("Please enter a valid amount to lock!", "error");
          return;
        }
        if (user.balance < val) {
          appInstance.showToast("Insufficient main wallet balance to lock!", "error");
          return;
        }

        user.balance -= val;
        user.vaultBalance += val;
        
        // Log transaction
        if (!appInstance.db.transactions) appInstance.db.transactions = [];
        appInstance.db.transactions.push({
          id: "vault_in_" + Date.now(),
          userId: user.id,
          amount: val,
          type: "debit",
          description: "Locked into Savings Vault",
          date: new Date().toISOString()
        });

        // Award 15 XP for savings discipline!
        user.xp = (user.xp || 0) + 15;
        appInstance.saveDB();

        appInstance.showToast(`৳${val.toLocaleString()} successfully locked in Vault! +15 XP rewarded.`, "success");
        if (amtInput) amtInput.value = "";
        
        // Check level up & reload
        if (window.ProfileTab && window.ProfileTab.checkLevelUp) {
          window.ProfileTab.checkLevelUp(appInstance);
        }
        appInstance.render();
        return;
      }

      // 3. Vault Withdraw click
      if (e.target.closest("#vault-unlock-btn")) {
        const amtInput = document.getElementById("vault-amount-input");
        const val = parseFloat(amtInput?.value || "0");
        if (!val || val <= 0) {
          appInstance.showToast("Please enter a valid amount to unlock!", "error");
          return;
        }
        if (user.vaultBalance < val) {
          appInstance.showToast("Insufficient locked vault funds to unlock!", "error");
          return;
        }

        user.vaultBalance -= val;
        user.balance += val;

        // Log transaction
        if (!appInstance.db.transactions) appInstance.db.transactions = [];
        appInstance.db.transactions.push({
          id: "vault_out_" + Date.now(),
          userId: user.id,
          amount: val,
          type: "credit",
          description: "Unlocked from Savings Vault",
          date: new Date().toISOString()
        });

        appInstance.saveDB();
        appInstance.showToast(`৳${val.toLocaleString()} unlocked back to your main wallet!`, "success");
        if (amtInput) amtInput.value = "";

        appInstance.render();
        return;
      }

      // 4. Secure PIN Lock toggle
      if (e.target.closest("#wallet-pin-toggle-btn")) {
        if (!user.securityPin) {
          appInstance.showToast("You must configure your Security PIN in the Profile tab first!", "warning");
          return;
        }
        user.pinLockEnabled = !user.pinLockEnabled;
        appInstance.saveDB();
        appInstance.showToast(user.pinLockEnabled ? "🛡️ Cashout PIN Lock security ACTIVATED!" : "⚠️ Cashout PIN Lock deactivated.", user.pinLockEnabled ? "success" : "info");
        WalletExtensions.render(appInstance);
        return;
      }
    });

    // Handle real-time input conversions for crypto
    document.addEventListener("input", (e) => {
      if (e.target.id === "dep-amount" || e.target.id === "dep-gateway") {
        WalletExtensions.renderCryptoCalculatorExtensions(appInstance);
      }
    });

    // Intercept withdrawal submissions to require PIN verification
    const withdrawForm = document.getElementById("wallet-withdraw-form");
    if (withdrawForm) {
      withdrawForm.addEventListener("submit", (e) => {
        const user = appInstance.currentUser;
        if (!user) return;

        if (user.pinLockEnabled && user.securityPin) {
          const pinInput = document.getElementById("wallet-withdraw-pin-input");
          const enteredPin = pinInput ? pinInput.value.trim() : "";

          if (enteredPin !== user.securityPin) {
            e.preventDefault();
            e.stopImmediatePropagation(); // Block further handlers
            
            // Highlight/Shake PIN field
            if (pinInput) {
              pinInput.classList.add("border-rose-500", "animate-shake");
              setTimeout(() => pinInput.classList.remove("animate-shake"), 500);
            }
            appInstance.showToast("CRITICAL SECURITY ERROR: Invalid Withdrawal PIN code!", "error");
            return false;
          }
        }
      }, { capture: true }); // Intercept early in capture phase
    }
  }

  static render(appInstance) {
    const user = appInstance.currentUser;
    if (!user) return;

    // Ensure local fields exist
    if (user.vaultBalance === undefined) user.vaultBalance = 0;
    if (user.pinLockEnabled === undefined) user.pinLockEnabled = false;

    // Run sub-renders
    WalletExtensions.renderDashboardExtensions(appInstance);
    WalletExtensions.renderQuickDepositExtensions(appInstance);
    WalletExtensions.renderCryptoCalculatorExtensions(appInstance);
    WalletExtensions.renderWithdrawSecurityExtensions(appInstance);
  }

  // Feature 4 & 5: Savings Vault & Stats Dashboard
  static renderDashboardExtensions(appInstance) {
    const container = document.getElementById("wallet-extensions-dashboard-placeholder");
    if (!container) return;

    const user = appInstance.currentUser;
    
    // Calculate Stats from transactions
    const depos = appInstance.db.deposits.filter(d => d.username === user.username && d.status === "approved");
    const wds = appInstance.db.withdrawals.filter(w => w.username === user.username && w.status === "approved");
    
    const totalDep = depos.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalWd = wds.reduce((sum, w) => sum + (w.amount || 0), 0);
    const flowCount = depos.length + wds.length;

    container.innerHTML = `
      <!-- Wallet Advanced Stats -->
      <div class="bg-slate-900 border border-slate-800 p-4.5 rounded-3xl space-y-3.5 shadow-lg font-mono">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-chart-line text-rose-500"></i>
            <span class="text-xs font-bold uppercase text-slate-300">Wallet Analytics & Velocity</span>
          </div>
          <span class="text-[8px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400">Real-Time Tracker</span>
        </div>

        <div class="grid grid-cols-2 gap-3.5">
          <div class="bg-slate-950/60 p-3 rounded-2xl border border-slate-850/50 space-y-0.5">
            <span class="text-[8px] text-slate-500 uppercase font-bold block">Lifetime Deposits</span>
            <span class="text-xs font-extrabold text-emerald-400">৳${totalDep.toLocaleString()}</span>
            <span class="text-[8px] text-slate-600 block">${depos.length} Approved Loads</span>
          </div>
          <div class="bg-slate-950/60 p-3 rounded-2xl border border-slate-850/50 space-y-0.5">
            <span class="text-[8px] text-slate-500 uppercase font-bold block">Lifetime Cashouts</span>
            <span class="text-xs font-extrabold text-rose-400">৳${totalWd.toLocaleString()}</span>
            <span class="text-[8px] text-slate-600 block">${wds.length} Cleared Requests</span>
          </div>
        </div>

        <!-- Limits Tracker (Feature 2) -->
        <div class="space-y-1.5 pt-0.5">
          <div class="flex justify-between items-center text-[9px]">
            <span class="text-slate-500 uppercase font-bold">24h Transaction Limit Allowance</span>
            <span class="text-slate-300 font-bold">৳${(totalDep + totalWd).toLocaleString()} / ৳100,000 max</span>
          </div>
          <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
            <div class="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all duration-500" style="width: ${Math.min(100, (((totalDep + totalWd) / 100000) * 100))}%"></div>
          </div>
          <p class="text-[8.5px] text-slate-500 leading-normal">
            Your transfer tier: <strong class="text-rose-400">Standard Tier (Level ${user.level || 1})</strong>. Increase level to unlock custom instant automated disbursements.
          </p>
        </div>
      </div>

      <!-- Royal Savings Vault Card (Feature 4) -->
      <div class="bg-gradient-to-b from-indigo-950/20 to-slate-900 border border-indigo-900/30 p-5 rounded-3xl space-y-4 shadow-xl font-mono">
        <div class="flex items-center justify-between border-b border-indigo-900/20 pb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-piggy-bank text-indigo-400 text-base"></i>
            <div>
              <h3 class="text-xs font-extrabold uppercase text-white">🔒 Royal Savings Vault</h3>
              <p class="text-[9px] text-slate-400 font-sans">Shield funds from accidental lottery spending. Earn 15 XP upon saving.</p>
            </div>
          </div>
          <span class="text-[9px] px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-900/40 rounded-full font-bold">SECURED VAULT</span>
        </div>

        <div class="bg-slate-950/90 border border-slate-850 p-4 rounded-2xl text-center space-y-1">
          <span class="text-[8px] uppercase font-bold text-slate-500">Locked Vault Balance</span>
          <div class="text-2xl font-black text-indigo-400">৳${(user.vaultBalance || 0).toLocaleString()}</div>
          <p class="text-[9px] text-slate-500">Protected reserves (Excluded from playable pool wallet balance)</p>
        </div>

        <!-- Vault Transfer Form -->
        <div class="space-y-2.5">
          <div class="space-y-1">
            <label class="block text-[8px] uppercase text-slate-500 font-bold">Vault Allocation Amount (৳)</label>
            <input type="number" id="vault-amount-input" class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-indigo-500 placeholder-slate-700 font-bold" placeholder="e.g. 500" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button id="vault-lock-btn" type="button" class="bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl transition text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
              <i class="fa-solid fa-lock"></i> Lock Funds
            </button>
            <button id="vault-unlock-btn" type="button" class="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2.5 rounded-xl transition text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-lock-open"></i> Unlock Funds
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Feature 1: Quick Deposit preset button list
  static renderQuickDepositExtensions(appInstance) {
    const container = document.getElementById("wallet-extensions-quick-deposit-placeholder");
    if (!container) return;

    container.innerHTML = `
      <label class="block text-[10px] uppercase font-mono text-slate-500 font-bold">Quick Select Amount</label>
      <div class="grid grid-cols-5 gap-1.5 font-mono">
        <button type="button" class="quick-dep-preset-btn text-[9px] font-extrabold bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 py-1.5 rounded-lg transition" data-val="100">+৳100</button>
        <button type="button" class="quick-dep-preset-btn text-[9px] font-extrabold bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 py-1.5 rounded-lg transition" data-val="500">+৳500</button>
        <button type="button" class="quick-dep-preset-btn text-[9px] font-extrabold bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 py-1.5 rounded-lg transition" data-val="1000">+৳1k</button>
        <button type="button" class="quick-dep-preset-btn text-[9px] font-extrabold bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 py-1.5 rounded-lg transition" data-val="5000">+৳5k</button>
        <button type="button" class="quick-dep-preset-btn text-[9px] font-extrabold bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 py-1.5 rounded-lg transition" data-val="10000">+৳10k</button>
      </div>
    `;
  }

  // Feature 3: Crypto Conversion Calculator
  static renderCryptoCalculatorExtensions(appInstance) {
    const container = document.getElementById("wallet-extensions-crypto-calc-placeholder");
    if (!container) return;

    const gatewaySelect = document.getElementById("dep-gateway");
    const amountInput = document.getElementById("dep-amount");

    const gateway = gatewaySelect ? gatewaySelect.value : "";
    const amount = amountInput ? parseFloat(amountInput.value) : 0;

    if (!gateway.startsWith("Crypto") || !amount || amount <= 0) {
      container.innerHTML = "";
      return;
    }

    let cryptoName = "USDT";
    let conversionRate = 122.50; // default USDT rate in Taka

    if (gateway.includes("BTC")) {
      cryptoName = "BTC";
      conversionRate = 7850000.00;
    } else if (gateway.includes("ETH")) {
      cryptoName = "ETH";
      conversionRate = 420000.00;
    }

    const cryptoAmount = amount / conversionRate;
    const formattedCrypto = cryptoName === "USDT" ? cryptoAmount.toFixed(2) : cryptoAmount.toFixed(6);

    container.innerHTML = `
      <div class="bg-indigo-950/60 border border-indigo-900/30 p-2.5 rounded-xl font-mono text-[9px] text-slate-300 space-y-0.5 animate-fade-in self-end w-full">
        <div class="flex justify-between items-center text-indigo-400">
          <span class="font-bold">Crypto Conversion:</span>
          <span class="font-bold">${cryptoName} Mode</span>
        </div>
        <div class="flex justify-between font-extrabold text-white text-[10px] pt-0.5">
          <span>Required payload:</span>
          <span class="text-emerald-400">${formattedCrypto} ${cryptoName}</span>
        </div>
        <div class="text-[8px] text-slate-500 text-right">
          Exchange rate: 1 ${cryptoName} = ৳${conversionRate.toLocaleString()} BDT
        </div>
      </div>
    `;
  }

  // Feature 7: Cashout security PIN check
  static renderWithdrawSecurityExtensions(appInstance) {
    const container = document.getElementById("wallet-extensions-withdraw-security-placeholder");
    if (!container) return;

    const user = appInstance.currentUser;
    if (!user) return;

    const pinStatusHTML = user.pinLockEnabled
      ? `<span class="text-emerald-400 font-extrabold flex items-center gap-1 text-[9px]"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> 🛡️ PIN VERIFICATION REQUIRED</span>`
      : `<span class="text-slate-500 text-[9px]">⚠️ PIN LOCK BYPASSED</span>`;

    const pinInputHTML = user.pinLockEnabled && user.securityPin
      ? `
        <div class="space-y-1 bg-slate-950 border border-slate-850 p-3 rounded-2xl animate-fade-in">
          <div class="flex justify-between items-center">
            <label class="block text-[9px] uppercase font-bold text-slate-400"><i class="fa-solid fa-key mr-1 text-rose-500"></i> Withdrawal security PIN (4 digits)</label>
            <span class="text-[8px] text-slate-500">Secured transaction channel</span>
          </div>
          <input type="password" id="wallet-withdraw-pin-input" maxlength="4" pattern="[0-9]*" inputmode="numeric" required class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-center text-sm font-black tracking-widest text-white outline-none focus:border-rose-500" placeholder="••••" />
        </div>
      `
      : "";

    container.innerHTML = `
      <div class="bg-slate-950/40 border border-slate-850/60 p-3 rounded-2xl flex items-center justify-between font-mono text-[10px]">
        <div class="space-y-0.5">
          <div class="font-bold text-white uppercase flex items-center gap-1.5">
            <i class="fa-solid fa-shield-halved text-rose-500"></i> Payout PIN Authorization Lock
          </div>
          <div class="text-slate-500 leading-normal text-[8.5px]">Require PIN confirmation before filing withdrawal ticket.</div>
        </div>
        <div class="flex flex-col items-end gap-1 shrink-0">
          <button id="wallet-pin-toggle-btn" type="button" class="text-[9px] font-black uppercase tracking-wider py-1.5 px-3 rounded-xl border transition cursor-pointer select-none ${user.pinLockEnabled ? 'bg-rose-955 text-rose-400 border-rose-900/60' : 'bg-slate-900 text-slate-400 border-slate-850'}">
            ${user.pinLockEnabled ? 'PIN ACTIVE' : 'PIN OFF'}
          </button>
          ${pinStatusHTML}
        </div>
      </div>
      ${pinInputHTML}
    `;
  }
}
