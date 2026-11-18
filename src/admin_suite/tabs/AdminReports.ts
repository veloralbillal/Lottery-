export const AdminReports = {
  renderAdminReports(this: any) {
    const postTabBtn = document.getElementById("admin-subtab-post-reports");
    const commentTabBtn = document.getElementById("admin-subtab-comment-reports");

    const postContainer = document.getElementById("admin-post-reports-container");
    const commentContainer = document.getElementById("admin-comment-reports-container");

    if (!this.currentAdminReportsTab) {
      this.currentAdminReportsTab = "post";
    }

    if (this.currentAdminReportsTab === "post") {
      if (postTabBtn) {
        postTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold bg-slate-900 border border-slate-800 text-white cursor-pointer transition";
      }
      if (commentTabBtn) {
        commentTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold text-slate-400 cursor-pointer transition hover:text-white";
      }
      if (postContainer) postContainer.classList.remove("hidden");
      if (commentContainer) commentContainer.classList.add("hidden");
    } else {
      if (postTabBtn) {
        postTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold text-slate-400 cursor-pointer transition hover:text-white";
      }
      if (commentTabBtn) {
        commentTabBtn.className = "py-2 rounded-lg text-center text-xs font-bold bg-slate-900 border border-slate-800 text-white cursor-pointer transition";
      }
      if (postContainer) postContainer.classList.add("hidden");
      if (commentContainer) commentContainer.classList.remove("hidden");
    }

    const postReports = (this.db.reports || []).filter((r: any) => r.type === "post" && r.status === "pending");
    const commentReports = (this.db.reports || []).filter((r: any) => r.type === "comment" && r.status === "pending");

    const postCountBadge = document.getElementById("admin-post-reports-count");
    if (postCountBadge) postCountBadge.innerText = String(postReports.length);

    const commentCountBadge = document.getElementById("admin-comment-reports-count");
    if (commentCountBadge) commentCountBadge.innerText = String(commentReports.length);

    const postList = document.getElementById("admin-post-reports-list");
    if (postList) {
      postList.innerHTML = "";
      if (postReports.length === 0) {
        postList.innerHTML = `
          <div class="text-center py-8 text-slate-500 font-sans">
            <i data-lucide="check-circle" class=" text-slate-700 text-lg block mb-1"></i>
            No pending post reports. Clear slate!
          </div>
        `;
      } else {
        postReports.forEach((rep: any) => {
          const card = document.createElement("div");
          card.className = "bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-3";
          card.innerHTML = `
            <div class="flex justify-between items-start text-[10px] text-slate-400 border-b border-slate-900 pb-2">
              <div>
                <span class="text-rose-500 font-bold">Post Report #${rep.id}</span>
                <div class="text-[9px] text-slate-500 font-mono mt-0.5">Date: ${new Date(rep.date).toLocaleString()}</div>
              </div>
              <span class="bg-red-955/40 text-red-400 px-2 py-0.5 rounded uppercase font-bold text-[8px] border border-red-900/30">Pending</span>
            </div>

            <div class="space-y-1.5 font-sans">
              <div>
                <span class="text-[9px] uppercase font-mono text-slate-500 block">Reported Post Content:</span>
                <div class="bg-slate-900 p-2.5 rounded-lg text-xs text-white border border-slate-800 font-sans italic max-h-24 overflow-y-auto">
                  "${rep.targetText}"
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[10px] mt-1 text-slate-300">
                <div><strong class="text-slate-500">Author:</strong> <span class="text-cyan-400 font-bold">@${rep.authorUsername}</span></div>
                <div><strong class="text-slate-400">Reporter:</strong> <span class="text-slate-300">@${rep.reporterUsername}</span></div>
              </div>
              <div class="text-amber-500 text-xs py-1">
                <strong class="text-slate-500 text-[10px]">Reason:</strong> "${rep.reason}"
              </div>
            </div>

            <div class="grid grid-cols-2 xs:grid-cols-3 gap-1.5 pt-2 border-t border-slate-900 font-sans">
              <button class="admin-act-ban-user bg-rose-955/45 hover:bg-rose-900 border border-rose-800/40 text-rose-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i data-lucide="user-minus" class=" mr-1"></i> Ban Permanent
              </button>
              <button class="admin-act-temp-user bg-amber-950/45 hover:bg-amber-900 border border-amber-800/40 text-amber-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i data-lucide="clock" class=" mr-1"></i> Temp Block (24h)
              </button>
              <button class="admin-act-sched-user bg-indigo-950/45 hover:bg-indigo-900 border border-indigo-800/40 text-indigo-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i data-lucide="calendar" class=" mr-1"></i> Schedule (7 Days)
              </button>
              <button class="admin-act-remove-post bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-500 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-1 cursor-pointer" data-post-id="${rep.targetId}" data-rep-id="${rep.id}">
                <i data-lucide="trash-2" class=" mr-1"></i> Delete Post Content
              </button>
              <button class="admin-act-dismiss bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-2 cursor-pointer" data-rep-id="${rep.id}">
                <i data-lucide="check" class=" mr-1"></i> Dismiss Report
              </button>
            </div>
          `;
          postList.appendChild(card);
        });
      }
    }

    const commentList = document.getElementById("admin-comment-reports-list");
    if (commentList) {
      commentList.innerHTML = "";
      if (commentReports.length === 0) {
        commentList.innerHTML = `
          <div class="text-center py-8 text-slate-500 font-sans">
            <i data-lucide="check-circle" class=" text-slate-700 text-lg block mb-1"></i>
            No pending comment reports. Clear slate!
          </div>
        `;
      } else {
        commentReports.forEach((rep: any) => {
          const card = document.createElement("div");
          card.className = "bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-3";
          card.innerHTML = `
            <div class="flex justify-between items-start text-[10px] text-slate-400 border-b border-slate-900 pb-2">
              <div>
                <span class="text-yellow-500 font-bold">Comment Report #${rep.id}</span>
                <div class="text-[9px] text-slate-500 font-mono mt-0.5">Date: ${new Date(rep.date).toLocaleString()}</div>
              </div>
              <span class="bg-amber-950/40 text-amber-400 px-2 py-0.5 rounded uppercase font-bold text-[8px] border border-amber-900/30">Pending</span>
            </div>

            <div class="space-y-1.5 font-sans">
              <div>
                <span class="text-[9px] uppercase font-mono text-slate-500 block">Reported Comment Content:</span>
                <div class="bg-slate-900 p-2.5 rounded-lg text-xs text-white border border-slate-800 font-sans italic max-h-24 overflow-y-auto">
                  "${rep.targetText}"
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[10px] mt-1 text-slate-300">
                <div><strong class="text-slate-500">Author:</strong> <span class="text-cyan-400 font-bold">@${rep.authorUsername}</span></div>
                <div><strong class="text-slate-400">Reporter:</strong> <span class="text-slate-300">@${rep.reporterUsername}</span></div>
              </div>
              <div class="text-amber-500 text-xs py-1">
                <strong class="text-slate-500 text-[10px]">Reason:</strong> "${rep.reason}"
              </div>
            </div>

            <div class="grid grid-cols-2 xs:grid-cols-3 gap-1.5 pt-2 border-t border-slate-900 font-sans">
              <button class="admin-act-ban-user bg-rose-955/45 hover:bg-rose-900 border border-rose-800/40 text-rose-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i data-lucide="user-minus" class=" mr-1"></i> Ban Permanent
              </button>
              <button class="admin-act-temp-user bg-amber-950/45 hover:bg-amber-900 border border-amber-800/40 text-amber-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i data-lucide="clock" class=" mr-1"></i> Temp Block (24h)
              </button>
              <button class="admin-act-sched-user bg-indigo-950/45 hover:bg-indigo-900 border border-indigo-800/40 text-indigo-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition cursor-pointer" data-username="${rep.authorUsername}" data-rep-id="${rep.id}">
                <i data-lucide="calendar" class=" mr-1"></i> Schedule (7 Days)
              </button>
              <button class="admin-act-remove-comment bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-500 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-1 cursor-pointer" data-comment-id="${rep.targetId}" data-rep-id="${rep.id}">
                <i data-lucide="trash-2" class=" mr-1"></i> Delete Reply Content
              </button>
              <button class="admin-act-dismiss bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-bold py-1.5 px-2 rounded-lg text-[9px] transition col-span-2 xs:col-span-2 cursor-pointer" data-rep-id="${rep.id}">
                <i data-lucide="check" class=" mr-1"></i> Dismiss Report
              </button>
            </div>
          `;
          commentList.appendChild(card);
        });
      }
    }

    this.refreshIcons();
  }
};
