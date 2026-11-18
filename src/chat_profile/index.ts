import { UIRenderer } from "./UIRenderer.js";
import { EventManager } from "./EventManager.js";
import { ChatSystem } from "./ChatSystem.js";
import { ProfileSystem } from "./ProfileSystem.js";
import { CallSystem } from "./CallSystem.js";
import { GiftSystem } from "./GiftSystem.js";

export class ChatProfileSystem {
  app: any;
  activeChatUserId: string | null = null;
  activeChatTab: string = "chats";
  activeTheme: string = "cosmic";
  searchTerm: string = "";
  automatedTimers: any = {};
  recordingVoice: boolean = false;
  voiceRecordTimer: any = null;
  voiceRecordSeconds: number = 0;
  activeCall: any = null;
  callTimer: any = null;
  callSeconds: number = 0;

  constructor(app: any) {
    this.app = app;

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

  initUI() {
    UIRenderer.initUI(this);
    this.renderStickersGrid("vip");
  }

  bindEvents() {
    EventManager.bindEvents(this);
  }

  findUserByIdOrUsername(searchToken: string) {
    if (!searchToken) return null;
    const cleanSearch = searchToken.replace("@", "").trim().toLowerCase();
    
    const found = (this.app.db.users || []).find((u: any) => 
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

  openUserProfile(username: string) {
    ProfileSystem.openUserProfile(this, username);
  }

  setup3DTiltEffect(card: HTMLElement) {
    ProfileSystem.setup3DTiltEffect(this, card);
  }

  closeUserProfile() {
    const modal = document.getElementById("profile-details-modal");
    if (!modal) return;
    const innerCard = modal.querySelector(".active-modal-anim") as HTMLElement | null;
    if (innerCard) {
      innerCard.classList.add("scale-95", "opacity-0");
      innerCard.classList.remove("scale-100", "opacity-100");
    }
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 150);
  }

  getFriendshipRelation(targetUsername: string) {
    if (!this.app.currentUser) return null;
    const clientUser = this.app.currentUser;
    const lookupTarget = targetUsername.toLowerCase();
    const currId = clientUser.id;
    const currName = clientUser.username.toLowerCase();

    return (this.app.db.friendships || []).find((f: any) => {
      const isFromMe = (f.fromId === currId || f.fromId?.toLowerCase() === currName);
      const isToMe = (f.toId === currId || f.toId?.toLowerCase() === currName);
      const isFromTarget = (f.fromId?.toLowerCase() === lookupTarget || f.fromId === targetUsername);
      const isToTarget = (f.toId?.toLowerCase() === lookupTarget || f.toId === targetUsername);

      return (isFromMe && isToTarget) || (isToMe && isFromTarget);
    });
  }

  handleFriendAction(targetUsername: string) {
    ProfileSystem.handleFriendAction(this, targetUsername);
  }

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

  switchChatSidebarTab(targetTab: string) {
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

  renderChatsConversationsList() {
    ChatSystem.renderConversations(this);
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

    const invites = friendships.filter((f: any) => 
      f.status === "pending" && 
      (f.toId === currId || f.toId?.toLowerCase() === currName)
    );

    const mutuals = friendships.filter((f: any) => 
      f.status === "accepted" && 
      ((f.fromId === currId || f.fromId?.toLowerCase() === currName) || 
       (f.toId === currId || f.toId?.toLowerCase() === currName))
    );

    if (invites.length > 0) {
      if (countBadge) {
        countBadge.innerText = String(invites.length);
        countBadge.classList.remove("hidden");
      }
    } else {
      if (countBadge) countBadge.classList.add("hidden");
    }

    if (invites.length === 0) {
      reqList.innerHTML = `<div class="text-[10px] text-slate-500 italic font-sans pl-1 select-none py-1">No incoming requests.</div>`;
    } else {
      invites.forEach((inv: any) => {
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
              <i data-lucide="check" class="text-[9px]"></i> Accept
            </button>
            <button class="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-rose-450 text-[10px] font-bold h-8 px-2.5 rounded-xl transition cursor-pointer reject-invite-trigger">
              Ignore
            </button>
          </div>
        `;

        card.querySelector(".accept-invite-trigger")?.addEventListener("click", () => {
          this.handleFriendAction(peer.username);
          this.renderFriendsSocialList();
        });

        card.querySelector(".reject-invite-trigger")?.addEventListener("click", () => {
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
    const addedUsernames = new Set<string>();

    mutuals.forEach((f: any) => {
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
          <i data-lucide="message-square" class="text-[10px]"></i> Chat
        </button>
      `;

      card.querySelector(".open-chat-direct-trigger")?.addEventListener("click", () => {
        this.switchChatSidebarTab("chats");
        this.selectActiveConversation(peer.id || peer.username);
      });

      mList.appendChild(card);
    });
  }

  selectActiveConversation(userId: string) {
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
    (this.app.db.directMessages || []).forEach((m: any) => {
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

  renderHeaderBadges(user: any) {
    const badgeBar = document.getElementById("active-user-header-badges");
    if (!badgeBar) return;

    badgeBar.innerHTML = "";
    
    const winCounts = (this.app.db.tickets || []).filter((t: any) => t.userId === user.id && t.status === "won").length + (user.wins || 0);

    let badgesHtml = "";

    if (user.customBadge) {
      const badgeMap: any = {
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

  setChatTheme(themeKey: string) {
    this.activeTheme = themeKey;
    const detailPane = document.getElementById("chat-detail-pane");
    if (!detailPane) return;

    const themes: any = {
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

  renderStickersGrid(category: string) {
    GiftSystem.renderStickersGrid(this, category);
  }

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
    GiftSystem.submitSendGift(this);
  }

  claimGift(msgId: string) {
    GiftSystem.claimGift(this, msgId);
  }

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

  startCall(callType: "voice" | "video") {
    CallSystem.startCall(this, callType);
  }

  endCall() {
    CallSystem.endCall(this);
  }

  renderMessageStreams() {
    ChatSystem.renderMessages(this);
  }

  sendSpecialMessage(msgData: any) {
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
    const input = document.getElementById("chat-messages-compose-input") as HTMLInputElement | null;
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
    
    if (typeof window !== "undefined" && ((window as any).AudioContext || (window as any).webkitAudioContext)) {
      try {
        const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
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

  triggerMockResponder(senderPeer: any) {
    ChatSystem.triggerMockResponder(this, senderPeer);
  }

  updateNotificationBadgeOff() {
    if (!this.app.currentUser) return;
    const clientUser = this.app.currentUser;
    const currId = clientUser.id;
    const currName = clientUser.username.toLowerCase();

    const unreadMessages = (this.app.db.directMessages || []).filter((m: any) => 
      (m.toId === currId || m.toId?.toLowerCase() === currName) && 
      m.status === "unread"
    ).length;

    const pendingInvites = (this.app.db.friendships || []).filter((f: any) => 
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
        sidebarBadge.innerText = String(totalUnreadSocials);
        sidebarBadge.classList.remove("hidden");
      } else {
        sidebarBadge.classList.add("hidden");
      }
    }
  }
}
