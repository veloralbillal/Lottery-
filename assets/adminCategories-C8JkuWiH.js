var u=Object.defineProperty;var f=(i,e,t)=>e in i?u(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var c=(i,e,t)=>f(i,typeof e!="symbol"?e+"":e,t);import"./index-BCb6XRRm.js";class h{constructor(){c(this,"db",{});c(this,"bcChannel",null);c(this,"isAddModalOpen",!1);this.loadState(),this.initSyncChannel(),this.render()}initSyncChannel(){if(typeof BroadcastChannel<"u")try{this.bcChannel=new BroadcastChannel("lw_realtime_db_sync"),this.bcChannel.onmessage=e=>{e.data&&e.data.type==="database_updated"&&(this.loadState(),this.render())}}catch{}window.addEventListener("storage",e=>{e.key==="lw_lottery_db_v3"&&(this.loadState(),this.render())})}loadState(){try{const e=localStorage.getItem("lw_lottery_db_v3");e&&(this.db=JSON.parse(e))}catch{}(!this.db||typeof this.db!="object")&&(this.db={}),this.db.blogs||(this.db.blogs=[]),(!this.db.blogCategories||this.db.blogCategories.length===0)&&(this.db.blogCategories=[{id:"bcat-1",name:"Lottery Tips",slug:"lottery-tips",description:"Pro mathematical patterns & draw strategies"},{id:"bcat-2",name:"Winners Stories",slug:"winners-stories",description:"Interviews with jackpot champions"},{id:"bcat-3",name:"Platform Updates",slug:"platform-updates",description:"Gateway upgrades, cashouts & fee alerts"},{id:"bcat-4",name:"Guides",slug:"guides",description:"Step-by-step app walkthroughs"}])}async saveDB(){try{const e=JSON.stringify(this.db);try{localStorage.setItem("lw_lottery_db_v3",e),localStorage.setItem("lottery_winner_db_backup",e)}catch{localStorage.removeItem("lottery_winner_db_backup"),localStorage.setItem("lw_lottery_db_v3",JSON.stringify(this.db))}if(this.bcChannel)try{this.bcChannel.postMessage({type:"database_updated",timestamp:Date.now()})}catch{}window.dispatchEvent(new Event("storage")),fetch("/api/sql/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({db:e})}).catch(()=>{})}catch{}}showToast(e,t="success"){const a=document.getElementById("toast-notification");a&&a.remove();const s=document.createElement("div");s.id="toast-notification",s.className=`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md ${t==="success"?"bg-emerald-950/90 border-emerald-500/50 text-emerald-200":"bg-rose-950/90 border-rose-500/50 text-rose-200"}`,s.innerHTML=`<span>${e}</span>`,document.body.appendChild(s),setTimeout(()=>s.remove(),3500)}escapeHTML(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}render(){const e=document.getElementById("categories-app-root");if(!e)return;const t=this.db.blogCategories||[];e.innerHTML=`
      <!-- Mobile-First Sticky Header -->
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/85 sticky top-0 z-40 backdrop-blur-md px-3.5 py-3 shadow-xl">
        <div class="max-w-xl mx-auto flex items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5 min-w-0">
            <a href="index.html#admin" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white flex items-center justify-center transition shadow shrink-0 active:scale-95" title="Back to Admin">
              <i class="fa-solid fa-arrow-left text-xs"></i>
            </a>
            <div class="leading-tight min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[8.5px] uppercase font-mono font-black text-amber-400 tracking-wider">CATEGORY TAXONOMY</span>
                <span class="text-[8.5px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.2 rounded-full flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
                </span>
              </div>
              <h1 class="text-xs sm:text-sm font-black text-white truncate">Categories (${t.length})</h1>
            </div>
          </div>
          <button id="open-add-cat-modal-btn" class="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow hover:opacity-95 transition flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer">
            <i class="fa-solid fa-plus text-[10px]"></i> Add Category
          </button>
        </div>
      </header>

      <!-- Main Mobile-Optimized Workspace (Default: All Categories) -->
      <main class="max-w-xl mx-auto p-3.5 sm:p-5 w-full space-y-4 pb-28 font-sans">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              All Active Categories (${t.length})
            </h4>
            <span class="text-[10px] text-slate-500 font-mono">Tap Edit for dedicated screen</span>
          </div>

          <div class="space-y-3">
            ${t.length===0?`
              <div class="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl text-center space-y-3 shadow-xl">
                <i class="fa-solid fa-tags text-3xl text-slate-600"></i>
                <p class="text-xs text-slate-400 font-mono">No categories found.</p>
              </div>
            `:`
              <div class="space-y-3">
                ${t.map((a,s)=>{const d=(this.db.blogs||[]).filter(o=>o.category===a.name||o.categorySlug===a.slug).length;return`
                    <div class="blog-fade-in bg-slate-900/95 border border-slate-800 hover:border-slate-700 p-3.5 sm:p-4 rounded-2xl flex flex-col gap-3 transition shadow-lg" style="animation-delay: ${Math.min(s*30,200)}ms;">
                      <div class="flex items-start justify-between gap-3">
                        <div class="space-y-1 min-w-0 flex-1">
                          <div class="flex items-center gap-2 flex-wrap">
                            <h5 class="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              <i class="fa-solid fa-tag text-amber-400 text-[10px]"></i> ${this.escapeHTML(a.name)}
                            </h5>
                            <span class="bg-slate-950 text-cyan-400 font-mono text-[9px] px-2 py-0.2 rounded border border-slate-800">/${a.slug}</span>
                          </div>
                          <p class="text-[11px] text-slate-400 leading-snug">${this.escapeHTML(a.description||"No description provided.")}</p>
                        </div>
                        <span class="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0">
                          ${d} posts
                        </span>
                      </div>

                      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                        <a href="admin-category-editor.html?edit=${encodeURIComponent(a.id)}" class="bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow active:scale-95 cursor-pointer">
                          <i class="fa-solid fa-pen-to-square text-[10px]"></i> Edit
                        </a>
                        <button class="cat-delete-btn bg-rose-600/15 hover:bg-rose-600/25 text-rose-400 border border-rose-500/30 text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow active:scale-95" data-id="${a.id}">
                          <i class="fa-solid fa-trash text-[10px]"></i> Delete
                        </button>
                      </div>
                    </div>
                  `}).join("")}
              </div>
            `}
          </div>
        </div>
      </main>

      <!-- Add Category Popup Modal -->
      <div id="add-cat-modal" class="${this.isAddModalOpen?"flex":"hidden"} fixed inset-0 z-50 bg-black/80 backdrop-blur-sm items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-fade-in font-sans">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-folder-plus text-amber-400"></i> Create New Blog Category
            </h3>
            <button id="close-add-cat-modal-btn" class="w-8 h-8 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Category Name *</label>
              <input type="text" id="modal-cat-name" placeholder="e.g. VIP Club Strategies" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
            </div>
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Unique URL Slug *</label>
              <input type="text" id="modal-cat-slug" placeholder="e.g. vip-club-strategies" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono transition" />
            </div>
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Description</label>
              <textarea id="modal-cat-desc" rows="2" placeholder="Brief category purpose..." class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white outline-none resize-none transition"></textarea>
            </div>
          </div>

          <div class="pt-2 flex items-center gap-2">
            <button id="modal-cat-submit-btn" class="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition active:scale-95 cursor-pointer">
              Create Category 🏷️
            </button>
            <button id="modal-cat-cancel-btn" class="px-4 py-3 bg-slate-950 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 hover:text-white cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `,this.bindEvents()}bindEvents(){const e=document.getElementById("open-add-cat-modal-btn"),t=document.getElementById("close-add-cat-modal-btn"),a=document.getElementById("modal-cat-cancel-btn"),s=document.getElementById("add-cat-modal");e&&(e.onclick=()=>{this.isAddModalOpen=!0,s&&s.classList.remove("hidden"),s&&s.classList.add("flex")});const d=()=>{this.isAddModalOpen=!1,s&&(s.classList.add("hidden"),s.classList.remove("flex"))};t&&(t.onclick=d),a&&(a.onclick=d);const o=document.getElementById("modal-cat-name"),l=document.getElementById("modal-cat-slug");o&&l&&(o.oninput=()=>{l.dataset.manual||(l.value=o.value.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-"))},l.oninput=()=>{l.dataset.manual="true"});const p=document.getElementById("modal-cat-submit-btn");p&&(p.onclick=async()=>{var x;const n=o==null?void 0:o.value.trim(),r=l==null?void 0:l.value.trim(),b=((x=document.getElementById("modal-cat-desc"))==null?void 0:x.value.trim())||"";if(!n||!r){this.showToast("Category name and slug are required.","error");return}if(this.db.blogCategories||(this.db.blogCategories=[]),(this.db.blogCategories||[]).some(g=>g.slug===r)){this.showToast(`Slug "${r}" already exists.`,"error");return}this.db.blogCategories.push({id:"bcat-"+Date.now(),name:n,slug:r,description:b}),await this.saveDB(),this.showToast("Category created successfully! 🏷️","success"),d(),this.render()}),document.querySelectorAll(".cat-delete-btn").forEach(n=>{n.addEventListener("click",async r=>{const b=r.currentTarget.getAttribute("data-id");if((this.db.blogCategories||[]).length<=1){this.showToast("You must keep at least one category.","error");return}confirm("Are you sure you want to delete this category?")&&(this.db.blogCategories=(this.db.blogCategories||[]).filter(m=>m.id!==b),await this.saveDB(),this.showToast("Category deleted.","success"),this.render())})})}}new h;
