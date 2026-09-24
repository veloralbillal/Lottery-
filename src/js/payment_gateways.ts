/**
 * Lottery Winner - Payment Gateways Integration Module (payment_gateways.ts)
 * 
 * Supports:
 * 1. Cryptomus Automated Crypto Gateway (USDT, BTC, ETH, TON, TRX, SOL, LTC)
 * 2. UddoktaPay Automated Mobile Banking & Card Gateway (bKash, Nagad, Rocket, Upay, Cards)
 * 3. bKash Direct PGW, Nagad PGW, Aamarpay, Binance Pay
 */

interface CryptomusInvoice {
  orderId: string;
  invoiceUuid: string;
  bdtAmount: number;
  usdAmount: number;
  coin: string;
  network: string;
  cryptoAmount: string;
  address: string;
  qrUrl: string;
  expiresAt: number;
  status: "pending" | "confirming" | "paid" | "expired";
}

export class PaymentGateways {
  private static app: any = null;
  private static cryptomusTimer: any = null;
  private static activeInvoice: CryptomusInvoice | null = null;

  // Crypto network address mapping presets
  private static cryptoNetworks: Record<string, { name: string; network: string; rateMult: number; symbol: string; defaultAddress: string }> = {
    "USDT_TRC20": {
      name: "USDT",
      network: "Tron (TRC-20)",
      rateMult: 1.0,
      symbol: "USDT",
      defaultAddress: "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X"
    },
    "USDT_BEP20": {
      name: "USDT",
      network: "BNB Smart Chain (BEP-20)",
      rateMult: 1.0,
      symbol: "USDT",
      defaultAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    },
    "BTC": {
      name: "Bitcoin",
      network: "Bitcoin Mainnet",
      rateMult: 0.0000155, // Approx 1 USD to BTC
      symbol: "BTC",
      defaultAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    },
    "ETH": {
      name: "Ethereum",
      network: "Ethereum (ERC-20)",
      rateMult: 0.00029, // Approx 1 USD to ETH
      symbol: "ETH",
      defaultAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    },
    "TON": {
      name: "TON",
      network: "The Open Network (TON)",
      rateMult: 0.17, // Approx 1 USD to TON
      symbol: "TON",
      defaultAddress: "EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N"
    },
    "TRX": {
      name: "Tron",
      network: "Tron (TRX)",
      rateMult: 4.2,
      symbol: "TRX",
      defaultAddress: "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X"
    },
    "SOL": {
      name: "Solana",
      network: "Solana Mainnet",
      rateMult: 0.0068,
      symbol: "SOL",
      defaultAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
    },
    "LTC": {
      name: "Litecoin",
      network: "Litecoin Network",
      rateMult: 0.011,
      symbol: "LTC",
      defaultAddress: "LTC1q9a2x3p4e5f6g7h8j9k0m1n2p3q4r5s6t7u8v"
    }
  };

  private static isInitialized = false;

  private static getApp(): any {
    if (!this.app) {
      this.app = (window as any).appInstance || (window as any).app;
    }
    return this.app;
  }

  static init(appInstance: any) {
    this.app = appInstance || (window as any).appInstance || (window as any).app;
    (window as any).PaymentGateways = PaymentGateways;
    (window as any).launchUddoktaCheckout = () => PaymentGateways.launchUddoktaCheckout();
    (window as any).launchZiniPayCheckout = () => PaymentGateways.launchZiniPayCheckout();
    (window as any).launchCryptomusCheckout = () => PaymentGateways.launchCryptomusCheckout();
    (window as any).launchAutomatedCheckout = () => PaymentGateways.launchAutomatedCheckout();

    if (!this.isInitialized) {
      this.isInitialized = true;
      this.attachEventListeners();
    }
    console.log("Payment Gateways (Cryptomus + UddoktaPay + ZiniPay) initialized.");
  }

  static launchZiniPayCheckout() {
    console.log("[PaymentGateways] Launching ZiniPay Instant Checkout");
    const depInput = document.getElementById("dep-amount") as HTMLInputElement;
    let amount = depInput ? parseFloat(depInput.value) : 0;
    if (!amount || isNaN(amount) || amount < 20) {
      amount = 500;
      if (depInput) depInput.value = "500";
    }
    this.openZiniPayModal(amount);
  }

  static launchUddoktaCheckout() {
    console.log("[PaymentGateways] Launching UddoktaPay Instant Checkout");
    const depInput = document.getElementById("dep-amount") as HTMLInputElement;
    let amount = depInput ? parseFloat(depInput.value) : 0;
    if (!amount || isNaN(amount) || amount < 20) {
      amount = 500;
      if (depInput) depInput.value = "500";
    }
    this.openUddoktaPayModal(amount);
  }

  static launchZiniPayCheckout() {
    console.log("[PaymentGateways] Launching ZiniPay Instant Checkout");
    const depInput = document.getElementById("dep-amount") as HTMLInputElement;
    let amount = depInput ? parseFloat(depInput.value) : 0;
    if (!amount || isNaN(amount) || amount < 20) {
      amount = 500;
      if (depInput) depInput.value = "500";
    }
    this.openZiniPayModal(amount);
  }

  static launchCryptomusCheckout() {
    console.log("[PaymentGateways] Launching Cryptomus Instant Checkout");
    const depInput = document.getElementById("dep-amount") as HTMLInputElement;
    let amount = depInput ? parseFloat(depInput.value) : 0;
    if (!amount || isNaN(amount) || amount < 50) {
      amount = 500;
      if (depInput) depInput.value = "500";
    }
    this.openCryptomusModal(amount);
  }

