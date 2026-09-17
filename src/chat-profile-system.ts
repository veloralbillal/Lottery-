// ==========================================
// CHAT & PROFILE INTERACTION SYSTEM (PREMIUM VIP EDITION)
// ==========================================

import { CustomizerStore } from "./dashboard_tabs/customizer_store.js";

export class ChatProfileSystem {
  constructor(app) {
    this.app = app;
    this.activeChatUserId = null;
    this.activeChatTab = "chats"; // chats or friends
    this.activeTheme = "cosmic"; // cosmic, royal, neon, ruby, dragon, sakura
    this.searchTerm = "";
    this.automatedTimers = {};
    this.recordingVoice = false;
    this.voiceRecordTimer = null;
    this.voiceRecordSeconds = 0;
    this.activeCall = null;
    this.callTimer = null;
    this.callSeconds = 0;

    // defensive database bootstrapping
    if (!this.app.db.friendships) {
      this.app.db.friendships = [];
    }
    if (!this.app.db.directMessages) {
      this.app.db.directMessages = [];
    }
    this.app.saveDB();

    this.initUI();
    this.bindEvents();
    this.updateNotificationBadgeOff();
  }

  // Inject dynamic premium modals and styles into document
  initUI() {
    // 1. Inject Styles for Scrollbar, Themes, Radar Rings, Voice Waves, & Gift Animations
    if (!document.getElementById("chat-profile-injected-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "chat-profile-injected-styles";
      styleEl.innerHTML = `
        /* Soft custom scrollbars */
        .chat-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 4px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8);
        }

        /* Radar aura rings for voice/video call overlay */
        @keyframes radarPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.35); opacity: 0.3; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .animate-radar-1 {
          animation: radarPulse 2s infinite ease-out;
        }
        .animate-radar-2 {
          animation: radarPulse 2s infinite ease-out 0.6s;
        }

        /* Equalizer audio wave animation */
        @keyframes eqWave {
          0%, 100% { height: 4px; }
          50% { height: 20px; }
        }
        .animate-eq-1 { animation: eqWave 0.8s infinite ease-in-out; }
        .animate-eq-2 { animation: eqWave 0.8s infinite ease-in-out 0.2s; }
        .animate-eq-3 { animation: eqWave 0.8s infinite ease-in-out 0.4s; }
        .animate-eq-4 { animation: eqWave 0.8s infinite ease-in-out 0.1s; }
        .animate-eq-5 { animation: eqWave 0.8s infinite ease-in-out 0.3s; }

        /* Sticker pop-in effect */
        @keyframes stickerPop {
          0% { transform: scale(0.5) rotate(-6deg); opacity: 0; }
          70% { transform: scale(1.1) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-sticker-pop {
          animation: stickerPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        /* Gift box shimmer */
        @keyframes giftShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .gift-card-shine {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%);
          background-size: 200% 100%;
          animation: giftShimmer 2.5s infinite;
        }
      `;
      document.head.appendChild(styleEl);
    }

    // 2. Inject Profile details modal
    if (!document.getElementById("profile-details-modal")) {
      const modal = document.createElement("div");
      modal.id = "profile-details-modal";
      modal.className = "fixed inset-0 z-[9990] bg-slate-950/90 backdrop-blur-md hidden flex items-center justify-center p-4 selection:bg-rose-500/10 transition-all duration-300";
      modal.innerHTML = `
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
                <i class="fa-solid fa-cube text-cyan-400 text-[9px] animate-spin-slow"></i> 3D DECOR ACTIVE
              </span>
            </div>

            <button id="profile-detail-close-btn" class="absolute top-4 right-4 text-slate-400 hover:text-white transition w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer z-30 shadow-md">
              <i class="fa-solid fa-xmark text-sm"></i>
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
                  <i class="fa-solid fa-circle-check text-cyan-400 text-xs shadow-sm shadow-cyan-400/20"></i>
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
                  <i class="fa-solid fa-chart-simple text-blue-400 text-[8px]"></i> Performance Stats
                </h4>
                <span class="text-[8.5px] text-slate-600 font-mono select-none">Updated Realtime</span>
              </div>
              
              <div class="grid grid-cols-2 gap-2.5 text-xs">
                <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Tickets</span>
                    <i class="fa-solid fa-ticket text-slate-600 text-[10px]"></i>
                  </div>
                  <span id="profile-detail-lotteries-count" class="block text-base font-black text-slate-200">0</span>
                </div>

                <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Wins</span>
                    <i class="fa-solid fa-trophy text-amber-500/80 text-[10px]"></i>
                  </div>
                  <span id="profile-detail-wins-count" class="block text-base font-black text-amber-400 leading-none">0</span>
                </div>

                <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Loss / Spent</span>
                    <i class="fa-solid fa-wallet text-rose-500/80 text-[10px]"></i>
                  </div>
                  <span id="profile-detail-loss" class="block text-sm font-extrabold text-rose-405 leading-none">৳0.00</span>
                </div>

                <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Net Profit</span>
                    <i class="fa-solid fa-money-bill-trend-up text-emerald-500/80 text-[10px]"></i>
                  </div>
                  <span id="profile-detail-profit" class="block text-sm font-extrabold text-emerald-405 leading-none">৳0.00</span>
                </div>
              </div>
            </div>

            <!-- Actions Buttons -->
            <div class="grid grid-cols-2 gap-3 pt-1">
              <button id="profile-detail-add-friend-btn" class="w-full bg-slate-950 hover:bg-slate-850 hover:border-slate-700/85 border border-slate-800 text-white font-bold text-xs h-[44px] px-3 rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-md">
                <i class="fa-solid fa-user-plus text-emerald-450"></i> Add Friend
              </button>
              <button id="profile-detail-message-btn" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs h-[44px] px-3 rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-lg shadow-emerald-600/15">
                <i class="fa-solid fa-feather"></i> Message
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // 3. Inject VIP Messenger Pro modal
    if (!document.getElementById("direct-chat-modal")) {
      const chatModal = document.createElement("div");
      chatModal.id = "direct-chat-modal";
      chatModal.className = "fixed inset-0 z-[9995] bg-slate-950/95 backdrop-blur-lg hidden flex items-center justify-center p-0 sm:p-4 selection:bg-emerald-500/10";
      chatModal.innerHTML = `
        <div class="bg-slate-900 border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl w-full max-w-4xl h-full sm:h-[88vh] flex flex-col overflow-hidden shadow-2xl font-sans relative">
          <!-- Top Chat Header -->
          <div id="chat-main-header" class="bg-slate-950 border-b border-slate-850 py-3.5 px-4 sm:px-5 flex items-center justify-between shrink-0 z-20">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 text-base shadow-lg shadow-emerald-500/20 font-black">
                <i class="fa-solid fa-comments text-slate-950"></i>
              </div>
              <div class="text-left">
                <div class="flex items-center gap-1.5">
                  <span class="text-[9px] bg-gradient-to-r from-emerald-950 to-teal-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md font-extrabold select-none flex items-center gap-1 shadow-sm">
                    <i class="fa-solid fa-lock text-[8px] animate-pulse text-emerald-400"></i> Encrypted Messenger Pro
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
                  <i class="fa-solid fa-palette text-amber-400"></i>
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
                <i class="fa-solid fa-xmark"></i> <span class="hidden sm:inline">Close</span>
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
                  <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                  <input type="text" id="chats-search-input" placeholder="Search contacts & messages..." class="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none placeholder-slate-500 focus:border-emerald-500/80 transition" />
                </div>
              </div>

              <!-- Inline Tabs Toggle -->
              <div class="grid grid-cols-2 border-b border-slate-850/80 bg-slate-950/50 p-2 gap-2 shrink-0">
                <button id="chat-tab-selector-chats" class="py-2.5 rounded-2xl text-center text-xs font-extrabold cursor-pointer transition-all duration-200 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/15" data-chat-tab="chats">
                  <i class="fa-solid fa-envelope mr-1.5 text-[11px]"></i> Chats
                </button>
                <button id="chat-tab-selector-friends" class="py-2.5 rounded-2xl text-center text-xs font-extrabold cursor-pointer transition-all duration-200 text-slate-400 hover:text-white" data-chat-tab="friends">
                  <i class="fa-solid fa-user-group mr-1.5 text-[11px]"></i> Friends
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
                      <i class="fa-solid fa-user-plus text-cyan-400 text-[8px]"></i> Invite User Instantly
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
                    <i class="fa-solid fa-chevron-left text-xs sm:text-sm"></i>
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
                    <i class="fa-solid fa-phone"></i>
                  </button>
                  <button id="chat-header-video-btn" title="Start HD Video Call" class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 hover:text-white hover:bg-cyan-600 transition flex items-center justify-center text-xs active:scale-95 cursor-pointer shadow-sm">
                    <i class="fa-solid fa-video"></i>
                  </button>
                  <button id="chat-view-active-profile-btn" title="View Stats & Profile" class="text-[10px] sm:text-[10.5px] text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl transition cursor-pointer shrink-0 shadow-sm flex items-center gap-1 sm:gap-1.5 active:scale-95 font-bold">
                    <i class="fa-solid fa-user-circle text-amber-400 text-xs"></i> <span class="hidden md:inline">Stats</span>
                  </button>
                </div>
              </div>

              <!-- Message Stream -->
              <div id="chat-messages-stream" class="flex-grow overflow-y-auto chat-scrollbar p-3 sm:p-4 space-y-3 sm:space-y-4 flex flex-col justify-end bg-slate-900/10">
                <!-- Message structures rendered here -->
              </div>

              <!-- Typing Indicator -->
              <div id="chat-typing-feedback" class="hidden text-[10px] font-sans italic text-slate-500 bg-slate-950/40 border-t border-slate-900/60 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 font-mono tracking-tight select-none shrink-0 text-left">
                <i class="fa-solid fa-circle-notch animate-spin text-[10px] text-emerald-400"></i> <span id="typing-feedback-username" class="font-bold text-slate-300">@username</span> is typing...
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
                  <button id="chat-voice-send-btn" class="px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-[10px] font-black shadow-md">Send <i class="fa-solid fa-paper-plane text-[9px] ml-1"></i></button>
                </div>
              </div>

              <!-- Rich Message Composer Toolbar (Footer Bar) -->
              <div class="p-2 sm:p-3 border-t border-slate-850 bg-slate-950/80 flex items-center gap-1.5 sm:gap-2 shrink-0 w-full max-w-full overflow-hidden relative">
                
                <!-- Send Gift/Tip Cash Button -->
                <button id="chat-send-gift-btn" title="Send Tip / Cash Gift ৳" class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-950/40 border border-amber-800/50 text-amber-400 hover:bg-amber-600 hover:text-slate-950 transition flex items-center justify-center text-xs sm:text-sm shrink-0 cursor-pointer shadow-md shadow-amber-950/20 active:scale-95">
                  <i class="fa-solid fa-gift text-amber-400"></i>
                </button>

                <!-- Stickers & Emojis Tray Button -->
                <div class="relative shrink-0">
                  <button id="chat-stickers-btn" title="Send VIP Stickers & Emojis" class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-400 hover:bg-indigo-600 hover:text-white transition flex items-center justify-center text-xs sm:text-sm shrink-0 cursor-pointer shadow-md shadow-indigo-950/20 active:scale-95">
                    <i class="fa-solid fa-face-smile text-indigo-400"></i>
                  </button>

                  <!-- Stickers Popover Tray -->
                  <div id="chat-stickers-popover" class="hidden absolute left-0 bottom-11 sm:bottom-12 w-64 sm:w-80 max-w-[calc(100vw-24px)] bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xl z-50 text-left space-y-2 font-sans">
                    <div class="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span class="text-[10px] uppercase font-mono font-black text-amber-400 flex items-center gap-1">
                        <i class="fa-solid fa-crown text-[9px]"></i> VIP Expressive Tray
                      </span>
                      <button id="chat-stickers-close-btn" class="text-slate-500 hover:text-white text-xs"><i class="fa-solid fa-xmark"></i></button>
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
                  <i class="fa-solid fa-microphone text-rose-400"></i>
                </button>

                <!-- Input Field -->
                <input type="text" id="chat-messages-compose-input" placeholder="Type a message..." class="flex-1 min-w-0 bg-slate-950 hover:bg-slate-900 text-slate-100 border border-slate-800 focus:border-emerald-500 rounded-xl sm:rounded-2xl py-2 sm:py-2.5 px-2.5 sm:px-4 text-xs sm:text-sm outline-none placeholder-slate-600 transition duration-150" />
                
                <!-- Send Button -->
                <button id="chat-message-send-btn" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm h-[36px] sm:h-[42px] px-3 sm:px-5 rounded-xl sm:rounded-2xl transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1 sm:gap-1.5 shrink-0">
                  <i class="fa-solid fa-paper-plane text-[10px]"></i>
                  <span class="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>

            <!-- Empty Conversation placeholder -->
            <div class="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2.5 select-none" id="chat-empty-panel">
              <div class="w-16 h-16 rounded-[24px] bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-500 text-xl shadow-inner">
                <i class="fa-solid fa-comments"></i>
              </div>
              <div class="space-y-1 max-w-xs text-center">
                <div class="text-xs sm:text-sm font-bold text-slate-200 font-sans">Select Conversation</div>
                <p class="text-[10px] sm:text-xs leading-relaxed text-slate-500">Choose an active chat thread or check friends tab to establish a encrypted messaging session.</p>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(chatModal);
    }

    // 4. Inject Send Tip / Gift Modal
    if (!document.getElementById("chat-gift-modal")) {
      const giftModal = document.createElement("div");
      giftModal.id = "chat-gift-modal";
      giftModal.className = "fixed inset-0 z-[9998] bg-slate-950/90 backdrop-blur-md hidden flex items-center justify-center p-4 selection:bg-amber-500/10";
      giftModal.innerHTML = `
        <div class="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-left font-sans text-slate-100 relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <i class="fa-solid fa-gift text-sm"></i>
              </div>
              <div>
                <h3 class="text-sm font-black text-white leading-none">Send Cash Gift / Tip</h3>
                <span class="text-[9px] text-amber-400 font-mono">INSTANT_TRANSFER</span>
              </div>
            </div>
            <button id="chat-gift-close-btn" class="text-slate-400 hover:text-white text-sm"><i class="fa-solid fa-xmark"></i></button>
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
            Send Gift Card Now <i class="fa-solid fa-paper-plane ml-1"></i>
          </button>
        </div>
      `;
      document.body.appendChild(giftModal);
    }

    // 5. Inject Call Simulation Overlay Modal
    if (!document.getElementById("chat-call-modal")) {
      const callModal = document.createElement("div");
      callModal.id = "chat-call-modal";
      callModal.className = "fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl hidden flex flex-col items-center justify-between p-6 sm:p-10 text-white font-sans selection:bg-emerald-500/10";
      callModal.innerHTML = `
        <div class="w-full max-w-md flex items-center justify-between text-xs font-mono text-slate-400">
          <span class="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full">
            <i class="fa-solid fa-shield-halved text-[10px]"></i> Encrypted HD Link
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
            <i class="fa-solid fa-microphone-slash"></i>
          </button>

          <button id="chat-call-end-btn" title="End Call" class="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center text-xl shadow-xl shadow-red-600/30 transition active:scale-95 cursor-pointer">
            <i class="fa-solid fa-phone-slash"></i>
          </button>

          <button id="chat-call-speaker-btn" title="Speaker" class="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center text-base transition active:scale-95">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>
      `;
      document.body.appendChild(callModal);
    }

    // 6. Inject dynamic Messages button option inside user profile tab
    const badgeBtn = document.getElementById("profile-badge-request-entry-btn");
    if (badgeBtn && !document.getElementById("profile-messages-btn")) {
      const messagesBtn = document.createElement("button");
      messagesBtn.id = "profile-messages-btn";
      messagesBtn.className = "w-full flex justify-between items-center bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl hover:bg-slate-850/45 transition text-left cursor-pointer";
      messagesBtn.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-comments text-emerald-400 text-xs text-center"></i>
          </div>
          <div>
            <span class="text-xs font-bold text-white block">VIP Messages Hub</span>
            <span class="text-[9px] text-slate-500 block leading-tight mt-0.5">Direct chat, HD calls, stickers & tip gifts</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span id="profile-messages-unread-tag" class="hidden text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full animate-bounce">0 NEW</span>
          <span class="text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-lg font-mono">Open <i class="fa-solid fa-chevron-right text-[8px] pl-0.5"></i></span>
        </div>
      `;
      badgeBtn.parentNode.insertBefore(messagesBtn, badgeBtn.nextSibling);
    }

    // Populate stickers default tab
    this.renderStickersGrid("vip");
  }

  // Bind dynamic interactive clicks and keypress actions
  bindEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeUserProfile();
        this.closeChatCenter();
        this.closeGiftModal();
        this.endCall();
      }
    });

    document.getElementById("profile-detail-close-btn")?.addEventListener("click", () => {
      this.closeUserProfile();
    });

    document.getElementById("profile-detail-add-friend-btn")?.addEventListener("click", () => {
      const modal = document.getElementById("profile-details-modal");
      const targetUsername = modal?.getAttribute("data-target-user");
      if (targetUsername) {
        this.handleFriendAction(targetUsername);
      }
    });

    document.getElementById("profile-detail-message-btn")?.addEventListener("click", () => {
      const modal = document.getElementById("profile-details-modal");
      const targetUsername = modal?.getAttribute("data-target-user");
      if (targetUsername) {
        this.closeUserProfile();
        this.openChatCenter(targetUsername);
      }
    });

    document.getElementById("profile-messages-btn")?.addEventListener("click", () => {
      this.openChatCenter();
    });

    document.getElementById("chat-modal-close-btn")?.addEventListener("click", () => {
      this.closeChatCenter();
    });

    document.getElementById("chat-mobile-back-btn")?.addEventListener("click", () => {
      this.backToList();
    });

    // Navigation subtabs
    document.getElementById("chat-tab-selector-chats")?.addEventListener("click", () => {
      this.switchChatSidebarTab("chats");
    });
    document.getElementById("chat-tab-selector-friends")?.addEventListener("click", () => {
      this.switchChatSidebarTab("friends");
    });

    // Send Message
    document.getElementById("chat-message-send-btn")?.addEventListener("click", () => {
      this.handleSendMessage();
    });

    document.getElementById("chat-messages-compose-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handleSendMessage();
      }
    });

    // Search contacts input
    document.getElementById("chats-search-input")?.addEventListener("input", (e) => {
      this.searchTerm = e.target.value.toLowerCase().trim();
      this.renderChatsConversationsList();
    });

    // Theme selector toggle
    document.getElementById("chat-theme-toggle-btn")?.addEventListener("click", () => {
      const popover = document.getElementById("chat-theme-popover");
      popover?.classList.toggle("hidden");
    });

    document.querySelectorAll(".chat-theme-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const theme = btn.getAttribute("data-theme");
        if (theme) this.setChatTheme(theme);
        document.getElementById("chat-theme-popover")?.classList.add("hidden");
      });
    });

    // Stickers toggle & tab buttons
    document.getElementById("chat-stickers-btn")?.addEventListener("click", () => {
      const popover = document.getElementById("chat-stickers-popover");
      popover?.classList.toggle("hidden");
    });

    document.getElementById("chat-stickers-close-btn")?.addEventListener("click", () => {
      document.getElementById("chat-stickers-popover")?.classList.add("hidden");
    });

    document.querySelectorAll(".sticker-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sticker-tab-btn").forEach(b => {
          b.className = "sticker-tab-btn py-1 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-center";
        });
        btn.className = "sticker-tab-btn py-1 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/40 text-center";
        const tab = btn.getAttribute("data-tab");
        if (tab) this.renderStickersGrid(tab);
      });
    });

    // Send Gift / Tip Modal
    document.getElementById("chat-send-gift-btn")?.addEventListener("click", () => {
      this.openGiftModal();
    });

    document.getElementById("chat-gift-close-btn")?.addEventListener("click", () => {
      this.closeGiftModal();
    });

    document.querySelectorAll(".gift-amount-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".gift-amount-btn").forEach(b => {
          b.className = "gift-amount-btn py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 text-xs font-black";
        });
        btn.className = "gift-amount-btn py-2 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-300 text-xs font-black";
      });
    });

    document.querySelectorAll(".gift-style-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".gift-style-btn").forEach(b => {
          b.className = "gift-style-btn p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:border-amber-500 flex flex-col items-center gap-1";
        });
        btn.className = "gift-style-btn p-2 rounded-xl bg-amber-950/60 border border-amber-500 text-amber-300 flex flex-col items-center gap-1";
      });
    });

    document.getElementById("chat-gift-submit-btn")?.addEventListener("click", () => {
      this.submitSendGift();
    });

    // Voice Note Recording
    document.getElementById("chat-voice-note-btn")?.addEventListener("click", () => {
      this.startVoiceNoteRecording();
    });

    document.getElementById("chat-voice-cancel-btn")?.addEventListener("click", () => {
      this.cancelVoiceNoteRecording();
    });

    document.getElementById("chat-voice-send-btn")?.addEventListener("click", () => {
      this.stopAndSendVoiceNote();
    });

    // Voice & Video Call triggers
    document.getElementById("chat-header-call-btn")?.addEventListener("click", () => {
      this.startCall("voice");
    });

    document.getElementById("chat-header-video-btn")?.addEventListener("click", () => {
      this.startCall("video");
    });

    document.getElementById("chat-call-end-btn")?.addEventListener("click", () => {
      this.endCall();
    });

    document.getElementById("chat-view-active-profile-btn")?.addEventListener("click", () => {
      if (this.activeChatUserId) {
        const targetUser = this.findUserByIdOrUsername(this.activeChatUserId);
        if (targetUser) {
          this.closeChatCenter();
          this.openUserProfile(targetUser.username);
        }
      }
    });

    document.getElementById("quick-add-submit-btn")?.addEventListener("click", () => {
      const input = document.getElementById("quick-add-username-input");
      const userStr = input?.value?.trim();
      if (!userStr) {
        this.app.showToast("Please enter a valid username.", "error");
        return;
      }
      if (input) input.value = "";
      this.handleFriendAction(userStr);
    });

    // Profile click delegation
    document.body.addEventListener("click", (e) => {
      const profileClick = e.target.closest(".com-user-profile-click");
      if (profileClick) {
        e.preventDefault();
        const usernameStr = profileClick.getAttribute("data-username");
        if (usernameStr) {
          const cleanedName = usernameStr.replace("@", "").trim();
          this.openUserProfile(cleanedName);
        }
      }

      // Claim Gift click
      const claimBtn = e.target.closest(".claim-gift-btn");
      if (claimBtn) {
        const msgId = claimBtn.getAttribute("data-msg-id");
        if (msgId) this.claimGift(msgId);
      }
    });
  }

  // Find user or return mock default
  findUserByIdOrUsername(searchToken) {
    if (!searchToken) return null;
    const cleanSearch = searchToken.replace("@", "").trim().toLowerCase();
    
    const found = (this.app.db.users || []).find(u => 
      u.id?.toLowerCase() === cleanSearch || 
      u.username?.toLowerCase() === cleanSearch
    );
    if (found) return found;

    if (cleanSearch === "lottery_pro") {
      return { id: "u1", username: "lottery_pro", email: "pro@lotterywinner.app", loss: 300, profit: 1250, wins: 3, customBadge: "vip", avatarFrame: "royal" };
    } else if (cleanSearch === "lucky_player") {
      return { id: "u2", username: "lucky_player", email: "lucky@quickdraw.net", loss: 120, profit: -45, wins: 1, avatarFrame: "neon" };
    }

    const mockLoss = Math.floor(Math.random() * 80) + 10;
    const mockWins = Math.floor(Math.random() * 3);
    const mockProfit = mockWins > 0 ? (Math.floor(Math.random() * 400) - mockLoss) : -mockLoss;
    
    return {
      id: "usr_" + cleanSearch,
      username: cleanSearch,
      email: cleanSearch + "@winnerlottery.app",
      loss: mockLoss,
      profit: mockProfit,
      wins: mockWins,
      avatarFrame: ["none", "royal", "neon", "ruby", "cosmic"][Math.floor(Math.random() * 5)],
      status: "active"
    };
  }

  // Opens user profile
  openUserProfile(username) {
    if (!username) return;
    const u = this.findUserByIdOrUsername(username);
    if (!u) {
      this.app.showToast("Player details could not be parsed.", "error");
      return;
    }

    const currentLoggedInUser = this.app.currentUser;
    if (!currentLoggedInUser) {
      this.app.showToast("Please sign in to view player profiles.", "error");
      return;
    }

    const modal = document.getElementById("profile-details-modal");
    if (!modal) return;

    modal.setAttribute("data-target-user", u.username);

    const initialSpan = document.getElementById("profile-detail-initials");
    if (initialSpan) {
      initialSpan.innerText = u.username ? u.username[0].toUpperCase() : "?";
    }

    // Overlay Avatar frame & 3D Animation Overlay
    const frameOverlay = document.getElementById("profile-detail-frame-overlay");
    if (frameOverlay) {
      frameOverlay.innerHTML = CustomizerStore.getFrameOverlayHTML(u.avatarFrame || "none");
    }

    const animOverlay = document.getElementById("profile-detail-anim-overlay");
    if (animOverlay) {
      const glow = u.profileGlow || u.profileAnimation || "hologram_3d";
      animOverlay.innerHTML = CustomizerStore.getAnimationOverlayHTML(glow);
    }

    const bannerOverlay = document.getElementById("profile-detail-banner-overlay");
    if (bannerOverlay) {
      CustomizerStore.applyBannerBackground(bannerOverlay, u.profileBanner || "cyber_neon");
    }

    const usernameEl = document.getElementById("profile-detail-username");
    if (usernameEl) usernameEl.innerText = `@${u.username}`;

    const emailEl = document.getElementById("profile-detail-email");
    if (emailEl) {
      let maskedEmail = "no-email@lottery.app";
      if (u.email) {
        const parts = u.email.split("@");
        if (parts.length === 2 && parts[0].length > 1) {
          maskedEmail = parts[0][0] + "xx" + parts[0][parts[0].length - 1] + "@" + parts[1];
        } else {
          maskedEmail = u.email;
        }
      }
      emailEl.innerText = maskedEmail;
    }

    const spent = parseFloat(u.loss) || 0;
    const profit = parseFloat(u.profit) || 0;
    const lotteriesCount = (this.app.db.tickets || []).filter(t => t.userId === u.id).length + (u.wins ? u.wins * 2 : 0);
    const winCounts = (this.app.db.tickets || []).filter(t => t.userId === u.id && t.status === "won").length + (u.wins || 0);

    const lotteryCountEl = document.getElementById("profile-detail-lotteries-count");
    if (lotteryCountEl) lotteryCountEl.innerText = lotteriesCount || Math.floor(spent / 5);

    const winsCountEl = document.getElementById("profile-detail-wins-count");
    if (winsCountEl) winsCountEl.innerText = winCounts;

    const lossEl = document.getElementById("profile-detail-loss");
    if (lossEl) lossEl.innerText = `৳${spent.toFixed(2)}`;

    const profitEl = document.getElementById("profile-detail-profit");
    if (profitEl) {
      profitEl.innerText = `৳${profit >= 0 ? '+' : ''}${profit.toFixed(2)}`;
      profitEl.className = profit >= 0 ? "text-xs font-black text-emerald-400" : "text-xs font-black text-rose-400";
    }

    const badgesContainer = document.getElementById("profile-detail-badges");
    if (badgesContainer) {
      badgesContainer.innerHTML = "";
      let badgesHtml = "";
      
      if (u.customBadge) {
        const badgeMap = {
          vip: { label: "💎 VIP Player", style: "bg-cyan-950/70 text-cyan-400 border-cyan-800/60" },
          moderator: { label: "🛡️ Staff Mod", style: "bg-indigo-950/70 text-indigo-400 border-indigo-800/60" },
          star: { label: "⭐ Elite Star", style: "bg-purple-950/70 text-purple-400 border-purple-800/60" },
          premium: { label: "✨ Premium Member", style: "bg-fuchsia-950/70 text-fuchsia-400 border-fuchsia-800/60" },
          pro: { label: "🔥 Pro Bettor", style: "bg-orange-950/70 text-orange-400 border-orange-800/60" },
          legend: { label: "👑 Royal Legend", style: "bg-rose-950/70 text-rose-400 border-rose-800/60" }
        };
        const conf = badgeMap[u.customBadge];
        if (conf) {
          badgesHtml += `<span class="${conf.style} px-2 py-0.5 rounded-lg text-[8px] font-bold border flex items-center gap-1 shadow-md">${conf.label}</span>`;
        }
      }

      if (winCounts > 0) {
        badgesHtml += `<span class="bg-amber-950/70 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded-lg text-[8px] font-bold flex items-center gap-1 shadow-md"><i class="fa-solid fa-trophy text-amber-500 text-[7px]"></i> Lucky Winner (${winCounts})</span>`;
      }
      
      badgesHtml += `<span class="bg-slate-950 border border-slate-800/85 text-slate-400 px-2 py-0.5 rounded-lg text-[8px] font-mono shadow-sm">🎖️ Active Player</span>`;
      badgesContainer.innerHTML = badgesHtml;
    }

    const addFriendBtn = document.getElementById("profile-detail-add-friend-btn");
    const sendMsgBtn = document.getElementById("profile-detail-message-btn");
    
    if (u.username.toLowerCase() === currentLoggedInUser.username.toLowerCase() || u.id === currentLoggedInUser.id) {
      if (addFriendBtn) addFriendBtn.classList.add("hidden");
      if (sendMsgBtn) sendMsgBtn.classList.add("hidden");
    } else {
      if (addFriendBtn) {
        addFriendBtn.classList.remove("hidden");
        const rel = this.getFriendshipRelation(u.username);
        if (!rel) {
          addFriendBtn.innerHTML = `<i class="fa-solid fa-user-plus text-emerald-400"></i> Add Friend`;
          addFriendBtn.disabled = false;
        } else if (rel.status === "accepted") {
          addFriendBtn.innerHTML = `<i class="fa-solid fa-user-check text-indigo-400"></i> Friends ✓`;
          addFriendBtn.disabled = true;
        } else {
          if (rel.fromId === currentLoggedInUser.id || rel.fromId === currentLoggedInUser.username) {
            addFriendBtn.innerHTML = `<i class="fa-solid fa-clock text-slate-500 animate-pulse"></i> Sent (Pending)`;
            addFriendBtn.disabled = true;
          } else {
            addFriendBtn.innerHTML = `<i class="fa-solid fa-check text-emerald-400 animate-bounce"></i> Accept Invite`;
            addFriendBtn.disabled = false;
          }
        }
      }
      if (sendMsgBtn) sendMsgBtn.classList.remove("hidden");
    }

    modal.classList.remove("hidden");
    const innerCard = modal.querySelector(".active-modal-anim");
    if (innerCard) {
      this.setup3DTiltEffect(innerCard);
      setTimeout(() => {
        innerCard.classList.remove("scale-95", "opacity-0");
        innerCard.classList.add("scale-100", "opacity-100");
      }, 30);
    }
  }

  setup3DTiltEffect(card) {
    if (!card) return;
    let sheen = card.querySelector("#profile-detail-3d-sheen");

    const onMove = (clientX, clientY) => {
      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 16;
      const rotateX = -((y - centerY) / centerY) * 16;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
      card.style.transition = "transform 0.08s ease-out";

      if (sheen) {
        const sheenX = (x / rect.width) * 100;
        const sheenY = (y / rect.height) * 100;
        sheen.style.opacity = "0.9";
        sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.2) 0%, rgba(34,211,238,0.12) 45%, transparent 80%)`;
      }
    };

    const onReset = () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      card.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
      if (sheen) sheen.style.opacity = "0";
    };

