export const membersListScreenTemplate = `
    <!-- ================= SCREEN: REAL MEMBERS LIST (DEDICATED PAGE) ================= -->
    <div id="screen-members-list" class="hidden h-screen h-[100dvh] bg-[#0b0f19] flex flex-col justify-between relative overflow-hidden font-sans z-50 w-full max-w-lg mx-auto shadow-2xl border-x border-slate-800/40">
      <header class="bg-[#121826]/95 border-b border-slate-800/80 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-md backdrop-blur-md z-20 shrink-0 w-full max-w-full overflow-hidden">
        <div class="flex items-center gap-3 min-w-0">
          <button type="button" onclick="if(window.app){window.app.openGroupInfoModal();}" class="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0" title="Back">
            <i class="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <div>
            <h2 class="text-sm font-bold text-white flex items-center gap-2">
              <span>রিয়েল কমিউনিটি মেম্বারস</span>
              <span id="real-members-count-badge" class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold">৬২৪ জন</span>
            </h2>
            <p class="text-[11px] text-slate-400">অনলাইন ও অ্যাক্টিভ মেম্বার তালিকা</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span id="real-online-count-text" class="text-xs text-emerald-400 font-mono font-bold">৮৮ জন অনলাইন</span>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 space-y-3 max-w-lg mx-auto w-full" id="real-members-container">
        <!-- Search filter bar -->
        <div class="relative">
          <input type="text" id="member-search-input" placeholder="মেম্বার নাম বা আইডি দিয়ে খুঁজুন..." class="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 pl-10 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition" />
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-500 text-xs"></i>
        </div>

        <!-- Members list content -->
        <div id="real-members-list-content" class="space-y-2">
          <!-- Dynamically populated real members -->
        </div>
      </main>

      <footer class="bg-[#121826] border-t border-slate-800 p-4 text-center text-xs text-slate-500 shrink-0">
        Lucky Community Members Portal © 2026 • Live Real-time Sync
      </footer>
    </div>
`;
