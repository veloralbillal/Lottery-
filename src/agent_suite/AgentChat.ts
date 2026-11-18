export const AgentChat = {
  getAgentChatThreads(system: any, app: any) {
    if (!app.currentUser) return [];
    const agentUsername = (app.currentUser.username || "").toLowerCase();
    const allChats = Array.isArray(app.db.agentChats) ? app.db.agentChats : [];

    const threadMap = new Map();

    allChats.forEach(c => {
      if (!c) return;
      const senderLower = (c.sender || "").toLowerCase();
      const recipientLower = (c.recipient || "").toLowerCase();

      if (senderLower !== agentUsername && recipientLower !== agentUsername && recipientLower !== "agent") {
        return;
      }

      const otherParty = senderLower === agentUsername ? c.recipient : c.sender;
      if (!otherParty || otherParty.toLowerCase() === agentUsername) return;
      const otherKey = otherParty.toLowerCase();

      if (!threadMap.has(otherKey)) {
        const userObj = (app.db.users || []).find((u: any) => u && u.username && u.username.toLowerCase() === otherKey);
        threadMap.set(otherKey, {
          username: userObj ? userObj.username : otherParty,
          userId: userObj ? userObj.id : `USR-${otherKey.slice(0, 6).toUpperCase()}`,
          phone: userObj ? (userObj.phone || "N/A") : "N/A",
          balance: userObj ? (Number(userObj.balance) || 0) : 0,
          isOnline: userObj ? (userObj.status || "active") === "active" : true,
          lastMessage: "",
          lastTimestamp: "",
          unreadCount: 0,
          threadStatus: "open",
          priority: "normal",
          messages: []
        });
      }

      const thread = threadMap.get(otherKey);
      thread.messages.push(c);
      if (c.threadStatus) thread.threadStatus = c.threadStatus;
      if (c.priority) thread.priority = c.priority;

      if (!c.isInternalNote && c.isInternalNote !== 1) {
        thread.lastMessage = c.message || (c.attachmentName ? `📎 ${c.attachmentName}` : "");
        thread.lastTimestamp = c.timestamp || "";
        if (senderLower === otherKey && c.status !== "read") {
          thread.unreadCount++;
        }
      }
    });

    if (system.activeChatUser) {
      const activeKey = system.activeChatUser.toLowerCase();
      if (!threadMap.has(activeKey)) {
        const userObj = (app.db.users || []).find((u: any) => u && u.username && u.username.toLowerCase() === activeKey);
        threadMap.set(activeKey, {
          username: userObj ? userObj.username : system.activeChatUser,
          userId: userObj ? userObj.id : `USR-${activeKey.slice(0, 6).toUpperCase()}`,
          phone: userObj ? (userObj.phone || "N/A") : "N/A",
          balance: userObj ? (Number(userObj.balance) || 0) : 0,
          isOnline: true,
          lastMessage: "Start a new conversation",
          lastTimestamp: new Date().toISOString(),
          unreadCount: 0,
          threadStatus: "open",
          priority: "normal",
          messages: []
        });
      }
    }

    const list = Array.from(threadMap.values());
    list.sort((a, b) => {
      const aIsNew = a.threadStatus === "open" && a.messages.length <= 2;
      const bIsNew = b.threadStatus === "open" && b.messages.length <= 2;
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;

      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

      return String(b.lastTimestamp || "").localeCompare(String(a.lastTimestamp || ""));
    });
    return list;
  },

  renderAgentChatInbox(system: any, app: any, threads: any[]) {
    const listContainer = document.getElementById("agent-chat-threads-list");
    if (!listContainer) return;

    const searchQ = ((document.getElementById("agent-chat-inbox-search") as HTMLInputElement | null)?.value || "").toLowerCase().trim();

    if (!system.activeChatUser && threads.length > 0) {
      system.activeChatUser = threads[0].username;
    }

    const filteredThreads = threads.filter(t => {
      const st = (t.threadStatus || "open").toLowerCase();
      if (system.chatInboxFilter === "open" && st !== "open") return false;
      if (system.chatInboxFilter === "pending" && st !== "pending") return false;
      if (system.chatInboxFilter === "resolved" && st !== "resolved" && st !== "completed") return false;
      if (system.chatInboxFilter === "unread" && t.unreadCount === 0) return false;

      if (!searchQ) return true;
      return t.username.toLowerCase().includes(searchQ) ||
             t.userId.toLowerCase().includes(searchQ) ||
             t.phone.toLowerCase().includes(searchQ) ||
             (t.lastMessage || "").toLowerCase().includes(searchQ);
    });

    if (filteredThreads.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-xs font-mono">
          <i class="fa-solid fa-inbox text-xl block mb-2 text-slate-700"></i>
          No conversations match the current filter.
        </div>
      `;
    } else {
      listContainer.innerHTML = filteredThreads.map(t => {
        const isSelected = system.activeChatUser && t.username.toLowerCase() === system.activeChatUser.toLowerCase();
        const isNewTicket = t.threadStatus === "open" && t.messages.length <= 2;
        const d = new Date(t.lastTimestamp);
        const timeStr = isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const prioColor = t.priority === "urgent" ? "text-rose-400" : (t.priority === "high" ? "text-amber-400" : "text-slate-500");
        const statusColor = t.threadStatus === "resolved" ? "text-emerald-400" : (t.threadStatus === "pending" ? "text-amber-400" : "text-cyan-400");

        return `
          <div class="agent-chat-thread-item p-3 rounded-2xl border cursor-pointer transition ${isSelected ? 'bg-slate-950 border-cyan-500/60 shadow-md' : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'}" data-username="${app.escapeHTML(t.username)}">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="relative w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center font-black text-xs uppercase shrink-0">
                  ${app.escapeHTML(t.username.slice(0, 2))}
                  <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${t.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}"></span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <strong class="text-xs font-black text-white font-mono truncate">@${app.escapeHTML(t.username)}</strong>
                    ${isNewTicket ? '<span class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-700 text-cyan-300 rounded text-[8px] font-mono font-bold">🆕 New Ticket</span>' : ''}
                  </div>
                  <p class="text-[11px] text-slate-400 truncate max-w-[170px]">${app.escapeHTML(t.lastMessage || "No messages yet")}</p>
                </div>
              </div>
              <div class="text-right shrink-0 space-y-1">
                <span class="text-[9px] font-mono text-slate-500 block">${app.escapeHTML(timeStr)}</span>
                ${t.unreadCount > 0 ? `<span class="inline-block px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-mono font-black">${t.unreadCount}</span>` : ""}
              </div>
            </div>
            <div class="flex items-center justify-between text-[9px] font-mono mt-2 pt-1.5 border-t border-slate-900">
              <span class="uppercase font-bold ${statusColor}">${app.escapeHTML(t.threadStatus)}</span>
              <span class="uppercase ${prioColor}">Priority: ${app.escapeHTML(t.priority)}</span>
            </div>
          </div>
        `;
      }).join("");

      listContainer.querySelectorAll(".agent-chat-thread-item").forEach(item => {
        item.addEventListener("click", () => {
          const u = item.getAttribute("data-username");
          system.activeChatUser = u;
          system.markThreadAsReadByAgent(app, u);
          system.renderAgentChatInbox(app, system.getAgentChatThreads(app));
        });
      });
    }

    this.renderActiveAgentConversation(system, app, threads);
  },

  markThreadAsReadByAgent(system: any, app: any, targetUsername: string) {
    if (!targetUsername || !app.currentUser || !Array.isArray(app.db.agentChats)) return;
    const uLower = targetUsername.toLowerCase();
    const agentLower = app.currentUser.username.toLowerCase();
    let changed = false;
    const nowIso = new Date().toISOString();

    app.db.agentChats.forEach(c => {
      if (
        c &&
        (c.sender || "").toLowerCase() === uLower &&
        ((c.recipient || "").toLowerCase() === agentLower || (c.recipient || "").toLowerCase() === "agent") &&
        c.status !== "read"
      ) {
        c.status = "read";
        c.readAt = nowIso;
        changed = true;
      }
    });

    if (changed) {
      app.saveDB(true);
    }
  },

  renderActiveAgentConversation(system: any, app: any, threads: any[]) {
    const activeAvatar = document.getElementById("agent-inbox-active-avatar");
    const activeUsername = document.getElementById("agent-inbox-active-username");
    const activeUserId = document.getElementById("agent-inbox-active-userid");
    const activeMeta = document.getElementById("agent-inbox-active-meta");
    const statusSelect = document.getElementById("agent-inbox-status-select") as HTMLSelectElement | null;
    const prioSelect = document.getElementById("agent-inbox-priority-select") as HTMLSelectElement | null;
    const msgContainer = document.getElementById("agent-inbox-messages-container");

    if (!msgContainer) return;

    if (!system.activeChatUser) {
      if (activeUsername) activeUsername.innerText = "Select a conversation";
      if (activeUserId) activeUserId.innerText = "";
      if (activeMeta) activeMeta.innerText = "Choose a user from the inbox list or click 'New Chat'";
      msgContainer.innerHTML = `
        <div class="text-center py-16 text-slate-500 text-xs font-mono">
          <i class="fa-solid fa-comments text-2xl text-slate-700 block mb-2"></i>
          Select a user conversation from the left panel to view messages and reply.
        </div>
      `;
      return;
    }

    if (system.activeSubTab === "live-chat") {
      this.markThreadAsReadByAgent(system, app, system.activeChatUser);
    }

    const thread = threads.find(t => t.username.toLowerCase() === system.activeChatUser.toLowerCase());
    if (!thread) return;

    if (activeAvatar) activeAvatar.innerText = thread.username.slice(0, 2).toUpperCase();
    if (activeUsername) activeUsername.innerText = `@${thread.username}`;
    if (activeUserId) activeUserId.innerText = `· ID: ${thread.userId}`;
    if (activeMeta) {
      activeMeta.innerText = `${thread.isOnline ? '● Online' : '○ Offline'} · Phone: ${thread.phone} · Wallet: ৳${(Number(thread.balance) || 0).toFixed(2)} · Assigned: @${app.currentUser.username}`;
    }
    if (statusSelect) statusSelect.value = thread.threadStatus || "open";
    if (prioSelect) prioSelect.value = thread.priority || "normal";

    const msgSearchQ = ((document.getElementById("agent-chat-msg-search") as HTMLInputElement | null)?.value || "").toLowerCase().trim();
    const msgs = thread.messages.filter((m: any) => {
      if (!msgSearchQ) return true;
      return (m.message || "").toLowerCase().includes(msgSearchQ) ||
             (m.attachmentName || "").toLowerCase().includes(msgSearchQ);
    });

    if (msgs.length === 0) {
      msgContainer.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-xs font-mono">
          No messages in this conversation yet. Send a message or internal note below!
        </div>
      `;
      return;
    }

    const agentUsernameLower = (app.currentUser.username || "").toLowerCase();
    msgContainer.innerHTML = msgs.map((m: any) => {
      const isMe = (m.sender || "").toLowerCase() === agentUsernameLower;
      const isNote = Boolean(m.isInternalNote && m.isInternalNote !== 0 && m.isInternalNote !== "0");
      const d = new Date(m.timestamp);
      const timeStr = isNaN(d.getTime()) ? "" : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const receipt = isMe && !isNote
        ? (m.status === "read" ? `<span class="text-cyan-300 font-bold ml-1" title="Read">✓✓ Read</span>` : `<span class="text-slate-300 ml-1" title="Sent">✓ Sent</span>`)
        : "";

      let attachmentHtml = "";
      if (m.attachmentUrl) {
        if ((m.attachmentType || "").startsWith("image/") || m.attachmentUrl.startsWith("data:image/")) {
          attachmentHtml = `
            <div class="mt-2">
              <a href="${m.attachmentUrl}" target="_blank" rel="noopener noreferrer">
                <img src="${m.attachmentUrl}" alt="${app.escapeHTML(m.attachmentName || 'Attachment')}" class="max-h-48 rounded-xl border border-white/10 object-contain" />
              </a>
            </div>
          `;
        } else {
          attachmentHtml = `
            <div class="mt-2">
              <a href="${m.attachmentUrl}" download="${app.escapeHTML(m.attachmentName || 'file.pdf')}" class="inline-flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg text-[11px] font-mono text-cyan-300 underline">
                <i class="fa-solid fa-file-arrow-down"></i> ${app.escapeHTML(m.attachmentName || "Download Attachment")}
              </a>
            </div>
          `;
        }
      }

      if (isNote) {
        return `
          <div class="flex flex-col items-end space-y-1">
            <div class="text-[9.5px] font-mono text-amber-400 px-1 flex items-center gap-1">
              <i class="fa-solid fa-lock"></i> STAFF INTERNAL NOTE (Hidden from User) · @${app.escapeHTML(m.sender)} · ${app.escapeHTML(timeStr)}
            </div>
            <div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-sans bg-amber-950/60 border border-amber-700/50 text-amber-200">
              ${app.escapeHTML(m.message || "")}
              ${attachmentHtml}
            </div>
          </div>
        `;
      }

      return `
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1">
          <div class="text-[9.5px] font-mono text-slate-500 px-1">
            ${isMe ? `You (@${app.escapeHTML(m.sender)})` : `@${app.escapeHTML(m.sender)}`} · ${app.escapeHTML(timeStr)} ${receipt}
          </div>
          <div class="max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-sans shadow-md ${isMe ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-none' : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'}">
            ${m.message ? `<div class="whitespace-pre-wrap break-words">${app.escapeHTML(m.message)}</div>` : ""}
            ${attachmentHtml}
          </div>
        </div>
      `;
    }).join("");

    msgContainer.scrollTop = msgContainer.scrollHeight;
  },

  renderUserLiveChat(system: any, app: any) {
    const allAgents = system.getAllUnifiedAgents(app);
    if (!app.currentChatAgent && allAgents.length > 0) {
      app.currentChatAgent = allAgents[0].username;
    }

    const activeAgentName = app.currentChatAgent || "agent";
    const activeAgentLower = activeAgentName.toLowerCase();
    const agentObj = allAgents.find((a: any) => a.username.toLowerCase() === activeAgentLower);

    const titleEl = document.getElementById("chat-agent-title");
    if (titleEl) {
      titleEl.innerText = agentObj ? `${agentObj.displayName || ('@' + agentObj.username)} (${agentObj.district || 'Dhaka'})` : `@${activeAgentName}`;
    }

    const statusIndEl = document.getElementById("chat-agent-status-indicator");
    if (statusIndEl) {
      const avail = (agentObj?.availabilityStatus || "online").toLowerCase();
      if (avail === "busy") {
        statusIndEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span class="text-amber-400">ব্যস্ত আছেন (Busy - Leave a message)</span>`;
      } else if (avail === "offline") {
        statusIndEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span><span class="text-slate-400">অফলাইন (Offline - Messages saved)</span>`;
      } else {
        statusIndEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span class="text-emerald-400">লাইভ চ্যাট সক্রিয় (Online)</span>`;
      }
    }

    const switcher = document.getElementById("user-chat-agent-switcher") as HTMLSelectElement | null;
    const myUsername = (app.currentUser?.username || "guest").toLowerCase();
    const allChats = Array.isArray(app.db?.agentChats) ? app.db.agentChats : [];

    if (switcher) {
      switcher.innerHTML = allAgents.map((a: any) => {
        const aLower = a.username.toLowerCase();
        const unread = allChats.filter(
          c => c && !c.isInternalNote && c.isInternalNote !== 1 && (c.sender || "").toLowerCase() === aLower && (c.recipient || "").toLowerCase() === myUsername && c.status !== "read"
        ).length;
        return `<option value="${app.escapeHTML(a.username)}" ${aLower === activeAgentLower ? 'selected' : ''}>@${app.escapeHTML(a.username)} (${app.escapeHTML(a.district || 'Dhaka')})${unread > 0 ? ` [${unread} new]` : ''}</option>`;
      }).join("");
    }

    let markedRead = false;
    const nowIso = new Date().toISOString();
    allChats.forEach(c => {
      if (
        c &&
        !c.isInternalNote &&
        c.isInternalNote !== 1 &&
        (c.sender || "").toLowerCase() === activeAgentLower &&
        (c.recipient || "").toLowerCase() === myUsername &&
        c.status !== "read"
      ) {
        c.status = "read";
        c.readAt = nowIso;
        markedRead = true;
      }
    });
    if (markedRead) {
      app.saveDB(true);
    }

    const searchQ = ((document.getElementById("user-chat-search-input") as HTMLInputElement | null)?.value || "").toLowerCase().trim();
    const convChats = allChats.filter(c => {
      if (!c || c.isInternalNote || c.isInternalNote === 1 || c.isInternalNote === "1") return false;
      const s = (c.sender || "").toLowerCase();
      const r = (c.recipient || "").toLowerCase();
      const belongs = (s === myUsername && r === activeAgentLower) || (s === activeAgentLower && r === myUsername);
      if (!belongs) return false;
      if (!searchQ) return true;
      return (c.message || "").toLowerCase().includes(searchQ) || (c.attachmentName || "").toLowerCase().includes(searchQ);
    });

    const threadStatusEl = document.getElementById("user-chat-thread-status");
    if (threadStatusEl) {
      const latestStatus = convChats.length > 0 ? (convChats[convChats.length - 1].threadStatus || "open") : "open";
      threadStatusEl.innerText = latestStatus.toUpperCase();
    }

    const container = document.getElementById("agent-chat-messages-container");
    if (!container) return;

    if (convChats.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 space-y-3">
          <div class="w-14 h-14 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto text-cyan-400 text-xl">
            <i class="fa-solid fa-comments"></i>
          </div>
          <h3 class="text-xs font-bold text-white font-mono">কথোপকথন শুরু করুন</h3>
          <p class="text-[11px] text-slate-400 max-w-xs mx-auto font-sans">
            @${app.escapeHTML(activeAgentName)} এর সাথে আপনার ক্যাশ-ইন, ক্যাশ-আউট বা টিকেট বুকিং নিয়ে সরাসরি কথা বলুন।
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = convChats.map(c => {
      const isMe = (c.sender || "").toLowerCase() === myUsername;
      const d = new Date(c.timestamp);
      const timeStr = isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const receipt = isMe
        ? (c.status === "read" ? `<span class="text-cyan-300 font-bold ml-1">✓✓ Read</span>` : `<span class="text-slate-400 ml-1">✓ Sent</span>`)
        : "";

      let attachmentHtml = "";
      if (c.attachmentUrl) {
        if ((c.attachmentType || "").startsWith("image/") || c.attachmentUrl.startsWith("data:image/")) {
          attachmentHtml = `
            <div class="mt-2">
              <a href="${c.attachmentUrl}" target="_blank" rel="noopener noreferrer">
                <img src="${c.attachmentUrl}" alt="${app.escapeHTML(c.attachmentName || 'Image')}" class="max-h-48 rounded-xl border border-white/10 object-contain" />
              </a>
            </div>
          `;
        } else {
          attachmentHtml = `
            <div class="mt-2">
              <a href="${c.attachmentUrl}" download="${app.escapeHTML(c.attachmentName || 'attachment.pdf')}" class="inline-flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg text-[11px] font-mono text-cyan-300 underline">
                <i class="fa-solid fa-file-arrow-down"></i> ${app.escapeHTML(c.attachmentName || "Download File")}
              </a>
            </div>
          `;
        }
      }

      return `
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1">
          <div class="text-[9.5px] font-mono text-slate-500 px-1">
            ${isMe ? 'আপনি (You)' : '@' + app.escapeHTML(c.sender)} • ${app.escapeHTML(timeStr)} ${receipt}
          </div>
          <div class="max-w-[80%] rounded-2xl px-4 py-3 text-xs font-sans shadow-lg ${isMe ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}">
            ${c.message ? `<div class="whitespace-pre-wrap break-words">${app.escapeHTML(c.message)}</div>` : ""}
            ${attachmentHtml}
          </div>
        </div>
      `;
    }).join("");

    container.scrollTop = container.scrollHeight;
  }
};