    card.onmousemove = (e) => onMove(e.clientX, e.clientY);
    card.onmouseleave = onReset;

    card.ontouchmove = (e) => {
      if (e.touches && e.touches[0]) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    card.ontouchend = onReset;
  }

  closeUserProfile() {
    const modal = document.getElementById("profile-details-modal");
    if (!modal) return;
    const innerCard = modal.querySelector(".active-modal-anim");
    if (innerCard) {
      innerCard.classList.add("scale-95", "opacity-0");
      innerCard.classList.remove("scale-100", "opacity-100");
    }
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 150);
  }

  getFriendshipRelation(targetUsername) {
    if (!this.app.currentUser) return null;
    const clientUser = this.app.currentUser;
    const lookupTarget = targetUsername.toLowerCase();
    const currId = clientUser.id;
    const currName = clientUser.username.toLowerCase();

    return (this.app.db.friendships || []).find(f => {
      const isFromMe = (f.fromId === currId || f.fromId?.toLowerCase() === currName);
      const isToMe = (f.toId === currId || f.toId?.toLowerCase() === currName);
      const isFromTarget = (f.fromId?.toLowerCase() === lookupTarget || f.fromId === targetUsername);
      const isToTarget = (f.toId?.toLowerCase() === lookupTarget || f.toId === targetUsername);

      return (isFromMe && isToTarget) || (isToMe && isFromTarget);
    });
  }

  handleFriendAction(targetUsername) {
    if (!this.app.currentUser) {
      this.app.showToast("Please log in to proceed with social features.", "error");
      return;
    }
    const clientUser = this.app.currentUser;
    const target = this.findUserByIdOrUsername(targetUsername);
    if (!target) {
      this.app.showToast("Target user doesn't exist.", "error");
      return;
    }

    if (target.username.toLowerCase() === clientUser.username.toLowerCase() || target.id === clientUser.id) {
      this.app.showToast("You cannot friend invite yourself.", "info");
      return;
    }

    const rel = this.getFriendshipRelation(target.username);
    if (!rel) {
      const request = {
        id: "rel_" + Math.random().toString(36).substring(2, 10),
        fromId: clientUser.id || clientUser.username,
        fromUsername: clientUser.username,
        toId: target.id || target.username,
        toUsername: target.username,
        status: "pending",
        timestamp: new Date().toISOString()
      };

      if (!this.app.db.friendships) this.app.db.friendships = [];
      this.app.db.friendships.push(request);
      this.app.saveDB();
      this.app.showToast(`Friend invite sent to @${target.username}!`, "success");
      this.openUserProfile(target.username);
    } else if (rel.status === "pending" && (rel.toId === clientUser.id || rel.toId?.toLowerCase() === clientUser.username?.toLowerCase())) {
      rel.status = "accepted";
      const welcomeMsg = {
        id: "msg_" + Math.random().toString(36).substring(2, 10),
        fromId: target.id || target.username,
        toId: clientUser.id || clientUser.username,
        content: `👋 I accepted your invite! Let's compete inside the leaderboards. Best of luck with your ticket draws!`,
        timestamp: new Date().toISOString(),
        status: "unread"
      };
      
      if (!this.app.db.directMessages) this.app.db.directMessages = [];
      this.app.db.directMessages.push(welcomeMsg);
      
      this.app.saveDB();
      this.app.showToast(`Connection established! You are now friends with @${target.username}.`, "success");
      this.openUserProfile(target.username);
    }
    this.updateNotificationBadgeOff();
  }

  // Opens Chat center
  openChatCenter(autoSelectUsername = null) {
    if (!this.app.currentUser) {
      this.app.showToast("Authentication session expired on routing.", "error");
      return;
    }
    const modal = document.getElementById("direct-chat-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    this.switchChatSidebarTab("chats");
    this.renderChatsConversationsList();

    if (autoSelectUsername) {
      const parsedActor = this.findUserByIdOrUsername(autoSelectUsername);
      if (parsedActor) {
        this.selectActiveConversation(parsedActor.id || parsedActor.username);
      }
    }
  }

  closeChatCenter() {
    const modal = document.getElementById("direct-chat-modal");
    if (modal) modal.classList.add("hidden");
    this.updateNotificationBadgeOff();
  }

  switchChatSidebarTab(targetTab) {
    this.activeChatTab = targetTab;
    
    const chatsBtn = document.getElementById("chat-tab-selector-chats");
    const friendsBtn = document.getElementById("chat-tab-selector-friends");
    const chatsPane = document.getElementById("subtab-chats-pane");
    const friendsPane = document.getElementById("subtab-friends-pane");

    if (targetTab === "chats") {
      chatsBtn?.setAttribute("class", "py-2.5 rounded-2xl text-center text-xs font-extrabold cursor-pointer transition bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/15");
      friendsBtn?.setAttribute("class", "py-2.5 rounded-2xl text-center text-xs font-extrabold cursor-pointer transition text-slate-400 hover:text-white");
      chatsPane?.classList.remove("hidden");
      friendsPane?.classList.add("hidden");
      this.renderChatsConversationsList();
    } else {
      friendsBtn?.setAttribute("class", "py-2.5 rounded-2xl text-center text-xs font-extrabold cursor-pointer transition bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/15");
      chatsBtn?.setAttribute("class", "py-2.5 rounded-2xl text-center text-xs font-extrabold cursor-pointer transition text-slate-400 hover:text-white");
      friendsPane?.classList.remove("hidden");
      chatsPane?.classList.add("hidden");
      this.renderFriendsSocialList();
    }
  }

  // Render chat list with support for search term & avatar frame
  renderChatsConversationsList() {
    const chatList = document.getElementById("chats-conversations-list");
    if (!chatList) return;

    chatList.innerHTML = "";
    const currUser = this.app.currentUser;
    const currId = currUser.id;
    const currName = currUser.username.toLowerCase();

    const messages = this.app.db.directMessages || [];
    const participantsSet = new Set();

    messages.forEach(m => {
      const fromLower = m.fromId?.toLowerCase();
      const toLower = m.toId?.toLowerCase();

      if (fromLower === currId?.toLowerCase() || fromLower === currName) {
        participantsSet.add(m.toId);
      }
      if (toLower === currId?.toLowerCase() || toLower === currName) {
        participantsSet.add(m.fromId);
      }
    });

    (this.app.db.friendships || []).forEach(f => {
      if (f.status === "accepted") {
        const fromLower = f.fromId?.toLowerCase();
        const toLower = f.toId?.toLowerCase();

        if (fromLower === currId?.toLowerCase() || fromLower === currName) {
          participantsSet.add(f.toId);
        }
        if (toLower === currId?.toLowerCase() || toLower === currName) {
          participantsSet.add(f.fromId);
        }
      }
    });

    participantsSet.add("lottery_pro");
    participantsSet.add("lucky_player");

    let conversationUsers = Array.from(participantsSet).filter(id => {
      const isMe = (id?.toLowerCase() === currId?.toLowerCase() || id?.toLowerCase() === currName);
      return !isMe;
    });

    if (this.searchTerm) {
      conversationUsers = conversationUsers.filter(userId => {
        const peer = this.findUserByIdOrUsername(userId);
        return peer && peer.username.toLowerCase().includes(this.searchTerm);
      });
    }

    if (conversationUsers.length === 0) {
      chatList.innerHTML = `
        <div class="text-center py-8 text-[10.5px] text-slate-500 italic font-sans px-4">
          No matching chats found. Check Friends Tab or add contacts!
        </div>
      `;
      return;
    }

    conversationUsers.forEach(userId => {
      const peer = this.findUserByIdOrUsername(userId);
      if (!peer) return;

      const peerId = peer.id || peer.username;
      const unreadsCount = messages.filter(m => 
        (m.fromId === peer.id || m.fromId === peer.username) && 
        (m.toId === currUser.id || m.toId === currUser.username) && 
        m.status === "unread"
      ).length;

      const peerMessages = messages.filter(m => 
        ((m.fromId === currUser.id || m.fromId === currUser.username) && (m.toId === peer.id || m.toId === peer.username)) ||
        ((m.fromId === peer.id || m.fromId === peer.username) && (m.toId === currUser.id || m.toId === currUser.username))
      );
      peerMessages.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      let lastMsgText = "No previous communication records.";
      if (peerMessages.length > 0) {
        const lastM = peerMessages[peerMessages.length - 1];
        if (lastM.type === "sticker") lastMsgText = `[Sticker ${lastM.content}]`;
        else if (lastM.type === "gift") lastMsgText = `🎁 Cash Gift ৳${lastM.amount || 100}`;
        else if (lastM.type === "voice") lastMsgText = `🎤 Voice Note (${lastM.duration || 5}s)`;
        else lastMsgText = lastM.content;
        
        if (lastMsgText.length > 28) lastMsgText = lastMsgText.substring(0, 26) + "...";
      }

      const activeStyle = (this.activeChatUserId === peerId) 
        ? "bg-gradient-to-r from-emerald-600/20 to-teal-650/15 border-emerald-500/40 text-white shadow-md shadow-emerald-950/20" 
        : "bg-slate-950/40 border-slate-850/80 text-slate-300 hover:bg-slate-950/80 hover:border-slate-800";
      
      const frameHtml = CustomizerStore.getFrameOverlayHTML(peer.avatarFrame || "none");

      const item = document.createElement("div");
      item.className = `flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition duration-150 transform hover:scale-[1.01] ${activeStyle}`;
      item.innerHTML = `
        <div class="relative shrink-0 select-none w-10 h-10">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-850 border border-slate-800 flex items-center justify-center font-black text-xs uppercase text-slate-200 shadow-md">
            ${peer.username ? peer.username[0] : "?"}
          </div>
          <div class="absolute inset-0 pointer-events-none">${frameHtml}</div>
          <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[3px] border-slate-900 animate-pulse shadow-sm z-30"></span>
        </div>

        <div class="flex-1 min-w-0 text-left">
          <div class="flex justify-between items-center">
            <span class="text-xs font-black truncate text-slate-100">@${peer.username}</span>
            ${unreadsCount > 0 ? `<span class="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 shadow-sm animate-bounce">${unreadsCount}</span>` : ""}
          </div>
          <p class="text-[10px] text-slate-500 truncate mt-1 font-medium leading-none">${lastMsgText}</p>
        </div>
      `;

      item.addEventListener("click", () => {
        this.selectActiveConversation(peerId);
      });

      chatList.appendChild(item);
    });
  }

  renderFriendsSocialList() {
    const reqList = document.getElementById("friends-requests-list");
    const mList = document.getElementById("friends-mutual-list");
    const countBadge = document.getElementById("incoming-requests-count-badge");

    if (!reqList || !mList) return;

    reqList.innerHTML = "";
    mList.innerHTML = "";

    const currUser = this.app.currentUser;
    const currId = currUser.id;
    const currName = currUser.username.toLowerCase();

    const friendships = this.app.db.friendships || [];

    const invites = friendships.filter(f => 
      f.status === "pending" && 
      (f.toId === currId || f.toId?.toLowerCase() === currName)
    );

    const mutuals = friendships.filter(f => 
      f.status === "accepted" && 
      ((f.fromId === currId || f.fromId?.toLowerCase() === currName) || 
       (f.toId === currId || f.toId?.toLowerCase() === currName))
    );

    if (invites.length > 0) {
      if (countBadge) {
        countBadge.innerText = invites.length;
        countBadge.classList.remove("hidden");
      }
    } else {
      if (countBadge) countBadge.classList.add("hidden");
    }

    if (invites.length === 0) {
      reqList.innerHTML = `<div class="text-[10px] text-slate-500 italic font-sans pl-1 select-none py-1">No incoming requests.</div>`;
    } else {
      invites.forEach(inv => {
        const inviterName = inv.fromUsername || inv.fromId;
        const peer = this.findUserByIdOrUsername(inviterName);
        if (!peer) return;

        const card = document.createElement("div");
        card.className = "bg-slate-950/80 p-3 rounded-2xl border border-slate-850 flex items-center justify-between gap-3 shadow-md hover:border-slate-800 transition duration-150";
        card.innerHTML = `
          <div class="min-w-0 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-850 border border-slate-800 flex items-center justify-center font-black text-xs text-white uppercase shrink-0">
              ${peer.username ? peer.username[0] : "P"}
            </div>
            <div class="truncate text-left">
              <span class="text-xs font-black text-slate-200 hover:underline cursor-pointer block com-user-profile-click" data-username="${peer.username}">@${peer.username}</span>
              <span class="text-[8px] text-amber-500 font-mono block tracking-tight">INCOMING_REQ</span>
            </div>
          </div>
          <div class="flex gap-1.5 shrink-0">
            <button class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[10px] font-black h-8 px-3 rounded-xl transition cursor-pointer accept-invite-trigger flex items-center gap-1">
              <i class="fa-solid fa-check text-[9px]"></i> Accept
            </button>
            <button class="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-rose-450 text-[10px] font-bold h-8 px-2.5 rounded-xl transition cursor-pointer reject-invite-trigger">
              Ignore
            </button>
          </div>
        `;

        card.querySelector(".accept-invite-trigger").addEventListener("click", () => {
          this.handleFriendAction(peer.username);
          this.renderFriendsSocialList();
        });

        card.querySelector(".reject-invite-trigger").addEventListener("click", () => {
          const index = friendships.indexOf(inv);
          if (index > -1) friendships.splice(index, 1);
          this.app.saveDB();
          this.app.showToast("Friend request ignored.", "info");
          this.renderFriendsSocialList();
        });

        reqList.appendChild(card);
      });
    }

    const defaultsList = ["lottery_pro", "lucky_player"];
    const addedUsernames = new Set();

    mutuals.forEach(f => {
      const sender = f.fromUsername || f.fromId;
      const receiver = f.toUsername || f.toId;
      const peerName = (sender.toLowerCase() === currName || f.fromId === currId) ? receiver : sender;
      addedUsernames.add(peerName.toLowerCase());
    });

    defaultsList.forEach(d => addedUsernames.add(d.toLowerCase()));
    const uniqueFriends = Array.from(addedUsernames).filter(n => n !== currName && n !== currId?.toLowerCase());

    uniqueFriends.forEach(fn => {
      const peer = this.findUserByIdOrUsername(fn);
      if (!peer) return;

      const card = document.createElement("div");
      card.className = "bg-slate-950/40 border border-slate-850/80 p-3 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-950/80 hover:border-slate-800 transition shadow-sm";
      card.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0 text-left">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-850 border border-slate-800 flex items-center justify-center font-bold text-xs text-slate-350 uppercase shrink-0">
            ${peer.username ? peer.username[0] : "P"}
          </div>
          <div class="min-w-0">
            <span class="text-xs font-black text-slate-100 hover:underline cursor-pointer truncate block com-user-profile-click" data-username="${peer.username}">@${peer.username}</span>
            <span class="text-[8px] text-emerald-400 block mt-0.5 tracking-wider font-mono">STABLE_CONNECTION</span>
          </div>
        </div>
        <button class="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 hover:from-emerald-600 hover:to-teal-650/40 text-emerald-400 hover:text-white border border-emerald-950 text-xs font-black h-8 px-3.5 rounded-xl active:scale-95 transition cursor-pointer open-chat-direct-trigger flex items-center gap-1.5 shrink-0">
          <i class="fa-solid fa-comment-dots text-[10px]"></i> Chat
        </button>
      `;

      card.querySelector(".open-chat-direct-trigger").addEventListener("click", () => {
        this.switchChatSidebarTab("chats");
        this.selectActiveConversation(peer.id || peer.username);
      });

      mList.appendChild(card);
    });
  }

  selectActiveConversation(userId) {
    this.activeChatUserId = userId;
    
    const emptyPanel = document.getElementById("chat-empty-panel");
    if (emptyPanel) emptyPanel.classList.add("hidden");

    const detailPane = document.getElementById("chat-detail-pane");
    if (detailPane) {
      detailPane.classList.remove("hidden", "sm:flex");
      detailPane.classList.add("flex", "w-full", "sm:w-auto", "sm:flex-1");
    }

    const sidebarPane = document.getElementById("chat-sidebar-pane");
    if (sidebarPane) {
      sidebarPane.classList.add("hidden");
      sidebarPane.classList.add("sm:flex");
    }

    const mainHeader = document.getElementById("chat-main-header");
    if (mainHeader) {
      mainHeader.classList.add("hidden");
      mainHeader.classList.remove("flex");
      mainHeader.classList.add("sm:flex");
    }

    this.renderChatsConversationsList();

    const peer = this.findUserByIdOrUsername(userId);
    if (!peer) return;

    const avatarInit = document.getElementById("active-user-avatar-initial");
    if (avatarInit) avatarInit.innerText = peer.username ? peer.username[0].toUpperCase() : "?";

    const avatarFrame = document.getElementById("active-user-avatar-frame");
    if (avatarFrame) {
      avatarFrame.innerHTML = CustomizerStore.getFrameOverlayHTML(peer.avatarFrame || "none");
    }

    const headerName = document.getElementById("active-user-header-username");
    if (headerName) headerName.innerText = `@${peer.username}`;

    const currUser = this.app.currentUser;
    (this.app.db.directMessages || []).forEach(m => {
      const isFromPeer = (m.fromId === peer.id || m.fromId === peer.username);
      const isToMe = (m.toId === currUser.id || m.toId === currUser.username);
      if (isFromPeer && isToMe) {
        m.status = "read";
      }
    });
    this.app.saveDB();

    this.renderHeaderBadges(peer);
    this.renderMessageStreams();
    this.updateNotificationBadgeOff();
  }

  backToList() {
    this.activeChatUserId = null;

    const detailPane = document.getElementById("chat-detail-pane");
    if (detailPane) {
      detailPane.classList.add("hidden");
      detailPane.classList.remove("flex", "w-full", "sm:w-auto", "sm:flex-1");
      detailPane.classList.add("sm:flex");
    }

    const emptyPanel = document.getElementById("chat-empty-panel");
    if (emptyPanel) emptyPanel.classList.remove("hidden");

    const sidebarPane = document.getElementById("chat-sidebar-pane");
    if (sidebarPane) sidebarPane.classList.remove("hidden");

    const mainHeader = document.getElementById("chat-main-header");
    if (mainHeader) {
      mainHeader.classList.remove("hidden");
      mainHeader.classList.add("flex");
    }

    this.renderChatsConversationsList();
  }

  renderHeaderBadges(user) {
    const badgeBar = document.getElementById("active-user-header-badges");
    if (!badgeBar) return;

    badgeBar.innerHTML = "";
    
    const winCounts = (this.app.db.tickets || []).filter(t => t.userId === user.id && t.status === "won").length + (user.wins || 0);

    let badgesHtml = "";

    if (user.customBadge) {
      const badgeMap = {
        vip: "💎 VIP",
        moderator: "🛡️ Staff",
        star: "⭐ Star",
        premium: "✨ Prem",
        pro: "🔥 Pro",
        legend: "👑 Royal"
      };
      if (badgeMap[user.customBadge]) {
        badgesHtml += `<span class="bg-indigo-950 text-indigo-400 border border-indigo-900/35 px-1 py-0.2 rounded text-[7px] font-bold">${badgeMap[user.customBadge]}</span> `;
      }
    }

    if (winCounts > 0) {
      badgesHtml += `<span class="bg-amber-950 text-amber-500 border border-amber-900/35 px-1 py-0.2 rounded text-[7px] font-bold">🏆 Winner</span> `;
    }

    badgesHtml += `<span class="bg-slate-950 text-slate-500 border border-slate-900/80 px-1 py-0.2 rounded text-[7px] font-mono">Player</span>`;
    badgeBar.innerHTML = badgesHtml;
  }

  // Set Messenger background theme
  setChatTheme(themeKey) {
    this.activeTheme = themeKey;
    const detailPane = document.getElementById("chat-detail-pane");
    if (!detailPane) return;

    const themes = {
      cosmic: "bg-gradient-to-b from-slate-950 via-slate-900 to-purple-950/20",
      royal: "bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/30",
      neon: "bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/30",
      ruby: "bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950/30",
      dragon: "bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/30",
      sakura: "bg-gradient-to-b from-slate-950 via-slate-900 to-pink-950/30"
    };

    detailPane.className = `hidden sm:flex flex-grow flex-col overflow-hidden relative ${themes[themeKey] || themes.cosmic}`;
    this.renderMessageStreams();
    this.app.showToast(`Applied ${themeKey.toUpperCase()} VIP Chat Theme`, "success");
  }

  // Render Stickers in popover drawer
  renderStickersGrid(category) {
    const grid = document.getElementById("stickers-grid-container");
    if (!grid) return;

    grid.innerHTML = "";

    const stickerPacks = {
      vip: [
        { name: "Crown", icon: "👑" },
        { name: "Diamond", icon: "💎" },
        { name: "Fire", icon: "🔥" },
        { name: "Trophy", icon: "🏆" },
        { name: "Star", icon: "⭐" },
        { name: "Shield", icon: "🛡️" },
        { name: "Rocket", icon: "🚀" },
        { name: "Gem", icon: "🔮" }
      ],
      luck: [
        { name: "Jackpot", icon: "🎰" },
        { name: "777", icon: "🎯" },
        { name: "Clover", icon: "🍀" },
        { name: "Money Bag", icon: "💰" },
        { name: "Cash Stack", icon: "💵" },
        { name: "Fortune Wheel", icon: "🎡" },
        { name: "Gold Coins", icon: "🪙" },
        { name: "Gift Box", icon: "🎁" }
      ],
      emojis: [
        { name: "Love", icon: "❤️" },
        { name: "Fire", icon: "🔥" },
        { name: "Laugh", icon: "😂" },
        { name: "Thumbs Up", icon: "👍" },
        { name: "Party", icon: "🎉" },
        { name: "Cool", icon: "😎" },
        { name: "Kiss", icon: "😘" },
        { name: "Sparkles", icon: "✨" }
      ],
      phrases: [
        { name: "Good Luck!", text: "Good luck on your drawings today! 🍀" },
        { name: "Let's Win Big!", text: "Let's win big in the Jackpot Pool! 💰" },
        { name: "VIP Status", text: "VIP Status Activated 👑" },
        { name: "Congrats!", text: "Huge congratulations on your win! 🎉" }
      ]
    };

    const items = stickerPacks[category] || stickerPacks.vip;

    items.forEach(item => {
      const btn = document.createElement("button");
      if (category === "phrases") {
        btn.className = "col-span-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left text-[10px] text-slate-200 font-bold transition hover:border-amber-500/60";
        btn.innerText = item.text;
        btn.addEventListener("click", () => {
          const input = document.getElementById("chat-messages-compose-input");
          if (input) input.value = item.text;
          document.getElementById("chat-stickers-popover")?.classList.add("hidden");
        });
      } else {
        btn.className = "p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-2xl hover:scale-110 transition flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/60 shadow-sm";
        btn.innerHTML = `<span>${item.icon}</span><span class="text-[8px] text-slate-500 font-mono mt-0.5">${item.name}</span>`;
        btn.addEventListener("click", () => {
          this.sendSpecialMessage({ type: "sticker", content: item.icon, name: item.name });
          document.getElementById("chat-stickers-popover")?.classList.add("hidden");
        });
      }
      grid.appendChild(btn);
    });
  }

  // Open & submit Cash Tip / Gift Modal
  openGiftModal() {
    if (!this.activeChatUserId) {
      this.app.showToast("Please select a recipient first.", "error");
      return;
    }
    const modal = document.getElementById("chat-gift-modal");
    if (modal) modal.classList.remove("hidden");
  }

  closeGiftModal() {
    const modal = document.getElementById("chat-gift-modal");
    if (modal) modal.classList.add("hidden");
  }

  submitSendGift() {
    if (!this.activeChatUserId) return;
    const currUser = this.app.currentUser;
    const activeAmountBtn = document.querySelector(".gift-amount-btn.bg-amber-500\\/20");
    const amount = parseInt(activeAmountBtn?.getAttribute("data-amount") || "100");

    const activeStyleBtn = document.querySelector(".gift-style-btn.bg-amber-950\\/60");
    const style = activeStyleBtn?.getAttribute("data-style") || "gold";

    const noteInput = document.getElementById("chat-gift-note-input");
    const note = noteInput?.value?.trim() || "Best of luck with your drawings! 🍀";

    if ((currUser.balance || 0) < amount) {
      this.app.showToast(`Insufficient balance (Need ৳${amount}). Please deposit funds.`, "error");
      return;
    }

    // Deduct balance
    currUser.balance = (currUser.balance || 0) - amount;
    this.app.saveDB();
    if (this.app.updateHeaderBalanceUI) this.app.updateHeaderBalanceUI();

    this.sendSpecialMessage({
      type: "gift",
      amount: amount,
      style: style,
      note: note,
      claimed: false,
      content: `🎁 Cash Gift Card ৳${amount}`
    });

    this.closeGiftModal();
    this.app.showToast(`Sent ৳${amount} Cash Gift Card!`, "success");
  }

  // Claim gift card action
  claimGift(msgId) {
    const messages = this.app.db.directMessages || [];
    const msg = messages.find(m => m.id === msgId);
    if (!msg || msg.claimed) {
      this.app.showToast("This gift card has already been claimed or expired.", "info");
      return;
    }

    msg.claimed = true;
    const currUser = this.app.currentUser;
    currUser.balance = (currUser.balance || 0) + (msg.amount || 100);
    this.app.saveDB();
    if (this.app.updateHeaderBalanceUI) this.app.updateHeaderBalanceUI();

    this.app.showToast(`🎉 Congratulations! Claimed ৳${msg.amount || 100} Cash Gift to your wallet!`, "success");
    this.renderMessageStreams();
  }

  // Voice Note Recording
  startVoiceNoteRecording() {
    this.recordingVoice = true;
    this.voiceRecordSeconds = 0;
    const recordingBar = document.getElementById("chat-voice-recording-bar");
    const timerLabel = document.getElementById("chat-voice-record-timer");
    if (recordingBar) recordingBar.classList.remove("hidden");

    if (this.voiceRecordTimer) clearInterval(this.voiceRecordTimer);
    this.voiceRecordTimer = setInterval(() => {
      this.voiceRecordSeconds++;
      if (timerLabel) {
        const secs = this.voiceRecordSeconds.toString().padStart(2, '0');
        timerLabel.innerText = `00:${secs}`;
      }
    }, 1000);
  }

  cancelVoiceNoteRecording() {
    this.recordingVoice = false;
    if (this.voiceRecordTimer) clearInterval(this.voiceRecordTimer);
    const recordingBar = document.getElementById("chat-voice-recording-bar");
    if (recordingBar) recordingBar.classList.add("hidden");
  }

  stopAndSendVoiceNote() {
    const duration = Math.max(2, this.voiceRecordSeconds);
    this.cancelVoiceNoteRecording();

    this.sendSpecialMessage({
      type: "voice",
      duration: duration,
      content: `🎤 Voice Note (${duration}s)`
    });
    this.app.showToast("Voice Note sent!", "success");
  }

  // Start Voice or Video Call Simulation
  startCall(callType) {
    if (!this.activeChatUserId) return;
    const peer = this.findUserByIdOrUsername(this.activeChatUserId);
    if (!peer) return;

    this.activeCall = { peer, callType, seconds: 0 };
    const modal = document.getElementById("chat-call-modal");
    const peerName = document.getElementById("chat-call-peer-username");
    const callTimer = document.getElementById("chat-call-timer");
    const statusLabel = document.getElementById("chat-call-status-label");
    const avatarInit = document.getElementById("chat-call-avatar-initial");
    const avatarFrame = document.getElementById("chat-call-avatar-frame");

    if (peerName) peerName.innerText = `@${peer.username}`;
    if (avatarInit) avatarInit.innerText = peer.username ? peer.username[0].toUpperCase() : "?";
    if (avatarFrame) avatarFrame.innerHTML = CustomizerStore.getFrameOverlayHTML(peer.avatarFrame || "none");

    if (statusLabel) statusLabel.innerText = `${callType.toUpperCase()} Calling...`;
    if (callTimer) callTimer.innerText = "Connecting...";

    modal?.classList.remove("hidden");

    // Audio connect tone simulation
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch(e) {}
    }

    // Connect call after 2.5 seconds
    setTimeout(() => {
      if (!this.activeCall) return;
      if (statusLabel) statusLabel.innerText = `Connected (${callType.toUpperCase()})`;
      
      this.callSeconds = 0;
      if (this.callTimer) clearInterval(this.callTimer);
      this.callTimer = setInterval(() => {
        this.callSeconds++;
        const mins = Math.floor(this.callSeconds / 60).toString().padStart(2, '0');
        const secs = (this.callSeconds % 60).toString().padStart(2, '0');
        if (callTimer) callTimer.innerText = `${mins}:${secs}`;
      }, 1000);
    }, 2200);
  }

  endCall() {
    if (this.callTimer) clearInterval(this.callTimer);
    const modal = document.getElementById("chat-call-modal");
    modal?.classList.add("hidden");

    if (this.activeCall && this.callSeconds > 0) {
      this.sendSpecialMessage({
        type: "text",
        content: `📞 ${this.activeCall.callType.toUpperCase()} Call ended (${Math.floor(this.callSeconds / 60)}m ${this.callSeconds % 60}s)`
      });
    }
    this.activeCall = null;
    this.callSeconds = 0;
  }

  // Renders message exchange transcripts with support for theme, stickers, gifts, and voice
  renderMessageStreams() {
    const stream = document.getElementById("chat-messages-stream");
    if (!stream) return;

    stream.innerHTML = "";
    const peer = this.findUserByIdOrUsername(this.activeChatUserId);
    if (!peer) return;

    const currUser = this.app.currentUser;
    const messages = this.app.db.directMessages || [];

    const thread = messages.filter(m => 
      ((m.fromId === currUser.id || m.fromId === currUser.username) && (m.toId === peer.id || m.toId === peer.username)) ||
      ((m.fromId === peer.id || m.fromId === peer.username) && (m.toId === currUser.id || m.toId === currUser.username))
    );

    thread.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (thread.length === 0) {
      stream.innerHTML = `
        <div class="text-center py-10 opacity-70 font-sans space-y-2 my-auto select-none">
          <div class="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mx-auto text-lg shadow-lg animate-bounce">
            <i class="fa-solid fa-lock"></i>
          </div>
          <span class="text-xs font-black text-slate-300 block">End-to-End Encrypted Tunnel Active</span>
          <p class="text-[9.5px] max-w-[220px] mx-auto leading-normal text-slate-500">Secure message node connected. Say hello, send a voice note or tip a lucky gift card to @${peer.username}!</p>
        </div>
      `;
      return;
    }

    const themeBubbleStyle = {
      cosmic: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
      royal: "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20",
      neon: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20",
      ruby: "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20",
      dragon: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20",
      sakura: "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20"
    }[this.activeTheme] || "bg-gradient-to-r from-emerald-600 to-teal-600 text-white";

    thread.forEach(msg => {
      const isMe = (msg.fromId === currUser.id || msg.fromId === currUser.username);
      const alignClass = isMe ? "self-end items-end" : "self-start items-start";
      const bubbleClass = isMe 
        ? `${themeBubbleStyle} rounded-t-2xl rounded-bl-2xl shadow-md border border-white/10` 
        : "bg-slate-900 border border-slate-805 text-slate-100 rounded-t-2xl rounded-br-2xl shadow-sm";

      const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let bodyHtml = "";

      if (msg.type === "sticker") {
        bodyHtml = `
          <div class="p-3 bg-slate-950/80 border border-amber-500/40 rounded-2xl flex flex-col items-center gap-1 shadow-lg animate-sticker-pop">
            <span class="text-4xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">${msg.content}</span>
            <span class="text-[8px] text-amber-400 font-mono uppercase font-black tracking-widest">${msg.name || 'VIP Sticker'}</span>
          </div>
        `;
      } else if (msg.type === "gift") {
        const isClaimed = msg.claimed;
        bodyHtml = `
          <div class="p-3.5 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-2xl space-y-2 text-left max-w-xs shadow-xl gift-card-shine">
            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase font-mono font-black text-amber-400 flex items-center gap-1">
                <i class="fa-solid fa-gift"></i> VIP Cash Gift
              </span>
              <span class="text-xs font-black text-amber-300">৳${msg.amount || 100}</span>
            </div>
            <p class="text-xs text-slate-200 font-sans italic">${msg.note || 'Best of luck!'}</p>
            
            ${!isMe ? `
              <button class="claim-gift-btn w-full py-1.5 px-3 rounded-xl font-black text-xs transition cursor-pointer ${isClaimed ? 'bg-slate-900 text-slate-500 border border-slate-800' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 hover:scale-[1.02]'}" data-msg-id="${msg.id}" ${isClaimed ? 'disabled' : ''}>
                ${isClaimed ? 'Claimed ✓' : 'Claim ৳' + (msg.amount || 100) + ' Gift 🎉'}
              </button>
            ` : `
              <span class="block text-[8px] text-amber-400 font-mono text-right font-bold">${isClaimed ? 'Claimed by recipient ✓' : 'Sent Gift Card'}</span>
            `}
          </div>
        `;
      } else if (msg.type === "voice") {
        bodyHtml = `
          <div class="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-md w-56">
            <button class="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow">
              <i class="fa-solid fa-play ml-0.5"></i>
            </button>
            <div class="flex-1 space-y-1">
              <div class="flex items-end gap-1 h-4">
                <span class="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
                <span class="w-0.5 h-4 bg-teal-400 rounded-full"></span>
                <span class="w-0.5 h-2 bg-emerald-400 rounded-full"></span>
                <span class="w-0.5 h-4 bg-cyan-400 rounded-full"></span>
                <span class="w-0.5 h-3 bg-teal-400 rounded-full"></span>
                <span class="w-0.5 h-2 bg-emerald-400 rounded-full"></span>
              </div>
              <div class="flex justify-between text-[8px] font-mono text-slate-400">
                <span>00:00</span>
                <span>00:${(msg.duration || 5).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        `;
      } else {
        bodyHtml = `
          <div class="px-3.5 py-2 text-xs leading-normal font-sans whitespace-pre-wrap select-text ${bubbleClass}">
            ${msg.content}
          </div>
        `;
      }

      const msgDiv = document.createElement("div");
      msgDiv.className = `flex flex-col max-w-[85%] sm:max-w-[75%] ${alignClass} space-y-0.5 text-left`;
      msgDiv.innerHTML = `
        ${!isMe ? `<span class="text-[7.5px] font-bold text-slate-500 font-mono tracking-wide pl-1.5 select-none">@${peer.username}</span>` : ""}
        
        ${bodyHtml}

        <div class="flex items-center gap-1 text-[7.5px] font-mono text-slate-600 px-1 select-none">
          <span>${timeStr}</span>
          ${isMe ? `<i class="fa-solid fa-check-double text-[7px] ${msg.status === "read" ? "text-emerald-400" : "text-slate-600"}"></i>` : ""}
        </div>
      `;

      stream.appendChild(msgDiv);
    });

    setTimeout(() => {
      stream.scrollTop = stream.scrollHeight;
    }, 40);
  }

  // Push special structured messages (stickers, gifts, voice)
  sendSpecialMessage(msgData) {
    if (!this.activeChatUserId) return;
    const currUser = this.app.currentUser;
    const peer = this.findUserByIdOrUsername(this.activeChatUserId);
    if (!peer) return;

    const newMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 10),
      fromId: currUser.id || currUser.username,
      toId: peer.id || peer.username,
      timestamp: new Date().toISOString(),
      status: "unread",
      ...msgData
    };

    if (!this.app.db.directMessages) this.app.db.directMessages = [];
    this.app.db.directMessages.push(newMessage);
    this.app.saveDB();

    this.renderMessageStreams();
    this.renderChatsConversationsList();
    this.triggerMockResponder(peer);
  }

  handleSendMessage() {
    const input = document.getElementById("chat-messages-compose-input");
    const content = input?.value?.trim();
    if (!content) return;

    if (!this.activeChatUserId) {
      this.app.showToast("Conversation connection expired. Please select a peer node.", "error");
      return;
    }

    const currUser = this.app.currentUser;
    const peer = this.findUserByIdOrUsername(this.activeChatUserId);
    if (!peer) return;

    this.sendSpecialMessage({
      type: "text",
      content: content
    });

    if (input) input.value = "";
    
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(650, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } catch(e) {}
    }
  }

  triggerMockResponder(senderPeer) {
    const peerId = senderPeer.id || senderPeer.username;
    
    if (this.automatedTimers[peerId]) {
      clearTimeout(this.automatedTimers[peerId]);
    }

    const typingIndicator = document.getElementById("chat-typing-feedback");
    const indicatorUser = document.getElementById("typing-feedback-username");

    this.automatedTimers[peerId] = setTimeout(() => {
      if (indicatorUser) indicatorUser.innerText = `@${senderPeer.username}`;
      typingIndicator?.classList.remove("hidden");

      const stream = document.getElementById("chat-messages-stream");
      if (stream) stream.scrollTop = stream.scrollHeight;

      this.automatedTimers[peerId] = setTimeout(() => {
        typingIndicator?.classList.add("hidden");

        const repliesPool = [
          "Hey player! Checking out some pool combinations. Best of luck in the upcoming Hourly Drawings!",
          "Yes! I am actively participating. Let me know if you need to double check any promo ticket codes.",
          "Direct secure messages are completely loaded. It's fully functional!",
          "Thanks for the support. May major luck be with your drawings!",
          "Awesome. Did you take a lucky spin on the wheel of fortune today?"
        ];

        let randomReplyText = repliesPool[Math.floor(Math.random() * repliesPool.length)];

        if (senderPeer.username === "lottery_pro") {
          const proAnswers = [
            "Hey! Active VIP computations are online. How can I assist with your ticket strategy?",
            "Make sure to keep a close eye on the Jackpot Pools. The payouts have reached massive figures!",
            "I highly recommend regular deposits. It keeps the transaction volume steady.",
            "You can request premium Star or Vip badges using the Request Badges section in your tab!"
          ];
          randomReplyText = proAnswers[Math.floor(Math.random() * proAnswers.length)];
        } else if (senderPeer.username === "lucky_player") {
          const luckyAnswers = [
            "Hey yo! Just loaded some credits. Let's hit the community draws!",
            "I actually won a minor prize yesterday. Sending you heaps of good energy!",
            "Did you try sending a friend invitation using your referral link yet?"
          ];
          randomReplyText = luckyAnswers[Math.floor(Math.random() * luckyAnswers.length)];
        }

        const responderMessage = {
          id: "msg_" + Math.random().toString(36).substring(2, 10),
          fromId: senderPeer.id || senderPeer.username,
          toId: this.app.currentUser.id || this.app.currentUser.username,
          type: "text",
          content: randomReplyText,
          timestamp: new Date().toISOString(),
          status: this.activeChatUserId === peerId ? "read" : "unread"
        };

        this.app.db.directMessages.push(responderMessage);
        this.app.saveDB();

        if (this.activeChatUserId === peerId) {
          this.renderMessageStreams();
        }
        this.renderChatsConversationsList();
        this.updateNotificationBadgeOff();
      }, 1400);

    }, 850);
  }

  updateNotificationBadgeOff() {
    if (!this.app.currentUser) return;
    const clientUser = this.app.currentUser;
    const currId = clientUser.id;
    const currName = clientUser.username.toLowerCase();

    const unreadMessages = (this.app.db.directMessages || []).filter(m => 
      (m.toId === currId || m.toId?.toLowerCase() === currName) && 
      m.status === "unread"
    ).length;

    const pendingInvites = (this.app.db.friendships || []).filter(f => 
      f.status === "pending" && 
      (f.toId === currId || f.toId?.toLowerCase() === currName)
    ).length;

    const totalUnreadSocials = unreadMessages + pendingInvites;

    const unreadTag = document.getElementById("profile-messages-unread-tag");
    if (unreadTag) {
      if (totalUnreadSocials > 0) {
        unreadTag.innerText = `${totalUnreadSocials} NEW`;
        unreadTag.classList.remove("hidden");
      } else {
        unreadTag.classList.add("hidden");
      }
    }

    const sidebarBadge = document.getElementById("sidebar-messenger-badge");
    if (sidebarBadge) {
      if (totalUnreadSocials > 0) {
        sidebarBadge.innerText = totalUnreadSocials;
        sidebarBadge.classList.remove("hidden");
      } else {
        sidebarBadge.classList.add("hidden");
      }
    }
  }
}
