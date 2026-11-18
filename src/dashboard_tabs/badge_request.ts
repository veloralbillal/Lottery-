/**
 * Lottery Winner - Premium Badge Applications Module (badge_request.js)
 * 
 * Submits custom justification messages and verifies approved badge statuses.
 */

export class BadgeRequestTab {
  private static initialized = false;

  static init(appInstance: any) {
    if (this.initialized) return;
    this.initialized = true;
    console.log("Badge Request Tab Module initialized successfully.");

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest("#badge-request-back-btn")) {
        e.preventDefault();
        appInstance.navigateTo("profile");
        return;
      }

      if (target.closest("#user-submit-badge-req-btn")) {
        const selectEl = document.getElementById("user-badge-req-select") as HTMLSelectElement | null;
        const reasonEl = document.getElementById("user-badge-req-reason") as HTMLTextAreaElement | null;
        if (!selectEl || !reasonEl) return;

        const requestedBadge = selectEl.value;
        const reason = reasonEl.value.trim();

        if (!reason) {
          appInstance.showToast("Please provide a justification reason for your request.", "error");
          return;
        }
        if (!appInstance.currentUser) return;

        if (appInstance.currentUser.customBadge === requestedBadge) {
          appInstance.showToast(`You are already assigned the ${requestedBadge.toUpperCase()} badge!`, "info");
          return;
        }

        if (!Array.isArray(appInstance.db.badgeRequests)) {
          appInstance.db.badgeRequests = [];
        }

        const existingPending = appInstance.db.badgeRequests.find(
          (r: any) => r.userId === appInstance.currentUser.id && r.requestedBadge === requestedBadge && r.status === "pending"
        );
        if (existingPending) {
          appInstance.showToast(`You already have a pending request for the ${requestedBadge.toUpperCase()} badge!`, "warning");
          return;
        }

        const newReq = {
          id: "breq_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
          userId: appInstance.currentUser.id,
          username: appInstance.currentUser.username,
          requestedBadge,
          reason,
          date: new Date().toISOString(),
          status: "pending"
        };

        appInstance.db.badgeRequests.push(newReq);
        appInstance.saveDB();
        reasonEl.value = "";
        appInstance.showToast("Your premium badge request has been successfully submitted for review!", "success");
        BadgeRequestTab.render(appInstance);
        return;
      }

      const cancelBtn = target.closest(".com-act-cancel-badge-req");
      if (cancelBtn) {
        const reqId = cancelBtn.getAttribute("data-req-id");
        if (reqId) {
          BadgeRequestTab.cancelBadgeRequest(appInstance, reqId);
        }
      }
    });
  }

  static cancelBadgeRequest(appInstance: any, reqId: string) {
    if (!appInstance?.db) return;
    appInstance.db.badgeRequests = (appInstance.db.badgeRequests || []).filter((r: any) => r.id !== reqId);
    appInstance.saveDB();
    appInstance.showToast("Badge application request cancelled successfully.", "info");
    BadgeRequestTab.render(appInstance);
  }

  static render(appInstance: any) {
    const listEl = document.getElementById("user-badge-reqs-history-list");
    if (!listEl || !appInstance?.currentUser) return;
    listEl.innerHTML = "";

    const myReqs = (appInstance.db?.badgeRequests || []).filter((r: any) => r.userId === appInstance.currentUser.id);
    
    if (myReqs.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-6 bg-slate-900 border border-slate-850 text-[10px] text-slate-500 rounded-2xl font-mono">
          No previous badge requests submitted.
        </div>
      `;
    } else {
      // Sort newest first
      const sorted = [...myReqs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      sorted.forEach(r => {
        const item = document.createElement("div");
        item.className = "bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl flex justify-between items-center text-xs font-mono";
        
        let badgeLabel = (r.requestedBadge || "").toUpperCase();
        const badgeMap: Record<string, string> = {
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
              <span class="px-1.5 py-0.5 rounded text-[8px] font-bold ${statusClass}">${(r.status || "pending").toUpperCase()}</span>
            </div>
            <div class="text-[9px] text-slate-500 font-mono mt-1">Submitted: ${new Date(r.date).toLocaleDateString()}</div>
            ${r.reason ? `<div class="text-[9px] text-slate-400 italic mt-1.5 bg-slate-950/60 p-2 border border-slate-850 rounded">"${appInstance.escapeHTML(r.reason)}"</div>` : ""}
          </div>
          ${r.status === "pending" ? `
            <button type="button" class="com-act-cancel-badge-req text-[8px] bg-slate-950 hover:bg-rose-950 border border-slate-800/80 hover:border-rose-900 text-slate-400 hover:text-rose-400 py-1.5 px-3 rounded-xl transition cursor-pointer" data-req-id="${r.id}">
              Cancel
            </button>
          ` : ""}
        `;

        listEl.appendChild(item);
      });
    }
    const container = document.getElementById("tab-badge-request");
    if (container && typeof appInstance.refreshIconsForContainer === "function") {
      appInstance.refreshIconsForContainer(container);
    } else if (typeof appInstance.refreshIcons === "function") {
      appInstance.refreshIcons();
    }
  }
}
