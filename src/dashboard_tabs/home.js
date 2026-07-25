/**
 * Lottery Winner - Pools / Home Tab Module (home.js)
 * 
 * Manages category filters, check-in rewards timers, and
 * active lottery pool interface card renderings.
 */

import { HomeExtensions } from "./home_extensions.js";

export class HomeTab {
  static init(appInstance) {
    console.log("Home Tab Module initialized securely.");
    HomeExtensions.init(appInstance);
  }

  static render(appInstance) {
    appInstance.updateNotificationBanner();
    const listEl = document.getElementById("pools-list-container");
    if (!listEl) return;
    listEl.innerHTML = "";

    // Dynamically render dynamic Home Category Filter Tabs
    const tabsCont = document.getElementById("home-category-tabs");
    if (tabsCont) {
      tabsCont.innerHTML = "";
      
      // All Pools button
      const allBtn = document.createElement("button");
      allBtn.setAttribute("data-category", "all");
      if (appInstance.currentHomeCategory === "all") {
        allBtn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border-0 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/15 cursor-pointer transition active:scale-95";
      } else {
        allBtn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition active:scale-95 shadow-md";
      }
      allBtn.innerHTML = "🎯 All Pools";
      tabsCont.appendChild(allBtn);

      // Category buttons dynamically mapped
      appInstance.db.categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.setAttribute("data-category", cat.name);
        
        const isActive = (appInstance.currentHomeCategory === cat.name);
        if (isActive) {
          if (cat.type === "multi") {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border-0 bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/15 cursor-pointer transition active:scale-95";
          } else {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border-0 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/15 cursor-pointer transition active:scale-95";
          }
        } else {
          if (cat.type === "multi") {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-900/30 bg-slate-900 text-emerald-400 hover:text-emerald-300 cursor-pointer transition active:scale-95 shadow-md";
          } else {
            btn.className = "home-cat-tab-btn shrink-0 text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition active:scale-95 shadow-md";
          }
        }
        btn.innerHTML = cat.label;
        tabsCont.appendChild(btn);
      });

