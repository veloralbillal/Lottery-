export const groupChatScreenTemplate = `
    <!-- ================= SCREEN: GROUP CHAT (MESSENGER GROUP STYLE) ================= -->
    <div id="screen-group-chat" class="hidden h-screen h-[100dvh] bg-[#0b0f19] flex flex-col justify-between relative overflow-hidden font-sans z-50 w-full max-w-lg mx-auto shadow-2xl border-x border-slate-800/40">
      <!-- Messenger Header -->
      <header class="bg-[#121826]/95 border-b border-slate-800/80 px-2.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-md backdrop-blur-md z-20 w-full max-w-full overflow-hidden">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button type="button" onclick="if(window.app){window.app.closeGroupChat();}" class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0" title="Back">
            <i class="fa-solid fa-arrow-left text-xs sm:text-sm"></i>
          </button>
          
          <div class="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 cursor-pointer" onclick="if(window.app){window.app.openGroupInfoModal();}" title="Group Info">
            <div class="relative shrink-0">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-md flex items-center justify-center text-white font-bold">
                <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                  <i class="fa-solid fa-users text-blue-400 text-xs sm:text-sm"></i>
                </div>
              </div>
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-[#121826]"></span>
            </div>
            <div class="min-w-0 flex-1 text-left">
              <div class="flex items-center gap-1 min-w-0">
                <h2 class="text-xs sm:text-sm font-bold text-white truncate">Lucky Community Messenger</h2>
                <i class="fa-solid fa-circle-check text-blue-400 text-[10px] sm:text-xs shrink-0"></i>
              </div>
              <p class="text-[10px] text-slate-400 truncate">৬২৪ জন মেম্বার • অনলাইন ৮৮</p>
            </div>
          </div>
        </div>

        <div class="relative flex items-center gap-1 shrink-0 ml-1">
          <button type="button" onclick="if(window.app){window.app.openGroupInfoModal();}" class="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-slate-800 text-slate-300 flex items-center justify-center transition cursor-pointer" title="Group Info">
            <i class="fa-solid fa-circle-info text-sm sm:text-base text-blue-400"></i>
          </button>
          
          <!-- 3-Dot Options Dropdown -->
          <div class="relative">
            <button type="button" onclick="if(window.app){window.app.toggleGroupMenu(event);}" class="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-slate-800 text-slate-300 flex items-center justify-center transition cursor-pointer" title="Menu">
              <i class="fa-solid fa-ellipsis-vertical text-sm sm:text-base"></i>
            </button>
            <div id="group-chat-dropdown-menu" class="hidden absolute right-0 top-10 sm:top-11 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 text-xs text-slate-200">
              <button type="button" onclick="if(window.app){window.app.refreshGroupChat();}" class="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer">
                <i data-lucide="refresh-cw" class="w-4 h-4 text-blue-400"></i>
                <span>Refresh</span>
              </button>
              <button type="button" onclick="if(window.app){window.app.openGroupSettings();}" class="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer">
                <i data-lucide="settings" class="w-4 h-4 text-amber-400"></i>
                <span>Settings</span>
              </button>
              <button type="button" onclick="if(window.app){window.app.openGroupProfile();}" class="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer">
                <i data-lucide="user" class="w-4 h-4 text-pink-400"></i>
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Pinned Notice Subheader -->
      <div class="bg-indigo-950/70 border-b border-indigo-500/25 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center text-xs text-indigo-200 z-10 shrink-0 w-full overflow-hidden">
        <div class="flex items-center gap-1.5 min-w-0 flex-1">
          <i data-lucide="star" class="w-4 h-4 text-amber-400"></i>
          <span class="truncate font-medium text-[11px] sm:text-xs">লাইভ আড্ডা: লটারি টিকেট, ড্র রেজাল্ট ও মেম্বারদের প্রফিট ডিসকাশন চলছে 💬</span>
        </div>
      </div>

      <!-- Messages Area -->
      <main class="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-2.5 sm:space-y-3 bg-[#0b0f19] relative w-full max-w-full overflow-x-hidden" id="group-chat-messages-container">
        <!-- Messages rendered dynamically -->
      </main>

      <!-- Cooldown Banner -->
      <div id="group-cooldown-banner" class="hidden absolute bottom-20 left-1/2 -translate-x-1/2 bg-amber-950/90 border border-amber-500/50 text-amber-200 text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-xl z-30 font-mono text-center max-w-[90%]">
        ⏳ স্প্যাম প্রতিরোধে ৫ সেকেন্ডে ১টি বার্তা! অপেক্ষা করুন...
      </div>

      <!-- Messenger Footer / Input Area -->
      <footer class="bg-[#121826] border-t border-slate-800 p-2 sm:p-3 z-20 relative w-full max-w-full overflow-hidden">
        <div id="group-chat-typing-indicator" class="hidden mb-2 px-3 py-1 text-[11px] text-blue-400 italic bg-slate-950/80 border border-blue-500/30 rounded-xl flex items-center gap-2">
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
            <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
          <span id="group-typing-text" class="truncate text-[10px] sm:text-[11px]">কেউ একজন টাইপ করছেন...</span>
        </div>

        <!-- Quick Chips -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none w-full max-w-full">
          <button type="button" class="group-quick-chip bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap transition cursor-pointer border border-slate-700 shrink-0" data-msg="আজকের ড্র-এর আপডেট দেখেছ? কার ভাগ্য খুললো বলো তো! 🎟️">
            🎟️ আজকের ড্র আপডেট
          </button>
          <button type="button" class="group-quick-chip bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap transition cursor-pointer border border-slate-700 shrink-0" data-msg="কে কত প্রফিট করলো লটারিতে? কার কত লাভ হলো? 💰">
            💰 কে কত প্রফিট করলো?
          </button>
          <button type="button" class="group-quick-chip bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap transition cursor-pointer border border-slate-700 shrink-0" data-msg="Hey guys, নতুন লটারি টিকেটগুলো চেক করেছ? এইবারের প্রাইজ কিন্তু চরম!">
            🚀 নতুন টিকেট ও প্রাইজ
          </button>
          <button type="button" class="group-quick-chip bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap transition cursor-pointer border border-slate-700 shrink-0" data-msg="congratulations! দারুণ একটা উইন হলো আজ! 🥳🎉">
            🥳 Congratulations!
          </button>
          <button type="button" class="group-quick-chip bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap transition cursor-pointer border border-slate-700 shrink-0" data-msg="বিকাশ বা নগদে ডিপোজিট ও উইথড্র কত সময় লাগে?">
            💸 পেমেন্ট ও ক্যাশআউট
          </button>
        </div>

        <div id="group-chat-attachment-preview" class="hidden mb-2 bg-slate-950 border border-blue-500/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-slate-200">
          <div class="flex items-center gap-2 truncate min-w-0">
            <i data-lucide="image" class="w-4 h-4 text-blue-400"></i>
            <span id="group-chat-attachment-name" class="truncate font-mono text-[11px]">image.png</span>
          </div>
          <button type="button" id="group-chat-attachment-remove" class="text-rose-400 hover:text-rose-300 text-xs px-2 cursor-pointer shrink-0">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div id="group-chat-reply-preview" class="hidden mb-2 bg-slate-950 border border-blue-500/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-slate-200">
          <div class="flex items-center gap-1.5 truncate min-w-0 flex-1">
            <i class="fa-solid fa-reply text-blue-400 shrink-0"></i>
            <span class="text-slate-400 text-[10px] sm:text-[11px] shrink-0">Replying:</span>
            <span id="group-chat-reply-sender" class="text-white font-bold text-[10px] sm:text-[11px] shrink-0">@user</span>
            <span id="group-chat-reply-text" class="truncate text-slate-300 text-[10px] sm:text-[11px]">message</span>
          </div>
          <button type="button" onclick="if(window.app){window.app.cancelGroupReply();}" class="text-slate-400 hover:text-white text-xs px-2 cursor-pointer shrink-0">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Messenger Plus Attachment Popup Menu -->
        <div id="group-chat-plus-menu" class="hidden absolute bottom-16 left-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-40 w-44 sm:w-48 space-y-1 text-xs text-slate-200">
          <button type="button" onclick="if(window.app){window.app.triggerGroupAttachment('image');}" class="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition cursor-pointer">
            <i class="fa-solid fa-image text-blue-400 w-4"></i>
            <span>ছবি / Photo</span>
          </button>
          <button type="button" onclick="if(window.app){window.app.triggerGroupAttachment('file');}" class="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition cursor-pointer">
            <i class="fa-solid fa-file-arrow-up text-emerald-400 w-4"></i>
            <span>ফাইল / File</span>
          </button>
          <button type="button" onclick="if(window.app){window.app.openGroupPollCreator();}" class="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition cursor-pointer">
            <i class="fa-solid fa-square-poll-vertical text-amber-400 w-4"></i>
            <span>পোল তৈরি / Poll</span>
          </button>
          <button type="button" onclick="if(window.app){window.app.insertGroupEmoji('🔥');}" class="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition cursor-pointer">
            <i class="fa-solid fa-face-smile text-pink-400 w-4"></i>
            <span>স্টিকার / Sticker</span>
          </button>
        </div>

        <form id="group-chat-form" class="flex items-center gap-1.5 sm:gap-2 w-full max-w-full">
          <input type="file" id="group-chat-file-input" accept="image/*" class="hidden" />
          <button type="button" id="group-chat-attach-btn" onclick="if(window.app){window.app.toggleGroupPlusMenu(event);}" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-blue-400 flex items-center justify-center transition cursor-pointer shrink-0" title="Attach (Messenger Plus)">
            <i class="fa-solid fa-circle-plus text-base sm:text-lg"></i>
          </button>
          <div class="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 focus-within:border-blue-500">
            <textarea id="group-chat-input" rows="1" placeholder="মেসেজ লিখুন..." class="w-full min-w-0 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none max-h-24 overflow-y-auto"></textarea>
            <button type="button" class="text-slate-400 hover:text-amber-400 transition cursor-pointer shrink-0" onclick="if(window.app){window.app.insertGroupEmoji('😊');}">
              <i class="fa-regular fa-face-smile text-sm sm:text-base"></i>
            </button>
          </div>
          <button type="submit" id="group-chat-send-btn" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer shrink-0">
            <i data-lucide="paper-plane" class="w-4 h-4"></i>
          </button>
        </form>
      </footer>
    </div>
`;
