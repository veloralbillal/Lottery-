    <div id="screen-agent" class="hidden min-h-screen bg-slate-950 text-slate-100 flex relative overflow-x-hidden font-sans">
      <!-- Decorative Backdrop lights effects -->
      <div class="fixed top-0 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div class="fixed bottom-0 left-0 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <!-- Mobile Drawer Backdrop -->
      <div id="agent-sidebar-backdrop" class="hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity"></div>

      <!-- ================= AGENT COLLAPSIBLE SIDEBAR & MOBILE DRAWER ================= -->
      <aside id="agent-sidebar" class="fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900/95 border-r border-slate-800/90 flex flex-col justify-between transition-all duration-200 -translate-x-full lg:translate-x-0 shrink-0 select-none backdrop-blur-xl">
        <!-- Sidebar Top Brand & Collapse Toggle -->
        <div class="p-3.5 border-b border-slate-800/80 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black shadow-md shrink-0">
                <i class="fa-solid fa-user-shield text-sm"></i>
              </div>
              <div class="agent-sidebar-text min-w-0">
                <h2 id="agent-suite-title" class="text-xs font-black tracking-wider text-emerald-400 font-mono truncate">FIELD AGENT SUITE</h2>
                <p class="text-[9.5px] text-slate-400 font-mono truncate" id="agent-sidebar-district">Authorized Counter</p>
              </div>
            </div>
            <!-- Desktop Collapse Button -->
            <button type="button" id="agent-sidebar-collapse-btn" class="hidden lg:flex w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white items-center justify-center cursor-pointer transition shrink-0" title="Collapse/Expand Sidebar">
              <i id="agent-sidebar-collapse-icon" class="fa-solid fa-angles-left text-[10px]"></i>
            </button>
            <!-- Mobile Close Drawer Button -->
            <button type="button" id="agent-sidebar-close-btn" class="lg:hidden w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition shrink-0">
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>

          <!-- Logged-in Agent Profile Summary Box -->
          <div class="agent-sidebar-text bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-xs font-black text-white truncate" id="agent-sidebar-fullname">Agent Operator</div>
                <div class="text-[10px] font-mono text-emerald-400 truncate" id="agent-display-name">@agent</div>
              </div>
              <span id="agent-sidebar-status" class="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE
              </span>
            </div>
            <div class="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-800/70">
              <span class="text-slate-400">ID: <strong id="agent-sidebar-id" class="text-slate-200">AGN-01</strong></span>
              <span class="text-emerald-400 font-black" id="agent-sidebar-balance">৳0.00</span>
            </div>
          </div>
        </div>

        <!-- 20-Item Scrollable Navigation Menu -->
        <nav class="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
          <!-- 1. Dashboard -->
          <button type="button" id="agent-btn-overview" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-emerald-600 text-white shadow-lg shadow-emerald-600/15" val="overview" title="Dashboard">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-gauge-high w-4 text-center shrink-0"></i>
              <span class="agent-sidebar-text truncate">1. Dashboard</span>
            </span>
          </button>

          <!-- 2. Live Chat Inbox -->
          <button type="button" id="agent-btn-live-chat" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="live-chat" title="Live Chat Inbox">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-comments w-4 text-center text-cyan-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">2. Live Chat Inbox</span>
            </span>
            <span id="agent-nav-badge-chat" class="hidden px-1.5 py-0.5 text-[9px] font-mono font-black bg-rose-600 text-white rounded-md">0</span>
          </button>

          <!-- 3. My Users -->
          <button type="button" id="agent-btn-players" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="players" title="My Users">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-users w-4 text-center text-emerald-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">3. My Users</span>
            </span>
            <span id="agent-nav-badge-users" class="agent-sidebar-text text-[9.5px] font-mono text-slate-400">0</span>
          </button>

          <!-- 4. Add New User -->
          <button type="button" id="agent-btn-add-user" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="add-user" title="Add New User">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-user-plus w-4 text-center text-indigo-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">4. Add New User</span>
            </span>
          </button>

          <!-- 5. User Registration History -->
          <button type="button" id="agent-btn-reg-history" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="reg-history" title="User Registration History">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-user-clock w-4 text-center text-teal-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">5. Registration History</span>
            </span>
          </button>

          <!-- 6. Commission & Earnings -->
          <button type="button" id="agent-btn-commissions" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="commissions" title="Commission & Earnings">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-sack-dollar w-4 text-center text-amber-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">6. Commission & Earnings</span>
            </span>
          </button>

          <!-- 7. Transaction History -->
          <button type="button" id="agent-btn-transactions" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="transactions" title="Transaction History">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-receipt w-4 text-center text-cyan-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">7. Transaction History</span>
            </span>
          </button>

          <!-- 8. Payment Requests -->
          <button type="button" id="agent-btn-payment-requests" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="payment-requests" title="Payment Requests">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-hand-holding-dollar w-4 text-center text-rose-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">8. Payment Requests</span>
            </span>
            <span id="agent-nav-badge-payments" class="hidden px-1.5 py-0.5 text-[9px] font-mono font-black bg-amber-500 text-slate-950 rounded-md">0</span>
          </button>

          <!-- 9. Wallet & Balance -->
          <button type="button" id="agent-btn-wallet" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="wallet" title="Wallet & Balance">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-wallet w-4 text-center text-emerald-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">9. Wallet & Balance</span>
            </span>
          </button>

          <!-- 10. Referral Performance -->
          <button type="button" id="agent-btn-referrals" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="referrals" title="Referral Performance">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-network-wired w-4 text-center text-purple-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">10. Referral Performance</span>
            </span>
          </button>

          <!-- 11. Notifications -->
          <button type="button" id="agent-btn-notifications" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="notifications" title="Notifications">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-bell w-4 text-center text-amber-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">11. Notifications</span>
            </span>
            <span id="agent-nav-badge-notifications" class="hidden px-1.5 py-0.5 text-[9px] font-mono font-black bg-cyan-500 text-slate-950 rounded-md">0</span>
          </button>

          <!-- 12. Reports & Analytics -->
          <button type="button" id="agent-btn-analytics" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="analytics" title="Reports & Analytics">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-chart-pie w-4 text-center text-blue-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">12. Reports & Analytics</span>
            </span>
          </button>

          <!-- 13. Agent Profile -->
          <button type="button" id="agent-btn-profile" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="profile" title="Agent Profile">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-id-badge w-4 text-center text-teal-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">13. Agent Profile</span>
            </span>
          </button>

          <!-- 14. Security Settings -->
          <button type="button" id="agent-btn-security" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="security" title="Security Settings">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-shield-halved w-4 text-center text-emerald-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">14. Security Settings</span>
            </span>
          </button>

          <!-- 15. Help & Support -->
          <button type="button" id="agent-btn-support" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="support" title="Help & Support">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-headset w-4 text-center text-cyan-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">15. Help & Support</span>
            </span>
          </button>

          <!-- 16. Ticket Booker -->
          <button type="button" id="agent-btn-booker" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="booker" title="Ticket Booker">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-ticket w-4 text-center text-emerald-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">16. Ticket Booker</span>
            </span>
          </button>

          <!-- 17. Cash Terminal -->
          <button type="button" id="agent-btn-cash" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="cash" title="Cash Terminal">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-cash-register w-4 text-center text-teal-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">17. Cash Terminal</span>
            </span>
          </button>

          <!-- 18. Manage Sub-Agent -->
          <button type="button" id="agent-btn-subagents" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="subagents" title="Manage Sub-Agent">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-sitemap w-4 text-center text-indigo-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">18. Manage Sub-Agent</span>
            </span>
          </button>

          <!-- 19. History Logs -->
          <button type="button" id="agent-btn-ledger" class="agent-tab-selector-btn w-full text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white" val="ledger" title="History Logs">
            <span class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-file-invoice-dollar w-4 text-center text-amber-400 shrink-0"></i>
              <span class="agent-sidebar-text truncate">19. History Logs</span>
            </span>
          </button>
        </nav>

        <!-- 20. Logout Footer Button -->
        <div class="p-3 border-t border-slate-800/80">
          <button type="button" id="agent-sidebar-logout-btn" class="w-full bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/50 text-rose-300 hover:text-white py-2.5 px-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition cursor-pointer" title="Logout">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span class="agent-sidebar-text">20. Logout</span>
          </button>
        </div>
      </aside>

      <!-- ================= AGENT MAIN CONTENT WORKSPACE ================= -->
      <div class="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <!-- Sticky Top Header Bar -->
        <header class="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Mobile Hamburger Button -->
            <button type="button" id="agent-mobile-menu-btn" class="lg:hidden w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-center cursor-pointer transition shrink-0" aria-label="Toggle Agent Menu">
              <i class="fa-solid fa-bars text-sm"></i>
            </button>
            <div class="min-w-0">
              <h1 id="agent-active-page-title" class="text-xs sm:text-sm font-black text-white tracking-wide truncate">Agent Dashboard Overview</h1>
              <p class="text-[10px] text-slate-400 font-mono truncate">Real-time Database Synced • <span id="agent-header-balance-inline" class="text-emerald-400 font-bold">Balance: ৳0.00</span></p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Quick Jump to Live Chat -->
            <button type="button" onclick="document.getElementById('agent-btn-live-chat')?.click();" class="relative bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] text-cyan-400 font-mono font-bold flex items-center gap-1.5 cursor-pointer transition">
              <i class="fa-solid fa-comments"></i>
              <span class="hidden sm:inline">Live Chat</span>
              <span id="agent-header-badge-chat" class="hidden px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-black">0</span>
            </button>

            <!-- Quick Jump to Notifications -->
            <button type="button" onclick="document.getElementById('agent-btn-notifications')?.click();" class="relative bg-slate-950 hover:bg-slate-800 border border-slate-800 w-8 h-8 rounded-xl text-amber-400 flex items-center justify-center cursor-pointer transition" title="Notifications">
              <i class="fa-solid fa-bell text-xs"></i>
              <span id="agent-header-badge-notif" class="hidden absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[8px] font-black flex items-center justify-center">0</span>
            </button>

            <button id="agent-logout-btn" class="bg-slate-950 hover:bg-rose-950 hover:text-rose-400 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] text-slate-300 font-bold transition cursor-pointer">
              Exit Suite
            </button>
          </div>
        </header>

        <!-- Main Workspace Body -->
        <main class="flex-1 p-4 sm:p-6 pb-24 space-y-6 max-w-[1440px] w-full mx-auto">

          <!-- ================= 1. AGENT SUB-TAB: DASHBOARD OVERVIEW ================= -->
          <div id="agent-tab-overview" class="space-y-6">
            <!-- Primary Wallet & Commission KPI Row (Preserves existing IDs + Live Stats) -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-lg">
                <span class="text-[9.5px] text-slate-400 font-bold uppercase font-mono block">Available Wallet Balance</span>
                <div class="flex items-baseline gap-1 mt-1.5">
                  <span id="agent-overview-wallet-balance" class="text-lg sm:text-xl font-black text-white font-mono">৳0.00</span>
                </div>
                <div class="text-[9.5px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/60 flex justify-between">
                  <span>Tickets Booked:</span>
                  <strong id="agent-overview-total-bookings" class="text-cyan-400">0</strong>
                </div>
              </div>

              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-lg">
                <span class="text-[9.5px] text-slate-400 font-bold uppercase font-mono block">Total Commission Earned</span>
                <div class="flex items-baseline gap-1 mt-1.5">
                  <span id="agent-overview-commission-earned" class="text-lg sm:text-xl font-black text-emerald-400 font-mono">৳0.00</span>
                </div>
                <div class="text-[9.5px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/60 flex justify-between">
                  <span>Commission Rate:</span>
                  <strong id="agent-overview-commission-rate" class="text-emerald-400">5.0%</strong>
                </div>
              </div>

              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-lg">
                <span class="text-[9.5px] text-slate-400 font-bold uppercase font-mono block">Pending Commission</span>
                <div class="flex items-baseline gap-1 mt-1.5">
                  <span id="agent-dash-pending-commission" class="text-lg sm:text-xl font-black text-amber-400 font-mono">৳0.00</span>
                </div>
                <div class="text-[9.5px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/60 flex justify-between">
                  <span>Target Progress:</span>
                  <strong id="agent-overview-target-progress" class="text-amber-400">0%</strong>
                </div>
              </div>

              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-lg">
                <span class="text-[9.5px] text-slate-400 font-bold uppercase font-mono block">Total Registered Users</span>
                <div class="flex items-baseline gap-2 mt-1.5">
                  <span id="agent-dash-total-users" class="text-lg sm:text-xl font-black text-white font-mono">0</span>
                  <span class="text-[10px] text-emerald-400 font-mono">(<span id="agent-dash-active-users">0</span> Active)</span>
                </div>
                <div class="text-[9.5px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/60 flex justify-between">
                  <span>Today's Signups:</span>
                  <strong id="agent-dash-today-regs" class="text-cyan-400">0</strong>
                </div>
              </div>
            </div>

            <!-- Second Row of Live Operational Cards (8 Required Metrics Complete) -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div onclick="document.getElementById('agent-btn-players')?.click();" class="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 cursor-pointer transition">
                <div class="flex items-center justify-between">
                  <span class="text-[9.5px] text-slate-400 font-mono uppercase font-bold">Active Users</span>
                  <i class="fa-solid fa-user-check text-emerald-400 text-xs"></i>
                </div>
                <div id="agent-dash-active-users-card" class="text-lg font-black text-white font-mono mt-1">0</div>
                <p class="text-[9.5px] text-slate-500 mt-1">Verified players in your network</p>
              </div>

              <div onclick="document.getElementById('agent-btn-payment-requests')?.click();" class="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 cursor-pointer transition">
                <div class="flex items-center justify-between">
                  <span class="text-[9.5px] text-slate-400 font-mono uppercase font-bold">Pending Payment Requests</span>
                  <i class="fa-solid fa-clock-rotate-left text-amber-400 text-xs"></i>
                </div>
                <div id="agent-dash-pending-payments" class="text-lg font-black text-amber-400 font-mono mt-1">0</div>
                <p class="text-[9.5px] text-slate-500 mt-1">Awaiting deposit/cashout action</p>
              </div>

              <div onclick="document.getElementById('agent-btn-live-chat')?.click();" class="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 cursor-pointer transition">
                <div class="flex items-center justify-between">
                  <span class="text-[9.5px] text-slate-400 font-mono uppercase font-bold">Open Support Chats</span>
                  <i class="fa-solid fa-comments text-cyan-400 text-xs"></i>
                </div>
                <div id="agent-dash-open-chats" class="text-lg font-black text-cyan-400 font-mono mt-1">0</div>
                <p class="text-[9.5px] text-slate-500 mt-1">Active user conversations</p>
              </div>

              <div onclick="document.getElementById('agent-btn-live-chat')?.click();" class="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-4 cursor-pointer transition">
                <div class="flex items-center justify-between">
                  <span class="text-[9.5px] text-slate-400 font-mono uppercase font-bold">Unread Chat Messages</span>
                  <i class="fa-solid fa-envelope-open-text text-rose-400 text-xs"></i>
                </div>
                <div id="agent-dash-unread-chats" class="text-lg font-black text-rose-400 font-mono mt-1">0</div>
                <p class="text-[9.5px] text-slate-500 mt-1">Click to open Live Chat Inbox</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Left/Mid: Registration & Commission Trends + Recent Activity -->
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 lg:col-span-2">
                <div class="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 class="text-sm font-black text-white flex items-center gap-1.5">
                      <i class="fa-solid fa-chart-line text-emerald-400"></i> Registration Trends & Commission Report
                    </h4>
                    <p class="text-[11px] text-slate-400">Live database metrics filtered by period (Currency: BDT ৳)</p>
                  </div>
                  <select id="agent-dash-range-select" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[10px] font-mono text-white outline-none focus:border-emerald-500 cursor-pointer">
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>

                <!-- Period Summary Metrics -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div class="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                    <span class="text-[9px] text-slate-500 uppercase block">Registrations</span>
                    <strong id="agent-dash-trend-regs" class="text-white text-sm font-black">0</strong>
                  </div>
                  <div class="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                    <span class="text-[9px] text-slate-500 uppercase block">Cash Load Volume</span>
                    <strong id="agent-dash-trend-loads" class="text-emerald-400 text-sm font-black">৳0.00</strong>
                  </div>
                  <div class="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                    <span class="text-[9px] text-slate-500 uppercase block">Ticket Sales Vol</span>
                    <strong id="agent-dash-trend-tickets" class="text-cyan-400 text-sm font-black">৳0.00</strong>
                  </div>
                  <div class="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                    <span class="text-[9px] text-slate-500 uppercase block">Earned Comm</span>
                    <strong id="agent-dash-trend-comm" class="text-amber-400 text-sm font-black">৳0.00</strong>
                  </div>
                </div>

                <!-- Recent Activity & Recent Transactions Feed -->
                <div class="space-y-2 pt-2">
                  <div class="flex items-center justify-between">
                    <h5 class="text-xs font-black text-white uppercase font-mono">Recent Activity & Transactions</h5>
                    <button type="button" onclick="document.getElementById('agent-btn-transactions')?.click();" class="text-[10px] text-emerald-400 hover:underline font-mono cursor-pointer">View All →</button>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr class="border-b border-slate-800 text-[9.5px] text-slate-500 uppercase">
                          <th class="p-2.5">Date/Time</th>
                          <th class="p-2.5">User</th>
                          <th class="p-2.5">Details</th>
                          <th class="p-2.5">Amount</th>
                          <th class="p-2.5 text-right">Commission</th>
                        </tr>
                      </thead>
                      <tbody id="agent-dash-recent-tbody" class="divide-y divide-slate-800/40 text-slate-300 text-[11px]">
                        <!-- Populated dynamically -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Right: Monthly Sales Target & Quick Shortcuts -->
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                <h4 class="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <i class="fa-solid fa-bullseye text-amber-500"></i> Commissions Tier Goals
                </h4>
                <p class="text-[11px] text-slate-400 leading-normal">Reach sales milestone targets to claim instant system bonus credits.</p>

                <!-- Dynamic Monthly Sales Target Block -->
                <div id="agent-monthly-target-container" class="space-y-4 pt-1">
                  <div class="flex items-center gap-1.5 justify-between">
                    <span class="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider font-sans">Active Monthly Mission</span>
                    <span id="agent-monthly-status-badge" class="text-[9.5px] font-mono font-bold uppercase text-slate-400">Loading...</span>
                  </div>
                  
                  <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-3">
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-slate-300 font-bold font-sans">Ticket Sales Goal</span>
                      <span class="font-mono text-cyan-400 font-bold" id="agent-monthly-progress-text">0 / 0 Pcs</span>
                    </div>
                    
                    <div class="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                      <div id="agent-monthly-progress-bar" class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-1000 w-0"></div>
                    </div>

                    <div class="flex justify-between items-center text-[10.5px]">
                      <span class="text-slate-500 font-sans">Mission Reward:</span>
                      <span class="font-bold text-emerald-400" id="agent-monthly-reward-text">৳0.00 Taka</span>
                    </div>

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
                    
                    <button id="agent-monthly-claim-btn" class="hidden w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-black py-2 rounded-xl text-center text-xs transition active:scale-95 cursor-pointer shadow-md">
                      <i class="fa-solid fa-gift mr-1"></i> Claim ৳<span id="agent-monthly-claim-btn-reward">0</span> Reward
                    </button>
                  </div>
                </div>

                <div class="border-t border-slate-800/80 pt-4 space-y-3">
                  <span class="text-[10px] text-slate-400 font-bold uppercase font-mono block">Operator Quick Shortcuts</span>
                  <div class="grid grid-cols-2 gap-2">
                    <button type="button" onclick="document.getElementById('agent-btn-booker')?.click();" class="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-[10px] text-white block text-center font-black cursor-pointer transition">
                      <i class="fa-solid fa-ticket text-emerald-400 block mb-1 text-sm"></i> Ticket Booker
                    </button>
                    <button type="button" onclick="document.getElementById('agent-btn-cash')?.click();" class="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-[10px] text-white block text-center font-black cursor-pointer transition">
                      <i class="fa-solid fa-cash-register text-teal-400 block mb-1 text-sm"></i> Cash Terminal
                    </button>
                    <button type="button" onclick="document.getElementById('agent-btn-add-user')?.click();" class="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-[10px] text-white block text-center font-black cursor-pointer transition">
                      <i class="fa-solid fa-user-plus text-indigo-400 block mb-1 text-sm"></i> Add New User
                    </button>
                    <button type="button" onclick="document.getElementById('agent-btn-live-chat')?.click();" class="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-[10px] text-white block text-center font-black cursor-pointer transition">
                      <i class="fa-solid fa-comments text-cyan-400 block mb-1 text-sm"></i> Live Chat Inbox
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= 2. AGENT SUB-TAB: LIVE CHAT INBOX ================= -->
          <div id="agent-tab-live-chat" class="hidden space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px]">
              <!-- Left Column: Conversations List & Filters -->
              <div class="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between space-y-3 max-h-[720px]">
                <div class="space-y-3">
                  <div class="flex items-center justify-between gap-2">
                    <div>
                      <h3 class="text-sm font-black text-white flex items-center gap-1.5">
                        <i class="fa-solid fa-inbox text-cyan-400"></i> Live Chat Inbox
                      </h3>
                      <p class="text-[10px] text-slate-400 font-mono">Real-time User-Agent Support Desk</p>
                    </div>
                    <button type="button" id="agent-chat-new-conv-btn" class="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl cursor-pointer transition flex items-center gap-1" title="Start Chat with User">
                      <i class="fa-solid fa-plus"></i> New Chat
                    </button>
                  </div>

                  <!-- Search Conversations -->
                  <div class="relative">
                    <i class="fa-solid fa-magnifying-glass text-[10px] text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
                    <input type="text" id="agent-chat-inbox-search" placeholder="Search user name, ID, message..." class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono" />
                  </div>

                  <!-- Status Filter Tabs: All, Open, Pending, Resolved, Unread -->
                  <div class="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                    <button type="button" class="agent-chat-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-600 text-white cursor-pointer transition" data-filter="all">All</button>
                    <button type="button" class="agent-chat-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-slate-400 hover:text-white cursor-pointer transition" data-filter="open">Open</button>
                    <button type="button" class="agent-chat-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-slate-400 hover:text-white cursor-pointer transition" data-filter="pending">Pending</button>
                    <button type="button" class="agent-chat-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-slate-400 hover:text-white cursor-pointer transition" data-filter="resolved">Resolved</button>
                    <button type="button" class="agent-chat-filter-btn px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-slate-400 hover:text-white cursor-pointer transition" data-filter="unread">Unread</button>
                  </div>
                </div>

                <!-- Threads List -->
                <div id="agent-chat-threads-list" class="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin min-h-[380px]">
                  <!-- Populated dynamically -->
                </div>
              </div>

              <!-- Right Column: Active Conversation View -->
              <div class="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between max-h-[720px] min-h-[540px]">
                <!-- Conversation Header -->
                <div class="border-b border-slate-800 pb-3 space-y-2.5">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                      <div class="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-black text-sm" id="agent-inbox-active-avatar">
                        U
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 id="agent-inbox-active-username" class="text-xs sm:text-sm font-black text-white font-mono">Select a conversation</h4>
                          <span id="agent-inbox-active-userid" class="text-[10px] font-mono text-slate-400"></span>
                        </div>
                        <div id="agent-inbox-active-meta" class="text-[10px] font-mono text-slate-400">
                          Choose a user from the inbox list or click "New Chat"
                        </div>
                      </div>
                    </div>

                    <!-- Thread Controls: Status, Priority, Refresh -->
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <select id="agent-inbox-status-select" class="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-white outline-none focus:border-cyan-500 cursor-pointer" title="Conversation Status">
                        <option value="open">Status: Open</option>
                        <option value="pending">Status: Pending</option>
                        <option value="resolved">Status: Resolved</option>
                      </select>

                      <select id="agent-inbox-priority-select" class="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-white outline-none focus:border-amber-500 cursor-pointer" title="Priority">
                        <option value="normal">Priority: Normal</option>
                        <option value="high">Priority: High</option>
                        <option value="urgent">Priority: Urgent</option>
                      </select>

                      <button type="button" id="agent-inbox-refresh-btn" class="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-xl text-[10px] font-mono cursor-pointer transition" title="Refresh Messages">
                        <i class="fa-solid fa-rotate"></i>
                      </button>
                      <button type="button" id="agent-inbox-fullscreen-btn" class="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold cursor-pointer transition flex items-center gap-1" title="Open WhatsApp Fullscreen View">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp View
                      </button>
                    </div>
                  </div>

                  <!-- Search Within Conversation & Quick User Assist Bar -->
                  <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div class="relative flex-1 min-w-[180px]">
                      <i class="fa-solid fa-magnifying-glass text-[10px] text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2"></i>
                      <input type="text" id="agent-chat-msg-search" placeholder="Search within this conversation..." class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-1 text-[11px] text-white placeholder-slate-500 outline-none focus:border-cyan-500" />
                    </div>
                    <div class="flex items-center gap-1.5">
                      <button type="button" id="agent-inbox-quick-load-btn" class="bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/40 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition">
                        <i class="fa-solid fa-circle-down mr-1"></i>Load Cash
                      </button>
                      <button type="button" id="agent-inbox-quick-wdr-btn" class="bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/40 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition">
                        <i class="fa-solid fa-circle-up mr-1"></i>Cashout
                      </button>
                      <button type="button" id="agent-inbox-quick-book-btn" class="bg-indigo-950/60 hover:bg-indigo-900 text-indigo-400 border border-indigo-800/40 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition">
                        <i class="fa-solid fa-ticket mr-1"></i>Book Ticket
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Messages Stream Container -->
                <div id="agent-inbox-messages-container" class="flex-1 overflow-y-auto my-3 space-y-3 pr-1 scrollbar-thin">
                  <div class="text-center py-16 text-slate-500 text-xs font-mono">
                    <i class="fa-solid fa-comments text-2xl text-slate-700 block mb-2"></i>
                    Select a user conversation from the left panel to view messages and reply.
                  </div>
                </div>

                <!-- Composer & Quick Replies Footer -->
                <div class="space-y-2 border-t border-slate-800 pt-2.5">
                  <!-- Quick Replies Bar -->
                  <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span class="text-[9.5px] font-mono text-slate-500 shrink-0">Quick Reply:</span>
                    <button type="button" class="agent-quick-reply-btn bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer transition" data-reply="আসসালামু আলাইকুম! আমি আপনার ভেরিফাইড এজেন্ট। কিভাবে আপনাকে সাহায্য করতে পারি?">👋 স্বাগতম বার্তা</button>
                    <button type="button" class="agent-quick-reply-btn bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer transition" data-reply="আপনার ওয়ালেটে ক্যাশ লোড সফলভাবে সম্পন্ন হয়েছে। অনুগ্রহ করে ব্যালেন্স চেক করুন।">✅ ক্যাশ লোড সম্পন্ন</button>
                    <button type="button" class="agent-quick-reply-btn bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer transition" data-reply="ক্যাশ-আউট সম্পন্ন করার জন্য আপনার প্রোফাইল থেকে ৬-ডিজিট OTP কোডটি পাঠান।">🔐 OTP কোড দিন</button>
                    <button type="button" class="agent-quick-reply-btn bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer transition" data-reply="আপনার লটারি টিকেট সফলভাবে বুক করা হয়েছে। ড্র এর জন্য শুভকামনা!">🎟️ টিকেট বুকড</button>
                  </div>

                  <!-- Mode Selector: Public Reply vs Staff-Only Internal Note -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5">
                      <button type="button" id="agent-chat-mode-reply" class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-600 text-white cursor-pointer transition">
                        <i class="fa-solid fa-reply mr-1"></i>Public Reply to User
                      </button>
                      <button type="button" id="agent-chat-mode-note" class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-amber-400 border border-amber-800/40 hover:bg-amber-950/40 cursor-pointer transition" title="Internal notes are only visible to staff/agents and never shown to the user">
                        <i class="fa-solid fa-lock mr-1"></i>Internal Staff Note (Hidden from User)
                      </button>
                    </div>
                    <span id="agent-chat-typing-indicator" class="text-[10px] font-mono text-slate-500">Ready</span>
                  </div>

                  <!-- Attachment Preview -->
                  <div id="agent-inbox-attachment-preview" class="hidden bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-slate-200">
                    <div class="flex items-center gap-2 truncate">
                      <i class="fa-solid fa-paperclip text-cyan-400"></i>
                      <span id="agent-inbox-attachment-name" class="truncate font-mono text-[10px]">file.png</span>
                    </div>
                    <button type="button" id="agent-inbox-attachment-remove" class="text-rose-400 hover:text-rose-300 text-xs px-2 cursor-pointer">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>

                  <!-- Composer Form -->
                  <form id="agent-inbox-reply-form" class="flex items-end gap-2">
                    <input type="file" id="agent-chat-attach-input" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" class="hidden" />
                    <button type="button" id="agent-chat-attach-btn" class="w-10 h-10 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-center cursor-pointer transition shrink-0" title="Attach Validated Image/PDF (Max 2MB)">
                      <i class="fa-solid fa-paperclip text-xs"></i>
                    </button>
                    <textarea id="agent-inbox-reply-input" rows="2" placeholder="Write a message... (Enter to send, Shift+Enter for new line)" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-sans resize-none"></textarea>
                    <button type="submit" id="agent-inbox-send-btn" class="bg-gradient-to-r from-cyan-600 to-teal-600 hover:brightness-110 text-white px-4 py-2.5 h-10 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition shrink-0">
                      <span>Send</span>
                      <i class="fa-solid fa-paper-plane text-[10px]"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= 3. AGENT SUB-TAB: MY USERS (FIELD PLAYERS) ================= -->
          <div id="agent-tab-players" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-800 pb-3">
                <div>
                  <h3 class="text-sm font-black text-white flex items-center gap-1.5">
                    <i class="fa-solid fa-users text-emerald-400"></i> My Users & Field Player Registry
                  </h3>
                  <p class="text-xs text-slate-400">View your referred users or all registered field players, verify wallets, chat live, or load/cashout funds.</p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <select id="agent-players-scope-filter" class="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono outline-none focus:border-emerald-500 cursor-pointer">
                    <option value="all">All Field Players</option>
                    <option value="my">My Referred Users Only</option>
                  </select>
                  <div class="relative w-full sm:w-64">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><i class="fa-solid fa-magnifying-glass text-xs"></i></span>
                    <input id="agent-players-search-input" type="text" class="w-full bg-slate-950 text-xs py-2 pl-9 pr-4 rounded-xl border border-slate-800 focus:border-emerald-500 text-white outline-none font-mono" placeholder="Search Username, Email, Phone..." />
                  </div>
                  <button type="button" onclick="document.getElementById('agent-btn-add-user')?.click();" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-3.5 rounded-xl cursor-pointer transition flex items-center gap-1.5">
                    <i class="fa-solid fa-user-plus"></i> Add User
                  </button>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase select-none">
                      <th class="p-3">Player Account</th>
                      <th class="p-3">Contact Nodes</th>
                      <th class="p-3">Wallet Funds</th>
                      <th class="p-3">Status & Network</th>
                      <th class="p-3 text-right">Instant Terminal Actions</th>
                    </tr>
                  </thead>
                  <tbody id="agent-players-tbody" class="divide-y divide-slate-800/45 text-slate-300">
                    <!-- Dynamically populated -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ================= 4. AGENT SUB-TAB: ADD NEW USER ================= -->
          <div id="agent-tab-add-user" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-lg max-w-3xl">
              <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div class="w-10 h-10 rounded-2xl bg-indigo-950 border border-indigo-800/60 text-indigo-400 flex items-center justify-center text-base">
                  <i class="fa-solid fa-user-plus"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black uppercase text-white">Agent-Assisted New User Registration</h3>
                  <p class="text-xs text-slate-400">Open a verified player account directly under your referral network. Creation commission is automatically tracked and released once the user completes a minimum ৳100 deposit.</p>
                </div>
              </div>

              <form id="agent-player-quick-register-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div class="space-y-1.5">
                  <label class="block text-slate-400 uppercase font-bold text-[10px]">Player Username *</label>
                  <input id="agent-reg-username" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-indigo-500" placeholder="e.g. player123" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-slate-400 uppercase font-bold text-[10px]">Email Address *</label>
                  <input id="agent-reg-email" type="email" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-indigo-500" placeholder="e.g. player@gmail.com" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-slate-400 uppercase font-bold text-[10px]">Phone Number (BD) *</label>
                  <input id="agent-reg-phone" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-indigo-500" placeholder="e.g. 01700000000" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-slate-400 uppercase font-bold text-[10px]">Initial Password *</label>
                  <input id="agent-reg-password" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white outline-none focus:border-indigo-500" placeholder="Minimum 4 characters" />
                </div>
                <div class="sm:col-span-2 pt-2">
                  <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:brightness-110 text-white font-black py-3 rounded-xl transition text-xs uppercase tracking-wider cursor-pointer shadow-lg">
                    <i class="fa-solid fa-user-check mr-1.5"></i> Create Verified User Account
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- ================= 5. AGENT SUB-TAB: USER REGISTRATION HISTORY ================= -->
          <div id="agent-tab-reg-history" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 class="text-sm font-black text-white flex items-center gap-1.5">
                    <i class="fa-solid fa-user-clock text-teal-400"></i> User Registration History
                  </h3>
                  <p class="text-xs text-slate-400">Complete log of players registered or referred under your agent account and their commission qualification status.</p>
                </div>
                <input id="agent-reghistory-search" type="text" placeholder="Search registered user..." class="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-teal-500" />
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr class="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th class="p-3">Join Date</th>
                      <th class="p-3">User Account</th>
                      <th class="p-3">Phone / Email</th>
                      <th class="p-3">Current Balance</th>
                      <th class="p-3">Total Deposit</th>
                      <th class="p-3 text-right">Registration Commission</th>
                    </tr>
                  </thead>
                  <tbody id="agent-reghistory-tbody" class="divide-y divide-slate-800/40 text-slate-300">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ================= 6. AGENT SUB-TAB: COMMISSION & EARNINGS ================= -->
          <div id="agent-tab-commissions" class="hidden space-y-6">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span class="text-[9.5px] text-slate-400 font-mono uppercase block">Total Earned Commission</span>
                <strong id="agent-comm-tab-total" class="text-lg font-black text-emerald-400 font-mono mt-1 block">৳0.00</strong>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span class="text-[9.5px] text-slate-400 font-mono uppercase block">Pending Commission</span>
                <strong id="agent-comm-tab-pending" class="text-lg font-black text-amber-400 font-mono mt-1 block">৳0.00</strong>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span class="text-[9.5px] text-slate-400 font-mono uppercase block">Ticket Booking Comm</span>
                <strong id="agent-comm-tab-booking" class="text-lg font-black text-cyan-400 font-mono mt-1 block">৳0.00</strong>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span class="text-[9.5px] text-slate-400 font-mono uppercase block">Sub-Agent Overrides</span>
                <strong id="agent-comm-tab-override" class="text-lg font-black text-indigo-400 font-mono mt-1 block">৳0.00</strong>
              </div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 class="text-sm font-black text-white flex items-center gap-1.5">
                    <i class="fa-solid fa-sack-dollar text-amber-400"></i> Commission & Earnings Breakdown
                  </h3>
                  <p class="text-xs text-slate-400">All commission entries from ticket bookings, user deposits, sub-agent overrides, and monthly target rewards.</p>
                </div>
                <select id="agent-comm-filter-status" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none cursor-pointer">
                  <option value="all">All Statuses</option>
                  <option value="complete">Earned / Released</option>
                  <option value="pending">Pending Qualification</option>
                </select>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr class="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th class="p-3">Date/Time</th>
                      <th class="p-3">Source User</th>
                      <th class="p-3">Commission Type</th>
                      <th class="p-3">Base Amount</th>
                      <th class="p-3">Status</th>
                      <th class="p-3 text-right">Commission (৳)</th>
                    </tr>
                  </thead>
                  <tbody id="agent-commissions-tbody" class="divide-y divide-slate-800/40 text-slate-300">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ================= 7. AGENT SUB-TAB: TRANSACTION HISTORY ================= -->
          <div id="agent-tab-transactions" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 class="text-sm font-black text-white flex items-center gap-1.5">
                    <i class="fa-solid fa-receipt text-cyan-400"></i> Agent Transaction History
                  </h3>
                  <p class="text-xs text-slate-400">Complete audit trail of wallet loads, cashout payouts, and balance transfers.</p>
                </div>
                <div class="flex items-center gap-2">
                  <select id="agent-tx-type-filter" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none cursor-pointer">
                    <option value="all">All Types</option>
                    <option value="deposit">Deposits / Loads</option>
                    <option value="withdraw">Withdrawals / Cashouts</option>
                  </select>
                  <input id="agent-tx-search-input" type="text" placeholder="Search TX or user..." class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-500" />
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr class="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th class="p-3">TX ID</th>
                      <th class="p-3">Date</th>
                      <th class="p-3">User</th>
                      <th class="p-3">Method / Details</th>
                      <th class="p-3">Type</th>
                      <th class="p-3">Status</th>
                      <th class="p-3 text-right">Amount (৳)</th>
                    </tr>
                  </thead>
                  <tbody id="agent-transactions-tbody" class="divide-y divide-slate-800/40 text-slate-300">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ================= 8. AGENT SUB-TAB: PAYMENT REQUESTS ================= -->
          <div id="agent-tab-payment-requests" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 class="text-sm font-black text-white flex items-center gap-1.5">
                    <i class="fa-solid fa-hand-holding-dollar text-rose-400"></i> User Payment & Cashout Requests
                  </h3>
                  <p class="text-xs text-slate-400">Pending and processed deposit/withdrawal requests from your users and district station.</p>
                </div>
                <select id="agent-payreq-status-filter" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none cursor-pointer">
                  <option value="all">All Requests</option>
                  <option value="pending">Pending Only</option>
                  <option value="approved">Approved / Completed</option>
                </select>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr class="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th class="p-3">Request ID</th>
                      <th class="p-3">User</th>
                      <th class="p-3">Request Type</th>
                      <th class="p-3">Method / Phone</th>
                      <th class="p-3">Amount (৳)</th>
                      <th class="p-3">Status</th>
                      <th class="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody id="agent-payreq-tbody" class="divide-y divide-slate-800/40 text-slate-300">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ================= 9. AGENT SUB-TAB: WALLET & BALANCE ================= -->
          <div id="agent-tab-wallet" class="hidden space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                <span class="text-[10px] text-slate-400 font-mono uppercase">Available Operational Balance</span>
                <div id="agent-wallet-tab-balance" class="text-2xl font-black text-white font-mono">৳0.00</div>
                <p class="text-[10px] text-slate-500">Used for instant player wallet cash loads</p>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                <span class="text-[10px] text-slate-400 font-mono uppercase">Earned Commission Purse</span>
                <div id="agent-wallet-tab-commission" class="text-2xl font-black text-emerald-400 font-mono">৳0.00</div>
                <p class="text-[10px] text-slate-500">Available to transfer to balance or withdraw</p>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                <span class="text-[10px] text-slate-400 font-mono uppercase">Total Cash Loaded to Users</span>
                <div id="agent-wallet-tab-loaded" class="text-2xl font-black text-cyan-400 font-mono">৳0.00</div>
                <p class="text-[10px] text-slate-500">Cumulative field cash loads processed</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Transfer Commission to Operational Wallet -->
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h4 class="text-sm font-black text-white flex items-center gap-2">
                  <i class="fa-solid fa-money-bill-transfer text-emerald-400"></i> Transfer Commission to Operational Wallet
                </h4>
                <p class="text-xs text-slate-400">Convert your earned commissions directly into your operational agent wallet balance with zero fee.</p>
                <form id="agent-wallet-transfer-comm-form" class="space-y-3 text-xs font-mono">
                  <div class="space-y-1">
                    <label class="text-slate-400 text-[10px] uppercase font-bold">Transfer Amount (৳)</label>
                    <input id="agent-wallet-transfer-amount" type="number" min="10" step="1" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-emerald-500" placeholder="Enter amount (min ৳10)" />
                  </div>
                  <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl cursor-pointer transition uppercase text-xs">
                    Transfer to Operational Balance
                  </button>
                </form>
              </div>

              <!-- Request Admin Wallet Refill / Top-Up -->
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h4 class="text-sm font-black text-white flex items-center gap-2">
                  <i class="fa-solid fa-building-columns text-cyan-400"></i> Request Operational Balance Refill
                </h4>
                <p class="text-xs text-slate-400">Submit an official agent balance refill request to Admin with your payment reference.</p>
                <form id="agent-wallet-refill-form" class="space-y-3 text-xs font-mono">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="text-slate-400 text-[10px] uppercase font-bold">Refill Amount (৳)</label>
                      <input id="agent-refill-amount" type="number" min="100" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-cyan-500" placeholder="e.g. 5000" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-slate-400 text-[10px] uppercase font-bold">Payment Method</label>
                      <select id="agent-refill-method" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none">
                        <option value="bKash Agent">bKash</option>
                        <option value="Nagad Agent">Nagad</option>
                        <option value="Bank Transfer">Bank Deposit</option>
                      </select>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-slate-400 text-[10px] uppercase font-bold">Transaction Reference / TrxID</label>
                    <input id="agent-refill-trxid" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-cyan-500" placeholder="Enter TrxID or Reference" />
                  </div>
                  <button type="submit" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-2.5 rounded-xl cursor-pointer transition uppercase text-xs">
                    Submit Refill Request
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- ================= 10. AGENT SUB-TAB: REFERRAL PERFORMANCE ================= -->
          <div id="agent-tab-referrals" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 class="text-sm font-black text-white flex items-center gap-2">
                    <i class="fa-solid fa-network-wired text-purple-400"></i> Agent Referral Link & Performance
                  </h3>
                  <p class="text-xs text-slate-400">Share your official agent referral code/link to onboard players automatically under your network.</p>
                </div>
                <div class="flex items-center gap-2">
                  <input id="agent-referral-link-input" type="text" readonly class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono w-64 outline-none" value="" />
                  <button type="button" id="agent-copy-ref-link-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition">
                    <i class="fa-solid fa-copy mr-1"></i>Copy
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div class="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                  <span class="text-[9.5px] text-slate-500 uppercase block">Direct L1 Referrals</span>
                  <strong id="agent-ref-stat-l1" class="text-lg font-black text-white">0</strong>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                  <span class="text-[9.5px] text-slate-500 uppercase block">Qualified (≥৳100 Dep)</span>
                  <strong id="agent-ref-stat-qualified" class="text-lg font-black text-emerald-400">0</strong>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                  <span class="text-[9.5px] text-slate-500 uppercase block">Tickets Bought by Refs</span>
                  <strong id="agent-ref-stat-tickets" class="text-lg font-black text-cyan-400">0</strong>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                  <span class="text-[9.5px] text-slate-500 uppercase block">Referral Volume</span>
                  <strong id="agent-ref-stat-volume" class="text-lg font-black text-amber-400">৳0.00</strong>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr class="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th class="p-3">Player</th>
                      <th class="p-3">Joined</th>
                      <th class="p-3">Deposits</th>
                      <th class="p-3">Tickets Purchased</th>
                      <th class="p-3">Spend Volume</th>
                      <th class="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody id="agent-referrals-tbody" class="divide-y divide-slate-800/40 text-slate-300">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ================= 11. AGENT SUB-TAB: NOTIFICATIONS ================= -->
          <div id="agent-tab-notifications" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 class="text-sm font-black text-white flex items-center gap-2">
                    <i class="fa-solid fa-bell text-amber-400"></i> Agent Notifications & System Alerts
                  </h3>
                  <p class="text-xs text-slate-400">Real-time alerts for new chat messages, user registrations, sub-agent overrides, and admin notices.</p>
                </div>
                <button type="button" id="agent-notif-mark-read-btn" class="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl cursor-pointer transition">
                  <i class="fa-solid fa-check-double mr-1 text-emerald-400"></i>Mark All Read
                </button>
              </div>
              <div id="agent-notifications-list" class="space-y-2.5">
                <!-- Populated dynamically -->
              </div>
            </div>
          </div>

          <!-- ================= 12. AGENT SUB-TAB: REPORTS & ANALYTICS ================= -->
          <div id="agent-tab-analytics" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 class="text-sm font-black text-white flex items-center gap-2">
                    <i class="fa-solid fa-chart-pie text-blue-400"></i> Comprehensive Reports & Analytics
                  </h3>
                  <p class="text-xs text-slate-400">Financial & operational performance summary calculated from live database records.</p>
                </div>
                <div class="flex items-center gap-2">
                  <select id="agent-analytics-range" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none cursor-pointer">
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                  <button type="button" id="agent-analytics-export-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition">
                    <i class="fa-solid fa-download mr-1"></i>Export CSV
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <span class="text-[9.5px] text-slate-500 uppercase block">Total Cash-In (Loads)</span>
                  <strong id="agent-an-cash-in" class="text-lg font-black text-emerald-400">৳0.00</strong>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <span class="text-[9.5px] text-slate-500 uppercase block">Total Cash-Out (Paid)</span>
                  <strong id="agent-an-cash-out" class="text-lg font-black text-rose-400">৳0.00</strong>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <span class="text-[9.5px] text-slate-500 uppercase block">Ticket Sales Volume</span>
                  <strong id="agent-an-ticket-vol" class="text-lg font-black text-cyan-400">৳0.00</strong>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <span class="text-[9.5px] text-slate-500 uppercase block">Net Commission Earned</span>
                  <strong id="agent-an-net-comm" class="text-lg font-black text-amber-400">৳0.00</strong>
                </div>
              </div>

              <div id="agent-analytics-bars" class="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <!-- Populated dynamically -->
              </div>
            </div>
          </div>

          <!-- ================= 13. AGENT SUB-TAB: AGENT PROFILE ================= -->
          <div id="agent-tab-profile" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl space-y-5">
              <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg">
                  <i class="fa-solid fa-id-badge"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-white">Agent Profile & Station Settings</h3>
                  <p class="text-xs text-slate-400">Update your public desk details, contact number, district zone, and live availability status.</p>
                </div>
              </div>

              <form id="agent-profile-update-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div class="space-y-1">
                  <label class="text-slate-400 text-[10px] uppercase font-bold">Agent Username (Read-Only)</label>
                  <input id="agent-prof-username" type="text" readonly class="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-400 cursor-not-allowed" />
                </div>
                <div class="space-y-1">
                  <label class="text-slate-400 text-[10px] uppercase font-bold">Display Name / Counter Title</label>
                  <input id="agent-prof-displayname" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-emerald-500" placeholder="e.g. Dhaka Central Desk" />
                </div>
                <div class="space-y-1">
                  <label class="text-slate-400 text-[10px] uppercase font-bold">Phone / WhatsApp Number</label>
                  <input id="agent-prof-phone" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-emerald-500" />
                </div>
                <div class="space-y-1">
                  <label class="text-slate-400 text-[10px] uppercase font-bold">Email Address</label>
                  <input id="agent-prof-email" type="email" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-emerald-500" />
                </div>
                <div class="space-y-1">
                  <label class="text-slate-400 text-[10px] uppercase font-bold">Assigned District (Read-Only - Assigned by Admin)</label>
                  <input id="agent-prof-district" type="text" readonly class="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-400 cursor-not-allowed" />
                </div>
                <div class="space-y-1">
                  <label class="text-slate-400 text-[10px] uppercase font-bold">Live Chat Availability</label>
                  <select id="agent-prof-availability" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-emerald-500 cursor-pointer">
                    <option value="online">Online (Available for Chat & Cash)</option>
                    <option value="busy">Busy (Slow Response)</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div class="sm:col-span-2 pt-2">
                  <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-6 rounded-xl cursor-pointer transition uppercase text-xs">
                    <i class="fa-solid fa-floppy-disk mr-1.5"></i>Save Agent Profile
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- ================= 14. AGENT SUB-TAB: SECURITY SETTINGS ================= -->
          <div id="agent-tab-security" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl space-y-5">
              <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div class="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
                  <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-white">Agent Security & Password Settings</h3>
                  <p class="text-xs text-slate-400">Update your agent login password. Changes synchronize immediately across all devices.</p>
                </div>
              </div>

              <form id="agent-security-password-form" class="space-y-4 text-xs font-mono">
                <div class="space-y-1">
                  <label class="text-slate-400 text-[10px] uppercase font-bold">Current Password</label>
                  <input id="agent-sec-current-pass" type="password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-emerald-500" placeholder="Enter current password" />
                </div>
                <div class="space-y-1">
                  <label class="text-slate-400 text-[10px] uppercase font-bold">New Password</label>
                  <input id="agent-sec-new-pass" type="password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-emerald-500" placeholder="Minimum 4 characters" />
                </div>
                <div class="space-y-1">
                  <label class="text-slate-400 text-[10px] uppercase font-bold">Confirm New Password</label>
                  <input id="agent-sec-confirm-pass" type="password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-emerald-500" placeholder="Re-enter new password" />
                </div>
                <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-6 rounded-xl cursor-pointer transition uppercase text-xs">
                  <i class="fa-solid fa-key mr-1.5"></i>Update Password
                </button>
              </form>
            </div>
          </div>

          <!-- ================= 15. AGENT SUB-TAB: HELP & SUPPORT ================= -->
          <div id="agent-tab-support" class="hidden space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 class="text-sm font-black text-white flex items-center gap-2">
                  <i class="fa-solid fa-headset text-cyan-400"></i> Submit Agent Support Ticket to Admin
                </h3>
                <p class="text-xs text-slate-400">Need balance settlement, commission audit, or player dispute help? Send a priority ticket directly to the System Admin.</p>
                <form id="agent-support-ticket-form" class="space-y-3 text-xs font-mono">
                  <div class="space-y-1">
                    <label class="text-slate-400 text-[10px] uppercase font-bold">Issue Category</label>
                    <select id="agent-sup-category" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none">
                      <option value="Wallet Refill / Settlement">Wallet Refill / Settlement</option>
                      <option value="Commission Inquiry">Commission Inquiry</option>
                      <option value="Player Dispute / OTP Issue">Player Dispute / OTP Issue</option>
                      <option value="Technical Support">Technical Support</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-slate-400 text-[10px] uppercase font-bold">Message / Details</label>
                    <textarea id="agent-sup-message" rows="4" required class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-cyan-500 font-sans" placeholder="Describe your request or issue with TX ID / username..."></textarea>
                  </div>
                  <button type="submit" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-2.5 rounded-xl cursor-pointer transition uppercase text-xs">
                    <i class="fa-solid fa-paper-plane mr-1.5"></i>Submit Ticket to Admin
                  </button>
                </form>
              </div>

              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 class="text-sm font-black text-white flex items-center gap-2">
                  <i class="fa-solid fa-book-open text-emerald-400"></i> Agent Operational Guidelines
                </h3>
                <div class="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div class="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                    <strong class="text-emerald-400 block mb-1">1. Commission Rules</strong>
                    You earn your assigned commission rate on every direct ticket booked via the Ticket Booker and on tickets purchased by your referred Level 1 users. User registration commission is released once the new user completes at least ৳100 deposit.
                  </div>
                  <div class="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                    <strong class="text-cyan-400 block mb-1">2. Cash-In & Cash-Out Safety</strong>
                    Always collect physical cash before executing a Wallet Load, and verify the player's 6-digit Cashout OTP before handing over cash at your counter.
                  </div>
                  <div class="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                    <strong class="text-amber-400 block mb-1">3. Live Chat Etiquette</strong>
                    Respond promptly to Open/Unread user conversations in your Live Chat Inbox. Use Internal Staff Notes to record private verification details that remain invisible to players.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= 16. AGENT SUB-TAB: TICKET BOOKER TERMINAL ================= -->
          <div id="agent-tab-booker" class="hidden space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 md:col-span-2">
                <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span class="p-2 bg-emerald-950 border border-emerald-900/30 rounded-2xl text-emerald-400 text-xs">
                    <i class="fa-solid fa-terminal"></i>
                  </span>
                  <div>
                    <h3 class="text-sm font-black text-white">Ticketing Booking System Console</h3>
                    <p class="text-xs text-slate-400 font-mono">Deducts purchase fees from user's balance & claims instant commission points.</p>
                  </div>
                </div>

                <form id="agent-booking-form" class="space-y-4 pt-2 text-xs">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="block text-slate-400 uppercase font-bold text-[10px] font-mono tracking-wider">Receiver Player Username</label>
                      <div class="relative">
                        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold">@</span>
                        <input id="agent-booking-user" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none focus:border-emerald-500 font-mono" placeholder="Input target player username" />
                      </div>
                      <p class="text-[9.5px] text-slate-500 font-mono leading-none mt-1">Verify that this account is active in the "My Users" tab.</p>
                    </div>

                    <div class="space-y-1.5">
                      <label class="block text-slate-400 uppercase font-bold text-[10px] font-mono tracking-wider">Target Lottery Pool</label>
                      <select id="agent-booking-lottery" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-bold outline-none cursor-pointer focus:border-emerald-500">
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="block text-slate-400 uppercase font-bold text-[10px] font-mono tracking-wider">Ticket Purchase Qty (Pcs)</label>
                      <input id="agent-booking-qty" type="number" min="1" max="100" value="1" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-emerald-500 font-mono" />
                    </div>

                    <div class="space-y-1.5 pr-2">
                      <label class="block text-slate-400 uppercase font-bold text-[10px] font-mono tracking-wider">Pre-booking Auto Generator</label>
                      <div class="flex gap-2">
                        <input id="agent-booking-test-number" type="text" readonly class="flex-1 bg-slate-950 text-emerald-400 font-black border border-slate-800 rounded-xl py-2 px-3 text-center tracking-widest font-mono text-xs cursor-not-allowed" placeholder="------" />
                        <button id="btn-agent-test-spin" type="button" class="bg-slate-950 hover:bg-slate-800 text-slate-300 p-2 border border-slate-800 rounded-xl text-xs transition cursor-pointer flex items-center justify-center shrink-0">
                          <i class="fa-solid fa-rotate"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="bg-slate-950/80 border border-slate-800/60 rounded-2xl p-4 space-y-2.5 font-mono text-[11px] text-slate-400">
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

                  <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl shadow-lg transition cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                    <i class="fa-solid fa-print"></i> Print & Confirm Tickets Booking
                  </button>
                </form>
              </div>

              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                <h4 class="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <i class="fa-solid fa-circle-nodes text-emerald-400"></i> Active Pools List
                </h4>
                <p class="text-[11px] text-slate-400 leading-normal">These active draw pools are accessible for field booking right now.</p>
                <div id="agent-active-pools-list" class="space-y-3 pt-2"></div>
              </div>
            </div>
          </div>

          <!-- ================= 17. AGENT SUB-TAB: CASH TERMINAL (LOAD & PAY) ================= -->
          <div id="agent-tab-cash" class="hidden space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Cash Deposit Box -->
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden">
                <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span class="p-2 bg-emerald-950/60 border border-emerald-900/30 rounded-2xl text-emerald-400 text-xs">
                    <i class="fa-solid fa-circle-down"></i>
                  </span>
                  <div>
                    <h3 class="text-sm font-black text-white">Wallet Deposit Assistance (Cash Load)</h3>
                    <p class="text-xs text-slate-400 font-mono">Collect offline cash from target user, instantly credit their wallet.</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <span class="text-[9.5px] text-slate-400 font-bold uppercase font-mono block">Instant Deposit Presets (৳)</span>
                  <div class="grid grid-cols-4 gap-2">
                    <button type="button" class="preset-load-btn py-2 bg-slate-950 hover:bg-slate-800 text-white font-mono rounded-xl border border-slate-800 transition cursor-pointer text-xs font-bold" val="100">৳100</button>
                    <button type="button" class="preset-load-btn py-2 bg-slate-950 hover:bg-slate-800 text-white font-mono rounded-xl border border-slate-800 transition cursor-pointer text-xs font-bold" val="500">৳500</button>
                    <button type="button" class="preset-load-btn py-2 bg-slate-950 hover:bg-slate-800 text-white font-mono rounded-xl border border-slate-800 transition cursor-pointer text-xs font-bold" val="1000">৳1K</button>
                    <button type="button" class="preset-load-btn py-2 bg-slate-950 hover:bg-slate-800 text-white font-mono rounded-xl border border-slate-800 transition cursor-pointer text-xs font-bold" val="5000">৳5K</button>
                  </div>
                </div>

                <form id="agent-cash-deposit-form" class="space-y-4 pt-1 text-xs">
                  <div class="space-y-1.5">
                    <label class="block text-slate-400 uppercase font-black text-[9px] font-mono tracking-wider">Receiver Player Username</label>
                    <div class="relative">
                      <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold">@</span>
                      <input id="agent-cash-dep-username" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none focus:border-emerald-500 font-mono" placeholder="Input receiver player" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-slate-400 uppercase font-black text-[9px] font-mono tracking-wider">Deposit Cash Amount (৳ Taka)</label>
                    <input id="agent-cash-dep-amount" type="number" min="10" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3 text-white font-bold outline-none focus:border-emerald-500 font-mono text-base" placeholder="Enter amount to load" />
                  </div>

                  <div class="p-3.5 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl block text-[10px] text-emerald-400 leading-relaxed font-sans">
                    <i class="fa-solid fa-circle-info text-emerald-400 mr-1.5"></i> Money will be directly transferred from your <strong>Agent Account Balance</strong> to this User.
                  </div>

                  <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg">
                    <i class="fa-solid fa-check"></i> Process Wallet Load Immediately
                  </button>
                </form>
              </div>

              <!-- Cash Payout (Withdrawal Assist) Box -->
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden">
                <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span class="p-2 bg-rose-950/60 border border-rose-900/30 rounded-2xl text-rose-400 text-xs">
                    <i class="fa-solid fa-circle-up"></i>
                  </span>
                  <div>
                    <h3 class="text-sm font-black text-white">Off-line Cashout Handler (Withdraw Assist)</h3>
                    <p class="text-xs text-slate-400 font-mono">Instantly deduct client's online wallet to pay them physically.</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <span class="text-[9.5px] text-slate-400 font-bold uppercase font-mono block">Instant Payout Presets (৳)</span>
                  <div class="grid grid-cols-4 gap-2">
                    <button type="button" class="preset-wdr-btn py-2 bg-slate-950 hover:bg-slate-800 text-white font-mono rounded-xl border border-slate-800 transition cursor-pointer text-xs font-bold" val="100">৳100</button>
                    <button type="button" class="preset-wdr-btn py-2 bg-slate-950 hover:bg-slate-800 text-white font-mono rounded-xl border border-slate-800 transition cursor-pointer text-xs font-bold" val="500">৳500</button>
                    <button type="button" class="preset-wdr-btn py-2 bg-slate-950 hover:bg-slate-800 text-white font-mono rounded-xl border border-slate-800 transition cursor-pointer text-xs font-bold" val="1000">৳1K</button>
                    <button type="button" class="preset-wdr-btn py-2 bg-slate-950 hover:bg-slate-800 text-white font-mono rounded-xl border border-slate-800 transition cursor-pointer text-xs font-bold" val="3000">৳3K</button>
                  </div>
                </div>

                <form id="agent-cash-withdraw-form" class="space-y-4 pt-1 text-xs">
                  <div class="space-y-1.5">
                    <label class="block text-slate-400 uppercase font-black text-[9px] font-mono tracking-wider">Receiver Player Username</label>
                    <div class="relative">
                      <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold">@</span>
                      <input id="agent-cash-wdr-username" type="text" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none focus:border-rose-500 font-mono" placeholder="Input target player" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-slate-400 uppercase font-black text-[9px] font-mono tracking-wider">Cashout Amount (৳ Taka)</label>
                    <input id="agent-cash-wdr-amount" type="number" min="10" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3 text-white font-bold outline-none focus:border-rose-500 font-mono text-base" placeholder="Enter amount to pay" />
                  </div>

                  <div class="space-y-1.5" id="agent-cashout-otp-row">
                    <label class="block uppercase font-black text-[9px] font-mono tracking-wider text-rose-400">Player Cashout OTP (6-Digits)</label>
                    <input id="agent-cash-wdr-otp" type="text" maxlength="6" required class="w-full bg-slate-950 border border-rose-900/40 rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-rose-500 font-mono text-center tracking-widest text-base" placeholder="000000" />
                  </div>

                  <div class="p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-2xl block text-[10px] text-rose-400 leading-relaxed font-sans">
                    <i class="fa-solid fa-triangle-exclamation text-amber-500 mr-1.5"></i> This action IMMEDIATELY deducts online Taka from the user's online wallet.
                  </div>

                  <button type="submit" class="w-full bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-black py-3 rounded-xl transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg">
                    <i class="fa-solid fa-cash-register"></i> Deduct Wallet & Complete Cashout
                  </button>
                </form>
              </div>
            </div>

            <!-- AGENT CASH TERMINAL EXTENSIONS CONTAINER -->
            <div id="agent-cash-extensions-container"></div>
          </div>

          <!-- ================= 18. AGENT SUB-TAB: MANAGE SUB-AGENTS ================= -->
          <div id="agent-tab-subagents" class="hidden space-y-6">
            <div id="agent-subagents-list-view" class="space-y-6">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4 relative overflow-hidden shadow-lg">
                  <span class="text-[9px] text-slate-400 font-bold uppercase font-mono block tracking-wider">Sub-Agent Network</span>
                  <div class="flex items-baseline gap-1 mt-2">
                    <span id="agent-substats-count" class="text-lg sm:text-xl font-black text-white font-mono tracking-tight">0 Operators</span>
                  </div>
                  <p class="text-[9.5px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-800/60 leading-tight">Appointed sub-agents under you</p>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4 relative overflow-hidden shadow-lg">
                  <span class="text-[9px] text-slate-400 font-bold uppercase font-mono block tracking-wider">Sub-Agent Sales Volume</span>
                  <div class="flex items-baseline gap-1 mt-2">
                    <span id="agent-substats-volume" class="text-lg sm:text-xl font-black text-cyan-400 font-mono tracking-tight">৳0.00</span>
                  </div>
                  <p class="text-[9.5px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-800/60 leading-tight">Total tickets booked by sub-network</p>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4 relative overflow-hidden shadow-lg">
                  <span class="text-[9px] text-slate-400 font-bold uppercase font-mono block tracking-wider">Sub-Agent Earnings</span>
                  <div class="flex items-baseline gap-1 mt-2">
                    <span id="agent-substats-earnings" class="text-lg sm:text-xl font-black text-amber-400 font-mono tracking-tight">৳0.00</span>
                  </div>
                  <p class="text-[9.5px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-800/60 leading-tight">Paid directly to sub-agents</p>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4 relative overflow-hidden shadow-lg">
                  <span class="text-[9px] text-slate-400 font-bold uppercase font-mono block tracking-wider">Your Override Commission</span>
                  <div class="flex items-baseline gap-1 mt-2">
                    <span id="agent-substats-override" class="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight">৳0.00</span>
                  </div>
                  <p class="text-[9.5px] text-emerald-500/70 font-mono mt-1 pt-2 border-t border-slate-800/60 leading-tight font-bold">Your override (keep-the-difference)</p>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-1 space-y-6">
                  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                    <div>
                      <h4 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-user-plus text-indigo-400"></i> Promote L1 Player
                      </h4>
                      <p class="text-[10px] text-slate-400 mt-1">Designate one of your referred Level 1 players as an official Sub-Agent.</p>
                    </div>

                    <form id="agent-promote-subagent-form" class="space-y-3 font-mono text-[10px]">
                      <div class="space-y-1">
                        <label class="text-slate-400 block font-bold">Select Player</label>
                        <select id="agent-promote-select-player" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-indigo-500 font-sans">
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

                  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                    <div>
                      <h4 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-sitemap text-emerald-400"></i> Recruit New Sub-Agent
                      </h4>
                      <p class="text-[10px] text-slate-400 mt-1">Instantly register and onboard a new Sub-Agent directly into your downline structure.</p>
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

                <div class="lg:col-span-2 space-y-4">
                  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                    <div>
                      <h4 class="text-sm font-black text-white flex items-center gap-1.5">
                        <i class="fa-solid fa-sitemap text-indigo-400"></i> Appointed Sub-Agents Registry
                      </h4>
                      <p class="text-xs text-slate-400">Live directory tracking performance, commission rates, and override income splits.</p>
                    </div>

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
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SUB-AGENTS DETAILS VIEW -->
            <div id="agent-subagents-detail-view" class="hidden space-y-6">
              <div class="flex items-center gap-3">
                <button id="agent-subagents-detail-back-btn" class="bg-slate-900 hover:bg-slate-800 text-slate-300 font-black py-2 px-4 rounded-xl border border-slate-800 text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer">
                  <i class="fa-solid fa-arrow-left"></i> Back to Sub-Agents List
                </button>
                <span class="text-slate-500 font-mono text-xs">/ Sub-Agent Performance Details</span>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg">
                      <span id="detail-sub-avatar-initial">S</span>
                    </div>
                    <div>
                      <h4 class="text-base font-black text-white" id="detail-sub-username">@username</h4>
                      <span class="text-indigo-400 font-mono text-[10px] uppercase font-bold">Sub-Agent</span>
                    </div>
                  </div>

                  <div class="border-t border-slate-800/80 pt-4 space-y-3.5 font-mono text-xs">
                    <div class="flex justify-between">
                      <span class="text-slate-500">Email:</span>
                      <span class="text-slate-300 select-all font-sans" id="detail-sub-email">sub@mail.com</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-500">Phone:</span>
                      <span class="text-slate-300 select-all" id="detail-sub-phone">01700000000</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-500">Account Status:</span>
                      <span class="font-bold uppercase text-emerald-400" id="detail-sub-status-lbl">ACTIVE</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-500">Commission Rate:</span>
                      <span class="text-indigo-400 font-black" id="detail-sub-rate-lbl">3.0%</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-500">Your Override Rate:</span>
                      <span class="text-emerald-400 font-black" id="detail-sub-override-rate-lbl">2.0%</span>
                    </div>
                  </div>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 lg:col-span-2">
                  <h4 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-bullseye text-indigo-400"></i> Monthly Performance Target Quota
                  </h4>
                  
                  <div class="bg-slate-950/60 p-5 border border-slate-800 rounded-2xl space-y-4">
                    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <span class="text-[10px] text-slate-500 font-bold uppercase block">Current Quota Progress</span>
                        <div class="flex items-baseline gap-1 mt-0.5">
                          <span class="text-xl font-black text-white font-mono" id="detail-sub-progress-lbl">0</span>
                          <span class="text-xs text-slate-500 font-mono">/ <span id="detail-sub-target-lbl">0</span> Tickets</span>
                        </div>
                      </div>
                      <div>
                        <span class="text-[10px] text-slate-500 font-bold uppercase block text-right">Target Completion Reward</span>
                        <span class="text-base font-black text-emerald-400 block text-right mt-0.5" id="detail-sub-reward-lbl">৳0.00</span>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <div class="flex justify-between text-[10px] font-mono">
                        <span class="text-slate-500">Overall Sales completion rate</span>
                        <span class="text-cyan-400 font-bold" id="detail-sub-pct-lbl">0%</span>
                      </div>
                      <div class="w-full h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                        <div id="detail-sub-progress-bar" class="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style="width: 0%"></div>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div class="bg-slate-950/40 p-3 border border-slate-800 rounded-xl text-center">
                      <span class="text-[9px] text-slate-500 block uppercase">Total Players</span>
                      <strong class="text-white font-bold block mt-1 text-xs" id="detail-sub-players-count">0</strong>
                    </div>
                    <div class="bg-slate-950/40 p-3 border border-slate-800 rounded-xl text-center">
                      <span class="text-[9px] text-slate-500 block uppercase">Sales Volume</span>
                      <strong class="text-cyan-400 font-bold block mt-1 text-xs" id="detail-sub-sales-volume">৳0.00</strong>
                    </div>
                    <div class="bg-slate-950/40 p-3 border border-slate-800 rounded-xl text-center">
                      <span class="text-[9px] text-slate-500 block uppercase">Sub Earnings</span>
                      <strong class="text-amber-400 font-bold block mt-1 text-xs" id="detail-sub-earnings">৳0.00</strong>
                    </div>
                    <div class="bg-slate-950/40 p-3 border border-slate-800 rounded-xl text-center">
                      <span class="text-[9px] text-emerald-500 block uppercase font-bold">Your Override</span>
                      <strong class="text-emerald-400 font-bold block mt-1 text-xs" id="detail-sub-override">৳0.00</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div>
                  <h4 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-users text-cyan-400"></i> Downline Players Registered Under Sub-Agent
                  </h4>
                  <p class="text-[10px] text-slate-400">List of active field players belonging to this operator's micro-franchise network.</p>
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
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= 19. AGENT SUB-TAB: HISTORY LOGS & LEDGER ================= -->
          <div id="agent-tab-ledger" class="hidden space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h4 class="text-sm font-black text-white flex items-center gap-1.5">
                    <i class="fa-solid fa-list-check text-emerald-400"></i> Session Activity & Booking Ledger
                  </h4>
                  <p class="text-xs text-slate-400">Live sequential journal tracking all deposits, payouts, and ticket sales issued during your active session.</p>
                </div>

                <button id="btn-agent-copy-ledger" class="bg-slate-950 hover:bg-slate-800 hover:text-white border border-slate-800 py-2 px-4 rounded-xl text-[10px] uppercase font-black text-slate-300 font-mono tracking-wider transition cursor-pointer shrink-0 flex items-center gap-1.5">
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
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>

    <!-- WhatsApp Fullscreen Chat Modal / Separate Screen View -->
    <div id="agent-whatsapp-fullscreen-modal" class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md hidden flex flex-col">
      <div class="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm" id="wa-modal-avatar">U</div>
          <div>
            <h3 id="wa-modal-username" class="text-sm font-black text-white font-mono">@username</h3>
            <p id="wa-modal-status" class="text-[10px] text-emerald-400 font-mono">● Online · WhatsApp Style Agent Desk</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="wa-modal-feedback-btn" class="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1">
            <i class="fa-solid fa-star"></i> Request Feedback
          </button>
          <button type="button" id="wa-modal-close-btn" class="bg-slate-800 hover:bg-slate-700 text-white w-9 h-9 rounded-full flex items-center justify-center font-black cursor-pointer transition">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </div>
      <div id="wa-modal-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <!-- Fullscreen chat messages stream -->
      </div>
      <div class="bg-slate-900 border-t border-slate-800 p-3 space-y-2">
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button type="button" class="wa-quick-reply text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer" data-reply="আসসালামু আলাইকুম! আমি আপনার এজেন্ট। কিভাবে সাহায্য করতে পারি?">👋 স্বাগতম বার্তা</button>
          <button type="button" class="wa-quick-reply text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer" data-reply="আপনার ওয়ালেটে ক্যাশ লোড সফলভাবে সম্পন্ন হয়েছে।">✅ ক্যাশ লোড সম্পন্ন</button>
          <button type="button" class="wa-quick-reply text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer" data-reply="দয়া করে আপনার ৬-ডিজিট OTP কোডটি পাঠান।">🔐 OTP কোড দিন</button>
          <button type="button" class="wa-quick-reply text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer" data-reply="আপনার টিকেট সফলভাবে বুক করা হয়েছে।">🎟️ টিকেট বুকড</button>
        </div>
        <form id="wa-modal-form" class="flex items-center gap-2">
          <input type="text" id="wa-modal-input" placeholder="Type a message (WhatsApp style)..." class="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 font-mono" />
          <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black cursor-pointer transition">
            <i class="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </form>
      </div>
    </div>
