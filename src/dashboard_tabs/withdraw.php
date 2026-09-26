<div class="flex flex-col w-full pb-28 font-sans text-slate-100 space-y-3 px-0 sm:px-1 select-none box-border overflow-x-hidden">
  <!-- Top App Navigation Header -->
  <div class="flex items-center justify-between bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 px-4 py-3 rounded-2xl shadow-xl sticky top-0 z-30">
    <div class="flex items-center gap-3">
      <button type="button" onclick="if(window.app){window.app.currentTab='wallet';window.app.render();}" class="w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 flex items-center justify-center text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm border border-slate-700/50 active:scale-95">
        <i class="fa-solid fa-arrow-left text-sm"></i>
      </button>
      <div>
        <h1 class="text-sm font-black text-white tracking-wide flex items-center gap-2">
          <span>Withdraw Cash</span>
          <span class="inline-block w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
        </h1>
        <p class="text-[10px] text-rose-400 font-mono font-semibold">টাকা উত্তোলন • 15m Fast Payout</p>
      </div>
    </div>
    <div class="flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-full shadow-inner">
      <i class="fa-solid fa-shield-halved text-rose-400 text-xs"></i>
      <span class="text-[9px] text-rose-300 font-mono font-bold tracking-wider">AUDITED</span>
    </div>
  </div>

  <!-- Available Balance Preview -->
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#1f1118] to-slate-950 p-4 border border-slate-800 shadow-xl">
    <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="flex justify-between items-start">
      <div>
        <span class="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Withdrawable Balance</span>
        <p class="text-[10px] text-slate-500">উত্তোলনযোগ্য ব্যালেন্স</p>
      </div>
      <span class="text-[9px] font-mono font-bold text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800/50">INSTANT DISBURSE</span>
    </div>
    <div class="flex items-baseline gap-2 mt-2">
      <span class="text-3xl font-black text-white font-mono tracking-tight">৳<span class="curr-balance">0.00</span></span>
      <span class="text-[10px] text-rose-400 font-mono font-bold bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800/50">BDT</span>
    </div>
  </div>

  <!-- Withdrawal Form -->
  <form id="wallet-withdraw-page-form" class="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl space-y-3.5 shadow-xl" onsubmit="event.preventDefault(); if(window.WalletExtensions){WalletExtensions.submitWithdrawalForm(event);}">
    <div class="space-y-1.5">
      <label class="block text-[11px] uppercase font-mono text-slate-300 font-bold">Select Withdrawal Channel / উত্তোলনের মাধ্যম</label>
      <select id="wd-gateway" onchange="if(window.WalletExtensions){WalletExtensions.onWithdrawGatewayChange(this.value);}" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3 text-xs text-white outline-none focus:border-rose-500 cursor-pointer font-mono">
        <option value="bKash">bKash (SendMoney / Personal)</option>
        <option value="Nagad">Nagad (SendMoney / Personal)</option>
        <option value="Rocket">Rocket (Personal)</option>
        <option value="Upay">Upay (Personal)</option>
        <option value="DBBL">Dutch Bangla DBBL Bank</option>
        <option value="Crypto USDT">TRC20 USDT Crypto</option>
        <option value="Agent Withdraw">Agent Withdraw (Verified Local Desk)</option>
      </select>
    </div>

    <!-- District Wise Partner Agents for withdrawal -->
    <div id="user-wd-row-district-agents" class="hidden bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2.5 text-xs text-slate-300">
      <div class="flex items-center justify-between">
        <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
          <i class="fa-solid fa-map-pin"></i> LOCAL CASH PAYOUT NETWORK
        </span>
        <span class="text-[9px] py-0.5 px-2 bg-emerald-950 text-emerald-400 font-bold border border-emerald-900/40 rounded font-mono">
          VERIFIED DESK
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="block text-slate-400 text-[10px] uppercase font-mono font-bold">Payout District</label>
          <select id="user-wd-agent-district-select" class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-2 text-[11px] text-white outline-none cursor-pointer">
            <option value="all">-- All --</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Chittagong">Chittagong</option>
            <option value="Sylhet">Sylhet</option>
            <option value="Rajshahi">Rajshahi</option>
            <option value="Khulna">Khulna</option>
            <option value="Barisal">Barisal</option>
            <option value="Rangpur">Rangpur</option>
            <option value="Mymensingh">Mymensingh</option>
            <option value="Comilla">Comilla</option>
            <option value="Gazipur">Gazipur</option>
            <option value="Narayanganj">Narayanganj</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="block text-slate-400 text-[10px] uppercase font-mono font-bold">Agency Dealer</label>
          <select id="user-wd-agent-lookup-select" class="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-2 text-[11px] text-slate-300 outline-none cursor-pointer">
            <!-- Populated dynamically -->
          </select>
        </div>
      </div>

      <div id="user-wd-agent-details-card" class="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-[10px] text-slate-400 space-y-1 hidden font-mono">
        <div class="flex justify-between items-center">
          <span>Merchant: <strong class="text-white" id="user-wd-agent-lbl-username">@agent_dhaka</strong></span>
          <span>Point: <strong class="text-indigo-400" id="user-wd-agent-lbl-location">Dhaka</strong></span>
        </div>
        <div class="text-[9px] text-slate-500 font-sans">
          Physical Cash-Out at operator desk. Auto-prefilled partner cash-out number below.
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <div class="space-y-1">
        <label class="block text-[10px] uppercase font-mono text-slate-300 font-bold">Withdraw Amount / উত্তোলনের পরিমাণ (৳)</label>
        <input id="wd-amount" type="number" required min="100" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm font-mono text-white outline-none focus:border-rose-500 transition-colors" placeholder="Min: ৳100" />
      </div>

      <div class="space-y-1">
        <label class="block text-[10px] uppercase font-mono text-slate-300 font-bold">Target Recipient Number / প্রাপক নম্বর</label>
        <input id="wd-account" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm font-mono text-white outline-none focus:border-rose-500 transition-colors" placeholder="017XXXXXXXX / Wallet Address" />
      </div>
    </div>

    <p class="text-[10px] text-slate-400 font-mono">* Payout requests are verified and disbursed automatically. Standard execution: 15–30 minutes.</p>

    <!-- SECURITY PIN LOCK PLACEHOLDER -->
    <div id="wallet-extensions-withdraw-security-placeholder" class="space-y-3"></div>

    <button type="submit" class="w-full bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-black text-xs py-3.5 rounded-xl shadow-lg shadow-rose-600/20 transition cursor-pointer uppercase tracking-wider font-mono flex items-center justify-center gap-2">
      <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
      <span>Submit Withdrawal Request / উত্তোলন নিশ্চিত করুন</span>
    </button>
  </form>
</div>
