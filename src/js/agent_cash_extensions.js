/**
 * agent_cash_extensions.js
 *
 * Implements high-fidelity features for the Cash Terminal tab in the Field Agent Suite:
 * 1. Live Till & Cash Drawer Stats (Net flow, Total cash-in, Total cash-out)
 * 2. Bangladesh Bank Note Denomination Calculator (৳1000, ৳500, ৳100, ৳50, ৳20, ৳10) with one-click form pre-filling
 * 3. Player Live Account Scanner & Verification Desk (instantly see balance, VIP tier, active tickets, and OTP status)
 * 4. Emergency OTA OTP Dispatcher (Simulate real-time OTP dispatch directly to player's terminal)
 * 5. Modern POS Thermal Roll Receipt Generator (Simulated terminal ticket printing for bookkeeping)
 */

export class AgentCashExtensions {
  static init(appInstance) {
    console.log("Agent Cash Extensions Module Initialized.");
    this.injectHTMLPlaceholder();
    this.setupListeners(appInstance);
  }

  static injectHTMLPlaceholder() {
    // Check if container already exists
    if (document.getElementById("agent-cash-extensions-container")) return;

    const cashTab = document.getElementById("agent-tab-cash");
    if (!cashTab) return;

    // We will append our rich extension panel to the bottom of the Cash Terminal tab
    const extensionsDiv = document.createElement("div");
    extensionsDiv.id = "agent-cash-extensions-container";
    extensionsDiv.className = "space-y-6 pt-6 border-t border-slate-800/80 mt-6";

    extensionsDiv.innerHTML = `
      <!-- GRID OF RICH EXTENSIONS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- PANEL 1: PLAYER ACCOUNT SCANNER & EMERGENCY OTP TERMINAL -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="flex items-center gap-2 border-b border-slate-850 pb-3">
            <span class="p-2 bg-blue-950/60 border border-blue-900/30 rounded-2xl text-blue-400 text-xs">
              <i class="fa-solid fa-address-card"></i>
            </span>
            <div>
              <h3 class="text-sm font-black text-white">Live Player Verification & OTA Desk</h3>
              <p class="text-xs text-slate-500 font-mono">Verify credentials and trigger instant verification signals.</p>
            </div>
          </div>

          <div class="space-y-3">
            <!-- Search field -->
            <div class="grid grid-cols-3 gap-2">
              <div class="col-span-2 relative">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 font-bold text-xs">@</span>
                <input id="agent-ext-scan-username" type="text" class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-7 pr-3 text-white text-xs outline-none focus:border-blue-500 font-mono" placeholder="Username" />
              </div>
              <button id="btn-agent-ext-scan-user" class="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase rounded-xl cursor-pointer transition flex items-center justify-center gap-1">
                <i class="fa-solid fa-qrcode"></i> Scan Account
              </button>
            </div>

            <!-- Scanner Output Display Card -->
            <div id="agent-ext-scanner-card" class="bg-slate-950 border border-slate-850/60 rounded-2xl p-4 space-y-3 text-xs">
              <div class="text-center py-4 text-slate-500 text-xs font-mono">
                <i class="fa-solid fa-user-shield text-xl text-slate-700 block mb-1.5"></i>
                Ready to verify player terminal data.
              </div>
            </div>

            <!-- Emergency OTA OTP Dispatcher form -->
            <div class="border-t border-slate-850 pt-3.5 space-y-2">
              <span class="text-[10px] text-slate-455 uppercase font-black font-mono tracking-wider block">Emergency Over-The-Air OTP Dispatcher</span>
              <p class="text-[11px] text-slate-500 leading-normal">If player is physically present but did not receive SMS code, generate a secure OTA terminal dispatch.</p>
              
              <div class="flex gap-2">
                <input id="agent-ext-otp-target" type="text" class="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-amber-500 font-mono" placeholder="Username (e.g. player123)" />
                <button id="btn-agent-ext-dispatch-otp" class="bg-amber-600/15 hover:bg-amber-600/30 text-amber-400 border border-amber-500/20 px-4 py-2 font-black text-[10px] uppercase rounded-xl cursor-pointer transition flex items-center gap-1.5">
                  <i class="fa-solid fa-paper-plane"></i> Dispatch OTP
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- PANEL 2: BANGLADESH BANK Note Denomination Counter (৳) -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-teal-600/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="flex items-center justify-between border-b border-slate-850 pb-3">
            <div class="flex items-center gap-2">
              <span class="p-2 bg-teal-950/60 border border-teal-900/30 rounded-2xl text-teal-400 text-xs">
                <i class="fa-solid fa-calculator"></i>
              </span>
              <div>
                <h3 class="text-sm font-black text-white">Till Denomination Desk</h3>
                <p class="text-xs text-slate-500 font-mono">Count physical note rolls to pre-fill load/withdraw forms.</p>
              </div>
            </div>
            <button id="btn-agent-denom-reset" class="text-[10px] font-black uppercase text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 bg-rose-950/20 border border-rose-900/20 px-2 py-1 rounded-lg">
              <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
          </div>

          <!-- Notes Tally Lists -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <!-- 1000 Note -->
            <div class="flex items-center justify-between bg-slate-950/50 p-2 border border-slate-850/40 rounded-xl">
              <span class="font-bold font-mono text-slate-400">৳1000</span>
              <div class="flex items-center gap-2">
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="1000" action="minus">-</button>
                <span id="denom-qty-1000" class="font-mono font-black text-white w-6 text-center">0</span>
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="1000" action="plus">+</button>
              </div>
            </div>
            <!-- 500 Note -->
            <div class="flex items-center justify-between bg-slate-950/50 p-2 border border-slate-850/40 rounded-xl">
              <span class="font-bold font-mono text-slate-400">৳500</span>
              <div class="flex items-center gap-2">
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="500" action="minus">-</button>
                <span id="denom-qty-500" class="font-mono font-black text-white w-6 text-center">0</span>
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="500" action="plus">+</button>
              </div>
            </div>
            <!-- 100 Note -->
            <div class="flex items-center justify-between bg-slate-950/50 p-2 border border-slate-850/40 rounded-xl">
              <span class="font-bold font-mono text-slate-400">৳100</span>
              <div class="flex items-center gap-2">
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="100" action="minus">-</button>
                <span id="denom-qty-100" class="font-mono font-black text-white w-6 text-center">0</span>
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="100" action="plus">+</button>
              </div>
            </div>
            <!-- 50 Note -->
            <div class="flex items-center justify-between bg-slate-950/50 p-2 border border-slate-850/40 rounded-xl">
              <span class="font-bold font-mono text-slate-400">৳50</span>
              <div class="flex items-center gap-2">
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="50" action="minus">-</button>
                <span id="denom-qty-50" class="font-mono font-black text-white w-6 text-center">0</span>
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="50" action="plus">+</button>
              </div>
            </div>
            <!-- 20 Note -->
            <div class="flex items-center justify-between bg-slate-950/50 p-2 border border-slate-850/40 rounded-xl">
              <span class="font-bold font-mono text-slate-400">৳20</span>
              <div class="flex items-center gap-2">
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="20" action="minus">-</button>
                <span id="denom-qty-20" class="font-mono font-black text-white w-6 text-center">0</span>
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="20" action="plus">+</button>
              </div>
            </div>
            <!-- 10 Note -->
            <div class="flex items-center justify-between bg-slate-950/50 p-2 border border-slate-850/40 rounded-xl">
              <span class="font-bold font-mono text-slate-400">৳10</span>
              <div class="flex items-center gap-2">
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="10" action="minus">-</button>
                <span id="denom-qty-10" class="font-mono font-black text-white w-6 text-center">0</span>
                <button class="denom-change text-slate-400 hover:text-white bg-slate-900 p-1 rounded-lg border border-slate-800 w-6 text-center font-bold" note="10" action="plus">+</button>
              </div>
            </div>
          </div>

          <!-- Total Counter & Sync Actions -->
          <div class="bg-slate-950 border border-slate-850/60 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-0.5">
              <span class="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider font-mono">Total Counted Sum</span>
              <div id="denom-total-display" class="text-xl font-black text-teal-400 font-mono">৳0.00</div>
            </div>
            
            <div class="flex items-center gap-2">
              <button id="btn-denom-apply-dep" class="bg-emerald-950/40 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/30 font-black text-[10px] uppercase py-2 px-3.5 rounded-xl cursor-pointer transition flex items-center gap-1">
                <i class="fa-solid fa-circle-down"></i> Apply to Deposit
              </button>
              <button id="btn-denom-apply-wdr" class="bg-rose-955/40 hover:bg-rose-900 text-rose-450 border border-rose-900/30 font-black text-[10px] uppercase py-2 px-3.5 rounded-xl cursor-pointer transition flex items-center gap-1">
                <i class="fa-solid fa-circle-up"></i> Apply to Cashout
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- TILL CASH FLOW & RECENT OPERATIONS LEDGER WITH PRINTER -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-3 gap-3">
          <div class="flex items-center gap-2">
            <span class="p-2 bg-indigo-950/60 border border-indigo-900/30 rounded-2xl text-indigo-400 text-xs">
              <i class="fa-solid fa-cash-register"></i>
            </span>
            <div>
              <h3 class="text-sm font-black text-white">Live Shift Drawer & POS Terminal</h3>
              <p class="text-xs text-slate-500 font-mono">Physical cash desk logging and thermal roll ticket printer receipts.</p>
            </div>
          </div>

          <!-- Flow Summary Ticker -->
          <div class="flex items-center gap-3 bg-slate-950/80 px-4 py-2 border border-slate-850 rounded-2xl font-mono text-[11px]">
            <div>
              <span class="text-slate-500">In (Loads):</span>
              <span id="agent-ext-shift-in" class="text-emerald-400 font-bold">৳0.00</span>
            </div>
            <div class="text-slate-700">|</div>
            <div>
              <span class="text-slate-500">Out (Paid):</span>
              <span id="agent-ext-shift-out" class="text-rose-450 font-bold">৳0.00</span>
            </div>
            <div class="text-slate-700">|</div>
            <div>
              <span class="text-slate-500">Net Till:</span>
              <span id="agent-ext-shift-net" class="text-indigo-400 font-black">৳0.00</span>
            </div>
          </div>
        </div>

        <!-- Shift Operations Logs -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-850 text-slate-500 text-[9px] uppercase tracking-wider font-mono">
                <th class="p-3">Time</th>
                <th class="p-3">Target Player</th>
                <th class="p-3">Action Details</th>
                <th class="p-3">Cash Tally</th>
                <th class="p-3 text-right">POS Receipt</th>
              </tr>
            </thead>
            <tbody id="agent-ext-shift-tbody" class="divide-y divide-slate-850/30 text-xs">
              <!-- Chronological shift logs populated dynamically -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- PRINTER MODAL (MODERN POS THERMAL ROLL TICKET STYLE) -->
      <div id="agent-receipt-modal" class="hidden fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white text-slate-900 w-full max-w-[340px] rounded-2xl shadow-2xl p-6 relative font-mono overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Close button -->
          <button id="btn-agent-receipt-close" class="absolute top-3 right-3 text-slate-400 hover:text-slate-800 text-sm p-1 transition cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- Top thermal roll texture look -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-b from-slate-200 to-transparent"></div>

          <!-- Receipt scroll container -->
          <div class="flex-1 overflow-y-auto space-y-4 text-xs pr-1 scrollbar-thin">
            
            <!-- Terminal Header -->
            <div class="text-center space-y-1">
              <div class="font-sans font-black text-sm tracking-wide text-black uppercase">** DIGITAL AGENT SYSTEM **</div>
              <div class="text-[10px] text-slate-600">OFFLINE CRAWL TERMINAL v2.4</div>
              <div class="text-[10px] text-slate-500" id="receipt-station-district">DHAKA CENTRAL DISTRICT</div>
            </div>

            <!-- Separator -->
            <div class="border-b border-dashed border-slate-400 my-1"></div>

            <!-- Receipt Info metadata -->
            <div class="space-y-1 text-[10px] text-slate-700">
              <div class="flex justify-between">
                <span>TX REF:</span>
                <span id="receipt-tx-ref" class="font-bold text-black">AGN-98218-X</span>
              </div>
              <div class="flex justify-between">
                <span>DATE/TIME:</span>
                <span id="receipt-date">2026-07-15 12:45 PM</span>
              </div>
              <div class="flex justify-between">
                <span>OPERATOR ID:</span>
                <span id="receipt-operator" class="font-bold">@agent_dhaka</span>
              </div>
              <div class="flex justify-between">
                <span>TERMINAL:</span>
                <span>DESK-01 (ACTIVE)</span>
              </div>
            </div>

            <!-- Separator -->
            <div class="border-b border-dashed border-slate-400 my-1"></div>

            <!-- Core billing items -->
            <div class="py-2 text-center space-y-2">
              <span id="receipt-type-badge" class="inline-block px-2 py-0.5 bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider rounded">CASH TRANSFER APPROVED</span>
              
              <div class="space-y-0.5 pt-1">
                <div class="text-[10px] text-slate-500 uppercase tracking-widest">TRANSACTION SUM</div>
                <div id="receipt-total-amount" class="text-2xl font-black text-black">৳1,500.00</div>
              </div>
            </div>

            <div class="space-y-1 text-[11px] text-slate-800">
              <div class="flex justify-between">
                <span>Client Player:</span>
                <span id="receipt-player" class="font-bold text-black">@player_one</span>
              </div>
              <div class="flex justify-between">
                <span>Description:</span>
                <span id="receipt-desc" class="text-right">Wallet Cash Deposit</span>
              </div>
              <div class="flex justify-between">
                <span>Terminal Fee:</span>
                <span>৳0.00 (FREE)</span>
              </div>
            </div>

            <!-- Separator -->
            <div class="border-b border-dashed border-slate-400 my-1"></div>

            <!-- Barcode look & custom thank you message -->
            <div class="text-center space-y-2.5 pt-1">
              <!-- Mock Barcode -->
              <div class="flex items-center justify-center tracking-[4px] text-xs font-black font-mono select-none text-black">
                ||||| | ||| || ||| ||| | ||
              </div>
              <div class="text-[10.5px] text-slate-500 leading-tight">
                Thank you for using our agent terminal network. Please verify your updated online wallet balance immediately!
              </div>
            </div>

            <!-- Cut line simulation -->
            <div class="text-center text-[10px] text-slate-400 font-bold select-none border-b border-dotted border-slate-300 pb-2">
              ---------------- [ CUT HERE ] ----------------
            </div>
          </div>

          <!-- Bottom trigger actions -->
          <div class="pt-4 border-t border-slate-100 flex gap-2">
            <button id="btn-receipt-system-print" class="flex-1 bg-slate-900 hover:bg-black text-white py-2 px-3 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-1 cursor-pointer transition">
              <i class="fa-solid fa-print"></i> System Print
            </button>
            <button id="btn-receipt-copy-share" class="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-1 cursor-pointer transition">
              <i class="fa-solid fa-copy"></i> Copy Text
            </button>
          </div>
        </div>
      </div>
    `;

    cashTab.appendChild(extensionsDiv);
  }

