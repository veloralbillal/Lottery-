var c=Object.defineProperty;var b=(n,t,r)=>t in n?c(n,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):n[t]=r;var d=(n,t,r)=>b(n,typeof t!="symbol"?t+"":t,r);import"./tailwind-built-B6Vj1Iel.js";class m{constructor(){d(this,"db",{});d(this,"currentFilter","all");this.loadState(),this.render()}loadState(){try{const t=localStorage.getItem("lw_lottery_db_v3");t&&(this.db=JSON.parse(t))}catch{}(!this.db||typeof this.db!="object")&&(this.db={}),this.db.blogs||(this.db.blogs=[]),this.db.blogComments||(this.db.blogComments=[])}saveDB(){try{localStorage.setItem("lw_lottery_db_v3",JSON.stringify(this.db))}catch{}}showToast(t,r="success"){const a=document.getElementById("toast-notification");a&&a.remove();const s=document.createElement("div");s.id="toast-notification";const e={success:"bg-emerald-950/90 border-emerald-500/50 text-emerald-200",error:"bg-rose-950/90 border-rose-500/50 text-rose-200",info:"bg-slate-900/90 border-slate-700 text-slate-200"};s.className=`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md transition-all duration-300 animate-fade-in ${e[r]}`,s.innerHTML=`<span>${t}</span>`,document.body.appendChild(s),setTimeout(()=>{s.style.opacity="0",setTimeout(()=>s.remove(),300)},3500)}escapeHTML(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}render(){const t=document.getElementById("comments-app-root");if(!t)return;const r=this.db.blogComments||[],a=r.filter(e=>e.status==="pending").length,s=r.filter(e=>this.currentFilter==="all"?!0:e.status===this.currentFilter);t.innerHTML=`
      <!-- Standalone Top Header Bar -->
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 shadow-xl">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <a href="index.html#admin" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white hover:bg-amber-500/20 flex items-center justify-center transition cursor-pointer shadow active:scale-95" title="Back to Admin Dashboard">
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </a>
            <div class="leading-tight">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span class="text-[9px] uppercase font-mono font-black text-rose-400 tracking-wider">ADMIN CONTROL SUITE</span>
              </div>
              <h1 class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Comment Moderation Screen</span>
                <i class="fa-solid fa-comments text-xs text-amber-400"></i>
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[9.5px] font-mono font-bold text-rose-300 bg-rose-950/60 px-3 py-1.5 rounded-full border border-rose-800/40 shadow-inner">
              ${a} Pending Reviews
            </span>
          </div>
        </div>
      </header>

      <!-- Main Container -->
      <main class="max-w-4xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-24">
        <!-- Filter Bar -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-xl">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-white font-mono">Filter Status:</span>
            <div class="flex items-center gap-1.5">
              ${["all","pending","approved","rejected"].map(e=>`
                <button class="comment-filter-btn text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer capitalize ${this.currentFilter===e?"bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20":"bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"}" data-filter="${e}">
                  ${e} (${r.filter(o=>e==="all"?!0:o.status===e).length})
                </button>
              `).join("")}
            </div>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">Showing ${s.length} comments</span>
        </div>

        <!-- Comments List -->
        <div class="space-y-4">
          ${s.length===0?`
            <div class="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-3">
              <i class="fa-regular fa-comment-dots text-4xl text-slate-600"></i>
              <p class="text-xs text-slate-400 font-mono">No comments found matching filter "${this.currentFilter}".</p>
            </div>
          `:`
            ${s.map(e=>{const o=(this.db.blogs||[]).find(l=>l.id===e.blogId),i=o?o.title:"Unknown Article";return`
                <div class="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 sm:p-5 rounded-2xl space-y-3 transition shadow-xl">
                  <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div class="flex items-center gap-2">
                      <strong class="text-amber-300 font-mono">@${this.escapeHTML(e.username)}</strong>
                      <span class="text-[10px] text-slate-500 font-mono">on "${this.escapeHTML(i)}"</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] text-slate-500 font-mono">${e.date||new Date().toLocaleDateString()}</span>
                      <span class="text-[9px] font-mono px-2.5 py-0.5 rounded font-bold uppercase ${e.status==="approved"?"bg-emerald-950 text-emerald-400 border border-emerald-800/40":e.status==="rejected"?"bg-rose-950 text-rose-400 border border-rose-800/40":"bg-amber-950 text-amber-400 border border-amber-600/40"}">
                        ${e.status||"pending"}
                      </span>
                    </div>
                  </div>

                  <p class="text-xs text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-sans leading-relaxed">
                    ${this.escapeHTML(e.text)}
                  </p>

                  <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button class="comment-action-btn text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5" data-id="${e.id}" data-action="approved">
                      <i class="fa-solid fa-check"></i> Approve
                    </button>
                    <button class="comment-action-btn text-xs font-bold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5" data-id="${e.id}" data-action="rejected">
                      <i class="fa-solid fa-ban"></i> Reject
                    </button>
                    <button class="comment-action-btn text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5" data-id="${e.id}" data-action="delete">
                      <i class="fa-solid fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              `}).join("")}
          `}
        </div>
      </main>
    `,this.bindEvents()}bindEvents(){document.querySelectorAll(".comment-filter-btn").forEach(a=>{a.addEventListener("click",s=>{this.currentFilter=s.currentTarget.getAttribute("data-filter"),this.render()})}),document.querySelectorAll(".comment-action-btn").forEach(a=>{a.addEventListener("click",s=>{const e=s.currentTarget.getAttribute("data-id"),o=s.currentTarget.getAttribute("data-action");if(this.db.blogComments||(this.db.blogComments=[]),o==="delete")this.db.blogComments=this.db.blogComments.filter(i=>i.id!==e),this.showToast("Comment deleted successfully.","error");else{const i=this.db.blogComments.find(l=>l.id===e);i&&(i.status=o,this.showToast(`Comment status updated to "${o}"! ✅`,"success"))}this.saveDB(),this.render()})})}}new m;
