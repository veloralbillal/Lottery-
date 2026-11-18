/**
 * Group Chat Screen Controller (src/dashboard_tabs/group_chat.ts)
 * Handles rendering and messaging in #screen-group-chat.
 */

export class GroupChatTab {
  private static bound = false;
  private static lastSentAt = 0;

  static bindEvents(appInstance: any) {
    if (this.bound) return;
    this.bound = true;

    document.addEventListener("submit", (e) => {
      const form = (e.target as HTMLElement)?.closest("#group-chat-form");
      if (!form) return;
      e.preventDefault();
      this.sendMessage(appInstance);
    });

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const chip = target.closest(".group-quick-chip");
      if (chip) {
        const msg = chip.getAttribute("data-msg") || "";
        const input = document.getElementById("group-chat-input") as HTMLTextAreaElement | null;
        if (input && msg) {
          input.value = msg;
          input.focus();
          this.sendMessage(appInstance);
        }
        return;
      }

      if (target.closest("#group-chat-refresh-btn")) {
        this.render(appInstance);
        appInstance.showToast("Group chat synced!", "info");
      }
    });
  }

  static sendMessage(appInstance: any) {
    const input = document.getElementById("group-chat-input") as HTMLTextAreaElement | null;
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    if (!appInstance.currentUser) {
      appInstance.showToast("Please login to send messages!", "error");
      return;
    }

    const now = Date.now();
    if (now - this.lastSentAt < 5000) {
      const banner = document.getElementById("group-cooldown-banner");
      if (banner) {
        banner.classList.remove("hidden");
        setTimeout(() => banner.classList.add("hidden"), 2500);
      }
      return;
    }

    this.lastSentAt = now;
    if (!appInstance.db.groupChats) appInstance.db.groupChats = [];

    const newMsg = {
      id: "gc_" + now + "_" + Math.random().toString(36).slice(2, 6),
      sender: appInstance.currentUser.username,
      senderRole: appInstance.currentUser.role === "admin" ? "admin" : (appInstance.currentUser.role === "agent" ? "agent" : "user"),
      message: text,
      timestamp: new Date().toISOString()
    };

    appInstance.db.groupChats.push(newMsg);
    if (appInstance.db.groupChats.length > 60) {
      appInstance.db.groupChats = appInstance.db.groupChats.slice(-60);
    }
    appInstance.saveDB(true);

    input.value = "";
    this.render(appInstance);

    if (appInstance.mirofishSimulation && typeof appInstance.mirofishSimulation.handleUserMessage === "function") {
      appInstance.mirofishSimulation.handleUserMessage(text, appInstance.currentUser.username);
    }
  }

  static render(appInstance: any) {
    this.bindEvents(appInstance);

    const container = document.getElementById("group-chat-messages-container");
    if (!container) return;

    const chats: any[] = Array.isArray(appInstance.db?.groupChats) ? appInstance.db.groupChats : [];
    const currentUsername = appInstance.currentUser?.username?.toLowerCase() || "";

    if (chats.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-xs text-slate-400 font-mono space-y-2">
          <div class="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
            <i class="fa-solid fa-comments text-lg"></i>
          </div>
          <p class="font-bold text-slate-300">Lucky Community Messenger-এ স্বাগতম!</p>
          <p class="text-[10px] text-slate-500">নিচের যেকোনো Quick Chip বা মেসেজ লিখে আড্ডা শুরু করুন।</p>
        </div>
      `;
      return;
    }

    container.innerHTML = chats.map((msg) => {
      const isMe = currentUsername && msg.sender?.toLowerCase() === currentUsername;
      const roleBadge = msg.senderRole === "agent"
        ? `<span class="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">Agent</span>`
        : msg.senderRole === "vip"
        ? `<span class="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">VIP</span>`
        : msg.senderRole === "admin"
        ? `<span class="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">Admin</span>`
        : "";

      const timeStr = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";

      const replyBlock = msg.replyTo
        ? `<div class="mb-1.5 px-2.5 py-1 rounded-xl bg-black/25 border-l-2 border-cyan-400 text-[10px] text-slate-300 truncate">
             <span class="font-bold text-cyan-300">@${appInstance.escapeHTML(msg.replyTo.sender || "")}:</span>
             <span>${appInstance.escapeHTML(msg.replyTo.message || "")}</span>
           </div>`
        : "";

      return `
        <div class="group-msg-row ${isMe ? "group-msg-me flex justify-end" : "group-msg-other flex justify-start"}">
          <div class="group-msg-container max-w-[82%] space-y-1">
            <div class="flex items-center gap-1.5 ${isMe ? "justify-end" : "justify-start"} px-1">
              <span class="text-[10px] font-bold ${isMe ? "text-cyan-300" : "text-slate-300"} font-mono">@${appInstance.escapeHTML(msg.sender || "player")}</span>
              ${roleBadge}
              <span class="text-[8.5px] text-slate-500 font-mono">${timeStr}</span>
            </div>
            <div class="group-msg-bubble px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
              isMe
                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm"
                : "bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-bl-sm"
            }">
              ${replyBlock}
              <p class="break-words">${appInstance.escapeHTML(msg.message || "")}</p>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.scrollTop = container.scrollHeight;
  }
}
