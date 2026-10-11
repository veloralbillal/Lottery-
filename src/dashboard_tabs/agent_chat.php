<!-- ================= SCREEN: DEDICATED AGENT LIVE CHAT ================= -->
<div id="screen-agent-chat" class="hidden min-h-screen bg-slate-950 flex flex-col justify-between p-3 sm:p-5 relative overflow-hidden font-sans z-50">
  <!-- Top Navigation / Header -->
  <header class="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-xl backdrop-blur-md z-20 max-w-3xl mx-auto w-full">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-3 min-w-0">
        <button type="button" onclick="if(window.app){window.app.closeAgentChat();}" class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0" title="Back">
          <i class="fa-solid fa-arrow-left text-sm"></i>
        </button>
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white font-black shadow-md shrink-0">
            <i class="fa-solid fa-user-tie"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <h2 id="chat-agent-title" class="text-xs sm:text-sm font-black text-white font-mono truncate">@Agent</h2>
              <span class="text-[9px] text-amber-400 font-mono font-bold"><i class="fa-solid fa-circle-check"></i> Verified</span>
            </div>
            <div id="chat-agent-status-indicator" class="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>লাইভ চ্যাট সক্রিয় (Online)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span id="user-chat-thread-status" class="text-[10px] font-mono text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          Open
        </span>
        <button type="button" id="user-chat-refresh-btn" class="w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center transition cursor-pointer" title="Refresh Conversation">
          <i class="fa-solid fa-rotate text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Sub-bar: Agent Switcher & In-Chat Search -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/70">
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-mono text-slate-400 shrink-0"><i class="fa-solid fa-headset text-cyan-400 mr-1"></i>Agent:</span>
        <select id="user-chat-agent-switcher" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-cyan-500 cursor-pointer">
          <!-- Populated dynamically with active agents -->
        </select>
      </div>
      <div class="relative">
        <i class="fa-solid fa-magnifying-glass text-[10px] text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
        <input type="text" id="user-chat-search-input" placeholder="কথোপকথনে খুঁজুন (Search messages)..." class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-sans" />
      </div>
    </div>
  </header>

  <!-- Chat Messages Container -->
  <main class="flex-1 my-3 overflow-y-auto space-y-3 pr-1 max-w-3xl mx-auto w-full" id="agent-chat-messages-container">
    <!-- Dynamic message bubbles will be injected here -->
  </main>

  <!-- Quick Reply Chips & Input Footer -->
  <footer class="max-w-3xl mx-auto w-full z-20 space-y-2">
    <!-- Quick Question Buttons -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <button type="button" class="user-chat-quick-chip bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 text-[10px] px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer" data-msg="আসসালামু আলাইকুম, আমি এজেন্টের মাধ্যমে ক্যাশ-ইন (ডিপোজিট) করতে চাই।">
        💸 ক্যাশ-ইন করতে চাই
      </button>
      <button type="button" class="user-chat-quick-chip bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 text-[10px] px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer" data-msg="আমি ক্যাশ-আউট করতে চাই, দয়া করে প্রক্রিয়াটি জানাবেন।">
        🏧 ক্যাশ-আউট সাহায্য
      </button>
      <button type="button" class="user-chat-quick-chip bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 text-[10px] px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer" data-msg="আমার জন্য লটারি টিকেট বুকিং করে দিন।">
        🎟️ টিকেট বুকিং সাহায্য
      </button>
      <button type="button" class="user-chat-quick-chip bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 text-[10px] px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer" data-msg="আমার পেমেন্ট রিকোয়েস্টের বর্তমান অবস্থা জানাবেন।">
        ⏳ পেমেন্ট আপডেট
      </button>
    </div>

    <!-- Attachment Preview Box -->
    <div id="user-chat-attachment-preview" class="hidden bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-slate-200">
      <div class="flex items-center gap-2 truncate">
        <i class="fa-solid fa-paperclip text-cyan-400"></i>
        <span id="user-chat-attachment-name" class="truncate font-mono text-[11px]">attachment.png</span>
      </div>
      <button type="button" id="user-chat-attachment-remove" class="text-rose-400 hover:text-rose-300 text-xs px-2 cursor-pointer">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <form id="agent-chat-form" class="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-2.5 flex items-end gap-2 shadow-2xl backdrop-blur-xl">
      <input type="file" id="user-chat-file-input" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" class="hidden" />
      <button type="button" id="user-chat-attach-btn" class="w-10 h-10 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition cursor-pointer shrink-0" title="Attach Screenshot or Receipt (Max 2MB)">
        <i class="fa-solid fa-paperclip text-xs"></i>
      </button>
      <textarea id="agent-chat-input" rows="1" placeholder="আপনার বার্তা লিখুন... (Enter পাঠাতে, Shift+Enter নতুন লাইন)" class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans resize-none max-h-28 overflow-y-auto"></textarea>
      <button type="submit" id="user-chat-send-btn" class="bg-gradient-to-r from-cyan-600 to-teal-600 hover:brightness-110 text-white px-4 py-2.5 h-10 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer shrink-0">
        <span>পাঠান</span>
        <i class="fa-solid fa-paper-plane text-[10px]"></i>
      </button>
    </form>
  </footer>
</div>
