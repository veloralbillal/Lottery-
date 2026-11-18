export const communityHubScreenTemplate = `
    <!-- ================= SCREEN: COMMUNITY HUB (SEPARATE PAGE) ================= -->
    <div id="screen-community" class="hidden h-screen h-[100dvh] bg-[#0b0f19] flex flex-col justify-between relative overflow-hidden font-sans z-50 w-full max-w-lg mx-auto shadow-2xl border-x border-slate-800/40">
      <header class="bg-[#121826]/95 border-b border-slate-800/80 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-md backdrop-blur-md z-20 shrink-0 w-full max-w-full overflow-hidden">
        <div class="flex items-center gap-3 min-w-0">
          <button type="button" onclick="if(window.app){window.app.closeCommunityPage();}" class="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0" title="Back to Group">
            <i class="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
              <i data-lucide="globe" class="w-5 h-5 text-blue-400"></i>
            </div>
            <div>
              <h2 class="text-sm font-bold text-white">Lucky Community Hub</h2>
              <p class="text-[11px] text-slate-400">অফিশিয়াল কমিউনিটি পোর্টাল ও মেম্বার ডিরেক্টরি</p>
            </div>
          </div>
        </div>
        <button type="button" onclick="if(window.app){window.app.openGroupChat();}" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0">
          <i data-lucide="message-square" class="w-3 h-3 mr-1 inline"></i> গ্রুপ চ্যাট
        </button>
      </header>

      <main class="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        <!-- Community Banner Card -->
        <div class="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-blue-500/30 rounded-3xl p-5 shadow-xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[10px] font-mono font-bold uppercase">Community Portal</span>
            <span class="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> লাইভ একটিভ</span>
          </div>
          <h3 class="text-base font-black text-white">স্বাগতম লাকি কমিউনিটি হাবে!</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            এখানে আমাদের সকল মেম্বার, নোটিশ, পোল, এবং কমিউনিটি রিসোর্স এক্টিভ রয়েছে। গ্রুপের নিয়মাবলী মেনে চলুন এবং মেম্বারদের সাথে যুক্ত থাকুন।
          </p>
        </div>

        <!-- Community Tabs -->
        <div class="grid grid-cols-3 gap-2">
          <button type="button" class="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl text-center transition cursor-pointer space-y-1">
            <i data-lucide="users" class="w-5 h-5 text-blue-400 inline"></i>
            <h4 class="text-xs font-bold text-white">মেম্বারগণ</h4>
            <p id="community-member-count-badge" class="text-[10px] text-slate-400">রিয়েল মেম্বার</p>
          </button>
          <button type="button" class="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl text-center transition cursor-pointer space-y-1">
            <i data-lucide="bell" class="w-5 h-5 text-amber-400 inline"></i>
            <h4 class="text-xs font-bold text-white">অফিশিয়াল নোটিশ</h4>
            <p class="text-[10px] text-slate-400">৩টি পিনড</p>
          </button>
          <button type="button" class="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl text-center transition cursor-pointer space-y-1">
            <i data-lucide="award" class="w-5 h-5 text-pink-400 inline"></i>
            <h4 class="text-xs font-bold text-white">টপ উইনার্স</h4>
            <p class="text-[10px] text-slate-400">লিডারবোর্ড</p>
          </button>
        </div>

        <!-- Real Members Directory -->
        <div class="space-y-3 pb-6">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">রিয়েল কমিউনিটি মেম্বারগণ (<span id="community-real-member-count">0</span> জন)</h4>
            <span class="text-[10px] text-blue-400 font-mono">প্রফাইল দেখতে নামের উপর ক্লিক করুন</span>
          </div>
          <div id="community-real-members-list" class="space-y-2">
            <!-- Dynamically populated real members -->
          </div>
        </div>

        <!-- Recent Announcements -->
        <div class="space-y-3 pb-6">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">সর্বশেষ ঘোষণা</h4>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between text-[11px] text-slate-400">
              <span class="font-bold text-amber-400">@Admin</span>
              <span>আজ, ১০:৩০ AM</span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed">
              আসন্ন মেগা জ্যাকপট ড্র এর টিকেটের জন্য এখনই আপনার ব্যালেন্স আপডেট করুন। ড্র সফলভাবে অনুষ্ঠিত হবে।
            </p>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between text-[11px] text-slate-400">
              <span class="font-bold text-blue-400">@Support</span>
              <span>গতকাল, ০৮:১৫ PM</span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed">
              যেকোনো ডিপোজিট বা উইথড্র সমস্যার জন্য সরাসরি এজেন্ট চ্যাট বা আমাদের হেল্পলাইনে কল করুন।
            </p>
          </div>
        </div>
      </main>

      <footer class="bg-[#121826] border-t border-slate-800 p-4 text-center text-xs text-slate-500 shrink-0">
        Lucky Community Hub © 2026 • Secure Mobile Portal
      </footer>
    </div>
`;
