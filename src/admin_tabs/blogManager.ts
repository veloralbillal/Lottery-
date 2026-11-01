/**
 * Lottery Winner - Blog & Article Management System (blogManager.ts)
 * 
 * Provides full CRUD admin capabilities and user-facing reading portal for blog posts.
 * Includes SPA navigation and mobile-friendly redesign.
 */

export class BlogManager {
  static init(appInstance: any) {
    console.log("BlogManager initialized.");
    if (!appInstance.db.blogPosts) {
      appInstance.db.blogPosts = [
        {
          id: "blog_" + Date.now(),
          title: "কিভাবে লাকি উইনার অ্যাপে প্রতিদিন ফ্রি বোনাস এবং জেতার সম্ভাবনা বাড়াবেন?",
          category: "Tips & Tricks",
          author: "Admin",
          date: new Date().toISOString(),
          image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80",
          content: "লাকি উইনার প্ল্যাটফর্মে আপনি প্রতিদিন নিয়মিত চেক-ইন করে, লাকি হুইল স্পিন করে এবং বন্ধুদের রেফার করে ফ্রিতে কয়েন ও টিকিট অর্জন করতে পারবেন। এছাড়া আমাদের মেগা প্র্যাকটিক্যাল ড্র এবং মাল্টি-উইনার ক্যাটাগরিতে অংশগ্রহণ করে আপনার জেতার সুযোগ শতগুণ বাড়িয়ে নিতে পারেন। আজই আপনার অ্যাকাউন্ট লেভেল আপ করুন এবং ভিআইপি সুবিধা উপভোগ করুন!",
          published: true
        }
      ];
      appInstance.saveDB();
    }
  }

