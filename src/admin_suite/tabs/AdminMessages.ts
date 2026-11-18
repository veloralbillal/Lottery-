export const AdminMessages = {
  renderAdminMessages(this: any) {
    const listEl = document.getElementById("admin-msg-history-list");
    const countEl = document.getElementById("admin-msg-sent-count");
    if (!listEl) return;

    const msgs = this.db.messages || [];
    if (countEl) countEl.innerText = `${msgs.length} Sent`;

    if (msgs.length === 0) {
      listEl.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-500 font-mono text-[10px]">
          <i data-lucide="box" class="text-slate-800 text-4xl block mb-3 opacity-20"></i>
          No sent messages history recorded in the central outbox.
        </div>
      `;
      return;
    }

    const sorted = [...msgs].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    listEl.innerHTML = "";
    const gridContainer = document.createElement("div");
    gridContainer.className = "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full";

    gridContainer.innerHTML = sorted.map((m: any) => {
      const dateStr = new Date(m.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      const recipientText = m.recipientType === "bulk" 
        ? `<span class="bg-cyan-950/45 text-cyan-400 border border-cyan-900/30 px-2.5 py-0.5 rounded-lg text-[9px] font-sans font-black tracking-wider uppercase shadow-sm">ALL USERS</span>` 
        : `<span class="bg-purple-950/45 text-purple-400 border border-purple-900/30 px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-black tracking-tight shadow-sm">@${m.targetUsername}</span>`;

      let catBadge = "";
      if (m.category === "general") {
        catBadge = `<span class="text-[9px] font-sans font-black bg-slate-950 text-slate-400 py-0.5 px-2.5 rounded-lg border border-slate-800 uppercase">📢 General</span>`;
      } else if (m.category === "deposit") {
        catBadge = `<span class="text-[9px] font-sans font-black bg-emerald-950/45 text-emerald-400 py-0.5 px-2.5 rounded-lg border border-emerald-900/20 uppercase">💰 Deposit</span>`;
      } else if (m.category === "withdrawal") {
        catBadge = `<span class="text-[9px] font-sans font-black bg-rose-955/45 text-rose-400 py-0.5 px-2.5 rounded-lg border border-rose-900/20 uppercase">💸 Payout</span>`;
      } else if (m.category === "bonus") {
        catBadge = `<span class="text-[9px] font-sans font-black bg-amber-950/45 text-amber-400 py-0.5 px-2.5 rounded-lg border border-amber-900/20 uppercase">🎁 Bonus</span>`;
      } else if (m.category === "alert") {
        catBadge = `<span class="text-[9px] font-sans font-black bg-yellow-950/45 text-yellow-400 py-0.5 px-2.5 rounded-lg border border-yellow-900/20 uppercase">⚠️ Alert</span>`;
      } else if (m.category === "notice") {
        catBadge = `<span class="text-[9px] font-sans font-black bg-indigo-950/45 text-indigo-400 py-0.5 px-2.5 rounded-lg border border-indigo-900/20 uppercase">🔔 Notice</span>`;
      }

      return `
        <div class="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl space-y-4 relative group transition-all duration-300 hover:border-slate-700/60 shadow-xl overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-slate-800/20 rounded-full blur-2xl group-hover:bg-slate-700/30 transition-all"></div>
          
          <div class="flex justify-between items-start relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-750 flex items-center justify-center text-slate-400 shadow-lg group-hover:scale-105 transition-transform">
                <i data-lucide="send" class="w-4 h-4"></i>
              </div>
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  ${recipientText}
                  ${catBadge}
                </div>
                <div class="flex items-center gap-1.5 text-[9.5px] font-mono text-slate-500 font-bold uppercase tracking-tight">
                  <i data-lucide="clock" class="w-3 h-3"></i>
                  ${dateStr}
                </div>
              </div>
            </div>
            <button class="delete-admin-msg-btn w-8 h-8 rounded-xl text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-900/20 transition-all cursor-pointer flex items-center justify-center shadow-sm" data-id="${m.id}" title="Delete record">
              <i data-lucide="trash-2" class="text-sm"></i>
            </button>
          </div>

          <div class="space-y-2 pt-1 relative z-10">
            <h4 class="text-[13px] font-black text-white leading-tight tracking-tight">${this.escapeHTML(m.subject)}</h4>
            <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-850/60 group-hover:border-slate-800 transition-colors">
              <p class="text-[11.5px] text-slate-400 leading-relaxed font-sans whitespace-pre-line">${this.escapeHTML(m.content)}</p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1 text-[8.5px] font-mono font-black uppercase text-slate-600 tracking-widest border-t border-slate-850/40">
             <span>Dispatch ID: ${m.id.substring(0, 12)}...</span>
             <span class="flex items-center gap-1"><i data-lucide="check-check" class=" text-emerald-500 text-[9px]"></i> Network Broadcasted</span>
          </div>
        </div>
      `;
    }).join("");

    listEl.innerHTML = "";
    listEl.appendChild(gridContainer);

    listEl.querySelectorAll(".delete-admin-msg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Permanently delete this dispatch record from the outbox?")) {
          this.db.messages = (this.db.messages || []).filter((m: any) => m.id !== id);
          this.saveDB();
          this.renderAdminMessages();
          this.showToast("Message record purged successfully.", "info");
        }
      });
    });

    this.refreshIcons();
  }
};
