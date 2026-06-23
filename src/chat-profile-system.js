// ==========================================
// CHAT & PROFILE INTERACTION SYSTEM
// ==========================================

export class ChatProfileSystem {
  constructor(app) {
    this.app = app;
    this.activeChatUserId = null;
    this.activeChatTab = "chats"; // chats or friends
    this.automatedTimers = {};

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

  // Inject beautiful dark modals into the index.html page dynamically
  initUI() {
    // 1. Check & Inject Styles for Scrollbar & Glow elements
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
      `;
      document.head.appendChild(styleEl);
    }

    // 2. Inject Profile details modal
    if (!document.getElementById("profile-details-modal")) {
      const modal = document.createElement("div");
      modal.id = "profile-details-modal";
      modal.className = "fixed inset-0 z-[9990] bg-slate-950/90 backdrop-blur-md hidden flex items-center justify-center p-4 selection:bg-rose-500/10 transition-all duration-300";
      modal.innerHTML = `
        <div class="bg-slate-900 border border-slate-800/80 rounded-[32px] max-w-sm w-full shadow-2xl relative text-left font-sans text-slate-100 transition-all duration-300 transform scale-95 opacity-0 active-modal-anim overflow-hidden">
          
          <!-- Colored Accent Header Card Background -->
          <div class="h-28 bg-gradient-to-br from-indigo-950 via-slate-900 to-pink-950/30 relative">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>
            
            <!-- Beautiful subtle cyber network lines decoration -->
            <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]"></div>

            <!-- Absolute Top Left Badges or Titles -->
            <div class="absolute top-4 left-5">
              <span class="text-[9px] bg-slate-950/80 text-emerald-400 border border-emerald-950 px-2.5 py-0.5 rounded-full font-bold select-none flex items-center gap-1 backdrop-blur-sm shadow-sm">
                <i class="fa-solid fa-shield-halved text-[8px]"></i> Verified Node
              </span>
            </div>

            <!-- Absolute Close Button -->
            <button id="profile-detail-close-btn" class="absolute top-4 right-4 text-slate-400 hover:text-white transition w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer z-20 shadow-md">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          <div class="px-6 pb-6 pt-0 relative space-y-5">
            <!-- Adjusted Avatar overlapping the header banner -->
            <div class="flex flex-col items-center -mt-12 space-y-3">
              <div id="profile-detail-avatar-container" class="relative w-22 h-22 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 p-1.5 rounded-full shadow-2xl shadow-rose-500/10 select-none">
                <div class="w-full h-full bg-slate-950 rounded-full flex items-center justify-center border-2 border-slate-950 overflow-hidden">
                  <span id="profile-detail-initials" class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 font-display">U</span>
                </div>
                <!-- Dynamic active/online ring element decoration -->
                <span class="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3.5px] border-slate-900 animate-pulse shadow-md"></span>
              </div>
              
              <div class="text-center space-y-1">
                <div class="flex items-center justify-center gap-1.5">
                  <h3 id="profile-detail-username" class="text-lg font-black text-white leading-none font-sans">@username</h3>
                  <!-- Small status icon -->
                  <i class="fa-solid fa-circle-check text-cyan-400 text-xs shadow-sm shadow-cyan-400/20"></i>
                </div>
                <p id="profile-detail-email" class="text-[10px] text-slate-500 font-mono tracking-tight">user@winnerlottery.app</p>
              </div>

              <!-- Reputation Badge list -->
              <div id="profile-detail-badges" class="flex flex-wrap justify-center gap-1.5 pt-0.5 select-none w-full max-h-16 overflow-y-auto">
                <span class="bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 px-2.5 py-0.5 rounded-full text-[9px] font-semibold">Active Player</span>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-slate-800/80 my-1"></div>

            <!-- Statistics Grid Section -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between pl-1">
                <h4 class="text-[9.5px] uppercase tracking-widest text-slate-400 font-mono font-black flex items-center gap-1.5">
                  <i class="fa-solid fa-chart-simple text-blue-400 text-[8px]"></i> Performance Stats
                </h4>
                <span class="text-[8.5px] text-slate-600 font-mono select-none">Updated Realtime</span>
              </div>
              
              <!-- 2x2 Bento grid cards -->
              <div class="grid grid-cols-2 gap-2.5 text-xs">
                
                <!-- ENTRIES CARD -->
                <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Tickets</span>
                    <i class="fa-solid fa-ticket text-slate-600 text-[10px]"></i>
                  </div>
                  <span id="profile-detail-lotteries-count" class="block text-base font-black text-slate-200">0</span>
                </div>

                <!-- WINS CARD -->
                <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Wins</span>
                    <i class="fa-solid fa-trophy text-amber-500/80 text-[10px]"></i>
                  </div>
                  <span id="profile-detail-wins-count" class="block text-base font-black text-amber-400 leading-none">0</span>
                </div>

                <!-- SPENT CARD -->
                <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Loss / Spent</span>
                    <i class="fa-solid fa-wallet text-rose-500/80 text-[10px]"></i>
                  </div>
                  <span id="profile-detail-loss" class="block text-sm font-extrabold text-rose-405 leading-none">৳0.00</span>
                </div>

                <!-- EARNINGS CARD -->
                <div class="bg-slate-950/60 hover:bg-slate-950 hover:border-slate-805/80 border border-slate-900 p-3 rounded-2xl space-y-1 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-[8.5px] font-mono uppercase tracking-wider text-slate-500">Net Profit</span>
                    <i class="fa-solid fa-money-bill-trend-up text-emerald-500/80 text-[10px]"></i>
                  </div>
                  <span id="profile-detail-profit" class="block text-sm font-extrabold text-emerald-405 leading-none">৳0.00</span>
                </div>

              </div>
            </div>

            <!-- Actions Buttons Panel -->
            <div class="grid grid-cols-2 gap-3 pt-1">
              <button id="profile-detail-add-friend-btn" class="w-full bg-slate-950 hover:bg-slate-850 hover:border-slate-700/85 border border-slate-800 text-white font-bold text-xs h-[44px] px-3 rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-md">
                <i class="fa-solid fa-user-plus text-emerald-450"></i> Add Friend
              </button>
              <button id="profile-detail-message-btn" class="w-full bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-600 hover:to-rose-550 text-white font-extrabold text-xs h-[44px] px-3 rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-lg shadow-rose-600/15">
                <i class="fa-solid fa-feather"></i> Message
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // 3. Inject Chat Hub modal
    if (!document.getElementById("direct-chat-modal")) {
      const chatModal = document.createElement("div");
      chatModal.id = "direct-chat-modal";
      chatModal.className = "fixed inset-0 z-[9995] bg-slate-950/95 backdrop-blur-lg hidden flex items-center justify-center p-0 sm:p-4 selection:bg-emerald-500/10";
      chatModal.innerHTML = `
        <div class="bg-slate-900 border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl w-full max-w-4xl h-full sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl font-sans relative">
          <!-- Top Chat Header -->
          <div id="chat-main-header" class="bg-slate-950 border-b border-slate-850 py-4 px-5 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 text-sm shadow-lg shadow-emerald-500/10">
                <i class="fa-solid fa-comments text-slate-950 text-base"></i>
              </div>
              <div class="text-left">
                <div class="flex items-center gap-1.5">
                  <span class="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-md font-bold select-none flex items-center gap-1">
                    <i class="fa-solid fa-globe text-[8px] animate-pulse"></i> Encrypted Hub
                  </span>
                  <span id="chat-center-subtitle-tag" class="text-[9.5px] text-slate-500 font-mono tracking-wider">SECURE_TUNNEL</span>
                </div>
                <h3 class="text-xs sm:text-sm font-black text-white mt-1 leading-none tracking-tight">Direct Messaging & Social Base</h3>
              </div>
            </div>
            
            <button id="chat-modal-close-btn" class="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white rounded-xl py-2 px-3.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md">
              <i class="fa-solid fa-xmark"></i> <span class="hidden sm:inline">Close</span>
            </button>
          </div>

          <!-- Content Body Frame (Two Column Layout) -->
          <div class="flex flex-1 overflow-hidden relative">
            <!-- Sidebar Panel (Chats & Friends toggle list) -->
            <div id="chat-sidebar-pane" class="w-full sm:w-1/3 border-r border-slate-850 flex flex-col bg-slate-900/40 shrink-0">
              <!-- Inline Tabs Toggle -->
              <div class="grid grid-cols-2 border-b border-slate-850/80 bg-slate-950/50 p-2.5 gap-2 shrink-0">
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
                  <!-- Friendship Requests Section -->
                  <div class="space-y-2">
                    <div class="text-[9px] uppercase font-mono tracking-widest text-amber-500 pl-1 select-none flex items-center justify-between font-black">
                      <span class="flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Requests
                      </span>
                      <span id="incoming-requests-count-badge" class="bg-amber-950 text-amber-400 border border-amber-800/40 rounded-full px-2 py-0.5 text-[9px] font-black hidden">0</span>
                    </div>
                    <div id="friends-requests-list" class="space-y-1.5">
                      <!-- Dynamic pending list goes here -->
                    </div>
                  </div>

                  <!-- Mutual Friends Section -->
                  <div class="space-y-2">
                    <div class="text-[9px] uppercase font-mono tracking-widest text-emerald-400 pl-1 select-none flex items-center gap-1.5 font-black">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> My Connections
                    </div>
                    <div id="friends-mutual-list" class="space-y-1.5">
                      <!-- Dynamic normal friend nodes go here -->
                    </div>
                  </div>

                  <!-- Quick Add by username section -->
                  <div class="bg-slate-950/60 p-3.5 rounded-[24px] border border-slate-850 space-y-2.5 shadow-sm">
                    <h4 class="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-black flex items-center gap-1">
                      <i class="fa-solid fa-user-plus text-cyan-400 text-[8px]"></i> Invite User Instantly
                    </h4>
                    <div class="flex gap-2">
                      <input type="text" id="quick-add-username-input" placeholder="Type user username..." class="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-805 text-xs text-white h-[40px] px-3.5 rounded-xl outline-none font-sans focus:border-cyan-500 transition" />
                      <button id="quick-add-submit-btn" class="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-extrabold h-[40px] px-4 rounded-xl active:scale-95 transition cursor-pointer shadow-md shadow-cyan-600/10">Invite</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chat screen detail content -->
            <div class="hidden sm:flex flex-grow flex-col bg-slate-950/20 overflow-hidden relative" id="chat-detail-pane">
              <!-- Recipient Contact Banner -->
              <div id="chat-active-recipient-banner" class="bg-slate-950/50 border-b border-slate-850/60 py-3.5 px-4 flex items-center justify-between shrink-0">
                <div class="flex items-center gap-3 min-w-0">
                  <!-- Touch-friendly back button shown on mobile devices (height/width: 44px for targets) -->
                  <button id="chat-mobile-back-btn" class="sm:hidden text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 w-11 h-11 rounded-2xl flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer">
                    <i class="fa-solid fa-chevron-left text-sm"></i>
                  </button>

                  <div id="active-user-avatar-initial" class="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-850 text-white border border-slate-800 font-black flex items-center justify-center text-sm uppercase shadow shrink-0">
                    A
                  </div>
                  <div class="truncate text-left">
                    <h4 id="active-user-header-username" class="text-xs sm:text-sm font-black text-white truncate">@username</h4>
                    <div id="active-user-header-badges" class="flex flex-wrap gap-1.5 mt-0.5">
                      <!-- Active user badges placeholder -->
                    </div>
                  </div>
                </div>
                
                <!-- Quick stats info trigger -->
                <button id="chat-view-active-profile-btn" class="text-[10.5px] text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 py-2.5 px-3.5 rounded-2xl transition cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5 active:scale-95">
                  <i class="fa-solid fa-user-circle text-cyan-400 text-xs"></i> <span>Stats</span>
                </button>
              </div>

              <!-- Message Streams -->
              <div id="chat-messages-stream" class="flex-grow overflow-y-auto chat-scrollbar p-4 space-y-4 flex flex-col justify-end bg-slate-900/10">
                <!-- Message structures with float side styling -->
              </div>

              <!-- Typing Indicator placeholder -->
              <div id="chat-typing-feedback" class="hidden text-[10px] font-sans italic text-slate-500 bg-slate-950/25 border-t border-slate-900/60 px-4 py-2.5 flex items-center gap-1.5 font-mono tracking-tight select-none shrink-0 text-left">
                <i class="fa-solid fa-circle-notch animate-spin text-[10px] text-emerald-550"></i> <span id="typing-feedback-username" class="font-bold text-slate-300">@username</span> is typing...
              </div>

              <!-- Message Sender controls row (highly mobile optimized) -->
              <div class="p-3.5 border-t border-slate-850 bg-slate-950/50 flex items-center gap-2.5 shrink-0 w-full">
                <input type="text" id="chat-messages-compose-input" placeholder="Type a message..." class="flex-1 bg-slate-950 hover:bg-slate-900 text-slate-100 border border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-xs sm:text-sm outline-none placeholder-slate-600 transition duration-150" />
                <button id="chat-message-send-btn" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm h-[44px] px-5 rounded-2xl transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-1.5 shrink-0">
                  <i class="fa-solid fa-paper-plane text-[10px]"></i> <span class="hidden xs:inline">Send</span>
                </button>
              </div>
            </div>

            <!-- Empty Conversation placeholder -->
            <div class="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2.5 select-none" id="chat-empty-panel">
              <div class="w-16 h-16 rounded-[24px] bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-500 text-xl shadow-inner">
                <i class="fa-solid fa-envelope"></i>
              </div>
              <div class="space-y-1 max-w-xs text-center">
                <div class="text-xs sm:text-sm font-bold text-slate-200 font-sans">Select Conversation</div>
                <p class="text-[10px] sm:text-xs leading-relaxed text-slate-500">Choose an active chat thread or check friends tab to establish a messaging session link.</p>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(chatModal);
    }

    // 4. Inject dynamic Messages button option inside user profile tab
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
            <span class="text-xs font-bold text-white block">My Chat Messages</span>
            <span class="text-[9px] text-slate-500 block leading-tight mt-0.5">View and reply to direct messages, requests and friend chats.</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span id="profile-messages-unread-tag" class="hidden text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full animate-bounce">0 NEW</span>
          <span class="text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-lg font-mono">Open <i class="fa-solid fa-chevron-right text-[8px] pl-0.5"></i></span>
        </div>
      `;
      badgeBtn.parentNode.insertBefore(messagesBtn, badgeBtn.nextSibling);
    }
  }

