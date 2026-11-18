export const profileDetailsModalTemplate = `
  <div class="bg-slate-900 border border-slate-800/80 rounded-[32px] max-w-sm w-full shadow-2xl relative text-left font-sans text-slate-100 transition-all duration-300 transform scale-95 opacity-0 active-modal-anim overflow-hidden" style="perspective: 1000px; transform-style: preserve-3d;">
    <!-- 3D Sheen Highlight -->
    <div id="profile-detail-3d-sheen" class="absolute inset-0 pointer-events-none z-30 opacity-0 transition-opacity duration-300 rounded-[32px]"></div>

    <!-- Colored Accent Header Card Background -->
    <div class="h-28 bg-gradient-to-br from-indigo-950 via-slate-900 to-pink-950/30 relative overflow-hidden" style="transform-style: preserve-3d;">
      <div id="profile-detail-banner-overlay" class="absolute inset-0 pointer-events-none transition-all duration-500 z-0"></div>
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      <!-- Cyber network lines decoration -->
      <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>

      <div class="absolute top-4 left-5 z-20">
        <span class="text-[9px] bg-slate-950/90 text-cyan-300 border border-cyan-800/80 px-2.5 py-0.5 rounded-full font-black select-none flex items-center gap-1 backdrop-blur-sm shadow-md animate-pulse">
          <i data-lucide="box" class="text-cyan-400 text-[9px] animate-spin-slow"></i> 3D DECOR ACTIVE
        </span>
      </div>

      <button id="profile-detail-close-btn" class="absolute top-4 right-4 text-slate-400 hover:text-white transition w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer z-30 shadow-md">
        <i data-lucide="x" class="text-sm"></i>
      </button>
    </div>

    <div class="px-6 pb-6 pt-0 relative space-y-5" style="transform-style: preserve-3d;">
      <!-- Avatar overlapping header -->
      <div class="flex flex-col items-center -mt-12 space-y-3" style="transform: translateZ(35px); transform-style: preserve-3d;">
        <div id="profile-detail-avatar-container" class="relative w-22 h-22 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 p-1.5 rounded-full shadow-2xl shadow-rose-500/20 select-none">
          <div id="profile-detail-anim-overlay" class="absolute -inset-2.5 pointer-events-none z-20 flex items-center justify-center"></div>
          <div class="w-full h-full bg-slate-950 rounded-full flex items-center justify-center border-2 border-slate-950 overflow-hidden relative">
            <span id="profile-detail-initials" class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 font-display">U</span>
          </div>
          <div id="profile-detail-frame-overlay" class="absolute inset-0 pointer-events-none z-10"></div>
          <span class="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3.5px] border-slate-900 animate-pulse shadow-md z-30"></span>
        </div>
        
        <div class="text-center space-y-1">
          <div class="flex items-center justify-center gap-1.5">
            <h3 id="profile-detail-username" class="text-lg font-black text-white leading-none font-sans">@username</h3>
            <i data-lucide="circle-check" class="text-cyan-400 text-xs shadow-sm shadow-cyan-400/20"></i>
          </div>
          <p id="profile-detail-email" class="text-[10px] text-slate-500 font-mono tracking-tight">user@winnerlottery.app</p>
        </div>

        <!-- Reputation Badges -->
        <div id="profile-detail-badges" class="flex flex-wrap justify-center gap-1.5 pt-0.5 select-none w-full max-h-16 overflow-y-auto">
          <span class="bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 px-2.5 py-0.5 rounded-full text-[9px] font-semibold">Active Player</span>
        </div>
      </div>

      <div class="border-t border-slate-800/80 my-1"></div>

      <!-- Stats Grid -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between pl-1">
          <h4 class="text-[9.5px] uppercase tracking-widest text-slate-400 font-mono font-black flex items-center gap-1.5">
            <i data-lucide="bar-chart-2" class="text-blue-400 text-[8px]"></i> Performance Stats
          </h4>
          <span class="text-[8.5px] text-slate-600 font-mono select-none">Updated Realtime</span>
        </div>
        
        <div class="grid grid-cols-2 gap-2.5 text-xs">
          <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Tickets</span>
              <i data-lucide="ticket" class="text-slate-600 text-[10px]"></i>
            </div>
            <span id="profile-detail-lotteries-count" class="block text-base font-black text-slate-200">0</span>
          </div>

          <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Wins</span>
              <i data-lucide="trophy" class="text-amber-500/80 text-[10px]"></i>
            </div>
            <span id="profile-detail-wins-count" class="block text-base font-black text-amber-400 leading-none">0</span>
          </div>

          <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Loss / Spent</span>
              <i data-lucide="wallet" class="text-rose-500/80 text-[10px]"></i>
            </div>
            <span id="profile-detail-loss" class="block text-sm font-extrabold text-rose-405 leading-none">৳0.00</span>
          </div>

          <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Net Profit</span>
              <i data-lucide="trending-up" class="text-emerald-500/80 text-[10px]"></i>
            </div>
            <span id="profile-detail-profit" class="block text-sm font-extrabold text-emerald-405 leading-none">৳0.00</span>
          </div>
        </div>
      </div>

      <!-- Actions Buttons -->
      <div class="grid grid-cols-2 gap-3 pt-1">
        <button id="profile-detail-add-friend-btn" class="w-full bg-slate-950 hover:bg-slate-850 hover:border-slate-700/85 border border-slate-800 text-white font-bold text-xs h-[44px] px-3 rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-md">
          <i data-lucide="user-plus" class="text-emerald-450"></i> Add Friend
        </button>
        <button id="profile-detail-message-btn" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs h-[44px] px-3 rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-lg shadow-emerald-600/15">
          <i data-lucide="feather" class="text-white"></i> Message
        </button>
      </div>
    </div>
  </div>
`;

