/**
 * Lottery Winner - Bounty Tasks Module (missions.js)
 * 
 * Sets task redirection urls and handles Google Drive screenshot upload submission.
 */

export class MissionsTab {
  static init(appInstance) {
    console.log("Missions Tab Module initialized successfully.");
  }

  static render(appInstance) {
    const listContainer = document.getElementById("user-daily-tasks-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    const tasks = appInstance.db.dailyTasks || [];
    const submissions = appInstance.db.taskSubmissions || [];

    if (tasks.length === 0) {
      listContainer.innerHTML = `
        <div class="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-2">
          <i class="fa-solid fa-list-check text-slate-700 text-3xl"></i>
          <p class="text-slate-400 font-bold text-xs">No tasks currently broadcasted.</p>
          <p class="text-slate-500 text-[10px]">Contact our executive administrator to get promotional jobs assigned.</p>
        </div>
      `;
      return;
    }

    tasks.forEach(task => {
      // Find user submission for this task
      const userSub = submissions.find(s => s.taskId === task.id && s.userName === appInstance.currentUser.username);
      
      let statusBadge = "";
      let actionArea = "";

      if (userSub) {
        if (userSub.status === "pending") {
          statusBadge = `<span class="bg-amber-955/20 border border-amber-900/45 text-amber-400 font-extrabold text-[8px] tracking-wider uppercase px-2.5 py-1 rounded-full"><i class="fa-solid fa-hourglass-half mr-1 text-[8px]"></i> Pending Review</span>`;
          actionArea = `
            <div class="bg-slate-950 p-3 rounded-2xl border border-slate-900 flex items-center justify-between gap-3 text-[10px]">
              <span class="text-slate-400">Proof submitted. Waiting for dynamic review:</span>
              <img src="${userSub.screenshot}" class="w-10 h-10 aspect-square object-cover rounded border border-slate-805 cursor-zoom-in" onclick="window.open('${userSub.screenshot}', '_blank')" />
            </div>
          `;
        } else if (userSub.status === "approved") {
          statusBadge = `<span class="bg-emerald-955/20 border border-emerald-900/45 text-emerald-400 font-extrabold text-[8px] tracking-wider uppercase px-2.5 py-1 rounded-full"><i class="fa-solid fa-check-double mr-1 text-[8px]"></i> Approved</span>`;
          actionArea = `
            <div class="bg-emerald-955/10 p-3 rounded-2xl border border-emerald-900/10 text-emerald-400 text-[10px] flex items-center gap-2">
              <i class="fa-solid fa-gift text-sm animate-bounce"></i>
              <span>Earned <strong>৳${task.reward}</strong> balance credited directly! (Notes: ${appInstance.escapeHTML(userSub.adminNotes || "Good job")})</span>
            </div>
          `;
        } else if (userSub.status === "rejected") {
          statusBadge = `<span class="bg-rose-955/20 border border-rose-900/40 text-rose-400 font-extrabold text-[8px] tracking-wider uppercase px-2.5 py-1 rounded-full"><i class="fa-solid fa-circle-xmark mr-1 text-[8px]"></i> Rejected</span>`;
          actionArea = `
            <div class="space-y-2">
              <div class="bg-rose-955/10 p-3 rounded-2xl border border-rose-900/15 text-rose-400 text-[10px] flex items-center gap-2">
                <i class="fa-solid fa-circle-exclamation text-sm"></i>
                <span>Disapproved: <strong>${appInstance.escapeHTML(userSub.adminNotes || 'Screenshot blurred or irrelevant.')}</strong></span>
              </div>
              <button onclick="window.appInstance.reSubmitTask('${task.id}')" class="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 py-2 rounded-xl text-[10px] text-white font-bold transition">
                Resubmit New Screenshot Proof
              </button>
            </div>
          `;
        }
      } else {
        statusBadge = `<span class="bg-cyan-955/20 border border-cyan-900/40 text-cyan-400 font-extrabold text-[8px] tracking-wider uppercase px-2.5 py-1 rounded-full"><i class="fa-solid fa-bullseye mr-1 text-[8px]"></i> Open Task</span>`;
        actionArea = `
          <div class="space-y-3">
            <div class="flex items-center gap-2.5">
              <a href="${appInstance.escapeHTML(task.url)}" target="_blank" class="w-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 py-2.5 rounded-xl text-center text-[10px] text-white font-extrabold transition">
                <i class="fa-solid fa-external-link mr-1"></i> Open Task Link
              </a>
              <button onclick="document.getElementById('task-img-upload-${task.id}').click()" class="w-1/2 bg-slate-950 hover:bg-slate-900 border border-slate-800 py-2.5 rounded-xl text-center text-[10px] text-white font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-cloud-arrow-up text-cyan-400 animate-pulse"></i> Upload Screenshot
              </button>
            </div>
            <input type="file" id="task-img-upload-${task.id}" class="hidden" accept="image/*" onchange="window.appInstance.handleScreenshotUpload(this, '${task.id}')" />
          </div>
        `;
      }

      // Check category details
      let catIcon = "📺";
      if (task.category === "telegram") catIcon = "✈️";
      if (task.category === "facebook") catIcon = "👍";
      if (task.category === "tiktok") catIcon = "🎵";
      if (task.category === "other") catIcon = "⚙️";

      const taskDiv = document.createElement("div");
      taskDiv.className = "bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl font-mono text-xs text-left";
      taskDiv.innerHTML = `
        <div class="flex items-start justify-between gap-3 border-b border-slate-850 pb-3">
          <div class="space-y-2">
            <h4 class="text-xs font-black text-white flex items-center gap-1.5">
              <span>${catIcon}</span> ${appInstance.escapeHTML(task.title)}
            </h4>
            <div class="flex flex-wrap items-center gap-2 text-[9px] text-slate-500 font-sans">
              <span>Earnings: <strong class="text-amber-400 font-mono">৳${task.reward}.00</strong></span>
              <span>•</span>
              <span>Category: <strong class="capitalize text-cyan-400">${task.category}</strong></span>
            </div>
          </div>
          ${statusBadge}
        </div>

        <div class="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-850/40 text-[10.5px]">
          <span class="text-slate-500 font-bold block text-[8.5px] uppercase tracking-wider">Instructions:</span>
          <p class="text-slate-350 leading-relaxed font-sans">${appInstance.escapeHTML(task.instructions)}</p>
        </div>

        ${actionArea}
      `;
      listContainer.appendChild(taskDiv);
    });
  }
}

export const TasksTab = MissionsTab;