  // Bind dynamic interactive clicks and keypress actions
  bindEvents() {
    // Escape key closures
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeUserProfile();
        this.closeChatCenter();
      }
    });

    // Profile details modal: close click
    document.getElementById("profile-detail-close-btn")?.addEventListener("click", () => {
      this.closeUserProfile();
    });

    // Profile details modal: add friend click
    document.getElementById("profile-detail-add-friend-btn")?.addEventListener("click", () => {
      const modal = document.getElementById("profile-details-modal");
      const targetUsername = modal?.getAttribute("data-target-user");
      if (targetUsername) {
        this.handleFriendAction(targetUsername);
      }
    });

    // Profile details modal: send message click
    document.getElementById("profile-detail-message-btn")?.addEventListener("click", () => {
      const modal = document.getElementById("profile-details-modal");
      const targetUsername = modal?.getAttribute("data-target-user");
      if (targetUsername) {
        this.closeUserProfile();
        this.openChatCenter(targetUsername);
      }
    });

    // Messages button click inside profile tab
    document.getElementById("profile-messages-btn")?.addEventListener("click", () => {
      this.openChatCenter();
    });

    // Chat modal: close click
    document.getElementById("chat-modal-close-btn")?.addEventListener("click", () => {
      this.closeChatCenter();
    });

    // Chat modal: mobile back button click
    document.getElementById("chat-mobile-back-btn")?.addEventListener("click", () => {
      this.backToList();
    });

    // Chat navigation subtab click switches
    document.getElementById("chat-tab-selector-chats")?.addEventListener("click", () => {
      this.switchChatSidebarTab("chats");
    });
    document.getElementById("chat-tab-selector-friends")?.addEventListener("click", () => {
      this.switchChatSidebarTab("friends");
    });

    // Direct message composing Send button
    document.getElementById("chat-message-send-btn")?.addEventListener("click", () => {
      this.handleSendMessage();
    });

    // Enter key compose message interceptor
    document.getElementById("chat-messages-compose-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handleSendMessage();
      }
    });

    // Chat view active user profile stats button click
    document.getElementById("chat-view-active-profile-btn")?.addEventListener("click", () => {
      if (this.activeChatUserId) {
        const targetUser = this.findUserByIdOrUsername(this.activeChatUserId);
        if (targetUser) {
          this.closeChatCenter();
          this.openUserProfile(targetUser.username);
        }
      }
    });

    // Friend Instant inline submission
    document.getElementById("quick-add-submit-btn")?.addEventListener("click", () => {
      const input = document.getElementById("quick-add-username-input");
      const userStr = input?.value?.trim();
      if (!userStr) {
        this.app.showToast("Please enter a valid user username.", "error");
        return;
      }
      if (input) input.value = "";
      this.handleFriendAction(userStr);
    });

    // Delegation click listener over document body to support dynamically rendered community elements
    document.body.addEventListener("click", (e) => {
      const profileClick = e.target.closest(".com-user-profile-click");
      if (profileClick) {
        e.preventDefault();
        const usernameStr = profileClick.getAttribute("data-username");
        if (usernameStr) {
          // Clean username from @ tags if existing
          const cleanedName = usernameStr.replace("@", "").trim();
          this.openUserProfile(cleanedName);
        }
      }
    });
  }

  // Find a registered user or return structural default to support temporary actors
  findUserByIdOrUsername(searchToken) {
    if (!searchToken) return null;
    const cleanSearch = searchToken.replace("@", "").trim().toLowerCase();
    
    // Find inside main database users list
    const found = (this.app.db.users || []).find(u => 
      u.id?.toLowerCase() === cleanSearch || 
      u.username?.toLowerCase() === cleanSearch
    );
    if (found) return found;

    // Create a beautifully realistic default player record dynamically if profile statistics are not found
    if (cleanSearch === "lottery_pro") {
      return { id: "u1", username: "lottery_pro", email: "pro@lotterywinner.app", loss: 300, profit: 1250, wins: 3, customBadge: "vip" };
    } else if (cleanSearch === "lucky_player") {
      return { id: "u2", username: "lucky_player", email: "lucky@quickdraw.net", loss: 120, profit: -45, wins: 1 };
    }

    // Default structure fallback
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
      joinDate: "2026-04-12",
      status: "active"
    };
  }

  // Opens the User profile detail modal
  openUserProfile(username) {
    if (!username) return;
    const u = this.findUserByIdOrUsername(username);
    if (!u) {
      this.app.showToast("Player details could not be parsed.", "error");
      return;
    }

    const currentLoggedInUser = this.app.currentUser;
    if (!currentLoggedInUser) {
      this.app.showToast("Please sign in or double click node connection to view player profiles.", "error");
      return;
    }

    const modal = document.getElementById("profile-details-modal");
    if (!modal) return;

    modal.setAttribute("data-target-user", u.username);

    // Update avatar displays
    const initialSpan = document.getElementById("profile-detail-initials");
    if (initialSpan) {
      initialSpan.innerText = u.username ? u.username[0].toUpperCase() : "?";
    }

    // Update username & emails
    const usernameEl = document.getElementById("profile-detail-username");
    if (usernameEl) {
      usernameEl.innerText = `@${u.username}`;
    }

    const emailEl = document.getElementById("profile-detail-email");
    if (emailEl) {
      // mask email
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

    // Calculate dynamic stats
    const spent = parseFloat(u.loss) || 0;
    const profit = parseFloat(u.profit) || 0;
    const winnings = Math.max(0, spent + profit);
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

    // Render badges list
    const badgesContainer = document.getElementById("profile-detail-badges");
    if (badgesContainer) {
      badgesContainer.innerHTML = "";
      
      const postsCount = (this.app.db.communityPosts || []).filter(p => (p.userId === u.id || p.username === u.username) && p.status !== "banned").length;
      const commentsCount = (this.app.db.communityComments || []).filter(c => (c.userId === u.id || c.username === u.username) && c.status !== "banned").length;
      const totalContribution = postsCount + commentsCount;

      const isLuckyWinner = winCounts > 0;
      const isTopContributor = totalContribution >= 2;

      let badgesHtml = "";
      
      // Admin assigned custom badges
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

      if (isLuckyWinner) {
        badgesHtml += `<span class="bg-amber-950/70 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded-lg text-[8px] font-bold flex items-center gap-1 shadow-md"><i class="fa-solid fa-trophy text-amber-500 text-[7px]"></i> Lucky Winner (${winCounts})</span>`;
      }
      if (isTopContributor) {
        badgesHtml += `<span class="bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-lg text-[8px] font-bold flex items-center gap-1 shadow-md"><i class="fa-solid fa-medal text-emerald-400 text-[7px]"></i> Top Contributor</span>`;
      }
      
      badgesHtml += `<span class="bg-slate-950 border border-slate-800/85 text-slate-400 px-2 py-0.5 rounded-lg text-[8px] font-mono shadow-sm">🎖️ Active Player</span>`;
      badgesContainer.innerHTML = badgesHtml;
    }

    // Hide actions if self profile
    const addFriendBtn = document.getElementById("profile-detail-add-friend-btn");
    const sendMsgBtn = document.getElementById("profile-detail-message-btn");
    
    if (u.username.toLowerCase() === currentLoggedInUser.username.toLowerCase() || u.id === currentLoggedInUser.id) {
      if (addFriendBtn) addFriendBtn.classList.add("hidden");
      if (sendMsgBtn) sendMsgBtn.classList.add("hidden");
    } else {
      if (addFriendBtn) {
        addFriendBtn.classList.remove("hidden");
        // Check current relations state
        const rel = this.getFriendshipRelation(u.username);
        if (!rel) {
          addFriendBtn.innerHTML = `<i class="fa-solid fa-user-plus text-emerald-400"></i> Add Friend`;
          addFriendBtn.disabled = false;
        } else if (rel.status === "accepted") {
          addFriendBtn.innerHTML = `<i class="fa-solid fa-user-check text-indigo-400"></i> Friends ✓`;
          addFriendBtn.disabled = true;
        } else {
          // pending
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

    // Show modal container
    modal.classList.remove("hidden");
    const innerCard = modal.querySelector(".active-modal-anim");
    if (innerCard) {
      setTimeout(() => {
        innerCard.classList.remove("scale-95", "opacity-0");
        innerCard.classList.add("scale-100", "opacity-100");
      }, 30);
    }
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

  // Find direct interactive relations state
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

  // Handle all add friend requests / accept procedures
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
      // Create new request
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

      // Reload UI profile displays
      this.openUserProfile(target.username);
    } else if (rel.status === "pending" && (rel.toId === clientUser.id || rel.toId?.toLowerCase() === clientUser.username?.toLowerCase())) {
      // Accept request incoming
      rel.status = "accepted";
      
      // Auto register a welcoming message snippet in text chat list
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

      // Reload UI profile displays
      this.openUserProfile(target.username);
    }
    this.updateNotificationBadgeOff();
  }

  // Opens the Chat social panel
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
      chatsBtn?.setAttribute("class", "py-1.5 rounded-lg text-center text-[10.5px] font-black cursor-pointer transition bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/10");
      friendsBtn?.setAttribute("class", "py-1.5 rounded-lg text-center text-[10.5px] font-black cursor-pointer transition text-slate-400 hover:text-white");
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

  // Sync Chats sidebar list items
  renderChatsConversationsList() {
    const chatList = document.getElementById("chats-conversations-list");
    if (!chatList) return;

    chatList.innerHTML = "";
    const currUser = this.app.currentUser;
    const currId = currUser.id;
    const currName = currUser.username.toLowerCase();

    // 1. Group conversations from messages records database
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

    // Also inject all accepted friends as automatic dialogue participants
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

    // Always ensure elite player 'lottery_pro' and 'lucky_player' exist as standby support options
    participantsSet.add("lottery_pro");
    participantsSet.add("lucky_player");

    // Convert Set back to target user nodes array
    const conversationUsers = Array.from(participantsSet).filter(id => {
      const isMe = (id?.toLowerCase() === currId?.toLowerCase() || id?.toLowerCase() === currName);
      return !isMe;
    });

    if (conversationUsers.length === 0) {
      chatList.innerHTML = `
        <div class="text-center py-8 text-[10.5px] text-slate-500 italic font-sans px-4">
          No chat history found. Click Friends Tab to initiate secure conversations!
        </div>
      `;
      return;
    }

    conversationUsers.forEach(userId => {
      const peer = this.findUserByIdOrUsername(userId);
      if (!peer) return;

      // Extract unread message counts in database
      const peerId = peer.id || peer.username;
      const unreadsCount = messages.filter(m => 
        (m.fromId === peer.id || m.fromId === peer.username) && 
        (m.toId === currUser.id || m.toId === currUser.username) && 
        m.status === "unread"
      ).length;

      // Calculate last message text
      const peerMessages = messages.filter(m => 
        ((m.fromId === currUser.id || m.fromId === currUser.username) && (m.toId === peer.id || m.toId === peer.username)) ||
        ((m.fromId === peer.id || m.fromId === peer.username) && (m.toId === currUser.id || m.toId === currUser.username))
      );
      peerMessages.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      let lastMsgText = "No previous private communication records.";
      if (peerMessages.length > 0) {
        lastMsgText = peerMessages[peerMessages.length - 1].content;
        if (lastMsgText.length > 28) lastMsgText = lastMsgText.substring(0, 26) + "...";
      }

      const activeStyle = (this.activeChatUserId === peerId) 
        ? "bg-gradient-to-r from-emerald-600/20 to-teal-650/15 border-emerald-500/30 text-white shadow-md shadow-emerald-950/20" 
        : "bg-slate-950/30 border-slate-850/80 text-slate-300 hover:bg-slate-950/70 hover:border-slate-800";
      
      const item = document.createElement("div");
      item.className = `flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition duration-150 transform hover:scale-[1.01] ${activeStyle}`;
      item.innerHTML = `
        <!-- Avatar Wrapper -->
        <div class="relative shrink-0 select-none">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-850 border border-slate-800 flex items-center justify-center font-black text-xs uppercase text-slate-200 shadow-md">
            ${peer.username ? peer.username[0] : "?"}
          </div>
          <!-- Online status light -->
          <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[3px] border-slate-900 animate-pulse shadow-sm"></span>
        </div>

        <!-- Meta detail -->
        <div class="flex-1 min-w-0 text-left">
          <div class="flex justify-between items-center">
            <span class="text-xs font-black truncate text-slate-100">@${peer.username}</span>
            ${unreadsCount > 0 ? `<span class="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 shadow-sm shadow-rose-600/20 animate-bounce">${unreadsCount}</span>` : ""}
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

  // Load Friends social list subtab UI
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

    // Filter structural entries
    const invites = friendships.filter(f => 
      f.status === "pending" && 
      (f.toId === currId || f.toId?.toLowerCase() === currName)
    );

    const mutuals = friendships.filter(f => 
      f.status === "accepted" && 
      ((f.fromId === currId || f.fromId?.toLowerCase() === currName) || 
       (f.toId === currId || f.toId?.toLowerCase() === currName))
    );

    // Sync notification badge
    if (invites.length > 0) {
      if (countBadge) {
        countBadge.innerText = invites.length;
        countBadge.classList.remove("hidden");
      }
    } else {
      if (countBadge) countBadge.classList.add("hidden");
    }

    // 1. Render Requests
    if (invites.length === 0) {
      reqList.innerHTML = `<div class="text-[10px] text-slate-650 italic font-sans pl-1 select-none py-1">No incoming validation logs pending.</div>`;
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
            <button class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[10px] font-black h-8 px-3 rounded-xl transition duration-150 transform hover:scale-[1.03] active:scale-95 cursor-pointer accept-invite-trigger flex items-center gap-1">
              <i class="fa-solid fa-check text-[9px]"></i> Accept
            </button>
            <button class="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-rose-450 text-[10px] font-bold h-8 px-2.5 rounded-xl transition duration-150 cursor-pointer reject-invite-trigger">
              Ignore
            </button>
          </div>
        `;

        card.querySelector(".accept-invite-trigger").addEventListener("click", () => {
          this.handleFriendAction(peer.username);
          this.renderFriendsSocialList();
        });

        card.querySelector(".reject-invite-trigger").addEventListener("click", () => {
          // Reject invite
          const index = friendships.indexOf(inv);
          if (index > -1) friendships.splice(index, 1);
          this.app.saveDB();
          this.app.showToast("Friend request ignored.", "info");
          this.renderFriendsSocialList();
        });

        reqList.appendChild(card);
      });
    }

    // 2. Render Mutual Friends
    // Always inject standby default friends in list
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
      card.className = "bg-slate-950/40 border border-slate-850/80 p-3 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-950/80 hover:border-slate-800 transition-all duration-200 shadow-sm";
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
        <button class="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 hover:from-emerald-600 hover:to-teal-650/40 text-emerald-400 hover:text-white border border-emerald-950 text-xs font-black h-8 px-3.5 rounded-xl active:scale-95 transition-all duration-150 cursor-pointer open-chat-direct-trigger flex items-center gap-1.5 shrink-0">
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

  // Active user selection handler inside details conversation
  selectActiveConversation(userId) {
    this.activeChatUserId = userId;
    
    // Switch layouts
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
    }

    const mainHeader = document.getElementById("chat-main-header");
    if (mainHeader) {
      mainHeader.classList.add("hidden");
      mainHeader.classList.remove("flex");
      mainHeader.classList.add("sm:flex");
    }

    // Refresh contact side highlighting
    this.renderChatsConversationsList();

    const peer = this.findUserByIdOrUsername(userId);
    if (!peer) return;

    // Update active banner details
    const avatarInit = document.getElementById("active-user-avatar-initial");
    if (avatarInit) avatarInit.innerText = peer.username ? peer.username[0].toUpperCase() : "?";

    const headerName = document.getElementById("active-user-header-username");
    if (headerName) headerName.innerText = `@${peer.username}`;

    // Mark messages from target received as read
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

  // Returns from full-screen chat detailed stream to conversations list on mobile screens
  backToList() {
    this.activeChatUserId = null;

    const detailPane = document.getElementById("chat-detail-pane");
    if (detailPane) {
      detailPane.classList.add("hidden");
      detailPane.classList.remove("flex", "w-full", "sm:w-auto", "sm:flex-1");
      detailPane.classList.add("sm:flex");
    }

    const emptyPanel = document.getElementById("chat-empty-panel");
    if (emptyPanel) {
      emptyPanel.classList.remove("hidden");
    }

    const sidebarPane = document.getElementById("chat-sidebar-pane");
    if (sidebarPane) {
      sidebarPane.classList.remove("hidden");
    }

    const mainHeader = document.getElementById("chat-main-header");
    if (mainHeader) {
      mainHeader.classList.remove("hidden");
      mainHeader.classList.add("flex");
    }

    this.renderChatsConversationsList();
  }

  // Render header status reputation badges inside message stream
  renderHeaderBadges(user) {
    const badgeBar = document.getElementById("active-user-header-badges");
    if (!badgeBar) return;

    badgeBar.innerHTML = "";
    
    // Fetch statistics to compute badges
    const winCounts = (this.app.db.tickets || []).filter(t => t.userId === user.id && t.status === "won").length + (user.wins || 0);
    const postsCount = (this.app.db.communityPosts || []).filter(p => (p.userId === user.id || p.username === user.username) && p.status !== "banned").length;
    const commentsCount = (this.app.db.communityComments || []).filter(c => (c.userId === user.id || c.username === user.username) && c.status !== "banned").length;
    const totalContrib = postsCount + commentsCount;

    const isLuckyWinner = winCounts > 0;
    const isTopContrib = totalContrib >= 2;

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

    if (isLuckyWinner) {
      badgesHtml += `<span class="bg-amber-950 text-amber-500 border border-amber-900/35 px-1 py-0.2 rounded text-[7px] font-bold">🏆 Winner</span> `;
    }
    if (isTopContrib) {
      badgesHtml += `<span class="bg-emerald-950 text-emerald-400 border border-emerald-900/35 px-1 py-0.2 rounded text-[7px] font-bold">⭐ Contrib</span> `;
    }

    badgesHtml += `<span class="bg-slate-950 text-slate-500 border border-slate-900/80 px-1 py-0.2 rounded text-[7px] font-mono">Player</span>`;
    badgeBar.innerHTML = badgesHtml;
  }

  // Renders message exchange transcripts
  renderMessageStreams() {
    const stream = document.getElementById("chat-messages-stream");
    if (!stream) return;

    stream.innerHTML = "";
    const peer = this.findUserByIdOrUsername(this.activeChatUserId);
    if (!peer) return;

    const currUser = this.app.currentUser;
    const messages = this.app.db.directMessages || [];

    // Filter transaction transcript of peer and client
    const thread = messages.filter(m => 
      ((m.fromId === currUser.id || m.fromId === currUser.username) && (m.toId === peer.id || m.toId === peer.username)) ||
      ((m.fromId === peer.id || m.fromId === peer.username) && (m.toId === currUser.id || m.toId === currUser.username))
    );

    // Sort by chronological order
    thread.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (thread.length === 0) {
      stream.innerHTML = `
        <div class="text-center py-10 opacity-60 font-sans space-y-1.5 my-auto select-none">
          <i class="fa-solid fa-cloud-bolt text-slate-700 text-lg block animate-bounce"></i>
          <span class="text-[10px] font-bold text-slate-400 block">End-to-End Encrypted Tunnel</span>
          <p class="text-[8.5px] max-w-[210px] mx-auto leading-normal text-slate-500">Secure private database node is connected. Say hello to @${peer.username}!</p>
        </div>
      `;
      return;
    }

    thread.forEach(msg => {
      const isMe = (msg.fromId === currUser.id || msg.fromId === currUser.username);
      const alignClass = isMe ? "self-end items-end" : "self-start items-start";
      const bubbleClass = isMe 
        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-2xl rounded-bl-2xl shadow-md border border-emerald-500/10" 
        : "bg-slate-900 border border-slate-805 text-slate-100 rounded-t-2xl rounded-br-2xl shadow-sm";

      const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const msgDiv = document.createElement("div");
      msgDiv.className = `flex flex-col max-w-[85%] sm:max-w-[75%] ${alignClass} space-y-0.5 text-left`;
      msgDiv.innerHTML = `
        <!-- Header sender tag if incoming -->
        ${!isMe ? `<span class="text-[7.5px] font-bold text-slate-500 font-mono tracking-wide pl-1.5 select-none">@${peer.username}</span>` : ""}
        
        <!-- text Bubble -->
        <div class="px-3.5 py-2 text-xs leading-normal font-sans whitespace-pre-wrap select-text selection:bg-slate-900/50 ${bubbleClass}">
          ${msg.content}
        </div>

        <!-- Timestamp status meta -->
        <div class="flex items-center gap-1 text-[7.5px] font-mono text-slate-600 px-1 select-none">
          <span>${timeStr}</span>
          ${isMe ? `<i class="fa-solid fa-check-double text-[7px] ${msg.status === "read" ? "text-emerald-400" : "text-slate-600"}"></i>` : ""}
        </div>
      `;

      stream.appendChild(msgDiv);
    });

    // Auto scroll to bottom
    setTimeout(() => {
      stream.scrollTop = stream.scrollHeight;
    }, 40);
  }

  // Composes and pushes direct messages record
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

    const newMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 10),
      fromId: currUser.id || currUser.username,
      toId: peer.id || peer.username,
      content: content,
      timestamp: new Date().toISOString(),
      status: "unread"
    };

    if (!this.app.db.directMessages) this.app.db.directMessages = [];
    this.app.db.directMessages.push(newMessage);
    this.app.saveDB();

    if (input) input.value = "";
    
    // Play a tiny system sound / click response
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

    this.renderMessageStreams();
    this.renderChatsConversationsList();

    // Trigger dynamic computer autoresponsive
    this.triggerMockResponder(peer);
  }

  // Custom simulation responder to keep the prototype chat completely alive in developer workspace
  triggerMockResponder(senderPeer) {
    const peerId = senderPeer.id || senderPeer.username;
    
    // Clear previous pending auto responses for this user
    if (this.automatedTimers[peerId]) {
      clearTimeout(this.automatedTimers[peerId]);
    }

    const typingIndicator = document.getElementById("chat-typing-feedback");
    const indicatorUser = document.getElementById("typing-feedback-username");

    // Initiate typing simulation interval delay
    this.automatedTimers[peerId] = setTimeout(() => {
      if (indicatorUser) indicatorUser.innerText = `@${senderPeer.username}`;
      typingIndicator?.classList.remove("hidden");

      // Scroll streams again to keep visibility of typing alerts
      const stream = document.getElementById("chat-messages-stream");
      if (stream) stream.scrollTop = stream.scrollHeight;

      // Add response callback delay
      this.automatedTimers[peerId] = setTimeout(() => {
        typingIndicator?.classList.add("hidden");

        const repliesPool = [
          "Hey player! Checking out some pool combinations. Best of luck in the upcoming Hourly Drawings!",
          "Yes! I am actively participating. Let me know if you need to double check any promo ticket codes.",
          "Direct secure messages are completely loaded. It's fully functional!",
          "Thanks for the support. May major luck be with your drawings!",
          "Exactly. I am planning on depositing more next cycle. The platform is highly stable.",
          "Awesome. Did you take a lucky spin on the wheel of fortune today?"
        ];

        let randomReplyText = repliesPool[Math.floor(Math.random() * repliesPool.length)];

        // Generate customized responses for specialized characters
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
            "Did you try sending a friend invitation using your referral link yet? It gives sweet cash buffers."
          ];
          randomReplyText = luckyAnswers[Math.floor(Math.random() * luckyAnswers.length)];
        }

        const responderMessage = {
          id: "msg_" + Math.random().toString(36).substring(2, 10),
          fromId: senderPeer.id || senderPeer.username,
          toId: this.app.currentUser.id || this.app.currentUser.username,
          content: randomReplyText,
          timestamp: new Date().toISOString(),
          status: this.activeChatUserId === peerId ? "read" : "unread"
        };

        this.app.db.directMessages.push(responderMessage);
        this.app.saveDB();

        // Reload views
        if (this.activeChatUserId === peerId) {
          this.renderMessageStreams();
        }
        this.renderChatsConversationsList();
        this.updateNotificationBadgeOff();
      }, 1400);

    }, 850);
  }

  // Update notification overlays on main profile button option and document tab icons
  updateNotificationBadgeOff() {
    if (!this.app.currentUser) return;
    const clientUser = this.app.currentUser;
    const currId = clientUser.id;
    const currName = clientUser.username.toLowerCase();

    // 1. Calculate unread messages in database
    const unreadMessages = (this.app.db.directMessages || []).filter(m => 
      (m.toId === currId || m.toId?.toLowerCase() === currName) && 
      m.status === "unread"
    ).length;

    // 2. Count incoming pending friend requests
    const pendingInvites = (this.app.db.friendships || []).filter(f => 
      f.status === "pending" && 
      (f.toId === currId || f.toId?.toLowerCase() === currName)
    ).length;

    const totalUnreadSocials = unreadMessages + pendingInvites;

    // Update unread badges count overlays in the profile tab messages button
    const unreadTag = document.getElementById("profile-messages-unread-tag");
    if (unreadTag) {
      if (totalUnreadSocials > 0) {
        unreadTag.innerText = `${totalUnreadSocials} NEW`;
        unreadTag.classList.remove("hidden");
      } else {
        unreadTag.classList.add("hidden");
      }
    }
  }
}