export const directChatModalTemplate = `
  <div class="bg-slate-900 border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl w-full max-w-4xl h-full sm:h-[88vh] flex flex-col overflow-hidden shadow-2xl font-sans relative">
    <!-- Top Chat Header -->
    <div id="chat-main-header" class="bg-slate-950 border-b border-slate-850 py-3.5 px-4 sm:px-5 flex items-center justify-between shrink-0 z-20">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 text-base shadow-lg shadow-emerald-500/20 font-black">
          <i data-lucide="message-square" class="text-slate-950"></i>
        </div>
        <div class="text-left">
          <div class="flex items-center gap-1.5">
            <span class="text-[9px] bg-gradient-to-r from-emerald-950 to-teal-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md font-extrabold select-none flex items-center gap-1 shadow-sm">
              <i data-lucide="lock" class="text-[8px] animate-pulse text-emerald-400"></i> Encrypted Messenger Pro
            </span>
            <span id="chat-center-subtitle-tag" class="text-[9px] text-slate-500 font-mono tracking-wider hidden sm:inline">12ms • HD Voice Sync</span>
          </div>
          <h3 class="text-xs sm:text-sm font-black text-white mt-0.5 leading-none tracking-tight">Direct Messaging & Social Hub</h3>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- VIP Theme Picker Toggle -->
        <div class="relative">
          <button id="chat-theme-toggle-btn" title="Change Messenger Theme" class="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-400 hover:text-amber-300 rounded-xl py-2 px-3 text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md">
            <i data-lucide="palette" class="text-amber-400"></i>
            <span class="hidden md:inline">Theme</span>
          </button>

          <!-- Theme Selector Popover -->
          <div id="chat-theme-popover" class="hidden absolute right-0 top-11 w-52 bg-slate-950 border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 text-left space-y-1">
            <div class="text-[9px] uppercase font-mono text-slate-400 font-black px-2 py-1">Select VIP Messenger Theme</div>
            <button class="chat-theme-option-btn w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-900 transition flex items-center gap-2" data-theme="cosmic">
              <span class="w-3.5 h-3.5 rounded-full bg-purple-600 border border-purple-400"></span> Cosmic Galaxy
            </button>
            <button class="chat-theme-option-btn w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-slate-900 transition flex items-center gap-2" data-theme="royal">
              <span class="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-300"></span> Royal Gold Silk
            </button>
            <button class="chat-theme-option-btn w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-cyan-300 hover:bg-slate-900 transition flex items-center gap-2" data-theme="neon">
              <span class="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-pink-500"></span> Cyberpunk Neon
            </button>
            <button class="chat-theme-option-btn w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-rose-300 hover:bg-slate-900 transition flex items-center gap-2" data-theme="ruby">
              <span class="w-3.5 h-3.5 rounded-full bg-rose-600 border border-rose-400"></span> Volcano Fire Ruby
            </button>
            <button class="chat-theme-option-btn w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-emerald-300 hover:bg-slate-900 transition flex items-center gap-2" data-theme="dragon">
              <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-teal-300"></span> Emerald Dragon
            </button>
            <button class="chat-theme-option-btn w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-pink-300 hover:bg-slate-900 transition flex items-center gap-2" data-theme="sakura">
              <span class="w-3.5 h-3.5 rounded-full bg-pink-500 border border-fuchsia-300"></span> Sakura Blossom
            </button>
          </div>
        </div>

        <!-- Close button -->
        <button id="chat-modal-close-btn" class="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white rounded-xl py-2 px-3.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md">
          <i data-lucide="x"></i> <span class="hidden sm:inline">Close</span>
        </button>
      </div>
    </div>

    <!-- Content Body Frame (Two Column Layout) -->
    <div class="flex flex-1 overflow-hidden relative">
      <!-- Sidebar Panel (Chats & Friends toggle list) -->
      <div id="chat-sidebar-pane" class="w-full sm:w-1/3 border-r border-slate-850 flex flex-col bg-slate-900/40 shrink-0">
        <!-- Search Bar -->
        <div class="p-2.5 border-b border-slate-850 bg-slate-950/70">
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input type="text" id="chats-search-input" placeholder="Search contacts & messages..." class="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none placeholder-slate-500 focus:border-emerald-500/80 transition" />
          </div>
        </div>

        <!-- Inline Tabs Toggle -->
        <div class="grid grid-cols-2 border-b border-slate-850/80 bg-slate-950/50 p-2 gap-2 shrink-0">
          <button id="chat-tab-selector-chats" class="py-2.5 rounded-2xl text-center text-xs font-extrabold cursor-pointer transition-all duration-200 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/15" data-chat-tab="chats">
            <i data-lucide="mail" class="mr-1.5 text-[11px]"></i> Chats
          </button>
          <button id="chat-tab-selector-friends" class="py-2.5 rounded-2xl text-center text-xs font-extrabold cursor-pointer transition-all duration-200 text-slate-400 hover:text-white" data-chat-tab="friends">
            <i data-lucide="users" class="mr-1.5 text-[11px]"></i> Friends
          </button>
        </div>

        <!-- Content stack inside sidebar navigation -->
        <div class="flex-1 overflow-y-auto chat-scrollbar p-3 space-y-3">
          <!-- Chats subtab view container -->
          <div id="subtab-chats-pane" class="space-y-2">
            <div class="text-[9px] uppercase font-mono tracking-widest text-slate-400 pl-1 select-none flex items-center gap-1.5 font-black">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Chats
            </div>
            <div id="chats-conversations-list" class="space-y-1.5">
              <!-- Dynamic chat item list goes here -->
            </div>
          </div>

          <!-- Friends subtab view container -->
          <div id="subtab-friends-pane" class="hidden space-y-4">
            <!-- Requests Section -->
            <div class="space-y-2">
              <div class="text-[9px] uppercase font-mono tracking-widest text-amber-500 pl-1 select-none flex items-center justify-between font-black">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Requests
                </span>
                <span id="incoming-requests-count-badge" class="bg-amber-950 text-amber-400 border border-amber-800/40 rounded-full px-2 py-0.5 text-[9px] font-black hidden">0</span>
              </div>
              <div id="friends-requests-list" class="space-y-1.5">
                <!-- Dynamic pending list -->
              </div>
            </div>

            <!-- Mutual Friends Section -->
            <div class="space-y-2">
              <div class="text-[9px] uppercase font-mono tracking-widest text-emerald-400 pl-1 select-none flex items-center gap-1.5 font-black">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> My Connections
              </div>
              <div id="friends-mutual-list" class="space-y-1.5">
                <!-- Dynamic friend nodes -->
              </div>
            </div>

            <!-- Quick Add -->
            <div class="bg-slate-950/60 p-3.5 rounded-[24px] border border-slate-850 space-y-2.5 shadow-sm">
              <h4 class="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-black flex items-center gap-1">
                <i data-lucide="user-plus" class="text-cyan-400 text-[8px]"></i> Invite User Instantly
              </h4>
              <div class="flex gap-2">
                <input type="text" id="quick-add-username-input" placeholder="Type username..." class="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-805 text-xs text-white h-[40px] px-3.5 rounded-xl outline-none font-sans focus:border-cyan-500 transition" />
                <button id="quick-add-submit-btn" class="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-extrabold h-[40px] px-4 rounded-xl active:scale-95 transition cursor-pointer shadow-md shadow-cyan-600/10">Invite</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat screen detail content -->
      <div class="hidden sm:flex flex-grow flex-col bg-slate-950/20 overflow-hidden relative w-full max-w-full" id="chat-detail-pane">
        <!-- Active Contact Header -->
        <div id="chat-active-recipient-banner" class="bg-slate-950/70 border-b border-slate-850/60 py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 w-full max-w-full overflow-hidden">
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <button id="chat-mobile-back-btn" class="sm:hidden text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer">
              <i data-lucide="chevron-left" class="text-xs sm:text-sm"></i>
            </button>

            <div id="active-user-avatar-container" class="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-850 text-white border border-slate-800 font-black flex items-center justify-center text-xs sm:text-sm uppercase shadow shrink-0 select-none">
              <span id="active-user-avatar-initial">A</span>
              <div id="active-user-avatar-frame" class="absolute inset-0 pointer-events-none"></div>
            </div>

            <div class="truncate text-left min-w-0">
              <h4 id="active-user-header-username" class="text-xs sm:text-sm font-black text-white truncate">@username</h4>
              <div id="active-user-header-badges" class="flex flex-wrap gap-1 mt-0.5">
                <!-- Badges placeholder -->
              </div>
            </div>
          </div>
          
          <!-- Action Tools (Voice Call, Video Call, Stats) -->
          <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button id="chat-header-call-btn" title="Start HD Voice Call" class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 hover:text-white hover:bg-emerald-600 transition flex items-center justify-center text-xs active:scale-95 cursor-pointer shadow-sm">
              <i data-lucide="phone"></i>
            </button>
            <button id="chat-header-video-btn" title="Start HD Video Call" class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 hover:text-white hover:bg-cyan-600 transition flex items-center justify-center text-xs active:scale-95 cursor-pointer shadow-sm">
              <i data-lucide="video"></i>
            </button>
            <button id="chat-view-active-profile-btn" title="View Stats & Profile" class="text-[10px] sm:text-[10.5px] text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl transition cursor-pointer shrink-0 shadow-sm flex items-center gap-1 sm:gap-1.5 active:scale-95 font-bold">
              <i data-lucide="user-circle" class="text-amber-400 text-xs"></i> <span class="hidden md:inline">Stats</span>
            </button>
          </div>
        </div>

        <!-- Message Stream -->
        <div id="chat-messages-stream" class="flex-grow overflow-y-auto chat-scrollbar p-3 sm:p-4 space-y-3 sm:space-y-4 flex flex-col justify-end bg-slate-900/10">
          <!-- Message structures rendered here -->
        </div>

        <!-- Typing Indicator -->
        <div id="chat-typing-feedback" class="hidden text-[10px] font-sans italic text-slate-500 bg-slate-950/40 border-t border-slate-900/60 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 font-mono tracking-tight select-none shrink-0 text-left">
          <i data-lucide="loader-2" class="animate-spin text-[10px] text-emerald-400"></i> <span id="typing-feedback-username" class="font-bold text-slate-300">@username</span> is typing...
        </div>

        <!-- Voice Recording Bar (shows during voice record) -->
        <div id="chat-voice-recording-bar" class="hidden bg-slate-950 border-t border-red-900/50 p-2 sm:p-3 flex items-center justify-between text-xs text-white max-w-full overflow-hidden">
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 animate-ping shrink-0"></span>
            <span class="font-mono text-red-400 font-bold shrink-0" id="chat-voice-record-timer">00:03</span>
            <span class="text-slate-400 text-[9px] sm:text-[10px] truncate">Recording...</span>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button id="chat-voice-cancel-btn" class="px-2.5 py-1 bg-slate-900 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold">Cancel</button>
            <button id="chat-voice-send-btn" class="px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-[10px] font-black shadow-md">Send <i data-lucide="send" class="text-[9px] ml-1"></i></button>
          </div>
        </div>

        <!-- Rich Message Composer Toolbar (Footer Bar) -->
        <div class="p-2 sm:p-3 border-t border-slate-850 bg-slate-950/80 flex items-center gap-1.5 sm:gap-2 shrink-0 w-full max-w-full overflow-hidden relative">
          
          <!-- Send Gift/Tip Cash Button -->
          <button id="chat-send-gift-btn" title="Send Tip / Cash Gift ৳" class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-950/40 border border-amber-800/50 text-amber-400 hover:bg-amber-600 hover:text-slate-950 transition flex items-center justify-center text-xs sm:text-sm shrink-0 cursor-pointer shadow-md shadow-amber-950/20 active:scale-95">
            <i data-lucide="gift" class="text-amber-400"></i>
          </button>

          <!-- Stickers & Emojis Tray Button -->
          <div class="relative shrink-0">
            <button id="chat-stickers-btn" title="Send VIP Stickers & Emojis" class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-400 hover:bg-indigo-600 hover:text-white transition flex items-center justify-center text-xs sm:text-sm shrink-0 cursor-pointer shadow-md shadow-indigo-950/20 active:scale-95">
              <i data-lucide="smile" class="text-indigo-400"></i>
            </button>

            <!-- Stickers Popover Tray -->
            <div id="chat-stickers-popover" class="hidden absolute left-0 bottom-11 sm:bottom-12 w-64 sm:w-80 max-w-[calc(100vw-24px)] bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xl z-50 text-left space-y-2 font-sans">
              <div class="flex items-center justify-between border-b border-slate-850 pb-2">
                <span class="text-[10px] uppercase font-mono font-black text-amber-400 flex items-center gap-1">
                  <i data-lucide="crown" class="text-[9px]"></i> VIP Expressive Tray
                </span>
                <button id="chat-stickers-close-btn" class="text-slate-500 hover:text-white text-xs"><i data-lucide="x"></i></button>
              </div>

              <!-- Category Pills -->
              <div class="grid grid-cols-4 gap-1 text-[9px] font-bold">
                <button class="sticker-tab-btn py-1 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/40 text-center" data-tab="vip">👑 VIP</button>
                <button class="sticker-tab-btn py-1 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-center" data-tab="luck">🎰 Luck</button>
                <button class="sticker-tab-btn py-1 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-center" data-tab="emojis">😄 Emojis</button>
                <button class="sticker-tab-btn py-1 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-center" data-tab="phrases">💬 Quick</button>
              </div>

              <!-- Stickers Grid Container -->
              <div id="stickers-grid-container" class="grid grid-cols-4 gap-2 py-1 max-h-44 overflow-y-auto chat-scrollbar">
                <!-- Populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Voice Note Button -->
          <button id="chat-voice-note-btn" title="Record Voice Memo" class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-950/40 border border-rose-800/50 text-rose-400 hover:bg-rose-600 hover:text-white transition flex items-center justify-center text-xs sm:text-sm shrink-0 cursor-pointer shadow-md active:scale-95">
            <i data-lucide="mic" class="text-rose-400"></i>
          </button>

          <!-- Input Field -->
          <input type="text" id="chat-messages-compose-input" placeholder="Type a message..." class="flex-1 min-w-0 bg-slate-950 hover:bg-slate-900 text-slate-100 border border-slate-800 focus:border-emerald-500 rounded-xl sm:rounded-2xl py-2 sm:py-2.5 px-2.5 sm:px-4 text-xs sm:text-sm outline-none placeholder-slate-600 transition duration-150" />
          
          <!-- Send Button -->
          <button id="chat-message-send-btn" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm h-[36px] sm:h-[42px] px-3 sm:px-5 rounded-xl sm:rounded-2xl transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1 sm:gap-1.5 shrink-0">
            <i data-lucide="send" class="text-[10px]"></i>
            <span class="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>

      <!-- Empty Conversation placeholder -->
      <div class="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2.5 select-none" id="chat-empty-panel">
        <div class="w-16 h-16 rounded-[24px] bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-500 text-xl shadow-inner">
          <i data-lucide="message-square"></i>
        </div>
        <div class="space-y-1 max-w-xs text-center">
          <div class="text-xs sm:text-sm font-bold text-slate-200 font-sans">Select Conversation</div>
          <p class="text-[10px] sm:text-xs leading-relaxed text-slate-500">Choose an active chat thread or check friends tab to establish a encrypted messaging session.</p>
        </div>
      </div>
    </div>
  </div>
`;

