export const memberProfileScreenTemplate = `
    <!-- ================= SCREEN: MEMBER PROFILE (SEPARATE PAGE/FILE) ================= -->
    <div id="screen-member-profile" class="hidden h-screen h-[100dvh] bg-[#0b0f19] flex flex-col justify-between relative overflow-hidden font-sans z-50 w-full max-w-lg mx-auto shadow-2xl border-x border-slate-800/40">
      <header class="bg-[#121826]/95 border-b border-slate-800/80 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-md backdrop-blur-md z-20 shrink-0 w-full max-w-full overflow-hidden">
        <div class="flex items-center gap-3 min-w-0">
          <button type="button" onclick="if(window.app){window.app.openCommunityPage();}" class="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0" title="Back">
            <i class="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <div>
            <h2 class="text-sm font-bold text-white">মেম্বার প্রফাইল ডিটেইলস</h2>
            <p class="text-[11px] text-slate-400">কমিউনিটি ইউজার প্রফাইল</p>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto w-full" id="member-profile-details-container">
        <!-- Rendered dynamically -->
      </main>

      <footer class="bg-[#121826] border-t border-slate-800 p-4 text-center text-xs text-slate-500 shrink-0">
        Lucky Community Portal © 2026
      </footer>
    </div>
`;
