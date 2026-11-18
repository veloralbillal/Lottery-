import { updateSiteBranding } from "../../state_suite/ui_updates.js";

export const AdminSettings = {
  renderAdminSettings(this: any) {
    const s = this.db.settings;
    if (!s) return;

    const maintenanceToggle = document.getElementById("sys-maintenance-toggle") as HTMLInputElement;
    if (maintenanceToggle) {
      maintenanceToggle.checked = (s.maintenanceMode === true || s.maintenanceMode === "true" || s.maintenanceMode === "1" || s.maintenanceMode === 1);
    }

    const shopEnabledToggle = document.getElementById("sys-shop-enabled-toggle") as HTMLInputElement;
    if (shopEnabledToggle) shopEnabledToggle.checked = s.shopEnabled !== false;

    const shopMaintenanceToggle = document.getElementById("sys-shop-maintenance-toggle") as HTMLInputElement;
    if (shopMaintenanceToggle) shopMaintenanceToggle.checked = s.shopMaintenanceMode === true || (this.db.shopSettings && this.db.shopSettings.isOpen === false);

    const quickdrawToggle = document.getElementById("sys-quickdraw-toggle") as HTMLInputElement;
    if (quickdrawToggle) quickdrawToggle.checked = s.quickDrawEnabled !== false;

    const mirofishEnabledToggle = document.getElementById("sys-mirofish-enabled-toggle") as HTMLInputElement;
    if (mirofishEnabledToggle) mirofishEnabledToggle.checked = s.mirofishEnabled !== false;

    const mirofishChatToggle = document.getElementById("sys-mirofish-chat-toggle") as HTMLInputElement;
    if (mirofishChatToggle) mirofishChatToggle.checked = s.mirofishChatEnabled !== false;

    const maintenanceMsg = document.getElementById("sys-maintenance-msg") as HTMLTextAreaElement;
    if (maintenanceMsg) maintenanceMsg.value = s.maintenanceMessage || "";

    const appUrl = document.getElementById("sys-app-url") as HTMLInputElement;
    if (appUrl) appUrl.value = s.forceUpdateLink || "";

    const appVer = document.getElementById("sys-app-ver") as HTMLInputElement;
    if (appVer) appVer.value = s.appVersion || "5.0";

    const adminP = document.getElementById("sys-admin-p") as HTMLInputElement;
    if (adminP) adminP.value = s.adminPass || "Admin123";

    const agentRefBonus = document.getElementById("sys-agent-referral-bonus") as HTMLInputElement;
    if (agentRefBonus) agentRefBonus.value = s.agentReferralBonus ?? 100;

    const signupBonusToggle = document.getElementById("sys-signup-bonus-toggle") as HTMLInputElement;
    if (signupBonusToggle) signupBonusToggle.checked = s.signupBonusEnabled !== false;

    const signupBonusAmount = document.getElementById("sys-signup-bonus-amount") as HTMLInputElement;
    if (signupBonusAmount) signupBonusAmount.value = s.signupBonus !== undefined ? s.signupBonus : 50;

    const signupBonusWeb = document.getElementById("sys-signup-bonus") as HTMLInputElement;
    if (signupBonusWeb) signupBonusWeb.value = s.signupBonus !== undefined ? s.signupBonus : 50;

    const whatsappUrl = document.getElementById("sys-whatsapp-url") as HTMLInputElement;
    if (whatsappUrl) whatsappUrl.value = s.whatsappUrl || "";

    const minReferralDep = document.getElementById("sys-min-referral-deposit") as HTMLInputElement;
    if (minReferralDep) minReferralDep.value = s.minReferralDeposit ?? 50;

    const limitInput = document.getElementById("admin-consecutive-block-limit") as HTMLInputElement;
    if (limitInput) limitInput.value = s.consecutiveDrawsLimit || 5;

    const setVal = (id: string, val: any) => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el) el.value = val !== undefined && val !== null ? val : "";
    };
    const setChk = (id: string, checked: boolean) => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el) el.checked = !!checked;
    };

    setChk("sys-pay-bkash-enabled", s.payBkashEnabled !== false);
    setVal("sys-pay-bkash-personal", s.mobilePersonalBkash || s.bkashNumber || "+8801700000001");
    setVal("sys-pay-bkash-agent", s.mobileAgentBkash || "");
    setVal("sys-pay-bkash-instruction", s.mobileInstructionBkash || "");

    setChk("sys-pay-nagad-enabled", s.payNagadEnabled !== false);
    setVal("sys-pay-nagad-personal", s.mobilePersonalNagad || s.nagadNumber || "+8801900000005");
    setVal("sys-pay-nagad-agent", s.mobileAgentNagad || "");
    setVal("sys-pay-nagad-instruction", s.mobileInstructionNagad || "");

    setChk("sys-pay-rocket-enabled", s.payRocketEnabled !== false);
    setVal("sys-pay-rocket-personal", s.mobilePersonalRocket || s.rocketNumber || "+8801800000009");
    setVal("sys-pay-rocket-agent", s.mobileAgentRocket || "");
    setVal("sys-pay-rocket-instruction", s.mobileInstructionRocket || "");

    setChk("sys-pay-upay-enabled", s.payUpayEnabled !== false);
    setVal("sys-pay-upay-personal", s.mobilePersonalUpay || "");
    setVal("sys-pay-upay-agent", s.mobileAgentUpay || "");
    setVal("sys-pay-upay-instruction", s.mobileInstructionUpay || "");

    setChk("sys-pay-dbbl-enabled", s.payDbblEnabled !== false);
    setVal("sys-pay-dbbl", s.dbblDetails || "");
    setVal("sys-pay-dbbl-instruction", s.dbblInstruction || "");

    setChk("sys-pay-usdt-enabled", s.payUsdtEnabled !== false);
    setVal("sys-pay-crypto-usdt", s.cryptoAddressUSDT || s.cryptoAddress || "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X");
    setChk("sys-pay-btc-enabled", s.payBtcEnabled === true);
    setVal("sys-pay-crypto-btc", s.cryptoAddressBTC || "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa");
    setChk("sys-pay-eth-enabled", s.payEthEnabled === true);
    setVal("sys-pay-crypto-eth", s.cryptoAddressETH || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
    
    const qrTypeSelect = (document.getElementById("sys-pay-crypto-qr-type") || document.getElementById("sys-crypto-qr-type")) as HTMLSelectElement;
    if (qrTypeSelect) qrTypeSelect.value = s.cryptoQRType || "auto";
    
    setVal("sys-pay-crypto-qr-usdt", s.cryptoQRUrlUSDT || "");
    setVal("sys-pay-crypto-qr-btc", s.cryptoQRUrlBTC || "");
    setVal("sys-pay-crypto-qr-eth", s.cryptoQRUrlETH || "");
    setVal("sys-pay-crypto-instruction", s.cryptoInstruction || "");

    setChk("sys-pay-agent-deposit-enabled", s.payAgentDepositEnabled !== false);
    setVal("sys-pay-agent-deposit-instruction", s.mobileInstructionAgentDeposit || "");
    setChk("sys-pay-agent-withdraw-enabled", s.payAgentWithdrawEnabled !== false);
    setVal("sys-pay-agent-withdraw-instruction", s.mobileInstructionAgentWithdraw || "");

    setChk("sys-pay-master-enabled", s.payMasterEnabled !== false);
    setChk("sys-pay-uddoktapay-enabled", s.payUddoktapayEnabled !== false);
    setVal("sys-pay-uddoktapay-apikey", s.uddoktapayApiKey || "");
    setVal("sys-pay-uddoktapay-mode", s.uddoktapayMode || "sandbox");
    setVal("sys-pay-uddoktapay-url", s.uddoktapayBaseUrl || "https://sandbox.uddoktapay.com/api/checkout-v2");
    setVal("sys-pay-uddoktapay-instruction", s.uddoktapayInstruction || "");

    setChk("sys-pay-zinipay-enabled", s.payZinipayEnabled !== false && s.payZiniPayEnabled !== false);
    setVal("sys-pay-zinipay-apikey", s.zinipayApiKey || "");
    setVal("sys-pay-zinipay-mode", s.zinipayMode || "live");
    setVal("sys-pay-zinipay-url", s.zinipayBaseUrl || "https://api.zinipay.com/v1/payment/create");
    setVal("sys-pay-zinipay-instruction", s.zinipayInstruction || "");

    setChk("sys-pay-bkash-pgw-enabled", s.payBkashPgwEnabled !== false && s.payBkashPgwEnabled !== undefined);
    setVal("sys-pay-bkash-pgw-appkey", s.bkashPgwAppKey || "");
    setVal("sys-pay-bkash-pgw-secret", s.bkashPgwSecret || "");
    setVal("sys-pay-bkash-pgw-user", s.bkashPgwUsername || "");
    setVal("sys-pay-bkash-pgw-mode", s.bkashPgwMode || "sandbox");

    setChk("sys-pay-nagad-pgw-enabled", s.payNagadPgwEnabled !== false && s.payNagadPgwEnabled !== undefined);
    setVal("sys-pay-nagad-pgw-merchant", s.nagadPgwMerchantId || "");
    setVal("sys-pay-nagad-pgw-mode", s.nagadPgwMode || "sandbox");
    setVal("sys-pay-nagad-pgw-publickey", s.nagadPgwPublicKey || "");

    setChk("sys-pay-aamarpay-enabled", s.payAamarpayEnabled !== false && s.payAamarpayEnabled !== undefined);
    setVal("sys-pay-aamarpay-store", s.aamarpayStoreId || "");
    setVal("sys-pay-aamarpay-signature", s.aamarpaySignatureKey || "");
    setVal("sys-pay-aamarpay-mode", s.aamarpayMode || "sandbox");

    setChk("sys-pay-binance-enabled", s.payBinanceEnabled !== false && s.payBinancePayEnabled !== false);
    setVal("sys-pay-binance-merchant", s.binanceMerchantId || "");
    setVal("sys-pay-binance-apikey", s.binanceApiKey || "");

    setChk("sys-pay-cryptomus-enabled", s.payCryptomusEnabled !== false);
    setVal("sys-pay-cryptomus-merchant", s.cryptomusMerchantUuid || "");
    setVal("sys-pay-cryptomus-apikey", s.cryptomusApiKey || "");
    setVal("sys-pay-cryptomus-payoutkey", s.cryptomusPayoutKey || "");
    setVal("sys-pay-cryptomus-mode", s.cryptomusMode || "sandbox");
    setVal("sys-pay-cryptomus-rate", s.cryptomusCurrencyRate ?? 125.0);
    setVal("sys-pay-cryptomus-webhook", s.cryptomusWebhookUrl || "");
    setVal("sys-pay-cryptomus-instruction", s.cryptomusInstruction || "");

    const toggleCustomFields = () => {
      const isCustom = !!(qrTypeSelect && qrTypeSelect.value === "custom");
      const customUrlsContainer = document.getElementById("sys-pay-crypto-custom-urls");
      if (customUrlsContainer) {
        customUrlsContainer.classList.toggle("hidden", !isCustom);
      }
      document.querySelectorAll(".custom-qr-file-wrapper").forEach(w => {
        w.classList.toggle("hidden", !isCustom);
      });
    };
    toggleCustomFields();
    if (qrTypeSelect) qrTypeSelect.onchange = toggleCustomFields;

    const depBoostToggle = document.getElementById("sys-dep-boost-toggle") as HTMLInputElement;
    if (depBoostToggle) {
      depBoostToggle.checked = s.depBoostEnabled !== false && s.depositBonusEnabled !== false;
    }
    const depBoostPercent = document.getElementById("sys-dep-boost-percent") as HTMLInputElement;
    if (depBoostPercent) {
      depBoostPercent.value = s.depBoostPercent ?? s.depositBonusRate ?? 10;
    }
    const depBoostMin = document.getElementById("sys-dep-boost-min") as HTMLInputElement;
    if (depBoostMin) {
      depBoostMin.value = s.depBoostMin ?? s.depositBonusMin ?? 500;
    }

    this.refreshAdminQRPreview();
    this.updatePaymentGatewaysStatusUI();
    this.bindGateways1ClickControls();
    this.renderWebPushAdsHistory();
    this.renderSEOAndFaviconSettings();
    this.bindSEOAndFaviconControls();
    this.bindAllSettingsForms();
  },

  updatePaymentGatewaysStatusUI(this: any) {
    const s = this.db.settings || {};
    const channelCheckboxIds = [
      "sys-pay-bkash-enabled",
      "sys-pay-nagad-enabled",
      "sys-pay-rocket-enabled",
      "sys-pay-upay-enabled",
      "sys-pay-dbbl-enabled",
      "sys-pay-usdt-enabled",
      "sys-pay-btc-enabled",
      "sys-pay-eth-enabled",
      "sys-pay-uddoktapay-enabled",
      "sys-pay-zinipay-enabled",
      "sys-pay-bkash-pgw-enabled",
      "sys-pay-nagad-pgw-enabled",
      "sys-pay-aamarpay-enabled",
      "sys-pay-binance-enabled",
      "sys-pay-cryptomus-enabled",
      "sys-pay-agent-deposit-enabled",
      "sys-pay-agent-withdraw-enabled"
    ];

    let activeCount = 0;
    channelCheckboxIds.forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el && el.checked) activeCount++;
    });

    const masterEl = document.getElementById("sys-pay-master-enabled") as HTMLInputElement;
    const isMasterOn = masterEl ? masterEl.checked : (s.payMasterEnabled !== false);
    const totalChannels = channelCheckboxIds.length;

    const linesCountEl = document.getElementById("admin-pay-lines-count");
    if (linesCountEl) {
      linesCountEl.textContent = `${activeCount} / ${totalChannels}`;
      linesCountEl.className = activeCount === 0 
        ? "text-sm font-black text-rose-500 mt-0.5 block" 
        : (activeCount === totalChannels ? "text-sm font-black text-emerald-400 mt-0.5 block" : "text-sm font-black text-amber-400 mt-0.5 block");
    }

    const badgeEl = document.getElementById("admin-pay-master-badge");
    const statusTextEl = document.getElementById("admin-pay-master-status-text");
    const pulseEl = document.getElementById("admin-pay-master-pulse");
    const iconWrapEl = document.getElementById("admin-pay-master-icon-wrap");
    const depStatusEl = document.getElementById("admin-pay-user-dep-status");
    const wdStatusEl = document.getElementById("admin-pay-user-wd-status");

    if (!isMasterOn || activeCount === 0) {
      if (badgeEl) badgeEl.className = "text-[9px] px-2.5 py-0.5 rounded-full font-bold font-mono bg-rose-950/80 text-rose-300 border border-rose-500/50 flex items-center gap-1.5 shadow";
      if (statusTextEl) statusTextEl.textContent = "ALL PAYMENTS DISABLED (0 ACTIVE)";
      if (pulseEl) pulseEl.className = "w-2 h-2 rounded-full bg-rose-500";
      if (iconWrapEl) iconWrapEl.className = "w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/50 flex items-center justify-center text-rose-400 text-xl shadow-[0_0_20px_rgba(244,63,94,0.3)] shrink-0 transition-all";
      if (depStatusEl) {
        depStatusEl.textContent = "PAUSED (LOCKED)";
        depStatusEl.className = "text-sm font-black text-rose-400 mt-0.5 block";
      }
      if (wdStatusEl) {
        wdStatusEl.textContent = "PAUSED (LOCKED)";
        wdStatusEl.className = "text-sm font-black text-rose-400 mt-0.5 block";
      }
    } else if (activeCount === totalChannels) {
      if (badgeEl) badgeEl.className = "text-[9px] px-2.5 py-0.5 rounded-full font-bold font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow";
      if (statusTextEl) statusTextEl.textContent = `ALL CHANNELS ACTIVE (${totalChannels}/${totalChannels})`;
      if (pulseEl) pulseEl.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
      if (iconWrapEl) iconWrapEl.className = "w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0 transition-all";
      if (depStatusEl) {
        depStatusEl.textContent = "ACTIVE";
        depStatusEl.className = "text-sm font-black text-emerald-400 mt-0.5 block";
      }
      if (wdStatusEl) {
        wdStatusEl.textContent = "ACTIVE";
        wdStatusEl.className = "text-sm font-black text-emerald-400 mt-0.5 block";
      }
    } else {
      if (badgeEl) badgeEl.className = "text-[9px] px-2.5 py-0.5 rounded-full font-bold font-mono bg-amber-950/80 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 shadow";
      if (statusTextEl) statusTextEl.textContent = `PARTIAL ACTIVE (${activeCount}/${totalChannels})`;
      if (pulseEl) pulseEl.className = "w-2 h-2 rounded-full bg-amber-400 animate-pulse";
      if (iconWrapEl) iconWrapEl.className = "w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 transition-all";
      if (depStatusEl) {
        depStatusEl.textContent = `${activeCount} ACTIVE`;
        depStatusEl.className = "text-sm font-black text-amber-400 mt-0.5 block";
      }
      if (wdStatusEl) {
        wdStatusEl.textContent = "SELECTIVE";
        wdStatusEl.className = "text-sm font-black text-amber-400 mt-0.5 block";
      }
    }
  },

  setAllPaymentGatewaysState(this: any, enabled: boolean, showToast = true) {
    const s = this.db.settings;
    if (!s) return;

    const channelKeys = [
      { id: "sys-pay-bkash-enabled", key: "payBkashEnabled" },
      { id: "sys-pay-nagad-enabled", key: "payNagadEnabled" },
      { id: "sys-pay-rocket-enabled", key: "payRocketEnabled" },
      { id: "sys-pay-upay-enabled", key: "payUpayEnabled" },
      { id: "sys-pay-dbbl-enabled", key: "payDbblEnabled" },
      { id: "sys-pay-usdt-enabled", key: "payUsdtEnabled" },
      { id: "sys-pay-btc-enabled", key: "payBtcEnabled" },
      { id: "sys-pay-eth-enabled", key: "payEthEnabled" },
      { id: "sys-pay-uddoktapay-enabled", key: "payUddoktapayEnabled" },
      { id: "sys-pay-zinipay-enabled", key: "payZinipayEnabled" },
      { id: "sys-pay-bkash-pgw-enabled", key: "payBkashPgwEnabled" },
      { id: "sys-pay-nagad-pgw-enabled", key: "payNagadPgwEnabled" },
      { id: "sys-pay-aamarpay-enabled", key: "payAamarpayEnabled" },
      { id: "sys-pay-binance-enabled", key: "payBinanceEnabled" },
      { id: "sys-pay-cryptomus-enabled", key: "payCryptomusEnabled" },
      { id: "sys-pay-agent-deposit-enabled", key: "payAgentDepositEnabled" },
      { id: "sys-pay-agent-withdraw-enabled", key: "payAgentWithdrawEnabled" }
    ];

    channelKeys.forEach(item => {
      s[item.key] = enabled;
      const el = document.getElementById(item.id) as HTMLInputElement;
      if (el) el.checked = enabled;
    });

    s.payZiniPayEnabled = enabled;
    s.payBinancePayEnabled = enabled;
    s.payMasterEnabled = enabled;
    const masterEl = document.getElementById("sys-pay-master-enabled") as HTMLInputElement;
    if (masterEl) masterEl.checked = enabled;

    this.saveDB();
    this.updatePaymentGatewaysStatusUI();

    if ((window as any).app) {
      if (typeof (window as any).app.rebuildDepositGatewaySelect === "function") {
        (window as any).app.rebuildDepositGatewaySelect();
      }
      if (typeof (window as any).app.rebuildWithdrawGatewaySelect === "function") {
        (window as any).app.rebuildWithdrawGatewaySelect();
      }
    }

    if (showToast) {
      if (enabled) {
        this.showToast("⚡ ১ ক্লিকে সমস্ত পেমেন্ট গেটওয়ে চালু করা হয়েছে! (All 17 Payment Gateways Enabled)", "success");
      } else {
        this.showToast("🛑 ১ ক্লিকে সমস্ত পেমেন্ট গেটওয়ে বন্ধ করা হয়েছে! (Emergency Lock: All Payment Gateways Disabled)", "error");
      }
    }
  },

  async saveGatewaysSettings(this: any, formEl?: HTMLFormElement) {
    if (!this.db) this.db = {};
    if (!this.db.settings) this.db.settings = {};
    const s = this.db.settings;

    const getVal = (id: string, fallback = "") => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      return el ? el.value.trim() : fallback;
    };
    const getChk = (id: string, fallback = false) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      return el ? !!el.checked : fallback;
    };

    const submitBtn = formEl?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-amber-300"></i> Saving & Syncing Payment Gateways...`;
    }

    try {
      // Master Switch & Automated Gateways
      s.payMasterEnabled = getChk("sys-pay-master-enabled", true);

      s.payUddoktapayEnabled = getChk("sys-pay-uddoktapay-enabled", true);
      s.uddoktapayApiKey = getVal("sys-pay-uddoktapay-apikey", s.uddoktapayApiKey || "");
      s.uddoktapayMode = getVal("sys-pay-uddoktapay-mode", "sandbox") || "sandbox";
      s.uddoktapayBaseUrl = getVal("sys-pay-uddoktapay-url", "https://sandbox.uddoktapay.com/api/checkout-v2");
      s.uddoktapayInstruction = getVal("sys-pay-uddoktapay-instruction", "");

      const ziniEnabled = getChk("sys-pay-zinipay-enabled", true);
      s.payZinipayEnabled = ziniEnabled;
      s.payZiniPayEnabled = ziniEnabled;
      s.zinipayApiKey = getVal("sys-pay-zinipay-apikey", s.zinipayApiKey || "");
      s.zinipayMode = getVal("sys-pay-zinipay-mode", "live") || "live";
      s.zinipayBaseUrl = getVal("sys-pay-zinipay-url", "https://api.zinipay.com/v1/payment/create");
      s.zinipayInstruction = getVal("sys-pay-zinipay-instruction", "");

      s.payBkashPgwEnabled = getChk("sys-pay-bkash-pgw-enabled", false);
      s.bkashPgwAppKey = getVal("sys-pay-bkash-pgw-appkey", "");
      s.bkashPgwSecret = getVal("sys-pay-bkash-pgw-secret", "");
      s.bkashPgwUsername = getVal("sys-pay-bkash-pgw-user", "");
      s.bkashPgwMode = getVal("sys-pay-bkash-pgw-mode", "sandbox") || "sandbox";

      s.payNagadPgwEnabled = getChk("sys-pay-nagad-pgw-enabled", false);
      s.nagadPgwMerchantId = getVal("sys-pay-nagad-pgw-merchant", "");
      s.nagadPgwMode = getVal("sys-pay-nagad-pgw-mode", "sandbox") || "sandbox";
      s.nagadPgwPublicKey = getVal("sys-pay-nagad-pgw-publickey", "");

      s.payAamarpayEnabled = getChk("sys-pay-aamarpay-enabled", false);
      s.aamarpayStoreId = getVal("sys-pay-aamarpay-store", "");
      s.aamarpaySignatureKey = getVal("sys-pay-aamarpay-signature", "");
      s.aamarpayMode = getVal("sys-pay-aamarpay-mode", "sandbox") || "sandbox";

      const binanceEnabled = getChk("sys-pay-binance-enabled", false);
      s.payBinanceEnabled = binanceEnabled;
      s.payBinancePayEnabled = binanceEnabled;
      s.binanceMerchantId = getVal("sys-pay-binance-merchant", "");
      s.binanceApiKey = getVal("sys-pay-binance-apikey", "");

      s.payCryptomusEnabled = getChk("sys-pay-cryptomus-enabled", true);
      s.cryptomusMerchantUuid = getVal("sys-pay-cryptomus-merchant", "");
      s.cryptomusApiKey = getVal("sys-pay-cryptomus-apikey", "");
      s.cryptomusPayoutKey = getVal("sys-pay-cryptomus-payoutkey", "");
      s.cryptomusMode = getVal("sys-pay-cryptomus-mode", "sandbox") || "sandbox";
      const parsedRate = parseFloat(getVal("sys-pay-cryptomus-rate", "125"));
      s.cryptomusCurrencyRate = !isNaN(parsedRate) && parsedRate > 0 ? parsedRate : 125.0;
      s.cryptomusWebhookUrl = getVal("sys-pay-cryptomus-webhook", "");
      s.cryptomusInstruction = getVal("sys-pay-cryptomus-instruction", "");

      // Direct Crypto Wallets & QR
      s.payUsdtEnabled = getChk("sys-pay-usdt-enabled", true);
      s.cryptoAddressUSDT = getVal("sys-pay-crypto-usdt", s.cryptoAddressUSDT || "");
      s.cryptoAddress = s.cryptoAddressUSDT;
      s.payBtcEnabled = getChk("sys-pay-btc-enabled", false);
      s.cryptoAddressBTC = getVal("sys-pay-crypto-btc", s.cryptoAddressBTC || "");
      s.payEthEnabled = getChk("sys-pay-eth-enabled", false);
      s.cryptoAddressETH = getVal("sys-pay-crypto-eth", s.cryptoAddressETH || "");
      s.cryptoQRType = getVal("sys-pay-crypto-qr-type", getVal("sys-crypto-qr-type", "auto")) || "auto";
      s.cryptoQRUrlUSDT = getVal("sys-pay-crypto-qr-usdt", "");
      s.cryptoQRUrlBTC = getVal("sys-pay-crypto-qr-btc", "");
      s.cryptoQRUrlETH = getVal("sys-pay-crypto-qr-eth", "");
      s.cryptoInstruction = getVal("sys-pay-crypto-instruction", "");

      // Manual Mobile Banking
      s.payBkashEnabled = getChk("sys-pay-bkash-enabled", true);
      s.mobilePersonalBkash = getVal("sys-pay-bkash-personal", "");
      s.bkashNumber = s.mobilePersonalBkash;
      s.mobileAgentBkash = getVal("sys-pay-bkash-agent", "");
      s.mobileInstructionBkash = getVal("sys-pay-bkash-instruction", "");

      s.payNagadEnabled = getChk("sys-pay-nagad-enabled", true);
      s.mobilePersonalNagad = getVal("sys-pay-nagad-personal", "");
      s.nagadNumber = s.mobilePersonalNagad;
      s.mobileAgentNagad = getVal("sys-pay-nagad-agent", "");
      s.mobileInstructionNagad = getVal("sys-pay-nagad-instruction", "");

      s.payRocketEnabled = getChk("sys-pay-rocket-enabled", true);
      s.mobilePersonalRocket = getVal("sys-pay-rocket-personal", "");
      s.rocketNumber = s.mobilePersonalRocket;
      s.mobileAgentRocket = getVal("sys-pay-rocket-agent", "");
      s.mobileInstructionRocket = getVal("sys-pay-rocket-instruction", "");

      s.payUpayEnabled = getChk("sys-pay-upay-enabled", true);
      s.mobilePersonalUpay = getVal("sys-pay-upay-personal", "");
      s.mobileAgentUpay = getVal("sys-pay-upay-agent", "");
      s.mobileInstructionUpay = getVal("sys-pay-upay-instruction", "");

      // Traditional Bank & Agent Channels
      s.payDbblEnabled = getChk("sys-pay-dbbl-enabled", true);
      s.dbblDetails = getVal("sys-pay-dbbl", "");
      s.dbblInstruction = getVal("sys-pay-dbbl-instruction", "");

      s.payAgentDepositEnabled = getChk("sys-pay-agent-deposit-enabled", true);
      s.mobileInstructionAgentDeposit = getVal("sys-pay-agent-deposit-instruction", "");
      s.payAgentWithdrawEnabled = getChk("sys-pay-agent-withdraw-enabled", true);
      s.mobileInstructionAgentWithdraw = getVal("sys-pay-agent-withdraw-instruction", "");

      const syncResult = await this.saveDB(true);

      this.refreshAdminQRPreview();
      this.updatePaymentGatewaysStatusUI();
      if (typeof this.rebuildDepositGatewaySelect === "function") this.rebuildDepositGatewaySelect();
      if (typeof this.rebuildWithdrawGatewaySelect === "function") this.rebuildWithdrawGatewaySelect();

      if (syncResult === false) {
        this.showToast("Payment Gateways saved locally, but SQL sync failed.", "warning");
      } else {
        this.showToast("⚡ Payment Gateways Suite saved & synced to SQL database!", "success");
      }
    } catch (err: any) {
      console.error("[AdminSettings] Failed saving payment gateways:", err);
      this.showToast("Failed to save payment gateway settings: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    }
  },

  bindGateways1ClickControls(this: any) {
    const gatewaysForm = document.getElementById("admin-settings-gateways-form") as HTMLFormElement | null;
    if (gatewaysForm && !(gatewaysForm as any)._submitBound) {
      (gatewaysForm as any)._submitBound = true;
      gatewaysForm.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.saveGatewaysSettings(gatewaysForm);
      });
    }

    const qrSelector = document.getElementById("admin-spa-qr-selector") as HTMLSelectElement | null;
    if (qrSelector && !(qrSelector as any)._qrBound) {
      (qrSelector as any)._qrBound = true;
      qrSelector.addEventListener("change", () => this.refreshAdminQRPreview());
    }

    if (this._gatewaysEventsBound) return;
    this._gatewaysEventsBound = true;

    const enableAllBtn = document.getElementById("btn-1click-enable-all-payments");
    if (enableAllBtn) {
      enableAllBtn.addEventListener("click", () => {
        this.setAllPaymentGatewaysState(true, true);
      });
    }

    const disableAllBtn = document.getElementById("btn-1click-disable-all-payments");
    if (disableAllBtn) {
      disableAllBtn.addEventListener("click", () => {
        this.setAllPaymentGatewaysState(false, true);
      });
    }

    const masterEl = document.getElementById("sys-pay-master-enabled") as HTMLInputElement;
    if (masterEl) {
      masterEl.addEventListener("change", () => {
        this.setAllPaymentGatewaysState(masterEl.checked, true);
      });
    }

    const channelKeyMap: Record<string, string> = {
      "sys-pay-bkash-enabled": "payBkashEnabled",
      "sys-pay-nagad-enabled": "payNagadEnabled",
      "sys-pay-rocket-enabled": "payRocketEnabled",
      "sys-pay-upay-enabled": "payUpayEnabled",
      "sys-pay-dbbl-enabled": "payDbblEnabled",
      "sys-pay-usdt-enabled": "payUsdtEnabled",
      "sys-pay-btc-enabled": "payBtcEnabled",
      "sys-pay-eth-enabled": "payEthEnabled",
      "sys-pay-uddoktapay-enabled": "payUddoktapayEnabled",
      "sys-pay-zinipay-enabled": "payZinipayEnabled",
      "sys-pay-bkash-pgw-enabled": "payBkashPgwEnabled",
      "sys-pay-nagad-pgw-enabled": "payNagadPgwEnabled",
      "sys-pay-aamarpay-enabled": "payAamarpayEnabled",
      "sys-pay-binance-enabled": "payBinanceEnabled",
      "sys-pay-cryptomus-enabled": "payCryptomusEnabled",
      "sys-pay-agent-deposit-enabled": "payAgentDepositEnabled",
      "sys-pay-agent-withdraw-enabled": "payAgentWithdrawEnabled"
    };

    Object.keys(channelKeyMap).forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el) {
        el.addEventListener("change", () => {
          const key = channelKeyMap[id];
          if (this.db && this.db.settings) {
            this.db.settings[key] = el.checked;
            if (key === "payBinanceEnabled") {
              this.db.settings.payBinancePayEnabled = el.checked;
            }
            if (key === "payZinipayEnabled") {
              this.db.settings.payZiniPayEnabled = el.checked;
            }
            this.saveDB();
          }
          this.updatePaymentGatewaysStatusUI();
          if ((window as any).app) {
            if (typeof (window as any).app.rebuildDepositGatewaySelect === "function") {
              (window as any).app.rebuildDepositGatewaySelect();
            }
            if (typeof (window as any).app.rebuildWithdrawGatewaySelect === "function") {
              (window as any).app.rebuildWithdrawGatewaySelect();
            }
          }
        });
      }
    });
  },

  refreshAdminQRPreview(this: any) {
    const s = this.db.settings || {};
    const btcQR = document.getElementById("admin-qr-preview-btc") as HTMLImageElement;
    const ethQR = document.getElementById("admin-qr-preview-eth") as HTMLImageElement;
    const usdtQR = document.getElementById("admin-qr-preview-usdt") as HTMLImageElement;
    const spaPreview = document.getElementById("admin-spa-qr-preview") as HTMLImageElement;
    const spaSelector = document.getElementById("admin-spa-qr-selector") as HTMLSelectElement;

    const qrTypeEl = (document.getElementById("sys-pay-crypto-qr-type") || document.getElementById("sys-crypto-qr-type")) as HTMLSelectElement | null;
    const qrType = qrTypeEl ? qrTypeEl.value : (s.cryptoQRType || "auto");

    const usdtAddr = (document.getElementById("sys-pay-crypto-usdt") as HTMLInputElement | null)?.value.trim() || s.cryptoAddressUSDT || s.cryptoAddress || "";
    const btcAddr = (document.getElementById("sys-pay-crypto-btc") as HTMLInputElement | null)?.value.trim() || s.cryptoAddressBTC || "";
    const ethAddr = (document.getElementById("sys-pay-crypto-eth") as HTMLInputElement | null)?.value.trim() || s.cryptoAddressETH || "";

    const usdtCustom = (document.getElementById("sys-pay-crypto-qr-usdt") as HTMLInputElement | null)?.value.trim() || s.cryptoQRUrlUSDT || "";
    const btcCustom = (document.getElementById("sys-pay-crypto-qr-btc") as HTMLInputElement | null)?.value.trim() || s.cryptoQRUrlBTC || "";
    const ethCustom = (document.getElementById("sys-pay-crypto-qr-eth") as HTMLInputElement | null)?.value.trim() || s.cryptoQRUrlETH || "";

    const btcSrc = qrType === "custom" && btcCustom ? btcCustom : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(btcAddr)}`;
    const ethSrc = qrType === "custom" && ethCustom ? ethCustom : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ethAddr)}`;
    const usdtSrc = qrType === "custom" && usdtCustom ? usdtCustom : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(usdtAddr)}`;

    if (btcQR) btcQR.src = btcSrc;
    if (ethQR) ethQR.src = ethSrc;
    if (usdtQR) usdtQR.src = usdtSrc;
    if (spaPreview) {
      const sel = spaSelector ? spaSelector.value : "usdt";
      spaPreview.src = sel === "btc" ? btcSrc : (sel === "eth" ? ethSrc : usdtSrc);
    }
  },

  renderWebPushAdsHistory(this: any) {
    const listEl = document.getElementById("admin-webpush-history-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    const history = this.db.webPushHistory || [];
    if (history.length === 0) {
      listEl.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-500 font-mono text-[10.5px]">No notification history found.</td></tr>`;
      return;
    }

    const sorted = [...history].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sorted.forEach((h: any) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 text-xs border-b border-slate-800/40 transition";
      row.innerHTML = `
        <td class="p-3 text-white font-bold">${h.title}</td>
        <td class="p-3 text-slate-400 max-w-[200px] truncate">${h.message}</td>
        <td class="p-3 text-slate-500 font-mono">${new Date(h.date).toLocaleString()}</td>
        <td class="p-3 text-right">
          <button class="delete-push-btn bg-slate-800 hover:bg-rose-900/40 text-rose-400 p-1.5 rounded-lg transition" data-id="${h.id}">
             <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      `;
      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".delete-push-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.db.webPushHistory = (this.db.webPushHistory || []).filter((x: any) => x.id !== id);
        this.saveDB();
        this.renderWebPushAdsHistory();
      });
    });

    this.refreshIcons();
  },

  renderSEOAndFaviconSettings(this: any) {
    const s = this.db.settings || {};
    const titleEl = document.getElementById("sys-seo-title") as HTMLInputElement;
    const descEl = (document.getElementById("sys-seo-desc") || document.getElementById("sys-seo-description")) as HTMLTextAreaElement;
    const keywordsEl = document.getElementById("sys-seo-keywords") as HTMLInputElement;
    const faviconEl = document.getElementById("sys-favicon-url") as HTMLInputElement;
    const seoImgEl = document.getElementById("sys-seo-image") as HTMLInputElement;
    const logoEl = document.getElementById("sys-logo-url") as HTMLInputElement;
    const appLogoUrlInput = document.getElementById("sys-app-logo-url-input") as HTMLInputElement;

    if (titleEl) titleEl.value = s.seoTitle || "";
    if (descEl) descEl.value = s.seoDescription || "";
    if (keywordsEl) keywordsEl.value = s.seoKeywords || "";
    if (faviconEl) faviconEl.value = s.faviconUrl || "";
    if (seoImgEl) seoImgEl.value = s.seoImage || s.ogImage || "";
    const activeLogo = String(s.headerLogo || s.appLogo || s.logoUrl || "").trim();
    if (logoEl) logoEl.value = activeLogo;
    if (appLogoUrlInput) appLogoUrlInput.value = activeLogo;
    updateSiteBranding(this.db);
  },

  bindSEOAndFaviconControls(this: any) {
    if (this._seoEventsBound) return;
    this._seoEventsBound = true;

    const seoForm = document.getElementById("admin-settings-seo-form") as HTMLFormElement | null;
    if (seoForm && !(seoForm as any)._submitBound) {
      (seoForm as any)._submitBound = true;
      seoForm.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.saveSeoSettings(seoForm);
      });
    }

    const saveBtn = document.getElementById("save-seo-settings-btn");
    if (saveBtn && !(saveBtn as any)._clickBound) {
      (saveBtn as any)._clickBound = true;
      saveBtn.addEventListener("click", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.saveSeoSettings(seoForm || undefined);
      });
    }

    const previewShareImgBtn = document.getElementById("btn-preview-share-img");
    if (previewShareImgBtn && !previewShareImgBtn.dataset.bound) {
      previewShareImgBtn.dataset.bound = "true";
      previewShareImgBtn.addEventListener("click", () => {
        const seoImgInput = document.getElementById("sys-seo-image") as HTMLInputElement | null;
        const url = seoImgInput?.value.trim();
        if (url) {
          window.open(url, "_blank");
        } else {
          this.showToast("Please enter an image URL to preview.", "info");
        }
      });
    }

    const appLogoFile = document.getElementById("sys-app-logo-upload") as HTMLInputElement | null;
    if (appLogoFile && !appLogoFile.dataset.bound) {
      appLogoFile.dataset.bound = "true";
      appLogoFile.addEventListener("change", async () => {
        const file = appLogoFile.files && appLogoFile.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
          const resp = await fetch("/api/upload", { method: "POST", body: formData });
          const json = await resp.json().catch(() => null);
          const url = json?.url || json?.fileUrl || "";
          if (resp.ok && json?.success && url) {
            this.db.settings.headerLogo = url;
            this.db.settings.appLogo = url;
            this.db.settings.logoUrl = url;
            const urlIn = document.getElementById("sys-app-logo-url-input") as HTMLInputElement | null;
            if (urlIn) urlIn.value = url;
            const webIn = document.getElementById("sys-web-header-logo") as HTMLInputElement | null;
            if (webIn) webIn.value = url;
            updateSiteBranding(this.db);
            await this.saveDB(true);
            this.showToast("Header logo uploaded successfully!", "success");
          } else {
            this.showToast(json?.message || "Failed to upload logo", "error");
          }
        } catch {
          this.showToast("Logo upload request failed", "error");
        } finally {
          appLogoFile.value = "";
        }
      });
    }

    const saveLogoUrlBtn = document.getElementById("btn-save-logo-url");
    if (saveLogoUrlBtn && !saveLogoUrlBtn.dataset.bound) {
      saveLogoUrlBtn.dataset.bound = "true";
      saveLogoUrlBtn.addEventListener("click", async () => {
        const urlIn = document.getElementById("sys-app-logo-url-input") as HTMLInputElement | null;
        const val = urlIn ? urlIn.value.trim() : "";
        this.db.settings.headerLogo = val;
        this.db.settings.appLogo = val;
        this.db.settings.logoUrl = val;
        const webIn = document.getElementById("sys-web-header-logo") as HTMLInputElement | null;
        if (webIn) webIn.value = val;
        updateSiteBranding(this.db);
        await this.saveDB(true);
        this.showToast("Header logo URL saved!", "success");
      });
    }

    const resetLogoBtn = document.getElementById("btn-reset-app-logo");
    if (resetLogoBtn && !resetLogoBtn.dataset.bound) {
      resetLogoBtn.dataset.bound = "true";
      resetLogoBtn.addEventListener("click", async () => {
        this.db.settings.headerLogo = "";
        this.db.settings.appLogo = "";
        this.db.settings.logoUrl = "";
        const urlIn = document.getElementById("sys-app-logo-url-input") as HTMLInputElement | null;
        if (urlIn) urlIn.value = "";
        const webIn = document.getElementById("sys-web-header-logo") as HTMLInputElement | null;
        if (webIn) webIn.value = "";
        updateSiteBranding(this.db);
        await this.saveDB(true);
        this.showToast("Header logo reset to default icon.", "info");
      });
    }

    const faviconUploadInput = document.getElementById("sys-favicon-upload") as HTMLInputElement | null;
    const faviconPreview = document.getElementById("admin-current-favicon-preview") as HTMLImageElement | null;
    const faviconStatus = document.getElementById("favicon-upload-status") as HTMLElement | null;

    if (faviconUploadInput && !faviconUploadInput.dataset.bound) {
      faviconUploadInput.dataset.bound = "true";
      faviconUploadInput.addEventListener("change", async () => {
        const file = faviconUploadInput.files && faviconUploadInput.files[0];
        if (!file) return;
        if (faviconStatus) {
          faviconStatus.textContent = "Uploading favicon...";
          faviconStatus.className = "text-[9px] text-center font-bold text-cyan-400 block";
          faviconStatus.classList.remove("hidden");
        }
        try {
          const formData = new FormData();
          formData.append("file", file);
          const resp = await fetch("/api/upload", { method: "POST", body: formData });
          const json = await resp.json().catch(() => null);
          const url = json?.url || json?.fileUrl || "";
          if (resp.ok && json?.success && url) {
            this.db.settings.faviconUrl = url;
            const faviconEl = document.getElementById("sys-favicon-url") as HTMLInputElement | null;
            if (faviconEl) faviconEl.value = url;
            if (faviconPreview) faviconPreview.src = url;
            updateSiteBranding(this.db);
            await this.saveDB(true);
            if (faviconStatus) {
              faviconStatus.textContent = "✓ Favicon uploaded & live!";
              faviconStatus.className = "text-[9px] text-center font-bold text-emerald-400 block";
            }
            this.showToast("Favicon uploaded & applied live!", "success");
          } else {
            if (faviconStatus) faviconStatus.textContent = json?.message || "Upload failed";
            this.showToast(json?.message || "Failed to upload favicon", "error");
          }
        } catch {
          if (faviconStatus) faviconStatus.textContent = "Request failed";
          this.showToast("Favicon upload request failed", "error");
        } finally {
          faviconUploadInput.value = "";
        }
      });
    }

    const resetFaviconBtn = document.getElementById("btn-reset-favicon");
    if (resetFaviconBtn && !resetFaviconBtn.dataset.bound) {
      resetFaviconBtn.dataset.bound = "true";
      resetFaviconBtn.addEventListener("click", async () => {
        this.db.settings.faviconUrl = "";
        const faviconEl = document.getElementById("sys-favicon-url") as HTMLInputElement | null;
        if (faviconEl) faviconEl.value = "";
        if (faviconPreview) faviconPreview.src = "./logo.jpg";
        updateSiteBranding(this.db);
        await this.saveDB(true);
        this.showToast("Favicon reset to default.", "info");
      });
    }
  },

  async saveMaintenanceSettings(this: any, arg?: HTMLFormElement | Event) {
    if (arg && typeof (arg as Event).preventDefault === "function") {
      (arg as Event).preventDefault();
      (arg as Event).stopPropagation();
    }
    const formEl = arg instanceof HTMLFormElement ? arg : (document.getElementById("admin-settings-app-config-form") as HTMLFormElement | null);

    if (!this.db) this.db = {};
    if (!this.db.settings) this.db.settings = {};
    const s = this.db.settings;

    const maintenanceToggle = document.getElementById("sys-maintenance-toggle") as HTMLInputElement | null;
    const maintenanceMsg = document.getElementById("sys-maintenance-msg") as HTMLTextAreaElement | null;
    const appUrl = document.getElementById("sys-app-url") as HTMLInputElement | null;
    const appVer = document.getElementById("sys-app-ver") as HTMLInputElement | null;
    const adminP = document.getElementById("sys-admin-p") as HTMLInputElement | null;
    const agentRefBonus = document.getElementById("sys-agent-referral-bonus") as HTMLInputElement | null;
    const whatsappUrl = document.getElementById("sys-whatsapp-url") as HTMLInputElement | null;
    const minReferralDep = document.getElementById("sys-min-referral-deposit") as HTMLInputElement | null;

    if (maintenanceToggle) s.maintenanceMode = !!maintenanceToggle.checked;
    if (maintenanceMsg) s.maintenanceMessage = maintenanceMsg.value.trim();
    if (appUrl) s.forceUpdateLink = appUrl.value.trim();
    if (appVer) s.appVersion = appVer.value.trim();
    if (adminP && adminP.value.trim()) s.adminPass = adminP.value.trim();
    if (agentRefBonus) s.agentReferralBonus = parseFloat(agentRefBonus.value) || 0;
    if (whatsappUrl) s.whatsappUrl = whatsappUrl.value.trim();
    if (minReferralDep) s.minReferralDeposit = parseFloat(minReferralDep.value) || 0;

    const submitBtn = formEl?.querySelector('button[type="submit"], button#save-app-config-btn') as HTMLButtonElement | null;
    const origHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Saving...`;
    }

    try {
      const syncResult = await this.saveDB(true);
      if (syncResult === false) {
        this.showToast("Maintenance settings saved locally, but SQL sync failed.", "warning");
      } else {
        this.showToast("✓ Maintenance & App parameters committed successfully!", "success");
      }
    } catch (err: any) {
      console.error("[AdminSettings] saveMaintenanceSettings error:", err);
      this.showToast("Failed to save maintenance settings: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    }
  },

  async saveDepositBoosterSettings(this: any, arg?: HTMLFormElement | Event) {
    if (arg && typeof (arg as Event).preventDefault === "function") {
      (arg as Event).preventDefault();
      (arg as Event).stopPropagation();
    }
    const formEl = arg instanceof HTMLFormElement ? arg : (document.getElementById("admin-settings-deposit-booster-form") as HTMLFormElement | null);

    if (!this.db) this.db = {};
    if (!this.db.settings) this.db.settings = {};
    const s = this.db.settings;

    const boostToggle = document.getElementById("sys-dep-boost-toggle") as HTMLInputElement | null;
    const boostPercent = document.getElementById("sys-dep-boost-percent") as HTMLInputElement | null;
    const boostMin = document.getElementById("sys-dep-boost-min") as HTMLInputElement | null;

    const isEnabled = boostToggle ? !!boostToggle.checked : true;
    const percent = boostPercent ? (parseFloat(boostPercent.value) || 10) : 10;
    const minAmount = boostMin ? (parseFloat(boostMin.value) || 500) : 500;

    s.depBoostEnabled = isEnabled;
    s.depositBonusEnabled = isEnabled;
    s.depBoostPercent = percent;
    s.depositBonusRate = percent;
    s.depBoostMin = minAmount;
    s.depositBonusMin = minAmount;

    const submitBtn = formEl?.querySelector('button[type="submit"], button#save-dep-booster-btn') as HTMLButtonElement | null;
    const origHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Saving...`;
    }

    try {
      const syncResult = await this.saveDB(true);
      if (syncResult === false) {
        this.showToast("Deposit booster saved locally, but SQL sync failed.", "warning");
      } else {
        this.showToast("⚡ Deposit Match Booster bonus settings saved & synced!", "success");
      }
    } catch (err: any) {
      console.error("[AdminSettings] saveDepositBoosterSettings error:", err);
      this.showToast("Failed to save deposit booster: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    }
  },

  async saveSignupBonusSettings(this: any, arg?: HTMLFormElement | Event) {
    if (arg && typeof (arg as Event).preventDefault === "function") {
      (arg as Event).preventDefault();
      (arg as Event).stopPropagation();
    }
    const formEl = arg instanceof HTMLFormElement ? arg : (document.getElementById("admin-settings-signup-bonus-form") as HTMLFormElement | null);

    if (!this.db) this.db = {};
    if (!this.db.settings) this.db.settings = {};
    const s = this.db.settings;

    const bonusToggle = document.getElementById("sys-signup-bonus-toggle") as HTMLInputElement | null;
    const bonusAmount = (document.getElementById("sys-signup-bonus-amount") || document.getElementById("sys-signup-bonus")) as HTMLInputElement | null;

    const isEnabled = bonusToggle ? !!bonusToggle.checked : true;
    const amt = bonusAmount ? (parseFloat(bonusAmount.value) || 0) : 50;

    s.signupBonusEnabled = isEnabled;
    s.signupBonus = amt;

    const otherBonusEl = document.getElementById("sys-signup-bonus") as HTMLInputElement | null;
    if (otherBonusEl) otherBonusEl.value = String(amt);
    const amountEl = document.getElementById("sys-signup-bonus-amount") as HTMLInputElement | null;
    if (amountEl) amountEl.value = String(amt);

    const submitBtn = formEl?.querySelector('button[type="submit"], button#save-signup-bonus-btn') as HTMLButtonElement | null;
    const origHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Saving...`;
    }

    try {
      const syncResult = await this.saveDB(true);
      if (syncResult === false) {
        this.showToast("Sign-up bonus saved locally, but SQL sync failed.", "warning");
      } else {
        this.showToast("🎁 New Player Welcome Sign-Up Bonus settings saved & synced!", "success");
      }
    } catch (err: any) {
      console.error("[AdminSettings] saveSignupBonusSettings error:", err);
      this.showToast("Failed to save sign-up bonus: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    }
  },

  async saveQuickDrawSettings(this: any, arg?: HTMLFormElement | Event) {
    if (arg && typeof (arg as Event).preventDefault === "function") {
      (arg as Event).preventDefault();
      (arg as Event).stopPropagation();
    }
    const formEl = arg instanceof HTMLFormElement ? arg : (document.getElementById("admin-settings-quickdraw-form") as HTMLFormElement | null);

    if (!this.db) this.db = {};
    if (!this.db.settings) this.db.settings = {};
    const s = this.db.settings;

    const quickToggle = document.getElementById("sys-quickdraw-toggle") as HTMLInputElement | null;
    const isEnabled = quickToggle ? !!quickToggle.checked : true;
    s.quickDrawEnabled = isEnabled;

    const submitBtn = formEl?.querySelector('button[type="submit"], button#save-quickdraw-btn') as HTMLButtonElement | null;
    const origHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Saving...`;
    }

    try {
      const syncResult = await this.saveDB(true);
      if (syncResult === false) {
        this.showToast("Quick Draw settings saved locally, but SQL sync failed.", "warning");
      } else {
        this.showToast(`⚡ Quick Draw 1-Minute lottery mode is now ${isEnabled ? 'ACTIVE' : 'DISABLED'}!`, "success");
      }
    } catch (err: any) {
      console.error("[AdminSettings] saveQuickDrawSettings error:", err);
      this.showToast("Failed to save quick draw settings: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    }
  },

  async saveSeoSettings(this: any, arg?: HTMLFormElement | Event) {
    if (arg && typeof (arg as Event).preventDefault === "function") {
      (arg as Event).preventDefault();
      (arg as Event).stopPropagation();
    }
    const formEl = arg instanceof HTMLFormElement ? arg : (document.getElementById("admin-settings-seo-form") as HTMLFormElement | null);

    if (!this.db) this.db = {};
    if (!this.db.settings) this.db.settings = {};
    const s = this.db.settings;

    const titleEl = document.getElementById("sys-seo-title") as HTMLInputElement | null;
    const descEl = (document.getElementById("sys-seo-desc") || document.getElementById("sys-seo-description")) as HTMLTextAreaElement | null;
    const imgEl = document.getElementById("sys-seo-image") as HTMLInputElement | null;
    const keywordsEl = document.getElementById("sys-seo-keywords") as HTMLInputElement | null;
    const faviconEl = document.getElementById("sys-favicon-url") as HTMLInputElement | null;
    const logoEl = document.getElementById("sys-logo-url") as HTMLInputElement | null;

    if (titleEl) s.seoTitle = titleEl.value.trim();
    if (descEl) s.seoDescription = descEl.value.trim();
    if (imgEl) {
      const imgVal = imgEl.value.trim();
      s.seoImage = imgVal;
      s.ogImage = imgVal;
    }
    if (keywordsEl) s.seoKeywords = keywordsEl.value.trim();
    if (faviconEl && faviconEl.value.trim()) s.faviconUrl = faviconEl.value.trim();
    if (logoEl && logoEl.value.trim()) {
      const val = logoEl.value.trim();
      s.logoUrl = val;
      s.headerLogo = val;
      s.appLogo = val;
    }

    updateSiteBranding(this.db);
    if (typeof this.updateMetaTags === "function") {
      this.updateMetaTags();
    }

    const submitBtn = formEl?.querySelector('button[type="submit"], button#save-seo-settings-btn') as HTMLButtonElement | null;
    const origHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Updating SEO...`;
    }

    try {
      const syncResult = await this.saveDB(true);
      if (syncResult === false) {
        this.showToast("SEO settings saved locally, but SQL sync failed.", "warning");
      } else {
        this.showToast("🌐 SEO & Social share preview settings saved & applied!", "success");
      }
    } catch (err: any) {
      console.error("[AdminSettings] saveSeoSettings error:", err);
      this.showToast("Failed to save SEO settings: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    }
  },

  async saveCheckinSponsorSettings(this: any, arg?: HTMLFormElement | Event) {
    if (arg && typeof (arg as Event).preventDefault === "function") {
      (arg as Event).preventDefault();
      (arg as Event).stopPropagation();
    }
    const formEl = arg instanceof HTMLFormElement ? arg : (document.getElementById("admin-settings-checkin-sponsor-form") as HTMLFormElement | null);

    if (!this.db) this.db = {};
    if (!this.db.settings) this.db.settings = {};
    const s = this.db.settings;

    const taskReq = document.getElementById("sys-checkin-task-required") as HTMLInputElement | null;
    const linkInput = document.getElementById("sys-checkin-sponsor-link") as HTMLInputElement | null;
    const titleInput = document.getElementById("sys-checkin-sponsor-title") as HTMLInputElement | null;
    const instrInput = document.getElementById("sys-checkin-sponsor-instruction") as HTMLInputElement | null;
    const timerInput = document.getElementById("sys-checkin-sponsor-timer") as HTMLInputElement | null;
    const autoOpen = document.getElementById("sys-checkin-auto-open") as HTMLInputElement | null;

    if (taskReq) s.sponsorTaskRequired = taskReq.checked;
    if (linkInput) s.sponsorLink = linkInput.value.trim();
    if (titleInput) s.sponsorLinkTitle = titleInput.value.trim();
    if (instrInput) s.sponsorLinkInstruction = instrInput.value.trim();
    if (timerInput) s.sponsorTaskTimer = parseInt(timerInput.value, 10) || 5;
    if (autoOpen) s.sponsorAutoOpen = autoOpen.checked;

    const rewards: number[] = [];
    for (let i = 1; i <= 7; i++) {
      const dayInput = document.getElementById(`sys-checkin-reward-day${i}`) as HTMLInputElement | null;
      rewards.push(dayInput ? (parseFloat(dayInput.value) || (i * 2)) : (i * 2));
    }
    s.checkinRewards = rewards;

    const submitBtn = formEl?.querySelector('button[type="submit"], button#save-checkin-sponsor-btn') as HTMLButtonElement | null;
    const origHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Saving...`;
    }

    try {
      const syncResult = await this.saveDB(true);
      if (syncResult === false) {
        this.showToast("Check-in sponsor saved locally, but SQL sync failed.", "warning");
      } else {
        this.showToast("✓ Daily Check-In & Sponsor link settings saved!", "success");
      }
    } catch (err: any) {
      console.error("[AdminSettings] saveCheckinSponsorSettings error:", err);
      this.showToast("Failed to save check-in sponsor settings: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    }
  },

  async broadcastWebPushAd(this: any, arg?: HTMLFormElement | Event) {
    if (arg && typeof (arg as Event).preventDefault === "function") {
      (arg as Event).preventDefault();
      (arg as Event).stopPropagation();
    }
    const formEl = arg instanceof HTMLFormElement ? arg : (document.getElementById("admin-settings-push-broadcast-form") as HTMLFormElement | null);

    const titleEl = document.getElementById("sys-push-title") as HTMLInputElement | null;
    const msgEl = document.getElementById("sys-push-message") as HTMLInputElement | null;
    const imgEl = document.getElementById("sys-push-image-url") as HTMLInputElement | null;
    const ctaEl = document.getElementById("sys-push-cta-text") as HTMLInputElement | null;
    const iconEl = document.getElementById("sys-push-icon-type") as HTMLSelectElement | null;
    const tabEl = document.getElementById("sys-push-redirect-tab") as HTMLSelectElement | null;
    const audienceEl = document.getElementById("sys-push-target-audience") as HTMLSelectElement | null;

    const title = titleEl?.value.trim() || "বিশেষ অফার!";
    const message = msgEl?.value.trim() || "";
    if (!message) {
      this.showToast("অনুগ্রহ করে পুশ বিজ্ঞাপনের মেসেজ লিখুন।", "warning");
      return;
    }

    const newPush = {
      id: "push_" + Date.now(),
      title,
      message,
      imageUrl: imgEl?.value.trim() || "",
      ctaText: ctaEl?.value.trim() || "Claim Offer Now",
      iconType: iconEl?.value || "bkash",
      targetTab: tabEl?.value || "tab-wallet",
      targetAudience: audienceEl?.value || "all",
      date: new Date().toISOString(),
      clicks: 0
    };

    if (!this.db) this.db = {};
    if (!this.db.webPushHistory) this.db.webPushHistory = [];
    this.db.webPushHistory.unshift(newPush);

    const submitBtn = formEl?.querySelector('button[type="submit"], button#send-web-push-btn') as HTMLButtonElement | null;
    const origHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Broadcasting...`;
    }

    try {
      await this.saveDB(true);
      this.renderWebPushAdsHistory();
      this.showToast("🚀 Web Push Ad successfully broadcasted to players!", "success");
    } catch (err: any) {
      console.error("[AdminSettings] broadcastWebPushAd error:", err);
      this.showToast("Failed to broadcast push ad: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    }
  },

  bindAllSettingsForms(this: any) {
    const formsToBind: Array<{ id: string; handler: (form: HTMLFormElement) => Promise<void> }> = [
      { id: "admin-settings-app-config-form", handler: (f) => this.saveMaintenanceSettings(f) },
      { id: "admin-settings-deposit-booster-form", handler: (f) => this.saveDepositBoosterSettings(f) },
      { id: "admin-settings-signup-bonus-form", handler: (f) => this.saveSignupBonusSettings(f) },
      { id: "admin-settings-quickdraw-form", handler: (f) => this.saveQuickDrawSettings(f) },
      { id: "admin-settings-seo-form", handler: (f) => this.saveSeoSettings(f) },
      { id: "admin-settings-gateways-form", handler: (f) => this.saveGatewaysSettings(f) },
      { id: "admin-settings-checkin-sponsor-form", handler: (f) => this.saveCheckinSponsorSettings(f) },
      { id: "admin-settings-push-broadcast-form", handler: (f) => this.broadcastWebPushAd(f) },
    ];

    formsToBind.forEach(({ id, handler }) => {
      const form = document.getElementById(id) as HTMLFormElement | null;
      if (form && !(form as any)._submitBound) {
        (form as any)._submitBound = true;
        form.addEventListener("submit", async (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          await handler(form);
        });
      }
    });

    const pushPresetSelect = document.getElementById("sys-push-preset-select") as HTMLSelectElement | null;
    if (pushPresetSelect && !pushPresetSelect.dataset.bound) {
      pushPresetSelect.dataset.bound = "true";
      pushPresetSelect.addEventListener("change", () => {
        const urlInput = document.getElementById("sys-push-image-url") as HTMLInputElement | null;
        if (urlInput && pushPresetSelect.value) {
          urlInput.value = pushPresetSelect.value;
        }
      });
    }

    const previewPushBtn = document.getElementById("sys-push-preview-btn");
    if (previewPushBtn && !previewPushBtn.dataset.bound) {
      previewPushBtn.dataset.bound = "true";
      previewPushBtn.addEventListener("click", () => {
        const title = (document.getElementById("sys-push-title") as HTMLInputElement)?.value || "Live Push Preview";
        const msg = (document.getElementById("sys-push-message") as HTMLInputElement)?.value || "This is a sample live test notification.";
        this.showToast(`📢 ${title}: ${msg}`, "info");
      });
    }
  }
};
