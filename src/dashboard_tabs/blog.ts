/**
 * Blog System Module (src/dashboard_tabs/blog.ts)
 * 
 * Provides a dedicated standalone separate screen/page for Community Blog Posts,
 * dynamic categories, rich text formatted reader, engagement likes, and
 * real-time validated user comments with moderation tracking.
 */

export class BlogModule {
  static currentViewingPostId: string | null = null;
  static blogSearchQuery: string = "";
  static blogSelectedCategory: string = "All";

  /**
   * Helper to render markdown/rich text formatting safely
   */
  static formatContent(rawText: string = ""): string {
    if (!rawText) return "";
    let html = rawText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-black text-amber-300 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-black text-white mt-5 mb-2.5">$1</h2>');

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic text-slate-200">$1</em>');

    // Links [text](url)
    html = html.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 underline hover:text-cyan-300 font-medium">$1</a>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-amber-500/60 pl-3 py-1 my-2 italic text-slate-300 bg-amber-500/5 rounded-r">$1</blockquote>');

    // Bullet lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-0.5">$1</li>');

    // Numbered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-300 my-0.5">$1</li>');

    // Paragraph breaks
    html = html.replace(/\n\n/g, '<div class="h-3"></div>');
    html = html.replace(/\n/g, '<br/>');

    return html;
  }

  static render(appInstance: any) {
    this.renderScreen(appInstance);
  }

