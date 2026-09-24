<div class="flex flex-col w-full pb-28 font-sans text-slate-100 space-y-3 px-0 sm:px-1 select-none box-border overflow-x-hidden">
  
  <!-- Top App Navigation Header -->
  <div class="flex items-center justify-between bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 px-4 py-3 rounded-2xl shadow-xl sticky top-0 z-30">
    <div class="flex items-center gap-3">
      <button type="button" onclick="if(window.app){window.app.currentTab='wallet';window.app.render();}" class="w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 flex items-center justify-center text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm border border-slate-700/50 active:scale-95">
        <i class="fa-solid fa-arrow-left text-sm"></i>
      </button>
      <div>
        <h1 class="text-sm font-black text-white tracking-wide flex items-center gap-2">
          <span>Deposit Funds</span>
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </h1>
        <p class="text-[10px] text-emerald-400 font-mono font-semibold">তহবিল জমা • Instant Auto Credit</p>
      </div>
    </div>
    <div class="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-inner">
      <i class="fa-solid fa-shield-halved text-emerald-400 text-xs"></i>
      <span class="text-[9px] text-emerald-300 font-mono font-bold tracking-wider">256-BIT SSL</span>
    </div>
  </div>

  <!-- Realtime Wallet Balance Card -->
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0b1322] to-slate-950 p-4 border border-slate-800 shadow-xl">
    <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="flex justify-between items-start">
      <div>
        <span class="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Total Purse Balance</span>
        <p class="text-[10px] text-slate-500">বর্তমান ওয়ালেট ব্যালেন্স</p>
      </div>
      <div class="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur px-2.5 py-0.5 rounded-full border border-slate-800">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span class="text-[9px] font-mono font-bold text-emerald-400">ONLINE</span>
      </div>
    </div>
    <div class="flex items-baseline gap-2 mt-2">
      <span class="text-3xl font-black text-white font-mono tracking-tight">৳<span class="curr-balance">0.00</span></span>
      <span class="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/50">BDT</span>
    </div>
    <div class="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
      <span>Zero Deposit Fee (0% চার্জ)</span>
      <span class="text-emerald-400 font-bold">+10% Bonus on ৳500+</span>
    </div>
  </div>

  <!-- Deposit Amount Input Box -->
  <div class="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-800/80 space-y-3">
    <div class="flex justify-between items-center">
      <label class="text-xs font-black text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
        <i class="fa-solid fa-coins text-amber-400"></i>
        <span>Deposit Amount</span>
      </label>
      <span class="text-[10px] text-slate-400 font-mono">Min: ৳50 • Max: ৳25,000</span>
    </div>

    <!-- Main Numeric Input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <span class="text-xl text-emerald-400 font-black font-mono">৳</span>
      </div>
      <input id="deposit-amount" type="number" min="50" max="100000" value="1000" class="w-full bg-slate-950 text-white text-2xl font-black pl-9 pr-14 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 transition-all font-mono border border-slate-800 shadow-inner" placeholder="0.00" oninput="if(window.updateDepositSummary){window.updateDepositSummary(this.value);}else if(window.updateSummary){window.updateSummary(this.value);}" />
      <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
        <span class="text-xs text-slate-400 font-mono font-bold">BDT</span>
      </div>
    </div>

    <!-- Quick Preset Buttons Grid -->
    <div>
      <div class="flex justify-between items-center mb-2">
        <span class="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Quick Amounts:</span>
        <span class="text-[9px] text-emerald-400 font-mono font-bold">Recommended ৳1,000</span>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        <button type="button" class="dep-preset-btn bg-slate-950 hover:bg-slate-850 text-slate-200 py-2.5 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer border border-slate-800 active:scale-95" data-val="100" onclick="if(window.setDepositAmount){window.setDepositAmount(100);}">৳100</button>
        <button type="button" class="dep-preset-btn bg-slate-950 hover:bg-slate-850 text-slate-200 py-2.5 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer border border-slate-800 active:scale-95" data-val="500" onclick="if(window.setDepositAmount){window.setDepositAmount(500);}">৳500</button>
        <button type="button" class="dep-preset-btn ring-2 ring-emerald-400 bg-emerald-500/20 text-emerald-300 py-2.5 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer border border-emerald-500/60 shadow active:scale-95" data-val="1000" onclick="if(window.setDepositAmount){window.setDepositAmount(1000);}">৳1,000</button>
        <button type="button" class="dep-preset-btn bg-slate-950 hover:bg-slate-850 text-slate-200 py-2.5 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer border border-slate-800 active:scale-95" data-val="2000" onclick="if(window.setDepositAmount){window.setDepositAmount(2000);}">৳2,000</button>
        <button type="button" class="dep-preset-btn bg-slate-950 hover:bg-slate-850 text-slate-200 py-2.5 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer border border-slate-800 active:scale-95" data-val="5000" onclick="if(window.setDepositAmount){window.setDepositAmount(5000);}">৳5,000</button>
        <button type="button" class="dep-preset-btn bg-slate-950 hover:bg-slate-850 text-slate-200 py-2.5 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer border border-slate-800 active:scale-95" data-val="10000" onclick="if(window.setDepositAmount){window.setDepositAmount(10000);}">৳10K</button>
      </div>
    </div>
  </div>

  <!-- Payment Method Selector -->
  <div class="space-y-2.5">
    <div class="flex justify-between items-center px-1">
      <h2 class="text-xs font-black text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
        <i class="fa-solid fa-credit-card text-emerald-400"></i>
        <span>Select Payment Gateway</span>
      </h2>
      <span class="text-[10px] text-slate-400 font-mono">পেমেন্ট মাধ্যম বেছে নিন</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" id="deposit-methods-list">
      
      <!-- Option 1: UddoktaPay Automated -->
      <label data-gateway="UddoktaPay" class="deposit-method-card relative flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0b1622] cursor-pointer hover:border-emerald-500/80 transition-all border border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30 active:scale-[0.99]" onclick="if(window.selectDepositMethod){window.selectDepositMethod('UddoktaPay');}">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-base shadow-sm">
            <i class="fa-solid fa-bolt text-amber-400"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-black text-white font-mono">UddoktaPay</span>
              <span class="bg-emerald-500 text-slate-950 text-[8px] px-1.5 py-0.5 rounded font-mono font-black">AUTO 0-FEE</span>
              <span class="gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-[7px]"></i> LIVE</span>
            </div>
            <p class="text-[9.5px] text-slate-400">bKash/Nagad/Rocket Auto-API</p>
          </div>
        </div>
        <input type="radio" name="dep_payment_method" value="UddoktaPay" checked class="w-4 h-4 accent-emerald-500 cursor-pointer" />
      </label>

      <!-- Option 1.5: ZiniPay Automated -->
      <label data-gateway="ZiniPay" class="deposit-method-card relative flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#081c24] cursor-pointer hover:border-cyan-500/80 transition-all border border-cyan-500/40 shadow-md active:scale-[0.99]" onclick="if(window.selectDepositMethod){window.selectDepositMethod('ZiniPay');}">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-base shadow-sm">
            <i class="fa-solid fa-bolt-lightning text-amber-400"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-black text-white font-mono">ZiniPay (জিনি পে)</span>
              <span class="bg-cyan-500 text-slate-950 text-[8px] px-1.5 py-0.5 rounded font-mono font-black">INSTANT PGW</span>
              <span class="gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 inline-flex items-center gap-1"><i class="fa-solid fa-bolt text-[7px]"></i> ACTIVE</span>
            </div>
            <p class="text-[9.5px] text-slate-400">bKash/Nagad/Rocket Direct PGW</p>
          </div>
        </div>
        <input type="radio" name="dep_payment_method" value="ZiniPay" class="w-4 h-4 accent-cyan-500 cursor-pointer" />
      </label>

      <!-- Option 1.8: Cryptomus Automated -->
      <label data-gateway="Cryptomus" class="deposit-method-card relative flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#1e0838] cursor-pointer hover:border-purple-500/80 transition-all border border-purple-500/40 shadow-md active:scale-[0.99]" onclick="if(window.selectDepositMethod){window.selectDepositMethod('Cryptomus');}">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black text-base shadow-sm">
            <i class="fa-solid fa-coins text-purple-400"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-black text-white font-mono">Cryptomus Crypto</span>
              <span class="bg-purple-500 text-slate-950 text-[8px] px-1.5 py-0.5 rounded font-mono font-black">AUTO CRYPTO</span>
              <span class="gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-[7px]"></i> ACTIVE</span>
            </div>
            <p class="text-[9.5px] text-slate-400">USDT / BTC / ETH / TON Auto</p>
          </div>
        </div>
        <input type="radio" name="dep_payment_method" value="Cryptomus" class="w-4 h-4 accent-purple-500 cursor-pointer" />
      </label>

      <!-- Option 2: bKash -->
      <label data-gateway="bKash" class="deposit-method-card relative flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 cursor-pointer hover:border-pink-500/60 transition-all border border-slate-800 shadow-sm active:scale-[0.99]" onclick="if(window.selectDepositMethod){window.selectDepositMethod('bKash');}">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/40 flex items-center justify-center text-pink-400 font-black text-xs font-mono shadow-sm">
            bKash
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-white">bKash Personal</span>
              <span class="bg-pink-950/80 text-pink-300 border border-pink-800/40 text-[8px] px-1.5 py-0.5 rounded font-mono font-bold">Send Money</span>
              <span class="gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-[7px]"></i> ACTIVE</span>
            </div>
            <p class="text-[9.5px] text-slate-400">বিকাশ সেন্ড মানি (ব্যক্তিগত)</p>
          </div>
        </div>
        <input type="radio" name="dep_payment_method" value="bKash" class="w-4 h-4 accent-pink-500 cursor-pointer" />
      </label>

      <!-- Option 3: Nagad -->
      <label data-gateway="Nagad" class="deposit-method-card relative flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 cursor-pointer hover:border-orange-500/60 transition-all border border-slate-800 shadow-sm active:scale-[0.99]" onclick="if(window.selectDepositMethod){window.selectDepositMethod('Nagad');}">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/40 flex items-center justify-center text-orange-400 font-black text-xs font-mono shadow-sm">
            Nagad
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-white">Nagad Personal</span>
              <span class="bg-orange-950/80 text-orange-300 border border-orange-800/40 text-[8px] px-1.5 py-0.5 rounded font-mono font-bold">Send Money</span>
              <span class="gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-[7px]"></i> ACTIVE</span>
            </div>
            <p class="text-[9.5px] text-slate-400">নগদ সেন্ড মানি (ব্যক্তিগত)</p>
          </div>
        </div>
        <input type="radio" name="dep_payment_method" value="Nagad" class="w-4 h-4 accent-orange-500 cursor-pointer" />
      </label>

      <!-- Option 4: Rocket -->
      <label data-gateway="Rocket" class="deposit-method-card relative flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 cursor-pointer hover:border-purple-500/60 transition-all border border-slate-800 shadow-sm active:scale-[0.99]" onclick="if(window.selectDepositMethod){window.selectDepositMethod('Rocket');}">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black text-xs font-mono shadow-sm">
            Rocket
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-white">Rocket Mobile</span>
              <span class="bg-purple-950/80 text-purple-300 border border-purple-800/40 text-[8px] px-1.5 py-0.5 rounded font-mono font-bold">Personal</span>
              <span class="gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-[7px]"></i> ACTIVE</span>
            </div>
            <p class="text-[9.5px] text-slate-400">রকেট মোবাইল ব্যাংকিং</p>
          </div>
        </div>
        <input type="radio" name="dep_payment_method" value="Rocket" class="w-4 h-4 accent-purple-500 cursor-pointer" />
      </label>

      <!-- Option 5: Crypto USDT -->
      <label data-gateway="USDT" class="deposit-method-card relative flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 cursor-pointer hover:border-teal-500/60 transition-all border border-slate-800 shadow-sm active:scale-[0.99]" onclick="if(window.selectDepositMethod){window.selectDepositMethod('USDT');}">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-300 font-black text-xs font-mono shadow-sm">
            ₮ USDT
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-white">TRC-20 Crypto</span>
              <span class="bg-teal-950/80 text-teal-300 border border-teal-800/40 text-[8px] px-1.5 py-0.5 rounded font-mono font-bold">Crypto</span>
              <span class="gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-[7px]"></i> ACTIVE</span>
            </div>
            <p class="text-[9.5px] text-slate-400">Binance / TRON USDT</p>
          </div>
        </div>
        <input type="radio" name="dep_payment_method" value="USDT" class="w-4 h-4 accent-teal-500 cursor-pointer" />
      </label>

      <!-- Option 6: Agent Desk -->
      <label data-gateway="Agent" class="deposit-method-card relative flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 cursor-pointer hover:border-amber-500/60 transition-all border border-slate-800 shadow-sm active:scale-[0.99]" onclick="if(window.selectDepositMethod){window.selectDepositMethod('Agent');}">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-xs font-mono shadow-sm">
            <i class="fa-solid fa-headset text-sm"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-white">Agent Cash Desk</span>
              <span class="bg-amber-950/80 text-amber-300 border border-amber-800/40 text-[8px] px-1.5 py-0.5 rounded font-mono font-bold">Local</span>
              <span class="gw-status-badge text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-[7px]"></i> ACTIVE</span>
            </div>
            <p class="text-[9.5px] text-slate-400">ভেরিফাইড এজেন্ট ডেস্ক</p>
          </div>
        </div>
        <input type="radio" name="dep_payment_method" value="Agent" class="w-4 h-4 accent-amber-500 cursor-pointer" />
      </label>

    </div>
  </div>

  <!-- Dynamic Step-by-Step Payment Instructions Box -->
  <div id="deposit-manual-details-card" class="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-800/80 space-y-3.5">
    <div class="flex justify-between items-center border-b border-slate-800 pb-2.5">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <h3 id="dep-instruction-title" class="text-xs font-black text-white uppercase tracking-wider font-mono">Payment Instructions</h3>
      </div>
      <span id="dep-method-badge" class="text-[9px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">UddoktaPay</span>
    </div>

    <!-- Receiver Number Box with Copy Button -->
    <div id="dep-account-number-box" class="space-y-1">
      <label class="text-[10px] text-slate-400 font-mono uppercase font-bold flex justify-between">
        <span>Target Payment Number / ওয়ালেট নম্বর:</span>
        <span class="text-emerald-400">Send Money</span>
      </label>
      <div class="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <div class="flex-1 font-mono font-black text-sm text-emerald-300 tracking-wider select-all" id="dep-receiver-number">
          01700000000
        </div>
        <button type="button" id="dep-copy-btn" onclick="if(window.copyDepositNumber){window.copyDepositNumber();}" class="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer active:scale-95">
          <i class="fa-solid fa-copy"></i>
          <span id="dep-copy-text">Copy</span>
        </button>
      </div>
    </div>

    <!-- Automated Gateway Info Banner (shown only when Automated is selected) -->
    <div id="dep-automated-banner" class="hidden bg-emerald-950/40 border border-emerald-700/40 p-3 rounded-xl space-y-1.5">
      <div class="flex items-center gap-2 text-emerald-300 text-xs font-bold">
        <i class="fa-solid fa-bolt text-amber-400"></i>
        <span>Instant Gateway Redirect</span>
      </div>
      <p class="text-[10px] text-slate-300 leading-relaxed font-sans">
        Confirm Deposit-এ ক্লিক করলে সরাসরি UddoktaPay চেকআউট পেজে নিয়ে যাওয়া হবে। সেখানে bKash, Nagad বা কার্ড দিয়ে পেমেন্ট করলে তাৎক্ষণিক আপনার ব্যালেন্সে টাকা যোগ হবে।
      </p>
    </div>

    <!-- Manual Form Inputs: Sender Number & TrxID -->
    <div id="dep-manual-form-fields" class="space-y-2.5 pt-1">
      <div class="space-y-1">
        <label class="text-[10px] font-mono text-slate-300 font-bold uppercase block">
          Sender Mobile Number / আপনার প্রেরক নম্বর:
        </label>
        <input type="text" id="dep-sender-phone" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs font-mono outline-none focus:border-emerald-500 transition-colors" placeholder="01XXXXXXXXX" />
      </div>

      <div class="space-y-1">
        <label class="text-[10px] font-mono text-slate-300 font-bold uppercase flex justify-between">
          <span>Transaction ID (TrxID) / ট্রানজেকশন আইডি:</span>
          <span class="text-slate-500 text-[9px]">e.g. BL92A8X7K</span>
        </label>
        <div class="flex items-center gap-2">
          <input type="text" id="dep-trx-id" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs font-mono uppercase tracking-wider outline-none focus:border-emerald-500 transition-colors" placeholder="Enter TrxID" />
          <button type="button" onclick="if(window.pasteDepositTrxId){window.pasteDepositTrxId();}" class="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-[10px] font-mono px-3 py-2.5 rounded-xl cursor-pointer transition active:scale-95 shrink-0">
            Paste
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Summary Breakdown Card -->
  <div class="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-800/80 space-y-2 font-mono">
    <div class="flex justify-between items-center text-xs">
      <span class="text-slate-400">Deposit Amount / জমার পরিমাণ</span>
      <span class="text-white font-bold" id="summary-amount">৳1,000.00</span>
    </div>
    <div class="flex justify-between items-center text-xs">
      <span class="text-slate-400">Bonus Extra / ডিপোজিট বোনাস</span>
      <span class="text-emerald-400 font-bold" id="summary-bonus">+৳100.00 (10% Extra)</span>
    </div>
    <div class="flex justify-between items-center text-xs">
      <span class="text-slate-400">Transaction Fee / ফি</span>
      <span class="text-emerald-400 font-bold">৳0.00 (Free)</span>
    </div>
    <div class="pt-2 border-t border-slate-800 flex justify-between items-center">
      <div>
        <span class="text-xs font-bold text-white block">Total Credited Value</span>
        <span class="text-[9px] text-slate-400">মোট ওয়ালেটে যুক্ত হবে</span>
      </div>
      <span class="text-base font-black text-emerald-400" id="summary-total">৳1,100.00</span>
    </div>
  </div>

  <!-- Primary Confirm Deposit CTA Button -->
  <div class="pt-1">
    <button type="button" id="dep-submit-btn" onclick="if(window.submitDepositForm){window.submitDepositForm();}else if(window.submitDeposit){window.submitDeposit();}" class="w-full bg-[#00f076] hover:bg-[#22ff8f] active:scale-[0.98] text-slate-950 font-black text-sm py-4 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-mono">
      <i class="fa-solid fa-circle-check text-base"></i>
      <span>Confirm Deposit / জমা নিশ্চিত করুন</span>
      <i class="fa-solid fa-arrow-right text-xs"></i>
    </button>
  </div>

  <!-- Trust & Security Badges -->
  <div class="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
    <div class="bg-slate-900/60 border border-slate-800/60 p-2 rounded-xl">
      <i class="fa-solid fa-bolt text-emerald-400 text-xs block mb-1"></i>
      <span class="text-[8px] text-slate-300 font-bold block">Instant Auto</span>
    </div>
    <div class="bg-slate-900/60 border border-slate-800/60 p-2 rounded-xl">
      <i class="fa-solid fa-lock text-cyan-400 text-xs block mb-1"></i>
      <span class="text-[8px] text-slate-300 font-bold block">256-Bit Encrypted</span>
    </div>
    <div class="bg-slate-900/60 border border-slate-800/60 p-2 rounded-xl">
      <i class="fa-solid fa-headset text-amber-400 text-xs block mb-1"></i>
      <span class="text-[8px] text-slate-300 font-bold block">24/7 Agent Desk</span>
    </div>
  </div>

  <!-- Recent Deposit History Mini Link -->
  <div class="text-center pt-2">
    <button type="button" onclick="if(window.app){window.app.currentTab='history';window.app.render();}" class="text-[11px] text-slate-400 hover:text-emerald-400 font-mono transition cursor-pointer inline-flex items-center gap-1.5 active:scale-95">
      <i class="fa-solid fa-clock-rotate-left text-xs"></i>
      <span>View Past Deposit History / পূর্ববর্তী জমার তালিকা</span>
    </button>
  </div>

</div>
