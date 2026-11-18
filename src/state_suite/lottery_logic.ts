import { removeCircularReferences, safeStringify } from "./utils";
import { LiveDrawRevealEngine } from "../js/liveDrawRevealEngine.js";
import { ThreeLotteryDrawScene } from "../components/ThreeLotteryDrawScene.js";

export interface LotteryModule {
  db: any;
  currentUser: any;
  isAdminMode: boolean;
  sessionKey: string;
  detailsModalInterval?: any;
  activeThreeScene?: any;
  saveDB: () => void;
  render: () => void;
  addInboxNotice: (uid: string, sub: string, cont: string) => void;
  showToast: (msg: string, type?: string) => void;
  navigateTo: (tab: string) => void;
  updateAllWalletBalanceUI: () => void;
  purchaseTicket?: (lotId: string) => void;
  checkAndExecuteAutoDraws?: () => void;
}

export function checkAndExecuteAutoDraws(state: LotteryModule) {
  const now = Date.now();
  let dbUpdated = false;

  state.db.lotteries.forEach((lot: any) => {
    if (lot.status === "active" && lot.drawMode === "auto") {
      const drawTime = new Date(lot.drawTime).getTime();
      if (now >= drawTime) {
        const ticketsOfPool = state.db.tickets.filter((t: any) => t.lotteryId === lot.id && (t.status === "pending" || t.status === "active" || !t.status));

        if (ticketsOfPool.length > 0) {
          if (lot.category !== "Quick Draw" && ticketsOfPool.length < lot.totalTickets) {
            // REFUND
            ticketsOfPool.forEach((t: any) => {
              t.status = "refunded";
              t.refundDate = new Date().toISOString();
              const u = state.db.users.find((usr: any) => usr.id === t.userId);
              if (u) {
                u.balance += lot.entryFee;
                u.profit = (u.profit || 0) + lot.entryFee;
                u.loss = (u.loss || 0) - lot.entryFee;

                state.addInboxNotice(u.id, "🎟️ লটারি বাতিল ও রিফান্ড নোটিশ! (Refund Alert)", 
                  `দুঃখিত, '${lot.name}' লটারির মোট ${lot.totalTickets}টি টিকেটের সব বিক্রি না হওয়ায় ড্র সম্পন্ন করা যায়নি। আপনার ক্রয়কৃত টিকেটের মূল্য ৳${lot.entryFee} আপনার ওয়ালেটে রিফান্ড করা হয়েছে।`
                );

                if (state.currentUser && u.id === state.currentUser.id) {
                  state.currentUser.balance = u.balance;
                  state.currentUser.profit = u.profit;
                  state.currentUser.loss = u.loss;
                  localStorage.setItem(state.sessionKey, safeStringify(removeCircularReferences(state.currentUser)));
                }
              }
            });
            lot.status = "refunded";
            dbUpdated = true;
          }
        }
      }
    }
  });

  if (dbUpdated) {
    state.saveDB();
    state.render();
  }
}

