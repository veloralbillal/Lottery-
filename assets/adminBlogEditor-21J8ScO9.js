var B=Object.defineProperty;var S=(r,t,e)=>t in r?B(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var p=(r,t,e)=>S(r,typeof t!="symbol"?t+"":t,e);import"./tailwind-built-B6Vj1Iel.js";class A{constructor(){p(this,"db",{});p(this,"editId",null);this.loadState(),this.parseUrl(),this.render()}loadState(){try{const t=localStorage.getItem("lw_lottery_db_v3");t&&(this.db=JSON.parse(t))}catch{}(!this.db||typeof this.db!="object")&&(this.db={}),this.db.blogs||(this.db.blogs=[]),(!this.db.blogCategories||this.db.blogCategories.length===0)&&(this.db.blogCategories=[{id:"bcat-1",name:"Lottery Tips",slug:"lottery-tips",description:"Pro mathematical patterns & draw strategies"},{id:"bcat-2",name:"Winners Stories",slug:"winners-stories",description:"Interviews with jackpot champions"},{id:"bcat-3",name:"Platform Updates",slug:"platform-updates",description:"Gateway upgrades, cashouts & fee alerts"},{id:"bcat-4",name:"Guides",slug:"guides",description:"Step-by-step app walkthroughs"}])}saveDB(){try{localStorage.setItem("lw_lottery_db_v3",JSON.stringify(this.db))}catch{}}parseUrl(){const e=new URLSearchParams(window.location.search).get("edit");e&&(this.editId=e)}showToast(t,e="success"){const s=document.getElementById("toast-notification");s&&s.remove();const o=document.createElement("div");o.id="toast-notification",o.className=`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md ${e==="success"?"bg-emerald-950/90 border-emerald-500/50 text-emerald-200":"bg-rose-950/90 border-rose-500/50 text-rose-200"}`,o.innerHTML=`<span>${t}</span>`,document.body.appendChild(o),setTimeout(()=>o.remove(),3500)}escapeHTML(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}formatMarkdown(t=""){if(!t)return"";let e=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return e=e.replace(/^### (.*$)/gim,'<h3 class="text-base font-black text-amber-300 mt-4 mb-2">$1</h3>'),e=e.replace(/^## (.*$)/gim,'<h2 class="text-lg font-black text-white mt-5 mb-2.5">$1</h2>'),e=e.replace(/\*\*(.*?)\*\*/gim,'<strong class="font-bold text-white">$1</strong>'),e=e.replace(/\*(.*?)\*/gim,'<em class="italic text-slate-200">$1</em>'),e=e.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/gim,'<a href="$2" target="_blank" class="text-cyan-400 underline">$1</a>'),e=e.replace(/^> (.*$)/gim,'<blockquote class="border-l-2 border-amber-500/60 pl-3 py-1 my-2 italic text-slate-300 bg-amber-500/5">$1</blockquote>'),e=e.replace(/\n\n/g,'<div class="h-3"></div>').replace(/\n/g,"<br/>"),e}render(){const t=document.getElementById("editor-app-root");if(!t)return;const e=this.editId?(this.db.blogs||[]).find(s=>s.id===this.editId):null;t.innerHTML=`
      <header class="bg-[#0b0f19]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 shadow-xl">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <a href="index.html#admin" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white flex items-center justify-center transition shadow">
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </a>
            <div class="leading-tight">
              <span class="text-[9px] uppercase font-mono font-black text-amber-400 tracking-wider">ADMIN ARTICLE SUITE</span>
              <h1 class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>${e?"Edit Blog Article":"Publish New Blog Article"}</span>
                <i class="fa-solid fa-pen-nib text-xs text-amber-400"></i>
              </h1>
            </div>
          </div>
          <a href="admin-articles.html" class="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl hover:text-amber-300 transition">
            <i class="fa-solid fa-list mr-1"></i> All Articles
          </a>
        </div>
      </header>

      <main class="max-w-4xl mx-auto p-4 sm:p-6 w-full space-y-6 pb-24 font-sans">
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Article Title *</label>
              <input type="text" id="editor-title" value="${e?this.escapeHTML(e.title):""}" placeholder="e.g. How to Win Mega Progressive Jackpot" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
            </div>
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Category *</label>
              <select id="editor-category" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition">
                ${(this.db.blogCategories||[]).map(s=>`
                  <option value="${this.escapeHTML(s.name)}" ${e&&e.category===s.name?"selected":""}>
                    ${this.escapeHTML(s.name)} (${s.slug})
                  </option>
                `).join("")}
              </select>
            </div>
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Author Name</label>
              <input type="text" id="editor-author" value="${e?this.escapeHTML(e.author):"Admin Editorial"}" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
            </div>
            <div>
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Cover Image (URL or Upload File)</label>
              <div class="flex items-center gap-2">
                <input type="text" id="editor-image" value="${e?this.escapeHTML(e.image):"https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=60"}" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition" />
                <label class="shrink-0 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5">
                  <i class="fa-solid fa-upload"></i> Upload
                  <input type="file" id="editor-image-file" accept="image/*" class="hidden" />
                </label>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="text-[10px] font-mono text-slate-400 block mb-1">Short Excerpt (Feed Summary & Meta Description)</label>
              <textarea id="editor-excerpt" rows="2" placeholder="Brief summary displayed on article feed cards and Google search snippet..." class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white outline-none resize-none transition">${e?this.escapeHTML(e.excerpt||""):""}</textarea>
            </div>

            <!-- Live SEO Preview -->
            <div class="md:col-span-2 bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <i class="fa-solid fa-globe"></i> Live Advanced SEO & Search Snippet Preview
                </span>
                <span class="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">Active Live SEO</span>
              </div>
              <div class="bg-white/5 border border-slate-800 p-3 rounded-xl space-y-1 font-sans">
                <div id="live-seo-title" class="text-xs font-bold text-cyan-400 truncate">${e?this.escapeHTML(e.title):"Article Title Preview"}</div>
                <div id="live-seo-url" class="text-[10px] font-mono text-emerald-400 truncate">https://luckybox.app/blog/${e?e.categorySlug||"article":"article-slug"}</div>
                <div id="live-seo-desc" class="text-[11px] text-slate-300 line-clamp-2">${e?this.escapeHTML(e.excerpt||""):"Article meta description snippet preview will appear here as you type..."}</div>
              </div>
            </div>

            <!-- Content Editor -->
            <div class="md:col-span-2 space-y-2">
              <label class="text-[10px] font-mono text-slate-400 block">Article Content (Rich Text / Markdown) *</label>
              <textarea id="editor-content" rows="10" placeholder="Type article content here..." class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3.5 text-xs text-white outline-none resize-none font-mono leading-relaxed transition">${e?this.escapeHTML(e.content||""):""}</textarea>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button id="editor-save-btn" class="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition hover:opacity-95 shadow-lg shadow-amber-500/20 cursor-pointer">
              ${e?"Update Article 💾":"Publish Article 🚀"}
            </button>
            <a href="admin-articles.html" class="px-5 py-3 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-xs font-bold">Cancel</a>
          </div>
        </div>
      </main>
    `,this.bindEvents()}bindEvents(){const t=document.getElementById("editor-image-file"),e=document.getElementById("editor-image");t&&e&&(t.onchange=i=>{const l=i.target.files[0];if(l){const n=new FileReader;n.onload=d=>{e.value=d.target.result,this.showToast("Cover image uploaded successfully! 📷","success")},n.readAsDataURL(l)}});const s=document.getElementById("editor-title"),o=document.getElementById("editor-excerpt"),m=document.getElementById("live-seo-title"),b=document.getElementById("live-seo-desc"),u=document.getElementById("live-seo-url");s&&m&&(s.oninput=()=>{if(m.textContent=s.value||"Article Title Preview",u){const i=(s.value||"article").toLowerCase().replace(/[^a-z0-9]/g,"-");u.textContent=`https://luckybox.app/blog/${i}`}}),o&&b&&(o.oninput=()=>{b.textContent=o.value||"Article meta description snippet preview will appear here as you type..."});const x=document.getElementById("editor-save-btn");x&&(x.onclick=()=>{var v,y,w,I,T,E;const i=(v=document.getElementById("editor-title"))==null?void 0:v.value.trim(),l=(y=document.getElementById("editor-category"))==null?void 0:y.value,n=((w=document.getElementById("editor-author"))==null?void 0:w.value.trim())||"Admin",d=(I=document.getElementById("editor-image"))==null?void 0:I.value.trim(),g=(T=document.getElementById("editor-excerpt"))==null?void 0:T.value.trim(),c=(E=document.getElementById("editor-content"))==null?void 0:E.value.trim();if(!i||!c){this.showToast("Please provide article title and content.","error");return}const h=(this.db.blogCategories||[]).find(a=>a.name===l),f=h?h.slug:l.toLowerCase().replace(/[^a-z0-9]/g,"-");if(this.editId){const a=(this.db.blogs||[]).find($=>$.id===this.editId);if(a){a.title=i,a.category=l,a.categorySlug=f,a.author=n,a.image=d||a.image,a.excerpt=g||i,a.content=c,this.saveDB(),this.showToast("Article updated successfully! 💾","success"),setTimeout(()=>window.location.href="admin-articles.html",1e3);return}}const k={id:"blog-"+Date.now(),title:i,category:l,categorySlug:f,author:n,date:new Date().toISOString().split("T")[0],readTime:"3 min read",views:1,likes:0,image:d||"https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=60",excerpt:g||i,content:c};this.db.blogs||(this.db.blogs=[]),this.db.blogs.unshift(k),this.saveDB(),this.showToast("Blog article published successfully! 🎉","success"),setTimeout(()=>window.location.href="admin-articles.html",1e3)})}}new A;