export const chatGiftModalTemplate = `
  <div class="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-left font-sans text-slate-100 relative overflow-hidden">
    <div class="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
    
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
          <i data-lucide="gift" class="text-sm"></i>
        </div>
        <div>
          <h3 class="text-sm font-black text-white leading-none">Send Cash Gift / Tip</h3>
          <span class="text-[9px] text-amber-400 font-mono">INSTANT_TRANSFER</span>
        </div>
      </div>
      <button id="chat-gift-close-btn" class="text-slate-400 hover:text-white text-sm"><i data-lucide="x"></i></button>
    </div>

    <!-- Gift Preset Amounts -->
    <div class="space-y-1.5">
      <label class="block text-[10px] font-mono text-slate-400 uppercase font-black">Select Tip Amount (৳)</label>
      <div class="grid grid-cols-4 gap-2">
        <button class="gift-amount-btn py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 text-xs font-black" data-amount="50">৳50</button>
        <button class="gift-amount-btn py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 text-xs font-black" data-amount="100">৳100</button>
        <button class="gift-amount-btn py-2 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-300 text-xs font-black" data-amount="500">৳500</button>
        <button class="gift-amount-btn py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 text-xs font-black" data-amount="1000">৳1,000</button>
      </div>
    </div>

    <!-- Card Style -->
    <div class="space-y-1.5">
      <label class="block text-[10px] font-mono text-slate-400 uppercase font-black">Gift Box Card Style</label>
      <div class="grid grid-cols-3 gap-2 text-[10px] font-bold">
        <button class="gift-style-btn p-2 rounded-xl bg-amber-950/60 border border-amber-500 text-amber-300 flex flex-col items-center gap-1" data-style="gold">
          <span class="text-base">🏺</span> Gold Chest
        </button>
        <button class="gift-style-btn p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 hover:border-cyan-500 flex flex-col items-center gap-1" data-style="diamond">
          <span class="text-base">💎</span> Diamond Box
        </button>
        <button class="gift-style-btn p-2 rounded-xl bg-slate-950 border border-slate-800 text-rose-400 hover:border-rose-500 flex flex-col items-center gap-1" data-style="envelope">
          <span class="text-base">🧧</span> Red Envelope
        </button>
      </div>
    </div>

    <!-- Message Note -->
    <div class="space-y-1">
      <label class="block text-[10px] font-mono text-slate-400 uppercase font-black">Lucky Note (Optional)</label>
      <input type="text" id="chat-gift-note-input" placeholder="Best of luck with your ticket draws! 🍀" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" />
    </div>

    <!-- Send Gift Submit -->
    <button id="chat-gift-submit-btn" class="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer">
      Send Gift Card Now <i data-lucide="send" class="ml-1"></i>
    </button>
  </div>
`;

