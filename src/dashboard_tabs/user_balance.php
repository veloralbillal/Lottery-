<!-- ================= TAB: WALLET (DEPOSITS & WITHDRAWALS FORMS) ================= -->
<div id="tab-wallet" class="hidden space-y-6">
  
  <!-- Balance Display card -->
  <div class="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl text-center space-y-2">
    <span class="text-[10px] uppercase font-bold text-slate-500 font-mono">Total Liquid Wallet Purse</span>
    <div class="text-3xl font-black text-white font-mono">৳<span class="curr-balance"></span></div>
    <p class="text-[10px] text-slate-500">Available to purchase lottery draw pools with zero escrow delays.</p>
  </div>

  <!-- PLACEHOLDER FOR EXTENSION STATS & VAULT -->
  <div id="wallet-extensions-dashboard-placeholder" class="space-y-6"></div>

  <!-- AGENT DIRECTORY & LIVE WHATSAPP SUPPORT -->
  <div class="bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border border-emerald-500/20 p-5 rounded-3xl space-y-4 shadow-xl">
    <div class="flex items-center justify-between border-b border-emerald-900/20 pb-3">
      <div class="flex items-center gap-2">
        <i class="fa-brands fa-whatsapp text-emerald-400 text-lg animate-pulse"></i>
        <div>
          <h3 class="text-xs font-black uppercase text-white font-display">Live Agent WhatsApp Support</h3>
          <p class="text-[9px] text-slate-400 font-sans">Contact our certified agents instantly on WhatsApp for manual deposits & cashouts</p>
        </div>
      </div>
    </div>
    
    <div class="space-y-3">
      <!-- District Selector -->
      <div class="space-y-1">
        <label class="block text-slate-500 text-[9px] uppercase font-mono">Select Agent District</label>
        <select id="user-support-agent-district-select" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none cursor-pointer focus:border-emerald-500">
          <option value="all">-- Show All Districts --</option>
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

      <!-- Agents List Container -->
      <div id="user-support-agents-list" class="space-y-2.5 max-h-52 overflow-y-auto pr-1">
        <!-- Dynamically loaded in main.js -->
      </div>
    </div>
  </div>

  <!-- DEPOSIT PANEL CARD -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
    <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
      <i class="fa-solid fa-circle-down text-emerald-400 text-sm"></i>
      <h3 class="text-xs font-bold uppercase text-slate-300">Add Wallet Balance</h3>
    </div>

    <!-- Merchant payment instructions info routing block -->
    <div id="deposit-channel-instructions-area" class="space-y-3 font-mono">
      <!-- Dynamically rendered active channel details box -->
      <div class="bg-slate-950/80 p-4 rounded-2xl border border-slate-805/80 space-y-3 relative overflow-hidden">
        <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5" id="user-dep-type-badge-container">
          <span id="user-dep-type-badge" class="text-[8px] font-bold uppercase tracking-wider bg-pink-950/30 text-pink-400 border border-pink-900/20 px-2.5 py-0.5 rounded-full">Personal</span>
        </div>
        
        <div class="space-y-1">
          <span id="user-dep-title" class="text-xs font-bold text-white block">bKash Wallet details</span>
          <p id="user-dep-instruction" class="text-[10px] text-slate-400 font-sans leading-relaxed font-sans mt-0.5">Send money to our bKash Personal account, then submit your transaction tracer ID below.</p>
        </div>

        <!-- Multiple Target Accounts Block -->
        <div id="user-dep-accounts-container" class="space-y-2">
          <!-- Personal Number Row -->
          <div id="user-dep-row-personal" class="flex items-center justify-between gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800/60">
            <div class="truncate">
              <span class="text-[8px] text-pink-400 block uppercase font-bold">Personal Number (Send Money)</span>
              <span id="user-dep-account-personal" class="text-emerald-400 font-bold select-all select-text font-mono text-xs break-all">None</span>
            </div>
            <button type="button" id="copy-dep-personal-btn" class="bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-[10px] transition font-sans shrink-0 flex items-center gap-1 cursor-pointer">
              <i class="fa-solid fa-copy text-pink-500"></i> <span>Copy</span>
            </button>
          </div>

          <!-- Agent Number Row -->
          <div id="user-dep-row-agent" class="flex items-center justify-between gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800/60">
            <div class="truncate">
              <span class="text-[8px] text-amber-400 block uppercase font-bold">Agent Number (Cash Out)</span>
              <span id="user-dep-account-agent" class="text-cyan-400 font-bold select-all select-text font-mono text-xs break-all">None</span>
            </div>
            <button type="button" id="copy-dep-agent-btn" class="bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-[10px] transition font-sans shrink-0 flex items-center gap-1 cursor-pointer">
              <i class="fa-solid fa-copy text-amber-500"></i> <span>Copy</span>
            </button>
          </div>

          <!-- Single Target Row fallback (For Bank / Cryptos) -->
          <div id="user-dep-row-single" class="hidden flex items-center justify-between gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800/60">
            <div class="truncate">
              <span id="user-dep-single-label" class="text-[8px] text-slate-500 block uppercase font-bold">Payment Target Line</span>
              <span id="user-dep-account-single" class="text-emerald-400 font-bold select-all select-text font-mono text-xs break-all">None</span>
            </div>
            <button type="button" id="copy-dep-single-btn" class="bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-[10px] transition font-sans shrink-0 flex items-center gap-1 cursor-pointer">
              <i class="fa-solid fa-copy text-cyan-400"></i> <span>Copy</span>
            </button>
          </div>

          <!-- District-Wise Agent Row -->
          <div id="user-dep-row-district-agents" class="hidden space-y-3">
            <div class="bg-indigo-950/40 border border-indigo-900/30 p-3 rounded-2xl space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">
                  <i class="fa-solid fa-map-location-dot mr-1"></i> Look Up Agents by District
                </span>
                <span class="text-[8px] py-0.5 px-2 bg-emerald-950 text-emerald-450 font-bold border border-emerald-900/40 rounded-full flex items-center gap-1 font-mono">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> VERIFIED AGENT
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div class="space-y-1">
                  <label class="block text-slate-500 text-[9px] uppercase font-mono">Select District</label>
                  <select id="user-dep-agent-district-select" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-1 px-1.5 text-[10px] text-white outline-none cursor-pointer focus:border-indigo-500">
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
                  <label class="block text-slate-500 text-[9px] uppercase font-mono">Choose Agent</label>
                  <select id="user-dep-agent-lookup-select" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-1 px-1.5 text-[10px] text-slate-300 outline-none cursor-pointer focus:border-indigo-500">
                    <!-- Populated dynamically -->
                  </select>
                </div>
              </div>

              <div id="user-dep-agent-details-card" class="bg-slate-950/80 border border-slate-850 p-2 rounded-xl space-y-1.5 hidden">
                <div class="flex justify-between items-center text-[9px] font-mono text-slate-400">
                  <span>Operator: <strong class="text-white" id="user-dep-agent-lbl-username">@agent_dhaka</strong></span>
                  <span>Phone: <strong class="text-emerald-400 select-all" id="user-dep-agent-lbl-phone">017xxxxxx</strong></span>
                </div>
                <p class="text-[8.5px] text-slate-500 leading-normal font-sans">
                  Instructions: Handover cash or transfer funds to the agent's number. Use their username as reference. Submit your TrxID below to credit immediately!
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Live scan QR block (for crypto) -->
        <div id="user-dep-qr-block" class="hidden flex flex-col items-center justify-center p-3 bg-slate-900/40 rounded-xl border border-slate-800/30 text-center space-y-2">
          <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest block"><i class="fa-solid fa-qrcode mr-1"></i> Scan to deposit</span>
          <div class="w-32 h-32 bg-white p-1 rounded-xl flex items-center justify-center">
            <img id="user-dep-qr-img" class="w-full h-full object-contain" src="" alt="QR Address" />
          </div>
          <span class="text-[8px] text-slate-500">Scan this dynamically generated QR code securely</span>
        </div>
      </div>
    </div>

    <!-- Deposit Filing Form -->
    <form id="wallet-deposit-form" class="space-y-3.5 pt-1">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label class="block text-[10px] uppercase font-mono text-slate-500">Method</label>
          <select id="dep-gateway" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer">
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Upay">Upay</option>
            <option value="DBBL">Dutch Bangla</option>
            <option value="Crypto USDT">TRC20 USDT</option>
            <option value="Crypto BTC">Bitcoin BTC</option>
            <option value="Crypto ETH">Ethereum ETH</option>
          </select>
        </div>
        <!-- CRYPTO CALCULATOR PLACEHOLDER -->
        <div id="wallet-extensions-crypto-calc-placeholder" class="col-span-1 flex flex-col justify-end"></div>
      </div>

      <!-- QUICK PRESET DEPOSIT BUTTONS PLACEHOLDER -->
      <div id="wallet-extensions-quick-deposit-placeholder" class="space-y-1.5"></div>

      <div class="space-y-1.5">
        <label class="block text-[10px] uppercase font-mono text-slate-500">Amount (৳)</label>
        <input id="dep-amount" type="number" required min="20" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-mono text-white outline-none focus:border-emerald-500" placeholder="e.g. 500" />
      </div>

      <div class="space-y-1.5">
        <label class="block text-[10px] uppercase font-mono text-slate-500">Traced Transaction ID (TrxID)</label>
        <input id="dep-trxid" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-white outline-none focus:border-emerald-500" placeholder="e.g. BXA93849102" />
      </div>

      <!-- Google Picker Deposit Receipt Upload proof -->
      <div class="space-y-1.5">
        <label class="block text-[10px] uppercase font-mono text-slate-500">Deposit Proof Receipt File</label>
        <button type="button" id="dep-receipt-picker-btn" class="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-amber-400 rounded-xl py-2.5 px-3 text-xs flex items-center justify-center gap-2 transition cursor-pointer font-mono">
          <i class="fa-brands fa-google-drive text-amber-500"></i>
          <span>Select Receipt from Google Drive</span>
        </button>
        <div id="dep-selected-receipt-holder" class="hidden bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-[10px] font-mono text-slate-300">
          <div class="flex items-center gap-2">
            <img id="dep-selected-receipt-thumb" class="w-8 h-8 rounded object-cover border border-slate-800" src="" alt="Receipt" referrerPolicy="no-referrer" />
            <div class="truncate">
              <span id="dep-selected-receipt-name" class="text-white block font-bold max-w-[150px] truncate">Document.jpg</span>
              <span class="text-slate-500 block">Statement selected</span>
            </div>
          </div>
          <button type="button" id="dep-clear-receipt-btn" class="text-[10px] text-rose-500 hover:underline"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>

      <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl shadow-lg transition active:opacity-90">
        File Deposit Request
      </button>
    </form>
  </div>

  <!-- WITHDRAWAL PANEL CARD -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
    <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
      <i class="fa-solid fa-circle-up text-rose-400 text-sm"></i>
      <h3 class="text-xs font-bold uppercase text-slate-300">Request Cash Withdrawal</h3>
    </div>

    <form id="wallet-withdraw-form" class="space-y-3.5">
      <div class="space-y-1.5">
        <label class="block text-[10px] uppercase font-mono text-slate-500">Withdrawal Channel</label>
        <select id="wd-gateway" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-rose-500 cursor-pointer">
          <option value="bKash">bKash (SendMoney)</option>
          <option value="Nagad">Nagad (SendMoney)</option>
          <option value="Rocket">Rocket (Personal)</option>
          <option value="Upay">Upay (Personal)</option>
          <option value="DBBL">Dutch Bangla DBBL</option>
          <option value="Crypto USDT">TRC20 USDT</option>
          <option value="Agent Withdraw">Agent Withdraw (Verified Local Desk)</option>
        </select>
      </div>

      <!-- District Wise Partner Agents for withdrawal -->
      <div id="user-wd-row-district-agents" class="hidden bg-indigo-950/20 border border-indigo-900/30 p-3.5 rounded-2xl space-y-2.5 text-xs text-slate-300">
        <div class="flex items-center justify-between">
          <span class="text-[9px] text-indigo-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
            <i class="fa-solid fa-map-pin"></i> LOCAL CASH PAYOUT NETWORK
          </span>
          <span class="text-[8.5px] py-0.5 px-1.5 bg-emerald-950 text-emerald-400 font-bold border border-emerald-900/40 rounded font-mono">
            VERIFIED DESK
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1">
            <label class="block text-slate-500 text-[9px] uppercase font-mono">Payout District</label>
            <select id="user-wd-agent-district-select" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-2 text-[10px] text-white outline-none cursor-pointer">
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
            <label class="block text-slate-500 text-[9px] uppercase font-mono">Agency Desk Dealer</label>
            <select id="user-wd-agent-lookup-select" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-2 text-[10px] text-slate-300 outline-none cursor-pointer">
              <!-- Populated dynamically -->
            </select>
          </div>
        </div>

        <div id="user-wd-agent-details-card" class="bg-slate-950/90 border border-slate-850 p-2.5 rounded-xl text-[9px] text-slate-400 space-y-1.5 hidden font-mono">
          <div class="flex justify-between items-center">
            <span>Merchant Agent: <strong class="text-white" id="user-wd-agent-lbl-username">@agent_dhaka</strong></span>
            <span>Hand-off Point: <strong class="text-indigo-400" id="user-wd-agent-lbl-location">Dhaka District</strong></span>
          </div>
          <div class="text-[8.5px] text-slate-500 leading-normal font-sans">
            Physical Cash-Out at operator desk. Auto-prefilled partner cash-out number below.
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label class="block text-[10px] uppercase font-mono text-slate-500">Extract Amount (৳)</label>
          <input id="wd-amount" type="number" required min="100" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-mono text-white outline-none focus:border-rose-500" placeholder="e.g. 1000" />
        </div>

        <div class="space-y-1.5">
          <label class="block text-[10px] uppercase font-mono text-slate-500">Target Recipient Number</label>
          <input id="wd-account" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-mono text-white outline-none focus:border-rose-500" placeholder="017xxxxxxxx" />
        </div>
      </div>

      <p class="text-[9px] text-slate-500 font-mono">* Payout withdrawals are audited and released. Standard completion: 15 mins to 1 hour.</p>

      <!-- SECURITY PIN LOCK PLACEHOLDER -->
      <div id="wallet-extensions-withdraw-security-placeholder" class="space-y-3"></div>

      <button type="submit" class="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-3 rounded-xl shadow-lg transition active:opacity-90">
        Submit Withdrawal Ticket
      </button>
    </form>
  </div>

  <!-- GOOGLE DRIVE BACKUP & STATEMENTS VAULT -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
    <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
      <i class="fa-brands fa-google-drive text-amber-500 text-sm animate-pulse"></i>
      <h3 class="text-xs font-bold uppercase text-slate-300">Google Drive Statements Vault</h3>
    </div>
    
    <p class="text-[10px] text-slate-400 leading-normal font-mono">
      Securely connect your personal Google Drive account to backup your transaction ledgers and select payment receipts directly from your drive files.
    </p>

    <div id="gdrive-not-auth" class="bg-slate-950 border border-slate-800/60 p-4 rounded-2xl text-center space-y-3">
      <span class="text-[9px] text-slate-500 font-mono block">Google account disconnected</span>
      <button id="gdrive-authorize-btn" type="button" class="bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-[1.01] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg transition mx-auto flex items-center justify-center gap-2 cursor-pointer font-mono">
        <i class="fa-brands fa-google-drive"></i>
        Authorize Drive
      </button>
    </div>

    <div id="gdrive-auth-zone" class="hidden space-y-3.5 font-mono text-xs">
      <div class="bg-slate-950 p-2.5 border border-slate-800/60 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-2 text-slate-300 text-[10px]">
          <i class="fa-solid fa-circle-check text-emerald-400"></i>
          <span>Drive Engaged</span>
        </div>
        <button id="gdrive-disconnect-btn" type="button" class="text-[10px] text-rose-400 hover:underline">Disconnect</button>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button id="backup-ledger-btn" type="button" class="bg-slate-950 hover:bg-slate-900 border border-slate-800/80 py-3 rounded-xl text-slate-300 flex flex-col items-center gap-1 transition cursor-pointer text-[10px]">
          <i class="fa-solid fa-cloud-arrow-up text-cyan-400 text-sm"></i>
          <span>Backup Ledger</span>
        </button>
        <button id="view-backups-picker-btn" type="button" class="bg-slate-950 hover:bg-slate-900 border border-slate-800/80 py-3 rounded-xl text-slate-300 flex flex-col items-center gap-1 transition cursor-pointer text-[10px]">
          <i class="fa-solid fa-folder-open text-amber-500 text-sm"></i>
          <span>Browse Backups</span>
        </button>
      </div>
    </div>
  </div>

</div>
