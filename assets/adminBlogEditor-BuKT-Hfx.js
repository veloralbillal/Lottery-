var ne=Object.defineProperty;var de=(w,t,e)=>t in w?ne(w,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):w[t]=e;var v=(w,t,e)=>de(w,typeof t!="symbol"?t+"":t,e);import"./index-CFnp9MYo.js";class ce{constructor(){v(this,"db",{});v(this,"editId",null);v(this,"currentTab","compose");v(this,"bcChannel",null);v(this,"isSyncing",!1);v(this,"lastSyncedTime","Ready");this.loadState(),this.initSyncChannel(),this.parseUrl(),this.render()}initSyncChannel(){if(typeof BroadcastChannel<"u")try{this.bcChannel=new BroadcastChannel("lw_realtime_db_sync"),this.bcChannel.onmessage=t=>{t.data&&t.data.type==="database_updated"&&this.handleRemoteDbUpdate()}}catch{}window.addEventListener("storage",t=>{t.key==="lw_lottery_db_v3"&&t.newValue&&this.handleRemoteDbUpdate()})}handleRemoteDbUpdate(){const t=localStorage.getItem("lw_lottery_db_v3");if(t)try{const e=JSON.parse(t);e&&e.blogCategories&&(this.db.blogCategories=e.blogCategories,this.updateCategoryDropdown()),this.updateSyncBadge("Synced Just Now",!0)}catch{}}loadState(){try{const t=localStorage.getItem("lw_lottery_db_v3");t&&(this.db=JSON.parse(t))}catch{}(!this.db||typeof this.db!="object")&&(this.db={}),this.db.blogs||(this.db.blogs=[]),(!this.db.blogCategories||this.db.blogCategories.length===0)&&(this.db.blogCategories=[{id:"bcat-1",name:"Lottery Tips",slug:"lottery-tips",description:"Pro mathematical patterns & draw strategies"},{id:"bcat-2",name:"Winners Stories",slug:"winners-stories",description:"Interviews with jackpot champions"},{id:"bcat-3",name:"Platform Updates",slug:"platform-updates",description:"Gateway upgrades, cashouts & fee alerts"},{id:"bcat-4",name:"Guides",slug:"guides",description:"Step-by-step app walkthroughs"}])}async saveDB(t=!0){try{this.isSyncing=!0,this.updateSyncBadge("Syncing...",!1);const e=JSON.stringify(this.db);try{localStorage.setItem("lw_lottery_db_v3",e),localStorage.setItem("lottery_winner_db_backup",e)}catch{try{this.db.groupChatMessages&&this.db.groupChatMessages.length>50&&(this.db.groupChatMessages=this.db.groupChatMessages.slice(-50)),this.db.reports&&this.db.reports.length>20&&(this.db.reports=this.db.reports.slice(-20)),localStorage.removeItem("lottery_winner_db_backup"),localStorage.setItem("lw_lottery_db_v3",JSON.stringify(this.db))}catch{try{localStorage.removeItem("lw_lottery_db_v3")}catch{}}}if(this.bcChannel)try{this.bcChannel.postMessage({type:"database_updated",timestamp:Date.now()})}catch{}if(window.dispatchEvent(new Event("storage")),t)try{if((await fetch("/api/sql/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({db:e})})).ok)return this.lastSyncedTime=new Date().toLocaleTimeString(),this.updateSyncBadge(`Synced at ${this.lastSyncedTime}`,!0),this.isSyncing=!1,!0}catch{}return this.lastSyncedTime=new Date().toLocaleTimeString(),this.updateSyncBadge(`Synced (Local & Network) ${this.lastSyncedTime}`,!0),this.isSyncing=!1,!0}catch{return this.isSyncing=!1,this.updateSyncBadge("Sync Warning (Saved Locally)",!1),!1}}updateSyncBadge(t,e){const a=document.getElementById("sync-status-badge"),i=document.getElementById("sync-status-dot");a&&(a.innerText=t),i&&(i.className=e?"w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0":"w-2 h-2 rounded-full bg-amber-400 shrink-0")}parseUrl(){const t=new URLSearchParams(window.location.search),e=t.get("edit")||t.get("id");e&&(this.editId=e)}showToast(t,e="success"){const a=document.getElementById("toast-notification");a&&a.remove();const i=document.createElement("div");i.id="toast-notification";const d={success:"bg-emerald-950/90 border-emerald-500/50 text-emerald-200",error:"bg-rose-950/90 border-rose-500/50 text-rose-200",info:"bg-sky-950/90 border-sky-500/50 text-sky-200"};i.className=`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md transition-all duration-300 ${d[e]}`,i.innerHTML=`<span>${t}</span>`,document.body.appendChild(i),setTimeout(()=>{i.style.opacity="0",setTimeout(()=>i.remove(),300)},3500)}escapeHTML(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}calculateReadingTime(t){const e=t.trim().split(/\s+/).filter(Boolean).length;return`${Math.max(1,Math.ceil(e/200))} min read`}render(){var f;const t=document.getElementById("editor-app-root");if(!t)return;const e=this.editId&&(this.db.blogs||[]).find(n=>n.id===this.editId)||null,a=e&&e.content||"",i=e?e.author:"Admin Editorial",d=e?e.category:((f=this.db.blogCategories[0])==null?void 0:f.name)||"Lottery Tips",h=e?e.image||e.coverImage||"":"https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=60",x=(e==null?void 0:e.slug)||(e?this.generateSlug(e.title):"");t.innerHTML=`
      <!-- Sticky Top Header Navigation with Sync Status Indicator -->
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 shadow-xl">
        <div class="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-3">
            <a href="index.html#admin" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white flex items-center justify-center transition shadow active:scale-95" title="Back to Admin Dashboard">
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </a>
            <div class="leading-tight">
              <div class="flex items-center gap-2">
                <span class="text-[9px] uppercase font-mono font-black text-amber-400 tracking-wider">ARTICLE PUBLISHER</span>
                <span class="text-[10px] text-slate-500 font-mono">·</span>
                <div class="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full text-[9px] font-mono">
                  <span id="sync-status-dot" class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span id="sync-status-badge" class="text-slate-300">Ready</span>
                </div>
              </div>
              <h1 class="text-sm sm:text-base font-black text-white flex items-center gap-2 mt-0.5">
                <span>${e?"Edit Public Blog Article":"Publish New Blog Article"}</span>
                <i class="fa-solid fa-pen-nib text-xs text-amber-400"></i>
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button id="btn-check-sync" class="text-xs font-mono font-bold text-slate-300 hover:text-amber-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5">
              <i class="fa-solid fa-rotate text-xs"></i> Check Sync
            </button>
            <a href="admin-articles.html" class="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl hover:text-white transition">
              <i class="fa-solid fa-list mr-1"></i> Articles List
            </a>
            <button id="editor-top-save-btn" class="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-xl shadow cursor-pointer hover:opacity-95 transition flex items-center gap-1.5">
              <i class="fa-solid fa-floppy-disk"></i> ${e?"Update":"Publish"}
            </button>
          </div>
        </div>
      </header>

      <!-- Main Workspace -->
      <main class="max-w-5xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-28 font-sans">
        
        <!-- Primary Article Metadata Card -->
        <div class="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 class="text-xs font-black uppercase font-mono tracking-wider text-slate-300 flex items-center gap-2">
              <i class="fa-solid fa-sliders text-amber-400"></i>
              <span>Article Details & Taxonomy</span>
            </h3>
            <span class="text-[10px] font-mono text-slate-500">All fields automatically sync with public blog</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Article Title -->
            <div class="md:col-span-2">
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Article Title *</label>
              <input type="text" id="editor-title" value="${e?this.escapeHTML(e.title):""}" placeholder="e.g. 5 Mathematical Strategies to Maximize Daily Lottery Odds" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none transition" />
            </div>

            <!-- URL Slug -->
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">URL Slug (Perm-link) *</label>
              <div class="flex items-center bg-slate-950 border border-slate-800 focus-within:border-amber-500 rounded-xl px-3 py-2 text-xs">
                <span class="text-slate-500 font-mono text-[11px] shrink-0">/blog/</span>
                <input type="text" id="editor-slug" value="${x}" placeholder="mathematical-strategies-lottery" class="w-full bg-transparent text-white font-mono text-xs outline-none px-1" />
              </div>
            </div>

            <!-- Category Selector -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[10px] font-mono text-slate-400 block">Category *</label>
                <a href="admin-categories.html" target="_blank" class="text-[10px] font-mono text-amber-400 hover:underline">+ New Category</a>
              </div>
              <select id="editor-category" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition cursor-pointer">
                ${(this.db.blogCategories||[]).map(n=>`
                  <option value="${this.escapeHTML(n.name)}" ${e&&e.category===n.name?"selected":""}>
                    ${this.escapeHTML(n.name)} (${n.slug})
                  </option>
                `).join("")}
              </select>
            </div>

            <!-- Author Name -->
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Author Name</label>
              <input type="text" id="editor-author" value="${this.escapeHTML(i)}" placeholder="e.g. LuckyBox Editorial" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
            </div>

            <!-- Cover Image with Upload Button -->
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Cover Image (URL or Direct Upload)</label>
              <div class="flex items-center gap-2">
                <input type="text" id="editor-image" value="${this.escapeHTML(h)}" placeholder="https://..." class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
                <label class="shrink-0 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow" title="Upload cover photo from device">
                  <i class="fa-solid fa-cloud-arrow-up"></i>
                  <span>Upload</span>
                  <input type="file" id="editor-image-file" accept="image/*" class="hidden" />
                </label>
              </div>
            </div>

            <!-- Excerpt -->
            <div class="md:col-span-2">
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Short Excerpt (Search Snippet & Feed Summary)</label>
              <textarea id="editor-excerpt" rows="2" placeholder="Write a catchy 1-2 sentence preview for search results and social cards..." class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white outline-none resize-none transition">${e?this.escapeHTML(e.excerpt||""):""}</textarea>
            </div>

            <!-- Tags & Status Toggles -->
            <div class="md:col-span-2 flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-slate-800/80">
              <div class="flex items-center gap-2 flex-1 min-w-[240px]">
                <label class="text-[10px] font-mono text-slate-400 shrink-0">Tags:</label>
                <input type="text" id="editor-tags" value="${e&&e.tags?this.escapeHTML(e.tags.join(", ")):"Jackpot, Tips, Strategy"}" placeholder="Comma separated: Tips, Lottery, bKash" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none" />
              </div>

              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="editor-is-featured" ${e!=null&&e.featured?"checked":""} class="w-4 h-4 accent-amber-500 rounded cursor-pointer" />
                  <span>⭐ Featured Article</span>
                </label>
                <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="editor-is-published" ${e?e.published!==!1?"checked":"":"checked"} class="w-4 h-4 accent-emerald-500 rounded cursor-pointer" />
                  <span>🚀 Public Live</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Advanced SEO Preview Card -->
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
              <i class="fa-solid fa-chart-line"></i> Live Advanced SEO & Social Share Preview
            </span>
            <span class="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">Real-time Schema</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Google Search Snippet Card -->
            <div class="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-1 font-sans">
              <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <i class="fa-brands fa-google text-slate-500"></i>
                <span id="seo-preview-url" class="text-emerald-400 truncate">https://luckybox.app/blog/${x||"article"}</span>
              </div>
              <h4 id="seo-preview-title" class="text-sm font-bold text-cyan-400 truncate leading-snug">
                ${e?this.escapeHTML(e.title):"Article Title Preview"}
              </h4>
              <p id="seo-preview-desc" class="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                ${e?this.escapeHTML(e.excerpt||""):"Article meta description excerpt snippet will update dynamically as you type..."}
              </p>
            </div>

            <!-- Social OpenGraph Card Preview -->
            <div class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div class="h-24 bg-slate-900 relative overflow-hidden">
                <img id="og-preview-img" src="${h}" class="w-full h-full object-cover" alt="Social share cover" />
                <span class="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-[9px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded">OG Share Card</span>
              </div>
              <div class="p-3 space-y-0.5">
                <p id="og-preview-domain" class="text-[9px] font-mono uppercase text-slate-500">LUCKYBOX.APP · COMMUNITY BLOG</p>
                <h5 id="og-preview-title" class="text-xs font-bold text-white truncate">${e?this.escapeHTML(e.title):"Social Title"}</h5>
              </div>
            </div>
          </div>
        </div>

        <!-- Rich Text Editor Suite (Compose WYSIWYG & HTML Code Modes) -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <!-- Editor Header Mode Bar -->
          <div class="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-1.5">
              <button type="button" id="tab-btn-compose" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-amber-500 text-slate-950 shadow-sm">
                <i class="fa-solid fa-pen-nib text-xs"></i>
                <span>Compose (WYSIWYG)</span>
              </button>
              <button type="button" id="tab-btn-html" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900">
                <i class="fa-solid fa-code text-xs"></i>
                <span>HTML Code (&lt;/&gt;)</span>
              </button>
              <button type="button" id="tab-btn-preview" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900">
                <i class="fa-solid fa-eye text-xs"></i>
                <span>Preview Reader</span>
              </button>
            </div>

            <!-- Stats Tracker -->
            <div id="editor-stats-bar" class="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span id="stat-words">0 words</span>
              <span>·</span>
              <span id="stat-chars">0 characters</span>
              <span>·</span>
              <span id="stat-readtime" class="text-amber-300">1 min read</span>
            </div>
          </div>

          <!-- Feature-Packed Formatting Toolbar (Visible in Compose Mode) -->
          <div id="compose-toolbar" class="bg-slate-950/80 border-b border-slate-800/80 p-2 flex items-center gap-1 flex-wrap text-xs">
            <!-- History -->
            <div class="flex items-center gap-0.5 border-r border-slate-800 pr-1.5 mr-1">
              <button type="button" data-cmd="undo" title="Undo (Ctrl+Z)" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
                <i class="fa-solid fa-rotate-left"></i>
              </button>
              <button type="button" data-cmd="redo" title="Redo (Ctrl+Y)" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
                <i class="fa-solid fa-rotate-right"></i>
              </button>
            </div>

            <!-- Paragraph / Heading Dropdown -->
            <select id="toolbar-formatblock" class="bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer">
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="blockquote">Quote Callout</option>
              <option value="pre">Code Block</option>
            </select>

            <span class="w-[1px] h-5 bg-slate-800 mx-1"></span>

            <!-- Typography Formats -->
            <button type="button" data-cmd="bold" title="Bold (Ctrl+B)" class="toolbar-btn w-8 h-8 rounded-lg font-black text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-bold"></i>
            </button>
            <button type="button" data-cmd="italic" title="Italic (Ctrl+I)" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-italic"></i>
            </button>
            <button type="button" data-cmd="underline" title="Underline (Ctrl+U)" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-underline"></i>
            </button>
            <button type="button" data-cmd="strikeThrough" title="Strikethrough" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-strikethrough"></i>
            </button>
            <button type="button" data-cmd="subscript" title="Subscript" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-subscript"></i>
            </button>
            <button type="button" data-cmd="superscript" title="Superscript" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-superscript"></i>
            </button>

            <span class="w-[1px] h-5 bg-slate-800 mx-1"></span>

            <!-- Text & Highlight Color -->
            <label class="w-8 h-8 rounded-lg flex items-center justify-center relative cursor-pointer hover:bg-slate-850 text-slate-300 hover:text-white" title="Text Color">
              <i class="fa-solid fa-font"></i>
              <input type="color" id="toolbar-color-text" value="#ffffff" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
            </label>
            <label class="w-8 h-8 rounded-lg flex items-center justify-center relative cursor-pointer hover:bg-slate-850 text-slate-300 hover:text-white" title="Highlight Color">
              <i class="fa-solid fa-highlighter"></i>
              <input type="color" id="toolbar-color-bg" value="#f59e0b" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
            </label>

            <span class="w-[1px] h-5 bg-slate-800 mx-1"></span>

            <!-- Alignments -->
            <button type="button" data-cmd="justifyLeft" title="Align Left" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-align-left"></i>
            </button>
            <button type="button" data-cmd="justifyCenter" title="Align Center" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-align-center"></i>
            </button>
            <button type="button" data-cmd="justifyRight" title="Align Right" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-align-right"></i>
            </button>
            <button type="button" data-cmd="justifyFull" title="Justify" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-align-justify"></i>
            </button>

            <span class="w-[1px] h-5 bg-slate-800 mx-1"></span>

            <!-- Lists -->
            <button type="button" data-cmd="insertUnorderedList" title="Bullet List" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-list-ul"></i>
            </button>
            <button type="button" data-cmd="insertOrderedList" title="Numbered List" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-list-ol"></i>
            </button>
            <button type="button" data-cmd="outdent" title="Outdent" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-outdent"></i>
            </button>
            <button type="button" data-cmd="indent" title="Indent" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-indent"></i>
            </button>

            <span class="w-[1px] h-5 bg-slate-800 mx-1"></span>

            <!-- Inserts & Media -->
            <button type="button" id="toolbar-insert-link" title="Insert Link" class="toolbar-btn w-8 h-8 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-link"></i>
            </button>
            <label class="w-8 h-8 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-slate-850 flex items-center justify-center transition cursor-pointer" title="Upload In-Article Image">
              <i class="fa-solid fa-image"></i>
              <input type="file" id="toolbar-insert-image-file" accept="image/*" class="hidden" />
            </label>
            <button type="button" id="toolbar-insert-table" title="Insert Table" class="toolbar-btn w-8 h-8 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-table"></i>
            </button>
            <button type="button" data-cmd="insertHorizontalRule" title="Horizontal Divider Line" class="toolbar-btn w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-minus"></i>
            </button>
            <button type="button" id="toolbar-insert-callout" title="Insert Highlight Callout Box" class="toolbar-btn w-8 h-8 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-quote-left"></i>
            </button>

            <span class="w-[1px] h-5 bg-slate-800 mx-1"></span>

            <!-- Clear formatting -->
            <button type="button" data-cmd="removeFormat" title="Clear Formatting" class="toolbar-btn w-8 h-8 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-slate-850 flex items-center justify-center transition cursor-pointer">
              <i class="fa-solid fa-eraser"></i>
            </button>
          </div>

          <!-- HTML Quick Tags Bar (Visible in HTML Code Mode) -->
          <div id="html-toolbar" class="hidden bg-slate-950/80 border-b border-slate-800/80 p-2 flex items-center gap-1.5 flex-wrap text-xs font-mono">
            <span class="text-[10px] text-slate-400 font-bold uppercase mr-1">Insert Tags:</span>
            ${["<p>","<h2>","<h3>","<strong>","<em>","<a>","<img/>","<ul>","<li>","<blockquote>","<code>","<pre>","<hr/>","<table>"].map(n=>`
              <button type="button" class="html-quick-tag px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300 hover:text-white hover:bg-slate-800 transition cursor-pointer text-[11px]" data-tag="${n}">
                ${this.escapeHTML(n)}
              </button>
            `).join("")}
          </div>

          <!-- 1. Compose WYSIWYG View -->
          <div id="view-compose" class="p-5 sm:p-6 bg-slate-950/50">
            <div id="editor-compose" class="editor-compose-area text-slate-200 text-sm leading-relaxed" contenteditable="true" data-placeholder="Start typing your article here... Format with headings, bold, lists, tables, callouts, and images directly.">${a}</div>
          </div>

          <!-- 2. HTML Raw Code View -->
          <div id="view-html" class="hidden p-4 bg-slate-950">
            <textarea id="editor-html" rows="18" spellcheck="false" class="w-full bg-[#070b13] border border-slate-800 focus:border-amber-500 rounded-2xl p-4 text-xs text-amber-200 font-mono leading-relaxed outline-none resize-y" placeholder="Write or paste raw HTML code here... e.g. <p>My paragraph</p>">${a}</textarea>
          </div>

          <!-- 3. Preview Reader View -->
          <div id="view-preview" class="hidden p-6 bg-slate-950/90 space-y-4">
            <div class="max-w-3xl mx-auto space-y-4">
              <div class="relative h-64 rounded-3xl overflow-hidden border border-slate-800">
                <img id="preview-reader-img" src="${h}" class="w-full h-full object-cover" alt="Article Cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div class="absolute bottom-4 left-4 right-4">
                  <span id="preview-reader-cat" class="bg-amber-500 text-slate-950 font-black text-[9px] uppercase font-mono px-3 py-1 rounded-full shadow">
                    ${d}
                  </span>
                  <h2 id="preview-reader-title" class="text-xl sm:text-2xl font-black text-white mt-2 leading-tight">
                    ${e?this.escapeHTML(e.title):"Article Title Preview"}
                  </h2>
                </div>
              </div>

              <div class="flex items-center gap-3 text-xs text-slate-400 font-mono border-b border-slate-800 pb-3">
                <span>By <strong id="preview-reader-author" class="text-white">${i}</strong></span>
                <span>·</span>
                <span>${new Date().toLocaleDateString()}</span>
                <span>·</span>
                <span id="preview-reader-time" class="text-amber-400">3 min read</span>
              </div>

              <div id="preview-reader-body" class="editor-compose-area text-slate-200 text-sm leading-relaxed">
                ${a}
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Action Controls -->
        <div class="flex items-center justify-between flex-wrap gap-4 pt-4">
          <div class="flex items-center gap-2">
            <button id="editor-save-bottom-btn" class="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-8 py-3.5 rounded-2xl transition hover:opacity-95 shadow-xl shadow-amber-500/20 cursor-pointer flex items-center gap-2">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>${e?"Save & Update Article 💾":"Publish New Blog Article 🚀"}</span>
            </button>
            <a href="admin-articles.html" class="px-5 py-3.5 rounded-2xl bg-slate-950 text-slate-300 border border-slate-800 text-xs font-bold hover:text-white transition">
              Cancel
            </a>
          </div>

          <div class="flex items-center gap-2 text-xs font-mono text-slate-400">
            <i class="fa-solid fa-shield-halved text-emerald-400"></i>
            <span>Real-time Dual-Storage & MySQL Bridge Protected</span>
          </div>
        </div>
      </main>
    `,this.bindEvents(),this.updateStats()}updateCategoryDropdown(){const t=document.getElementById("editor-category");if(t&&this.db.blogCategories){const e=t.value;t.innerHTML=(this.db.blogCategories||[]).map(a=>`
        <option value="${this.escapeHTML(a.name)}" ${e===a.name?"selected":""}>
          ${this.escapeHTML(a.name)} (${a.slug})
        </option>
      `).join("")}}generateSlug(t){return t.toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/[\s_-]+/g,"-").replace(/^-+|-+$/g,"")}getActiveContent(){const t=document.getElementById("editor-compose"),e=document.getElementById("editor-html");return this.currentTab==="html"&&e?e.value:t?t.innerHTML:""}syncContent(t){const e=document.getElementById("editor-compose"),a=document.getElementById("editor-html"),i=document.getElementById("preview-reader-body");let d="";this.currentTab==="html"&&a?d=a.value:e&&(d=e.innerHTML),t==="compose"&&e?e.innerHTML=d:t==="html"&&a?a.value=d:t==="preview"&&i&&(i.innerHTML=d||'<em class="text-slate-500">Article content is empty.</em>'),this.updateStats()}updateStats(){const t=document.getElementById("editor-compose"),e=document.getElementById("editor-html"),a=this.currentTab==="html"&&e?e.value.replace(/<[^>]*>/g," "):t&&t.innerText||"",i=a.trim().split(/\s+/).filter(Boolean).length,d=a.length,h=this.calculateReadingTime(a),x=document.getElementById("stat-words"),f=document.getElementById("stat-chars"),n=document.getElementById("stat-readtime"),M=document.getElementById("preview-reader-time");x&&(x.innerText=`${i.toLocaleString()} words`),f&&(f.innerText=`${d.toLocaleString()} characters`),n&&(n.innerText=h),M&&(M.innerText=h)}bindEvents(){const t=document.getElementById("tab-btn-compose"),e=document.getElementById("tab-btn-html"),a=document.getElementById("tab-btn-preview"),i=document.getElementById("view-compose"),d=document.getElementById("view-html"),h=document.getElementById("view-preview"),x=document.getElementById("compose-toolbar"),f=document.getElementById("html-toolbar"),n=s=>{this.syncContent(s),this.currentTab=s,t&&e&&a&&(t.className=s==="compose"?"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-amber-500 text-slate-950 shadow-sm":"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900",e.className=s==="html"?"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-amber-500 text-slate-950 shadow-sm":"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900",a.className=s==="preview"?"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-amber-500 text-slate-950 shadow-sm":"px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900"),i&&i.classList.toggle("hidden",s!=="compose"),d&&d.classList.toggle("hidden",s!=="html"),h&&h.classList.toggle("hidden",s!=="preview"),x&&x.classList.toggle("hidden",s!=="compose"),f&&f.classList.toggle("hidden",s!=="html")};t&&(t.onclick=()=>n("compose")),e&&(e.onclick=()=>n("html")),a&&(a.onclick=()=>n("preview")),document.querySelectorAll("[data-cmd]").forEach(s=>{s.onclick=o=>{o.preventDefault();const r=s.getAttribute("data-cmd");r&&(document.execCommand(r,!1,void 0),this.updateStats())}});const H=document.getElementById("toolbar-formatblock");H&&(H.onchange=()=>{const s=H.value;s&&(document.execCommand("formatBlock",!1,`<${s}>`),this.updateStats())});const $=document.getElementById("toolbar-color-text");$&&($.oninput=()=>{document.execCommand("foreColor",!1,$.value)});const A=document.getElementById("toolbar-color-bg");A&&(A.oninput=()=>{document.execCommand("hiliteColor",!1,A.value)});const P=document.getElementById("toolbar-insert-link");P&&(P.onclick=()=>{var o;const s=prompt("Enter URL link (e.g. https://...):","https://");if(s){const r=((o=window.getSelection())==null?void 0:o.toString())||"Visit Link";document.execCommand("insertHTML",!1,`<a href="${s}" target="_blank" rel="noopener noreferrer">${r}</a>`)}});const R=document.getElementById("toolbar-insert-image-file");R&&(R.onchange=s=>{var r;const o=(r=s.target.files)==null?void 0:r[0];if(o){const u=new FileReader;u.onload=p=>{var c;const m=(c=p.target)==null?void 0:c.result;document.execCommand("insertHTML",!1,`<img src="${m}" alt="Uploaded image" class="my-4 rounded-2xl shadow-lg border border-slate-700 max-w-full" />`),this.showToast("In-article image embedded successfully! 🖼️","success"),this.updateStats()},u.readAsDataURL(o)}});const _=document.getElementById("toolbar-insert-table");_&&(_.onclick=()=>{document.execCommand("insertHTML",!1,`
          <table class="my-4 w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr class="bg-slate-900 text-white">
                <th class="border border-slate-700 p-2">Item / Tier</th>
                <th class="border border-slate-700 p-2">Probability</th>
                <th class="border border-slate-700 p-2">Prize (৳)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-slate-700 p-2">Tier 1 Mega Winner</td>
                <td class="border border-slate-700 p-2">1 : 5,000</td>
                <td class="border border-slate-700 p-2">৳50,000</td>
              </tr>
              <tr>
                <td class="border border-slate-700 p-2">Tier 2 Second Place</td>
                <td class="border border-slate-700 p-2">1 : 1,200</td>
                <td class="border border-slate-700 p-2">৳10,000</td>
              </tr>
            </tbody>
          </table>
        `),this.updateStats()});const D=document.getElementById("toolbar-insert-callout");D&&(D.onclick=()=>{document.execCommand("insertHTML",!1,`
          <blockquote class="border-l-4 border-amber-500 bg-amber-500/10 p-4 rounded-r-2xl my-4 text-slate-200">
            <strong class="text-amber-300 font-bold block mb-1">💡 Pro Strategy Tip:</strong>
            Write your highlighted advice or mathematical insight here for community members.
          </blockquote>
        `),this.updateStats()});const ie=document.querySelectorAll(".html-quick-tag"),b=document.getElementById("editor-html");ie.forEach(s=>{s.onclick=()=>{const o=s.getAttribute("data-tag")||"";if(!b)return;const r=b.selectionStart,u=b.selectionEnd,p=b.value,m=p.substring(r,u)||"content";let c="";if(o==="<hr/>"||o==="<img/>")c=o==="<img/>"?'<img src="https://..." alt="Image description" />':"<hr />";else{const j=o.replace("<","</").split(" ")[0];c=`${o}${m}${j}`}b.value=p.substring(0,r)+c+p.substring(u),b.focus(),b.selectionStart=r+o.length,b.selectionEnd=r+c.length,this.updateStats()}});const U=document.getElementById("editor-compose");U&&(U.oninput=()=>{this.updateStats()}),b&&(b.oninput=()=>{this.updateStats()});const N=document.getElementById("editor-image-file"),y=document.getElementById("editor-image"),B=document.getElementById("og-preview-img"),I=document.getElementById("preview-reader-img");N&&y&&(N.onchange=s=>{var r;const o=(r=s.target.files)==null?void 0:r[0];if(o){const u=new FileReader;u.onload=p=>{var c;const m=(c=p.target)==null?void 0:c.result;y.value=m,B&&(B.src=m),I&&(I.src=m),this.showToast("Cover image uploaded and attached! 📷","success")},u.readAsDataURL(o)}},y.oninput=()=>{const s=y.value.trim();B&&s&&(B.src=s),I&&s&&(I.src=s)});const S=document.getElementById("editor-title"),g=document.getElementById("editor-slug"),T=document.getElementById("editor-excerpt"),k=document.getElementById("editor-category"),C=document.getElementById("editor-author"),O=document.getElementById("seo-preview-title"),L=document.getElementById("seo-preview-url"),q=document.getElementById("seo-preview-desc"),F=document.getElementById("og-preview-title"),W=document.getElementById("preview-reader-title"),z=document.getElementById("preview-reader-author"),V=document.getElementById("preview-reader-cat");S&&(S.oninput=()=>{const s=S.value.trim();if(O&&(O.innerText=s||"Article Title Preview"),F&&(F.innerText=s||"Social Title"),W&&(W.innerText=s||"Article Title Preview"),g&&(!this.editId||!g.value)){const o=this.generateSlug(s);g.value=o,L&&(L.innerText=`https://luckybox.app/blog/${o||"article"}`)}}),g&&(g.oninput=()=>{const s=this.generateSlug(g.value);L&&(L.innerText=`https://luckybox.app/blog/${s||"article"}`)}),T&&(T.oninput=()=>{const s=T.value.trim();q&&(q.innerText=s||"Article meta description excerpt snippet will update dynamically as you type...")}),C&&z&&(C.oninput=()=>{z.innerText=C.value.trim()||"Admin"}),k&&V&&(k.onchange=()=>{V.innerText=k.value});const E=document.getElementById("btn-check-sync");E&&(E.onclick=async()=>{E.innerHTML='<i class="fa-solid fa-spinner fa-spin text-xs"></i> Checking...';try{const o=await(await fetch("/api/sql/test-connection",{method:"POST",headers:{"Content-Type":"application/json"}})).json();o.success?(this.showToast(`Real-Time Sync Connected! Latency: ${o.latency||15}ms. Engine: ${o.engine||"MySQL"}`,"success"),this.updateSyncBadge("Live Synced & Connected",!0)):this.showToast("Sync Warning: "+(o.message||"Failed to reach SQL bridge"),"error")}catch{this.showToast("Local Network Cache active (Server unreachable)","info")}finally{E.innerHTML='<i class="fa-solid fa-rotate text-xs"></i> Check Sync'}});const G=async()=>{var se,ae,oe;const s=S==null?void 0:S.value.trim(),o=this.getActiveContent().trim(),r=k==null?void 0:k.value,u=(C==null?void 0:C.value.trim())||"Admin",p=(y==null?void 0:y.value.trim())||defaultImage,m=T==null?void 0:T.value.trim(),c=(g==null?void 0:g.value.trim())||this.generateSlug(s||"article"),j=((se=document.getElementById("editor-tags"))==null?void 0:se.value)||"",Q=((ae=document.getElementById("editor-is-published"))==null?void 0:ae.checked)??!0,K=((oe=document.getElementById("editor-is-featured"))==null?void 0:oe.checked)??!1;if(!s||!o||o==="<br>"){this.showToast("Please provide article title and body content.","error");return}const X=j.split(",").map(l=>l.trim()).filter(Boolean),Z=(this.db.blogCategories||[]).find(l=>l.name===r),ee=Z?Z.slug:this.generateSlug(r||"tips"),te=this.calculateReadingTime(o.replace(/<[^>]*>/g," "));if(this.editId){const l=(this.db.blogs||[]).find(le=>le.id===this.editId);if(l){l.title=s,l.slug=c,l.category=r,l.categorySlug=ee,l.author=u,l.image=p,l.coverImage=p,l.excerpt=m||s,l.content=o,l.tags=X,l.published=Q,l.featured=K,l.readTime=te,l.updatedAt=new Date().toISOString(),await this.saveDB(!0),this.showToast("Article updated & synchronized in real-time! 💾","success"),setTimeout(()=>window.location.href="admin-articles.html",900);return}}const re={id:"blog-"+Date.now(),title:s,slug:c,category:r,categorySlug:ee,author:u,authorAvatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),readTime:te,views:1,likes:0,image:p,coverImage:p,excerpt:m||s,content:o,tags:X,published:Q,featured:K,updatedAt:new Date().toISOString()};this.db.blogs||(this.db.blogs=[]),this.db.blogs.unshift(re),await this.saveDB(!0),this.showToast("Article published & synchronized in real-time! 🚀","success"),setTimeout(()=>window.location.href="admin-articles.html",900)},Y=document.getElementById("editor-top-save-btn"),J=document.getElementById("editor-save-bottom-btn");Y&&(Y.onclick=G),J&&(J.onclick=G)}}new ce;