      // Bind category buttons inside render so they work dynamically
      const catButtons = tabsCont.querySelectorAll(".home-cat-tab-btn");
      catButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
          const cat = e.currentTarget.getAttribute("data-category");
          appInstance.currentHomeCategory = cat;
          appInstance.render();
        });
      });
    }

    // Clear any previous quick-draw interval to avoid multiple triggers leaking memory
    if (appInstance.quickDrawInterval) {
      clearInterval(appInstance.quickDrawInterval);
      appInstance.quickDrawInterval = null;
    }

    // ================= VIEW SWITCHES: SYNDICATE =================
    if (appInstance.currentHomeCategory === "Syndicate") {
      listEl.innerHTML = `
        <div class="space-y-6">
          <!-- Intro Banner -->
          <div class="bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div class="space-y-2">
              <span class="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20">👥 Syndicate Play</span>
              <h2 class="text-lg font-black text-white">গ্রুপ লটারি (Syndicate Mode)</h2>
              <p class="text-xs text-slate-300 leading-relaxed">
                ২ বা ৩ জন বন্ধু মিলে টাকা পুল (Pool) করে একসাথে একটি বড় টিকিট কিনুন! জিতলে পুরস্কারের টাকা সবার মাঝে সমানভাবে ভাগ হয়ে যাবে। এভাবে জয়ের সম্ভাবনাও বাড়বে এবং টিকিট কেনার খরচও ভাগ হয়ে যাবে!
              </p>
            </div>
          </div>

          <!-- Quick Action Panels: Create & Join -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Create Syndicate Panel -->
            <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-500 font-bold">1</div>
                <h3 class="text-sm font-bold text-white">গ্রুপ লটারি তৈরি করুন</h3>
              </div>

              <div class="space-y-3">
                <!-- Group Name -->
                <div>
                  <label class="text-[10px] font-mono text-slate-400 block mb-1">গ্রুপের নাম (Custom Name)</label>
                  <input type="text" id="syn-create-name" placeholder="যেমন: ঢাকা লাকি বয়েজ" class="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-red-500" />
                </div>

                <!-- Lottery Selection -->
                <div>
                  <label class="text-[10px] font-mono text-slate-400 block mb-1">লটারি সিলেক্ট করুন (Target Draw)</label>
                  <select id="syn-create-lottery" class="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-red-500">
                    ${appInstance.db.lotteries.filter(l => l.category !== "Quick Draw" && l.status === "active").map(l => `
                      <option value="${l.id}">${l.name} (৳${l.entryFee || 0} Entry, Prize: ৳${l.prizeAmount || l.prizePool || 0})</option>
                    `).join("")}
                  </select>
                </div>

                <!-- Group Size -->
                <div>
                  <label class="text-[10px] font-mono text-slate-400 block mb-1">গ্রুপ মেম্বার সাইজ (Total Seats)</label>
                  <select id="syn-create-size" class="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-red-500">
                    <option value="2">২ জন বন্ধু (৫%-৫০% খরচ ভাগ)</option>
                    <option value="3" selected>৩ জন বন্ধু (৩৩.৩% খরচ ভাগ)</option>
                  </select>
                </div>

                <button id="syn-btn-create" class="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black py-2.5 rounded-xl transition hover:opacity-95 active:scale-97">
                  Create Group & Pay Share 🚀
                </button>
              </div>
            </div>

            <!-- Join Syndicate Panel -->
            <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
              <div class="space-y-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">2</div>
                  <h3 class="text-sm font-bold text-white">কোড দিয়ে গ্রুপে জয়েন করুন</h3>
                </div>

                <div class="space-y-3">
                  <div>
                    <label class="text-[10px] font-mono text-slate-400 block mb-1">গ্রুপ লটারি কোড (Syndicate Code)</label>
                    <input type="text" id="syn-join-code" placeholder="যেমন: SYN-ABCD" class="w-full text-xs text-center text-white font-mono bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 outline-none focus:border-cyan-500 placeholder-slate-700" />
                  </div>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    বন্ধুর শেয়ার করা ৪-ডিজিটের ইউনিক সিন্ডিকেট কোডটি এখানে দিন এবং আপনার অংশ পেমেন্ট করে গ্রুপ টিকেট অ্যাক্টিভ করুন।
                  </p>
                </div>
              </div>

              <button id="syn-btn-join" class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-black py-2.5 rounded-xl transition hover:opacity-95 active:scale-97 mt-4">
                Join Group & Pay Share 👥
              </button>
            </div>
          </div>

          <!-- Lobby & My Syndicates Tabs -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>👥 একটিভ সিন্ডিকেট লবি (Active Lobby)</span>
              <span class="bg-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded-full font-mono font-normal">
                ${(appInstance.db.syndicates || []).filter(s => s.status === 'pending').length} open
              </span>
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Render pending lobby items -->
              ${(appInstance.db.syndicates || []).filter(s => s.status === 'pending').map(s => {
                const targetLottery = appInstance.db.lotteries.find(l => l.id === s.lotteryId);
                const percentFilled = Math.round((s.joinedUserIds.length / s.size) * 100);
                const isMember = s.joinedUserIds.includes(appInstance.currentUser?.id);

                return `
                  <div class="bg-slate-900 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl space-y-3 relative overflow-hidden transition">
                    <div class="flex justify-between items-start gap-2">
                      <div>
                        <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>${s.name}</span>
                          <span class="bg-slate-800 text-cyan-400 text-[9px] font-mono px-1.5 py-0.5 rounded">
                            ${s.code}
                          </span>
                        </h4>
                        <p class="text-[10px] text-slate-500 mt-1">Draw: ${targetLottery ? targetLottery.name : 'Unknown'}</p>
                      </div>
                      <div class="text-right">
                        <span class="text-[9px] text-slate-500 block">Your Share Fee</span>
                        <strong class="text-xs text-white font-mono block">৳${s.entryFeeShare}</strong>
                      </div>
                    </div>

                    <!-- Progress bar -->
                    <div class="space-y-1">
                      <div class="flex justify-between text-[9px] font-mono text-slate-400">
                        <span>Members (${s.joinedUserIds.length}/${s.size})</span>
                        <span>${percentFilled}% Filled</span>
                      </div>
                      <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500" style="width: ${percentFilled}%"></div>
                      </div>
                    </div>

                    <!-- Joined users list -->
                    <div class="flex flex-wrap gap-1 items-center pt-1 text-[10px] text-slate-400">
                      <span class="text-[9px] text-slate-500">Joined:</span>
                      ${s.joinedUsernames.map(name => `
                        <span class="bg-slate-950 text-slate-300 px-2 py-0.5 rounded-full border border-slate-800/60 font-mono text-[9px]">
                          @${name}
                        </span>
                      `).join("")}
                    </div>

                    <div class="pt-2 border-t border-slate-950 flex justify-between items-center">
                      <button class="syn-copy-btn text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 transition" data-code="${s.code}">
                        <i class="fa-regular fa-copy"></i> Copy Code
                      </button>
                      ${isMember ? `
                        <span class="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/40">
                          Joined ✔
                        </span>
                      ` : `
                        <button class="syn-join-action-btn bg-cyan-600 hover:scale-103 text-white text-[10px] font-black py-1.5 px-3 rounded-lg shadow transition active:opacity-90" data-id="${s.id}">
                          Join group & pay ৳${s.entryFeeShare}
                        </button>
                      `}
                    </div>
                  </div>
                `;
              }).join("")}

              ${(appInstance.db.syndicates || []).filter(s => s.status === 'pending').length === 0 ? `
                <div class="col-span-1 md:col-span-2 bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl text-center">
                  <p class="text-xs text-slate-500 font-mono">No pending syndicates in lobby. Create the first one above! 👥</p>
                </div>
              ` : ""}
            </div>
          </div>

          <!-- My Syndicates History -->
          <div class="space-y-4 pt-2">
            <h3 class="text-sm font-bold text-white">🎫 আমার সিন্ডিকেট হিস্ট্রি (My Syndicates)</h3>
            <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                    <th class="p-3 text-[10px] uppercase">Group Details</th>
                    <th class="p-3 text-[10px] uppercase">Target Draw</th>
                    <th class="p-3 text-[10px] uppercase">Status</th>
                    <th class="p-3 text-[10px] uppercase text-right">Result</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  ${(appInstance.db.syndicates || []).filter(s => s.joinedUserIds.includes(appInstance.currentUser?.id)).map(s => {
                    const targetLottery = appInstance.db.lotteries.find(l => l.id === s.lotteryId);
                    let statusLabel = "";
                    let resultLabel = "";

                    if (s.status === "pending") {
                      statusLabel = `<span class="bg-amber-950 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded text-[9px]">Waiting (${s.joinedUserIds.length}/${s.size})</span>`;
                      resultLabel = `<span class="text-slate-500">Pending Code: ${s.code}</span>`;
                    } else if (s.status === "active") {
                      statusLabel = `<span class="bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded text-[9px]">Active (Fully Funded)</span>`;
                      resultLabel = `<span class="text-cyan-400 font-mono">${s.ticketCode || 'Issued'}</span>`;
                    } else if (s.status === "drawn") {
                      statusLabel = `<span class="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[9px]">Drawn</span>`;
                      // Find if this group ticket won
                      const winningTicket = appInstance.db.tickets.find(t => t.lotteryId === s.lotteryId && t.isSyndicate && t.syndicateId === s.id);
                      if (winningTicket && winningTicket.status === "won") {
                        const winAmt = winningTicket.prizeAmount || 0;
                        const splitAmt = Math.round((winAmt / s.size) * 100) / 100;
                        resultLabel = `<span class="text-emerald-400 font-bold">+৳${splitAmt} Split Won! 🎉</span>`;
                      } else {
                        resultLabel = `<span class="text-slate-500">Lost 😢</span>`;
                      }
                    } else {
                      // Fallback status drawn if lottery is drawn
                      if (targetLottery && targetLottery.status === "drawn") {
                        statusLabel = `<span class="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[9px]">Drawn</span>`;
                        const winningTicket = appInstance.db.tickets.find(t => t.lotteryId === s.lotteryId && t.isSyndicate && t.syndicateId === s.id);
                        if (winningTicket && winningTicket.status === "won") {
                          const winAmt = winningTicket.prizeAmount || 0;
                          const splitAmt = Math.round((winAmt / s.size) * 100) / 100;
                          resultLabel = `<span class="text-emerald-400 font-bold">+৳${splitAmt} Split Won! 🎉</span>`;
                        } else {
                          resultLabel = `<span class="text-slate-500">Lost 😢</span>`;
                        }
                      } else {
                        statusLabel = `<span class="bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded text-[9px]">Active Ticket</span>`;
                        resultLabel = `<span class="text-slate-300 font-mono">${s.ticketCode || 'Issued'}</span>`;
                      }
                    }

                    return `
                      <tr class="hover:bg-slate-950/40 transition">
                        <td class="p-3">
                          <strong class="text-white block">${s.name}</strong>
                          <span class="text-[10px] text-slate-500">Created: ${new Date(s.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td class="p-3">
                          <span class="text-slate-300 font-medium block">${targetLottery ? targetLottery.name : 'Unknown Lottery'}</span>
                        </td>
                        <td class="p-3">${statusLabel}</td>
                        <td class="p-3 text-right font-mono font-bold">${resultLabel}</td>
                      </tr>
                    `;
                  }).join("")}

                  ${(appInstance.db.syndicates || []).filter(s => s.joinedUserIds.includes(appInstance.currentUser?.id)).length === 0 ? `
                    <tr>
                      <td colspan="4" class="p-8 text-center text-slate-500 font-mono text-xs">
                        You have not joined any group syndicates yet. Create or join one above!
                      </td>
                    </tr>
                  ` : ""}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      // Event Listeners: Create Syndicate
      const btnCreate = document.getElementById("syn-btn-create");
      if (btnCreate) {
        btnCreate.addEventListener("click", () => {
          const nameInput = document.getElementById("syn-create-name");
          const lotSelect = document.getElementById("syn-create-lottery");
          const sizeSelect = document.getElementById("syn-create-size");

          if (!lotSelect || !sizeSelect) return;
          const lotId = lotSelect.value;
          const size = parseInt(sizeSelect.value);
          const name = nameInput ? nameInput.value.trim() : "";

          appInstance.createSyndicate(lotId, size, name);
        });
      }

      // Event Listeners: Join Syndicate via Code input
      const btnJoin = document.getElementById("syn-btn-join");
      if (btnJoin) {
        btnJoin.addEventListener("click", () => {
          const codeInput = document.getElementById("syn-join-code");
          if (!codeInput) return;
          const code = codeInput.value.trim();
          if (!code) {
            appInstance.showToast("Please enter a syndicate group code!", "error");
            return;
          }
          appInstance.joinSyndicateByCode(code);
        });
      }

      // Event Listeners: Copy Buttons
      document.querySelectorAll(".syn-copy-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const code = e.currentTarget.getAttribute("data-code");
          navigator.clipboard.writeText(code).then(() => {
            appInstance.showToast(`Code ${code} copied to clipboard! Share with friends!`, "success");
          });
        });
      });

      // Event Listeners: Lobby Join Buttons
      document.querySelectorAll(".syn-join-action-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const synId = e.currentTarget.getAttribute("data-id");
          appInstance.joinSyndicateById(synId);
        });
      });

      return;
    }

    // ================= VIEW SWITCHES: QUICK DRAW =================
    if (appInstance.currentHomeCategory === "Quick Draw") {
      const activeQuick = appInstance.db.lotteries.find(l => l.category === "Quick Draw" && l.status === "active");
      
      if (!activeQuick) {
        // Spawn active Quick Draw on the fly if none is found to preserve immediate full-functionality!
        listEl.innerHTML = `
          <div class="bg-slate-900/50 border border-slate-800/80 p-12 rounded-3xl text-center space-y-4">
            <div class="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-xs text-slate-500 font-mono">Spawning next high-speed Quick Draw pool live...</p>
          </div>
        `;
        appInstance.checkAndExecuteAutoDraws(); // Triggers spawning
        return;
      }

      const progress = Math.min(100, Math.round((activeQuick.soldTickets / activeQuick.totalTickets) * 100));
      const myTickets = appInstance.db.tickets.filter(t => t.lotteryId === activeQuick.id && t.userId === appInstance.currentUser?.id && t.status === "pending");

      // Render completed high frequency past quick draws
      const pastQuickDraws = appInstance.db.lotteries.filter(l => l.category === "Quick Draw" && l.status === "drawn")
        .sort((a,b) => new Date(b.drawTime).getTime() - new Date(a.drawTime).getTime())
        .slice(0, 8);

      listEl.innerHTML = `
        <div class="space-y-6">
          <!-- Main Countdown Active Arena -->
          <div class="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950/40 border border-red-500/20 p-6 rounded-3xl relative overflow-hidden text-center space-y-6 shadow-2xl">
            <div class="absolute -left-16 -top-16 w-48 h-48 bg-red-600/5 rounded-full blur-3xl"></div>
            
            <div class="space-y-1.5">
              <span class="bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/20">
                ⚡ কুইক লটারি (1-Minute High Frequency)
              </span>
              <h2 class="text-lg font-black text-white mt-2">${activeQuick.name}</h2>
              <p class="text-xs text-slate-400 max-w-md mx-auto">
                অটোমেটিক ড্র হবে প্রতি ১ মিনিট পর পর। যারা ইনস্ট্যান্ট রেজাল্ট পছন্দ করে তাদের জন্য সুপারফাস্ট স্পিড গেম!
              </p>
            </div>

            <!-- Huge Live Timer Countdown Widget -->
            <div class="bg-slate-950 border border-slate-800/80 max-w-xs mx-auto py-5 px-6 rounded-3xl shadow-inner relative overflow-hidden">
              <div class="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Time Remaining until Draw</div>
              <div id="quick-draw-countdown" class="text-3xl font-black text-red-500 tracking-tight font-mono">
                ⚡ Calculating...
              </div>
            </div>

            <!-- Key metrics row -->
            <div class="max-w-xs mx-auto text-center">
              <div class="bg-slate-950/50 py-3 px-5 rounded-2xl border border-slate-900/80 inline-block">
                <span class="text-[10px] text-slate-500 font-mono block mb-1">Ticket Cost</span>
                <strong class="text-sm text-red-400 font-mono">৳${activeQuick.entryFee} Taka</strong>
              </div>
            </div>

            <!-- Purchase & Personal Tickets container -->
            <div class="space-y-3 pt-2">
              <button id="quick-buy-btn" class="w-full max-w-sm bg-gradient-to-r from-red-600 to-rose-600 hover:scale-102 hover:shadow-lg hover:shadow-red-500/10 text-white text-xs font-black py-3 rounded-2xl transition active:scale-97">
                🎟️ Buy ticket for ৳${activeQuick.entryFee} Taka
              </button>

              <!-- My purchased ticket indicators -->
              <div class="space-y-2">
                <span class="text-[10px] font-mono text-slate-500 block">আপনার টিকেটসমূহ (This Draw):</span>
                <div class="flex flex-wrap justify-center gap-1.5">
                  ${myTickets.map(t => `
                    <span class="bg-red-950/40 text-red-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-red-800/40">
                      🎟️ ${t.code}
                    </span>
                  `).join("")}
                  ${myTickets.length === 0 ? `
                    <span class="text-[10px] text-slate-600 italic">কোনো টিকেট কেনা হয়নি</span>
                  ` : ""}
                </div>
              </div>
            </div>
          </div>

          <!-- Live Feed of Past Quick Draw Winners -->
          <div class="space-y-3">
            <h3 class="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">🏆 কুইক লটারি ফলাফল ফিড (Draw Results Feed)</h3>
            <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div class="divide-y divide-slate-800/60">
                ${pastQuickDraws.map(l => {
                  const drawTicket = appInstance.db.tickets.find(t => t.lotteryId === l.id && t.status === "won");
                  let winnerName = "No active tickets sold";
                  let winnerCode = "N/A";
                  if (drawTicket) {
                    const u = appInstance.db.users.find(usr => usr.id === drawTicket.userId);
                    winnerName = u ? `@${u.username}` : "Anonymous";
                    winnerCode = drawTicket.code;
                  }

                  return `
                    <div class="flex justify-between items-center p-3.5 hover:bg-slate-950/30 transition text-xs">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-500">
                          <i class="fa-solid fa-bolt text-xs"></i>
                        </div>
                        <div>
                          <strong class="text-white block">${l.name.split('(')[0]}</strong>
                          <span class="text-[10px] text-slate-500">${new Date(l.drawTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="flex items-center gap-1.5 justify-end">
                          <span class="bg-emerald-950 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-800/30">
                            ${winnerName}
                          </span>
                          <span class="text-slate-400 font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">
                            ${winnerCode}
                          </span>
                        </div>
                        <span class="text-emerald-400 font-mono font-bold text-xs mt-1 block">৳${l.prizeAmount || l.prizePool || 0} Prize</span>
                      </div>
                    </div>
                  `;
                }).join("")}

                ${pastQuickDraws.length === 0 ? `
                  <div class="p-8 text-center text-slate-500 font-mono text-xs">
                    Completed instant draw records will appear here as soon as they draw!
                  </div>
                ` : ""}
              </div>
            </div>
          </div>
        </div>
      `;

      // Set up the dynamic countdown timer loop inside HomeTab context
      const updateTimer = () => {
        const timerEl = document.getElementById("quick-draw-countdown");
        if (!timerEl) {
          clearInterval(appInstance.quickDrawInterval);
          appInstance.quickDrawInterval = null;
          return;
        }
        const now = Date.now();
        const drawTime = new Date(activeQuick.drawTime).getTime();
        const diff = drawTime - now;

        if (diff <= 0) {
          timerEl.innerText = "DRAWING NOW... ⏳";
          clearInterval(appInstance.quickDrawInterval);
          appInstance.quickDrawInterval = null;
          
          // Execute drawing block immediately to update live local storage & state
          setTimeout(() => {
            appInstance.checkAndExecuteAutoDraws();
          }, 600);
        } else {
          const totalSeconds = Math.ceil(diff / 1000);
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          timerEl.innerText = `⏱ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
      };

      updateTimer();
      appInstance.quickDrawInterval = setInterval(updateTimer, 1000);

      // Buy Ticket Button event binder
      const buyBtn = document.getElementById("quick-buy-btn");
      if (buyBtn) {
        buyBtn.addEventListener("click", () => {
          appInstance.purchaseTicket(activeQuick.id);
        });
      }

      return;
    }

    // ================= FALLBACK STANDARD LOTTERY RENDERING =================
    const isAll = (appInstance.currentHomeCategory === "all");
    const filteredLotteries = appInstance.db.lotteries.filter(lot => {
      // Exclude high frequency Quick Draws from appearing in the main standard list to keep layout focused
      if (lot.category === "Quick Draw") return false;
      if (isAll) return true;
      return lot.category === appInstance.currentHomeCategory;
    });

    if (filteredLotteries.length === 0) {
      listEl.innerHTML = `
        <div class="bg-slate-900/50 border border-slate-800/80 p-8 rounded-3xl text-center space-y-2 mt-2">
          <p class="text-xs text-slate-500 font-mono">No active draw pools in this category right now.</p>
        </div>
      `;
      return;
    }

    filteredLotteries.forEach(lot => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 p-5 rounded-3xl relative overflow-hidden space-y-4 shadow-xl cursor-pointer hover:border-cyan-500/20 transition-all duration-300";

      const badgeColor = lot.category.includes("10") ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" :
                         lot.category.includes("20") ? "bg-cyan-950 text-cyan-400 border border-cyan-800/40" :
                         "bg-rose-950 text-rose-400 border border-rose-800/40";

      const progress = Math.min(100, Math.round((lot.soldTickets / lot.totalTickets) * 100));
      const cardDrawTime = new Date(lot.drawTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      card.innerHTML = `
        <div class="flex justify-between items-start gap-2">
          <div>
            <span class="text-[9px] uppercase font-bold tracking-widest ${badgeColor} px-2.5 py-0.5 rounded-full">
              ${lot.category}
            </span>
            <h3 class="text-sm font-bold text-white mt-1.5">${lot.name}</h3>
            <p class="text-[11px] text-slate-400 leading-normal mt-1">${lot.details}</p>
          </div>
          <div class="text-right shrink-0">
            <span class="text-xs text-slate-500 font-mono block">Entry Fee</span>
            <span class="text-base font-black text-white font-mono block">৳${lot.entryFee}</span>
          </div>
        </div>

        <!-- Target Draw Date & Time -->
        <div class="flex justify-between items-center text-[10px] text-slate-400 bg-slate-950/40 px-3 py-2 rounded-xl font-mono">
          <div class="flex items-center gap-1.5 text-slate-400">
            <i class="fa-regular fa-clock text-cyan-400"></i>
            <span>Draw Scheduled:</span>
          </div>
          <span class="text-white font-bold">${cardDrawTime}</span>
        </div>

        <!-- Progress of Pools -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Sold Tickets Progress</span>
            <span class="text-cyan-400 font-bold">${progress}% (${lot.soldTickets}/${lot.totalTickets})</span>
          </div>
          <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-cyan-500 to-rose-500" style="width: ${progress}%"></div>
          </div>
        </div>

        <div class="flex justify-between items-center border-t border-slate-800/80 pt-3 text-[11px] font-mono">
          <div class="flex items-center gap-1.5 text-slate-400">
            <i class="fa-solid fa-trophy text-rose-500"></i>
            <span>Prize: <span class="text-white font-bold">৳${lot.prizeAmount || lot.prizePool || 0}</span></span>
          </div>
          <button class="buy-pool-btn bg-gradient-to-r from-red-600 to-rose-600 hover:scale-103 text-white text-[11px] font-black py-2 px-4 rounded-xl shadow-lg transition active:opacity-90" data-id="${lot.id}">
            Buy Ticket
          </button>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest(".buy-pool-btn")) return;
        appInstance.openLotteryDetailsPop(lot.id);
      });

      listEl.appendChild(card);
    });

    document.querySelectorAll(".buy-pool-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.target.getAttribute("data-id");
        appInstance.purchaseTicket(id);
      });
    });

    // Render Home Pools Tab extensions
    HomeExtensions.render(appInstance);
  }
}
