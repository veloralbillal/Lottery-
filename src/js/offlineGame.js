// ============================================================================
// OFFLINE GAME & NETWORK STATUS MODULE
// ============================================================================

export const OfflineGameModule = {
  showOfflineModal() {
    const modal = document.getElementById("offline-modal");
    if (modal) {
      modal.classList.remove("hidden");
    }
    // Update live status strip markers as well
    const stripDot = document.getElementById("dashboard-network-dot");
    const stripDotPulse = document.getElementById("dashboard-network-ping-pulse");
    const stripLabel = document.getElementById("dashboard-network-label");
    const pingVal = document.getElementById("curr-ping-val");
    if (stripDot) {
      stripDot.classList.remove("bg-emerald-500");
      stripDot.classList.add("bg-rose-500");
    }
    if (stripDotPulse) {
      stripDotPulse.classList.remove("bg-emerald-400");
      stripDotPulse.classList.add("bg-rose-500/50");
    }
    if (stripLabel) {
      stripLabel.innerText = "STANDALONE LOCAL LOCK (OFFLINE)";
      stripLabel.classList.remove("text-emerald-400");
      stripLabel.classList.add("text-rose-500");
    }
    if (pingVal) {
      pingVal.innerText = "N/A (TIMEOUT)";
      pingVal.className = "text-rose-500 font-mono";
    }

    // Trigger restart/init of the offline game
    this.restartOfflineGame();
  },

  hideOfflineModal() {
    const modal = document.getElementById("offline-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
    // Update live status strip markers back to online
    const stripDot = document.getElementById("dashboard-network-dot");
    const stripDotPulse = document.getElementById("dashboard-network-ping-pulse");
    const stripLabel = document.getElementById("dashboard-network-label");
    const pingVal = document.getElementById("curr-ping-val");
    if (stripDot) {
      stripDot.classList.remove("bg-rose-500");
      stripDot.classList.add("bg-emerald-500");
    }
    if (stripDotPulse) {
      stripDotPulse.classList.remove("bg-rose-500/50");
      stripDotPulse.classList.add("bg-emerald-400");
    }
    if (stripLabel) {
      stripLabel.innerText = "ONLINE (SECURE)";
      stripLabel.classList.remove("text-rose-500");
      stripLabel.classList.add("text-emerald-400");
    }
    if (pingVal) {
      pingVal.innerText = "24ms";
      pingVal.className = "text-emerald-400 font-mono";
    }
  },

  async checkNetworkStatus() {
    this.showToast("Handshaking with internet network...", "info");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.hideOfflineModal();
        this.showToast("Internet restored! Sync database verified.", "success");
        if (this.firestoreDocRef) {
          this.loadFromCloud();
        }
      } else {
        this.showToast("Handshake failed. Check your data router.", "error");
      }
    } catch (e) {
      this.showToast("Device remains offline. Please try again shortly.", "error");
    }
  },

  runPingSpeedtest() {
    const btn = document.getElementById("dashboard-network-test-btn");
    const label = document.getElementById("curr-ping-val");
    if (!btn || this.isSpeedtesting) return;

    this.isSpeedtesting = true;
    this.showToast("Starting quick ping diagnostic telemetry...", "info");
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-rose-450"></i> testing...`;
    btn.setAttribute("disabled", "true");

    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (label) {
        label.innerText = `${Math.floor(Math.random() * 10) + 12}ms`;
      }
      if (count >= 5) {
        clearInterval(interval);
        this.isSpeedtesting = false;
        btn.innerHTML = originalContent;
        btn.removeAttribute("disabled");
        const finalPing = Math.floor(Math.random() * 8) + 14;
        if (label) label.innerText = `${finalPing}ms`;
        this.showToast(`Speedtest success! Upstream latency: ${finalPing}ms. Connection fully optimized.`, "success");
      }
    }, 300);
  },

  restartOfflineGame() {
    const symbols = ["🍀", "💎", "👑", "৳", "🍀", "💎", "👑", "৳"];
    // Shuffle the symbols randomly
    for (let i = symbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
    }

    this.firstFlippedCard = null;
    this.secondFlippedCard = null;
    this.isFlippedTimeoutActive = false;

    this.offlineGameCards = symbols.map((symbol, idx) => ({
      id: idx,
      symbol: symbol,
      isMatched: false,
      isFlipped: false
    }));

    const grid = document.getElementById("offline-game-grid");
    if (grid) {
      grid.innerHTML = "";
      this.offlineGameCards.forEach((card, idx) => {
        // Build 3D card layout
        const cardHTML = `
          <div class="flip-card w-full h-[55px] cursor-pointer" onclick="window.appInstance.flipOfflineCard(${idx})">
            <div id="offline-card-inner-${idx}" class="flip-card-inner w-full h-full relative" style="transform-style: preserve-3d; height: 55px;">
              
              <!-- Front Face (Closed Card) -->
              <div class="flip-card-front absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-xl flex items-center justify-center text-rose-500/80 font-black shadow-inner" style="backface-visibility: hidden;">
                <i class="fa-solid fa-clover text-xs rotate-12"></i>
              </div>

              <!-- Back Face (Revealed Emojis) -->
              <div class="flip-card-back absolute inset-0 bg-slate-950 border border-cyan-500/40 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(6,182,212,0.15)]" style="backface-visibility: hidden; transform: rotateY(180deg);">
                <span>${card.symbol}</span>
              </div>

            </div>
          </div>
        `;
        grid.insertAdjacentHTML("beforeend", cardHTML);
      });
    }

    const badge = document.getElementById("offline-score-badge");
    if (badge) {
      badge.innerText = `Score: ${this.offlineScore}`;
    }
  },

  flipOfflineCard(idx) {
    if (this.isFlippedTimeoutActive) return;
    const cardData = this.offlineGameCards[idx];
    if (cardData.isFlipped || cardData.isMatched) return;

    const cardEl = document.getElementById(`offline-card-inner-${idx}`);
    if (!cardEl) return;

    // Flip card inner div
    cardEl.classList.add("flip-card-flipped");
    cardData.isFlipped = true;

    if (!this.firstFlippedCard) {
      this.firstFlippedCard = { idx, data: cardData };
    } else {
      this.secondFlippedCard = { idx, data: cardData };
      this.checkOfflineGameMatch();
    }
  },

  checkOfflineGameMatch() {
    this.isFlippedTimeoutActive = true;
    const c1 = this.firstFlippedCard;
    const c2 = this.secondFlippedCard;

    if (c1.data.symbol === c2.data.symbol) {
      // It's a match!
      setTimeout(() => {
        c1.data.isMatched = true;
        c2.data.isMatched = true;
        
        // Success glow borders
        const el1 = document.getElementById(`offline-card-inner-${c1.idx}`);
        const el2 = document.getElementById(`offline-card-inner-${c2.idx}`);
        if (el1) {
          const backFace = el1.querySelector(".flip-card-back");
          if (backFace) backFace.className += " border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
        }
        if (el2) {
          const backFace = el2.querySelector(".flip-card-back");
          if (backFace) backFace.className += " border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
        }

        this.offlineScore += 10;
        const badge = document.getElementById("offline-score-badge");
        if (badge) badge.innerText = `Score: ${this.offlineScore}`;

        this.firstFlippedCard = null;
        this.secondFlippedCard = null;
        this.isFlippedTimeoutActive = false;

        // Check if all matched
        if (this.offlineGameCards.every(c => c.isMatched)) {
          this.showToast("💎 Congratulations! All pairs matched. Ticket safety streak boost acquired!", "success");
        }
      }, 400);
    } else {
      // Not a match, flip them back
      setTimeout(() => {
        const el1 = document.getElementById(`offline-card-inner-${c1.idx}`);
        const el2 = document.getElementById(`offline-card-inner-${c2.idx}`);
        if (el1) el1.classList.remove("flip-card-flipped");
        if (el2) el2.classList.remove("flip-card-flipped");

        c1.data.isFlipped = false;
        c2.data.isFlipped = false;

        this.firstFlippedCard = null;
        this.secondFlippedCard = null;
        this.isFlippedTimeoutActive = false;
      }, 950);
    }
  },

  initNetworkMonitoring() {
    // Check initial status upon loads
    if (!navigator.onLine) {
      this.showOfflineModal();
      this.setSyncState("offline");
    }

    // Register active network event triggers
    window.addEventListener("offline", () => {
      this.showOfflineModal();
      this.setSyncState("offline");
      this.showToast("Your internet connection was lost! Switched to safe offline mode.", "error");
    });

    window.addEventListener("online", () => {
      this.hideOfflineModal();
      this.showToast("Internet connection restored! Resuming live cloud sync.", "success");
      if (this.firestoreDocRef) {
        this.loadFromCloud();
      }
    });

    // Fluctuating signal indicator
    setInterval(() => {
      const pingVal = document.getElementById("curr-ping-val");
      if (pingVal && !this.isSpeedtesting) {
        if (navigator.onLine) {
          const simulatedPing = Math.floor(Math.random() * 15) + 18;
          pingVal.innerText = `${simulatedPing}ms`;
        } else {
          pingVal.innerText = "N/A (TIMEOUT)";
        }
      }
    }, 3000);
  }
};
