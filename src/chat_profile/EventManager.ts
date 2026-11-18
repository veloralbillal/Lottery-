export class EventManager {
  static bindEvents(system: any) {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        system.closeUserProfile();
        system.closeChatCenter();
        system.closeGiftModal();
        system.endCall();
      }
    });

    document.getElementById("profile-detail-close-btn")?.addEventListener("click", () => {
      system.closeUserProfile();
    });

    document.getElementById("profile-detail-add-friend-btn")?.addEventListener("click", () => {
      const modal = document.getElementById("profile-details-modal");
      const targetUsername = modal?.getAttribute("data-target-user");
      if (targetUsername) {
        system.handleFriendAction(targetUsername);
      }
    });

    document.getElementById("profile-detail-message-btn")?.addEventListener("click", () => {
      const modal = document.getElementById("profile-details-modal");
      const targetUsername = modal?.getAttribute("data-target-user");
      if (targetUsername) {
        system.closeUserProfile();
        system.openChatCenter(targetUsername);
      }
    });

    document.getElementById("profile-messages-btn")?.addEventListener("click", () => {
      system.openChatCenter();
    });

    document.getElementById("chat-modal-close-btn")?.addEventListener("click", () => {
      system.closeChatCenter();
    });

    document.getElementById("chat-mobile-back-btn")?.addEventListener("click", () => {
      system.backToList();
    });

    // Navigation subtabs
    document.getElementById("chat-tab-selector-chats")?.addEventListener("click", () => {
      system.switchChatSidebarTab("chats");
    });
    document.getElementById("chat-tab-selector-friends")?.addEventListener("click", () => {
      system.switchChatSidebarTab("friends");
    });

    // Send Message
    document.getElementById("chat-message-send-btn")?.addEventListener("click", () => {
      system.handleSendMessage();
    });

    document.getElementById("chat-messages-compose-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        system.handleSendMessage();
      }
    });

    // Search contacts input
    document.getElementById("chats-search-input")?.addEventListener("input", (e: any) => {
      system.searchTerm = e.target.value.toLowerCase().trim();
      system.renderChatsConversationsList();
    });

    // Theme selector toggle
    document.getElementById("chat-theme-toggle-btn")?.addEventListener("click", () => {
      const popover = document.getElementById("chat-theme-popover");
      popover?.classList.toggle("hidden");
    });

    document.querySelectorAll(".chat-theme-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const theme = btn.getAttribute("data-theme");
        if (theme) system.setChatTheme(theme);
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
        if (tab) system.renderStickersGrid(tab);
      });
    });

    // Send Gift / Tip Modal
    document.getElementById("chat-send-gift-btn")?.addEventListener("click", () => {
      system.openGiftModal();
    });

    document.getElementById("chat-gift-close-btn")?.addEventListener("click", () => {
      system.closeGiftModal();
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
      system.submitSendGift();
    });

    // Voice Note Recording
    document.getElementById("chat-voice-note-btn")?.addEventListener("click", () => {
      system.startVoiceNoteRecording();
    });

    document.getElementById("chat-voice-cancel-btn")?.addEventListener("click", () => {
      system.cancelVoiceNoteRecording();
    });

    document.getElementById("chat-voice-send-btn")?.addEventListener("click", () => {
      system.stopAndSendVoiceNote();
    });

    // Voice & Video Call triggers
    document.getElementById("chat-header-call-btn")?.addEventListener("click", () => {
      system.startCall("voice");
    });

    document.getElementById("chat-header-video-btn")?.addEventListener("click", () => {
      system.startCall("video");
    });

    document.getElementById("chat-call-end-btn")?.addEventListener("click", () => {
      system.endCall();
    });

    document.getElementById("chat-view-active-profile-btn")?.addEventListener("click", () => {
      if (system.activeChatUserId) {
        const targetUser = system.findUserByIdOrUsername(system.activeChatUserId);
        if (targetUser) {
          system.closeChatCenter();
          system.openUserProfile(targetUser.username);
        }
      }
    });

    document.getElementById("quick-add-submit-btn")?.addEventListener("click", () => {
      const input = document.getElementById("quick-add-username-input") as HTMLInputElement | null;
      const userStr = input?.value?.trim();
      if (!userStr) {
        system.app.showToast("Please enter a valid username.", "error");
        return;
      }
      if (input) input.value = "";
      system.handleFriendAction(userStr);
    });

    // Profile click delegation
    document.body.addEventListener("click", (e: any) => {
      const profileClick = e.target.closest(".com-user-profile-click");
      if (profileClick) {
        e.preventDefault();
        const usernameStr = profileClick.getAttribute("data-username");
        if (usernameStr) {
          const cleanedName = usernameStr.replace("@", "").trim();
          system.openUserProfile(cleanedName);
        }
      }

      // Claim Gift click
      const claimBtn = e.target.closest(".claim-gift-btn");
      if (claimBtn) {
        const msgId = claimBtn.getAttribute("data-msg-id");
        if (msgId) system.claimGift(msgId);
      }
    });
  }
}
