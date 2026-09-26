    <div id="screen-agent" class="hidden min-h-screen bg-slate-950 text-slate-100 p-4 pb-24 relative overflow-y-auto">
      <!-- Decorative Backdrop lights effects -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Agent Top bar navigation -->
      <header class="flex justify-between items-center border-b border-slate-800 pb-4 mb-5">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 id="agent-suite-title" class="text-xs font-black tracking-wider text-emerald-400 font-mono">FIELD AGENT SUITE v2.4</h2>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="text-[10px] text-slate-400 font-mono">Active Operator: <strong class="text-white font-sans text-xs bg-slate-900 border border-slate-800 py-1 px-2.5 rounded-lg text-emerald-400" id="agent-display-name">@agent</strong></span>
          <button id="agent-logout-btn" class="bg-slate-900 hover:bg-slate-850 hover:text-red-400 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] text-slate-300 font-bold transition cursor-pointer">
            Exit Suite
          </button>
        </div>
      </header>

      <!-- Advanced Agent Sub-Navigation Tabs Grid -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 border-b border-slate-800/40 scrollbar-none scroll-smooth shrink-0 select-none">
        <button id="agent-btn-overview" class="agent-tab-selector-btn text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-2 cursor-pointer transition whitespace-nowrap bg-emerald-600 text-white shadow-lg shadow-emerald-600/15" val="overview">
          <i class="fa-solid fa-chart-line"></i> Dashboard Overview
        </button>
        <button id="agent-btn-booker" class="agent-tab-selector-btn text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-2 cursor-pointer transition whitespace-nowrap bg-slate-900 border border-slate-800 text-slate-400 hover:text-white" val="booker">
          <i class="fa-solid fa-ticket"></i> Ticket Booker
        </button>
        <button id="agent-btn-cash" class="agent-tab-selector-btn text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-2 cursor-pointer transition whitespace-nowrap bg-slate-900 border border-slate-800 text-slate-400 hover:text-white" val="cash">
          <i class="fa-solid fa-money-bill-transfer"></i> Cash Terminal
        </button>
        <button id="agent-btn-players" class="agent-tab-selector-btn text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-2 cursor-pointer transition whitespace-nowrap bg-slate-900 border border-slate-800 text-slate-400 hover:text-white" val="players">
          <i class="fa-solid fa-users"></i> Field Players
        </button>
        <button id="agent-btn-subagents" class="agent-tab-selector-btn text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-2 cursor-pointer transition whitespace-nowrap bg-slate-900 border border-slate-800 text-slate-400 hover:text-white" val="subagents">
          <i class="fa-solid fa-sitemap text-indigo-400"></i> Manage Sub-Agents
        </button>
        <button id="agent-btn-ledger" class="agent-tab-selector-btn text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-2 cursor-pointer transition whitespace-nowrap bg-slate-900 border border-slate-800 text-slate-400 hover:text-white" val="ledger">
          <i class="fa-solid fa-file-invoice-dollar"></i> History Logs
        </button>
      </div>

      <!-- ================= AGENT SUB-TAB: OVERVIEW ================= -->
      <div id="agent-tab-overview" class="space-y-6">
        <!-- Dashboard Metrics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 relative overflow-hidden shadow-lg group">
            <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-600/10 to-transparent rounded-full blur-xl transition duration-500 group-hover:scale-125"></div>
            <span class="text-[9px] text-slate-500 font-bold uppercase font-mono block tracking-wider">Agent Wallet Limit</span>
            <div class="flex items-baseline gap-1 mt-2">
              <span id="agent-overview-wallet-balance" class="text-lg sm:text-xl font-black text-white font-mono tracking-tight">৳0.00</span>
            </div>
            <p class="text-[9.5px] text-slate-500 font-mono mt-1 leading-tight border-t border-slate-800/60 pt-2 flex justify-between">
              <span>Refill Limit:</span>
              <span class="text-slate-350">Infinite refilled</span>
            </p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 relative overflow-hidden shadow-lg group">
            <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-xl transition duration-500 group-hover:scale-125"></div>
            <span class="text-[9px] text-slate-500 font-bold uppercase font-mono block tracking-wider">Total Earned Commissions</span>
            <div class="flex items-baseline gap-1 mt-2">
              <span id="agent-overview-commission-earned" class="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight">৳0.00</span>
            </div>
            <p class="text-[9.5px] text-emerald-500/70 font-mono mt-1 leading-tight border-t border-slate-800/60 pt-2 flex justify-between">
              <span>Commission Rate:</span>
              <span id="agent-overview-commission-rate" class="text-emerald-400 font-bold">5.0%</span>
            </p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 relative overflow-hidden shadow-lg group">
            <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-xl transition duration-500 group-hover:scale-125"></div>
            <span class="text-[9px] text-slate-500 font-bold uppercase font-mono block tracking-wider">Direct Ticket Service</span>
            <div class="flex items-baseline gap-1 mt-2">
              <span id="agent-overview-total-bookings" class="text-lg sm:text-xl font-black text-white font-mono tracking-tight">0</span>
              <span class="text-[10px] text-slate-400">Pcs Sold</span>
            </div>
            <p class="text-[9.5px] text-slate-500 font-mono mt-1 leading-tight border-t border-slate-800/60 pt-2 flex justify-between">
              <span>Agent Status:</span>
              <span class="text-emerald-400 uppercase font-black tracking-widest text-[8px] flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>ACTIVE</span>
            </p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 relative overflow-hidden shadow-lg group">
            <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/10 to-transparent rounded-full blur-xl transition duration-500 group-hover:scale-125"></div>
            <span class="text-[9px] text-slate-500 font-bold uppercase font-mono block tracking-wider">Commission Target Score</span>
            <div class="flex items-baseline gap-1 mt-2">
              <span id="agent-overview-target-progress" class="text-lg sm:text-xl font-black text-amber-400 font-mono tracking-tight">32%</span>
            </div>
            <p class="text-[9.5px] text-slate-500 font-mono mt-1 leading-tight border-t border-slate-800/60 pt-2 flex justify-between">
              <span>Unlock Streak Tier:</span>
              <span class="text-amber-400 font-black">Level 1</span>
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Left/Mid: Live Business Charts & Performance visualizer -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 md:col-span-2 relative overflow-hidden">
            <div class="flex justify-between items-center">
              <div>
                <h4 class="text-sm font-black text-white flex items-center gap-1.5">
                  <i class="fa-solid fa-chart-line text-emerald-400"></i> Local Service Performance Metric
                </h4>
                <p class="text-xs text-slate-500">Hourly business distribution chart for field load deposits & tickets sales.</p>
              </div>
              <span class="text-[9px] bg-slate-950 text-slate-400 border border-slate-850 py-1 px-2.5 rounded-full font-mono">Live Session Data</span>
            </div>

            <!-- Beautiful Mock Interactive SVG Chart -->
            <div class="bg-slate-950 rounded-2xl p-4 h-52 flex flex-col justify-between relative border border-slate-850/50">
              <div class="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-950/5 pointer-events-none rounded-2xl"></div>
              
              <!-- Grid Background Lines -->
              <div class="absolute inset-x-0 top-1/4 border-b border-slate-900/40"></div>
              <div class="absolute inset-x-0 top-2/4 border-b border-slate-900/40"></div>
              <div class="absolute inset-x-0 top-3/4 border-b border-slate-900/40"></div>

              <!-- Live Chart Plotting Area via Custom Responsive Paths -->
              <svg class="w-full h-36 mt-4 select-none" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"></stop>
                    <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"></stop>
                  </linearGradient>
                </defs>
                <!-- Area Path -->
                <path d="M 0,110 C 50,90 80,45 120,60 C 180,80 220,10 260,35 C 310,70 350,15 400,20 C 450,25 480,95 500,90 L 500,120 L 0,120 Z" fill="url(#chart-grad)" />
                <!-- Stroke Path -->
                <path d="M 0,110 C 50,90 80,45 120,60 C 180,80 220,10 260,35 C 310,70 350,15 400,20 C 450,25 480,95 500,90" fill="none" stroke="#10b981" stroke-width="2.5" />
                <!-- Grid Interactive Dot elements with soft pulsing circles -->
                <circle cx="120" cy="60" r="4" fill="#059669" />
                <circle cx="220" cy="10" r="5" fill="#34d399" class="animate-ping" style="transform-origin: 220px 10px;" />
                <circle cx="220" cy="10" r="4" fill="#10b981" />
                <circle cx="400" cy="20" r="4" fill="#059669" />
              </svg>

              <!-- Chart X Axis Labels -->
              <div class="flex justify-between text-[9px] text-slate-500 font-mono mt-1 border-t border-slate-900 pt-2">
                <span>08:00 AM</span>
                <span>12:00 PM</span>
                <span>04:00 PM</span>
                <span>08:00 PM</span>
                <span>12:00 AM</span>
              </div>
            </div>

            <!-- Quick Agent bulletin notifications banner -->
            <div class="bg-emerald-950/35 border border-emerald-900/30 p-4 rounded-3xl flex gap-3.5 items-start">
              <span class="bg-emerald-900/50 text-emerald-400 p-2.5 rounded-2xl flex items-center justify-center shrink-0"><i class="fa-solid fa-bullhorn text-xs"></i></span>
              <div class="space-y-1">
                <span class="text-xs text-white font-black leading-tight block">Important Agent Notice !</span>
                <p class="text-[11px] text-emerald-400/80 leading-relaxed font-sans">You earn an additional <strong class="text-emerald-300">+1.5% Bonus point commission</strong> for completing ticket sales on behalf of new users register during the current weekend pool draw event!</p>
              </div>
            </div>
          </div>

          <!-- Right: Daily Targets & Fast-action Widgets -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            <h4 class="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <i class="fa-solid fa-bullseye text-amber-500"></i> Commissions Tier Goals
            </h4>
            <p class="text-[11px] text-slate-500 leading-normal">Reach sales milestone targets to trigger massive system bonus credits.</p>

            <!-- Dynamic Monthly Sales Target Block -->
            <div id="agent-monthly-target-container" class="space-y-4 pt-2">
              <div class="flex items-center gap-1.5 justify-between">
                <span class="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider font-sans">Active Monthly Mission</span>
                <span id="agent-monthly-status-badge" class="px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase bg-slate-950/60 border border-slate-800 text-slate-400">Loading...</span>
              </div>
              
              <div class="bg-slate-950/80 border border-slate-850 p-3.5 rounded-2xl space-y-3">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-300 font-bold font-sans">Ticket Sales Goal</span>
                  <span class="font-mono text-cyan-400 font-bold" id="agent-monthly-progress-text">0 / 0 Pcs</span>
                </div>
                
                <!-- Progress bar -->
                <div class="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                  <div id="agent-monthly-progress-bar" class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-1000 w-0"></div>
                </div>

                <div class="flex justify-between items-center text-[10.5px]">
                  <span class="text-slate-500 font-sans">Mission Reward:</span>
                  <span class="font-bold text-emerald-450" id="agent-monthly-reward-text">৳0.00 Taka</span>
                </div>

                <!-- Dynamic Target Pool details and Live Remaining countdown -->
                <div class="border-t border-slate-900/60 pt-2 space-y-1.5 text-[10.5px] font-sans">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-500">Target Pool:</span>
                    <span class="text-white font-bold font-mono text-[11px] truncate max-w-[140px]" id="agent-monthly-pool-val">Any Active Pool</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-500">Status Countdown:</span>
                    <span class="text-cyan-400 font-bold font-mono text-[11px]" id="agent-monthly-countdown-val">0 Tickets Left</span>
                  </div>
                </div>
                
                <!-- Claim button (hidden unless complete and not claimed) -->
                <button id="agent-monthly-claim-btn" class="hidden w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-black py-2 rounded-xl text-center text-xs transition active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40">
                  <i class="fa-solid fa-gift mr-1"></i> Claim ৳<span id="agent-monthly-claim-btn-reward">0</span> Reward
                </button>
              </div>
            </div>

            <div class="border-t border-slate-800/80 pt-4 space-y-3">
              <span class="text-[10px] text-slate-500 font-bold uppercase font-mono block">Operator Quick Shortcuts</span>
              <div class="grid grid-cols-2 gap-2">
                <button onclick="document.getElementById('agent-btn-booker').click();" class="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-2xl text-[10px] text-white block text-center font-black cursor-pointer transition">
                  <i class="fa-solid fa-square-plus text-emerald-400 block mb-1 text-sm"></i> Sell Tickets
                </button>
                <button onclick="document.getElementById('agent-btn-cash').click();" class="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-2xl text-[10px] text-white block text-center font-black cursor-pointer transition">
                  <i class="fa-solid fa-money-bill-1-wave text-teal-400 block mb-1 text-sm"></i> Load Cash
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= AGENT SUB-TAB: TICKET BOOKER TERMINAL ================= -->
      <div id="agent-tab-booker" class="hidden space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Purchase Order terminal form -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 md:col-span-2">
            <div class="flex items-center gap-2 border-b border-slate-850 pb-3">
              <span class="p-2 bg-emerald-950 border border-emerald-900/30 rounded-2xl text-emerald-400 text-xs">
                <i class="fa-solid fa-terminal"></i>
              </span>
              <div>
                <h3 class="text-sm font-black text-white">Ticketing Booking System Console</h3>
                <p class="text-xs text-slate-500 font-mono">Deducts purchase fees from user's balance & claims instant commission points.</p>
              </div>
            </div>

            <form id="agent-booking-form" class="space-y-4 pt-2 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-slate-450 uppercase font-bold text-[10px] font-mono tracking-wider">Receiver Player Username</label>
                  <div class="relative">
                    <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold">@</span>
                    <input id="agent-booking-user" type="text" required class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none focus:border-emerald-500 font-mono" placeholder="Input target playerusername" />
                  </div>
                  <p class="text-[9.5px] text-slate-500 font-mono leading-none mt-1">Verify that this account is active in the "Field Players" tab.</p>
                </div>

                <div class="space-y-1.5">
                  <label class="block text-slate-450 uppercase font-bold text-[10px] font-mono tracking-wider">Target Lottery Pool</label>
                  <select id="agent-booking-lottery" class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 text-white font-bold outline-none cursor-pointer focus:border-emerald-500">
                    <!-- Active lotteries populated dynamically -->
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-slate-440 uppercase font-bold text-[10px] font-mono tracking-wider">Ticket Purchase Qty (Pcs)</label>
                  <input id="agent-booking-qty" type="number" min="1" max="100" value="1" required class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-emerald-500 font-mono" />
                </div>

                <div class="space-y-1.5 pr-2">
                  <label class="block text-slate-440 uppercase font-bold text-[10px] font-mono tracking-wider">Pre-booking Auto Generator</label>
                  <div class="flex gap-2">
                    <input id="agent-booking-test-number" type="text" readonly class="flex-1 bg-slate-950 text-emerald-400 font-black border border-slate-850 rounded-xl py-2 px-3 text-center tracking-widest font-mono text-xs cursor-not-allowed" placeholder="------" />
                    <button id="btn-agent-test-spin" type="button" class="bg-slate-950 hover:bg-slate-850 text-slate-350 p-2 border border-slate-800 rounded-xl text-xs transition cursor-pointer flex items-center justify-center shrink-0">
                      <i class="fa-solid fa-rotate"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Live receipt summary frame -->
              <div class="bg-slate-950/80 border border-slate-850/60 rounded-2xl p-4 space-y-2.5 font-mono text-[11px] text-slate-400">
                <div class="flex justify-between">
                  <span>Standard Entry Price:</span>
                  <span id="agent-book-unit-price" class="text-white">৳0.00</span>
                </div>
                <div class="flex justify-between border-b border-slate-900 pb-2">
                  <span>Purchasing Volumes:</span>
                  <span id="agent-book-qty-summary" class="text-white font-bold">1 Pieces</span>
                </div>
                <div class="flex justify-between">
                  <span>Subtotal Cost deducted from Player:</span>
                  <span id="agent-book-total-cost" class="text-slate-200 font-bold text-xs">৳0.00</span>
                </div>
                <div class="flex justify-between text-emerald-400 border-t border-slate-900 pt-2 text-xs">
                  <span class="font-bold">Commission Credit Earned:</span>
                  <span id="agent-book-est-commission" class="font-black">৳0.00</span>
                </div>
              </div>

              <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.01] cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <i class="fa-solid fa-print"></i> Print & Confirm Tickets Booking
              </button>
            </form>
          </div>

          <!-- Active Pool visual widgets container -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            <h4 class="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <i class="fa-solid fa-circle-nodes text-emerald-400"></i> Active Pools List
            </h4>
            <p class="text-[11px] text-slate-500 leading-normal">These active draw pools are accessible for field booking right now.</p>
            
            <div id="agent-active-pools-list" class="space-y-3 pt-2">
              <!-- Dynamically rendered list with instant "fill" button -->
            </div>
          </div>
        </div>
      </div>

      <!-- ================= AGENT SUB-TAB: CASH TERMINAL (LOAD & PAY) ================= -->
      <div id="agent-tab-cash" class="hidden space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Cash Deposit Box -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div class="flex items-center gap-2 border-b border-slate-850 pb-3">
              <span class="p-2 bg-emerald-950/60 border border-emerald-900/30 rounded-2xl text-emerald-400 text-xs">
                <i class="fa-solid fa-circle-down"></i>
              </span>
              <div>
                <h3 class="text-sm font-black text-white">Wallet Deposit Assistance (Cash Load)</h3>
                <p class="text-xs text-slate-500 font-mono">Collect offline cash from target user, instantly credit their wallet.</p>
              </div>
            </div>

            <!-- Pre-defined load presets -->
            <div class="space-y-2">
              <span class="text-[9.5px] text-slate-500 font-bold uppercase font-mono block">Instant Deposit Presets (৳)</span>
              <div class="grid grid-cols-4 gap-2">
                <button type="button" class="preset-load-btn py-2 bg-slate-950 hover:bg-slate-850 text-white font-mono rounded-xl border border-slate-850 transition cursor-pointer text-xs font-bold" val="100">৳100</button>
                <button type="button" class="preset-load-btn py-2 bg-slate-950 hover:bg-slate-850 text-white font-mono rounded-xl border border-slate-850 transition cursor-pointer text-xs font-bold" val="500">৳500</button>
                <button type="button" class="preset-load-btn py-2 bg-slate-950 hover:bg-slate-850 text-white font-mono rounded-xl border border-slate-850 transition cursor-pointer text-xs font-bold" val="1000">৳1K</button>
                <button type="button" class="preset-load-btn py-2 bg-slate-950 hover:bg-slate-850 text-white font-mono rounded-xl border border-slate-850 transition cursor-pointer text-xs font-bold" val="5000">৳5K</button>
              </div>
            </div>

            <form id="agent-cash-deposit-form" class="space-y-4 pt-1 text-xs">
              <div class="space-y-1.5">
                <label class="block text-slate-455 uppercase font-black text-[9px] font-mono tracking-wider">Receiver Player Username</label>
                <div class="relative">
                  <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold">@</span>
                  <input id="agent-cash-dep-username" type="text" required class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none focus:border-emerald-500 font-mono" placeholder="Input receiver player" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-slate-455 uppercase font-black text-[9px] font-mono tracking-wider">Deposit Cash Amount (৳ Taka)</label>
                <input id="agent-cash-dep-amount" type="number" min="10" required class="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-3 text-white font-bold outline-none focus:border-emerald-500 font-mono text-base" placeholder="Enter amount to load" />
              </div>

              <div class="p-3.5 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl block text-[10px] text-emerald-450 leading-relaxed font-sans">
                <i class="fa-solid fa-circle-info text-emerald-400 mr-1.5"></i> Money will be directly transferred from your <strong>Agent Account Balance</strong> to this User. Collect the corresponding cash physically from the client before executing as this represents real instantly approved load!
              </div>

              <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl transition duration-150 transform hover:scale-[1.01] cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/60">
                <i class="fa-solid fa-check"></i> Process Wallet Load Immediately
              </button>
            </form>
          </div>

          <!-- Cash Payout (Withdrawal Assist) Box -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div class="flex items-center gap-2 border-b border-slate-850 pb-3">
              <span class="p-2 bg-rose-950/60 border border-rose-900/30 rounded-2xl text-rose-450 text-xs">
                <i class="fa-solid fa-circle-up"></i>
              </span>
              <div>
                <h3 class="text-sm font-black text-white">Off-line Cashout Handler (Withdraw Assist)</h3>
                <p class="text-xs text-slate-500 font-mono">Instantly deduct client's online wallet to pay them physically.</p>
              </div>
            </div>

            <!-- Pre-defined cashout presets -->
            <div class="space-y-2">
              <span class="text-[9.5px] text-slate-500 font-bold uppercase font-mono block">Instant Payout Presets (৳)</span>
              <div class="grid grid-cols-4 gap-2">
                <button type="button" class="preset-wdr-btn py-2 bg-slate-950 hover:bg-slate-850 text-white font-mono rounded-xl border border-slate-850 transition cursor-pointer text-xs font-bold" val="100">৳100</button>
                <button type="button" class="preset-wdr-btn py-2 bg-slate-950 hover:bg-slate-850 text-white font-mono rounded-xl border border-slate-850 transition cursor-pointer text-xs font-bold" val="500">৳500</button>
                <button type="button" class="preset-wdr-btn py-2 bg-slate-950 hover:bg-slate-850 text-white font-mono rounded-xl border border-slate-850 transition cursor-pointer text-xs font-bold" val="1000">৳1K</button>
                <button type="button" class="preset-wdr-btn py-2 bg-slate-950 hover:bg-slate-850 text-white font-mono rounded-xl border border-slate-850 transition cursor-pointer text-xs font-bold" val="3000">৳3K</button>
              </div>
            </div>

            <form id="agent-cash-withdraw-form" class="space-y-4 pt-1 text-xs">
              <div class="space-y-1.5">
                <label class="block text-slate-455 uppercase font-black text-[9px] font-mono tracking-wider">Receiver Player Username</label>
                <div class="relative">
                  <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold">@</span>
                  <input id="agent-cash-wdr-username" type="text" required class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none focus:border-rose-500 font-mono" placeholder="Input target player" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-slate-455 uppercase font-black text-[9px] font-mono tracking-wider">Cashout Amount (৳ Taka)</label>
                <input id="agent-cash-wdr-amount" type="number" min="10" required class="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-3 text-white font-bold outline-none focus:border-rose-500 font-mono text-base" placeholder="Enter amount to pay" />
              </div>

              <div class="space-y-1.5" id="agent-cashout-otp-row">
                <label class="block text-slate-455 uppercase font-black text-[9px] font-mono tracking-wider text-rose-450">Player Cashout OTP (6-Digits)</label>
                <input id="agent-cash-wdr-otp" type="text" maxlength="6" required class="w-full bg-slate-950 border border-rose-900/40 rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-rose-500 font-mono text-center tracking-widest text-base" placeholder="000000" />
              </div>

              <div class="p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-2xl block text-[10px] text-rose-450 leading-relaxed font-sans">
                <i class="fa-solid fa-triangle-exclamation text-amber-500 mr-1.5"></i> This action IMMEDIATELY deducts online Taka from the user's online wallet. <strong>Only proceed if you are physically handing over cash to the player at your station.</strong>
              </div>

              <button type="submit" class="w-full bg-gradient-to-r from-rose-950 to-red-650 hover:from-rose-900 hover:to-red-600 text-white font-black py-3 rounded-xl transition duration-150 transform hover:scale-[1.01] cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-rose-955/20 border border-red-900/40">
                <i class="fa-solid fa-cash-register"></i> Deduct Wallet & Complete Cashout
              </button>
            </form>
          </div>

        </div>

        <!-- AGENT CASH TERMINAL EXTENSIONS CONTAINER -->
        <div id="agent-cash-extensions-container">
          <!-- Populated dynamically via agent_cash_extensions.js -->
        </div>
      </div>

      <!-- ================= AGENT SUB-TAB: FIELD PLAYERS REGISTRY ================= -->
      <div id="agent-tab-players" class="hidden space-y-6">
        
        <!-- Agent-Led Player Quick Registration -->
        <div class="bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-slate-800 p-5 rounded-[24px] space-y-4 shadow-lg">
          <div class="flex items-center gap-2 border-b border-slate-850 pb-2">
            <i class="fa-solid fa-user-plus text-indigo-400"></i>
            <div>
              <h3 class="text-xs font-black uppercase text-white font-display">Agent-Assisted Player Registration</h3>
              <p class="text-[9px] text-slate-400 font-sans">Open a verified player account instantly. They will be referred under you and your referral bonus will be auto-credited!</p>
            </div>
          </div>

          <form id="agent-player-quick-register-form" class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[10px] font-mono">
            <div class="space-y-1">
              <label class="block text-slate-500 uppercase">Username</label>
              <input id="agent-reg-username" type="text" required class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-500" placeholder="e.g. player123" />
            </div>
            <div class="space-y-1">
              <label class="block text-slate-500 uppercase">Email</label>
              <input id="agent-reg-email" type="email" required class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-500" placeholder="e.g. player@gmail.com" />
            </div>
            <div class="space-y-1">
              <label class="block text-slate-500 uppercase">Phone Number</label>
              <input id="agent-reg-phone" type="text" required class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-500" placeholder="e.g. 01700000000" />
            </div>
            <div class="space-y-1">
              <label class="block text-slate-500 uppercase">Password</label>
              <div class="relative">
                <input id="agent-reg-password" type="text" required class="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3 text-white outline-none focus:border-indigo-500" placeholder="e.g. 123456" />
                <button type="submit" class="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 rounded-lg transition text-[9px] uppercase cursor-pointer">
                  Create
                </button>
              </div>
            </div>
          </form>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-850 pb-3">
            <div>
              <h3 class="text-sm font-black text-white flex items-center gap-1.5">
                <i class="fa-solid fa-users text-emerald-400"></i> Field Player Registry & Verification
              </h3>
              <p class="text-xs text-slate-500">Comprehensive database of registered players. View direct metrics, search details, or load-out wallets instantly.</p>
            </div>
            
            <!-- Beautiful Real-time Search Box -->
            <div class="relative w-full sm:w-72">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><i class="fa-solid fa-magnifying-glass text-xs"></i></span>
              <input id="agent-players-search-input" type="text" class="w-full bg-slate-950 text-xs py-2 pl-9 pr-4 rounded-xl border border-slate-800 focus:border-emerald-500 text-white outline-none font-mono" placeholder="Search by Username, Email, Phone..." />
            </div>
          </div>

          <!-- Registry Table Frame -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-500 uppercase select-none">
                  <th class="p-3">Player Account</th>
                  <th class="p-3">Contact Nodes</th>
                  <th class="p-3">Wallet Funds</th>
                  <th class="p-3">Verification Details</th>
                  <th class="p-3 text-right">Instant Assist Terminal Actions</th>
                </tr>
              </thead>
              <tbody id="agent-players-tbody" class="divide-y divide-slate-800/45 text-slate-300">
                <!-- Dynamically populated in main.js -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= AGENT SUB-TAB: MANAGE SUB-AGENTS ================= -->
      <div id="agent-tab-subagents" class="hidden space-y-6">
        <div id="agent-subagents-list-view" class="space-y-6">
          <!-- Sub-Agent Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 relative overflow-hidden shadow-lg group">
            <span class="text-[9px] text-slate-500 font-bold uppercase font-mono block tracking-wider font-sans">Sub-Agent Network</span>
            <div class="flex items-baseline gap-1 mt-2">
              <span id="agent-substats-count" class="text-lg sm:text-xl font-black text-white font-mono tracking-tight">0 Operators</span>
            </div>
            <p class="text-[9.5px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-800/60 leading-tight">Appointed sub-agents under you</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 relative overflow-hidden shadow-lg group">
            <span class="text-[9px] text-slate-500 font-bold uppercase font-mono block tracking-wider font-sans">Sub-Agent Sales Volume</span>
            <div class="flex items-baseline gap-1 mt-2">
              <span id="agent-substats-volume" class="text-lg sm:text-xl font-black text-cyan-400 font-mono tracking-tight">৳0.00</span>
            </div>
            <p class="text-[9.5px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-800/60 leading-tight font-sans">Total tickets booked by sub-network</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 relative overflow-hidden shadow-lg group">
            <span class="text-[9px] text-slate-500 font-bold uppercase font-mono block tracking-wider font-sans">Sub-Agent Earnings</span>
            <div class="flex items-baseline gap-1 mt-2">
              <span id="agent-substats-earnings" class="text-lg sm:text-xl font-black text-amber-400 font-mono tracking-tight">৳0.00</span>
            </div>
            <p class="text-[9.5px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-800/60 leading-tight font-sans">Paid directly to sub-agents</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 relative overflow-hidden shadow-lg group">
            <span class="text-[9px] text-slate-500 font-bold uppercase font-mono block tracking-wider font-sans">Your Override Commission</span>
            <div class="flex items-baseline gap-1 mt-2">
              <span id="agent-substats-override" class="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight">৳0.00</span>
            </div>
            <p class="text-[9.5px] text-emerald-500/70 font-mono mt-1 pt-2 border-t border-slate-800/60 leading-tight font-sans font-bold">Your override (keep-the-difference)</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Create / Appoint Sub-Agents forms -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Form 1: Appoint / Promote Existing referred player -->
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div>
                <h4 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <i class="fa-solid fa-user-plus text-indigo-400 font-sans"></i> Promote L1 Player
                </h4>
                <p class="text-[10px] text-slate-500 mt-1 font-sans">Designate one of your referred Level 1 players as an official Sub-Agent.</p>
              </div>

              <form id="agent-promote-subagent-form" class="space-y-3 font-mono text-[10px]">
                <div class="space-y-1">
                  <label class="text-slate-400 block font-bold">Select Player</label>
                  <select id="agent-promote-select-player" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-500 font-sans">
                    <!-- Loaded dynamically with direct referred players -->
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="text-slate-400 block font-bold">Assign Commission Rate (%)</label>
                  <input id="agent-promote-comm-rate" type="number" step="0.1" min="0.5" max="5.0" placeholder="e.g. 3.0" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-500" />
                  <span class="text-[8px] text-slate-500 block font-sans">Must be less than your rate (<span class="agent-my-comm-rate-lbl">5.0</span>%). You keep the difference!</span>
                </div>

                <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 font-sans text-xs">
                  <i class="fa-solid fa-award"></i> Promote to Sub-Agent
                </button>
              </form>
            </div>

            <!-- Form 2: Direct Register Sub-Agent -->
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div>
                <h4 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <i class="fa-solid fa-sitemap text-emerald-400"></i> Recruit New Sub-Agent
                </h4>
                <p class="text-[10px] text-slate-500 mt-1 font-sans">Instantly register and onboard a new Sub-Agent directly into your downline structure.</p>
              </div>

              <form id="agent-register-subagent-form" class="space-y-3 font-mono text-[10px]">
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="text-slate-400 block font-bold">Username</label>
                    <input id="agent-sub-username" type="text" placeholder="username" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-emerald-500" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-slate-400 block font-bold">Password</label>
                    <input id="agent-sub-password" type="password" placeholder="••••••••" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="text-slate-400 block font-bold">Mobile Phone</label>
                    <input id="agent-sub-phone" type="text" placeholder="017xxxxxxxx" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-emerald-500" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-slate-400 block font-bold">Email Address</label>
                    <input id="agent-sub-email" type="email" placeholder="agent@mail.com" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-slate-400 block font-bold font-sans">Commission Share Rate (%)</label>
                  <input id="agent-sub-comm-rate" type="number" step="0.1" min="0.5" max="5.0" placeholder="e.g. 3.0" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-emerald-500" />
                  <span class="text-[8px] text-slate-500 block font-sans">Assigned rate. You keep the remainder from your <span class="agent-my-comm-rate-lbl">5.0</span>% total rate.</span>
                </div>

                <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 font-sans text-xs">
                  <i class="fa-solid fa-user-plus"></i> Onboard Sub-Agent
                </button>
              </form>
            </div>
          </div>

          <!-- Sub-Agent Directory Table -->
          <div class="lg:col-span-2 space-y-4">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h4 class="text-sm font-black text-white flex items-center gap-1.5 font-sans">
                    <i class="fa-solid fa-sitemap text-indigo-400"></i> Appointed Sub-Agents Registry
                  </h4>
                  <p class="text-xs text-slate-500 font-sans">Live directory tracking performance, commission rates, and override income splits.</p>
                </div>
              </div>

              <!-- Filter & Search Controls -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <i class="fa-solid fa-magnifying-glass text-[10px]"></i>
                  </span>
                  <input id="agent-subagents-search" type="text" placeholder="Search by username, phone, email..." class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-[10px] text-white outline-none focus:border-indigo-500 placeholder-slate-500" />
                </div>
                <div>
                  <select id="agent-subagents-filter-status" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-[10px] text-white outline-none focus:border-indigo-500">
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
                <div>
                  <select id="agent-subagents-sort" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-[10px] text-white outline-none focus:border-indigo-500">
                    <option value="name_asc">Sort by Username (A-Z)</option>
                    <option value="name_desc">Sort by Username (Z-A)</option>
                    <option value="volume_desc">Sort by Ticket Volume (High-Low)</option>
                    <option value="earnings_desc">Sort by Sub Earnings (High-Low)</option>
                    <option value="override_desc">Sort by Your Override (High-Low)</option>
                    <option value="rate_desc">Sort by Assigned Rate (High-Low)</option>
                  </select>
                </div>
              </div>

              <div class="overflow-x-auto select-none">
                <table class="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr class="border-b border-slate-800 text-[10px] text-slate-400 uppercase select-none font-bold">
                      <th class="p-3">Sub-Agent Operator</th>
                      <th class="p-3">Assigned Rate</th>
                      <th class="p-3">Tickets Volume</th>
                      <th class="p-3">Sub Gained</th>
                      <th class="p-3">Your Override</th>
                      <th class="p-3 text-right">Operations & Control</th>
                    </tr>
                  </thead>
                  <tbody id="agent-subagents-tbody" class="divide-y divide-slate-800/40 text-slate-300">
                    <!-- Dynamically populated in agent.js -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        </div> <!-- End of agent-subagents-list-view -->

        <!-- ================= AGENT SUB-TAB: SUB-AGENTS DETAILS ================= -->
        <div id="agent-subagents-detail-view" class="hidden space-y-6">
          <!-- Back Header -->
          <div class="flex items-center gap-3">
            <button id="agent-subagents-detail-back-btn" class="bg-slate-900 hover:bg-slate-850 text-slate-300 font-black py-2 px-4 rounded-xl border border-slate-850 text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer">
              <i class="fa-solid fa-arrow-left"></i> Back to Sub-Agents List
            </button>
            <span class="text-slate-600 font-mono text-xs">/ System Operations / Sub-Agent Performance Details</span>
          </div>

          <!-- Profile Card & Stats -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- General profile info -->
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-950/40">
                  <span id="detail-sub-avatar-initial">S</span>
                </div>
                <div>
                  <h4 class="text-base font-black text-white" id="detail-sub-username">@username</h4>
                  <span class="bg-indigo-950 text-indigo-400 border border-indigo-900/40 rounded px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold">Sub-Agent</span>
                </div>
              </div>

              <div class="border-t border-slate-800/80 pt-4 space-y-3.5 font-mono text-xs">
                <div class="flex justify-between">
                  <span class="text-slate-550">Email:</span>
                  <span class="text-slate-300 select-all font-sans" id="detail-sub-email">sub@mail.com</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-550">Phone:</span>
                  <span class="text-slate-300 select-all" id="detail-sub-phone">01700000000</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-550">Account Status:</span>
                  <span class="font-bold uppercase text-emerald-400" id="detail-sub-status-lbl">ACTIVE</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-550">Commission Rate:</span>
                  <span class="text-indigo-400 font-black animate-pulse" id="detail-sub-rate-lbl">3.0%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-550">Your Override Rate:</span>
                  <span class="text-emerald-400 font-black" id="detail-sub-override-rate-lbl">2.0%</span>
                </div>
              </div>
            </div>

            <!-- Performance & Goals -->
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 lg:col-span-2">
              <h4 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <i class="fa-solid fa-bullseye text-indigo-400"></i> Monthly Performance Target Quota
              </h4>
              
              <div class="bg-slate-950/60 p-5 border border-slate-850 rounded-2xl space-y-4">
                <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <span class="text-[10px] text-slate-500 font-bold uppercase block font-sans">Current Quota Progress</span>
                    <div class="flex items-baseline gap-1 mt-0.5">
                      <span class="text-xl font-black text-white font-mono" id="detail-sub-progress-lbl">0</span>
                      <span class="text-xs text-slate-500 font-mono">/ <span id="detail-sub-target-lbl">0</span> Tickets</span>
                    </div>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-500 font-bold uppercase block text-right sm:text-right font-sans">Target Completion Reward</span>
                    <span class="text-base font-black text-emerald-450 block text-right mt-0.5" id="detail-sub-reward-lbl">৳0.00</span>
                  </div>
                </div>

                <!-- Progress bar -->
                <div class="space-y-1.5">
                  <div class="flex justify-between text-[10px] font-mono">
                    <span class="text-slate-550">Overall Sales completion rate</span>
                    <span class="text-cyan-400 font-bold" id="detail-sub-pct-lbl">0%</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                    <div id="detail-sub-progress-bar" class="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style="width: 0%"></div>
                  </div>
                </div>
              </div>

              <!-- Dynamic statistics metrics -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div class="bg-slate-950/40 p-3 border border-slate-850 rounded-xl text-center">
                  <span class="text-[9px] text-slate-500 block uppercase font-sans">Total Players</span>
                  <strong class="text-white font-bold block mt-1 text-xs" id="detail-sub-players-count">0</strong>
                </div>
                <div class="bg-slate-950/40 p-3 border border-slate-850 rounded-xl text-center">
                  <span class="text-[9px] text-slate-500 block uppercase font-sans">Sales Volume</span>
                  <strong class="text-cyan-450 font-bold block mt-1 text-xs" id="detail-sub-sales-volume">৳0.00</strong>
                </div>
                <div class="bg-slate-950/40 p-3 border border-slate-850 rounded-xl text-center">
                  <span class="text-[9px] text-slate-500 block uppercase font-sans">Sub Earnings</span>
                  <strong class="text-amber-450 font-bold block mt-1 text-xs" id="detail-sub-earnings">৳0.00</strong>
                </div>
                <div class="bg-slate-950/40 p-3 border border-slate-850 rounded-xl text-center">
                  <span class="text-[9px] text-emerald-500 block uppercase font-sans font-bold">Your Override</span>
                  <strong class="text-emerald-450 font-bold block mt-1 text-xs" id="detail-sub-override">৳0.00</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Sub-Agent's Direct Players Directory -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h4 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <i class="fa-solid fa-users text-cyan-400"></i> Downline Players Registered Under Sub-Agent
              </h4>
              <p class="text-[10px] text-slate-500 font-sans">List of active field players belonging to this operator's micro-franchise network.</p>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr class="border-b border-slate-800 text-[10px] text-slate-400 uppercase select-none font-bold">
                    <th class="p-3">Player Account</th>
                    <th class="p-3">Current Balance</th>
                    <th class="p-3">Total Deposit</th>
                    <th class="p-3">Total Withdraw</th>
                    <th class="p-3">Wins / Losses</th>
                    <th class="p-3">Join Date</th>
                  </tr>
                </thead>
                <tbody id="detail-sub-players-tbody" class="divide-y divide-slate-800/40 text-slate-300 font-mono">
                  <!-- Loaded dynamically -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= AGENT SUB-TAB: LOGS & LEDGER ================= -->
      <div id="agent-tab-ledger" class="hidden space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h4 class="text-sm font-black text-white flex items-center gap-1.5">
                <i class="fa-solid fa-list-check text-emerald-400"></i> Session Activity & Booking Ledger
              </h4>
              <p class="text-xs text-slate-500">Live sequential journal tracking all deposits, payouts, and ticket sales issued during your active session.</p>
            </div>

            <!-- Export session activity -->
            <button id="btn-agent-copy-ledger" class="bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 py-2 px-4 rounded-xl text-[10px] uppercase font-black text-slate-400 font-mono tracking-wider transition cursor-pointer shrink-0 flex items-center gap-1.5">
              <i class="fa-solid fa-copy"></i> Export Copy Session Logs
            </button>
          </div>

          <div class="overflow-x-auto select-text font-mono">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase select-none">
                  <th class="p-3">Timestamp / Date</th>
                  <th class="p-3">Target User</th>
                  <th class="p-3">Operation Description</th>
                  <th class="p-3">Taka Value (৳)</th>
                  <th class="p-3 text-right">Commission Gained (৳)</th>
                </tr>
              </thead>
              <tbody id="agent-activity-tbody" class="divide-y divide-slate-800/40 text-slate-300 font-mono">
                <!-- Dynamically populated in main.js -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
