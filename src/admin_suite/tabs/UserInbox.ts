export const UserInbox = {
  renderUserInbox(this: any) {
    if (!this.currentUser) return;

    const listEl = document.getElementById("user-inbox-list");
    const badgeEl = document.getElementById("user-inbox-unread-badge");
    if (!listEl) return;

    const msgs = this.db.messages || [];
    const username = this.currentUser.username.toLowerCase();

    const userMsgs = msgs.filter((m: any) => {
      if (m.recipientType === "bulk") return true;
      if (m.recipientType === "specific" && m.targetUsername && m.targetUsername.toLowerCase() === username) return true;
      return false;
    });

    const sorted = [...userMsgs].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const unreadCount = sorted.filter((m: any) => !(m.readBy || []).includes(this.currentUser.username)).length;
    if (badgeEl) {
      badgeEl.innerText = `${unreadCount} Unread`;
      if (unreadCount > 0) {
        badgeEl.className = "text-[9px] font-bold bg-pink-950 text-pink-400 border border-pink-900 px-2 py-0.5 rounded-lg animate-pulse";
      } else {
        badgeEl.className = "text-[9px] font-bold bg-slate-950 text-slate-500 border border-slate-900 px-2 py-0.5 rounded-lg";
      }
    }

    if (sorted.length === 0) {
      listEl.innerHTML = `
        <div class="p-8 text-center text-slate-500 font-mono text-[10px]">
          <i data-lucide="message-square" class="text-slate-800 text-2xl block mb-2"></i>
          Your personal inbox is empty. No messages registered.
        </div>
      `;
      return;
    }

    listEl.innerHTML = sorted.map((m: any) => {
      const isUnread = !(m.readBy || []).includes(this.currentUser.username);
      const dateStr = new Date(m.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      
      let catIcon = "bell";
      let catColor = "text-cyan-400 bg-cyan-950/40 border-cyan-900/30";
      if (m.category === "deposit") {
        catIcon = "coins";
        catColor = "text-emerald-400 bg-emerald-950/40 border-emerald-900/30";
      } else if (m.category === "withdrawal") {
        catIcon = "arrow-left-right";
        catColor = "text-rose-400 bg-rose-955/40 border-rose-900/30";
      } else if (m.category === "bonus") {
        catIcon = "gift";
        catColor = "text-amber-400 bg-amber-950/40 border-amber-900/30";
      } else if (m.category === "alert") {
        catIcon = "alert-triangle";
        catColor = "text-yellow-400 bg-yellow-950/40 border-yellow-900/30";
      }

      const readActionMark = isUnread 
        ? `<button class="mark-msg-read-btn text-[8px] tracking-tight bg-cyan-600 hover:bg-cyan-550 text-white font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer" data-id="${m.id}">Mark Read</button>`
        : `<span class="text-[8px] font-mono text-slate-600 font-semibold uppercase flex items-center gap-1"><i data-lucide="check" class=" text-emerald-500 text-[8px]"></i> Read</span>`;

      return `
        <div class="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-900/80 hover:border-slate-800 transition relative overflow-hidden group space-y-2">
          ${isUnread ? '<div class="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-bl-full animate-pulse"></div>' : ''}
          
          <div class="flex justify-between items-start gap-2">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg ${catColor} border flex items-center justify-center">
                <i class="fa-solid ${catIcon} text-[9px]"></i>
              </div>
              <div>
                <span class="text-[11px] font-bold text-white block ${isUnread ? 'text-cyan-300' : 'text-slate-300'} break-words">${this.escapeHTML(m.subject)}</span>
                <span class="text-[8px] font-mono text-slate-500">${dateStr}</span>
              </div>
            </div>
            ${readActionMark}
          </div>
          
          <p class="text-[10px] text-slate-400 leading-normal font-sans pt-1 break-words">${this.escapeHTML(m.content)}</p>
        </div>
      `;
    }).join("");

    listEl.querySelectorAll(".mark-msg-read-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const found = (this.db.messages || []).find((m: any) => m.id === id);
        if (found) {
          if (!found.readBy) found.readBy = [];
          if (!found.readBy.includes(this.currentUser.username)) {
            found.readBy.push(this.currentUser.username);
            this.saveDB();
            this.renderUserInbox();
            this.showToast("Message marked as read.", "success");
          }
        }
      });
    });

    if (typeof this.refreshIconsForContainer === "function") {
      this.refreshIconsForContainer(listEl);
    } else {
      this.refreshIcons();
    }
  }
};
