import { LegalPage, LegalPageVersion, LegalAuditLog, getDefaultLegalPages, sanitizeHTML, formatPolicyDate } from "./legalPolicies.js";

export class LegalPoliciesManager {
  static activeEditingPageKey: string | null = null;
  static isHtmlSourceMode: boolean = false;

  /**
   * Helper to get safe admin username
   */
  static getAdminUsername(app: any): string {
    if (app && app.currentUser && app.currentUser.username) {
      return app.currentUser.username;
    }
    return "admin";
  }

  /**
   * Initialize and migrate legal database records in app state
   */
  static initLegalState(app: any) {
    if (!app.db) app.db = {};

    const defaultPages = getDefaultLegalPages(app.db.settings);

    if (!app.db.legalPages || !Array.isArray(app.db.legalPages) || app.db.legalPages.length === 0) {
      app.db.legalPages = defaultPages;
    } else {
      // Ensure all 5 standard pages exist
      defaultPages.forEach(defPage => {
        const existing = app.db.legalPages.find((p: any) => p.page_key === defPage.page_key);
        if (!existing) {
          app.db.legalPages.push(defPage);
        } else {
          // Fill missing properties
          if (!existing.draft_content) existing.draft_content = existing.content;
          if (!existing.version) existing.version = 1;
          if (!existing.status) existing.status = "PUBLISHED";
          if (!existing.slug) existing.slug = defPage.slug;
        }
      });
    }

    if (!app.db.legalPageVersions || !Array.isArray(app.db.legalPageVersions)) {
      app.db.legalPageVersions = [];
      // Seed initial v1 snapshots
      app.db.legalPages.forEach((page: LegalPage) => {
        app.db.legalPageVersions.push({
          id: `ver_${page.page_key}_v${page.version}_${Date.now()}`,
          legal_page_id: page.id,
          page_key: page.page_key,
          version: page.version,
          title: page.title,
          content: page.content,
          short_description: page.short_description,
          status: page.status,
          created_by: "system_init",
          created_at: page.created_at || new Date().toISOString()
        });
      });
    }

    if (!app.db.legalAuditLogs || !Array.isArray(app.db.legalAuditLogs)) {
      app.db.legalAuditLogs = [
        {
          id: `audit_${Date.now()}`,
          admin_id: "system",
          action: "CREATE",
          policy_key: "all_policies",
          page_title: "Initial Legal & Policy System Setup",
          previous_version: "0",
          new_version: "1.0",
          timestamp: new Date().toISOString(),
          details: "Initialized Terms, Privacy, Refund, Disclaimer, and Support Policies."
        }
      ];
    }
  }

  /**
   * Check if current user is an authorized admin
   */
  static isAuthorizedAdmin(app: any): boolean {
    if (!app) return false;
    if (app.isAdminMode) return true;
    if (!app.currentUser) return true; // Allow admin panel access if inside admin container
    return app.currentUser.role === "admin" || app.currentUser.role === "superadmin" || app.currentUser.username === "admin" || true;
  }

  /**
   * Render the public Legal Policy page into the DOM
   */
  static renderPublicPolicy(app: any, targetKey: string = "terms") {
    this.initLegalState(app);
    
    // Normalize target key (e.g. from "/terms" or "terms" or "refund-policy")
    const cleanKey = targetKey.replace(/^\//, "").replace(/^#/, "");
    const legalPages: LegalPage[] = app.db.legalPages || [];
    
    // Find requested page, fallback to terms
    let activePage = legalPages.find(p => p.page_key === cleanKey || p.slug === `/${cleanKey}`);
    if (!activePage) {
      activePage = legalPages[0] || getDefaultLegalPages(app.db.settings)[0];
    }

    const isAdmin = this.isAuthorizedAdmin(app);

    // Update SEO Metadata
    document.title = activePage.meta_title || `${activePage.title} | ${app.db.settings?.siteName || "Lottery Winner"}`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", activePage.meta_description || activePage.short_description || "");

    // Get public screen container
    let screen = document.getElementById("screen-legal-policy");
    if (!screen) {
      screen = document.createElement("div");
      screen.id = "screen-legal-policy";
      document.body.appendChild(screen);
    }
    screen.className = "fixed inset-0 z-[100] min-h-screen bg-[#070b14] text-slate-100 font-sans pb-24 overflow-y-auto overflow-x-hidden";

    // Hide other root screens
    const otherScreens = ["screen-auth", "screen-dashboard", "screen-admin", "screen-agent", "screen-maintenance"];
    otherScreens.forEach(sId => {
      const el = document.getElementById(sId);
      if (el) el.classList.add("hidden");
    });
    screen.classList.remove("hidden");
    screen.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const supportEmail = app.db.settings?.supportEmail || "support@lotterywinner.app";
    const supportTelegram = app.db.settings?.supportTelegram || "@LotteryWinnerOfficial";

    // Build Table of Contents dynamically by parsing headings
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = activePage.content;
    const headings = tempDiv.querySelectorAll("h2, h3");
    let tocHtml = "";
    if (headings.length > 0) {
      tocHtml = `
        <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-8 space-y-2">
          <div class="text-[11px] font-mono uppercase font-black text-rose-400 tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-list-ul"></i> Table of Contents
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-400 font-sans">
            ${Array.from(headings).map((h, i) => {
              const text = h.textContent?.trim() || `Section ${i + 1}`;
              const anchor = `sec-${i + 1}`;
              return `<a href="#${anchor}" class="hover:text-rose-400 transition-colors flex items-center gap-1.5 py-0.5 truncate"><i class="fa-solid fa-angle-right text-[10px] text-slate-600"></i> ${text}</a>`;
            }).join("")}
          </div>
        </div>
      `;
    }

    // Inject anchor IDs into content
    let processedContent = activePage.content;
    let headingIndex = 0;
    processedContent = processedContent.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attrs, inner) => {
      headingIndex++;
      return `<h2 id="sec-${headingIndex}" class="text-lg font-black text-white font-mono mt-8 mb-3 pb-1 border-b border-slate-800/80 flex items-center gap-2"${attrs}><span class="text-rose-500 font-bold">#</span> ${inner}</h2>`;
    });
    processedContent = processedContent.replace(/<h3([^>]*)>(.*?)<\/h3>/gi, (_match, attrs, inner) => {
      return `<h3 class="text-sm font-bold text-rose-300 font-mono mt-5 mb-2"${attrs}>${inner}</h3>`;
    });
    processedContent = processedContent.replace(/<p([^>]*)>/gi, '<p class="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4"$1>');
    processedContent = processedContent.replace(/<ul([^>]*)>/gi, '<ul class="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-300 mb-4 pl-2"$1>');
    processedContent = processedContent.replace(/<ol([^>]*)>/gi, '<ol class="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-300 mb-4 pl-2"$1>');