  static renderAdminSection(appInstance: any) {
    const container = document.getElementById("admin-tab-blog");
    if (!container) return;

    const posts = appInstance.db.blogPosts || [];
    const categories = appInstance.db.blogCategories || appInstance.db.categories || [];
    const comments = appInstance.db.blogComments || [];

    // Centralized Route Handler & Pre-rendered Component Visibility Toggling
    container.innerHTML = `
      <div class="space-y-6 font-sans pb-20">
        <!-- Dashboard View Container -->
        <div id="admin-subview-dashboard" class="admin-subview space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <div>
              <h3 class="text-base font-black text-white flex items-center gap-2">
                <i class="fa-solid fa-blog text-amber-400"></i> Blog & Content Management
              </h3>
              <p class="text-xs text-slate-400 font-mono">Manage articles, categories, and user discussions with SPA routing.</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <button onclick="window.navigateToAdminRoute('editor')" class="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-95 text-slate-950 text-xs font-black py-2.5 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer">
                <i class="fa-solid fa-plus text-[11px]"></i> Add Article
              </button>
              <button onclick="window.navigateToAdminRoute('categories')" class="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition shadow flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer">
                <i class="fa-solid fa-tags text-[11px]"></i> Categories
              </button>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div onclick="window.navigateToAdminRoute('articles')" class="bg-slate-900/95 border border-slate-800 hover:border-amber-500/50 p-5 rounded-3xl transition shadow-xl flex flex-col justify-between group cursor-pointer">
              <div class="space-y-2">
                <div class="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-base shadow group-hover:scale-110 transition">
                  <i class="fa-solid fa-newspaper"></i>
                </div>
                <h4 class="text-sm font-black text-white">Published Articles</h4>
                <p class="text-[11px] text-slate-400 leading-relaxed">View, edit, search, and delete published blog posts instantly.</p>
              </div>
              <div class="pt-4 flex items-center justify-between text-xs font-mono font-bold text-amber-400">
                <span>${posts.length} Posts</span>
                <span class="group-hover:translate-x-1 transition flex items-center gap-1">Open <i class="fa-solid fa-arrow-right text-[10px]"></i></span>
              </div>
            </div>

            <div onclick="window.navigateToAdminRoute('categories')" class="bg-slate-900/95 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-3xl transition shadow-xl flex flex-col justify-between group cursor-pointer">
              <div class="space-y-2">
                <div class="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base shadow group-hover:scale-110 transition">
                  <i class="fa-solid fa-tags"></i>
                </div>
                <h4 class="text-sm font-black text-white">Categories Manager</h4>
                <p class="text-[11px] text-slate-400 leading-relaxed">Add new categories via popup modal, edit, and delete category tags.</p>
              </div>
              <div class="pt-4 flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                <span>${categories.length} Categories</span>
                <span class="group-hover:translate-x-1 transition flex items-center gap-1">Open <i class="fa-solid fa-arrow-right text-[10px]"></i></span>
              </div>
            </div>

            <div onclick="window.navigateToAdminRoute('comments')" class="bg-slate-900/95 border border-slate-800 hover:border-rose-500/50 p-5 rounded-3xl transition shadow-xl flex flex-col justify-between group cursor-pointer">
              <div class="space-y-2">
                <div class="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-base shadow group-hover:scale-110 transition">
                  <i class="fa-solid fa-comments"></i>
                </div>
                <h4 class="text-sm font-black text-white">Reader Comments</h4>
                <p class="text-[11px] text-slate-400 leading-relaxed">Review user discussions, approve, or delete comments instantly.</p>
              </div>
              <div class="pt-4 flex items-center justify-between text-xs font-mono font-bold text-rose-400">
                <span>${comments.length} Comments</span>
                <span class="group-hover:translate-x-1 transition flex items-center gap-1">Open <i class="fa-solid fa-arrow-right text-[10px]"></i></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Articles View Container (RE-DESIGNED FOR MOBILE) -->
        <div id="admin-subview-articles" class="admin-subview hidden space-y-4">
          <div class="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <button onclick="window.navigateToAdminRoute('dashboard')" class="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow hover:text-white transition">
              <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <h4 class="text-xs font-black text-white font-mono uppercase tracking-widest">Articles Manager</h4>
            <button onclick="window.navigateToAdminRoute('editor')" class="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black cursor-pointer shadow">
              + New
            </button>
          </div>
          
          <div class="space-y-3">
            ${posts.length === 0 ? `
              <div class="bg-slate-900 p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-3xl">No blog articles discovered.</div>
            ` : posts.map((post: any) => `
              <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex gap-4 items-center shadow-lg group">
                <img src="${post.image || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=100&q=80'}" class="w-16 h-16 object-cover rounded-2xl border border-slate-800 shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/10 text-[9px] font-mono font-bold uppercase tracking-wider">${post.category}</span>
                    <span class="text-[9px] font-mono text-slate-500">${new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <h4 class="text-sm font-black text-white truncate leading-tight">${post.title}</h4>
                  <div class="mt-2 flex items-center gap-2">
                    <button onclick="window.editBlogPost('${post.id}')" class="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer">Edit Article</button>
                    <span class="text-slate-800">|</span>
                    <button onclick="window.deleteBlogPost('${post.id}')" class="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer">Delete</button>
                  </div>
                </div>
                <div class="hidden sm:flex flex-col items-end gap-1">
                  <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${post.published ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-400'}">${post.published ? 'Published' : 'Draft'}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Categories View Container (RE-DESIGNED WITH ADD BUTTON) -->
        <div id="admin-subview-categories" class="admin-subview hidden space-y-4">
          <div class="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <button onclick="window.navigateToAdminRoute('dashboard')" class="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow hover:text-white transition">
              <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <h4 class="text-xs font-black text-white font-mono uppercase tracking-widest">Categories Manager</h4>
            <button onclick="window.openCategoryModal()" class="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black cursor-pointer shadow">
              + Add Category
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${categories.map((c: any) => `
              <div class="flex items-center justify-between p-4 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl group hover:border-cyan-500/30 transition">
                <div>
                  <h5 class="font-black text-white text-sm tracking-tight">${c.label}</h5>
                  <span class="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">${c.name || c.id}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button onclick="window.editCategory('${c.id}')" class="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 transition flex items-center justify-center cursor-pointer">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                  </button>
                  <button onclick="window.deleteCategory('${c.id}')" class="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-500 transition flex items-center justify-center cursor-pointer">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Comments View Container -->
        <div id="admin-subview-comments" class="admin-subview hidden space-y-4">
          <div class="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <button onclick="window.navigateToAdminRoute('dashboard')" class="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow hover:text-white transition">
              <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
            </button>
            <h4 class="text-sm font-black text-white font-mono uppercase">Comments Room</h4>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-xl space-y-4">
            <i class="fa-solid fa-comments text-slate-800 text-4xl block opacity-20"></i>
            <p class="text-xs text-slate-400 font-mono">Live comment synchronization is active. All interactions are moderated in real-time.</p>
          </div>
        </div>

        <!-- Editor View Container -->
        <div id="admin-subview-editor" class="admin-subview hidden space-y-4">
          <div class="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <button onclick="window.navigateToAdminRoute('dashboard')" class="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow hover:text-white transition">
              <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <h4 class="text-sm font-black text-white font-mono uppercase">Editor Suite</h4>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-xl space-y-6 text-center">
            <div class="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 text-2xl mx-auto border border-amber-500/20 shadow-inner">
              <i class="fa-solid fa-feather-pointed"></i>
            </div>
            <div class="space-y-2">
              <h3 class="text-base font-black text-white uppercase tracking-widest">Ready to Create?</h3>
              <p class="text-xs text-slate-400 font-mono max-w-xs mx-auto">Access the full-screen professional article editor workspace with live preview.</p>
            </div>
            <a href="admin-blog-editor.html" target="_blank" class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition">
              Open Full Editor Suite <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- CATEGORY MODAL -->
      <div id="admin-category-modal" class="hidden fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-sm p-6 space-y-6 shadow-2xl relative">
          <div class="space-y-1">
            <h3 id="admin-category-modal-title" class="text-base font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-tags text-cyan-400"></i> New Category
            </h3>
            <p class="text-[10px] text-slate-500 font-mono">Create or update blog article categories.</p>
          </div>

          <form id="admin-category-form" class="space-y-4">
            <input type="hidden" id="category-edit-id" />
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Display Label</label>
              <input id="category-input-label" type="text" placeholder="e.g. Tips & Tricks" class="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white outline-none focus:border-cyan-500 transition text-sm font-bold" required />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Slug / System Name</label>
              <input id="category-input-name" type="text" placeholder="tips-tricks" class="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white outline-none focus:border-cyan-500 transition text-xs font-mono" required />
            </div>

            <div class="flex gap-2 pt-2">
              <button type="button" onclick="document.getElementById('admin-category-modal').classList.add('hidden')" class="flex-1 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 font-bold text-xs hover:text-white transition cursor-pointer">Cancel</button>
              <button type="submit" class="flex-1 py-3 rounded-2xl bg-cyan-600 text-white font-black text-xs shadow-lg shadow-cyan-900/20 cursor-pointer active:scale-95 transition">Save Tag</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Initialize Routing Logic
    if (!(window as any).navigateToAdminRoute) {
      (window as any).navigateToAdminRoute = (routeKey: string) => {
        const subviews = document.querySelectorAll('.admin-subview');
        subviews.forEach(el => el.classList.add('hidden'));

        const target = document.getElementById(`admin-subview-${routeKey}`);
        if (target) {
          target.classList.remove('hidden');
          // Update URL without reload to support browser back button
          const url = new URL(window.location.href);
          url.hash = `blog/${routeKey}`;
          history.pushState({ adminRoute: routeKey }, '', url.toString());
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

      window.addEventListener('popstate', (e) => {
        const state = e.state;
        if (state && state.adminRoute) {
          const target = document.getElementById(`admin-subview-${state.adminRoute}`);
          if (target) {
            document.querySelectorAll('.admin-subview').forEach(el => el.classList.add('hidden'));
            target.classList.remove('hidden');
          }
        } else if (window.location.hash.startsWith('#blog/')) {
          const route = window.location.hash.replace('#blog/', '');
          const target = document.getElementById(`admin-subview-${route}`);
          if (target) {
            document.querySelectorAll('.admin-subview').forEach(el => el.classList.add('hidden'));
            target.classList.remove('hidden');
          }
        } else {
          document.querySelectorAll('.admin-subview').forEach(el => el.classList.add('hidden'));
          const dash = document.getElementById('admin-subview-dashboard');
          if (dash) dash.classList.remove('hidden');
        }
      });
    }

    // Category Handlers
    (window as any).openCategoryModal = () => {
      const editIdEl = document.getElementById("category-edit-id") as HTMLInputElement;
      const titleEl = document.getElementById("admin-category-modal-title");
      const formEl = document.getElementById("admin-category-form") as HTMLFormElement;
      const modalEl = document.getElementById("admin-category-modal");
      if (editIdEl) editIdEl.value = "";
      if (titleEl) titleEl.innerText = "Create New Category";
      if (formEl) formEl.reset();
      if (modalEl) modalEl.classList.remove("hidden");
    };

    (window as any).editCategory = (id: string) => {
      const cats = appInstance.db.blogCategories || appInstance.db.categories || [];
      const c = cats.find((x: any) => x.id === id);
      if (!c) return;
      const editIdEl = document.getElementById("category-edit-id") as HTMLInputElement;
      const titleEl = document.getElementById("admin-category-modal-title");
      const labelEl = document.getElementById("category-input-label") as HTMLInputElement;
      const nameEl = document.getElementById("category-input-name") as HTMLInputElement;
      const modalEl = document.getElementById("admin-category-modal");

      if (editIdEl) editIdEl.value = c.id;
      if (titleEl) titleEl.innerText = "Edit Category Tag";
      if (labelEl) labelEl.value = c.label;
      if (nameEl) nameEl.value = c.name || c.id;
      if (modalEl) modalEl.classList.remove("hidden");
    };

    (window as any).deleteCategory = (id: string) => {
      if (confirm("Delete this category? Articles under this tag will become uncategorized.")) {
        appInstance.db.blogCategories = (appInstance.db.blogCategories || appInstance.db.categories || []).filter((x: any) => x.id !== id);
        appInstance.saveDB();
        appInstance.showToast("Category purged.", "info");
        BlogManager.renderAdminSection(appInstance);
      }
    };

    const catForm = document.getElementById("admin-category-form");
    if (catForm) {
      catForm.onsubmit = (e) => {
        e.preventDefault();
        const id = (document.getElementById("category-edit-id") as HTMLInputElement).value;
        const label = (document.getElementById("category-input-label") as HTMLInputElement).value.trim();
        const name = (document.getElementById("category-input-name") as HTMLInputElement).value.trim();

        if (!appInstance.db.blogCategories) appInstance.db.blogCategories = [...(appInstance.db.categories || [])];

        if (id) {
          const idx = appInstance.db.blogCategories.findIndex((x: any) => x.id === id);
          if (idx !== -1) {
            appInstance.db.blogCategories[idx] = { ...appInstance.db.blogCategories[idx], label, name };
          }
        } else {
          appInstance.db.blogCategories.push({
            id: "bcat_" + Date.now(),
            label,
            name,
            type: "blog"
          });
        }

        appInstance.saveDB();
        const modalEl = document.getElementById("admin-category-modal");
        if (modalEl) modalEl.classList.add("hidden");
        appInstance.showToast("Category database updated.", "success");
        BlogManager.renderAdminSection(appInstance);
      };
    }

    // Article Handlers
    (window as any).editBlogPost = (id: string) => {
      window.open(`admin-blog-editor.html?id=${id}`, '_blank');
    };

    (window as any).deleteBlogPost = (id: string) => {
      if (confirm("Permanently delete this article?")) {
        appInstance.db.blogPosts = (appInstance.db.blogPosts || []).filter((x: any) => x.id !== id);
        appInstance.saveDB();
        appInstance.showToast("Article wiped from records.", "info");
        BlogManager.renderAdminSection(appInstance);
      }
    };
  }

  static renderUserPortal(appInstance: any) {
    const container = document.getElementById("tab-blog");
    if (!container) return;

    const posts = (appInstance.db.blogPosts || []).filter((p: any) => p.published);

    container.innerHTML = `
      <div class="space-y-4 font-sans">
        <!-- Header banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-[9px] uppercase font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full">📰 NEWS & ARTICLES</span>
            <h2 class="text-base font-black text-white">Latest Platform Stories & Guides</h2>
            <p class="text-xs text-slate-400">Read winning strategies, event announcements, and updates.</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl shadow">
            <i class="fa-solid fa-newspaper"></i>
          </div>
        </div>

        <!-- Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${posts.length === 0 ? `
            <div class="col-span-full bg-slate-950 border border-slate-900 p-8 rounded-3xl text-center space-y-2">
              <i class="fa-solid fa-file-lines text-slate-600 text-3xl"></i>
              <h4 class="text-xs font-bold text-slate-400">No blog posts available right now.</h4>
              <p class="text-[10px] text-slate-600">Check back later for news and guides!</p>
            </div>
          ` : posts.map((post: any) => `
            <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-rose-500/40 transition duration-300">
              <div>
                <div class="h-44 overflow-hidden relative">
                  <img src="${post.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Cover" />
                  <span class="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-rose-400 border border-slate-800 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase">
                    ${post.category}
                  </span>
                </div>
                <div class="p-5 space-y-2">
                  <div class="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                    <span><i class="fa-regular fa-calendar mr-1"></i> ${new Date(post.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span><i class="fa-regular fa-user mr-1"></i> ${post.author}</span>
                  </div>
                  <h3 class="text-sm font-black text-white group-hover:text-rose-400 transition leading-snug">${post.title}</h3>
                  <p class="text-xs text-slate-400 leading-relaxed line-clamp-3">${post.content}</p>
                </div>
              </div>
              <div class="p-5 pt-0">
                <button onclick="(window as any).openBlogModal && (window as any).openBlogModal('${post.id}')" class="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2">
                  <span>Read Full Article</span> <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Full Article Reading Modal -->
      <div id="user-blog-read-modal" class="hidden fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 space-y-4">
          <button type="button" onclick="document.getElementById('user-blog-read-modal').classList.add('hidden')" class="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
          
          <div id="modal-blog-cover-container" class="rounded-2xl overflow-hidden h-56 border border-slate-800 relative">
            <img id="modal-blog-img" src="" class="w-full h-full object-cover" />
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span id="modal-blog-cat" class="text-rose-400 font-bold uppercase"></span>
              <span>•</span>
              <span id="modal-blog-date"></span>
            </div>
            <h2 id="modal-blog-title" class="text-lg font-black text-white"></h2>
            <p id="modal-blog-author" class="text-xs text-slate-500 font-mono"></p>
          </div>

          <div class="border-t border-slate-800 pt-4">
            <p id="modal-blog-body" class="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans"></p>
          </div>
        </div>
      </div>
    `;

    (window as any).openBlogModal = (id: string) => {
      const p = (appInstance.db.blogPosts || []).find((x: any) => x.id === id);
      if (!p) return;
      const imgEl = document.getElementById("modal-blog-img") as HTMLImageElement;
      const catEl = document.getElementById("modal-blog-cat");
      const dateEl = document.getElementById("modal-blog-date");
      const titleEl = document.getElementById("modal-blog-title");
      const authorEl = document.getElementById("modal-blog-author");
      const bodyEl = document.getElementById("modal-blog-body");
      const modalEl = document.getElementById("user-blog-read-modal");

      if (imgEl) imgEl.src = p.image;
      if (catEl) catEl.innerText = p.category;
      if (dateEl) dateEl.innerText = new Date(p.date).toLocaleDateString();
      if (titleEl) titleEl.innerText = p.title;
      if (authorEl) authorEl.innerText = `Author: ${p.author}`;
      if (bodyEl) bodyEl.innerText = p.content;
      if (modalEl) modalEl.classList.remove("hidden");
    };
  }
}