export function openLotteryDetailsPop(state: any, lotteryId: string) {
  if (!state.db || !state.db.lotteries) return;
  const lot = state.db.lotteries.find((l: any) => l.id === lotteryId);
  if (!lot) {
    if (typeof state.showToast === "function") {
      state.showToast("লটারি পুল পাওয়া যায়নি!", "error");
    }
    return;
  }

  let modal = document.getElementById("lottery-details-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "lottery-details-modal";
    modal.className = "hidden fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto font-mono text-xs";
    modal.innerHTML = `
      <div class="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative my-auto">
        <button id="close-lottery-details-btn" class="absolute top-4 right-4 text-slate-400 hover:text-white text-base cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
        
        <div class="space-y-3">
          <span id="detail-lot-category" class="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40 inline-block">Category</span>
          <h4 id="detail-lot-name" class="text-sm font-black text-white leading-tight">Lottery Name</h4>
          <p id="detail-lot-desc" class="text-[11px] text-slate-400 leading-normal">Details and description text</p>
        </div>

        <div class="h-px bg-slate-800/80"></div>

        <div class="grid grid-cols-2 gap-3 font-mono text-xs">
          <div class="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/40">
            <span class="text-slate-500 text-[10px] block uppercase leading-tight">Ticket Fee</span>
            <strong class="text-white text-sm block mt-0.5" id="detail-lot-fee">৳0</strong>
          </div>
          <div class="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/40">
            <span class="text-slate-500 text-[10px] block uppercase leading-tight">Prize Fund</span>
            <strong class="text-emerald-400 text-sm block mt-0.5" id="detail-lot-prize">৳0</strong>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Draw Scheduled Countdown:</span>
            <span id="detail-lot-countdown" class="text-cyan-400 font-bold">--:--:--</span>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Target Draw Date & Time:</span>
            <span id="detail-lot-target-time" class="text-white font-bold">---</span>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Ticket Sales Progress:</span>
            <span id="detail-lot-sales" class="text-white">0 / 0</span>
          </div>
          <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div id="detail-lot-progress-bar" class="h-full bg-gradient-to-r from-cyan-500 to-rose-500" style="width: 0%"></div>
          </div>
        </div>

        <div class="pt-2">
          <button id="detail-lot-buy-btn" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.02] text-white font-black py-3 rounded-xl shadow-lg transition active:opacity-90 cursor-pointer">
            Secure Buy Ticket Now
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Populate data
  const catEl = document.getElementById("detail-lot-category");
  if (catEl) catEl.innerText = lot.category || "General Pool";

  const nameEl = document.getElementById("detail-lot-name");
  if (nameEl) nameEl.innerText = lot.name || "Lottery Draw";

  const descEl = document.getElementById("detail-lot-desc");
  if (descEl) descEl.innerText = lot.description || "অংশগ্রহণ করুন এবং জিতে নিন আকর্ষণীয় পুরস্কার! প্রতিটি ড্র সম্পূর্ণ সুরক্ষিত ও নির্ভরযোগ্য।";

  const feeEl = document.getElementById("detail-lot-fee");
  if (feeEl) feeEl.innerText = `৳${(lot.entryFee || 10).toLocaleString()}`;

  const prizeVal = lot.prizeAmount ?? lot.prizePool ?? 0;
  const prizeEl = document.getElementById("detail-lot-prize");
  if (prizeEl) prizeEl.innerText = `৳${(Number(prizeVal) || 0).toLocaleString()}`;

  const targetTimeEl = document.getElementById("detail-lot-target-time");
  if (targetTimeEl) targetTimeEl.innerText = lot.drawTime ? new Date(lot.drawTime).toLocaleString() : "Upon Completion";

  const updateProgressAndSales = () => {
    const currentLot = state.db.lotteries.find((l: any) => l.id === lot.id) || lot;
    const sold = currentLot.soldTickets || 0;
    const total = currentLot.totalTickets || 100;
    const pct = Math.min(100, Math.round((sold / total) * 100));

    const salesEl = document.getElementById("detail-lot-sales");
    if (salesEl) salesEl.innerText = `${sold} / ${total} (${pct}%)`;

    const progBar = document.getElementById("detail-lot-progress-bar");
    if (progBar) (progBar as HTMLElement).style.width = `${pct}%`;

    const buyBtn = document.getElementById("detail-lot-buy-btn") as HTMLButtonElement;
    if (buyBtn) {
      const isFull = sold >= total;
      const isDrawn = currentLot.status === "drawn" || currentLot.status === "completed";
      if (isDrawn) {
        buyBtn.disabled = true;
        buyBtn.innerText = "ড্র সম্পন্ন হয়েছে (Completed)";
        buyBtn.className = "w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-xl cursor-not-allowed";
      } else if (isFull) {
        buyBtn.disabled = true;
        buyBtn.innerText = "টিকেট শেষ (Sold Out)";
        buyBtn.className = "w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-xl cursor-not-allowed";
      } else {
        buyBtn.disabled = false;
        buyBtn.innerHTML = `Secure Buy Ticket Now (৳${lot.entryFee || 10})`;
        buyBtn.className = "w-full bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.02] text-white font-black py-3 rounded-xl shadow-lg transition active:opacity-90 cursor-pointer";
        buyBtn.onclick = (e) => {
          e.stopPropagation();
          state.purchaseTicket(lot.id);
          updateProgressAndSales();
        };
      }
    }
  };

  updateProgressAndSales();

  // Countdown timer logic
  if (state.detailsModalInterval) {
    clearInterval(state.detailsModalInterval);
    state.detailsModalInterval = null;
  }

  const updateCountdown = () => {
    const countdownEl = document.getElementById("detail-lot-countdown");
    if (!countdownEl) return;
    if (!lot.drawTime) {
      countdownEl.innerText = "Available";
      return;
    }
    const diff = new Date(lot.drawTime).getTime() - Date.now();
    if (diff <= 0) {
      countdownEl.innerText = "সময় শেষ (ড্র চলছে)";
      countdownEl.className = "text-red-400 font-bold animate-pulse";
    } else {
      const sec = Math.ceil(diff / 1000);
      const hours = Math.floor(sec / 3600);
      const mins = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      countdownEl.innerText = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      countdownEl.className = "text-cyan-400 font-bold";
    }
  };

  updateCountdown();
  state.detailsModalInterval = setInterval(updateCountdown, 1000);

  // Close handlers
  const closeModal = () => {
    modal?.classList.add("hidden");
    if (state.detailsModalInterval) {
      clearInterval(state.detailsModalInterval);
      state.detailsModalInterval = null;
    }
  };

  const closeBtn = document.getElementById("close-lottery-details-btn");
  if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); closeModal(); };
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Show modal
  modal.classList.remove("hidden");
}

export function purchaseTicket(state: any, lotteryId: string) {
  if (!state.currentUser) {
    state.showToast("অনুগ্রহ করে টিকেট কিনতে লগইন করুন! (Please Login)", "error");
    return;
  }
  if (!state.db || !state.db.lotteries) return;

  const lot = state.db.lotteries.find((l: any) => l.id === lotteryId);
  if (!lot) {
    state.showToast("লটারি পুল পাওয়া যায়নি!", "error");
    return;
  }

  if (lot.status !== "active") {
    state.showToast("এই ড্র সমাপ্ত হয়েছে!", "error");
    return;
  }

  const total = lot.totalTickets || 100;
  const sold = lot.soldTickets || 0;
  if (sold >= total) {
    state.showToast("সকল টিকেট বিক্রি হয়ে গেছে!", "error");
    return;
  }

  const fee = Number(lot.entryFee) || 10;
  if ((state.currentUser.balance || 0) < fee) {
    state.showToast(`পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজন ৳${fee}। অনুগ্রহ করে ডিপোজিট করুন।`, "error");
    if (typeof state.navigateTo === "function") {
      state.navigateTo("wallet");
    }
    return;
  }

  // Deduct fee and update user statistics
  state.currentUser.balance -= fee;
  state.currentUser.loss = (state.currentUser.loss || 0) + fee;
  state.currentUser.profit = (state.currentUser.profit || 0) - fee;
  lot.soldTickets = sold + 1;

  if (state.db.settings) {
    state.db.settings.jackpotPool = (state.db.settings.jackpotPool || 0) + Math.round(fee * 0.1);
  }

  // Generate unique ticket code
  const randomCode = Math.floor(100000 + Math.random() * 900000);
  const ticketCode = `LW-${randomCode}`;
  const newTicket = {
    id: "t_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    lotteryId: lot.id,
    lotteryName: lot.name,
    userId: state.currentUser.id,
    username: state.currentUser.username,
    code: ticketCode,
    ticketNumber: ticketCode,
    purchaseDate: new Date().toISOString(),
    price: fee,
    entryFee: fee,
    status: "pending"
  };

  if (!state.db.tickets) state.db.tickets = [];
  state.db.tickets.unshift(newTicket);

  if (!state.db.transactions) state.db.transactions = [];
  state.db.transactions.unshift({
    id: "tx_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    userId: state.currentUser.id,
    username: state.currentUser.username,
    type: "ticket_purchase",
    amount: fee,
    description: `লটারি টিকেট ক্রয়: ${lot.name} (${ticketCode})`,
    date: new Date().toISOString(),
    status: "completed"
  });

  state.saveDB();
  if (typeof state.updateAllWalletBalanceUI === "function") {
    state.updateAllWalletBalanceUI();
  }
  state.showToast(`🎉 টিকেট সফলভাবে ক্রয় করা হয়েছে! কোড: ${ticketCode}`, "success");
  state.render();

  // If sold out and auto draw, execute draw
  if (lot.soldTickets >= total && lot.drawMode === "auto") {
    setTimeout(() => {
      if (typeof state.checkAndExecuteAutoDraws === "function") {
        state.checkAndExecuteAutoDraws();
      }
    }, 600);
  }
}

export function openTicketLiveInfoPop(state: any, ticketId: string) {
  if (!state.db || !state.db.tickets) return;
  const ticket = state.db.tickets.find((t: any) => t.id === ticketId || t.code === ticketId || t.ticketNumber === ticketId);
  if (!ticket) {
    state.showToast("টিকেট পাওয়া যায়নি!", "error");
    return;
  }

  const lot = (state.db.lotteries || []).find((l: any) => l.id === ticket.lotteryId) || {
    name: ticket.lotteryName || "লটারি পুল",
    prizeAmount: 0
  };

  let modal = document.getElementById("ticket-info-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "ticket-info-modal";
    modal.className = "hidden fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto font-mono text-xs";
    modal.innerHTML = `
      <div class="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative my-auto">
        <button id="close-ticket-info-btn" class="absolute top-4 right-4 text-slate-400 hover:text-white text-base cursor-pointer"><i class="fa-solid fa-xmark"></i></button>

        <div class="text-center space-y-2">
          <div class="w-12 h-12 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-full flex items-center justify-center text-xl mx-auto shadow-inner">
            <i class="fa-solid fa-receipt"></i>
          </div>
          <h4 class="text-sm font-black text-white uppercase tracking-wider">Your Ticket Verification</h4>
          <p class="text-[10px] text-slate-500 leading-none">Security signature code ledger</p>
        </div>

        <div class="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl text-center space-y-1">
          <span class="text-[9px] uppercase tracking-wider text-slate-500 block">Lucky Entry Code</span>
          <span id="popup-ticket-code" class="text-xl font-black text-cyan-400 tracking-widest block font-mono select-all select-text">LW-000000</span>
        </div>

        <div class="space-y-2.5 text-xs text-slate-400">
          <div class="flex justify-between border-b border-slate-800 pb-1.5">
            <span>Lottery Pool:</span>
            <strong id="popup-ticket-lottery" class="text-white">Lottery Draw Name</strong>
          </div>
          <div class="flex justify-between border-b border-slate-800 pb-1.5">
            <span>Registration Date:</span>
            <strong id="popup-ticket-date" class="text-white">2026-06-12</strong>
          </div>
          <div class="flex justify-between border-b border-slate-800 pb-1.5">
            <span>Prize Pool Worth:</span>
            <strong id="popup-ticket-prize" class="text-emerald-400">৳0</strong>
          </div>
          <div class="flex justify-between">
            <span>Draw Status:</span>
            <span id="popup-ticket-status" class="font-bold">Pending</span>
          </div>
        </div>

        <div id="popup-ticket-live-win" class="hidden bg-emerald-950/40 p-3 border border-emerald-500/20 rounded-2xl text-center text-[11px] text-emerald-300">
          🎁 Congratulations! You won <strong class="text-white">৳<span id="popup-ticket-reward-amount">0</span></strong> in this lottery draw! Funds are fully credited.
        </div>
        
        <div id="popup-ticket-live-lost" class="hidden bg-slate-950/60 p-3 border border-slate-800 rounded-2xl text-center text-[11px] text-slate-500">
          Oops! This entry didn't win this time. Keep trying for the next draw!
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Populate data
  const codeEl = document.getElementById("popup-ticket-code");
  if (codeEl) codeEl.innerText = ticket.code || ticket.ticketNumber || "LW-000000";

  const lotEl = document.getElementById("popup-ticket-lottery");
  if (lotEl) lotEl.innerText = lot.name || ticket.lotteryName || "Lottery Draw";

  const dateEl = document.getElementById("popup-ticket-date");
  if (dateEl) dateEl.innerText = ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleString() : "---";

  const prizeVal = lot.prizeAmount ?? lot.prizePool ?? 0;
  const prizeEl = document.getElementById("popup-ticket-prize");
  if (prizeEl) prizeEl.innerText = `৳${(Number(prizeVal) || 0).toLocaleString()}`;

  const statusEl = document.getElementById("popup-ticket-status");
  const winBox = document.getElementById("popup-ticket-live-win");
  const lostBox = document.getElementById("popup-ticket-live-lost");
  const rewardAmt = document.getElementById("popup-ticket-reward-amount");

  if (ticket.status === "won") {
    if (statusEl) { statusEl.innerText = "🏆 বিজয়ী (Won)"; statusEl.className = "text-emerald-400 font-black"; }
    if (winBox) winBox.classList.remove("hidden");
    if (lostBox) lostBox.classList.add("hidden");
    if (rewardAmt) rewardAmt.innerText = (ticket.prizeAmount || 0).toLocaleString();
  } else if (ticket.status === "lost") {
    if (statusEl) { statusEl.innerText = "❌ বিজয়ী হননি (Lost)"; statusEl.className = "text-rose-400 font-bold"; }
    if (winBox) winBox.classList.add("hidden");
    if (lostBox) lostBox.classList.remove("hidden");
  } else if (ticket.status === "refunded") {
    if (statusEl) { statusEl.innerText = "🔄 রিফান্ড (Refunded)"; statusEl.className = "text-amber-400 font-bold"; }
    if (winBox) winBox.classList.add("hidden");
    if (lostBox) lostBox.classList.add("hidden");
  } else {
    if (statusEl) { statusEl.innerText = "⏳ অপেক্ষমাণ (Pending Draw)"; statusEl.className = "text-cyan-400 font-bold animate-pulse"; }
    if (winBox) winBox.classList.add("hidden");
    if (lostBox) lostBox.classList.add("hidden");
  }

  const closeModal = () => modal?.classList.add("hidden");
  const closeBtn = document.getElementById("close-ticket-info-btn");
  if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); closeModal(); };
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  modal.classList.remove("hidden");
}

