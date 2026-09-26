/**
 * Lottery Winner - Extra Arcade Games Module (extraGames.js)
 * 
 * Re-exports ExtraGamesModule with fullscreen toggle capability.
 */

import { ExtraGamesModule as BaseExtraGamesModule } from "../js/extraGames.js";

export const ExtraGamesModule = {
  ...BaseExtraGamesModule,
  isFullScreen: false,

  toggleFullScreen() {
    const panel = document.getElementById("game-extragames-panel");
    if (!panel) return;

    this.isFullScreen = !this.isFullScreen;
    const btn = document.getElementById("extragames-fullscreen-toggle-btn");

    if (this.isFullScreen) {
      panel.classList.add("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-compress text-purple-400"></i> <span class="hidden sm:inline">Exit Fullscreen</span>`;
    } else {
      panel.classList.remove("fixed", "inset-0", "z-50", "bg-slate-950", "p-4", "md:p-8", "overflow-y-auto", "flex", "flex-col", "justify-center", "max-w-none");
      if (btn) btn.innerHTML = `<i class="fa-solid fa-expand text-purple-400"></i> <span class="hidden sm:inline">Fullscreen</span>`;
    }
  }
};