export const chatCallModalTemplate = `
  <div class="w-full max-w-md flex items-center justify-between text-xs font-mono text-slate-400">
    <span class="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full">
      <i data-lucide="shield-check" class="text-[10px]"></i> Encrypted HD Link
    </span>
    <span id="chat-call-status-label" class="tracking-wider">Ringing...</span>
  </div>

  <!-- Central Calling Radar Aura & Avatar -->
  <div class="flex flex-col items-center space-y-5 my-auto">
    <div class="relative w-32 h-32 flex items-center justify-center">
      <!-- Pulsing radar rings -->
      <div class="absolute inset-0 rounded-full border border-emerald-500/40 animate-radar-1 pointer-events-none"></div>
      <div class="absolute inset-0 rounded-full border border-teal-500/30 animate-radar-2 pointer-events-none"></div>
      
      <div id="chat-call-avatar-container" class="relative w-28 h-28 rounded-full bg-slate-900 border-2 border-emerald-500 p-1 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
        <div id="chat-call-avatar-initial" class="w-full h-full rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-3xl font-black uppercase text-emerald-400">
          U
        </div>
        <div id="chat-call-avatar-frame" class="absolute inset-0 pointer-events-none"></div>
      </div>
    </div>

    <div class="text-center space-y-1">
      <h2 id="chat-call-peer-username" class="text-xl font-black text-white">@username</h2>
      <p id="chat-call-timer" class="text-xs font-mono text-emerald-400 font-bold">00:00</p>
    </div>

    <!-- Simulated Audio Waveform -->
    <div id="chat-call-equalizer" class="flex items-end justify-center gap-1 h-6">
      <span class="w-1 bg-emerald-400 rounded-full animate-eq-1"></span>
      <span class="w-1 bg-teal-400 rounded-full animate-eq-2"></span>
      <span class="w-1 bg-emerald-400 rounded-full animate-eq-3"></span>
      <span class="w-1 bg-cyan-400 rounded-full animate-eq-4"></span>
      <span class="w-1 bg-teal-400 rounded-full animate-eq-5"></span>
    </div>
  </div>

  <!-- Call Action Controls -->
  <div class="w-full max-w-sm flex items-center justify-center gap-6 pb-4">
    <button id="chat-call-mute-btn" title="Mute Mic" class="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center text-base transition active:scale-95">
      <i data-lucide="mic-off"></i>
    </button>

    <button id="chat-call-end-btn" title="End Call" class="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center text-xl shadow-xl shadow-red-600/30 transition active:scale-95 cursor-pointer">
      <i data-lucide="phone-off"></i>
    </button>

    <button id="chat-call-speaker-btn" title="Speaker" class="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center text-base transition active:scale-95">
      <i data-lucide="volume-2"></i>
    </button>
  </div>
`;

export const profileMessagesButtonTemplate = `
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 rounded-full bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center shrink-0">
      <i data-lucide="message-square" class="text-emerald-400 text-xs text-center"></i>
    </div>
    <div>
      <span class="text-xs font-bold text-white block">VIP Messages Hub</span>
      <span class="text-[9px] text-slate-500 block leading-tight mt-0.5">Direct chat, HD calls, stickers & tip gifts</span>
    </div>
  </div>
  <div class="flex items-center gap-2">
    <span id="profile-messages-unread-tag" class="hidden text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full animate-bounce">0 NEW</span>
    <span class="text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-lg font-mono">Open <i data-lucide="chevron-right" class="text-[8px] pl-0.5"></i></span>
  </div>
`;