  static setupListeners(appInstance) {
    // 1. NOTES DENOMINATION QUANTITIES STATE
    const noteDenoms = {
      1000: 0,
      500: 0,
      100: 0,
      50: 0,
      20: 0,
      10: 0
    };

    const updateDenomUI = () => {
      let total = 0;
      Object.keys(noteDenoms).forEach(note => {
        const qty = noteDenoms[note];
        total += parseInt(note) * qty;
        const qtyEl = document.getElementById(`denom-qty-${note}`);
        if (qtyEl) qtyEl.innerText = qty;
      });

      const totalDisplay = document.getElementById("denom-total-display");
      if (totalDisplay) totalDisplay.innerText = `৳${total.toFixed(2)}`;
    };

    // Note change button triggers
    document.querySelectorAll(".denom-change").forEach(btn => {
      btn.addEventListener("click", () => {
        const note = btn.getAttribute("note");
        const action = btn.getAttribute("action");

        if (action === "plus") {
          noteDenoms[note]++;
        } else if (action === "minus") {
          if (noteDenoms[note] > 0) noteDenoms[note]--;
        }

        updateDenomUI();
      });
    });

    // Reset notes tally
    const resetBtn = document.getElementById("btn-agent-denom-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        Object.keys(noteDenoms).forEach(note => {
          noteDenoms[note] = 0;
        });
        updateDenomUI();
        appInstance.showToast("Denomination calculator reset to 0.", "info");
      });
    }

    // Apply counted sums to load or cashout forms
    const applyDepBtn = document.getElementById("btn-denom-apply-dep");
    if (applyDepBtn) {
      applyDepBtn.addEventListener("click", () => {
        let total = 0;
        Object.keys(noteDenoms).forEach(note => {
          total += parseInt(note) * noteDenoms[note];
        });

        if (total === 0) {
          appInstance.showToast("Please count some notes first using the tally buttons!", "error");
          return;
        }

        const loadInput = document.getElementById("agent-cash-dep-amount");
        if (loadInput) {
          loadInput.value = total;
          appInstance.showToast(`Applied ৳${total} from notes desk to receiver load field!`, "success");
        }
      });
    }

    const applyWdrBtn = document.getElementById("btn-denom-apply-wdr");
    if (applyWdrBtn) {
      applyWdrBtn.addEventListener("click", () => {
        let total = 0;
        Object.keys(noteDenoms).forEach(note => {
          total += parseInt(note) * noteDenoms[note];
        });

        if (total === 0) {
          appInstance.showToast("Please count some notes first using the tally buttons!", "error");
          return;
        }

        const wdrInput = document.getElementById("agent-cash-wdr-amount");
        if (wdrInput) {
          wdrInput.value = total;
          appInstance.showToast(`Applied ৳${total} from notes desk to player cashout field!`, "success");
        }
      });
    }

    // 2. PLAYER INFORMATION LOOKUP SCANNER
    const scanBtn = document.getElementById("btn-agent-ext-scan-user");
    const scanInput = document.getElementById("agent-ext-scan-username");
    const scannerCard = document.getElementById("agent-ext-scanner-card");

    if (scanBtn && scanInput && scannerCard) {
      scanBtn.addEventListener("click", () => {
        const usernameVal = scanInput.value.trim().toLowerCase();
        if (!usernameVal) {
          appInstance.showToast("Please input player username first!", "error");
          return;
        }

        const targetUser = appInstance.db.users.find(u => u.username.toLowerCase() === usernameVal);
        if (!targetUser) {
          scannerCard.innerHTML = `
            <div class="text-center py-4 text-rose-450 font-mono">
              <i class="fa-solid fa-triangle-exclamation text-xl block mb-1.5"></i>
              No player found matching @${usernameVal}.
            </div>
          `;
          appInstance.showToast("Verification failed: username not found in database!", "error");
          return;
        }

        // Gather real-time metadata of user
        const balance = targetUser.balance || 0;
        const phoneStr = targetUser.phone || "No phone bound";
        const districtStr = targetUser.district || "Default Dhaka Zone";
        const ticketsCount = (appInstance.db.tickets || []).filter(t => t.userId === targetUser.id).length;
        const vipLevel = targetUser.vipLevel || "Bronze";

        // Check if user has an active cashout OTP
        const otpInfo = targetUser.cashoutOTP;
        let otpBadge = "";
        let fillBtnHtml = "";

        if (otpInfo && !otpInfo.used && Date.now() < otpInfo.expiresAt) {
          const expiresSec = Math.ceil((otpInfo.expiresAt - Date.now()) / 1000);
          otpBadge = `<span class="bg-amber-950 border border-amber-800 text-amber-400 font-bold px-2 py-0.5 rounded-full text-[10px]">🔥 OTP VALID (${expiresSec}s left)</span>`;
          fillBtnHtml = `
            <button id="btn-agent-ext-autofill-otp" class="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase cursor-pointer tracking-wider transition flex items-center justify-center gap-1.5 mt-2 shadow-lg shadow-amber-900/10">
              <i class="fa-solid fa-bolt"></i> Auto-Fill Player Cashout Form
            </button>
          `;
        } else {
          otpBadge = `<span class="bg-slate-900 border border-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded-full text-[10px]">❌ NO ACTIVE CASH-OUT OTP</span>`;
        }

        scannerCard.innerHTML = `
          <div class="space-y-3.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-9 h-9 rounded-full bg-blue-950 border border-blue-900 text-blue-400 flex items-center justify-center font-bold text-sm uppercase">
                  ${targetUser.username.slice(0, 2)}
                </div>
                <div>
                  <h4 class="font-black text-white font-mono leading-none">@${targetUser.username}</h4>
                  <span class="text-[9.5px] text-slate-500 font-mono block mt-0.5">${phoneStr} • ${districtStr}</span>
                </div>
              </div>
              <span class="bg-indigo-950 border border-indigo-800 text-indigo-400 text-[10px] px-2 py-0.5 font-bold rounded-lg font-mono">${vipLevel} Member</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-[10.5px]">
              <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                <span class="text-slate-500 block mb-0.5 font-mono">Wallet Balance</span>
                <span class="font-mono text-xs font-black text-white">৳${balance.toFixed(2)}</span>
              </div>
              <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                <span class="text-slate-500 block mb-0.5 font-mono">Bought Tickets</span>
                <span class="font-mono text-xs font-black text-white">${ticketsCount} Tickets</span>
              </div>
            </div>

            <div class="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-850">
              <span class="font-mono text-[10.5px] text-slate-400">Cashout Status:</span>
              ${otpBadge}
            </div>

            ${fillBtnHtml}
          </div>
        `;

        appInstance.showToast(`Successfully synced player @${targetUser.username} info.`, "success");

        // Event listener for autofill action
        const autofillBtn = document.getElementById("btn-agent-ext-autofill-otp");
        if (autofillBtn) {
          autofillBtn.addEventListener("click", () => {
            const wdrUserField = document.getElementById("agent-cash-wdr-username");
            const wdrOtpField = document.getElementById("agent-cash-wdr-otp");
            const wdrAmountField = document.getElementById("agent-cash-wdr-amount");

            if (wdrUserField) wdrUserField.value = targetUser.username;
            if (wdrOtpField) wdrOtpField.value = otpInfo.code;
            if (wdrAmountField) {
              // Pre-fill maximum possible or ৳100 preset as sample
              wdrAmountField.value = Math.min(1000, Math.floor(targetUser.balance));
            }

            // Scroll up to the withdrawal form
            const wdrForm = document.getElementById("agent-cash-withdraw-form");
            if (wdrForm) {
              wdrForm.scrollIntoView({ behavior: "smooth" });
            }

            appInstance.showToast("Prefilled target cashout form with OTP details!", "success");
          });
        }
      });
    }

    // 3. EMERGENCY OTP DISPATCHER
    const dispatchBtn = document.getElementById("btn-agent-ext-dispatch-otp");
    const dispatchInput = document.getElementById("agent-ext-otp-target");

    if (dispatchBtn && dispatchInput) {
      dispatchBtn.addEventListener("click", () => {
        const usernameVal = dispatchInput.value.trim().toLowerCase();
        if (!usernameVal) {
          appInstance.showToast("Please input receiver username for OTP dispatch!", "error");
          return;
        }

        const targetUser = appInstance.db.users.find(u => u.username.toLowerCase() === usernameVal);
        if (!targetUser) {
          appInstance.showToast(`Invalid User: @${usernameVal} does not exist in central registry!`, "error");
          return;
        }

        // Generate a fresh 6-digit OTP code in user model
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        targetUser.cashoutOTP = {
          code: randomCode,
          expiresAt: Date.now() + 120 * 1000, // Valid for 2 mins
          used: false
        };

        appInstance.saveDB();
        appInstance.showToast(`Simulated OTA SMS dispatched to player terminal @${targetUser.username}! OTP code generated: ${randomCode}`, "success");
        
        // Auto-fill scanner lookup with dispatched code
        if (scanInput) {
          scanInput.value = targetUser.username;
          if (scanBtn) scanBtn.click();
        }

        dispatchInput.value = "";
      });
    }

    // 4. POS THERMAL ROLL RECEIPT CONTROLS
    const modal = document.getElementById("agent-receipt-modal");
    const modalClose = document.getElementById("btn-agent-receipt-close");
    const printSystemBtn = document.getElementById("btn-receipt-system-print");
    const copyShareBtn = document.getElementById("btn-receipt-copy-share");

    if (modal && modalClose) {
      modalClose.addEventListener("click", () => {
        modal.classList.add("hidden");
      });

      // Close modal on click outside content
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.add("hidden");
        }
      });
    }

    if (printSystemBtn) {
      printSystemBtn.addEventListener("click", () => {
        appInstance.showToast("Sending raw ticket dump stream to desktop printer...", "info");
        window.print();
      });
    }

    if (copyShareBtn) {
      copyShareBtn.addEventListener("click", () => {
        const txRef = document.getElementById("receipt-tx-ref").innerText;
        const player = document.getElementById("receipt-player").innerText;
        const amt = document.getElementById("receipt-total-amount").innerText;
        const desc = document.getElementById("receipt-desc").innerText;
        const dateStr = document.getElementById("receipt-date").innerText;

        const textReceipt = `== CASH TERMINAL RECEIPT ==\nRef: ${txRef}\nDate: ${dateStr}\nPlayer: ${player}\nDescription: ${desc}\nAmount: ${amt}\n==========================`;

        navigator.clipboard.writeText(textReceipt)
          .then(() => {
            appInstance.showToast("Receipt copied as plain text layout!", "success");
          })
          .catch(() => {
            appInstance.showToast("Clipboard write permission error!", "error");
          });
      });
    }
  }

  static render(appInstance) {
    this.injectHTMLPlaceholder();

    const shiftInEl = document.getElementById("agent-ext-shift-in");
    const shiftOutEl = document.getElementById("agent-ext-shift-out");
    const shiftNetEl = document.getElementById("agent-ext-shift-net");
    const shiftTbody = document.getElementById("agent-ext-shift-tbody");

    if (!shiftInEl || !shiftOutEl || !shiftNetEl || !shiftTbody) return;

    // Filter agent's ledger operations
    const ledger = (appInstance.db.agentLedger || []).filter(l => l.agentId === appInstance.currentUser.id);

    let totalIn = 0;
    let totalOut = 0;

    // Filter deposits and withdrawals assisted by this agent
    ledger.forEach(act => {
      const isDeposit = act.description.toLowerCase().includes("deposit") || act.description.toLowerCase().includes("load");
      const isWithdrawal = act.description.toLowerCase().includes("withdraw") || act.description.toLowerCase().includes("cashout");

      if (isDeposit) {
        totalIn += act.amount;
      } else if (isWithdrawal) {
        totalOut += act.amount;
      }
    });

    const netTill = totalIn - totalOut;

    shiftInEl.innerText = `৳${totalIn.toFixed(2)}`;
    shiftOutEl.innerText = `৳${totalOut.toFixed(2)}`;
    shiftNetEl.innerText = `৳${netTill.toFixed(2)}`;

    // Update styling for net balance based on physical till level
    if (netTill > 0) {
      shiftNetEl.className = "text-emerald-400 font-black";
    } else if (netTill < 0) {
      shiftNetEl.className = "text-rose-450 font-black";
    } else {
      shiftNetEl.className = "text-indigo-400 font-black";
    }

    // Populate Shift Ledger Table
    shiftTbody.innerHTML = "";
    if (ledger.length === 0) {
      shiftTbody.innerHTML = `
        <tr>
          <td colspan="5" class="p-4 text-center text-slate-500 font-mono text-[10px]">
            No terminal operations logged during this active shift.
          </td>
        </tr>
      `;
      return;
    }

    // Render chronological order descending
    [...ledger].reverse().forEach(act => {
      const isDeposit = act.description.toLowerCase().includes("deposit") || act.description.toLowerCase().includes("load");
      const row = document.createElement("tr");
      row.className = "border-b border-slate-850/25 text-[11px] hover:bg-slate-950/40 transition font-sans";

      const dateObj = new Date(act.timestamp);
      const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const flowClass = isDeposit ? "text-emerald-400 font-mono font-bold" : "text-rose-450 font-mono font-bold";
      const flowPrefix = isDeposit ? "+৳" : "-৳";

      // Mock receipt ID based on date timestamp hash
      const receiptId = "AGN-" + String(dateObj.getTime()).slice(-5) + "-M";

      row.innerHTML = `
        <td class="p-3 text-slate-500 font-mono">${timeString}</td>
        <td class="p-3 font-bold text-white">@${act.targetUser}</td>
        <td class="p-3 text-slate-400 text-[10.5px]">${act.description}</td>
        <td class="p-3 ${flowClass}">${flowPrefix}${act.amount.toFixed(2)}</td>
        <td class="p-3 text-right">
          <button class="btn-agent-receipt bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800/80 px-2 py-1 rounded-lg text-[9.5px] font-bold tracking-wider font-mono cursor-pointer transition uppercase" 
            data-ref="${receiptId}" 
            data-player="${act.targetUser}" 
            data-desc="${act.description}" 
            data-amount="${act.amount}" 
            data-date="${dateObj.toLocaleString()}" 
            data-type="${isDeposit ? 'load' : 'cashout'}">
            <i class="fa-solid fa-receipt mr-1"></i> Ticket
          </button>
        </td>
      `;

      shiftTbody.appendChild(row);
    });

    // Wire up individual modal receipts
    document.querySelectorAll(".btn-agent-receipt").forEach(btn => {
      btn.addEventListener("click", () => {
        const ref = btn.getAttribute("data-ref");
        const player = btn.getAttribute("data-player");
        const desc = btn.getAttribute("data-desc");
        const amount = parseFloat(btn.getAttribute("data-amount"));
        const date = btn.getAttribute("data-date");
        const type = btn.getAttribute("data-type");

        // Update Modal elements
        const refEl = document.getElementById("receipt-tx-ref");
        const playerEl = document.getElementById("receipt-player");
        const descEl = document.getElementById("receipt-desc");
        const amtEl = document.getElementById("receipt-total-amount");
        const dateEl = document.getElementById("receipt-date");
        const badgeEl = document.getElementById("receipt-type-badge");
        const operatorEl = document.getElementById("receipt-operator");
        const stationDistrictEl = document.getElementById("receipt-station-district");

        if (refEl) refEl.innerText = ref;
        if (playerEl) playerEl.innerText = "@" + player;
        if (descEl) descEl.innerText = desc;
        if (amtEl) amtEl.innerText = `৳${amount.toFixed(2)}`;
        if (dateEl) dateEl.innerText = date;
        if (operatorEl) operatorEl.innerText = "@" + appInstance.currentUser.username;
        if (stationDistrictEl) stationDistrictEl.innerText = `${(appInstance.currentUser.district || "Dhaka").toUpperCase()} FIELD DISTRICT`;

        if (badgeEl) {
          if (type === "load") {
            badgeEl.innerText = "CASH LOAD APPROVED";
            badgeEl.className = "inline-block px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 font-black text-[9px] uppercase tracking-wider rounded";
          } else {
            badgeEl.innerText = "CASHOUT SUCCESSFUL";
            badgeEl.className = "inline-block px-2 py-0.5 bg-rose-955 border border-rose-900 text-rose-450 font-black text-[9px] uppercase tracking-wider rounded";
          }
        }

        const modal = document.getElementById("agent-receipt-modal");
        if (modal) {
          modal.classList.remove("hidden");
        }
      });
    });
  }
}
