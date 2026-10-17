/**
 * Standalone Category Management Suite (src/admin-categories.ts)
 */

class StandaloneCategoriesApp {
  private db: any = {};

  constructor() {
    this.loadState();
    this.render();
  }

  private loadState() {
    try {
      const raw = localStorage.getItem("lw_lottery_db_v3");
      if (raw) this.db = JSON.parse(raw);
    } catch (e) {
      console.warn("Could not load db:", e);
    }
    if (!this.db || typeof this.db !== "object") this.db = {};
    if (!this.db.blogs) this.db.blogs = [];
    if (!this.db.blogCategories || this.db.blogCategories.length === 0) {
      this.db.blogCategories = [
        { id: "bcat-1", name: "Lottery Tips", slug: "lottery-tips", description: "Pro mathematical patterns & draw strategies" },
        { id: "bcat-2", name: "Winners Stories", slug: "winners-stories", description: "Interviews with jackpot champions" },
        { id: "bcat-3", name: "Platform Updates", slug: "platform-updates", description: "Gateway upgrades, cashouts & fee alerts" },
        { id: "bcat-4", name: "Guides", slug: "guides", description: "Step-by-step app walkthroughs" }
      ];
    }
  }

  private saveDB() {
    try {
      localStorage.setItem("lw_lottery_db_v3", JSON.stringify(this.db));
    } catch (e) {
      console.warn("Could not save db:", e);
    }
  }

  private showToast(message: string, type: "success" | "error" = "success") {
    const existing = document.getElementById("toast-notification");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md ${type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/90 border-rose-500/50 text-rose-200'}`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  private escapeHTML(str: string): string {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  private render() {
    const root = document.getElementById("categories-app-root");
    if (!root) return;

    const categories = this.db.blogCategories || [];

    root.innerHTML = `
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 shadow-xl">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <a href="index.html#admin" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white flex items-center justify-center transition shadow">
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </a>
            <div class="leading-tight">
              <span class="text-[9px] uppercase font-mono font-black text-amber-400 tracking-wider">ADMIN CATEGORIES SUITE</span>
              <h1 class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Category Taxonomy Screen</span>
                <i class="fa-solid fa-tags text-xs text-amber-400"></i>
              </h1>
            </div>
          </div>
          <span class="text-[9.5px] font-mono font-bold text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-full border border-amber-800/40">
            ${categories.length} Active
          </span>
        </div>
      </header>

      <main class="max-w-4xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-24 font-sans">
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-folder-plus text-amber-400"></i> Create New Blog Category
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Category Name *</label>
              <input type="text" id="cat-name" placeholder="e.g. VIP Club Strategies" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
            </div>
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Unique Slug (URL friendly) *</label>
              <input type="text" id="cat-slug" placeholder="e.g. vip-club-strategies" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono transition" />
            </div>
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Description</label>
              <input type="text" id="cat-desc" placeholder="Brief purpose..." class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
            </div>
          </div>
          <button id="cat-add-btn" class="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition hover:opacity-95 shadow cursor-pointer">
            Add Category 🏷️
          </button>
        </div>

        <div class="space-y-3">
          <h4 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Active Categories (${categories.length})
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${categories.map((cat: any) => {
              const postsInCat = (this.db.blogs || []).filter((b: any) => b.category === cat.name || b.categorySlug === cat.slug).length;
              return `
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 flex flex-col justify-between shadow-xl">
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <h5 class="text-xs font-bold text-white flex items-center gap-2">
                        <i class="fa-solid fa-tag text-amber-400"></i> ${this.escapeHTML(cat.name)}
                      </h5>
                      <span class="bg-slate-950 border border-slate-800 text-amber-300 text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                        ${postsInCat} articles
                      </span>
                    </div>
                    <p class="text-[10px] font-mono text-cyan-400">Slug: /${cat.slug}</p>
                    <p class="text-xs text-slate-400">${this.escapeHTML(cat.description || 'No description.')}</p>
                  </div>
                  <div class="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                    <button class="cat-delete-btn text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-800/30 cursor-pointer" data-id="${cat.id}">
                      <i class="fa-solid fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </main>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    const nameInp = document.getElementById("cat-name") as HTMLInputElement;
    const slugInp = document.getElementById("cat-slug") as HTMLInputElement;

    if (nameInp && slugInp) {
      nameInp.oninput = () => {
        slugInp.value = nameInp.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      };
    }

    const addBtn = document.getElementById("cat-add-btn");
    if (addBtn) {
      addBtn.onclick = () => {
        const name = nameInp?.value.trim();
        const slug = slugInp?.value.trim();
        const desc = (document.getElementById("cat-desc") as HTMLInputElement)?.value.trim();

        if (!name || !slug) {
          this.showToast("Please provide category name and slug.", "error");
          return;
        }

        if (!this.db.blogCategories) this.db.blogCategories = [];
        this.db.blogCategories.push({
          id: "bcat-" + Date.now(),
          name,
          slug,
          description: desc
        });
        this.saveDB();
        this.showToast("Category created successfully! 🏷️", "success");
        this.render();
      };
    }

    const delBtns = document.querySelectorAll(".cat-delete-btn");
    delBtns.forEach((btn) => {
      btn.addEventListener("click", (e: any) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (this.db.blogCategories.length <= 1) {
          this.showToast("You must keep at least one category.", "error");
          return;
        }
        this.db.blogCategories = this.db.blogCategories.filter((c: any) => c.id !== id);
        this.saveDB();
        this.showToast("Category deleted.", "success");
        this.render();
      });
    });
  }
}

new StandaloneCategoriesApp();
