/**
 * Standalone Article Editor Suite (src/admin-blog-editor.ts)
 */

class StandaloneEditorApp {
  private db: any = {};
  private editId: string | null = null;

  constructor() {
    this.loadState();
    this.parseUrl();
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

  private parseUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("edit");
    if (id) this.editId = id;
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

  private formatMarkdown(raw: string = ""): string {
    if (!raw) return "";
    let html = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-black text-amber-300 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-black text-white mt-5 mb-2.5">$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic text-slate-200">$1</em>');
    html = html.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/gim, '<a href="$2" target="_blank" class="text-cyan-400 underline">$1</a>');
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-amber-500/60 pl-3 py-1 my-2 italic text-slate-300 bg-amber-500/5">$1</blockquote>');
    html = html.replace(/\n\n/g, '<div class="h-3"></div>').replace(/\n/g, '<br/>');
    return html;
  }

  private render() {
    const root = document.getElementById("editor-app-root");
    if (!root) return;

    const editingPost = this.editId ? (this.db.blogs || []).find((b: any) => b.id === this.editId) : null;

    root.innerHTML = `
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 shadow-xl">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <a href="index.html#admin" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white flex items-center justify-center transition shadow">
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </a>
            <div class="leading-tight">
              <span class="text-[9px] uppercase font-mono font-black text-amber-400 tracking-wider">ADMIN ARTICLE SUITE</span>
              <h1 class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>${editingPost ? 'Edit Blog Article' : 'Publish New Blog Article'}</span>
                <i class="fa-solid fa-pen-nib text-xs text-amber-400"></i>
              </h1>
            </div>
          </div>
          <a href="admin-articles.html" class="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl hover:text-amber-300 transition">
            <i class="fa-solid fa-list mr-1"></i> All Articles
          </a>
        </div>
      </header>

      <main class="max-w-4xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-24 font-sans">
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Article Title *</label>
              <input type="text" id="editor-title" value="${editingPost ? this.escapeHTML(editingPost.title) : ''}" placeholder="e.g. How to Win Mega Progressive Jackpot" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
            </div>
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Category *</label>
              <select id="editor-category" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition">
                ${(this.db.blogCategories || []).map((cat: any) => `
                  <option value="${this.escapeHTML(cat.name)}" ${editingPost && editingPost.category === cat.name ? 'selected' : ''}>
                    ${this.escapeHTML(cat.name)} (${cat.slug})
                  </option>
                `).join("")}
              </select>
            </div>
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Author Name</label>
              <input type="text" id="editor-author" value="${editingPost ? this.escapeHTML(editingPost.author) : 'Admin Editorial'}" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
            </div>
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Cover Image (URL or Upload File)</label>
              <div class="flex items-center gap-2">
                <input type="text" id="editor-image" value="${editingPost ? this.escapeHTML(editingPost.image) : 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=60'}" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
                <label class="shrink-0 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5">
                  <i class="fa-solid fa-upload"></i> Upload
                  <input type="file" id="editor-image-file" accept="image/*" class="hidden" />
                </label>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Short Excerpt (Feed Summary & Meta Description)</label>
              <textarea id="editor-excerpt" rows="2" placeholder="Brief summary displayed on article feed cards and Google search snippet..." class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white outline-none resize-none transition">${editingPost ? this.escapeHTML(editingPost.excerpt || '') : ''}</textarea>
            </div>

            <!-- Live SEO Preview -->
            <div class="md:col-span-2 bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <i class="fa-solid fa-globe"></i> Live Advanced SEO & Search Snippet Preview
                </span>
                <span class="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">Active Live SEO</span>
              </div>
              <div class="bg-white/5 border border-slate-800 p-3 rounded-xl space-y-1 font-sans">
                <div id="live-seo-title" class="text-xs font-bold text-cyan-400 truncate">${editingPost ? this.escapeHTML(editingPost.title) : 'Article Title Preview'}</div>
                <div id="live-seo-url" class="text-[10px] font-mono text-emerald-400 truncate">https://luckybox.app/blog/${editingPost ? (editingPost.categorySlug || 'article') : 'article-slug'}</div>
                <div id="live-seo-desc" class="text-[11px] text-slate-300 line-clamp-2">${editingPost ? this.escapeHTML(editingPost.excerpt || '') : 'Article meta description snippet preview will appear here as you type...'}</div>
              </div>
            </div>

            <!-- Content Editor -->
            <div class="md:col-span-2 space-y-2">
              <label class="text-[10px] font-mono text-slate-400 block">Article Content (Rich Text / Markdown) *</label>
              <textarea id="editor-content" rows="10" placeholder="Type article content here..." class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3.5 text-xs text-white outline-none resize-none font-mono leading-relaxed transition">${editingPost ? this.escapeHTML(editingPost.content || '') : ''}</textarea>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button id="editor-save-btn" class="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition hover:opacity-95 shadow-lg shadow-amber-500/20 cursor-pointer">
              ${editingPost ? 'Update Article 💾' : 'Publish Article 🚀'}
            </button>
            <a href="admin-articles.html" class="px-5 py-3 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-xs font-bold">Cancel</a>
          </div>
        </div>
      </main>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    const fileInp = document.getElementById("editor-image-file") as HTMLInputElement;
    const urlInp = document.getElementById("editor-image") as HTMLInputElement;
    if (fileInp && urlInp) {
      fileInp.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev: any) => {
            urlInp.value = ev.target.result;
            this.showToast("Cover image uploaded successfully! 📷", "success");
          };
          reader.readAsDataURL(file);
        }
      };
    }

    const titleInp = document.getElementById("editor-title") as HTMLInputElement;
    const excerptInp = document.getElementById("editor-excerpt") as HTMLTextAreaElement;
    const liveTitle = document.getElementById("live-seo-title");
    const liveDesc = document.getElementById("live-seo-desc");
    const liveUrl = document.getElementById("live-seo-url");

    if (titleInp && liveTitle) {
      titleInp.oninput = () => {
        liveTitle.textContent = titleInp.value || "Article Title Preview";
        if (liveUrl) {
          const slug = (titleInp.value || "article").toLowerCase().replace(/[^a-z0-9]/g, '-');
          liveUrl.textContent = `https://luckybox.app/blog/${slug}`;
        }
      };
    }
    if (excerptInp && liveDesc) {
      excerptInp.oninput = () => {
        liveDesc.textContent = excerptInp.value || "Article meta description snippet preview will appear here as you type...";
      };
    }

    const saveBtn = document.getElementById("editor-save-btn");
    if (saveBtn) {
      saveBtn.onclick = () => {
        const title = (document.getElementById("editor-title") as HTMLInputElement)?.value.trim();
        const category = (document.getElementById("editor-category") as HTMLSelectElement)?.value;
        const author = (document.getElementById("editor-author") as HTMLInputElement)?.value.trim() || "Admin";
        const image = (document.getElementById("editor-image") as HTMLInputElement)?.value.trim();
        const excerpt = (document.getElementById("editor-excerpt") as HTMLTextAreaElement)?.value.trim();
        const content = (document.getElementById("editor-content") as HTMLTextAreaElement)?.value.trim();

        if (!title || !content) {
          this.showToast("Please provide article title and content.", "error");
          return;
        }

        const matchedCat = (this.db.blogCategories || []).find((c: any) => c.name === category);
        const categorySlug = matchedCat ? matchedCat.slug : category.toLowerCase().replace(/[^a-z0-9]/g, '-');

        if (this.editId) {
          const post = (this.db.blogs || []).find((b: any) => b.id === this.editId);
          if (post) {
            post.title = title;
            post.category = category;
            post.categorySlug = categorySlug;
            post.author = author;
            post.image = image || post.image;
            post.excerpt = excerpt || title;
            post.content = content;
            this.saveDB();
            this.showToast("Article updated successfully! 💾", "success");
            setTimeout(() => window.location.href = "admin-articles.html", 1000);
            return;
          }
        }

        const newPost = {
          id: "blog-" + Date.now(),
          title,
          category,
          categorySlug,
          author,
          date: new Date().toISOString().split("T")[0],
          readTime: "3 min read",
          views: 1,
          likes: 0,
          image: image || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=60",
          excerpt: excerpt || title,
          content
        };

        if (!this.db.blogs) this.db.blogs = [];
        this.db.blogs.unshift(newPost);
        this.saveDB();
        this.showToast("Blog article published successfully! 🎉", "success");
        setTimeout(() => window.location.href = "admin-articles.html", 1000);
      };
    }
  }
}

new StandaloneEditorApp();
