var i=Object.defineProperty;var d=(r,e,s)=>e in r?i(r,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):r[e]=s;var l=(r,e,s)=>d(r,typeof e!="symbol"?e+"":e,s);import"./tailwind-built-B6Vj1Iel.js";class n{constructor(){l(this,"db",{});this.loadState(),this.render()}loadState(){try{const e=localStorage.getItem("lw_lottery_db_v3");e&&(this.db=JSON.parse(e))}catch{}(!this.db||typeof this.db!="object")&&(this.db={}),this.db.blogs||(this.db.blogs=[])}saveDB(){try{localStorage.setItem("lw_lottery_db_v3",JSON.stringify(this.db))}catch{}}showToast(e,s="success"){const t=document.getElementById("toast-notification");t&&t.remove();const a=document.createElement("div");a.id="toast-notification",a.className=`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md ${s==="success"?"bg-emerald-950/90 border-emerald-500/50 text-emerald-200":"bg-rose-950/90 border-rose-500/50 text-rose-200"}`,a.innerHTML=`<span>${e}</span>`,document.body.appendChild(a),setTimeout(()=>a.remove(),3500)}escapeHTML(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}render(){const e=document.getElementById("articles-app-root");if(!e)return;const s=this.db.blogs||[];e.innerHTML=`
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 shadow-xl">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <a href="index.html#admin" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white flex items-center justify-center transition shadow">
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </a>
            <div class="leading-tight">
              <span class="text-[9px] uppercase font-mono font-black text-amber-400 tracking-wider">ADMIN ARTICLES LIST</span>
              <h1 class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Published Articles Screen</span>
                <i class="fa-solid fa-newspaper text-xs text-amber-400"></i>
              </h1>
            </div>
          </div>
          <a href="admin-blog-editor.html" class="text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 rounded-xl shadow cursor-pointer hover:opacity-95 transition">
            <i class="fa-solid fa-plus mr-1"></i> Add Article ✍️
          </a>
        </div>
      </header>

      <main class="max-w-4xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-24 font-sans">
        <div class="space-y-3">
          <h4 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Published Articles (${s.length})
          </h4>

          <div class="space-y-3">
            ${s.length===0?`
              <div class="bg-slate-900 border border-slate-800 p-10 rounded-3xl text-center space-y-3">
                <i class="fa-regular fa-newspaper text-4xl text-slate-600"></i>
                <p class="text-xs text-slate-400 font-mono">No blog articles published yet.</p>
                <a href="admin-blog-editor.html" class="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">Publish First Article</a>
              </div>
            `:`
              ${s.map(t=>{const a=(this.db.blogComments||[]).filter(o=>o.blogId===t.id).length;return`
                  <div class="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-xl">
                    <div class="flex items-center gap-3.5 min-w-0">
                      <img src="${t.image}" alt="${t.title}" class="w-16 h-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div class="space-y-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-bold">${t.category}</span>
                          <span class="text-[10px] text-slate-500 font-mono">${t.date} · ${t.views||0} views · ${t.likes||0} likes · ${a} comments</span>
                        </div>
                        <h5 class="text-xs font-bold text-white truncate">${this.escapeHTML(t.title)}</h5>
                        <p class="text-[10px] text-slate-400 truncate max-w-md">${this.escapeHTML(t.excerpt||"")}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <a href="admin-blog-editor.html?edit=${t.id}" class="bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition">
                        <i class="fa-solid fa-pen"></i> Edit
                      </a>
                      <button class="article-delete-btn bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer" data-id="${t.id}">
                        <i class="fa-solid fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                `}).join("")}
            `}
          </div>
        </div>
      </main>
    `,this.bindEvents()}bindEvents(){document.querySelectorAll(".article-delete-btn").forEach(s=>{s.addEventListener("click",t=>{const a=t.currentTarget.getAttribute("data-id");this.db.blogs=this.db.blogs.filter(o=>o.id!==a),this.saveDB(),this.showToast("Article deleted successfully.","success"),this.render()})})}}new n;
