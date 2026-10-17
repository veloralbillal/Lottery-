var u=Object.defineProperty;var g=(c,t,e)=>t in c?u(c,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):c[t]=e;var m=(c,t,e)=>g(c,typeof t!="symbol"?t+"":t,e);import"./tailwind-built-B6Vj1Iel.js";class x{constructor(){m(this,"db",{});m(this,"currentUser",null);m(this,"currentPostId",null);m(this,"searchQuery","");m(this,"selectedCategory","All");this.loadState(),this.parseUrlParams()}loadState(){try{const t=localStorage.getItem("lw_lottery_db_v3");t&&(this.db=JSON.parse(t))}catch{}(!this.db||typeof this.db!="object")&&(this.db={}),(!this.db.blogs||!Array.isArray(this.db.blogs)||this.db.blogs.length===0)&&(this.db.blogs=[{id:"blog-1",title:"How to Win Mega Progressive Jackpot: Pro Strategies & Tips",category:"Lottery Tips",categorySlug:"lottery-tips",author:"Admin Master",authorAvatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),readTime:"4 min read",views:342,likes:28,coverImage:"https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80",excerpt:"Discover mathematical distribution patterns, multi-ticket syndicate strategies, and best draw timing to maximize your probability.",content:`## 1. Understand Number Spread & Probability
When entering the LuckyBox Mega Draw, avoid picking consecutive numbers (e.g., 01, 02, 03). Historical draw statistics confirm over 84% of winning draw combinations have a balanced distribution of low and high digits.

### Key Strategy Points:
- Mix Odd and Even digits evenly (3 odd / 3 even is statistically optimal).
- Utilize the Auto-Quick Pick generator alongside your custom lucky numbers.
- Maintain syndicate pool entries with your group for greater ticket coverage.

> "Consistency and disciplined bankroll management are the true hallmarks of persistent lottery champions."

## 2. Reinvest Small Bonus Wins
Use free daily check-in coins and referral rewards to secure tickets without deducting from your main liquid deposit balance. With 0% withdrawal fees on bKash & Nagad, cash out your major tier prizes instantly!`,tags:["Jackpot","Tips","Strategy"]},{id:"blog-2",title:"Winner Interview: How @arif_99 Took Home ৳25,000 Jackpot",category:"Winners Stories",categorySlug:"winners-stories",author:"LuckyBox Editorial",authorAvatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",date:new Date(Date.now()-864e5).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),readTime:"3 min read",views:521,likes:64,coverImage:"https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80",excerpt:"Meet Arif from Dhaka, who won ৳25,000 on his 3rd draw ticket. Read his full reaction and advice for new players.",content:`## The Moment of Victory
Last Friday night at 10:00 PM, Arif logged in to check his active ticket ledger under the **Tickets Tab**. To his astonishment, all six matching digits illuminated with the golden winning animation!

### Arif's Advice for New Members:
- Never chase losses; participate with comfortable entertainment budgets.
- Join the active Group Chat to discuss tips with other registered players.
- Enable browser alerts so you never miss the countdown draw reveal.

> "I received my entire prize balance into my Nagad account in under 90 seconds. The transparency here is genuinely unmatched!" — @arif_99`,tags:["Interview","Winners","Nagad"]},{id:"blog-3",title:"Platform Upgrade: Zero-Fee Instant Taka Cashouts Now Live",category:"Platform Updates",categorySlug:"platform-updates",author:"System Operations",authorAvatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",date:new Date(Date.now()-1728e5).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),readTime:"2 min read",views:780,likes:89,coverImage:"https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",excerpt:"We have fully eliminated withdrawal fees across bKash, Nagad, and Rocket channels. Payouts now process 24/7 in real time.",content:`## Seamless Financial Freedom
We are delighted to introduce our revamped financial bridge! All withdrawals initiated on our platform now feature **0% deductions**.

### Release Highlights:
- **Instant Payouts**: Automated dispatch engine processes transfers within 1–3 minutes.
- **Support for Multi-Methods**: Choose freely between bKash Personal, Nagad, Rocket, or USDT Crypto.
- **Enhanced Security**: 4-digit PIN verification safeguard on all outgoing disbursements.`,tags:["Cashout","bKash","Updates"]}],this.saveDB()),(!this.db.blogCategories||!Array.isArray(this.db.blogCategories)||this.db.blogCategories.length===0)&&(this.db.blogCategories=[{id:"bcat-1",name:"Lottery Tips",slug:"lottery-tips",description:"Pro mathematical patterns & draw strategies"},{id:"bcat-2",name:"Winners Stories",slug:"winners-stories",description:"Interviews with jackpot champions"},{id:"bcat-3",name:"Platform Updates",slug:"platform-updates",description:"Gateway upgrades, cashouts & fee alerts"},{id:"bcat-4",name:"Guides",slug:"guides",description:"Step-by-step app walkthroughs"}],this.saveDB()),(!this.db.blogComments||!Array.isArray(this.db.blogComments))&&(this.db.blogComments=[{id:"cm-1",blogId:"blog-1",username:"tamim_bd",text:"Great tips! I tried the odd-even split strategy yesterday and got 4 matching digits!",createdAt:new Date(Date.now()-36e5).toISOString(),status:"approved"},{id:"cm-2",blogId:"blog-2",username:"shakib_winner",text:"Congratulations @arif_99 brother! Hope I win next draw 🏆",createdAt:new Date(Date.now()-72e5).toISOString(),status:"approved"}],this.saveDB());try{const t=localStorage.getItem("lw_user_session");t&&(this.currentUser=JSON.parse(t))}catch{}}saveDB(){try{localStorage.setItem("lw_lottery_db_v3",JSON.stringify(this.db))}catch{}}parseUrlParams(){const t=new URLSearchParams(window.location.search),e=t.get("post"),a=t.get("cat");e&&(this.currentPostId=e),a&&(this.selectedCategory=a)}formatContent(t=""){if(!t)return"";let e=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return e=e.replace(/^### (.*$)/gim,'<h3 class="text-base font-black text-amber-300 mt-4 mb-2">$1</h3>'),e=e.replace(/^## (.*$)/gim,'<h2 class="text-lg font-black text-white mt-5 mb-2.5">$1</h2>'),e=e.replace(/\*\*(.*?)\*\*/gim,'<strong class="font-bold text-white">$1</strong>'),e=e.replace(/\*(.*?)\*/gim,'<em class="italic text-slate-200">$1</em>'),e=e.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/gim,'<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 underline hover:text-cyan-300 font-medium">$1</a>'),e=e.replace(/^> (.*$)/gim,'<blockquote class="border-l-2 border-amber-500/60 pl-3 py-1 my-2 italic text-slate-300 bg-amber-500/5 rounded-r">$1</blockquote>'),e=e.replace(/^\- (.*$)/gim,'<li class="ml-4 list-disc text-slate-300 my-0.5">$1</li>'),e=e.replace(/^\d+\. (.*$)/gim,'<li class="ml-4 list-decimal text-slate-300 my-0.5">$1</li>'),e=e.replace(/\n\n/g,'<div class="h-3"></div>'),e=e.replace(/\n/g,"<br/>"),e}showToast(t,e="info"){const a=document.getElementById("blog-toast-box");a&&a.remove();const i=document.createElement("div");i.id="blog-toast-box";const o={success:"border-emerald-500/50 bg-emerald-950/90 text-emerald-200 shadow-emerald-900/30",error:"border-rose-500/50 bg-rose-950/90 text-rose-200 shadow-rose-900/30",info:"border-amber-500/50 bg-slate-900/95 text-amber-200 shadow-amber-900/30"};i.className=`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-mono font-bold shadow-2xl backdrop-blur-md transition-all duration-300 animate-bounce ${o[e]}`,i.innerHTML=`
      <i class="${e==="success"?"fa-solid fa-circle-check text-emerald-400":e==="error"?"fa-solid fa-circle-exclamation text-rose-400":"fa-solid fa-circle-info text-amber-400"}"></i>
      <span>${t}</span>
    `,document.body.appendChild(i),setTimeout(()=>{i.style.opacity="0",setTimeout(()=>i.remove(),400)},2800)}init(){this.render()}render(){const t=document.getElementById("blog-app-root");if(t){if(this.currentPostId){const e=(this.db.blogs||[]).find(a=>a.id===this.currentPostId);if(e){this.renderDetailView(t,e);return}else this.currentPostId=null}this.renderFeedView(t)}}renderFeedView(t){const e=this.searchQuery.toLowerCase().trim(),a=this.selectedCategory,i=(this.db.blogs||[]).filter(s=>{const n=a==="All"||s.category===a||s.categorySlug===a,l=!e||s.title.toLowerCase().includes(e)||s.excerpt&&s.excerpt.toLowerCase().includes(e)||s.content&&s.content.toLowerCase().includes(e);return n&&l}),o=["All",...(this.db.blogCategories||[]).map(s=>s.name)],r=this.db.blogs&&this.db.blogs.length>0?this.db.blogs[0]:null;t.innerHTML=`
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
              ${(this.db.blogs||[]).length} Articles
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
            ${this.searchQuery?`
              <button id="blog-clear-search" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer">
                <i class="fa-solid fa-xmark"></i>
              </button>
            `:""}
          </div>

          <!-- Dynamic Category Filter Pills -->
          <div class="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-800">
            ${o.map(s=>`
              <button class="blog-cat-btn shrink-0 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer active:scale-95 ${this.selectedCategory===s?"bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20":"bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/40"}" data-cat="${s}">
                ${s}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Featured Story Card (if no search filter is active) -->
        ${!this.searchQuery&&this.selectedCategory==="All"&&r?`
          <div class="blog-card bg-gradient-to-br from-[#161d36] via-[#0d1326] to-[#1d1636] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl cursor-pointer group hover:border-amber-400 transition" data-id="${r.id}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="h-52 md:h-full relative overflow-hidden bg-slate-950 min-h-[200px]">
                <img src="${r.coverImage||"https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80"}" alt="Cover" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span class="absolute top-3 left-3 bg-amber-500 text-slate-950 font-mono font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  ⭐ FEATURED STORY
                </span>
              </div>
              <div class="p-5 md:p-6 flex flex-col justify-between space-y-3">
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-[10px] font-mono text-amber-400">
                    <span class="font-bold uppercase tracking-wider">${r.category}</span>
                    <span>•</span>
                    <span class="text-slate-400">${r.readTime||"3 min read"}</span>
                  </div>
                  <h2 class="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition leading-snug">
                    ${r.title}
                  </h2>
                  <p class="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    ${r.excerpt||r.content.slice(0,140)+"..."}
                  </p>
                </div>

                <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <img src="${r.authorAvatar||"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"}" class="w-6 h-6 rounded-full object-cover border border-slate-700" alt="Author" />
                    <span class="text-[11px] font-mono text-slate-300 font-bold">${r.author}</span>
                  </div>
                  <span class="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                    Read Article <i class="fa-solid fa-arrow-right text-[10px]"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        `:""}

        <!-- Articles Grid List -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black uppercase tracking-wider font-mono text-slate-300 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>${this.selectedCategory==="All"?"Latest Publications":`${this.selectedCategory} Articles`}</span>
            </h3>
            <span class="text-[10px] font-mono text-slate-500">${i.length} found</span>
          </div>

          ${i.length===0?`
            <div class="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 text-center space-y-3">
              <i class="fa-solid fa-newspaper text-3xl text-slate-600"></i>
              <h4 class="text-xs font-bold text-slate-300">No blog articles match your criteria</h4>
              <p class="text-[11px] text-slate-500 max-w-sm mx-auto">Try clearing your search query or selecting a different category from above.</p>
              <button id="blog-reset-filters" class="bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs px-4 py-2 rounded-xl transition cursor-pointer">
                Clear All Filters
              </button>
            </div>
          `:`
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${i.map(s=>{const n=(this.db.blogComments||[]).filter(l=>l.blogId===s.id&&l.status==="approved").length;return`
                  <div class="blog-card bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between group cursor-pointer transition duration-200 hover:-translate-y-0.5" data-id="${s.id}">
                    <div>
                      <div class="h-44 w-full relative overflow-hidden bg-slate-950">
                        <img src="${s.coverImage||"https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80"}" alt="Cover" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <span class="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                          ${s.category}
                        </span>
                      </div>
                      
                      <div class="p-4 sm:p-5 space-y-2">
                        <div class="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>${s.date}</span>
                          <span>${s.readTime||"3 min read"}</span>
                        </div>
                        <h4 class="text-sm font-black text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                          ${s.title}
                        </h4>
                        <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          ${s.excerpt||s.content.slice(0,110)+"..."}
                        </p>
                      </div>
                    </div>

                    <div class="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex items-center justify-between border-t border-slate-800/50 mt-2">
                      <div class="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span class="flex items-center gap-1 text-rose-400">
                          <i class="fa-solid fa-heart text-[10px]"></i> ${s.likes||0}
                        </span>
                        <span class="flex items-center gap-1 text-cyan-400">
                          <i class="fa-solid fa-comment text-[10px]"></i> ${n}
                        </span>
                      </div>
                      <span class="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition flex items-center gap-1">
                        Read <i class="fa-solid fa-chevron-right text-[9px]"></i>
                      </span>
                    </div>
                  </div>
                `}).join("")}
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
    `,this.bindFeedEvents()}bindFeedEvents(){const t=document.getElementById("blog-search-box");t&&(t.oninput=r=>{this.searchQuery=r.target.value,this.render()});const e=document.getElementById("blog-clear-search");e&&(e.onclick=()=>{this.searchQuery="",this.render()});const a=document.getElementById("blog-reset-filters");a&&(a.onclick=()=>{this.searchQuery="",this.selectedCategory="All",this.render()}),document.querySelectorAll(".blog-cat-btn").forEach(r=>{r.addEventListener("click",s=>{this.selectedCategory=s.currentTarget.getAttribute("data-cat"),this.render()})}),document.querySelectorAll(".blog-card").forEach(r=>{r.addEventListener("click",s=>{const n=s.currentTarget.getAttribute("data-id");this.currentPostId=n;const l=new URL(window.location.href);l.searchParams.set("post",n),window.history.pushState({},"",l.toString()),this.render(),window.scrollTo({top:0,behavior:"smooth"})})})}renderDetailView(t,e){const a=(this.db.blogComments||[]).filter(o=>o.blogId===e.id&&(o.status==="approved"||this.currentUser&&o.username===this.currentUser.username)),i=this.formatContent(e.content);t.innerHTML=`
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
              ${e.category}
            </span>
            <span class="text-slate-500">•</span>
            <span class="text-slate-400">${e.readTime||"3 min read"}</span>
            <span class="text-slate-500">•</span>
            <span class="text-slate-400">${e.date}</span>
          </div>

          <h1 class="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight font-heading">
            ${e.title}
          </h1>

          <div class="flex items-center justify-between pt-2 border-b border-slate-800/80 pb-4">
            <div class="flex items-center gap-2.5">
              <img src="${e.authorAvatar||"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"}" class="w-8 h-8 rounded-full object-cover border border-slate-700" alt="Author" />
              <div>
                <span class="text-xs font-bold text-slate-200 block">${e.author}</span>
                <span class="text-[9.5px] font-mono text-slate-500">Verified Publisher</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button id="blog-like-button" class="flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer active:scale-95 shadow">
                <i class="fa-solid fa-heart text-xs"></i>
                <span>Like</span>
                (<span id="blog-like-count">${e.likes||0}</span>)
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
          <img src="${e.coverImage||"https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80"}" alt="Cover" class="w-full h-full object-cover" />
        </div>

        <!-- Rendered Rich Text Content -->
        <div class="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
          ${i}
        </div>

        <!-- Tags List -->
        ${e.tags&&e.tags.length>0?`
          <div class="pt-4 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-mono text-slate-500 uppercase font-bold">Tags:</span>
            ${e.tags.map(o=>`
              <span class="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">
                #${o}
              </span>
            `).join("")}
          </div>
        `:""}

        <!-- Interactive Comments & Discussion Section -->
        <section class="pt-8 border-t border-slate-800 space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black text-white font-mono flex items-center gap-2">
              <i class="fa-solid fa-comments text-amber-400"></i>
              <span>Community Comments (${a.length})</span>
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
                <input type="text" id="blog-comment-author" value="${this.currentUser?this.currentUser.username:"player_"+Math.floor(1e3+Math.random()*9e3)}" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-mono outline-none focus:border-amber-500/80 w-36" placeholder="Your name" />
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
            ${a.length===0?`
              <div class="text-center py-6 text-slate-500 text-xs font-mono">
                No comments yet. Be the first to share your thoughts on this story!
              </div>
            `:a.map(o=>`
              <div class="bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
                <div class="flex items-center justify-between text-[10px] font-mono">
                  <span class="font-bold text-amber-300">@${o.username}</span>
                  <div class="flex items-center gap-2">
                    ${o.status==="pending"?`
                      <span class="text-[8px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">Pending Approval</span>
                    `:""}
                    <span class="text-slate-500">${new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed font-sans">${o.text}</p>
              </div>
            `).join("")}
          </div>
        </section>

      </article>
    `,this.bindDetailEvents(e)}bindDetailEvents(t){const e=document.getElementById("blog-back-feed-btn");e&&(e.onclick=()=>{this.currentPostId=null;const d=new URL(window.location.href);d.searchParams.delete("post"),window.history.pushState({},"",d.toString()),this.render()});const a=document.getElementById("blog-like-button");a&&(a.onclick=()=>{t.likes=(t.likes||0)+1;const d=document.getElementById("blog-like-count");d&&(d.textContent=String(t.likes)),this.saveDB(),this.showToast("Thank you for liking this article! ❤️","success")});const i=document.getElementById("blog-share-button");i&&(i.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(window.location.href).then(()=>{this.showToast("Article link copied to clipboard! 📋","success")}).catch(()=>{this.showToast("Link: "+window.location.href,"info")})});const o=document.getElementById("blog-comment-textarea"),r=document.getElementById("blog-comment-author"),s=document.getElementById("comment-char-counter"),n=document.getElementById("comment-validation-msg"),l=document.getElementById("blog-submit-comment");o&&s&&(o.oninput=()=>{s.textContent=`${o.value.length} / 500`,n&&n.classList.add("hidden")}),l&&o&&r&&(l.onclick=()=>{const d=o.value.trim(),b=r.value.trim()||"Guest";if(d.length<3){n&&(n.textContent="Comment must contain at least 3 characters.",n.classList.remove("hidden"));return}const h={id:"cm-"+Date.now(),blogId:t.id,username:b,text:d,createdAt:new Date().toISOString(),status:"approved"};this.db.blogComments||(this.db.blogComments=[]),this.db.blogComments.unshift(h),this.saveDB(),this.showToast("Your comment has been posted! 💬","success"),this.render()})}}const p=new x;document.readyState==="loading"?window.addEventListener("DOMContentLoaded",()=>p.init()):p.init();
