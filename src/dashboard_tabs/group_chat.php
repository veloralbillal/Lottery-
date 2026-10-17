<!-- ================= SCREEN: GROUP CHAT (MESSENGER STYLE) ================= -->
<div id="screen-group-chat" class="hidden min-h-screen bg-slate-950 flex flex-col justify-between p-3 sm:p-5 relative overflow-hidden font-sans z-50">
  <!-- Top Navigation / Header -->
  <header class="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-xl backdrop-blur-md z-20 max-w-3xl mx-auto w-full">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-3 min-w-0">
        <button type="button" onclick="if(window.app){window.app.closeGroupChat();}" class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0" title="Back">
          <i class="fa-solid fa-arrow-left text-sm"></i>
        </button>
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 flex items-center justify-center text-white font-black shadow-md shrink-0">
            <i class="fa-solid fa-users-line"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <h2 id="group-chat-title" class="text-xs sm:text-sm font-black text-white font-mono truncate">Lucky Community Group</h2>
              <span class="text-[9px] text-pink-400 font-mono font-bold bg-pink-950/60 border border-pink-500/30 px-2 py-0.5 rounded-full"><i class="fa-solid fa-shield-halved"></i> Official</span>
            </div>
            <div id="group-chat-status-indicator" class="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span id="group-online-count">অনলাইন মেম্বার: ৬২৪ জন</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span class="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
          ⚡ ৫ সেকেন্ড কুলডাউন
        </span>
        <button type="button" id="group-chat-refresh-btn" class="w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center transition cursor-pointer" title="Refresh Group Messages">
          <i class="fa-solid fa-rotate text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Search in Group Messages Sub-bar -->
    <div class="relative pt-1 border-t border-slate-800/70">
      <i class="fa-solid fa-magnifying-glass text-[10px] text-slate-500 absolute left-3 top-1/2 translate-y-0.5 pointer-events-none"></i>
      <input type="text" id="group-chat-search-input" placeholder="গ্রুপ চ্যাটে বার্তা খুঁজুন (Search group messages)..." class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-pink-500 font-sans" />
    </div>
  </header>

  <!-- Group Chat Messages Container -->
  <main class="flex-1 my-3 overflow-y-auto space-y-3 pr-1 max-w-3xl mx-auto w-full" id="group-chat-messages-container">
    <!-- Dynamic group messages will be injected here -->
  </main>

  <!-- Typing indicator / Cooldown banner -->
  <div id="group-cooldown-banner" class="hidden max-w-3xl mx-auto w-full bg-amber-950/40 border border-amber-500/30 rounded-xl p-2 text-center text-[10px] font-mono text-amber-300 animate-pulse">
    ⏳ স্প্যাম প্রতিরোধে প্রতি ৫ সেকেন্ডে ১টি বার্তা পাঠানো যাবে। অনুগ্রহ করে অপেক্ষা করুন...
  </div>

  <!-- Quick Reply Chips & Footer Input -->
  <footer class="max-w-3xl mx-auto w-full z-20 space-y-2">
    <!-- Quick Question Chips -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <button type="button" class="group-quick-chip bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-pink-300 text-[10px] px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer" data-msg="আসসালামু আলাইকুম সবাইকে! আজকের ড্র টিকেট কে কে নিয়েছেন?">
        👋 আসসালামু আলাইকুম
      </button>
      <button type="button" class="group-quick-chip bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-pink-300 text-[10px] px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer" data-msg="আমি আজ মেগা জ্যাকপট টিকেট কিনেছি! দোয়া করবেন।">
        🎟️ মেগা জ্যাকপট টিকেট
      </button>
      <button type="button" class="group-quick-chip bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-pink-300 text-[10px] px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer" data-msg="কার কার ক্যাশ-ইন বা ডিপোজিট এপ্রুভ হয়েছে একটু জানাবেন?">
        💸 ডিপোজিট আপডেট
      </button>
      <button type="button" class="group-quick-chip bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-pink-300 text-[10px] px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer" data-msg="অসাধারণ প্ল্যাটফর্ম! সবাই লাইভ ড্র তে জয়েন করুন।">
        🌟 দারুণ অভিজ্ঞতা
      </button>
    </div>

    <!-- Attachment Preview Box -->
    <div id="group-chat-attachment-preview" class="hidden bg-slate-900 border border-pink-500/40 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-slate-200">
      <div class="flex items-center gap-2 truncate">
        <i class="fa-solid fa-image text-pink-400"></i>
        <span id="group-chat-attachment-name" class="truncate font-mono text-[11px]">image.png</span>
      </div>
      <button type="button" id="group-chat-attachment-remove" class="text-rose-400 hover:text-rose-300 text-xs px-2 cursor-pointer">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <form id="group-chat-form" class="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-2.5 flex items-end gap-2 shadow-2xl backdrop-blur-xl">
      <input type="file" id="group-chat-file-input" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" />
      <button type="button" id="group-chat-attach-btn" class="w-10 h-10 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-pink-400 flex items-center justify-center transition cursor-pointer shrink-0" title="Attach Image">
        <i class="fa-solid fa-image text-xs"></i>
      </button>
      <textarea id="group-chat-input" rows="1" placeholder="গ্রুপ চ্যাটে বার্তা লিখুন... (প্রতি ৫ সেকেন্ডে ১টি বার্তা)" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-sans resize-none max-h-28 overflow-y-auto"></textarea>
      <button type="submit" id="group-chat-send-btn" class="bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:brightness-110 text-white px-4 py-2.5 h-10 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer shrink-0">
        <span>পাঠান</span>
        <i class="fa-solid fa-paper-plane text-[10px]"></i>
      </button>
    </form>
  </footer>
</div>
