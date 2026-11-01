var c=Object.defineProperty;var p=(r,e,a)=>e in r?c(r,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):r[e]=a;var o=(r,e,a)=>p(r,typeof e!="symbol"?e+"":e,a);import"./index-G-tnGzcq.js";import{c as h,A as b}from"./lucide-8YyqV0kE.js";import{T as m,P as x}from"./trash-BxzECEf-.js";import{S as u,G as g}from"./square-pen-CkmpVe9v.js";import{N as f,X as y,S as w}from"./x-CnH9z7DI.js";class v{constructor(){o(this,"db",{});o(this,"bcChannel",null);o(this,"searchQuery","");this.loadState(),this.initSyncChannel(),this.render()}initSyncChannel(){if(typeof BroadcastChannel<"u")try{this.bcChannel=new BroadcastChannel("lw_realtime_db_sync"),this.bcChannel.onmessage=e=>{e.data&&e.data.type==="database_updated"&&(this.loadState(),this.render())}}catch{}window.addEventListener("storage",e=>{e.key==="lw_lottery_db_v3"&&(this.loadState(),this.render())})}loadState(){try{const e=localStorage.getItem("lw_lottery_db_v3");e&&(this.db=JSON.parse(e))}catch{}(!this.db||typeof this.db!="object")&&(this.db={}),this.db.blogs||(this.db.blogs=[])}async saveDB(){try{const e=JSON.stringify(this.db);try{localStorage.setItem("lw_lottery_db_v3",e),localStorage.setItem("lottery_winner_db_backup",e)}catch{try{this.db.groupChatMessages&&this.db.groupChatMessages.length>50&&(this.db.groupChatMessages=this.db.groupChatMessages.slice(-50)),localStorage.removeItem("lottery_winner_db_backup"),localStorage.setItem("lw_lottery_db_v3",JSON.stringify(this.db))}catch{try{localStorage.removeItem("lw_lottery_db_v3")}catch{}}}if(this.bcChannel)try{this.bcChannel.postMessage({type:"database_updated",timestamp:Date.now()})}catch{}window.dispatchEvent(new Event("storage")),fetch("/api/sql/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({db:e})}).catch(()=>{})}catch{}}showToast(e,a="success"){const s=document.getElementById("toast-notification");s&&s.remove();const t=document.createElement("div");t.id="toast-notification",t.className=`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md ${a==="success"?"bg-emerald-950/90 border-emerald-500/50 text-emerald-200":"bg-rose-950/90 border-rose-500/50 text-rose-200"}`,t.innerHTML=`<span>${e}</span>`,document.body.appendChild(t),setTimeout(()=>t.remove(),3500)}escapeHTML(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}render(){const e=document.getElementById("articles-app-root");if(!e)return;const a=this.searchQuery.toLowerCase().trim(),s=(this.db.blogs||[]).filter(t=>!a||t.title.toLowerCase().includes(a)||t.category&&t.category.toLowerCase().includes(a)||t.excerpt&&t.excerpt.toLowerCase().includes(a));e.innerHTML=`
      <!-- Mobile-First Sticky Header -->
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/85 sticky top-0 z-40 backdrop-blur-md px-3.5 py-3 shadow-xl">
        <div class="max-w-xl mx-auto flex items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5 min-w-0">
            <a href="index.html#admin" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white flex items-center justify-center transition shadow shrink-0 active:scale-95" title="Back to Admin">
              <i data-lucide="arrow-left" class="text-xs"></i>
            </a>
            <div class="leading-tight min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[8.5px] uppercase font-mono font-black text-amber-400 tracking-wider">ARTICLES MANAGER</span>
                <span class="text-[8.5px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.2 rounded-full flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
                </span>
              </div>
              <h1 class="text-xs sm:text-sm font-black text-white truncate">Published Posts (${(this.db.blogs||[]).length})</h1>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <a href="blog.html" target="_blank" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition shadow text-xs" title="View Public Blog">
              <i data-lucide="globe"></i>
            </a>
            <a href="admin-blog-editor.html" class="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-3 py-2 rounded-xl shadow hover:opacity-95 transition flex items-center gap-1 active:scale-95">
              <i data-lucide="plus" class="text-[10px]"></i> <span>Add</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Mobile-Optimized Main Workspace -->
      <main class="max-w-xl mx-auto p-3.5 sm:p-5 w-full space-y-4 pb-28 font-sans">
        
        <!-- Search Bar -->
        <div class="relative">
          <i data-lucide="search" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
          <input type="text" id="articles-search-input" value="${this.searchQuery}" placeholder="Search articles by title or category..." class="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white outline-none placeholder-slate-500 font-mono shadow-inner transition" />
          ${this.searchQuery?`
            <button id="articles-clear-search" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer">
              <i data-lucide="x"></i>
            </button>
          `:""}
        </div>

        <!-- Articles Feed -->
        <div class="space-y-3">
          ${s.length===0?`
            <div class="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl text-center space-y-3 shadow-xl">
              <i data-lucide="newspaper" class="text-3xl text-slate-600"></i>
              <p class="text-xs text-slate-400 font-mono">No blog articles found.</p>
              <a href="admin-blog-editor.html" class="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow">
                Publish New Article 🚀
              </a>
            </div>
          `:`
            <div class="space-y-3">
              ${s.map((t,i)=>{const l=(this.db.blogComments||[]).filter(d=>d.blogId===t.id).length,n=t.image||t.coverImage||"https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=60";return`
                  <div class="blog-fade-in bg-slate-900/95 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex flex-col gap-3 transition shadow-lg" style="animation-delay: ${Math.min(i*30,200)}ms;">
                    <div class="flex items-start gap-3">
                      <img src="${n}" alt="${this.escapeHTML(t.title)}" class="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800 shadow" referrerPolicy="no-referrer" />
                      <div class="space-y-1 min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[8.5px] font-mono px-2 py-0.2 rounded font-bold">${t.category}</span>
                          ${t.featured?'<span class="bg-amber-500 text-slate-950 text-[8.5px] font-black px-1.5 py-0.2 rounded font-mono">⭐ FEATURED</span>':""}
                        </div>
                        <h5 class="text-xs font-bold text-white leading-snug line-clamp-2">${this.escapeHTML(t.title)}</h5>
                        <div class="text-[9.5px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
                          <span>${t.date||"Recent"}</span>
                          <span>·</span>
                          <span>${t.readTime||"3 min"}</span>
                          <span>·</span>
                          <span>👁️ ${t.views||0}</span>
                          <span>·</span>
                          <span>💬 ${l}</span>
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                      <a href="admin-blog-editor.html?edit=${encodeURIComponent(t.id)}" class="bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer">
                        <i data-lucide="edit" class="text-[10px]"></i> Edit
                      </a>
                      <button class="article-delete-btn bg-rose-600/15 hover:bg-rose-600/25 text-rose-400 border border-rose-500/30 text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow active:scale-95" data-id="${t.id}">
                        <i data-lucide="trash" class="text-[10px]"></i> Delete
                      </button>
                    </div>
                  </div>
                `}).join("")}
            </div>
          `}
        </div>
      </main>
    `,this.bindEvents(),h({icons:{ArrowLeft:b,Globe:g,Plus:x,Search:w,X:y,Newspaper:f,Edit:u,Trash:m}})}bindEvents(){const e=document.getElementById("articles-search-input");e&&(e.oninput=t=>{this.searchQuery=t.target.value,this.render()});const a=document.getElementById("articles-clear-search");a&&(a.onclick=()=>{this.searchQuery="",this.render()}),document.querySelectorAll(".article-delete-btn").forEach(t=>{t.addEventListener("click",async i=>{const l=i.currentTarget.getAttribute("data-id");confirm("Are you sure you want to delete this article?")&&(this.db.blogs=(this.db.blogs||[]).filter(n=>n.id!==l),await this.saveDB(),this.showToast("Article deleted & synced in real-time.","success"),this.render())})})}}new v;
