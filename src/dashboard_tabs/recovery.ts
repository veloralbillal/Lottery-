/**
 * Lottery Winner - Account Recovery Console Module (recovery.ts)
 *
 * Manages generation, clipboard copy, and backup download of Master Recovery Keys (LWR-XXXX-XXXX-XXXX).
 */

export class RecoveryTab {
  private static initialized = false;

  static init(appInstance: any) {
    if (this.initialized) return;
    this.initialized = true;
    console.log("Recovery Tab Module initialized successfully.");

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest("#recovery-back-btn")) {
        e.preventDefault();
        appInstance.navigateTo("profile");
        return;
      }

      if (target.closest("#recovery-generate-btn")) {
        if (!appInstance.currentUser) return;
        const dbUser = (appInstance.db?.users || []).find(
          (u: any) => u.id === appInstance.currentUser.id || u.username?.toLowerCase() === appInstance.currentUser.username?.toLowerCase()
        );
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const segments: string[] = [];
        for (let s = 0; s < 3; s++) {
          let seg = "";
          for (let c = 0; c < 4; c++) {
            seg += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          segments.push(seg);
        }
        const newKey = `LWR-${segments.join("-")}`;
        appInstance.currentUser.recoveryCode = newKey;
        if (dbUser) dbUser.recoveryCode = newKey;
        appInstance.saveDB();
        RecoveryTab.render(appInstance);
        appInstance.showToast("Your secure account recovery key has been generated!", "success");
        return;
      }

      if (target.closest("#recovery-copy-key-btn")) {
        const key = appInstance.currentUser?.recoveryCode || "";
        if (!key) return;
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          navigator.clipboard
            .writeText(key)
            .then(() => appInstance.showToast("Recovery key copied to clipboard!", "success"))
            .catch(() => appInstance.showToast(`Recovery Key: ${key}`, "info"));
        } else {
          appInstance.showToast(`Recovery Key: ${key}`, "info");
        }
        return;
      }

      if (target.closest("#recovery-download-btn")) {
        const user = appInstance.currentUser;
        const key = user?.recoveryCode || "";
        if (!key) return;
        const content = [
          "LOTTERY WINNER PORTAL - ACCOUNT SECURITY BACKUP",
          "============================================",
          `Username: @${user.username || "player"}`,
          `Master Recovery Key: ${key}`,
          `Generated At: ${new Date().toISOString()}`,
          "",
          "WARNING: Keep this file completely private and secure.",
          "Anyone with this key can reset your account passphrase."
        ].join("\n");
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `recovery-key-${user.username || "account"}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        appInstance.showToast("Recovery key backup file downloaded!", "success");
      }
    });
  }

  static render(appInstance: any) {
    if (!appInstance?.currentUser) return;
    const dbUser = (appInstance.db?.users || []).find(
      (u: any) => u.id === appInstance.currentUser.id || u.username?.toLowerCase() === appInstance.currentUser.username?.toLowerCase()
    );
    const activeCode = (dbUser?.recoveryCode || appInstance.currentUser.recoveryCode || "").trim();
    if (activeCode && !appInstance.currentUser.recoveryCode) {
      appInstance.currentUser.recoveryCode = activeCode;
    }

    const keyEl = document.getElementById("recovery-active-key");
    const hintEl = document.getElementById("recovery-key-hint-lbl");
    const copyBtn = document.getElementById("recovery-copy-key-btn");
    const dlBtn = document.getElementById("recovery-download-btn");
    const genBtn = document.getElementById("recovery-generate-btn");

    if (activeCode) {
      if (keyEl) keyEl.innerText = activeCode;
      if (hintEl) {
        hintEl.innerHTML = `<span class="text-emerald-400 font-bold"><i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 inline mr-1"></i> Master Recovery Key is active and configured. Keep it secure!</span>`;
      }
      if (copyBtn) copyBtn.classList.remove("hidden");
      if (dlBtn) dlBtn.classList.remove("hidden");
      if (genBtn) {
        genBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-4 h-4 inline mr-1"></i> Regenerate Master Key`;
        genBtn.className = "flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold py-2.5 rounded-xl transition cursor-pointer text-[10px] flex items-center justify-center gap-1.5 uppercase tracking-wider";
      }
    } else {
      if (keyEl) keyEl.innerText = "NOT GENERATED YET";
      if (hintEl) hintEl.innerText = "You have not generated an account recovery key yet.";
      if (copyBtn) copyBtn.classList.add("hidden");
      if (dlBtn) dlBtn.classList.add("hidden");
      if (genBtn) {
        genBtn.innerHTML = `<i data-lucide="wand-2" class="w-4 h-4 inline mr-1"></i> Generate Master Key`;
        genBtn.className = "flex-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black py-2.5 rounded-xl transition duration-150 transform hover:scale-[1.01] cursor-pointer text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/20 uppercase tracking-wider";
      }
    }

    const container = document.getElementById("tab-recovery");
    if (container && typeof appInstance.refreshIconsForContainer === "function") {
      appInstance.refreshIconsForContainer(container);
    } else if (typeof appInstance.refreshIcons === "function") {
      appInstance.refreshIcons();
    }
  }
}
