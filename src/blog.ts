/**
 * Standalone Blog Portal (src/blog.ts)
 * 
 * Powers the dedicated separate page and file (blog.html)
 * Synchronizes with main application database (lw_lottery_db_v3) in localStorage.
 */

interface BlogPost {
  id: string;
  title: string;
  category: string;
  categorySlug?: string;
  author: string;
  authorAvatar?: string;
  date: string;
  readTime?: string;
  views?: number;
  likes?: number;
  coverImage?: string;
  excerpt?: string;
  content: string;
  tags?: string[];
}

interface BlogComment {
  id: string;
  blogId: string;
  username: string;
  text: string;
  createdAt: string;
  status: "approved" | "pending" | "rejected";
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

class StandaloneBlogApp {
  private db: any = {};
  private currentUser: any = null;
  private currentPostId: string | null = null;
  private searchQuery: string = "";
  private selectedCategory: string = "All";

  constructor() {
    this.loadState();
    this.parseUrlParams();
  }

  private loadState() {
    try {
      const rawDB = localStorage.getItem("lw_lottery_db_v3");
      if (rawDB) {
        this.db = JSON.parse(rawDB);
      }
    } catch (e) {
      console.warn("Could not load database:", e);
    }

    if (!this.db || typeof this.db !== "object") {
      this.db = {};
    }

    if (!this.db.blogs || !Array.isArray(this.db.blogs) || this.db.blogs.length === 0) {
      this.db.blogs = [
        {
          id: "blog-1",
          title: "How to Win Mega Progressive Jackpot: Pro Strategies & Tips",
          category: "Lottery Tips",
          categorySlug: "lottery-tips",
          author: "Admin Master",
          authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          readTime: "4 min read",
          views: 342,
          likes: 28,
          coverImage: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80",
          excerpt: "Discover mathematical distribution patterns, multi-ticket syndicate strategies, and best draw timing to maximize your probability.",
          content: `## 1. Understand Number Spread & Probability
When entering the LuckyBox Mega Draw, avoid picking consecutive numbers (e.g., 01, 02, 03). Historical draw statistics confirm over 84% of winning draw combinations have a balanced distribution of low and high digits.

### Key Strategy Points:
- Mix Odd and Even digits evenly (3 odd / 3 even is statistically optimal).
- Utilize the Auto-Quick Pick generator alongside your custom lucky numbers.
- Maintain syndicate pool entries with your group for greater ticket coverage.

> "Consistency and disciplined bankroll management are the true hallmarks of persistent lottery champions."

## 2. Reinvest Small Bonus Wins
Use free daily check-in coins and referral rewards to secure tickets without deducting from your main liquid deposit balance. With 0% withdrawal fees on bKash & Nagad, cash out your major tier prizes instantly!`,
          tags: ["Jackpot", "Tips", "Strategy"]
        },
        {
          id: "blog-2",
          title: "Winner Interview: How @arif_99 Took Home ৳25,000 Jackpot",
          category: "Winners Stories",
          categorySlug: "winners-stories",
          author: "LuckyBox Editorial",
          authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
          date: new Date(Date.now() - 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          readTime: "3 min read",
          views: 521,
          likes: 64,
          coverImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80",
          excerpt: "Meet Arif from Dhaka, who won ৳25,000 on his 3rd draw ticket. Read his full reaction and advice for new players.",
          content: `## The Moment of Victory
Last Friday night at 10:00 PM, Arif logged in to check his active ticket ledger under the **Tickets Tab**. To his astonishment, all six matching digits illuminated with the golden winning animation!

### Arif's Advice for New Members:
- Never chase losses; participate with comfortable entertainment budgets.
- Join the active Group Chat to discuss tips with other registered players.
- Enable browser alerts so you never miss the countdown draw reveal.

> "I received my entire prize balance into my Nagad account in under 90 seconds. The transparency here is genuinely unmatched!" — @arif_99`,
          tags: ["Interview", "Winners", "Nagad"]
        },
        {
          id: "blog-3",
          title: "Platform Upgrade: Zero-Fee Instant Taka Cashouts Now Live",
          category: "Platform Updates",
          categorySlug: "platform-updates",
          author: "System Operations",
          authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
          date: new Date(Date.now() - 172800000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          readTime: "2 min read",
          views: 780,
          likes: 89,
          coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
          excerpt: "We have fully eliminated withdrawal fees across bKash, Nagad, and Rocket channels. Payouts now process 24/7 in real time.",
          content: `## Seamless Financial Freedom
We are delighted to introduce our revamped financial bridge! All withdrawals initiated on our platform now feature **0% deductions**.

### Release Highlights:
- **Instant Payouts**: Automated dispatch engine processes transfers within 1–3 minutes.
- **Support for Multi-Methods**: Choose freely between bKash Personal, Nagad, Rocket, or USDT Crypto.
- **Enhanced Security**: 4-digit PIN verification safeguard on all outgoing disbursements.`,
          tags: ["Cashout", "bKash", "Updates"]
        }
      ];
      this.saveDB();
    }

    if (!this.db.blogCategories || !Array.isArray(this.db.blogCategories) || this.db.blogCategories.length === 0) {
      this.db.blogCategories = [
        { id: "bcat-1", name: "Lottery Tips", slug: "lottery-tips", description: "Pro mathematical patterns & draw strategies" },
        { id: "bcat-2", name: "Winners Stories", slug: "winners-stories", description: "Interviews with jackpot champions" },
        { id: "bcat-3", name: "Platform Updates", slug: "platform-updates", description: "Gateway upgrades, cashouts & fee alerts" },
        { id: "bcat-4", name: "Guides", slug: "guides", description: "Step-by-step app walkthroughs" }
      ];
      this.saveDB();
    }

    if (!this.db.blogComments || !Array.isArray(this.db.blogComments)) {
      this.db.blogComments = [
        { id: "cm-1", blogId: "blog-1", username: "tamim_bd", text: "Great tips! I tried the odd-even split strategy yesterday and got 4 matching digits!", createdAt: new Date(Date.now() - 3600000).toISOString(), status: "approved" },
        { id: "cm-2", blogId: "blog-2", username: "shakib_winner", text: "Congratulations @arif_99 brother! Hope I win next draw 🏆", createdAt: new Date(Date.now() - 7200000).toISOString(), status: "approved" }
      ];
      this.saveDB();
    }

    // Try reading current user session
    try {
      const savedUser = localStorage.getItem("lw_user_session");
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch (e) {}
  }

  private saveDB() {
    try {
      localStorage.setItem("lw_lottery_db_v3", JSON.stringify(this.db));
    } catch (e) {
      console.error("Failed to save database:", e);
    }
  }

  private parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const postParam = params.get("post");
    const catParam = params.get("cat");
    if (postParam) {
      this.currentPostId = postParam;
    }
    if (catParam) {
      this.selectedCategory = catParam;
    }
  }

  /**
   * Helper to render markdown/rich text formatting safely
   */
  public formatContent(rawText: string = ""): string {
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

  public showToast(msg: string, type: "success" | "error" | "info" = "info") {
    const existing = document.getElementById("blog-toast-box");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "blog-toast-box";
    const colors = {
      success: "border-emerald-500/50 bg-emerald-950/90 text-emerald-200 shadow-emerald-900/30",
      error: "border-rose-500/50 bg-rose-950/90 text-rose-200 shadow-rose-900/30",
      info: "border-amber-500/50 bg-slate-900/95 text-amber-200 shadow-amber-900/30"
    };

    toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md transition-all duration-300 animate-bounce ${colors[type]}`;
    toast.innerHTML = `
      <i class="${type === 'success' ? 'fa-solid fa-circle-check text-emerald-400' : type === 'error' ? 'fa-solid fa-circle-exclamation text-rose-400' : 'fa-solid fa-circle-info text-amber-400'}"></i>
      <span>${msg}</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  public init() {
    this.render();
  }

  public render() {
    const root = document.getElementById("blog-app-root");
    if (!root) return;

    if (this.currentPostId) {
      const post = (this.db.blogs || []).find((b: BlogPost) => b.id === this.currentPostId);
      if (post) {
        this.renderDetailView(root, post);
        return;
      } else {
        this.currentPostId = null;
      }
    }

    this.renderFeedView(root);
  }

  private renderFeedView(root: HTMLElement) {
    const query = this.searchQuery.toLowerCase().trim();
    const selectedCat = this.selectedCategory;

    const filtered = (this.db.blogs || []).filter((b: BlogPost) => {
      const matchCat = selectedCat === "All" || b.category === selectedCat || b.categorySlug === selectedCat;
      const matchSearch = !query || b.title.toLowerCase().includes(query) || (b.excerpt && b.excerpt.toLowerCase().includes(query)) || (b.content && b.content.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });

    const categories = ["All", ...(this.db.blogCategories || []).map((c: BlogCategory) => c.name)];
    const featured = this.db.blogs && this.db.blogs.length > 0 ? this.db.blogs[0] : null;

    root.innerHTML = `
      <!-- Standalone Top Header Navigation Bar -->
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 shadow-xl">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <a href="index.html" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white hover:bg-amber-500/20 flex items-center justify-center transition cursor-pointer shadow active:scale-95" title="Back to Home Dashboard">
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </a>
            <div class="leading-tight">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span class="text-[9px] uppercase font-mono font-black text-amber-400 tracking-wider">LUCKYBOX COMMUNITY</span>
              </div>
              <h1 class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Lottery Blog & News</span>
                <i class="fa-solid fa-newspaper text-xs text-amber-400"></i>
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[9.5px] font-mono font-bold text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800 shadow-inner">
              ${(this.db.blogs || []).length} Articles
            </span>
            <a href="index.html" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-amber-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition">
              <i class="fa-solid fa-house text-xs"></i>
              <span>Dashboard</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Main Blog Layout Container -->
      <main class="max-w-4xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-20 flex-1">
        
        <!-- Search Bar with Instant Reset -->
        <div class="space-y-3">
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input type="text" id="blog-search-box" value="${this.searchQuery}" placeholder="Search guides, strategies, winners stories..." class="w-full bg-[#111625] border border-slate-800 focus:border-amber-500/80 rounded-2xl pl-10 pr-10 py-3 text-xs text-white outline-none placeholder-slate-500 font-mono shadow-inner transition" />
            ${this.searchQuery ? `
              <button id="blog-clear-search" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer">
                <i class="fa-solid fa-xmark"></i>
              </button>
            ` : ''}
          </div>

          <!-- Dynamic Category Filter Pills -->
          <div class="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-800">
            ${categories.map((cat: string) => `
              <button class="blog-cat-btn shrink-0 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer active:scale-95 ${this.selectedCategory === cat ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/40'}" data-cat="${cat}">
                ${cat}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Featured Story Card (if no search filter is active) -->
        ${!this.searchQuery && this.selectedCategory === "All" && featured ? `
          <div class="blog-card bg-gradient-to-br from-[#161d36] via-[#0d1326] to-[#1d1636] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl cursor-pointer group hover:border-amber-400 transition" data-id="${featured.id}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="h-52 md:h-full relative overflow-hidden bg-slate-950 min-h-[200px]">
                <img src="${featured.coverImage || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80'}" alt="Cover" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span class="absolute top-3 left-3 bg-amber-500 text-slate-950 font-mono font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  ⭐ FEATURED STORY
                </span>
              </div>
              <div class="p-5 md:p-6 flex flex-col justify-between space-y-3">
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-[10px] font-mono text-amber-400">
                    <span class="font-bold uppercase tracking-wider">${featured.category}</span>
                    <span>•</span>
                    <span class="text-slate-400">${featured.readTime || '3 min read'}</span>
                  </div>
                  <h2 class="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition leading-snug">
                    ${featured.title}
                  </h2>
                  <p class="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    ${featured.excerpt || featured.content.slice(0, 140) + '...'}
                  </p>
                </div>

                <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <img src="${featured.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}" class="w-6 h-6 rounded-full object-cover border border-slate-700" alt="Author" />
                    <span class="text-[11px] font-mono text-slate-300 font-bold">${featured.author}</span>
                  </div>
                  <span class="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                    Read Article <i class="fa-solid fa-arrow-right text-[10px]"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Articles Grid List -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black uppercase tracking-wider font-mono text-slate-300 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>${this.selectedCategory === 'All' ? 'Latest Publications' : `${this.selectedCategory} Articles`}</span>
            </h3>
            <span class="text-[10px] font-mono text-slate-500">${filtered.length} found</span>
          </div>

          ${filtered.length === 0 ? `
            <div class="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 text-center space-y-3">
              <i class="fa-solid fa-newspaper text-3xl text-slate-600"></i>
              <h4 class="text-xs font-bold text-slate-300">No blog articles match your criteria</h4>
              <p class="text-[11px] text-slate-500 max-w-sm mx-auto">Try clearing your search query or selecting a different category from above.</p>
              <button id="blog-reset-filters" class="bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs px-4 py-2 rounded-xl transition cursor-pointer">
                Clear All Filters
              </button>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${filtered.map((post: BlogPost) => {
                const commentsCount = (this.db.blogComments || []).filter((c: BlogComment) => c.blogId === post.id && c.status === "approved").length;
                return `
                  <div class="blog-card bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between group cursor-pointer transition duration-200 hover:-translate-y-0.5" data-id="${post.id}">
                    <div>
                      <div class="h-44 w-full relative overflow-hidden bg-slate-950">
                        <img src="${post.coverImage || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80'}" alt="Cover" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <span class="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                          ${post.category}
                        </span>
                      </div>
                      
                      <div class="p-4 sm:p-5 space-y-2">
                        <div class="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>${post.date}</span>
                          <span>${post.readTime || '3 min read'}</span>
                        </div>
                        <h4 class="text-sm font-black text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                          ${post.title}
                        </h4>
                        <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          ${post.excerpt || post.content.slice(0, 110) + '...'}
                        </p>
                      </div>
                    </div>

                    <div class="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex items-center justify-between border-t border-slate-800/50 mt-2">
                      <div class="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span class="flex items-center gap-1 text-rose-400">
                          <i class="fa-solid fa-heart text-[10px]"></i> ${post.likes || 0}
                        </span>
                        <span class="flex items-center gap-1 text-cyan-400">
                          <i class="fa-solid fa-comment text-[10px]"></i> ${commentsCount}
                        </span>
                      </div>
                      <span class="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition flex items-center gap-1">
                        Read <i class="fa-solid fa-chevron-right text-[9px]"></i>
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

      </main>

      <!-- Footer for Standalone Blog Page -->
      <footer class="border-t border-slate-800/80 bg-[#0b0f19] py-6 px-4 text-center space-y-2">
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-400">LuckyBox Lottery Portal</span>
            <span>•</span>
            <span>Community Blog System</span>
          </div>
          <div class="flex items-center gap-4">
            <a href="index.html" class="text-amber-400 hover:underline">← Back to Dashboard</a>
          </div>
        </div>
      </footer>
    `;

    this.bindFeedEvents();
  }

  private bindFeedEvents() {
    const searchBox = document.getElementById("blog-search-box") as HTMLInputElement;
    if (searchBox) {
      searchBox.oninput = (e: any) => {
        this.searchQuery = e.target.value;
        this.render();
      };
    }

    const clearSearch = document.getElementById("blog-clear-search");
    if (clearSearch) {
      clearSearch.onclick = () => {
        this.searchQuery = "";
        this.render();
      };
    }

    const resetFilters = document.getElementById("blog-reset-filters");
    if (resetFilters) {
      resetFilters.onclick = () => {
        this.searchQuery = "";
        this.selectedCategory = "All";
        this.render();
      };
    }

    const catButtons = document.querySelectorAll(".blog-cat-btn");
    catButtons.forEach(btn => {
      btn.addEventListener("click", (e: any) => {
        this.selectedCategory = e.currentTarget.getAttribute("data-cat");
        this.render();
      });
    });

    const cards = document.querySelectorAll(".blog-card");
    cards.forEach(card => {
      card.addEventListener("click", (e: any) => {
        const id = e.currentTarget.getAttribute("data-id");
        this.currentPostId = id;
        // update URL parameter cleanly without full reload
        const url = new URL(window.location.href);
        url.searchParams.set("post", id);
        window.history.pushState({}, "", url.toString());
        this.render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  private renderDetailView(root: HTMLElement, post: BlogPost) {
    const comments = (this.db.blogComments || []).filter((c: BlogComment) => 
      c.blogId === post.id && (c.status === "approved" || (this.currentUser && c.username === this.currentUser.username))
    );

    const formattedContent = this.formatContent(post.content);

    root.innerHTML = `
      <!-- Standalone Header with Back to Blog Feed -->
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 shadow-xl">
        <div class="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button id="blog-back-feed-btn" class="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer active:scale-95 shadow">
            <i class="fa-solid fa-arrow-left text-xs"></i>
            <span>All Articles</span>
          </button>

          <div class="flex items-center gap-2">
            <a href="index.html" class="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-amber-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition">
              <i class="fa-solid fa-house text-xs"></i>
              <span class="hidden sm:inline">Home Dashboard</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Article Reader View Body -->
      <article class="max-w-3xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-24 flex-1 font-sans">
        
        <!-- Category & Title Header -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-0.5 rounded-full font-bold uppercase text-[10px]">
              ${post.category}
            </span>
            <span class="text-slate-500">•</span>
            <span class="text-slate-400">${post.readTime || '3 min read'}</span>
            <span class="text-slate-500">•</span>
            <span class="text-slate-400">${post.date}</span>
          </div>

          <h1 class="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight font-heading">
            ${post.title}
          </h1>

          <div class="flex items-center justify-between pt-2 border-b border-slate-800/80 pb-4">
            <div class="flex items-center gap-2.5">
              <img src="${post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}" class="w-8 h-8 rounded-full object-cover border border-slate-700" alt="Author" />
              <div>
                <span class="text-xs font-bold text-slate-200 block">${post.author}</span>
                <span class="text-[9.5px] font-mono text-slate-500">Verified Publisher</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button id="blog-like-button" class="flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer active:scale-95 shadow">
                <i class="fa-solid fa-heart text-xs"></i>
                <span>Like</span>
                (<span id="blog-like-count">${post.likes || 0}</span>)
              </button>
              <button id="blog-share-button" class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer active:scale-95 shadow">
                <i class="fa-solid fa-share-nodes text-xs"></i>
                <span class="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Featured Cover Image Banner -->
        <div class="w-full h-56 sm:h-72 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-950">
          <img src="${post.coverImage || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80'}" alt="Cover" class="w-full h-full object-cover" />
        </div>

        <!-- Rendered Rich Text Content -->
        <div class="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
          ${formattedContent}
        </div>

        <!-- Tags List -->
        ${post.tags && post.tags.length > 0 ? `
          <div class="pt-4 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-mono text-slate-500 uppercase font-bold">Tags:</span>
            ${post.tags.map((t: string) => `
              <span class="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">
                #${t}
              </span>
            `).join('')}
          </div>
        ` : ''}

        <!-- Interactive Comments & Discussion Section -->
        <section class="pt-8 border-t border-slate-800 space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black text-white font-mono flex items-center gap-2">
              <i class="fa-solid fa-comments text-amber-400"></i>
              <span>Community Comments (${comments.length})</span>
            </h3>
            <span class="text-[10px] font-mono text-emerald-400">Live verified discussion</span>
          </div>

          <!-- Comment Input Form -->
          <div class="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 shadow-lg">
            <div class="space-y-1">
              <label class="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center justify-between">
                <span>Write a Comment / মন্তব্য করুন</span>
                <span id="comment-char-counter" class="text-slate-500 font-normal">0 / 500</span>
              </label>
              <textarea id="blog-comment-textarea" rows="3" maxlength="500" placeholder="Share your experience, congratulations, or questions (minimum 3 characters)..." class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white outline-none placeholder-slate-500 resize-none transition"></textarea>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <span class="text-[10px] font-mono text-slate-500">Posting as:</span>
                <input type="text" id="blog-comment-author" value="${this.currentUser ? this.currentUser.username : 'player_' + Math.floor(1000 + Math.random() * 9000)}" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-mono outline-none focus:border-amber-500/80 w-36" placeholder="Your name" />
              </div>
              <button id="blog-submit-comment" class="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5">
                <span>Post Comment</span>
                <i class="fa-solid fa-paper-plane text-[10px]"></i>
              </button>
            </div>
            <p id="comment-validation-msg" class="text-[10px] font-mono text-rose-400 hidden"></p>
          </div>

          <!-- Comments Feed -->
          <div class="space-y-3">
            ${comments.length === 0 ? `
              <div class="text-center py-6 text-slate-500 text-xs font-mono">
                No comments yet. Be the first to share your thoughts on this story!
              </div>
            ` : comments.map((c: BlogComment) => `
              <div class="bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
                <div class="flex items-center justify-between text-[10px] font-mono">
                  <span class="font-bold text-amber-300">@${c.username}</span>
                  <div class="flex items-center gap-2">
                    ${c.status === 'pending' ? `
                      <span class="text-[8px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">Pending Approval</span>
                    ` : ''}
                    <span class="text-slate-500">${new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed font-sans">${c.text}</p>
              </div>
            `).join('')}
          </div>
        </section>

      </article>
    `;

    this.bindDetailEvents(post);
  }

  private bindDetailEvents(post: BlogPost) {
    const backBtn = document.getElementById("blog-back-feed-btn");
    if (backBtn) {
      backBtn.onclick = () => {
        this.currentPostId = null;
        const url = new URL(window.location.href);
        url.searchParams.delete("post");
        window.history.pushState({}, "", url.toString());
        this.render();
      };
    }

    const likeBtn = document.getElementById("blog-like-button");
    if (likeBtn) {
      likeBtn.onclick = () => {
        post.likes = (post.likes || 0) + 1;
        const countEl = document.getElementById("blog-like-count");
        if (countEl) countEl.textContent = String(post.likes);
        this.saveDB();
        this.showToast("Thank you for liking this article! ❤️", "success");
      };
    }

    const shareBtn = document.getElementById("blog-share-button");
    if (shareBtn) {
      shareBtn.onclick = () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            this.showToast("Article link copied to clipboard! 📋", "success");
          }).catch(() => {
            this.showToast("Link: " + window.location.href, "info");
          });
        }
      };
    }

    const textarea = document.getElementById("blog-comment-textarea") as HTMLTextAreaElement;
    const authorInput = document.getElementById("blog-comment-author") as HTMLInputElement;
    const charCounter = document.getElementById("comment-char-counter");
    const valMsg = document.getElementById("comment-validation-msg");
    const submitBtn = document.getElementById("blog-submit-comment");

    if (textarea && charCounter) {
      textarea.oninput = () => {
        charCounter.textContent = `${textarea.value.length} / 500`;
        if (valMsg) valMsg.classList.add("hidden");
      };
    }

    if (submitBtn && textarea && authorInput) {
      submitBtn.onclick = () => {
        const text = textarea.value.trim();
        const author = authorInput.value.trim() || "Guest";

        if (text.length < 3) {
          if (valMsg) {
            valMsg.textContent = "Comment must contain at least 3 characters.";
            valMsg.classList.remove("hidden");
          }
          return;
        }

        const newComment: BlogComment = {
          id: "cm-" + Date.now(),
          blogId: post.id,
          username: author,
          text: text,
          createdAt: new Date().toISOString(),
          status: "approved"
        };

        if (!this.db.blogComments) this.db.blogComments = [];
        this.db.blogComments.unshift(newComment);
        this.saveDB();

        this.showToast("Your comment has been posted! 💬", "success");
        this.render();
      };
    }
  }
}

// Start the Standalone Blog Application
const app = new StandaloneBlogApp();
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => app.init());
} else {
  app.init();
}