export function openThreeLotteryDraw(state: any, lotName: string = "Jackpot Live Draw") {
  try {
    let overlay = document.getElementById("three-draw-modal-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "three-draw-modal-overlay";
      overlay.className = "fixed inset-0 z-[99999] bg-slate-950 flex flex-col";
      document.body.appendChild(overlay);
    }
    overlay.classList.remove("hidden");
    if (state.activeThreeScene) {
      try { state.activeThreeScene.destroy(); } catch (e) {}
      state.activeThreeScene = null;
    }
    state.activeThreeScene = new ThreeLotteryDrawScene(overlay, lotName, () => {
      overlay?.classList.add("hidden");
      state.activeThreeScene = null;
    }, false);
  } catch (err) {
    console.error("Three.js 3D draw launch error:", err);
    if (typeof state.showToast === "function") {
      state.showToast("3D ড্র চালু হতে সমস্যা হয়েছে।", "info");
    }
  }
}

export function createSyndicate(state: any, lotId: string, size: number, name: string) {
  if (!state.currentUser) {
    state.showToast("অনুগ্রহ করে প্রথমে লগইন করুন!", "error");
    return;
  }
  const lot = (state.db?.lotteries || []).find((l: any) => l.id === lotId);
  if (!lot) {
    state.showToast("লটারি পুল পাওয়া যায়নি!", "error");
    return;
  }
  const entryFeeShare = Math.max(1, Math.ceil((lot.entryFee || 10) / (size || 2)));
  if ((state.currentUser.balance || 0) < entryFeeShare) {
    state.showToast(`পর্যাপ্ত ব্যালেন্স নেই! শেয়ার ফি ৳${entryFeeShare}`, "error");
    return;
  }
  state.currentUser.balance -= entryFeeShare;
  state.currentUser.loss = (state.currentUser.loss || 0) + entryFeeShare;
  state.currentUser.profit = (state.currentUser.profit || 0) - entryFeeShare;

  if (!state.db.syndicates) state.db.syndicates = [];
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const syn = {
    id: "syn_" + Date.now(),
    name: name || `${state.currentUser.username}'s Syndicate`,
    lotteryId: lotId,
    size: size || 2,
    entryFeeShare: entryFeeShare,
    code: code,
    creatorId: state.currentUser.id,
    joinedUserIds: [state.currentUser.id],
    joinedUsernames: [state.currentUser.username],
    status: (size <= 1) ? "active" : "pending",
    createdAt: new Date().toISOString()
  };
  state.db.syndicates.push(syn);
  state.saveDB();
  if (typeof state.updateAllWalletBalanceUI === "function") {
    state.updateAllWalletBalanceUI();
  }
  state.showToast(`সিন্ডিকেট গ্রুপ তৈরি হয়েছে! কোড: ${code}`, "success");
  state.render();
}

