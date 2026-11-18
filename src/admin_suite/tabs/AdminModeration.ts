export const AdminModeration = {
  renderAdminBadgeRequests(this: any) {
    const listEl = document.getElementById("admin-badge-requests-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    const reqs = this.db.badgeRequests || [];
    if (reqs.length === 0) {
      listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500 font-mono text-[10.5px]">No pending badge requests.</td></tr>`;
      return;
    }

    reqs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach((br: any) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 border-b border-slate-800/40 transition";
      
      const badgeColor = br.status === "approved" ? "bg-emerald-950 text-emerald-400" : br.status === "pending" ? "bg-amber-950 text-amber-400" : "bg-rose-950 text-rose-400";

      row.innerHTML = `
        <td class="p-3">
          <div class="font-bold text-white">@${br.username}</div>
          <div class="text-[9px] text-slate-500 font-mono">${new Date(br.date).toLocaleDateString()}</div>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded-lg text-[9px] font-black bg-slate-950 text-amber-400 border border-amber-900/20 uppercase">${br.badgeType}</span>
        </td>
        <td class="p-3 max-w-[200px] truncate text-[10px] text-slate-400 italic">"${br.reason}"</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${badgeColor}">${br.status}</span>
        </td>
        <td class="p-3 text-right">
          ${br.status === "pending" ? `
            <div class="flex justify-end gap-1.5">
               <button class="approve-badge-btn bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg transition" data-id="${br.id}"><i data-lucide="check" class="w-3.5 h-3.5"></i></button>
               <button class="reject-badge-btn bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-lg transition" data-id="${br.id}"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
            </div>
          ` : `<button class="delete-badge-req-btn text-slate-600 hover:text-rose-500 transition" data-id="${br.id}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`}
        </td>
      `;
      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".approve-badge-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const req = this.db.badgeRequests.find((r: any) => r.id === id);
        if (req) {
          req.status = "approved";
          const user = this.db.users.find((u: any) => u.id === req.userId);
          if (user) user.customBadge = req.badgeType;
          this.saveDB();
          this.renderAdminBadgeRequests();
          this.showToast("Badge request approved!", "success");
        }
      });
    });

    listEl.querySelectorAll(".reject-badge-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const req = this.db.badgeRequests.find((r: any) => r.id === id);
        if (req) {
          req.status = "rejected";
          this.saveDB();
          this.renderAdminBadgeRequests();
          this.showToast("Badge request rejected.", "error");
        }
      });
    });

    this.refreshIcons();
  },

  renderAdminVideoBounty(this: any) {
    const listEl = document.getElementById("admin-video-bounty-tbody");
    if (!listEl) return;
    listEl.innerHTML = "";

    const bounties = this.db.videoBounties || [];
    if (bounties.length === 0) {
      listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500 font-mono text-xs">No pending video bounty submissions.</td></tr>`;
      return;
    }

    bounties.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach((vb: any) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-900/40 border-b border-slate-800/40 transition";
      
      const badgeColor = vb.status === "approved" ? "bg-emerald-950 text-emerald-400" : vb.status === "pending" ? "bg-amber-950 text-amber-400" : "bg-rose-950 text-rose-400";

      row.innerHTML = `
        <td class="p-3">
          <div class="font-bold text-white">@${vb.username}</div>
          <div class="text-[9px] text-slate-500 font-mono">${new Date(vb.date).toLocaleDateString()}</div>
        </td>
        <td class="p-3">
          <a href="${vb.videoUrl}" target="_blank" class="text-cyan-400 hover:underline flex items-center gap-1 text-[10.5px] font-bold">
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Watch Video
          </a>
        </td>
        <td class="p-3 font-mono text-emerald-400 font-bold">৳${vb.expectedReward || 100}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${badgeColor}">${vb.status}</span>
        </td>
        <td class="p-3 text-right">
          ${vb.status === "pending" ? `
            <div class="flex justify-end gap-1.5">
               <button class="approve-bounty-btn bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg transition" data-id="${vb.id}"><i data-lucide="check" class="w-3.5 h-3.5"></i></button>
               <button class="reject-bounty-btn bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-lg transition" data-id="${vb.id}"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
            </div>
          ` : `<button class="delete-bounty-btn text-slate-600 hover:text-rose-500 transition" data-id="${vb.id}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`}
        </td>
      `;
      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".approve-bounty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const req = this.db.videoBounties.find((r: any) => r.id === id);
        if (req) {
          req.status = "approved";
          const user = this.db.users.find((u: any) => u.id === req.userId);
          if (user) user.balance += (req.expectedReward || 100);
          this.saveDB();
          this.renderAdminVideoBounty();
          this.showToast("Video bounty approved & rewarded!", "success");
        }
      });
    });

    this.refreshIcons();
  }
};