  static renderScreen(appInstance: any) {
    let screenEl = document.getElementById("screen-blog");
    if (!screenEl) {
      screenEl = document.getElementById("tab-blog");
    }
    if (!screenEl) return;

    if (!appInstance.db.blogs) appInstance.db.blogs = [];
    if (!appInstance.db.blogComments) appInstance.db.blogComments = [];
    if (!appInstance.db.blogCategories || appInstance.db.blogCategories.length === 0) {
      appInstance.db.blogCategories = [
        { id: "bcat-1", name: "Lottery Tips", slug: "lottery-tips", description: "Pro mathematical patterns & draw strategies" },
        { id: "bcat-2", name: "Winners Stories", slug: "winners-stories", description: "Interviews with jackpot champions" },
        { id: "bcat-3", name: "Platform Updates", slug: "platform-updates", description: "Gateway upgrades, cashouts & fee alerts" },
        { id: "bcat-4", name: "Guides", slug: "guides", description: "Step-by-step app walkthroughs" }
      ];
    }

    // Detail Reader View
    if (this.currentViewingPostId) {
      const post = appInstance.db.blogs.find((b: any) => b.id === this.currentViewingPostId);
      if (post) {
        this.renderPostDetail(appInstance, screenEl, post);
        return;
      } else {
        this.currentViewingPostId = null;
      }
    }

    // List & Feed View
    const searchQuery = this.blogSearchQuery.toLowerCase();
    const selectedCat = this.blogSelectedCategory;

    const filteredPosts = appInstance.db.blogs.filter((b: any) => {
      const matchesCat = selectedCat === "All" || b.category === selectedCat || b.categorySlug === selectedCat;
      const matchesSearch = !searchQuery || b.title.toLowerCase().includes(searchQuery) || (b.excerpt && b.excerpt.toLowerCase().includes(searchQuery));
      return matchesCat && matchesSearch;
    });

    const categoriesList = ["All", ...appInstance.db.blogCategories.map((c: any) => c.name)];
    const featuredPost = appInstance.db.blogs[0];

    screenEl.innerHTML = `
      <!-- Standalone Blog Portal Screen Header -->
      <header class="bg-[#0b0f19] border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3 shadow-lg">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <button id="blog-screen-back-btn" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white hover:bg-amber-500/20 flex items-center justify-center transition cursor-pointer shadow">
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </button>
            <div class="leading-tight">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                <span class="text-[9px] uppercase font-mono font-black text-amber-400 tracking-wider">LUCKYBOX COMMUNITY</span>
              </div>
              <h1 class="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>Lottery Blog & Updates</span>
                <i class="fa-solid fa-newspaper text-xs text-amber-400"></i>
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[9px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              ${appInstance.db.blogs.length} Articles
            </span>
          </div>
        </div>
      </header>

      <!-- Main Blog Container -->
      <main class="max-w-4xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-24">
        <!-- Search & Filter Controls -->
        <div class="space-y-3">
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input type="text" id="blog-search-input" value="${this.blogSearchQuery}" placeholder="Search articles, strategies, win stories..." class="w-full bg-[#111625] border border-slate-800 focus:border-amber-500/80 rounded-2xl pl-10 pr-4 py-3 text-xs text-white outline-none placeholder-slate-500 font-mono shadow-inner transition" />
            ${this.blogSearchQuery ? `
              <button id="blog-clear-search-btn" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer">
                <i class="fa-solid fa-xmark"></i>
              </button>
            ` : ''}
          </div>

          <!-- Dynamic Category Tabs with slugs -->
          <div class="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-800">
            ${categoriesList.map(cat => `
              <button class="blog-cat-filter-btn shrink-0 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${this.blogSelectedCategory === cat ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'}" data-category="${cat}">
                ${cat === 'All' ? '🎯 All Categories' : cat}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Featured Story (if viewing All and not searching) -->
        ${featuredPost && selectedCat === 'All' && !searchQuery ? `
          <div class="blog-read-card bg-gradient-to-br from-[#161d36] via-[#0d1326] to-[#1d1636] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl cursor-pointer group hover:border-amber-400 transition" data-id="${featuredPost.id}">
            <div class="relative h-48 sm:h-64 overflow-hidden">
              <img src="${featuredPost.image}" alt="${featuredPost.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" referrerPolicy="no-referrer" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#090c14] via-black/40 to-transparent"></div>
              <div class="absolute top-3 left-3 flex items-center gap-2">
                <span class="bg-amber-500 text-slate-950 font-black text-[9px] uppercase font-mono px-3 py-1 rounded-full shadow">
                  ⭐ FEATURED ARTICLE
                </span>
                <span class="bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[9px] font-mono px-2.5 py-1 rounded-full font-bold">
                  ${featuredPost.category}
                </span>
              </div>
            </div>
            <div class="p-5 sm:p-6 space-y-3">
              <div class="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                <span><i class="fa-regular fa-calendar text-amber-400 mr-1"></i> ${featuredPost.date}</span>
                <span>·</span>
                <span><i class="fa-regular fa-clock text-cyan-400 mr-1"></i> ${featuredPost.readTime || '3 min read'}</span>
                <span>·</span>
                <span><i class="fa-regular fa-eye text-emerald-400 mr-1"></i> ${featuredPost.views || 0} views</span>
              </div>
              <h2 class="text-base sm:text-xl font-black text-white group-hover:text-amber-300 transition leading-snug">
                ${featuredPost.title}
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                ${featuredPost.excerpt}
              </p>
              <div class="pt-3 flex items-center justify-between border-t border-slate-800">
                <span class="text-xs text-slate-400">By <strong class="text-white">${featuredPost.author}</strong></span>
                <span class="text-xs font-black text-amber-400 flex items-center gap-1.5 group-hover:translate-x-1 transition">
                  Read Full Story <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Articles Grid -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
              <span>Articles & Guides</span>
              <span class="text-amber-400">(${filteredPosts.length})</span>
            </h3>
            <span class="text-[10px] text-slate-500 font-mono">Category: ${selectedCat}</span>
          </div>

          ${filteredPosts.length === 0 ? `
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
              <i class="fa-regular fa-newspaper text-4xl text-slate-600"></i>
              <h4 class="text-sm font-bold text-white">No articles match your criteria</h4>
              <p class="text-xs text-slate-400 max-w-sm mx-auto">Try clearing search terms or selecting "All Categories" to view available stories.</p>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${filteredPosts.map((post: any) => {
                const commentCount = (appInstance.db.blogComments || []).filter((c: any) => c.blogId === post.id && c.status === "approved").length;
                return `
                  <div class="blog-read-card bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between group cursor-pointer transition duration-200 hover:-translate-y-0.5" data-id="${post.id}">
                    <div>
                      <div class="relative h-40 overflow-hidden">
                        <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" referrerPolicy="no-referrer" />
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                        <span class="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[8.5px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                          ${post.category}
                        </span>
                      </div>
                      <div class="p-4 space-y-2">
                        <div class="flex items-center gap-2 text-[9.5px] font-mono text-slate-400">
                          <span>${post.date}</span>
                          <span>·</span>
                          <span>${post.readTime || '3 min'}</span>
                          <span>·</span>
                          <span><i class="fa-regular fa-eye text-emerald-400 mr-0.5"></i> ${post.views || 0}</span>
                          <span>·</span>
                          <span><i class="fa-regular fa-comment text-cyan-400 mr-0.5"></i> ${commentCount}</span>
                        </div>
                        <h4 class="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                          ${post.title}
                        </h4>
                        <p class="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                          ${post.excerpt}
                        </p>
                      </div>
                    </div>
                    <div class="p-4 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-3">
                      <span class="text-[10px] text-slate-500">By ${post.author}</span>
                      <span class="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                        Read Story <i class="fa-solid fa-arrow-right text-[10px]"></i>
                      </span>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          `}
        </div>
      </main>
    `;

    this.bindScreenEvents(appInstance);
  }

  static renderPostDetail(appInstance: any, screenEl: HTMLElement, post: any) {
    if (!post.views) post.views = 1;
    else post.views += 1;
    appInstance.saveDB();

    const currentUsername = appInstance.currentUser?.username || "guest";
    // Show approved comments, plus any pending comment from the current user
    const comments = (appInstance.db.blogComments || []).filter((c: any) => 
      c.blogId === post.id && (c.status === "approved" || c.username === currentUsername)
    );

    const formattedBody = this.formatContent(post.content);

    screenEl.innerHTML = `
      <!-- Detail Header -->
      <header class="bg-[#0b0f19] border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3 shadow-lg">
        <div class="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button id="blog-detail-back-btn" class="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer">
            <i class="fa-solid fa-arrow-left"></i> Back to Articles
          </button>
          <span class="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-mono px-3 py-1 rounded-full font-bold">
            ${post.category}
          </span>
        </div>
      </header>

      <!-- Article Body Container -->
      <main class="max-w-3xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-24 font-sans">
        <article class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-6">
          <div class="relative h-64 sm:h-80 overflow-hidden">
            <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>

          <div class="px-6 space-y-4">
            <div class="flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
              <span><i class="fa-regular fa-calendar text-amber-400 mr-1"></i> ${post.date}</span>
              <span>·</span>
              <span><i class="fa-regular fa-clock text-cyan-400 mr-1"></i> ${post.readTime || '3 min'}</span>
              <span>·</span>
              <span><i class="fa-regular fa-eye text-emerald-400 mr-1"></i> ${post.views} views</span>
              <span>·</span>
              <span><i class="fa-solid fa-user-pen text-purple-400 mr-1"></i> ${post.author}</span>
            </div>

            <h1 class="text-xl sm:text-2xl font-black text-white leading-tight">
              ${post.title}
            </h1>

            <!-- Social Action Bar -->
            <div class="flex items-center gap-3 py-3 border-y border-slate-800">
              <button id="blog-like-btn" class="flex items-center gap-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer active:scale-95">
                <i class="fa-solid fa-heart"></i> Like (<span id="blog-likes-count">${post.likes || 0}</span>)
              </button>
              <button id="blog-share-btn" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer">
                <i class="fa-solid fa-share-nodes"></i> Share Article
              </button>
            </div>

            <!-- Formatted Content -->
            <div class="text-sm text-slate-300 leading-relaxed space-y-4 pt-2 font-sans">
              ${formattedBody}
            </div>
          </div>

          <!-- Comments Section with Real-Time Validation -->
          <div class="bg-slate-950 p-6 border-t border-slate-800 space-y-5">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-black text-white flex items-center gap-2">
                <i class="fa-regular fa-comments text-amber-400"></i> Reader Comments (${comments.length})
              </h3>
              <span class="text-[10px] text-slate-400 font-mono">Moderated community discussion</span>
            </div>

            <!-- Interactive Comment Input with Real-Time Validation -->
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div class="flex items-center justify-between text-[11px] font-mono">
                <span class="text-slate-400">Join the discussion as <strong class="text-amber-300">@${currentUsername}</strong></span>
                <span id="comment-char-counter" class="text-slate-500 font-bold">0 / 500</span>
              </div>
              
              <textarea id="blog-comment-input" rows="3" maxlength="500" placeholder="Share your experience or congratulations (minimum 3 characters)..." class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white outline-none placeholder-slate-500 resize-none transition"></textarea>

              <div id="comment-validation-msg" class="text-[10px] font-mono hidden"></div>

              <div class="flex items-center justify-between pt-1">
                <span class="text-[10px] text-slate-500 font-mono">Comments are reviewed for community safety.</span>
                <button id="blog-submit-comment-btn" class="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition hover:opacity-95 active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  Post Comment 🚀
                </button>
              </div>
            </div>

            <!-- Comments List -->
            <div class="space-y-3 pt-2">
              ${comments.length === 0 ? `
                <div class="text-center py-6 text-slate-500 text-xs italic">
                  No comments yet. Be the first to share your thoughts on this story!
                </div>
              ` : `
                ${comments.map((c: any) => `
                  <div class="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-2xl space-y-1.5">
                    <div class="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <div class="flex items-center gap-1.5">
                        <strong class="text-amber-300">@${c.username}</strong>
                        ${c.status === "pending" ? `
                          <span class="bg-amber-950 text-amber-400 border border-amber-600/40 text-[8px] px-1.5 py-0.2 rounded font-bold">Pending Review</span>
                        ` : ''}
                      </div>
                      <span>${c.date}</span>
                    </div>
                    <p class="text-xs text-slate-200 font-sans leading-relaxed">${appInstance.escapeHTML(c.text)}</p>
                  </div>
                `).join("")}
              `}
            </div>
          </div>
        </article>
      </main>
    `;

    this.bindDetailEvents(appInstance, post);
  }

  static bindScreenEvents(appInstance: any) {
    const backBtn = document.getElementById("blog-screen-back-btn");
    if (backBtn) {
      backBtn.onclick = (e: any) => {
        if (e) e.preventDefault();
        appInstance.closeBlogPage();
      };
    }

    const searchInput = document.getElementById("blog-search-input") as HTMLInputElement;
    if (searchInput) {
      searchInput.oninput = (e: any) => {
        this.blogSearchQuery = e.target.value;
        this.renderScreen(appInstance);
      };
    }

    const clearSearchBtn = document.getElementById("blog-clear-search-btn");
    if (clearSearchBtn) {
      clearSearchBtn.onclick = () => {
        this.blogSearchQuery = "";
        this.renderScreen(appInstance);
      };
    }

    const catBtns = document.querySelectorAll(".blog-cat-filter-btn");
    catBtns.forEach(btn => {
      btn.addEventListener("click", (e: any) => {
        this.blogSelectedCategory = e.currentTarget.getAttribute("data-category");
        this.renderScreen(appInstance);
      });
    });

    const readCards = document.querySelectorAll(".blog-read-card");
    readCards.forEach(card => {
      card.addEventListener("click", (e: any) => {
        const id = e.currentTarget.getAttribute("data-id");
        this.currentViewingPostId = id;
        this.renderScreen(appInstance);
      });
    });
  }

  static bindDetailEvents(appInstance: any, post: any) {
    const backBtn = document.getElementById("blog-detail-back-btn");
    if (backBtn) {
      backBtn.onclick = () => {
        this.currentViewingPostId = null;
        this.renderScreen(appInstance);
      };
    }

    const likeBtn = document.getElementById("blog-like-btn");
    if (likeBtn) {
      likeBtn.onclick = () => {
        post.likes = (post.likes || 0) + 1;
        appInstance.saveDB();
        const likesCountEl = document.getElementById("blog-likes-count");
        if (likesCountEl) likesCountEl.innerText = post.likes;
        appInstance.showToast("Article liked! ❤️", "success");
      };
    }

    const shareBtn = document.getElementById("blog-share-btn");
    if (shareBtn) {
      shareBtn.onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        appInstance.showToast("Article link copied to clipboard! 🔗", "success");
      };
    }

    // Real-Time Comment Validation
    const commentInput = document.getElementById("blog-comment-input") as HTMLTextAreaElement;
    const charCounter = document.getElementById("comment-char-counter");
    const valMsg = document.getElementById("comment-validation-msg");
    const submitBtn = document.getElementById("blog-submit-comment-btn") as HTMLButtonElement;

    if (commentInput) {
      commentInput.addEventListener("input", () => {
        const len = commentInput.value.length;
        if (charCounter) {
          charCounter.innerText = `${len} / 500`;
          if (len > 450) {
            charCounter.className = "text-rose-400 font-bold font-mono";
          } else {
            charCounter.className = "text-slate-500 font-bold font-mono";
          }
        }

        if (len > 0 && len < 3) {
          if (valMsg) {
            valMsg.classList.remove("hidden");
            valMsg.className = "text-[10px] font-mono text-rose-400";
            valMsg.innerText = "Comment is too short (min 3 characters).";
          }
          if (submitBtn) submitBtn.disabled = true;
        } else if (len >= 3 && len <= 500) {
          if (valMsg) valMsg.classList.add("hidden");
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    if (submitBtn) {
      submitBtn.onclick = () => {
        const text = commentInput?.value.trim() || "";
        if (text.length < 3) {
          appInstance.showToast("Comment must be at least 3 characters long.", "error");
          return;
        }
        if (text.length > 500) {
          appInstance.showToast("Comment exceeds 500 character limit.", "error");
          return;
        }

        if (!appInstance.db.blogComments) {
          appInstance.db.blogComments = [];
        }

        const newComment = {
          id: "comm-" + Date.now(),
          blogId: post.id,
          username: appInstance.currentUser?.username || "player",
          text,
          date: new Date().toISOString().split("T")[0],
          status: "pending" // Sent to moderation queue
        };

        appInstance.db.blogComments.push(newComment);
        appInstance.saveDB();
        commentInput.value = "";
        if (charCounter) charCounter.innerText = "0 / 500";
        appInstance.showToast("Comment submitted! It will appear once approved by admin. 🚀", "success");
        this.renderPostDetail(appInstance, document.getElementById("screen-blog") || document.getElementById("tab-blog")!, post);
      };
    }
  }
}