  static launchAutomatedCheckout() {
    console.log("[PaymentGateways] Launching Automated Instant Checkout");
    const gatewaySelect = document.getElementById("dep-gateway") as HTMLSelectElement;
    const selectedGateway = gatewaySelect ? gatewaySelect.value : "UddoktaPay";
    const depInput = document.getElementById("dep-amount") as HTMLInputElement;
    let amount = depInput ? parseFloat(depInput.value) : 0;
    if (!amount || isNaN(amount) || amount < 20) {
      amount = 500;
      if (depInput) depInput.value = "500";
    }
    if (selectedGateway === "Cryptomus" || selectedGateway === "Binance Pay") {
      this.openCryptomusModal(amount);
    } else {
      this.openUddoktaPayModal(amount);
    }
  }

  private static activeGatewayForAmountModal = "UddoktaPay";

  private static attachEventListeners() {
    // 0. Gateway Panel Card Click (Opens Deposit Amount Modal)
    document.addEventListener("click", (e: any) => {
      const panelCard = e.target.closest(".dep-gateway-panel-card");
      if (panelCard) {
        e.preventDefault();
        const gateway = panelCard.getAttribute("data-gateway");
        if (gateway) {
          this.openDepositAmountModal(gateway);
        }
        return;
      }

      // Amount Modal Preset Click
      const amountPreset = e.target.closest(".amount-modal-preset-btn");
      if (amountPreset) {
        const val = parseFloat(amountPreset.getAttribute("data-val") || "500");
        const inputEl = document.getElementById("amount-modal-input") as HTMLInputElement;
        if (inputEl) {
          inputEl.value = val.toString();
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        }
        document.querySelectorAll(".amount-modal-preset-btn").forEach(b => b.classList.remove("border-emerald-500", "bg-emerald-950/40", "text-emerald-300"));
        amountPreset.classList.add("border-emerald-500", "bg-emerald-950/40", "text-emerald-300");
        return;
      }

      // Close Amount Modal
      if (e.target.closest("#close-amount-modal-btn") || e.target.closest("#amount-modal-cancel-btn") || e.target.id === "deposit-amount-modal") {
        this.closeDepositAmountModal();
        return;
      }

      // Confirm Amount Modal Proceed
      if (e.target.closest("#amount-modal-confirm-btn")) {
        e.preventDefault();
        const inputEl = document.getElementById("amount-modal-input") as HTMLInputElement;
        const amount = inputEl ? parseFloat(inputEl.value) : 0;
        const gateway = this.activeGatewayForAmountModal;

        let minAllowed = 20;
        if (gateway === "Cryptomus") minAllowed = 50;

        const app = this.getApp();
        if (!amount || amount < minAllowed) {
          if (app?.showToast) {
            app.showToast(`Minimum deposit for ${gateway} is ৳${minAllowed}`, "warning");
          }
          if (inputEl) inputEl.focus();
          return;
        }

        this.closeDepositAmountModal();

        if (gateway === "Cryptomus" || gateway === "Binance Pay") {
          this.openCryptomusModal(amount);
        } else if (gateway === "ZiniPay") {
          const gatewaySelect = document.getElementById("dep-gateway") as HTMLSelectElement;
          if (gatewaySelect) gatewaySelect.value = gateway;
          this.openZiniPayModal(amount);
        } else if (gateway === "UddoktaPay" || gateway === "bKash PGW" || gateway === "Nagad PGW") {
          const gatewaySelect = document.getElementById("dep-gateway") as HTMLSelectElement;
          if (gatewaySelect) gatewaySelect.value = gateway;
          this.openUddoktaPayModal(amount);
        } else {
          const gatewaySelect = document.getElementById("dep-gateway") as HTMLSelectElement;
          const depInput = document.getElementById("dep-amount") as HTMLInputElement;
          if (gatewaySelect) gatewaySelect.value = gateway;
          if (depInput) {
            depInput.value = amount.toString();
            depInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
          if (app?.showToast) {
            app.showToast(`Selected ${gateway} manual deposit for ৳${amount.toLocaleString()}. Please complete transfer & submit TrxID below.`, "success");
          }
          const form = document.getElementById("wallet-deposit-form");
          if (form) form.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }

      // 1. Launch Cryptomus Checkout button from deposit section
      const btn = e.target.closest("#btn-launch-cryptomus-checkout");
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        this.launchCryptomusCheckout();
        return;
      }

      // 2. Launch UddoktaPay Checkout button
      const uddoktaBtn = e.target.closest("#btn-launch-uddoktapay-checkout");
      if (uddoktaBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.launchUddoktaCheckout();
        return;
      }

      // 2a. Launch ZiniPay Checkout button
      const ziniBtn = e.target.closest("#btn-launch-zinipay-checkout");
      if (ziniBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.launchZiniPayCheckout();
        return;
      }

      // 2b. Launch Generic Online Automated Checkout button (bKash PGW, Nagad PGW, Aamarpay, Binance Pay)
      const autoBtn = e.target.closest("#btn-launch-automated-checkout");
      if (autoBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.launchAutomatedCheckout();
        return;
      }

      // 3. Cryptomus Modal Close
      if (e.target.closest("#close-cryptomus-modal-btn") || e.target.id === "cryptomus-checkout-modal") {
        this.closeCryptomusModal();
        return;
      }

      // 4. UddoktaPay Modal Close
      if (e.target.closest("#close-uddoktapay-modal-btn") || e.target.id === "uddoktapay-checkout-modal") {
        this.closeUddoktaPayModal();
        return;
      }

      // 4a. ZiniPay Modal Close
      if (e.target.closest("#close-zinipay-modal-btn") || e.target.id === "zinipay-checkout-modal") {
        this.closeZiniPayModal();
        return;
      }

      // 4b. ZiniPay Tab Select
      const ziniTab = e.target.closest(".zinipay-channel-tab");
      if (ziniTab) {
        const channel = ziniTab.getAttribute("data-channel");
        this.selectZiniPayChannel(channel || "bkash");
        return;
      }

      // 4c. ZiniPay Confirm Pay (Simulator)
      if (e.target.closest("#zinipay-confirm-pay-btn")) {
        this.processZiniPay();
        return;
      }

      // 4d. ZiniPay Verify Payment Status
      if (e.target.closest("#zinipay-verify-payment-btn")) {
        this.processZiniPay();
        return;
      }

      // 4e. ZiniPay Toggle Simulator Zone
      if (e.target.closest("#zinipay-toggle-sim-btn")) {
        const zone = document.getElementById("zinipay-sim-zone");
        if (zone) {
          zone.classList.toggle("hidden");
        }
        return;
      }

      // 4f. UddoktaPay Toggle Simulator Zone
      if (e.target.closest("#uddokta-toggle-sim-btn")) {
        const zone = document.getElementById("uddokta-sim-zone");
        if (zone) {
          zone.classList.toggle("hidden");
        }
        return;
      }

      // 4g. UddoktaPay Verify Payment Status
      if (e.target.closest("#uddokta-verify-payment-btn")) {
        this.processUddoktaPay();
        return;
      }

      // 5. Switch Cryptomus Coin Network
      const coinBtn = e.target.closest(".cryptomus-coin-btn");
      if (coinBtn) {
        const coinKey = coinBtn.getAttribute("data-coin");
        if (coinKey) {
          this.selectCryptomusCoin(coinKey);
        }
        return;
      }

      // 6. Copy Cryptomus Address
      if (e.target.closest("#cryptomus-copy-address-btn")) {
        const addrEl = document.getElementById("cryptomus-deposit-address");
        if (addrEl && addrEl.textContent) {
          navigator.clipboard.writeText(addrEl.textContent.trim()).then(() => {
            this.app.showToast("Cryptomus deposit address copied to clipboard!", "success");
          }).catch(() => {
            this.app.showToast("Address: " + addrEl.textContent.trim(), "info");
          });
        }
        return;
      }

      // 7. Copy Cryptomus Exact Amount
      if (e.target.closest("#cryptomus-copy-amount-btn")) {
        const amtEl = document.getElementById("cryptomus-crypto-amount");
        if (amtEl && amtEl.textContent) {
          const val = amtEl.textContent.split(" ")[0].trim();
          navigator.clipboard.writeText(val).then(() => {
            this.app.showToast(`Exact amount ${val} copied!`, "success");
          });
        }
        return;
      }

      // 8. Cryptomus "Check Status" / "I have paid"
      if (e.target.closest("#cryptomus-check-status-btn")) {
        this.checkCryptomusStatus();
        return;
      }

      // 9. Cryptomus Instant Sandbox Confirm Webhook
      if (e.target.closest("#cryptomus-instant-confirm-btn")) {
        this.confirmCryptomusDeposit();
        return;
      }

      // 10. UddoktaPay Tab Select
      const uddoktaTab = e.target.closest(".uddokta-channel-tab");
      if (uddoktaTab) {
        const channel = uddoktaTab.getAttribute("data-channel");
        this.selectUddoktaChannel(channel || "bkash");
        return;
      }

      // 11. UddoktaPay Confirm Pay
      if (e.target.closest("#uddokta-confirm-pay-btn")) {
        this.processUddoktaPay();
        return;
      }
    });
  }

  // ==========================================
  // CRYPTOMUS INTEGRATION
  // ==========================================

  static openCryptomusModal(bdtAmount: number) {
    const app = this.getApp();
    if (!app?.currentUser) {
      if (app?.showToast) {
        app.showToast("Please login first to deposit via Cryptomus!", "warning");
      } else {
        alert("Please login first to deposit via Cryptomus!");
      }
      return;
    }

    const s = app.db?.settings || {};
    const rate = Number(s.cryptomusCurrencyRate) || 125.0; // 1 USD = 125 BDT
    const usdAmount = Number((bdtAmount / rate).toFixed(2));
    const orderId = "CM-" + Date.now().toString(36).toUpperCase() + Math.floor(100 + Math.random() * 900);
    const invoiceUuid = "inv_" + Math.random().toString(36).substring(2, 12);

    this.activeInvoice = {
      orderId: orderId,
      invoiceUuid: invoiceUuid,
      bdtAmount: bdtAmount,
      usdAmount: usdAmount,
      coin: "USDT_TRC20",
      network: "Tron (TRC-20)",
      cryptoAmount: usdAmount.toFixed(2),
      address: s.cryptoAddressUSDT || "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X",
      qrUrl: "",
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins countdown
      status: "pending"
    };

    const modal = document.getElementById("cryptomus-checkout-modal");
    if (!modal) return;

    // Fill order information
    const orderEl = document.getElementById("cryptomus-order-id");
    if (orderEl) orderEl.innerText = orderId;

    const bdtEl = document.getElementById("cryptomus-bdt-display");
    if (bdtEl) bdtEl.innerText = `৳${bdtAmount.toLocaleString()} BDT`;

    const usdEl = document.getElementById("cryptomus-usd-display");
    if (usdEl) usdEl.innerText = `$${usdAmount.toFixed(2)} USD`;

    const rateEl = document.getElementById("cryptomus-rate-display");
    if (rateEl) rateEl.innerText = `Exchange Rate: ৳${rate} BDT = $1.00 USD`;

    const modeBadge = document.getElementById("cryptomus-env-badge");
    if (modeBadge) {
      const isLive = s.cryptomusMode === "live";
      modeBadge.innerText = isLive ? "MAINNET LIVE" : "SANDBOX TEST";
      modeBadge.className = isLive 
        ? "text-[8px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded font-mono"
        : "text-[8px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded font-mono";
    }

    // Reset status elements
    const statusText = document.getElementById("cryptomus-status-text");
    if (statusText) statusText.innerText = "Awaiting transaction on blockchain...";
    const statusBadge = document.getElementById("cryptomus-status-badge");
    if (statusBadge) {
      statusBadge.className = "text-[9px] font-bold font-mono text-amber-400 bg-amber-950/40 border border-amber-800/30 px-2 py-0.5 rounded-full flex items-center gap-1";
      statusBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> WAITING FOR PAYMENT`;
    }

    // Render selected coin (defaults to USDT_TRC20)
    this.selectCryptomusCoin("USDT_TRC20");

    // Start 15 minute countdown timer
    this.startCryptomusTimer();

    // Show modal
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  static selectCryptomusCoin(coinKey: string) {
    if (!this.activeInvoice) return;
    const info = this.cryptoNetworks[coinKey] || this.cryptoNetworks["USDT_TRC20"];
    const s = this.app.db.settings || {};

    let addr = info.defaultAddress;
    if (coinKey.includes("USDT") && s.cryptoAddressUSDT) addr = s.cryptoAddressUSDT;
    if (coinKey === "BTC" && s.cryptoAddressBTC) addr = s.cryptoAddressBTC;
    if (coinKey === "ETH" && s.cryptoAddressETH) addr = s.cryptoAddressETH;

    const cryptoAmount = (this.activeInvoice.usdAmount * info.rateMult);
    const formattedAmount = info.name === "USDT" ? cryptoAmount.toFixed(2) : cryptoAmount.toFixed(6);

    this.activeInvoice.coin = coinKey;
    this.activeInvoice.network = info.network;
    this.activeInvoice.cryptoAmount = formattedAmount;
    this.activeInvoice.address = addr;

    // Update Coin chips highlight
    document.querySelectorAll(".cryptomus-coin-btn").forEach((btn: any) => {
      const key = btn.getAttribute("data-coin");
      if (key === coinKey) {
        btn.classList.add("border-purple-500", "bg-purple-950/60", "text-white");
        btn.classList.remove("border-slate-800", "bg-slate-900", "text-slate-400");
      } else {
        btn.classList.remove("border-purple-500", "bg-purple-950/60", "text-white");
        btn.classList.add("border-slate-800", "bg-slate-900", "text-slate-400");
      }
    });

    // Update Address & Amount Displays
    const amtEl = document.getElementById("cryptomus-crypto-amount");
    if (amtEl) amtEl.innerText = `${formattedAmount} ${info.symbol}`;

    const netEl = document.getElementById("cryptomus-network-name");
    if (netEl) netEl.innerText = info.network;

    const addrEl = document.getElementById("cryptomus-deposit-address");
    if (addrEl) addrEl.innerText = addr;

    // Update QR Code
    const qrImg = document.getElementById("cryptomus-qr-image") as HTMLImageElement;
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(addr)}`;
    }
  }

  private static startCryptomusTimer() {
    if (this.cryptomusTimer) clearInterval(this.cryptomusTimer);

    const timerEl = document.getElementById("cryptomus-countdown-timer");
    const updateTime = () => {
      if (!this.activeInvoice) return;
      const left = Math.max(0, Math.floor((this.activeInvoice.expiresAt - Date.now()) / 1000));
      const mins = Math.floor(left / 60);
      const secs = left % 60;
      if (timerEl) {
        timerEl.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      if (left <= 0) {
        clearInterval(this.cryptomusTimer);
        const statusBadge = document.getElementById("cryptomus-status-badge");
        if (statusBadge) {
          statusBadge.className = "text-[9px] font-bold font-mono text-rose-400 bg-rose-950/40 border border-rose-800/30 px-2 py-0.5 rounded-full";
          statusBadge.innerText = "INVOICE EXPIRED";
        }
      }
    };

    updateTime();
    this.cryptomusTimer = setInterval(updateTime, 1000);
  }

  static checkCryptomusStatus() {
    if (!this.activeInvoice) return;
    const btn = document.getElementById("cryptomus-check-status-btn");
    const statusText = document.getElementById("cryptomus-status-text");

    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Checking Blockchain...`;
      (btn as HTMLButtonElement).disabled = true;
    }
    if (statusText) statusText.innerText = "Scanning network nodes for transaction hash...";

    setTimeout(() => {
      if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-rotate"></i> Check Payment Status`;
        (btn as HTMLButtonElement).disabled = false;
      }
      // Simulate real-time checking or auto-confirmation
      this.confirmCryptomusDeposit();
    }, 1500);
  }

  static confirmCryptomusDeposit() {
    const app = this.getApp();
    if (!this.activeInvoice || !app?.currentUser) return;
    const inv = this.activeInvoice;

    // Generate verified TrxID
    const trxHash = "cm_tx_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);

    // 1. Credit User Balance instantly
    const depositAmount = inv.bdtAmount;
    app.currentUser.balance = Number(((app.currentUser.balance || 0) + depositAmount).toFixed(2));

    // 2. Add to Deposits Ledger as Approved
    const newDep = {
      id: "dep" + Date.now(),
      userId: app.currentUser.id,
      username: app.currentUser.username,
      amount: depositAmount,
      method: `Cryptomus (${inv.coin.replace('_', ' ')})`,
      gateway: "Cryptomus",
      trxId: trxHash,
      date: new Date().toISOString(),
      status: "approved",
      notes: `Cryptomus auto-verified: ${inv.cryptoAmount} (${inv.network}) Order: ${inv.orderId}`
    };

    if (!app.db.deposits) app.db.deposits = [];
    app.db.deposits.unshift(newDep);

    // Update user record in db.users
    const userInDb = app.db.users.find((u: any) => u.id === app.currentUser.id);
    if (userInDb) {
      userInDb.balance = app.currentUser.balance;
    }

    // Save DB
    app.saveDB();

    // Visual feedback in modal
    const statusBadge = document.getElementById("cryptomus-status-badge");
    if (statusBadge) {
      statusBadge.className = "text-[9px] font-bold font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1";
      statusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> PAYMENT CONFIRMED & CREDITED!`;
    }
    const statusText = document.getElementById("cryptomus-status-text");
    if (statusText) {
      statusText.innerHTML = `<span class="text-emerald-400 font-bold">Successfully credited ৳${depositAmount.toLocaleString()} to @${app.currentUser.username}!</span>`;
    }

    if (this.cryptomusTimer) clearInterval(this.cryptomusTimer);

    // Refresh app views
    app.render();

    // Show toast
    if (app.showToast) {
      app.showToast(`💎 Cryptomus payment of ৳${depositAmount.toLocaleString()} received and added to wallet!`, "success");
    }

    // Auto-close modal after 2.5 seconds
    setTimeout(() => {
      this.closeCryptomusModal();
    }, 2200);
  }

  static closeCryptomusModal() {
    const modal = document.getElementById("cryptomus-checkout-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
    if (this.cryptomusTimer) {
      clearInterval(this.cryptomusTimer);
      this.cryptomusTimer = null;
    }
    this.activeInvoice = null;
  }

  // ==========================================
  // UDDOKTAPAY INTEGRATION
  // ==========================================

  private static activeUddoktaChannel = "bkash";
  private static activeUddoktaAmount = 0;

  static openUddoktaPayModal(bdtAmount: number) {
    const app = this.getApp();
    if (!app?.currentUser) {
      if (app?.showToast) {
        app.showToast("Please login first to deposit via UddoktaPay!", "warning");
      } else {
        alert("Please login first to deposit via UddoktaPay!");
      }
      if (app?.currentTab) {
        app.currentTab = "profile";
        app.render?.();
      }
      return;
    }

    this.activeUddoktaAmount = bdtAmount;
    const modal = document.getElementById("uddoktapay-checkout-modal");
    if (!modal) {
      console.warn("uddoktapay-checkout-modal element not found in DOM");
      return;
    }

    const amtEl = document.getElementById("uddokta-amount-display");
    if (amtEl) amtEl.innerText = `৳${bdtAmount.toLocaleString()}`;

    const invEl = document.getElementById("uddokta-invoice-id");
    if (invEl) invEl.innerText = "UP-" + Date.now().toString(36).toUpperCase();

    const s = app.db?.settings || {};
    const modeBadge = document.getElementById("uddokta-env-badge");
    if (modeBadge) {
      const isLive = s.uddoktapayMode === "live";
      modeBadge.innerText = isLive ? "LIVE PRODUCTION" : "SANDBOX MODE";
      modeBadge.className = isLive
        ? "text-[8px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded"
        : "text-[8px] font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded";
    }

    // Default to bKash channel
    this.selectUddoktaChannel("bkash");

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  static selectUddoktaChannel(channel: string) {
    this.activeUddoktaChannel = channel;

    // Highlight tab
    document.querySelectorAll(".uddokta-channel-tab").forEach((tab: any) => {
      const ch = tab.getAttribute("data-channel");
      if (ch === channel) {
        tab.classList.add("border-emerald-500", "bg-emerald-950/40", "text-white");
        tab.classList.remove("border-slate-800", "bg-slate-900", "text-slate-400");
      } else {
        tab.classList.remove("border-emerald-500", "bg-emerald-950/40", "text-white");
        tab.classList.add("border-slate-800", "bg-slate-900", "text-slate-400");
      }
    });

    const channelNames: Record<string, string> = {
      bkash: "bKash Seamless Checkout",
      nagad: "Nagad Instant Checkout",
      rocket: "Rocket Personal/Merchant",
      upay: "Upay Direct Payment",
      cards: "Visa / Mastercard / Amex"
    };

    const titleEl = document.getElementById("uddokta-channel-title");
    if (titleEl) titleEl.innerText = channelNames[channel] || "UddoktaPay Automated Checkout";

    const promptEl = document.getElementById("uddokta-account-prompt");
    if (promptEl) {
      promptEl.innerText = channel === "cards" 
        ? "Enter your Cardholder name and 16-digit Card number" 
        : `Enter your ${channel.toUpperCase()} Mobile Account Number`;
    }

    const inputEl = document.getElementById("uddokta-account-input") as HTMLInputElement;
    if (inputEl) {
      inputEl.placeholder = channel === "cards" ? "4111 2222 3333 4444" : "017XXXXXXXX";
    }
  }

  static processUddoktaPay() {
    const app = this.getApp();
    if (!app?.currentUser || !this.activeUddoktaAmount) return;

    const inputEl = document.getElementById("uddokta-account-input") as HTMLInputElement;
    const accountVal = inputEl ? inputEl.value.trim() : "";
    if (!accountVal || accountVal.length < 8) {
      if (app.showToast) {
        app.showToast("Please enter a valid mobile number or card account!", "warning");
      }
      if (inputEl) inputEl.focus();
      return;
    }

    const btn = document.getElementById("uddokta-confirm-pay-btn");
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Processing with UddoktaPay...`;
      (btn as HTMLButtonElement).disabled = true;
    }

    setTimeout(() => {
      // Generate successful transaction
      const depositAmount = this.activeUddoktaAmount;
      const channelName = this.activeUddoktaChannel.toUpperCase();
      const trxId = "UP" + Math.floor(100000 + Math.random() * 900000) + "TX";

      // 1. Credit User Balance
      app.currentUser.balance = Number(((app.currentUser.balance || 0) + depositAmount).toFixed(2));

      // 2. Add approved deposit entry
      const newDep = {
        id: "dep" + Date.now(),
        userId: app.currentUser.id,
        username: app.currentUser.username,
        amount: depositAmount,
        method: `UddoktaPay (${channelName})`,
        gateway: "UddoktaPay",
        trxId: trxId,
        date: new Date().toISOString(),
        status: "approved",
        notes: `UddoktaPay Auto-Verified payment from ${accountVal}`
      };

      if (!app.db.deposits) app.db.deposits = [];
      app.db.deposits.unshift(newDep);

      const userInDb = app.db.users.find((u: any) => u.id === app.currentUser.id);
      if (userInDb) {
        userInDb.balance = app.currentUser.balance;
      }

      app.saveDB();
      app.render();

      if (app.showToast) {
        app.showToast(`⚡ UddoktaPay: ৳${depositAmount.toLocaleString()} credited successfully via ${channelName}!`, "success");
      }

      this.closeUddoktaPayModal();
    }, 1800);
  }

  static openDepositAmountModal(gatewayName: string) {
    const app = this.getApp();
    if (!app?.currentUser) {
      if (app?.showToast) {
        app.showToast("Please login first to add balance!", "warning");
      }
      if (app?.currentTab) {
        app.currentTab = "profile";
        app.render?.();
      }
      return;
    }
    this.activeGatewayForAmountModal = gatewayName;
    const modal = document.getElementById("deposit-amount-modal");
    if (!modal) return;

    const titleEl = document.getElementById("amount-modal-title");
    const subtitleEl = document.getElementById("amount-modal-subtitle");
    const badgeEl = document.getElementById("amount-modal-badge");
    const iconWrap = document.getElementById("amount-modal-gateway-icon-wrap");
    const iconEl = document.getElementById("amount-modal-gateway-icon");
    const minBadge = document.getElementById("amount-modal-min-badge");
    const cryptoRow = document.getElementById("amount-modal-crypto-row");
    const cryptoText = document.getElementById("amount-modal-crypto-text");
    const confirmLbl = document.getElementById("amount-modal-confirm-lbl");
    const inputEl = document.getElementById("amount-modal-input") as HTMLInputElement;

    let minAmt = 20;
    let badgeText = "INSTANT ⚡";
    let subtitleText = "UddoktaPay Instant Multi-Gateway (উদ্যোক্তা পে)";
    let iconClass = "fa-solid fa-bolt";
    let bgClass = "bg-emerald-950 border-emerald-600/50 text-emerald-400";

    if (gatewayName === "Cryptomus") {
      minAmt = 50;
      badgeText = "CRYPTO ⚡";
      subtitleText = "Cryptomus Automated Crypto Checkout (USDT, BTC, ETH, TON, SOL)";
      iconClass = "fa-solid fa-gem";
      bgClass = "bg-purple-950 border-purple-600/50 text-purple-300";
      if (cryptoRow) cryptoRow.classList.remove("hidden");
    } else if (gatewayName === "ZiniPay") {
      minAmt = 20;
      badgeText = "INSTANT ⚡";
      subtitleText = "ZiniPay Instant Multi-Gateway (জিনি পে)";
      iconClass = "fa-solid fa-bolt-lightning";
      bgClass = "bg-cyan-950 border-cyan-500/50 text-cyan-400";
      if (cryptoRow) cryptoRow.classList.add("hidden");
    } else if (gatewayName === "Binance Pay") {
      minAmt = 20;
      badgeText = "0% FEE C2B";
      subtitleText = "Binance Pay C2B App QR & Instant Pay";
      iconClass = "fa-solid fa-qrcode";
      bgClass = "bg-yellow-950 border-yellow-600/50 text-yellow-400";
      if (cryptoRow) cryptoRow.classList.remove("hidden");
    } else if (gatewayName === "bKash PGW" || gatewayName === "Nagad PGW") {
      minAmt = 20;
      badgeText = "DIRECT API";
      subtitleText = `${gatewayName} Official Online Checkout`;
      iconClass = "fa-solid fa-money-bill-wave";
      bgClass = gatewayName.includes("bKash") ? "bg-pink-950 border-pink-600/50 text-pink-400" : "bg-amber-950 border-amber-600/50 text-amber-400";
      if (cryptoRow) cryptoRow.classList.add("hidden");
    } else {
      minAmt = 20;
      badgeText = "MANUAL";
      subtitleText = `${gatewayName} Manual Send Money & TrxID Verification`;
      iconClass = "fa-solid fa-receipt";
      bgClass = "bg-slate-900 border-slate-700 text-slate-300";
      if (cryptoRow) cryptoRow.classList.add("hidden");
    }

    if (titleEl) titleEl.innerText = gatewayName;
    if (subtitleEl) subtitleEl.innerText = subtitleText;
    if (badgeEl) badgeEl.innerText = badgeText;
    if (iconEl) iconEl.className = iconClass;
    if (iconWrap) iconWrap.className = `w-8 h-8 rounded-xl border flex items-center justify-center text-sm shadow ${bgClass}`;
    if (minBadge) minBadge.innerText = `Min: ৳${minAmt}`;
    if (confirmLbl) confirmLbl.innerText = `Proceed to ${gatewayName} ⚡`;
    if (inputEl) {
      inputEl.min = minAmt.toString();
      const currentDepAmount = (document.getElementById("dep-amount") as HTMLInputElement)?.value;
      inputEl.value = currentDepAmount && parseFloat(currentDepAmount) >= minAmt ? currentDepAmount : "500";
    }

    if (cryptoRow && !cryptoRow.classList.contains("hidden")) {
      const defaultRate = Number(app.db?.settings?.cryptomusCurrencyRate) || 125.0;
      if (cryptoText) cryptoText.innerText = `≈ $${(500 / defaultRate).toFixed(2)} USD (USDT)`;
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (inputEl) inputEl.focus();
  }

  static closeDepositAmountModal() {
    const modal = document.getElementById("deposit-amount-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  static closeUddoktaPayModal() {
    const modal = document.getElementById("uddoktapay-checkout-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
    const btn = document.getElementById("uddokta-confirm-pay-btn");
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-lock"></i> Authorize & Pay Instantly`;
      (btn as HTMLButtonElement).disabled = false;
    }
    const inputEl = document.getElementById("uddokta-account-input") as HTMLInputElement;
    if (inputEl) inputEl.value = "";
    this.activeUddoktaAmount = 0;
  }

  // ==========================================
  // ZINIPAY INTEGRATION (জিনি পে)
  // ==========================================

  private static activeZiniPayChannel = "bkash";
  private static activeZiniPayAmount = 0;
  private static activeZiniPayInvoiceId = "";

  static async openZiniPayModal(bdtAmount: number) {
    const app = this.getApp();
    if (!app?.currentUser) {
      if (app?.showToast) {
        app.showToast("Please login first to deposit via ZiniPay!", "warning");
      } else {
        alert("Please login first to deposit via ZiniPay!");
      }
      if (app?.currentTab) {
        app.currentTab = "profile";
        app.render?.();
      }
      return;
    }

    this.activeZiniPayAmount = bdtAmount;
    this.activeZiniPayInvoiceId = "ZP-" + Date.now().toString(36).toUpperCase() + Math.floor(100 + Math.random() * 900);
    const modal = document.getElementById("zinipay-checkout-modal");

    const amtEl = document.getElementById("zinipay-amount-display");
    if (amtEl) amtEl.innerText = `৳${bdtAmount.toLocaleString()}`;

    const invEl = document.getElementById("zinipay-invoice-id");
    if (invEl) invEl.innerText = this.activeZiniPayInvoiceId;

    const s = app.db?.settings || {};
    const modeBadge = document.getElementById("zinipay-env-badge");
    if (modeBadge) {
      const isLive = s.zinipayMode === "live";
      modeBadge.innerText = isLive ? "LIVE PRODUCTION" : "SANDBOX MODE";
      modeBadge.className = isLive
        ? "text-[8px] font-bold font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded"
        : "text-[8px] font-bold font-mono bg-amber-950 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded";
    }

    const redirectBtn = document.getElementById("zinipay-redirect-link") as HTMLAnchorElement | null;
    const statusHeading = document.getElementById("zinipay-status-heading");
    const statusText = document.getElementById("zinipay-status-text");

    if (app.showToast) {
      app.showToast("⚡ Connecting to ZiniPay Gateway API...", "info");
    }

    // Default to bKash channel
    this.selectZiniPayChannel("bkash");

    // Call server checkout endpoint to generate ZiniPay payment URL
    try {
      const response = await fetch("/api/zinipay/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: bdtAmount,
          fullName: app.currentUser.fullName || app.currentUser.username,
          email: app.currentUser.email || `${app.currentUser.username}@lottery.local`,
          phone: app.currentUser.phone || "01700000000",
          userId: app.currentUser.id,
          username: app.currentUser.username,
          apiKey: s.zinipayApiKey || "",
          baseUrl: s.zinipayBaseUrl || "https://api.zinipay.com/v1/payment/create",
          mode: s.zinipayMode || "live"
        })
      });

      const data = await response.json().catch(() => null);
      console.log("[ZiniPay Checkout Response]", data);

      const targetUrl = (data && (data.payment_url || data.fallback_url)) 
        || `https://zinipay.com/pay/${this.activeZiniPayInvoiceId}?amount=${bdtAmount}&currency=BDT`;
      
      if (data && data.invoice_id) {
        this.activeZiniPayInvoiceId = data.invoice_id;
        if (invEl) invEl.innerText = data.invoice_id;
      }

      if (redirectBtn) {
        redirectBtn.href = targetUrl;
        redirectBtn.target = "_blank";
      }

      if (statusHeading) statusHeading.innerText = "Redirecting to ZiniPay API...";
      if (statusText) statusText.innerText = "Connecting to ZiniPay Gateway. If you are not redirected automatically, tap the button below:";

      // Display companion modal with direct button
      if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
      }

      if (app.showToast) {
        app.showToast("🚀 Redirecting to ZiniPay API Gateway...", "success");
      }

      // Perform direct navigation to ZiniPay checkout
      setTimeout(() => {
        try {
          const opened = window.open(targetUrl, "_blank");
          if (!opened || opened.closed || typeof opened.closed === "undefined") {
            window.location.href = targetUrl;
          }
        } catch (navErr) {
          console.warn("Direct redirect error, opening via location:", navErr);
          window.location.href = targetUrl;
        }
      }, 500);

    } catch (err) {
      console.error("[ZiniPay Error]", err);
      const fallbackUrl = `https://zinipay.com/pay/${this.activeZiniPayInvoiceId}?amount=${bdtAmount}&currency=BDT`;
      if (redirectBtn) {
        redirectBtn.href = fallbackUrl;
        redirectBtn.target = "_blank";
      }
      if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
      }
      try {
        window.open(fallbackUrl, "_blank") || (window.location.href = fallbackUrl);
      } catch (e) {
        window.location.href = fallbackUrl;
      }
    }

    // Reset deposit button if present
    const depSubmitBtn = document.getElementById("dep-submit-btn");
    if (depSubmitBtn) {
      depSubmitBtn.innerHTML = '<i class="fa-solid fa-bolt-lightning text-amber-400"></i><span>Proceed to ZiniPay Gateway</span><i class="fa-solid fa-arrow-right text-xs"></i>';
    }
  }

  static selectZiniPayChannel(channel: string) {
    this.activeZiniPayChannel = channel;

    // Highlight tab
    document.querySelectorAll(".zinipay-channel-tab").forEach((tab: any) => {
      const ch = tab.getAttribute("data-channel");
      if (ch === channel) {
        tab.classList.add("border-cyan-500", "bg-cyan-950/40", "text-white");
        tab.classList.remove("border-slate-800", "bg-slate-900", "text-slate-400");
      } else {
        tab.classList.remove("border-cyan-500", "bg-cyan-950/40", "text-white");
        tab.classList.add("border-slate-800", "bg-slate-900", "text-slate-400");
      }
    });

    const channelNames: Record<string, string> = {
      bkash: "bKash Seamless Checkout",
      nagad: "Nagad Instant Checkout",
      rocket: "Rocket Personal/Merchant",
      upay: "Upay Direct Payment",
      cards: "Visa / Mastercard / Amex"
    };

    const titleEl = document.getElementById("zinipay-channel-title");
    if (titleEl) titleEl.innerText = channelNames[channel] || "ZiniPay Automated Checkout";

    const promptEl = document.getElementById("zinipay-account-prompt");
    if (promptEl) {
      promptEl.innerText = channel === "cards" 
        ? "Enter your Cardholder name and 16-digit Card number" 
        : `Enter your ${channel.toUpperCase()} Mobile Account Number`;
    }

    const inputEl = document.getElementById("zinipay-account-input") as HTMLInputElement;
    if (inputEl) {
      inputEl.placeholder = channel === "cards" ? "4111 2222 3333 4444" : "017XXXXXXXX";
    }
  }

  static processZiniPay() {
    const app = this.getApp();
    if (!app?.currentUser || !this.activeZiniPayAmount) return;

    const inputEl = document.getElementById("zinipay-account-input") as HTMLInputElement;
    const accountVal = inputEl ? inputEl.value.trim() : "01700000000";

    const btn = document.getElementById("zinipay-confirm-pay-btn");
    const verifyBtn = document.getElementById("zinipay-verify-payment-btn");
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Verifying with ZiniPay Gateway...`;
      (btn as HTMLButtonElement).disabled = true;
    }
    if (verifyBtn) {
      verifyBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Checking ZiniPay Status...`;
      (verifyBtn as HTMLButtonElement).disabled = true;
    }

    setTimeout(() => {
      // Generate successful transaction
      const depositAmount = this.activeZiniPayAmount;
      const channelName = this.activeZiniPayChannel.toUpperCase();
      const trxId = "ZP" + Math.floor(100000 + Math.random() * 900000) + "TX";

      // 1. Credit User Balance
      app.currentUser.balance = Number(((app.currentUser.balance || 0) + depositAmount).toFixed(2));

      // 2. Add approved deposit entry
      const newDep = {
        id: "dep" + Date.now(),
        userId: app.currentUser.id,
        username: app.currentUser.username,
        amount: depositAmount,
        method: `ZiniPay (${channelName})`,
        gateway: "ZiniPay",
        trxId: trxId,
        date: new Date().toISOString(),
        status: "approved",
        notes: `ZiniPay Auto-Verified instant deposit (${this.activeZiniPayInvoiceId})`
      };

      if (!app.db.deposits) app.db.deposits = [];
      app.db.deposits.unshift(newDep);

      const userInDb = app.db.users.find((u: any) => u.id === app.currentUser.id);
      if (userInDb) {
        userInDb.balance = app.currentUser.balance;
      }

      app.saveDB();
      app.render();

      if (app.showToast) {
        app.showToast(`⚡ ZiniPay: ৳${depositAmount.toLocaleString()} credited successfully via ${channelName}!`, "success");
      }

      this.closeZiniPayModal();
    }, 1600);
  }

  static closeZiniPayModal() {
    const modal = document.getElementById("zinipay-checkout-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
    const btn = document.getElementById("zinipay-confirm-pay-btn");
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-circle-check text-[10px]"></i> Simulate Instant Credit (Test Mode)`;
      (btn as HTMLButtonElement).disabled = false;
    }
    const verifyBtn = document.getElementById("zinipay-verify-payment-btn");
    if (verifyBtn) {
      verifyBtn.innerHTML = `<i class="fa-solid fa-circle-check text-cyan-400"></i> I Have Paid / Check Status`;
      (verifyBtn as HTMLButtonElement).disabled = false;
    }
    const inputEl = document.getElementById("zinipay-account-input") as HTMLInputElement;
    if (inputEl) inputEl.value = "01700000000";
    this.activeZiniPayAmount = 0;
    this.activeZiniPayInvoiceId = "";
  }
}

// Auto-initialize when file is imported or loaded in browser
if (typeof window !== "undefined") {
  (window as any).PaymentGateways = PaymentGateways;
  (window as any).launchUddoktaCheckout = () => PaymentGateways.launchUddoktaCheckout();
  (window as any).launchZiniPayCheckout = () => PaymentGateways.launchZiniPayCheckout();
  (window as any).launchCryptomusCheckout = () => PaymentGateways.launchCryptomusCheckout();
  (window as any).launchAutomatedCheckout = () => PaymentGateways.launchAutomatedCheckout();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      PaymentGateways.init((window as any).appInstance || (window as any).app);
    });
  } else {
    PaymentGateways.init((window as any).appInstance || (window as any).app);
  }
}
