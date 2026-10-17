/**
 * Standalone Comment Moderation Suite (src/comments.ts)
 * 
 * Provides a dedicated standalone separate page and file (comments.html)
 * for moderating user comments across all blog articles.
 */

class StandaloneCommentsApp {
  private db: any = {};
  private currentFilter: string = "all";

  constructor() {
    this.loadState();
    this.render();
  }

  private loadState() {
    try {
      const raw = localStorage.getItem("lw_lottery_db_v3");
      if (raw) {
        this.db = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Could not load database:", e);
    }
    if (!this.db || typeof this.db !== "object") {
      this.db = {};
    }
    if (!this.db.blogs) this.db.blogs = [];
    if (!this.db.blogComments) this.db.blogComments = [];
  }

  private saveDB() {
    try {
      localStorage.setItem("lw_lottery_db_v3", JSON.stringify(this.db));
    } catch (e) {
      console.warn("Could not save database:", e);
    }
  }

  private showToast(message: string, type: "success" | "error" | "info" = "success") {
    const existing = document.getElementById("toast-notification");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "toast-notification";
    const colors = {
      success: "bg-emerald-950/90 border-emerald-500/50 text-emerald-200",
      error: "bg-rose-950/90 border-rose-500/50 text-rose-200",
      info: "bg-slate-900/90 border-slate-700 text-slate-200"
    };
    toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md transition-all duration-300 animate-fade-in ${colors[type]}`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  private escapeHTML(str: string): string {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private render() {
    const root = document.getElementById("comments-app-root");
    if (!root) return;

    const comments = this.db.blogComments || [];
    const pendingCount = comments.filter((c: any) => c.status === "pending").length;
    const filteredComments = comments.filter((c: any) => {
      if (this.currentFilter === "all") return true;
      return c.status === this.currentFilter;
    });

    root.innerHTML = `
      <!-- Standalone Top Header Bar -->
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 shadow-xl">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <a href="index.html#admin" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white hover:bg-amber-500/20 flex items-center justify-center transition cursor-pointer shadow active:scale-95" title="Back to Admin Dashboard">
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </a>
            <div class="leading-tight">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span class="text-[9px] uppercase font-mono font-black text-rose-400 tracking-wider">ADMIN CONTROL SUITE</span>
              </div>
              <h1 class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Comment Moderation Screen</span>
                <i class="fa-solid fa-comments text-xs text-amber-400"></i>
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[9.5px] font-mono font-bold text-rose-300 bg-rose-950/60 px-3 py-1.5 rounded-full border border-rose-800/40 shadow-inner">
              ${pendingCount} Pending Reviews
            </span>
          </div>
        </div>
      </header>

      <!-- Main Container -->
      <main class="max-w-4xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-24">
        <!-- Filter Bar -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-xl">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-white font-mono">Filter Status:</span>
            <div class="flex items-center gap-1.5">
              ${["all", "pending", "approved", "rejected"].map((st) => `
                <button class="comment-filter-btn text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer capitalize ${this.currentFilter === st ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'}" data-filter="${st}">
                  ${st} (${comments.filter((c: any) => st === 'all' ? true : c.status === st).length})
                </button>
              `).join("")}
            </div>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">Showing ${filteredComments.length} comments</span>
        </div>

        <!-- Comments List -->
        <div class="space-y-4">
          ${filteredComments.length === 0 ? `
            <div class="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-3">
              <i class="fa-regular fa-comment-dots text-4xl text-slate-600"></i>
              <p class="text-xs text-slate-400 font-mono">No comments found matching filter "${this.currentFilter}".</p>
            </div>
          ` : `
            ${filteredComments.map((c: any) => {
              const post = (this.db.blogs || []).find((b: any) => b.id === c.blogId);
              const postTitle = post ? post.title : 'Unknown Article';

              return `
                <div class="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 sm:p-5 rounded-2xl space-y-3 transition shadow-xl">
                  <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div class="flex items-center gap-2">
                      <strong class="text-amber-300 font-mono">@${this.escapeHTML(c.username)}</strong>
                      <span class="text-[10px] text-slate-500 font-mono">on "${this.escapeHTML(postTitle)}"</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] text-slate-500 font-mono">${c.date || new Date().toLocaleDateString()}</span>
                      <span class="text-[9px] font-mono px-2.5 py-0.5 rounded font-bold uppercase ${c.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : c.status === 'rejected' ? 'bg-rose-950 text-rose-400 border border-rose-800/40' : 'bg-amber-950 text-amber-400 border border-amber-600/40'}">
                        ${c.status || 'pending'}
                      </span>
                    </div>
                  </div>

                  <p class="text-xs text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-sans leading-relaxed">
                    ${this.escapeHTML(c.text)}
                  </p>

                  <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button class="comment-action-btn text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5" data-id="${c.id}" data-action="approved">
                      <i class="fa-solid fa-check"></i> Approve
                    </button>
                    <button class="comment-action-btn text-xs font-bold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5" data-id="${c.id}" data-action="rejected">
                      <i class="fa-solid fa-ban"></i> Reject
                    </button>
                    <button class="comment-action-btn text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5" data-id="${c.id}" data-action="delete">
                      <i class="fa-solid fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          `}
        </div>
      </main>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    const filterBtns = document.querySelectorAll(".comment-filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e: any) => {
        this.currentFilter = e.currentTarget.getAttribute("data-filter");
        this.render();
      });
    });

    const actionBtns = document.querySelectorAll(".comment-action-btn");
    actionBtns.forEach((btn) => {
      btn.addEventListener("click", (e: any) => {
        const id = e.currentTarget.getAttribute("data-id");
        const action = e.currentTarget.getAttribute("data-action");

        if (!this.db.blogComments) this.db.blogComments = [];

        if (action === "delete") {
          this.db.blogComments = this.db.blogComments.filter((c: any) => c.id !== id);
          this.showToast("Comment deleted successfully.", "error");
        } else {
          const comment = this.db.blogComments.find((c: any) => c.id === id);
          if (comment) {
            comment.status = action;
            this.showToast(`Comment status updated to "${action}"! ✅`, "success");
          }
        }

        this.saveDB();
        this.render();
      });
    });
  }
}

new StandaloneCommentsApp();