export function joinSyndicateById(state: any, synId: string) {
  if (!state.currentUser) {
    state.showToast("অনুগ্রহ করে প্রথমে লগইন করুন!", "error");
    return;
  }
  if (!state.db.syndicates) state.db.syndicates = [];
  const syn = state.db.syndicates.find((s: any) => s.id === synId);
  if (!syn) {
    state.showToast("সিন্ডিকেট গ্রুপ পাওয়া যায়নি!", "error");
    return;
  }
  if ((syn.joinedUserIds || []).includes(state.currentUser.id)) {
    state.showToast("আপনি ইতিমধ্যেই এই সিন্ডিকেটে যুক্ত আছেন!", "info");
    return;
  }
  if ((syn.joinedUserIds || []).length >= (syn.size || 2)) {
    state.showToast("এই সিন্ডিকেট গ্রুপটি পূর্ণ হয়ে গেছে!", "error");
    return;
  }
  const share = syn.entryFeeShare || 10;
  if ((state.currentUser.balance || 0) < share) {
    state.showToast(`পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজন ৳${share}`, "error");
    return;
  }
  state.currentUser.balance -= share;
  state.currentUser.loss = (state.currentUser.loss || 0) + share;
  state.currentUser.profit = (state.currentUser.profit || 0) - share;
  syn.joinedUserIds.push(state.currentUser.id);
  syn.joinedUsernames.push(state.currentUser.username);

  if (syn.joinedUserIds.length >= syn.size) {
    syn.status = "active";
    syn.ticketCode = "LW-SYN-" + Math.floor(100000 + Math.random() * 900000);
    if (!state.db.tickets) state.db.tickets = [];
    state.db.tickets.push({
      id: "t_syn_" + Date.now(),
      lotteryId: syn.lotteryId,
      isSyndicate: true,
      syndicateId: syn.id,
      syndicateName: syn.name,
      code: syn.ticketCode,
      userId: state.currentUser.id,
      userIds: syn.joinedUserIds,
      purchaseDate: new Date().toISOString(),
      status: "pending"
    });
  }
  state.saveDB();
  if (typeof state.updateAllWalletBalanceUI === "function") {
    state.updateAllWalletBalanceUI();
  }
  state.showToast("সিন্ডিকেট গ্রুপে সফলভাবে যোগদান করেছেন!", "success");
  state.render();
}

export function joinSyndicateByCode(state: any, code: string) {
  if (!code) return;
  if (!state.db.syndicates) state.db.syndicates = [];
  const syn = state.db.syndicates.find((s: any) => s.code?.toUpperCase() === code.trim().toUpperCase());
  if (!syn) {
    state.showToast("ভুল কোড! কোনো সিন্ডিকেট পাওয়া যায়নি।", "error");
    return;
  }
  joinSyndicateById(state, syn.id);
}
