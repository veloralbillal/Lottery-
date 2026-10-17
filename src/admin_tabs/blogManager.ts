/**
 * Lottery Winner - Blog & Article Management System (blogManager.js)
 * 
 * Provides full CRUD admin capabilities and user-facing reading portal for blog posts.
 */

export class BlogManager {
  static init(appInstance) {
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

  static renderAdminSection(appInstance) {
    const container = document.getElementById("admin-tab-blog");
    if (!container) return;

    const posts = appInstance.db.blogPosts || [];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div>
            <h3 class="text-base font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-blog text-rose-500"></i> Blog & News Management (ব্লগ ও নিউজ প্যানেল)
            </h3>
            <p class="text-xs text-slate-400 font-mono">Create, edit and manage articles, announcements, and guides for users.</p>
          </div>
          <button id="admin-blog-create-btn" class="bg-gradient-to-r from-red-600 to-rose-600 hover:scale-102 text-white text-xs font-black py-2.5 px-4 rounded-xl transition shadow-lg cursor-pointer flex items-center gap-2">
            <i class="fa-solid fa-plus"></i> New Article / নতুন পোস্ট
          </button>
        </div>

        <!-- Create/Edit Modal Form (Hidden by default) -->
        <div id="admin-blog-modal" class="hidden fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div class="bg-slate-900 rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-800 text-left relative space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 id="admin-blog-modal-title" class="text-sm font-black text-white uppercase">Create New Blog Article</h4>
              <button type="button" id="admin-blog-modal-close" class="text-slate-400 hover:text-white cursor-pointer"><i class="fa-solid fa-xmark text-base"></i></button>
            </div>
            
            <form id="admin-blog-form" class="space-y-3 font-sans">
              <input type="hidden" id="blog-edit-id" value="" />
              <div class="space-y-1">
                <label class="block text-[10px] uppercase font-mono text-slate-400 font-bold">Article Title / শিরোনাম</label>
                <input type="text" id="blog-input-title" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs font-bold outline-none focus:border-rose-500" placeholder="e.g. নতুন আপডেট এবং উইনিং টিপস..." />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="block text-[10px] uppercase font-mono text-slate-400 font-bold">Category / ক্যাটাগরি</label>
                  <select id="blog-input-category" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none cursor-pointer">
                    <option value="Tips & Tricks">Tips & Tricks</option>
                    <option value="Announcements">Announcements</option>
                    <option value="Winners Story">Winners Story</option>
                    <option value="Guides">Guides</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="block text-[10px] uppercase font-mono text-slate-400 font-bold">Cover Image URL</label>
                  <input type="url" id="blog-input-image" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none focus:border-rose-500" placeholder="https://images.unsplash.com/..." />
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] uppercase font-mono text-slate-400 font-bold">Content / মূল লেখা</label>
                <textarea id="blog-input-content" rows="6" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none focus:border-rose-500 font-sans" placeholder="Write article content here..."></textarea>
              </div>

              <div class="flex items-center gap-2 pt-2">
                <input type="checkbox" id="blog-input-published" checked class="w-4 h-4 accent-rose-500 rounded cursor-pointer" />
                <label for="blog-input-published" class="text-xs text-slate-300 cursor-pointer">Publish Immediately (সরাসরি প্রকাশ করুন)</label>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" id="admin-blog-cancel-btn" class="px-4 py-2.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg cursor-pointer">Save Article</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Articles Table List -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div class="flex justify-between items-center border-b border-slate-800 pb-3">
            <h4 class="text-sm font-black text-white uppercase font-mono">Published Articles (${posts.length})</h4>
            <span class="text-[10px] text-slate-400 font-mono">Full Admin Control</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr class="border-b border-slate-800 text-[10px] font-mono font-bold text-slate-500 uppercase">
                  <th class="p-3">Cover</th>
                  <th class="p-3">Title & Category</th>
                  <th class="p-3">Author</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Date</th>
                  <th class="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/40 text-slate-300">
                ${posts.length === 0 ? `
                  <tr><td colspan="6" class="p-6 text-center text-slate-500">No blog posts found. Create your first article above!</td></tr>
                ` : posts.map(post => `
                  <tr class="hover:bg-slate-850/50 transition">
                    <td class="p-3">
                      <img src="${post.image || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=100&q=80'}" class="w-12 h-10 object-cover rounded-xl border border-slate-800" />
                    </td>
                    <td class="p-3 font-bold text-white max-w-xs truncate">
                      ${post.title}
                      <span class="block text-[9px] text-rose-400 font-mono font-normal">${post.category}</span>
                    </td>
                    <td class="p-3 font-mono text-slate-400">${post.author}</td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${post.published ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-400'}">
                        ${post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td class="p-3 font-mono text-[10px] text-slate-500">${new Date(post.date).toLocaleDateString()}</td>
                    <td class="p-3 text-right space-x-1.5 font-mono">
                      <button onclick="window.editBlogPost && window.editBlogPost('${post.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-[10px] font-bold cursor-pointer transition">Edit</button>
                      <button onclick="window.deleteBlogPost && window.deleteBlogPost('${post.id}')" class="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg text-[10px] font-bold cursor-pointer transition">Delete</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Bind event handlers
    const createBtn = document.getElementById("admin-blog-create-btn");
    const modal = document.getElementById("admin-blog-modal");
    const closeBtn = document.getElementById("admin-blog-modal-close");
    const cancelBtn = document.getElementById("admin-blog-cancel-btn");
    const form = document.getElementById("admin-blog-form");

    if (createBtn && modal) {
      createBtn.onclick = () => {
        document.getElementById("blog-edit-id").value = "";
        document.getElementById("admin-blog-modal-title").innerText = "Create New Blog Article";
        form.reset();
        modal.classList.remove("hidden");
      };
    }

    if (closeBtn && modal) {
      closeBtn.onclick = () => modal.classList.add("hidden");
    }

    if (cancelBtn && modal) {
      cancelBtn.onclick = () => modal.classList.add("hidden");
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const editId = document.getElementById("blog-edit-id").value;
        const title = document.getElementById("blog-input-title").value.trim();
        const category = document.getElementById("blog-input-category").value;
        const image = document.getElementById("blog-input-image").value.trim() || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80";
        const content = document.getElementById("blog-input-content").value.trim();
        const published = document.getElementById("blog-input-published").checked;

        if (!appInstance.db.blogPosts) appInstance.db.blogPosts = [];

        if (editId) {
          const p = appInstance.db.blogPosts.find(x => x.id === editId);
          if (p) {
            p.title = title;
            p.category = category;
            p.image = image;
            p.content = content;
            p.published = published;
          }
          appInstance.showToast("Blog post updated successfully!", "success");
        } else {
          const newPost = {
            id: "blog_" + Date.now(),
            title,
            category,
            author: appInstance.currentUser?.username || "Admin",
            date: new Date().toISOString(),
            image,
            content,
            published
          };
          appInstance.db.blogPosts.unshift(newPost);
          appInstance.showToast("New blog post created successfully!", "success");
        }

        appInstance.saveDB();
        if (modal) modal.classList.add("hidden");
        BlogManager.renderAdminSection(appInstance);
      };
    }

    // Expose global window handlers for table buttons
    window.editBlogPost = (id) => {
      const p = (appInstance.db.blogPosts || []).find(x => x.id === id);
      if (!p) return;
      document.getElementById("blog-edit-id").value = p.id;
      document.getElementById("admin-blog-modal-title").innerText = "Edit Blog Article";
      document.getElementById("blog-input-title").value = p.title;
      document.getElementById("blog-input-category").value = p.category;
      document.getElementById("blog-input-image").value = p.image;
      document.getElementById("blog-input-content").value = p.content;
      document.getElementById("blog-input-published").checked = p.published;
      if (modal) modal.classList.remove("hidden");
    };

    window.deleteBlogPost = (id) => {
      if (confirm("Are you sure you want to delete this blog post?")) {
        appInstance.db.blogPosts = (appInstance.db.blogPosts || []).filter(x => x.id !== id);
        appInstance.saveDB();
        appInstance.showToast("Blog post deleted.", "info");
        BlogManager.renderAdminSection(appInstance);
      }
    };
  }

  static renderUserPortal(appInstance) {
    const container = document.getElementById("tab-blog");
    if (!container) return;

    const posts = (appInstance.db.blogPosts || []).filter(p => p.published);

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
          ` : posts.map(post => `
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
                <button onclick="window.openBlogModal && window.openBlogModal('${post.id}')" class="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2">
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

    window.openBlogModal = (id) => {
      const p = (appInstance.db.blogPosts || []).find(x => x.id === id);
      if (!p) return;
      document.getElementById("modal-blog-img").src = p.image;
      document.getElementById("modal-blog-cat").innerText = p.category;
      document.getElementById("modal-blog-date").innerText = new Date(p.date).toLocaleDateString();
      document.getElementById("modal-blog-title").innerText = p.title;
      document.getElementById("modal-blog-author").innerText = `Author: ${p.author}`;
      document.getElementById("modal-blog-body").innerText = p.content;
      document.getElementById("user-blog-read-modal").classList.remove("hidden");
    };
  }
}
