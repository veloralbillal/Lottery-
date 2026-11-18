export const AdminLotteries = {
  setupLotteryPoolListeners(this: any) {
    const app = this;
    const openCreateBtn = document.getElementById("add-new-pool-master-btn");
    const createModal = document.getElementById("admin-create-pool-modal");
    const closeCreateBtn = document.getElementById("admin-close-create-pool-modal");
    const createForm = document.getElementById("admin-pool-creation-form") as HTMLFormElement | null;
    const drawModeSelect = document.getElementById("create-pool-draw-mode") as HTMLSelectElement | null;
    const timerWrap = document.getElementById("create-pool-timer-container");
    const datetimeWrap = document.getElementById("create-pool-datetime-container");
    const catSelect = document.getElementById("create-pool-cat") as HTMLSelectElement | null;
    const multiWrap = document.getElementById("multi-winner-config-container");
    const multiInput = document.getElementById("create-pool-multi-prizes") as HTMLInputElement | null;

    const syncDrawModeUI = () => {
      if (!drawModeSelect) return;
      const mode = drawModeSelect.value;
      if (timerWrap) timerWrap.classList.toggle("hidden", mode !== "auto");
      if (datetimeWrap) datetimeWrap.classList.toggle("hidden", mode !== "auto_datetime");
    };

    const syncCategoryUI = () => {
      if (!catSelect || !multiWrap) return;
      const val = catSelect.value || "";
      const cats = Array.isArray(app.db?.categories) ? app.db.categories : [];
      const matchedCat = cats.find((c: any) => c && (c.name === val || c.id === val));
      const isMulti = (matchedCat && matchedCat.type === "multi") || /winner|multi/i.test(val);
      multiWrap.classList.toggle("hidden", !isMulti);
      if (isMulti && multiInput && matchedCat?.defaultPrizes && !multiInput.value.trim()) {
        multiInput.value = matchedCat.defaultPrizes;
      }
    };

    const populateCategoryOptions = () => {
      if (!catSelect) return;
      const cats = Array.isArray(app.db?.categories) ? app.db.categories : [];
      if (cats.length > 0) {
        const prev = catSelect.value;
        catSelect.innerHTML = cats
          .map((c: any) => `<option value="${app.escapeHTML ? app.escapeHTML(c.name) : c.name}">${app.escapeHTML ? app.escapeHTML(c.label || c.name) : (c.label || c.name)}</option>`)
          .join("");
        if (prev && cats.some((c: any) => c.name === prev)) {
          catSelect.value = prev;
        }
      }
      syncCategoryUI();
    };

    const closeCreateModal = () => {
      createModal?.classList.add("hidden");
    };

    if (openCreateBtn && !openCreateBtn.dataset.bound) {
      openCreateBtn.dataset.bound = "true";
      openCreateBtn.addEventListener("click", () => {
        populateCategoryOptions();
        syncDrawModeUI();
        createModal?.classList.remove("hidden");
      });
    }

    if (closeCreateBtn && !closeCreateBtn.dataset.bound) {
      closeCreateBtn.dataset.bound = "true";
      closeCreateBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeCreateModal();
      });
    }

    if (createModal && !createModal.dataset.backdropBound) {
      createModal.dataset.backdropBound = "true";
      createModal.addEventListener("click", (e) => {
        if (e.target === createModal) closeCreateModal();
      });
    }

    if (drawModeSelect && !drawModeSelect.dataset.bound) {
      drawModeSelect.dataset.bound = "true";
      drawModeSelect.addEventListener("change", syncDrawModeUI);
    }

    if (catSelect && !catSelect.dataset.bound) {
      catSelect.dataset.bound = "true";
      catSelect.addEventListener("change", () => {
        if (multiInput) multiInput.value = "";
        syncCategoryUI();
      });
    }

    if (createForm && !createForm.dataset.bound) {
      createForm.dataset.bound = "true";
      createForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("admin-submit-pool-btn") as HTMLButtonElement | null;
        const origHtml = submitBtn ? submitBtn.innerHTML : "Build Draw Pool";

        try {
          const title = (document.getElementById("create-pool-title") as HTMLInputElement)?.value.trim() || "";
          const fee = parseFloat((document.getElementById("create-pool-fee") as HTMLInputElement)?.value || "0");
          const prize = parseFloat((document.getElementById("create-pool-prize") as HTMLInputElement)?.value || "0");
          const totalTickets = parseInt((document.getElementById("create-pool-total") as HTMLInputElement)?.value || "0", 10);
          const category = (catSelect?.value || "10 Taka Banner").trim().slice(0, 50);
          const drawMode = drawModeSelect?.value || "manual";
          const drawDurationMin = parseInt((document.getElementById("create-pool-draw-time") as HTMLInputElement)?.value || "10", 10) || 10;
          const drawDatetimeStr = (document.getElementById("create-pool-draw-datetime") as HTMLInputElement)?.value || "";
          const descRaw = (document.getElementById("create-pool-desc") as HTMLTextAreaElement)?.value.trim() || "";

          if (!title) {
            app.showToast("Please enter a Lottery Title!", "error");
            return;
          }
          if (isNaN(fee) || fee <= 0 || isNaN(prize) || prize <= 0 || isNaN(totalTickets) || totalTickets < 1) {
            app.showToast("Ticket price, winner reward, and total tickets must be valid positive numbers!", "error");
            return;
          }

          let drawTimeIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          let drawDuration = 10;
          if (drawMode === "auto") {
            drawDuration = Math.max(1, drawDurationMin);
            drawTimeIso = new Date(Date.now() + drawDuration * 60 * 1000).toISOString();
          } else if (drawMode === "auto_datetime") {
            const parsedDt = drawDatetimeStr ? new Date(drawDatetimeStr) : null;
            if (!parsedDt || isNaN(parsedDt.getTime())) {
              app.showToast("Please select a valid Exact Date & Time for Auto Draw!", "error");
              return;
            }
            drawTimeIso = parsedDt.toISOString();
            drawDuration = Math.max(1, Math.round((parsedDt.getTime() - Date.now()) / 60000));
          }

          let multiWinnerPrizes: number[] | null = null;
          if (multiWrap && !multiWrap.classList.contains("hidden") && multiInput) {
            const parsedPrizes = multiInput.value
              .split(",")
              .map(v => parseFloat(v.trim()))
              .filter(n => !isNaN(n) && n > 0);
            if (parsedPrizes.length > 0) {
              multiWinnerPrizes = parsedPrizes;
            }
          }

          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Saving Pool...`;
          }

          const newPool = {
            id: "lot_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
            name: title.slice(0, 150),
            details: descRaw || `Exclusive ৳${fee} lottery draw pool. Winner takes ৳${prize.toLocaleString()}!`,
            entryFee: fee,
            totalTickets: totalTickets,
            soldTickets: 0,
            category: category,
            drawTime: drawTimeIso,
            status: "active",
            prizeAmount: prize,
            drawMode: drawMode,
            drawDuration: drawDuration,
            multiWinnerPrizes: multiWinnerPrizes
          };

          if (!Array.isArray(app.db.lotteries)) app.db.lotteries = [];
          app.db.lotteries.unshift(newPool);

          const syncOk = await app.saveDB(true);
          createForm.reset();
          closeCreateModal();
          app.renderAdminLotteries();
          if (typeof app.render === "function") app.render();
          if (syncOk === false || app.syncState === "error") {
            app.showToast(`Pool "${newPool.name}" saved locally, but SQL DB sync failed.`, "error");
          } else {
            app.showToast(`Lottery pool "${newPool.name}" created & saved to SQL!`, "success");
          }
        } catch (err: any) {
          console.error("Create lottery pool error:", err);
          app.showToast(`Failed to create pool: ${err?.message || err}`, "error");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origHtml;
          }
        }
      });
    }

    const drawModal = document.getElementById("admin-draw-modal");
    const closeDrawBtn = document.getElementById("admin-close-draw-modal-btn");
    if (closeDrawBtn && !closeDrawBtn.dataset.bound) {
      closeDrawBtn.dataset.bound = "true";
      closeDrawBtn.addEventListener("click", () => drawModal?.classList.add("hidden"));
    }
    if (drawModal && !drawModal.dataset.backdropBound) {
      drawModal.dataset.backdropBound = "true";
      drawModal.addEventListener("click", (e) => {
        if (e.target === drawModal) drawModal.classList.add("hidden");
      });
    }
  },

  renderAdminLotteries(this: any) {
    this.setupLotteryPoolListeners();

    const listEl = document.getElementById("admin-pools-list-container");
    if (!listEl) return;
    listEl.innerHTML = "";

    const lotteriesList = Array.isArray(this.db?.lotteries) ? this.db.lotteries : [];
    if (lotteriesList.length === 0) {
      listEl.innerHTML = `
        <div class="bg-slate-900/70 border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-2">
          <p class="text-xs font-mono text-slate-400">No lottery pools found in database.</p>
          <p class="text-[11px] font-sans text-slate-500">Click <strong class="text-cyan-400">+ Create Pool</strong> above to add a new lottery pool and save it to SQL.</p>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    lotteriesList.forEach((lot: any) => {
      const isCompleted = lot.status === "drawn" || new Date(lot.drawTime) < new Date();
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 p-5 rounded-3xl relative space-y-4 shadow-lg" + (isCompleted ? " opacity-70" : "");

      const badge = lot.status === "drawn" ? `<span class="text-[10px] font-mono py-1 px-3 rounded-full bg-green-950 text-green-300">🏆 DRAW COMPLETED</span>` :
                                             `<span class="text-[10px] font-mono py-1 px-3 rounded-full bg-cyan-950 text-cyan-400">⏳ ACTIVE RUNNING</span>`;

      const drawBtn = lot.status === "active" ? `<button class="admin-manual-draw-trigger bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl transition" data-id="${lot.id}">Force Draw Winner</button>` : "";

      let multiPrizesDetails = "";
      if (lot.multiWinnerPrizes && lot.multiWinnerPrizes.length > 0) {
        multiPrizesDetails = `<div class="bg-slate-950 p-2.5 rounded-2xl border border-slate-850/50 text-[10px] space-y-0.5">
          <span class="text-slate-500 font-sans block text-[9px] uppercase tracking-wider">Multi Rank Prize Distribution Pool:</span>
          ${lot.multiWinnerPrizes.map((p: any, idx: number) => `<div class="flex justify-between font-mono text-slate-300"><span>Rank #${idx+1} Winner</span><span class="text-yellow-500 font-bold">৳${p}</span></div>`).join("")}
        </div>`;
      }

      let drawnResultsDetails = "";
      if (lot.status === "drawn") {
        const winnersList = (lot.drawnWinnersList && lot.drawnWinnersList.length > 0) ? lot.drawnWinnersList : [];
        if (winnersList.length > 0) {
          drawnResultsDetails = `<div class="bg-slate-950 p-2.5 rounded-2xl border border-green-900/50 text-[10px] space-y-1 font-mono">
            <span class="text-green-400 font-bold uppercase tracking-wider block text-[9px] flex items-center gap-1">
              <i data-lucide="trophy" class=" text-amber-400"></i> Finalized Draw Winner(s) Ledger:
            </span>
            ${winnersList.map((w: any, idx: number) => `<div class="flex justify-between items-center text-slate-300"><span>Rank #${w.rank || idx+1}: <strong class="text-white">@${w.username || 'Winner'}</strong> (${w.ticketCode || w.code || 'LW-WIN'})</span><span class="text-emerald-400 font-bold">৳${w.prize || w.prizeAmount || lot.prizeAmount}</span></div>`).join("")}
          </div>`;
        }
      }

      card.innerHTML = `
        <div class="flex justify-between items-start gap-4">
          <div>
            <h4 class="text-white font-bold font-sans text-sm">${this.escapeHTML(lot.name)}</h4>
            <span class="text-[10px] text-slate-500 font-mono">Category: <span class="text-cyan-400 font-bold uppercase">${lot.category}</span></span>
          </div>
          ${badge}
        </div>

        <p class="text-xs text-slate-400 leading-normal">${this.escapeHTML((lot.details && lot.details !== "undefined") ? lot.details : "Experience live payout lottery draws.")}</p>

        ${multiPrizesDetails}
        ${drawnResultsDetails}

        <div class="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-850/30">
          <div><span class="text-slate-500 block text-[9.5px]">Entry Ticket Cost</span><span class="font-bold font-mono text-cyan-400">৳${lot.entryFee}</span></div>
          <div><span class="text-slate-500 block text-[9.5px]">Pool Draw Reward</span><span class="font-bold font-mono text-yellow-500">৳${lot.prizeAmount}</span></div>
          <div><span class="text-slate-500 block text-[9.5px]">Tickets Registered</span><span class="font-bold font-mono text-white">${lot.soldTickets} / ${lot.totalTickets}</span></div>
          <div><span class="text-slate-550 block text-[9.5px]">Draw Target Time</span><span class="font-mono text-slate-300 text-[10.5px]">${new Date(lot.drawTime).toLocaleString()}</span></div>
        </div>

        <div class="flex justify-between items-center gap-2 pt-2">
          <button class="admin-delete-pool-trigger bg-rose-955 hover:bg-rose-900 border border-rose-950 text-rose-400 text-[10px] font-bold py-1.5 px-3 rounded-xl transition" data-id="${lot.id}">Delete Pool</button>
          ${drawBtn}
        </div>
      `;

      listEl.appendChild(card);
    });

    document.querySelectorAll(".admin-manual-draw-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        const lotId = btn.getAttribute("data-id");
        if (lotId) this.executeManualDrawWinner(lotId);
      });
    });

    document.querySelectorAll(".admin-delete-pool-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        const lotId = btn.getAttribute("data-id");
        if (!lotId) return;
        const pool = this.db.lotteries.find((l: any) => l.id === lotId);
        if (!pool) return;

        const performDelete = () => {
          if (!this._deletedIds) this._deletedIds = new Set();
          this._deletedIds.add(lotId);

          const relatedTickets = (this.db.tickets || []).filter((t: any) => t.lotteryId === lotId);
          relatedTickets.forEach((t: any) => {
            if (t.id) this._deletedIds.add(t.id);
          });
          this.db.tickets = (this.db.tickets || []).filter((t: any) => t.lotteryId !== lotId);

          try {
            const stored = JSON.parse(localStorage.getItem("lw_deleted_ids") || "[]");
            const newSet = new Set([...stored, lotId, ...relatedTickets.map((t: any) => t.id).filter(Boolean)]);
            localStorage.setItem("lw_deleted_ids", JSON.stringify(Array.from(newSet)));
          } catch (e) {}

          this.db.lotteries = (this.db.lotteries || []).filter((l: any) => l.id !== lotId);
          this.saveDB(true);
          this.renderAdminLotteries();
          if (typeof this.render === "function") this.render();
          this.showToast(`Lottery pool "${pool.name}" and associated tickets have been deleted.`, "success");
        };

        if (btn.getAttribute("data-confirm") === "true") {
          performDelete();
        } else {
          let confirmed = false;
          try {
            confirmed = window.confirm(`Are you sure you want to permanently delete lottery pool "${pool.name}" and its tickets?`);
          } catch (e) {
            confirmed = false;
          }
          if (confirmed) {
            performDelete();
          } else {
            btn.setAttribute("data-confirm", "true");
            const originalText = btn.innerHTML;
            btn.innerHTML = "⚠️ Click again to Confirm Delete";
            btn.className = "admin-delete-pool-trigger bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl transition";
            setTimeout(() => {
              if (btn && btn.getAttribute("data-confirm") === "true") {
                btn.removeAttribute("data-confirm");
                btn.innerHTML = originalText;
                btn.className = "admin-delete-pool-trigger bg-rose-955 hover:bg-rose-900 border border-rose-950 text-rose-400 text-[10px] font-bold py-1.5 px-3 rounded-xl transition";
              }
            }, 4000);
          }
        }
      });
    });

    this.refreshIcons();
  },

  executeManualDrawWinner(this: any, lotteryId: string) {
    const lot = this.db.lotteries.find((l: any) => l.id === lotteryId);
    if (!lot) return;

    if (lot.status !== "active") {
      this.showToast("Cannot draw an already completed lottery!", "error");
      return;
    }

    const tickets = this.db.tickets.filter((t: any) => t.lotteryId === lotteryId);
    if (tickets.length === 0) {
      this.showToast("No tickets have been sold yet. Cannot draw winner from an empty pool!", "error");
      return;
    }

    if (!confirm(`Force manual winner draw for "${lot.name}" right now?`)) return;

    let winnersArr: any[] = [];

    if (lot.multiWinnerPrizes && lot.multiWinnerPrizes.length > 0) {
      const prizePool = lot.multiWinnerPrizes;
      const shuffledTickets = [...tickets].sort(() => Math.random() - 0.5);

      prizePool.forEach((prizeAmt: number, rankIdx: number) => {
        const matchedTicket = shuffledTickets[rankIdx];
        if (matchedTicket) {
          matchedTicket.status = "won";
          matchedTicket.prizeAmount = prizeAmt;

          const player = this.db.users.find((u: any) => u.id === matchedTicket.userId);
          if (player) {
            player.balance += prizeAmt;
            player.wins = (player.wins || 0) + 1;
            player.profit = (player.profit || 0) + prizeAmt;

            winnersArr.push({
              username: player.username,
              prize: prizeAmt,
              rank: rankIdx + 1,
              ticketCode: matchedTicket.code
            });
          }
        }
      });

      tickets.forEach((t: any) => {
        if (t.status !== "won") {
          t.status = "lost";
          const player = this.db.users.find((u: any) => u.id === t.userId);
          if (player) {
            player.loss = (player.loss || 0) + 1;
            player.profit = (player.profit || 0) - lot.entryFee;
          }
        }
      });
    } else {
      const randIdx = Math.floor(Math.random() * tickets.length);
      const winnerTicket = tickets[randIdx];

      winnerTicket.status = "won";
      winnerTicket.prizeAmount = lot.prizeAmount;

      if (winnerTicket.isSyndicate && winnerTicket.userIds) {
        const share = Math.round((lot.prizeAmount / winnerTicket.userIds.length) * 100) / 100;
        winnerTicket.userIds.forEach((uid: string) => {
          const u = this.db.users.find((usr: any) => usr.id === uid);
          if (u) {
            u.balance += share;
            u.wins = (u.wins || 0) + 1;
            u.profit = (u.profit || 0) + share;

            const notice = {
              id: "msg_notice_" + Date.now() + "_" + Math.floor(Math.random() * 999),
              recipientType: "specific",
              targetUsername: u.username,
              category: "notice",
              subject: "Syndicate Jackpot Won! 🏆 (Admin Draw)",
              content: `Congratulations! Your syndicate group "${winnerTicket.syndicateName || 'Friends Group'}" has won a split prize of ৳${share} (Total: ৳${lot.prizeAmount}) in the "${lot.name}" draw manually completed by admin!`,
              date: new Date().toISOString(),
              readBy: []
            };
            if (!this.db.messages) this.db.messages = [];
            this.db.messages.unshift(notice);
          }
        });

        winnersArr.push({
          username: `Syndicate (${winnerTicket.syndicateName || 'Group'})`,
          prize: lot.prizeAmount,
          rank: 1,
          ticketCode: winnerTicket.code
        });
      } else {
        const winnerUser = this.db.users.find((u: any) => u.id === winnerTicket.userId);
        if (winnerUser) {
          winnerUser.balance += lot.prizeAmount;
          winnerUser.wins = (winnerUser.wins || 0) + 1;
          winnerUser.profit = (winnerUser.profit || 0) + lot.prizeAmount;

          winnersArr.push({
            username: winnerUser.username,
            prize: lot.prizeAmount,
            rank: 1,
            ticketCode: winnerTicket.code
          });
        }
      }

      tickets.forEach((t: any, index: number) => {
        if (index !== randIdx) {
          t.status = "lost";
          if (t.isSyndicate && t.userIds) {
            t.userIds.forEach((uid: string) => {
              const u = this.db.users.find((usr: any) => usr.id === uid);
              if (u) {
                u.loss = (u.loss || 0) + 1;
                u.profit = (u.profit || 0) - (lot.entryFee / t.userIds.length);
              }
            });
          } else {
            const player = this.db.users.find((u: any) => u.id === t.userId);
            if (player) {
              player.loss = (player.loss || 0) + 1;
              player.profit = (player.profit || 0) - lot.entryFee;
            }
          }
        }
      });
    }

    lot.status = "drawn";
    lot.drawnWinnersList = winnersArr;
    lot.winningTicketCodes = winnersArr.map((w: any) => w.ticketCode);

    this.saveDB(true);
    this.render();
    this.showToast(`🏆 DRAW SUCCESS! Winner(s) selected dynamically for "${lot.name}".`, "success");

    try {
      const celebrationWinners = (winnersArr || []).map((w, idx) => {
        const u = (this.db.users || []).find((usr: any) => usr.username === w.username);
        return {
          userId: u ? u.id : "",
          username: w.username || "Winner",
          name: u ? (u.name || u.username) : (w.username || "Winner"),
          avatar: u ? (u.avatar || u.photoUrl || "") : "",
          ticketCode: w.ticketCode || "LW-WINNER",
          prizeAmount: w.prize || w.prizeAmount || lot.prizeAmount,
          rank: w.rank || (idx + 1)
        };
      });

      const drawEvent = {
        id: "draw_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        lotteryId: lot.id,
        lotteryName: lot.name,
        category: lot.category,
        prizeAmount: lot.prizeAmount,
        drawTime: new Date().toISOString(),
        winningTicketCodes: celebrationWinners.map(w => w.ticketCode),
        winnersCount: celebrationWinners.length,
        winners: celebrationWinners
      };

      if ((window as any).LiveDrawRevealEngine && typeof (window as any).LiveDrawRevealEngine.broadcastDrawEvent === "function") {
        (window as any).LiveDrawRevealEngine.broadcastDrawEvent(drawEvent);
      }
    } catch (broadcastErr) {
      console.warn("Draw event broadcast error:", broadcastErr);
    }
  }
};
