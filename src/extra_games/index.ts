import { ExtraGamesCore } from "./ExtraGamesCore.js";
import { CrashGame } from "./games/CrashGame.js";
import { PlinkoGame } from "./games/PlinkoGame.js";
import { PenaltyGame } from "./games/PenaltyGame.js";
import { TowerGame } from "./games/TowerGame.js";
import { WheelGame } from "./games/WheelGame.js";
import { KenoGame } from "./games/KenoGame.js";
import { CricketGame } from "./games/CricketGame.js";
import { AviatorGame } from "./games/AviatorGame.js";
import { ShellGame } from "./games/ShellGame.js";
import { TigerDragonGame } from "./games/TigerDragonGame.js";

export const ExtraGamesModule = {
  ...ExtraGamesCore,

  renderGame(appInstance: any, gameKey: string) {
    this.app = appInstance;

    const container = document.getElementById("game-extragames-panel");
    if (!container) return;

    ["game-lobby-panel", "game-coinflip-panel", "game-highlow-panel", "game-quickdraw-panel", "game-syndicate-panel", "game-mines-panel", "game-dice-panel"].forEach(id => {
      document.getElementById(id)?.classList.add("hidden");
    });

    container.classList.remove("hidden");

    if (this.activeGame !== gameKey || container.children.length === 0) {
      if (this.gameState && this.gameState.interval) {
        clearInterval(this.gameState.interval);
      }

      this.activeGame = gameKey;
      this.gameState = {};

      let html = "";
      switch (gameKey) {
        case "crash": html = CrashGame.getTemplate(); break;
        case "plinko": html = PlinkoGame.getTemplate(); break;
        case "penalty": html = PenaltyGame.getTemplate(); break;
        case "tower": html = TowerGame.getTemplate(); break;
        case "wheel": html = WheelGame.getTemplate(); break;
        case "keno": html = KenoGame.getTemplate(); break;
        case "cricket": html = CricketGame.getTemplate(); break;
        case "aviator": html = AviatorGame.getTemplate(); break;
        case "shell": html = ShellGame.getTemplate(); break;
        case "tigerdragon": html = TigerDragonGame.getTemplate(); break;
        default:
          html = `<div class="text-center py-10 text-slate-500 font-mono text-xs">Unknown game selection.</div>`;
      }

      container.innerHTML = html;
      this.bindGameEvents(gameKey);
    }
  },

  bindGameEvents(gameKey: string) {
    switch (gameKey) {
      case "crash": CrashGame.bindEvents(this); break;
      case "plinko": PlinkoGame.bindEvents(this); break;
      case "penalty": PenaltyGame.bindEvents(this); break;
      case "tower": TowerGame.bindEvents(this); break;
      case "wheel": WheelGame.bindEvents(this); break;
      case "keno": KenoGame.bindEvents(this); break;
      case "cricket": CricketGame.bindEvents(this); break;
      case "aviator": AviatorGame.bindEvents(this); break;
      case "shell": ShellGame.bindEvents(this); break;
      case "tigerdragon": TigerDragonGame.bindEvents(this); break;
    }
  }
};