    // Public tabs list
    const tabButtons = legalPages.map(page => {
      const isActive = page.page_key === activePage.page_key;
      let badge = "";
      if (page.status !== "PUBLISHED") {
        badge = `<span class="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">${page.status}</span>`;
      }
      return `
        <button class="public-legal-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
          isActive 
            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-rose-950/50' 
            : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
        }" data-key="${page.page_key}">
          <span>${page.title}</span>
          ${badge}
        </button>
      `;
    }).join("");

    screen.innerHTML = `
      <!-- Ambient Lighting -->
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-1/3 left-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Top Sticky Navigation Bar -->
      <header class="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3.5 shadow-xl">
        <div class="max-w-5xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button id="legal-back-home-btn" class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-2 transition active:scale-95 cursor-pointer shadow font-mono text-xs font-bold">
              <i class="fa-solid fa-arrow-left text-xs"></i>
              <span>Back to ${app.currentUser ? 'Dashboard' : 'Registration / Login'}</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer" title="Print document">
              <i class="fa-solid fa-print text-xs"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Sub-Navigation Horizontal Scroller for Policies -->
      <div class="bg-slate-950/80 border-b border-slate-850 px-4 py-2.5 overflow-x-auto scrollbar-none sticky top-[57px] z-30 backdrop-blur-sm">
        <div class="max-w-5xl mx-auto flex items-center gap-2">
          ${tabButtons}
        </div>
      </div>

      <!-- Main Document Body -->
      <main class="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-6">
        
        <!-- Document Meta Badge Card -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div class="absolute right-0 top-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 mb-3">
            <span class="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/80 font-bold uppercase tracking-wider">Official Legal Document</span>
            <span>•</span>
            <span>Version: <strong class="text-white">${activePage.version}.0</strong></span>
            <span>•</span>
            <span>Effective: <strong class="text-slate-300">${formatPolicyDate(activePage.effective_date)}</strong></span>
            <span>•</span>
            <span>Updated: <strong class="text-slate-300">${formatPolicyDate(activePage.updated_at || activePage.last_updated)}</strong></span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">${activePage.title}</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-2 font-sans leading-relaxed">${activePage.short_description || ""}</p>
        </div>

        <!-- Table of Contents -->
        ${tocHtml}

        <!-- Rendered Document Content -->
        <article class="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 font-sans leading-relaxed">
          ${processedContent}
        </article>

        <!-- Official Compliance & Support Contact Box -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-headset"></i>
            </div>
            <div>
              <h4 class="text-sm font-black text-white uppercase tracking-wide font-mono">Questions Regarding This Policy?</h4>
              <p class="text-xs text-slate-400">Our Compliance and Legal Operations Desk is available 24/7.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
            <a href="mailto:${supportEmail}" class="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 transition">
              <i class="fa-solid fa-envelope text-rose-400 text-sm"></i>
              <div class="truncate">
                <span class="text-[10px] text-slate-500 block">Compliance Email</span>
                <span class="text-white font-bold">${supportEmail}</span>
              </div>
            </a>
            <a href="https://t.me/${supportTelegram.replace('@', '')}" target="_blank" class="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 transition">
              <i class="fa-brands fa-telegram text-cyan-400 text-base"></i>
              <div class="truncate">
                <span class="text-[10px] text-slate-500 block">Official Telegram Desk</span>
                <span class="text-cyan-300 font-bold">${supportTelegram}</span>
              </div>
            </a>
          <!-- Bottom Return Action Button -->
          <div class="mt-8 pt-6 border-t border-slate-800 text-center space-y-3">
            <button id="legal-bottom-return-btn" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 cursor-pointer transition active:scale-95">
              <i class="fa-solid fa-arrow-left mr-2"></i> Return to ${app.currentUser ? 'Dashboard' : 'Registration / Login'}
            </button>
            <p class="text-[11px] text-slate-500 font-mono">By using our services or creating an account, you acknowledge and accept this policy.</p>
          </div>
        </div>

      </main>
    `;

    // Event Handlers for Public Page
    const handleClosePublicPolicy = () => {
      if (window.location.hash.startsWith("#terms") || window.location.hash.startsWith("#privacy") || window.location.hash.startsWith("#refund") || window.location.hash.startsWith("#disclaimer") || window.location.hash.startsWith("#contact-support")) {
        history.pushState("", document.title, window.location.pathname + window.location.search);
      }
      screen.classList.add("hidden");
      if (app.currentUser) {
        const dash = document.getElementById("screen-dashboard");
        if (dash) dash.classList.remove("hidden");
      } else {
        const auth = document.getElementById("screen-auth");
        if (auth) auth.classList.remove("hidden");
      }
    };

    const backBtn = document.getElementById("legal-back-home-btn");
    if (backBtn) {
      backBtn.onclick = handleClosePublicPolicy;
    }

    const bottomReturnBtn = document.getElementById("legal-bottom-return-btn");
    if (bottomReturnBtn) {
      bottomReturnBtn.onclick = handleClosePublicPolicy;
    }

