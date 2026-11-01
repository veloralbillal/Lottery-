var x=Object.defineProperty;var p=(o,e,t)=>e in o?x(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var i=(o,e,t)=>p(o,typeof e!="symbol"?e+"":e,t);import"./index-K8rIAbt6.js";class h{constructor(){i(this,"db",{});i(this,"categoryId",null);i(this,"bcChannel",null);this.loadState(),this.initSyncChannel(),this.parseUrl(),this.render()}initSyncChannel(){if(typeof BroadcastChannel<"u")try{this.bcChannel=new BroadcastChannel("lw_realtime_db_sync"),this.bcChannel.onmessage=e=>{e.data&&e.data.type==="database_updated"&&(this.loadState(),this.render())}}catch{}window.addEventListener("storage",e=>{e.key==="lw_lottery_db_v3"&&(this.loadState(),this.render())})}loadState(){try{const e=localStorage.getItem("lw_lottery_db_v3");e&&(this.db=JSON.parse(e))}catch{}(!this.db||typeof this.db!="object")&&(this.db={}),this.db.blogs||(this.db.blogs=[]),this.db.blogCategories||(this.db.blogCategories=[])}async saveDB(){try{const e=JSON.stringify(this.db);try{localStorage.setItem("lw_lottery_db_v3",e),localStorage.setItem("lottery_winner_db_backup",e)}catch{localStorage.removeItem("lottery_winner_db_backup"),localStorage.setItem("lw_lottery_db_v3",JSON.stringify(this.db))}if(this.bcChannel)try{this.bcChannel.postMessage({type:"database_updated",timestamp:Date.now()})}catch{}window.dispatchEvent(new Event("storage")),fetch("/api/sql/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({db:e})}).catch(()=>{})}catch{}}parseUrl(){const e=new URLSearchParams(window.location.search);this.categoryId=e.get("edit")||e.get("id")}showToast(e,t="success"){const a=document.getElementById("toast-notification");a&&a.remove();const s=document.createElement("div");s.id="toast-notification",s.className=`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md ${t==="success"?"bg-emerald-950/90 border-emerald-500/50 text-emerald-200":"bg-rose-950/90 border-rose-500/50 text-rose-200"}`,s.innerHTML=`<span>${e}</span>`,document.body.appendChild(s),setTimeout(()=>s.remove(),3500)}escapeHTML(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}render(){const e=document.getElementById("category-editor-root");if(!e)return;const t=(this.db.blogCategories||[]).find(a=>a.id===this.categoryId);e.innerHTML=`
      <!-- Mobile-First Header -->
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/85 sticky top-0 z-40 backdrop-blur-md px-3.5 py-3 shadow-xl">
        <div class="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <a href="admin-categories.html" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white flex items-center justify-center transition shadow shrink-0 active:scale-95" title="Back to Categories">
              <i class="fa-solid fa-arrow-left text-xs"></i>
            </a>
            <div>
              <span class="text-[8.5px] uppercase font-mono font-black text-amber-400 tracking-wider">DEDICATED EDITOR</span>
              <h1 class="text-xs sm:text-sm font-black text-white">Edit Category</h1>
            </div>
          </div>
          <a href="admin-categories.html" class="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl hover:text-white transition">
            Categories List
          </a>
        </div>
      </header>

      <!-- Main Workspace -->
      <main class="max-w-xl mx-auto p-3.5 sm:p-5 w-full space-y-4 pb-28 font-sans">
        ${t?`
          <div class="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl space-y-4 shadow-xl">
            <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h4 class="text-xs font-black text-amber-400 font-mono uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-pen-to-square"></i> Editing: ${this.escapeHTML(t.name)}
              </h4>
              <span class="text-[9px] font-mono bg-slate-950 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-800">ID: ${t.id}</span>
            </div>

            <div class="space-y-3">
              <div>
                <label class="text-[10px] font-mono text-slate-400 block mb-1">Category Name *</label>
                <input type="text" id="edit-cat-name" value="${this.escapeHTML(t.name)}" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition font-bold" />
              </div>

              <div>
                <label class="text-[10px] font-mono text-slate-400 block mb-1">Unique URL Slug *</label>
                <div class="flex items-center bg-slate-950 border border-slate-800 focus-within:border-amber-500 rounded-xl px-3 py-2 text-xs">
                  <span class="text-slate-500 font-mono text-[11px] shrink-0">/category/</span>
                  <input type="text" id="edit-cat-slug" value="${this.escapeHTML(t.slug)}" class="w-full bg-transparent text-white font-mono text-xs outline-none px-1" />
                </div>
              </div>

              <div>
                <label class="text-[10px] font-mono text-slate-400 block mb-1">Description</label>
                <textarea id="edit-cat-desc" rows="3" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white outline-none resize-none transition">${this.escapeHTML(t.description||"")}</textarea>
              </div>
            </div>

            <div class="pt-2 flex items-center gap-3">
              <button id="edit-cat-save-btn" class="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition active:scale-95 cursor-pointer">
                Save Changes 💾
              </button>
              <a href="admin-categories.html" class="px-4 py-3 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 font-bold text-xs rounded-xl transition text-center">
                Cancel
              </a>
            </div>
          </div>
        `:`
          <div class="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-3 shadow-xl">
            <i class="fa-solid fa-triangle-exclamation text-3xl text-amber-400"></i>
            <h4 class="text-xs font-bold text-white">Category Not Found</h4>
            <p class="text-[11px] text-slate-400">The requested category could not be located or has been deleted.</p>
            <a href="admin-categories.html" class="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">Return to Categories</a>
          </div>
        `}
      </main>
    `,this.bindEvents(t)}bindEvents(e){if(!e)return;const t=document.getElementById("edit-cat-name"),a=document.getElementById("edit-cat-slug"),s=document.getElementById("edit-cat-desc"),d=document.getElementById("edit-cat-save-btn");t&&a&&(t.oninput=()=>{a.dataset.manual||(a.value=t.value.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-"))},a.oninput=()=>{a.dataset.manual="true"}),d&&(d.onclick=async()=>{const l=t==null?void 0:t.value.trim(),n=a==null?void 0:a.value.trim(),c=(s==null?void 0:s.value.trim())||"";if(!l||!n){this.showToast("Category name and slug are required.","error");return}if((this.db.blogCategories||[]).some(r=>r.id!==e.id&&r.slug===n)){this.showToast("Slug already exists on another category.","error");return}const b=e.name;e.name=l,e.slug=n,e.description=c,(this.db.blogs||[]).forEach(r=>{r.category===b&&(r.category=l,r.categorySlug=n)}),await this.saveDB(),this.showToast("Category updated successfully! 🏷️","success"),setTimeout(()=>{window.location.href="admin-categories.html"},500)})}}new h;
