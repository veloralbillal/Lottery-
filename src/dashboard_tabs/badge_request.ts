/**
 * Lottery Winner - Premium Badge Applications Module (badge_request.js)
 * 
 * Submits custom justification messages and verifies approved badge statuses.
 */

export class BadgeRequestTab {
  static init(appInstance) {
    console.log("Badge Request Tab Module initialized successfully.");
  }

  static render(appInstance) {
    const listEl = document.getElementById("user-badge-reqs-history-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const myReqs = (appInstance.db.badgeRequests || []).filter(r => r.userId === appInstance.currentUser.id);
    
    if (myReqs.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-6 bg-slate-900 border border-slate-850 text-[10px] text-slate-500 rounded-2xl font-mono">
          No previous badge requests submitted.
        </div>
      `;
    } else {
      // Sort newest first
      const sorted = [...myReqs].sort((a, b) => new Date(b.date) - new Date(a.date));
      sorted.forEach(r => {
        const item = document.createElement("div");
        item.className = "bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl flex justify-between items-center text-xs font-mono";
        
        let badgeLabel = r.requestedBadge.toUpperCase();
        const badgeMap = {
          vip: "💎 VIP Player",
          moderator: "🛡️ Staff Mod",
          star: "⭐ Elite Star",
          premium: "✨ Premium Member",
          pro: "🔥 Pro Active",
          legend: "👑 Royal Legend"
        };
        badgeLabel = badgeMap[r.requestedBadge] || badgeLabel;

        let statusClass = "bg-slate-950 text-slate-400 border border-slate-800";
        if (r.status === "approved") {
          statusClass = "bg-green-950 text-green-400 border border-green-900/60";
        } else if (r.status === "rejected") {
          statusClass = "bg-red-950 text-red-500 border border-red-900/60";
        } else {
          statusClass = "bg-amber-950 text-amber-500 border border-amber-900/60 animate-pulse";
        }

        item.innerHTML = `
          <div class="pr-3 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-white text-[11px]">${badgeLabel}</span>
              <span class="px-1.5 py-0.5 rounded text-[8px] font-bold ${statusClass}">${r.status.toUpperCase()}</span>
            </div>
            <div class="text-[9px] text-slate-500 font-mono mt-1">Submitted: ${new Date(r.date).toLocaleDateString()}</div>
            ${r.reason ? `<div class="text-[9px] text-slate-400 italic mt-1.5 bg-slate-950/60 p-2 border border-slate-850 rounded">"${r.reason}"</div>` : ""}
          </div>
          ${r.status === "pending" ? `
            <button class="com-act-cancel-badge-req text-[8px] bg-slate-950 hover:bg-rose-950 border border-slate-800/80 hover:border-rose-900 text-slate-400 hover:text-rose-400 py-1.5 px-3 rounded-xl transition cursor-pointer" data-req-id="${r.id}">
              Cancel
            </button>
          ` : ""}
        `;

        listEl.appendChild(item);
      });

      // Bind cancel buttons
      listEl.querySelectorAll(".com-act-cancel-badge-req").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const reqId = e.target.getAttribute("data-req-id");
          appInstance.cancelBadgeRequest(reqId);
        });
      });
    }
  }
}