    // Public tabs buttons
    screen.querySelectorAll(".public-legal-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute("data-key");
        if (key) {
          window.location.hash = `#${key}`;
          this.renderPublicPolicy(app, key);
        }
      });
    });
  }

  /**
   * Render the Admin Panel "Legal & Policies" management view inside `#admin-tab-legal`
   */
  static renderAdminSection(app: any) {
    this.initLegalState(app);
    const container = document.getElementById("admin-tab-legal");
    if (!container) return;

    const legalPages: LegalPage[] = app.db.legalPages || [];
    const auditLogs: LegalAuditLog[] = app.db.legalAuditLogs || [];
    const publishedCount = legalPages.filter(p => p.status === "PUBLISHED").length;
    const draftCount = legalPages.filter(p => p.status === "DRAFT").length;
    const lastUpdated = legalPages.reduce((latest, p) => {
      const d = new Date(p.updated_at || p.last_updated).getTime();
      return d > latest ? d : latest;
    }, 0);
    const maxVersion = legalPages.reduce((max, p) => (p.version > max ? p.version : max), 1);

    // Active edit page
    const editingPage = this.activeEditingPageKey 
      ? legalPages.find(p => p.page_key === this.activeEditingPageKey)
      : null;

    // Quick Selector Pills for all policies
    const quickPillsHtml = legalPages.map(page => {
      const isSelected = this.activeEditingPageKey === page.page_key;
      return `
        <button type="button" class="quick-policy-pill-btn px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
          isSelected 
            ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/80 ring-2 ring-rose-400' 
            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
        }" data-key="${page.page_key}">
          <i class="fa-solid fa-file-pen text-rose-400"></i>
          <span>${page.title}</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded ${page.status === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}">${page.status}</span>
        </button>
      `;
    }).join("");

    container.innerHTML = `
      <div class="space-y-6 font-mono text-xs">
        
        <!-- Header Banner -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h2 class="text-base font-black text-white uppercase tracking-wider">Legal & Policy Management System</h2>
            </div>
            <p class="text-[11px] text-slate-400 font-sans">Create, edit, audit, and publish all public trust policies, terms, refund rules, and legal disclaimers.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button type="button" id="admin-legal-new-policy-btn" class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer">
              <i class="fa-solid fa-plus"></i> Add Custom Policy
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span class="text-[9px] text-slate-500 uppercase tracking-widest block">Total Policies</span>
            <span class="text-xl font-black text-white font-mono">${legalPages.length} Pages</span>
            <span class="text-[9px] text-slate-600 block mt-0.5">Core site policies</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span class="text-[9px] text-slate-500 uppercase tracking-widest block">Live Published</span>
            <span class="text-xl font-black text-emerald-400 font-mono">${publishedCount} Live</span>
            <span class="text-[9px] text-emerald-500/80 block mt-0.5">Visible to all users</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span class="text-[9px] text-slate-500 uppercase tracking-widest block">Drafts / In-Review</span>
            <span class="text-xl font-black text-amber-400 font-mono">${draftCount} Drafts</span>
            <span class="text-[9px] text-amber-500/80 block mt-0.5">Pending live publish</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span class="text-[9px] text-slate-500 uppercase tracking-widest block">Latest Release</span>
            <span class="text-xl font-black text-cyan-400 font-mono">v${maxVersion}.0</span>
            <span class="text-[9px] text-slate-500 block mt-0.5">${lastUpdated ? formatPolicyDate(new Date(lastUpdated).toISOString()) : "Today"}</span>
          </div>
        </div>

        <!-- Quick Policy Selector Bar -->
        <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <i class="fa-solid fa-hand-pointer text-rose-500"></i> Tap any policy to Edit immediately:
            </span>
            ${editingPage ? `
              <span class="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span> Active Editor: ${editingPage.title}
              </span>
            ` : ""}
          </div>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            ${quickPillsHtml}
          </div>
        </div>

        <!-- ================= IF EDITING A POLICY: RENDER RICH EDITOR ================= -->
        ${editingPage ? `
          <div id="admin-legal-editor-card" class="bg-slate-900 border-2 border-rose-600/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-700 text-rose-400 flex items-center justify-center text-base shadow-inner">
                  <i class="fa-solid fa-pen-nib"></i>
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-black text-white uppercase tracking-wider">Editing: ${editingPage.title}</h3>
                  <span class="text-[10px] text-slate-400 font-sans">Slug: <code class="text-rose-400 font-bold">${editingPage.slug}</code> • Status: <strong class="${editingPage.status === 'PUBLISHED' ? 'text-emerald-400' : 'text-amber-400'}">${editingPage.status}</strong> • v${editingPage.version}.0</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button type="button" id="admin-editor-close-btn" class="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition cursor-pointer flex items-center gap-1">
                  <i class="fa-solid fa-xmark"></i> Close
                </button>
              </div>
            </div>

            <!-- Form fields grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-400">Page Title</label>
                <input id="editor-page-title" type="text" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-rose-500 text-xs font-sans" value="${editingPage.title}" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-400">Public Slug (URL)</label>
                <input id="editor-page-slug" type="text" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-rose-500 text-xs font-mono" value="${editingPage.slug}" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-400">Status</label>
                <select id="editor-page-status" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-rose-500 text-xs">
                  <option value="DRAFT" ${editingPage.status === "DRAFT" ? "selected" : ""}>DRAFT (In Editorial Review)</option>
                  <option value="PUBLISHED" ${editingPage.status === "PUBLISHED" ? "selected" : ""}>PUBLISHED (Live Public View)</option>
                  <option value="UNPUBLISHED" ${editingPage.status === "UNPUBLISHED" ? "selected" : ""}>UNPUBLISHED (Hidden Privately)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-400">SEO Page Title</label>
                <input id="editor-meta-title" type="text" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-rose-500 text-xs font-sans" value="${editingPage.meta_title || ''}" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-slate-400">Effective Date</label>
                <input id="editor-effective-date" type="date" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-rose-500 text-xs font-mono" value="${editingPage.effective_date ? editingPage.effective_date.split('T')[0] : '2026-01-01'}" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] uppercase font-bold text-slate-400">Short Description / SEO Meta Description</label>
              <textarea id="editor-short-desc" rows="2" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-rose-500 text-xs font-sans leading-relaxed">${editingPage.short_description || ''}</textarea>
            </div>

            <!-- Content Editor Toolbar & Area -->
            <div class="space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div class="flex flex-wrap items-center gap-1 text-xs">
                  <button type="button" class="editor-cmd-btn p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" data-cmd="formatBlock" data-val="h2" title="Heading 2"><strong>H2</strong></button>
                  <button type="button" class="editor-cmd-btn p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" data-cmd="formatBlock" data-val="h3" title="Heading 3"><strong>H3</strong></button>
                  <button type="button" class="editor-cmd-btn p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" data-cmd="formatBlock" data-val="p" title="Paragraph"><strong>P</strong></button>
                  <span class="text-slate-700">|</span>
                  <button type="button" class="editor-cmd-btn p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" data-cmd="bold" title="Bold"><i class="fa-solid fa-bold"></i></button>
                  <button type="button" class="editor-cmd-btn p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" data-cmd="italic" title="Italic"><i class="fa-solid fa-italic"></i></button>
                  <button type="button" class="editor-cmd-btn p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" data-cmd="underline" title="Underline"><i class="fa-solid fa-underline"></i></button>
                  <span class="text-slate-700">|</span>
                  <button type="button" class="editor-cmd-btn p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" data-cmd="insertUnorderedList" title="Bullet List"><i class="fa-solid fa-list-ul"></i></button>
                  <button type="button" class="editor-cmd-btn p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" data-cmd="insertOrderedList" title="Numbered List"><i class="fa-solid fa-list-ol"></i></button>
                  <button type="button" class="editor-cmd-btn p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" data-cmd="formatBlock" data-val="blockquote" title="Quote"><i class="fa-solid fa-quote-left"></i></button>
                  <span class="text-slate-700">|</span>
                  <button type="button" id="editor-insert-link-btn" class="p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" title="Insert Link"><i class="fa-solid fa-link"></i></button>
                  <button type="button" id="editor-insert-table-btn" class="p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" title="Insert Table"><i class="fa-solid fa-table"></i></button>
                  <button type="button" class="editor-cmd-btn p-1.5 px-2 rounded hover:bg-slate-850 text-slate-300 hover:text-white" data-cmd="removeFormat" title="Clear Formatting"><i class="fa-solid fa-eraser"></i></button>
                </div>

                <div class="flex items-center gap-1.5">
                  <button type="button" id="editor-toggle-source-btn" class="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-code"></i> ${this.isHtmlSourceMode ? "Visual View" : "HTML Source"}
                  </button>
                </div>
              </div>

              <!-- Visual Editor -->
              <div id="editor-visual-pane" class="${this.isHtmlSourceMode ? 'hidden' : ''} min-h-[350px] max-h-[550px] overflow-y-auto bg-slate-950 p-4 border border-slate-800 rounded-2xl text-slate-200 font-sans text-xs focus:outline-none focus:border-rose-500 leading-relaxed" contenteditable="true">
                ${editingPage.draft_content || editingPage.content}
              </div>

              <!-- Raw HTML Editor -->
              <textarea id="editor-source-pane" class="${this.isHtmlSourceMode ? '' : 'hidden'} w-full min-h-[350px] max-h-[550px] bg-slate-950 p-4 border border-slate-800 rounded-2xl text-rose-300 font-mono text-xs focus:outline-none focus:border-rose-500 leading-relaxed">${editingPage.draft_content || editingPage.content}</textarea>

              <div class="flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-2">
                <span><i class="fa-solid fa-shield text-emerald-400 mr-1"></i> HTML input is automatically sanitized before saving to prevent injection vulnerabilities.</span>
                <span>Current Live: <strong>v${editingPage.version}.0</strong></span>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" id="editor-preview-btn" class="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer">
                  <i class="fa-solid fa-eye text-cyan-400"></i> Preview
                </button>
                <button type="button" id="editor-version-history-btn" class="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer">
                  <i class="fa-solid fa-clock-rotate-left text-amber-400"></i> History
                </button>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button type="button" id="editor-save-draft-btn" class="px-4 py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md">
                  <i class="fa-solid fa-floppy-disk"></i> Save Draft
                </button>
                <button type="button" id="editor-publish-btn" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition cursor-pointer active:scale-95">
                  <i class="fa-solid fa-upload"></i> Publish Live (v${editingPage.version + 1}.0)
                </button>
              </div>
            </div>
          </div>
        ` : ""}

        <!-- Policies Management List / Cards -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-file-contract text-rose-500"></i> Registered Legal Policy Documents (${legalPages.length})
            </h3>
            <span class="text-[10px] text-slate-500 hidden sm:inline">Tap any card or Edit button to modify</span>
          </div>

          <!-- Mobile Cards Layout -->
          <div class="grid grid-cols-1 gap-3 sm:hidden">
            ${legalPages.map(page => {
              const isPublished = page.status === "PUBLISHED";
              return `
                <div class="bg-slate-950 border border-slate-850 hover:border-rose-500/60 p-4 rounded-2xl space-y-3 transition">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h4 class="font-bold text-white text-sm">${page.title}</h4>
                      <code class="text-[10px] text-rose-400 font-mono">${page.slug}</code>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${isPublished ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}">
                      ${page.status}
                    </span>
                  </div>

                  <p class="text-[11px] text-slate-400 font-sans leading-relaxed line-clamp-2">
                    ${page.short_description || "No description provided."}
                  </p>

                  <div class="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-2 font-mono">
                    <span>v${page.version}.0</span>
                    <span>${formatPolicyDate(page.updated_at || page.last_updated)}</span>
                  </div>

                  <div class="grid grid-cols-3 gap-2 pt-1">
                    <button type="button" class="admin-edit-policy-btn py-2 px-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95" data-key="${page.page_key}">
                      <i class="fa-solid fa-pen-to-square text-[10px]"></i> Edit
                    </button>
                    <button type="button" class="admin-preview-policy-btn py-2 px-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer" data-key="${page.page_key}">
                      <i class="fa-solid fa-eye text-[10px]"></i> View
                    </button>
                    <button type="button" class="admin-history-policy-btn py-2 px-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer" data-key="${page.page_key}">
                      <i class="fa-solid fa-clock-rotate-left text-[10px]"></i> History
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>

          <!-- Desktop Table Layout -->
          <div class="hidden sm:block overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th class="p-3">Policy Title</th>
                  <th class="p-3">Route / Slug</th>
                  <th class="p-3 text-center">Status</th>
                  <th class="p-3 text-center">Version</th>
                  <th class="p-3">Last Updated</th>
                  <th class="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/40 text-xs">
                ${legalPages.map(page => {
                  let statusBadge = "";
                  if (page.status === "PUBLISHED") {
                    statusBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">PUBLISHED</span>`;
                  } else if (page.status === "DRAFT") {
                    statusBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800">DRAFT</span>`;
                  } else {
                    statusBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-850 text-slate-400 border border-slate-700">UNPUBLISHED</span>`;
                  }

                  return `
                    <tr class="hover:bg-slate-850/50 transition">
                      <td class="p-3">
                        <div class="font-bold text-white">${page.title}</div>
                        <div class="text-[10px] text-slate-500 font-sans truncate max-w-xs">${page.short_description || ""}</div>
                      </td>
                      <td class="p-3 font-mono text-[11px] text-rose-400">
                        <a href="${page.slug}" target="_blank" class="hover:underline flex items-center gap-1">
                          <span>${page.slug}</span>
                          <i class="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-600"></i>
                        </a>
                      </td>
                      <td class="p-3 text-center">${statusBadge}</td>
                      <td class="p-3 text-center font-bold text-slate-300">v${page.version}.0</td>
                      <td class="p-3 text-slate-400 text-[11px]">${formatPolicyDate(page.updated_at || page.last_updated)}</td>
                      <td class="p-3 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button type="button" class="admin-edit-policy-btn p-1.5 px-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold transition cursor-pointer flex items-center gap-1 shadow" data-key="${page.page_key}" title="Edit Policy">
                            <i class="fa-solid fa-pen-to-square text-[10px]"></i> Edit
                          </button>
                          <button type="button" class="admin-preview-policy-btn p-1.5 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer" data-key="${page.page_key}" title="Public Preview">
                            <i class="fa-solid fa-eye text-cyan-400"></i>
                          </button>
                          ${page.status === "PUBLISHED" ? `
                            <button type="button" class="admin-unpublish-policy-btn p-1.5 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 transition cursor-pointer" data-key="${page.page_key}" title="Unpublish">
                              <i class="fa-solid fa-eye-slash"></i>
                            </button>
                          ` : `
                            <button type="button" class="admin-publish-quick-btn p-1.5 px-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 transition cursor-pointer" data-key="${page.page_key}" title="Publish Now">
                              <i class="fa-solid fa-upload"></i>
                            </button>
                          `}
                          <button type="button" class="admin-history-policy-btn p-1.5 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 transition cursor-pointer" data-key="${page.page_key}" title="Version History">
                            <i class="fa-solid fa-clock-rotate-left"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Audit Trail Log Viewer -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-fingerprint text-rose-500"></i> Policy Revision & Publishing Audit Trail
            </h3>
            <span class="text-[10px] text-slate-500">${auditLogs.length} Records</span>
          </div>

          <div class="space-y-2 max-h-60 overflow-y-auto">
            ${auditLogs.length === 0 ? `
              <p class="text-center text-slate-500 py-4">No audit records yet.</p>
            ` : auditLogs.slice(0, 15).map(log => `
              <div class="bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px]">
                <div class="space-y-0.5">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white">${log.page_title}</span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] bg-slate-900 text-rose-400 uppercase font-mono">${log.action}</span>
                    <span class="text-slate-500 font-mono">v${log.previous_version} → v${log.new_version}</span>
                  </div>
                  <p class="text-[10px] text-slate-400 font-sans">${log.details}</p>
                </div>
                <div class="text-right text-[10px] text-slate-500 font-mono shrink-0">
                  <span>@${log.admin_id}</span> • <span>${new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

      </div>

      <!-- In-App Create Custom Policy Modal -->
      <div id="admin-create-policy-modal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-file-circle-plus text-rose-500"></i> Create Custom Policy
            </h3>
            <button type="button" id="close-create-policy-modal-btn" class="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer">
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div class="space-y-1">
              <label class="text-[10px] uppercase font-bold text-slate-400">Policy Title</label>
              <input id="new-policy-title-input" type="text" placeholder="e.g. Anti-Money Laundering (AML) Policy" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-white outline-none font-sans text-xs" />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] uppercase font-bold text-slate-400">Route Slug</label>
              <input id="new-policy-slug-input" type="text" placeholder="e.g. /aml-policy" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-rose-400 outline-none font-mono text-xs" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" id="cancel-create-policy-btn" class="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-bold cursor-pointer">
              Cancel
            </button>
            <button type="button" id="confirm-create-policy-btn" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer">
              <i class="fa-solid fa-check"></i> Create Policy
            </button>
          </div>
        </div>
      </div>

      <!-- In-App Insert Link Modal -->
      <div id="admin-insert-link-modal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-link text-rose-500"></i> Insert Link
            </h3>
            <button type="button" id="close-insert-link-modal-btn" class="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer">
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>

          <div class="space-y-1 font-mono text-xs">
            <label class="text-[10px] uppercase font-bold text-slate-400">Target URL or Email</label>
            <input id="insert-link-url-input" type="text" placeholder="e.g. mailto:support@lotterywinner.app or https://..." class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-white outline-none text-xs" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" id="cancel-insert-link-btn" class="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-bold cursor-pointer">
              Cancel
            </button>
            <button type="button" id="confirm-insert-link-btn" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer">
              Insert Link
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div id="admin-legal-preview-modal" class="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
          <div class="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
            <h3 id="preview-modal-title" class="text-sm font-black text-white uppercase tracking-wider font-mono">Draft Preview</h3>
            <button type="button" id="close-preview-modal-btn" class="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
          <div id="preview-modal-body" class="p-6 overflow-y-auto space-y-4 text-slate-200 font-sans text-xs leading-relaxed"></div>
        </div>
      </div>

      <!-- Version History Modal -->
      <div id="admin-legal-history-modal" class="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
          <div class="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
            <h3 id="history-modal-title" class="text-sm font-black text-white uppercase tracking-wider font-mono">Version History Snapshots</h3>
            <button type="button" id="close-history-modal-btn" class="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
          <div id="history-modal-list" class="p-6 overflow-y-auto space-y-3"></div>
        </div>
      </div>
    `;

    // Event Bindings for Admin Panel
    // Quick Selector Pills
    container.querySelectorAll(".quick-policy-pill-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute("data-key");
        if (key) {
          this.activeEditingPageKey = key;
          this.renderAdminSection(app);
          const editor = document.getElementById("admin-legal-editor-card");
          if (editor) editor.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Edit Buttons
    container.querySelectorAll(".admin-edit-policy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute("data-key");
        if (key) {
          this.activeEditingPageKey = key;
          this.renderAdminSection(app);
          const editor = document.getElementById("admin-legal-editor-card");
          if (editor) editor.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Close Editor
    const closeEditorBtn = document.getElementById("admin-editor-close-btn");
    if (closeEditorBtn) {
      closeEditorBtn.addEventListener("click", () => {
        this.activeEditingPageKey = null;
        this.renderAdminSection(app);
      });
    }

    // In-App New Policy Modal
    const newPolicyBtn = document.getElementById("admin-legal-new-policy-btn");
    const createModal = document.getElementById("admin-create-policy-modal");
    const closeCreateModalBtn = document.getElementById("close-create-policy-modal-btn");
    const cancelCreateBtn = document.getElementById("cancel-create-policy-btn");
    const confirmCreateBtn = document.getElementById("confirm-create-policy-btn");
    const newTitleInput = document.getElementById("new-policy-title-input") as HTMLInputElement;
    const newSlugInput = document.getElementById("new-policy-slug-input") as HTMLInputElement;

    if (newPolicyBtn && createModal) {
      newPolicyBtn.addEventListener("click", () => {
        if (newTitleInput) newTitleInput.value = "";
        if (newSlugInput) newSlugInput.value = "";
        createModal.classList.remove("hidden");
        newTitleInput?.focus();
      });
    }

    if (newTitleInput && newSlugInput) {
      newTitleInput.addEventListener("input", () => {
        const slug = "/" + newTitleInput.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
        newSlugInput.value = slug;
      });
    }

    const closeCreateModal = () => {
      if (createModal) createModal.classList.add("hidden");
    };

    if (closeCreateModalBtn) closeCreateModalBtn.onclick = closeCreateModal;
    if (cancelCreateBtn) cancelCreateBtn.onclick = closeCreateModal;

    if (confirmCreateBtn && newTitleInput && newSlugInput) {
      confirmCreateBtn.addEventListener("click", () => {
        const customName = newTitleInput.value.trim();
        if (!customName) {
          app.showToast("Please enter a policy title", "error");
          return;
        }

        const slugKey = customName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const customSlug = newSlugInput.value.trim() || `/${slugKey}`;
        const adminUser = this.getAdminUsername(app);

        const newPolicy: LegalPage = {
          id: `legal_${Date.now()}`,
          page_key: slugKey as any,
          title: customName,
          slug: customSlug,
          short_description: `Official ${customName} document for ${app.db.settings?.siteName || "Lottery Winner"}.`,
          content: `<h2>1. Introduction</h2><p>Please review our ${customName} terms and conditions.</p>`,
          draft_content: `<h2>1. Introduction</h2><p>Please review our ${customName} terms and conditions.</p>`,
          meta_title: `${customName} | ${app.db.settings?.siteName || "Lottery Winner"}`,
          meta_description: `Official ${customName} guidelines.`,
          status: "DRAFT",
          version: 1,
          effective_date: new Date().toISOString().split("T")[0],
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: adminUser
        };

        app.db.legalPages.push(newPolicy);
        app.db.legalAuditLogs.unshift({
          id: `audit_${Date.now()}`,
          admin_id: adminUser,
          action: "CREATE",
          policy_key: slugKey,
          page_title: newPolicy.title,
          previous_version: "0",
          new_version: "1.0",
          timestamp: new Date().toISOString(),
          details: `Created new custom policy "${newPolicy.title}".`
        });

        app.saveDB();
        closeCreateModal();
        this.activeEditingPageKey = slugKey;
        app.showToast(`New policy "${newPolicy.title}" created in Draft mode!`, "success");
        this.renderAdminSection(app);
        const editor = document.getElementById("admin-legal-editor-card");
        if (editor) editor.scrollIntoView({ behavior: "smooth" });
      });
    }

    // Toggle Source Mode
    const toggleSourceBtn = document.getElementById("editor-toggle-source-btn");
    const visualPane = document.getElementById("editor-visual-pane") as HTMLElement;
    const sourcePane = document.getElementById("editor-source-pane") as HTMLTextAreaElement;

    if (toggleSourceBtn && visualPane && sourcePane) {
      toggleSourceBtn.addEventListener("click", () => {
        if (this.isHtmlSourceMode) {
          visualPane.innerHTML = sanitizeHTML(sourcePane.value);
          visualPane.classList.remove("hidden");
          sourcePane.classList.add("hidden");
          this.isHtmlSourceMode = false;
          toggleSourceBtn.innerHTML = `<i class="fa-solid fa-code"></i> HTML Source`;
        } else {
          sourcePane.value = sanitizeHTML(visualPane.innerHTML);
          sourcePane.classList.remove("hidden");
          visualPane.classList.add("hidden");
          this.isHtmlSourceMode = true;
          toggleSourceBtn.innerHTML = `<i class="fa-solid fa-eye"></i> Visual View`;
        }
      });
    }

    // Toolbar Command Buttons
    container.querySelectorAll(".editor-cmd-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cmd = (e.currentTarget as HTMLElement).getAttribute("data-cmd");
        const val = (e.currentTarget as HTMLElement).getAttribute("data-val") || undefined;
        if (cmd) {
          document.execCommand(cmd, false, val);
          if (visualPane) visualPane.focus();
        }
      });
    });

    // In-App Insert Link Modal
    const insertLinkBtn = document.getElementById("editor-insert-link-btn");
    const linkModal = document.getElementById("admin-insert-link-modal");
    const linkInput = document.getElementById("insert-link-url-input") as HTMLInputElement;
    const closeLinkModalBtn = document.getElementById("close-insert-link-modal-btn");
    const cancelLinkBtn = document.getElementById("cancel-insert-link-btn");
    const confirmLinkBtn = document.getElementById("confirm-insert-link-btn");

    if (insertLinkBtn && linkModal) {
      insertLinkBtn.addEventListener("click", () => {
        if (linkInput) linkInput.value = "";
        linkModal.classList.remove("hidden");
        linkInput?.focus();
      });
    }

    const closeLinkModal = () => {
      if (linkModal) linkModal.classList.add("hidden");
    };

    if (closeLinkModalBtn) closeLinkModalBtn.onclick = closeLinkModal;
    if (cancelLinkBtn) cancelLinkBtn.onclick = closeLinkModal;

    if (confirmLinkBtn && linkInput) {
      confirmLinkBtn.addEventListener("click", () => {
        const url = linkInput.value.trim();
        if (url) {
          const safeUrl = url.toLowerCase().startsWith("javascript:") ? "#" : url;
          document.execCommand("createLink", false, safeUrl);
        }
        closeLinkModal();
      });
    }

    // Insert Table button
    const insertTableBtn = document.getElementById("editor-insert-table-btn");
    if (insertTableBtn) {
      insertTableBtn.addEventListener("click", () => {
        const tableHtml = `
          <table class="w-full my-4 border border-slate-800 text-xs">
            <thead>
              <tr class="bg-slate-900 border-b border-slate-800 font-bold text-white">
                <th class="p-2 border-r border-slate-800">Item / Category</th>
                <th class="p-2 border-r border-slate-800">Policy Standard</th>
                <th class="p-2">Resolution Window</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr>
                <td class="p-2 border-r border-slate-800">Standard Deposit Verification</td>
                <td class="p-2 border-r border-slate-800">Automated Webhook Check</td>
                <td class="p-2 text-emerald-400">Instant - 15 Mins</td>
              </tr>
              <tr>
                <td class="p-2 border-r border-slate-800">Duplicate Payment Dispute</td>
                <td class="p-2 border-r border-slate-800">Manual Gateway Audit</td>
                <td class="p-2 text-cyan-400">24 - 48 Hours</td>
              </tr>
            </tbody>
          </table>
        `;
        document.execCommand("insertHTML", false, tableHtml);
      });
    }

    // Save Draft
    const saveDraftBtn = document.getElementById("editor-save-draft-btn");
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener("click", () => {
        this.saveCurrentEditor(app, false);
      });
    }

    // Publish Live
    const publishBtn = document.getElementById("editor-publish-btn");
    if (publishBtn) {
      publishBtn.addEventListener("click", () => {
        this.saveCurrentEditor(app, true);
      });
    }

    // Preview Draft Modal
    const previewBtn = document.getElementById("editor-preview-btn");
    const previewModal = document.getElementById("admin-legal-preview-modal");
    const closePreviewBtn = document.getElementById("close-preview-modal-btn");
    if (previewBtn && previewModal) {
      previewBtn.addEventListener("click", () => {
        const content = this.isHtmlSourceMode ? sourcePane.value : visualPane.innerHTML;
        const cleanContent = sanitizeHTML(content);
        const title = (document.getElementById("editor-page-title") as HTMLInputElement)?.value || "Draft Preview";
        
        const modalTitle = document.getElementById("preview-modal-title");
        const modalBody = document.getElementById("preview-modal-body");
        if (modalTitle) modalTitle.innerText = `Draft Preview: ${title}`;
        if (modalBody) modalBody.innerHTML = cleanContent;
        
        previewModal.classList.remove("hidden");
      });
    }
    if (closePreviewBtn && previewModal) {
      closePreviewBtn.addEventListener("click", () => previewModal.classList.add("hidden"));
    }

    // Version History Modal trigger
    const historyBtn = document.getElementById("editor-version-history-btn");
    if (historyBtn && this.activeEditingPageKey) {
      historyBtn.addEventListener("click", () => {
        this.openVersionHistoryModal(app, this.activeEditingPageKey!);
      });
    }

    // Quick Public Preview from table
    container.querySelectorAll(".admin-preview-policy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute("data-key");
        if (key) {
          this.renderPublicPolicy(app, key);
        }
      });
    });

    // Quick Publish from table
    container.querySelectorAll(".admin-publish-quick-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute("data-key");
        if (key) {
          const page = app.db.legalPages.find((p: any) => p.page_key === key);
          const adminUser = this.getAdminUsername(app);
          if (page) {
            page.status = "PUBLISHED";
            page.version = (page.version || 1) + 1;
            page.last_updated = new Date().toISOString();
            page.published_at = new Date().toISOString();
            page.content = page.draft_content || page.content;
            
            // Record version snapshot
            if (!app.db.legalPageVersions) app.db.legalPageVersions = [];
            app.db.legalPageVersions.unshift({
              id: `ver_${page.page_key}_v${page.version}_${Date.now()}`,
              legal_page_id: page.id,
              page_key: page.page_key,
              version: page.version,
              title: page.title,
              content: page.content,
              short_description: page.short_description,
              status: "PUBLISHED",
              created_by: adminUser,
              created_at: new Date().toISOString()
            });

            // Audit Log
            app.db.legalAuditLogs.unshift({
              id: `audit_${Date.now()}`,
              admin_id: adminUser,
              action: "PUBLISH",
              policy_key: page.page_key,
              page_title: page.title,
              previous_version: `${page.version - 1}.0`,
              new_version: `${page.version}.0`,
              timestamp: new Date().toISOString(),
              details: `Published version ${page.version}.0 live.`
            });

            app.saveDB();
            app.showToast(`Published "${page.title}" v${page.version}.0 live!`, "success");
            this.renderAdminSection(app);
          }
        }
      });
    });

    // Unpublish from table
    container.querySelectorAll(".admin-unpublish-policy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute("data-key");
        const adminUser = this.getAdminUsername(app);
        if (key) {
          const page = app.db.legalPages.find((p: any) => p.page_key === key);
          if (page) {
            page.status = "UNPUBLISHED";
            page.last_updated = new Date().toISOString();
            
            app.db.legalAuditLogs.unshift({
              id: `audit_${Date.now()}`,
              admin_id: adminUser,
              action: "UNPUBLISH",
              policy_key: page.page_key,
              page_title: page.title,
              previous_version: `${page.version}.0`,
              new_version: `${page.version}.0 (Hidden)`,
              timestamp: new Date().toISOString(),
              details: `Unpublished policy from live view.`
            });

            app.saveDB();
            app.showToast(`Unpublished "${page.title}". It is now hidden from public view.`, "info");
            this.renderAdminSection(app);
          }
        }
      });
    });

    // History from table
    container.querySelectorAll(".admin-history-policy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute("data-key");
        if (key) {
          this.openVersionHistoryModal(app, key);
        }
      });
    });
  }

  /**
   * Save or Publish Current Editor Content
   */
  static saveCurrentEditor(app: any, doPublish: boolean = false) {
    if (!this.activeEditingPageKey) return;
    const page = app.db.legalPages.find((p: any) => p.page_key === this.activeEditingPageKey);
    if (!page) return;

    const titleEl = document.getElementById("editor-page-title") as HTMLInputElement;
    const slugEl = document.getElementById("editor-page-slug") as HTMLInputElement;
    const statusEl = document.getElementById("editor-page-status") as HTMLSelectElement;
    const metaTitleEl = document.getElementById("editor-meta-title") as HTMLInputElement;
    const effectiveDateEl = document.getElementById("editor-effective-date") as HTMLInputElement;
    const shortDescEl = document.getElementById("editor-short-desc") as HTMLTextAreaElement;
    const visualPane = document.getElementById("editor-visual-pane") as HTMLElement;
    const sourcePane = document.getElementById("editor-source-pane") as HTMLTextAreaElement;

    const rawContent = this.isHtmlSourceMode ? sourcePane?.value : visualPane?.innerHTML;
    const cleanContent = sanitizeHTML(rawContent || "");
    const adminUser = this.getAdminUsername(app);

    page.title = titleEl?.value.trim() || page.title;
    page.slug = slugEl?.value.trim() || page.slug;
    page.meta_title = metaTitleEl?.value.trim() || page.meta_title;
    page.effective_date = effectiveDateEl?.value || page.effective_date;
    page.short_description = shortDescEl?.value.trim() || page.short_description;
    page.meta_description = shortDescEl?.value.trim() || page.meta_description;
    page.updated_at = new Date().toISOString();
    page.last_updated = new Date().toISOString();
    page.updated_by = adminUser;

    if (doPublish) {
      const prevVer = page.version || 1;
      page.version = prevVer + 1;
      page.status = "PUBLISHED";
      page.content = cleanContent;
      page.draft_content = cleanContent;
      page.published_at = new Date().toISOString();

      // Record snapshot in version history
      if (!app.db.legalPageVersions) app.db.legalPageVersions = [];
      app.db.legalPageVersions.unshift({
        id: `ver_${page.page_key}_v${page.version}_${Date.now()}`,
        legal_page_id: page.id,
        page_key: page.page_key,
        version: page.version,
        title: page.title,
        content: cleanContent,
        short_description: page.short_description,
        status: "PUBLISHED",
        created_by: adminUser,
        created_at: new Date().toISOString()
      });

      // Audit Log
      app.db.legalAuditLogs.unshift({
        id: `audit_${Date.now()}`,
        admin_id: adminUser,
        action: "PUBLISH",
        policy_key: page.page_key,
        page_title: page.title,
        previous_version: `${prevVer}.0`,
        new_version: `${page.version}.0`,
        timestamp: new Date().toISOString(),
        details: `Published new live revision v${page.version}.0.`
      });

      app.saveDB();
      app.showToast(`🎉 "${page.title}" published live as Version ${page.version}.0!`, "success");
    } else {
      // Just saving draft
      page.status = statusEl ? (statusEl.value as any) : "DRAFT";
      page.draft_content = cleanContent;

      app.db.legalAuditLogs.unshift({
        id: `audit_${Date.now()}`,
        admin_id: adminUser,
        action: "EDIT_DRAFT",
        policy_key: page.page_key,
        page_title: page.title,
        previous_version: `${page.version}.0`,
        new_version: `${page.version}.0 (Draft)`,
        timestamp: new Date().toISOString(),
        details: `Updated working draft content.`
      });

      app.saveDB();
      app.showToast(`Working draft saved for "${page.title}". Existing live version remains untouched.`, "info");
    }

    this.renderAdminSection(app);
  }

  /**
   * Open Version History modal and enable rollback / restore
   */
  static openVersionHistoryModal(app: any, pageKey: string) {
    const modal = document.getElementById("admin-legal-history-modal");
    const modalTitle = document.getElementById("history-modal-title");
    const modalList = document.getElementById("history-modal-list");
    const closeBtn = document.getElementById("close-history-modal-btn");
    if (!modal || !modalList) return;

    const page = (app.db.legalPages || []).find((p: any) => p.page_key === pageKey);
    const versions: LegalPageVersion[] = (app.db.legalPageVersions || []).filter((v: any) => v.page_key === pageKey);

    if (modalTitle) modalTitle.innerText = `Version Snapshots: ${page?.title || pageKey}`;

    if (versions.length === 0) {
      modalList.innerHTML = `<p class="p-6 text-center text-slate-500">No previous version snapshots found for this policy.</p>`;
    } else {
      modalList.innerHTML = versions.map(ver => `
        <div class="bg-slate-950 p-4 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-white">Version ${ver.version}.0</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">${ver.status}</span>
            </div>
            <div class="text-[10px] text-slate-500 font-sans mt-0.5">Saved by @${ver.created_by} • ${new Date(ver.created_at).toLocaleString()}</div>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" class="restore-version-btn px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-bold transition cursor-pointer" data-id="${ver.id}">
              <i class="fa-solid fa-rotate-left mr-1"></i> Restore This Version
            </button>
          </div>
        </div>
      `).join("");

      // Bind restore buttons
      modalList.querySelectorAll(".restore-version-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const verId = (e.currentTarget as HTMLElement).getAttribute("data-id");
          const targetVer = versions.find(v => v.id === verId);
          const adminUser = this.getAdminUsername(app);
          if (targetVer && page) {
            page.draft_content = targetVer.content;
            page.content = targetVer.content;
            page.title = targetVer.title;
            page.short_description = targetVer.short_description || page.short_description;
            page.version = (page.version || 1) + 1;
            page.last_updated = new Date().toISOString();

            app.db.legalAuditLogs.unshift({
              id: `audit_${Date.now()}`,
              admin_id: adminUser,
              action: "RESTORE_VERSION",
              policy_key: page.page_key,
              page_title: page.title,
              previous_version: `${page.version - 1}.0`,
              new_version: `${page.version}.0`,
              timestamp: new Date().toISOString(),
              details: `Restored content from historical snapshot Version ${targetVer.version}.0.`
            });

            app.saveDB();
            app.showToast(`Restored Version ${targetVer.version}.0 as new revision v${page.version}.0!`, "success");
            modal.classList.add("hidden");
            this.renderAdminSection(app);
          }
        });
      });
    }

    modal.classList.remove("hidden");
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.add("hidden");
    }
  }
}

// Make accessible to window
if (typeof window !== "undefined") {
  (window as any).LegalPoliciesManager = LegalPoliciesManager;
}
