var c=Object.defineProperty;var b=(r,e,t)=>e in r?c(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var n=(r,e,t)=>b(r,typeof e!="symbol"?e+"":e,t);import"./tailwind-built-B6Vj1Iel.js";class p{constructor(){n(this,"db",{});this.loadState(),this.render()}loadState(){try{const e=localStorage.getItem("lw_lottery_db_v3");e&&(this.db=JSON.parse(e))}catch{}(!this.db||typeof this.db!="object")&&(this.db={}),this.db.blogs||(this.db.blogs=[]),(!this.db.blogCategories||this.db.blogCategories.length===0)&&(this.db.blogCategories=[{id:"bcat-1",name:"Lottery Tips",slug:"lottery-tips",description:"Pro mathematical patterns & draw strategies"},{id:"bcat-2",name:"Winners Stories",slug:"winners-stories",description:"Interviews with jackpot champions"},{id:"bcat-3",name:"Platform Updates",slug:"platform-updates",description:"Gateway upgrades, cashouts & fee alerts"},{id:"bcat-4",name:"Guides",slug:"guides",description:"Step-by-step app walkthroughs"}])}saveDB(){try{localStorage.setItem("lw_lottery_db_v3",JSON.stringify(this.db))}catch{}}showToast(e,t="success"){const s=document.getElementById("toast-notification");s&&s.remove();const a=document.createElement("div");a.id="toast-notification",a.className=`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md ${t==="success"?"bg-emerald-950/90 border-emerald-500/50 text-emerald-200":"bg-rose-950/90 border-rose-500/50 text-rose-200"}`,a.innerHTML=`<span>${e}</span>`,document.body.appendChild(a),setTimeout(()=>a.remove(),3500)}escapeHTML(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}render(){const e=document.getElementById("categories-app-root");if(!e)return;const t=this.db.blogCategories||[];e.innerHTML=`
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
            ${t.length} Active
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
            Active Categories (${t.length})
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${t.map(s=>{const a=(this.db.blogs||[]).filter(o=>o.category===s.name||o.categorySlug===s.slug).length;return`
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 flex flex-col justify-between shadow-xl">
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <h5 class="text-xs font-bold text-white flex items-center gap-2">
                        <i class="fa-solid fa-tag text-amber-400"></i> ${this.escapeHTML(s.name)}
                      </h5>
                      <span class="bg-slate-950 border border-slate-800 text-amber-300 text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                        ${a} articles
                      </span>
                    </div>
                    <p class="text-[10px] font-mono text-cyan-400">Slug: /${s.slug}</p>
                    <p class="text-xs text-slate-400">${this.escapeHTML(s.description||"No description.")}</p>
                  </div>
                  <div class="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                    <button class="cat-delete-btn text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-800/30 cursor-pointer" data-id="${s.id}">
                      <i class="fa-solid fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
      </main>
    `,this.bindEvents()}bindEvents(){const e=document.getElementById("cat-name"),t=document.getElementById("cat-slug");e&&t&&(e.oninput=()=>{t.value=e.value.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-")});const s=document.getElementById("cat-add-btn");s&&(s.onclick=()=>{var l;const o=e==null?void 0:e.value.trim(),i=t==null?void 0:t.value.trim(),d=(l=document.getElementById("cat-desc"))==null?void 0:l.value.trim();if(!o||!i){this.showToast("Please provide category name and slug.","error");return}this.db.blogCategories||(this.db.blogCategories=[]),this.db.blogCategories.push({id:"bcat-"+Date.now(),name:o,slug:i,description:d}),this.saveDB(),this.showToast("Category created successfully! 🏷️","success"),this.render()}),document.querySelectorAll(".cat-delete-btn").forEach(o=>{o.addEventListener("click",i=>{const d=i.currentTarget.getAttribute("data-id");if(this.db.blogCategories.length<=1){this.showToast("You must keep at least one category.","error");return}this.db.blogCategories=this.db.blogCategories.filter(l=>l.id!==d),this.saveDB(),this.showToast("Category deleted.","success"),this.render()})})}}new p;
