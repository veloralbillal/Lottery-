export const AdminSplash = {
  renderAdminSplashConfig(this: any) {
    const s = this.db.settings;
    const splashToggle = document.getElementById("sys-splash-enabled") as HTMLInputElement;
    const splashImg = document.getElementById("sys-splash-image") as HTMLInputElement;
    const splashUrl = document.getElementById("sys-splash-url") as HTMLInputElement;

    if (splashToggle) splashToggle.checked = s.splashEnabled === true;
    if (splashImg) splashImg.value = s.splashImage || "";
    if (splashUrl) splashUrl.value = s.splashActionUrl || "";

    const titleEl = document.getElementById("sys-splash-title") as HTMLInputElement | null;
    if (titleEl && s.splashTitle) titleEl.value = s.splashTitle;
    const subEl = document.getElementById("sys-splash-subtitle") as HTMLInputElement | null;
    if (subEl && s.splashSubtitle) subEl.value = s.splashSubtitle;
    const durEl = document.getElementById("sys-splash-duration") as HTMLInputElement | null;
    if (durEl && s.splashDuration) durEl.value = String(s.splashDuration);

    this.bindSplashControls();
  },

  bindSplashControls(this: any) {
    const splashForm = document.getElementById("admin-splash-config-form") as HTMLFormElement | null;
    if (splashForm && !(splashForm as any)._submitBound) {
      (splashForm as any)._submitBound = true;
      splashForm.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.saveSplashConfig(splashForm);
      });
    }

    const saveBtn = document.getElementById("save-splash-config-btn");
    if (saveBtn && !(saveBtn as any)._clickBound) {
      (saveBtn as any)._clickBound = true;
      saveBtn.addEventListener("click", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.saveSplashConfig(splashForm || undefined);
      });
    }
  },

  async saveSplashConfig(this: any, arg?: HTMLFormElement | Event) {
    if (arg && typeof (arg as Event).preventDefault === "function") {
      (arg as Event).preventDefault();
      (arg as Event).stopPropagation();
    }
    const formEl = arg instanceof HTMLFormElement ? arg : (document.getElementById("admin-splash-config-form") as HTMLFormElement | null);

    if (!this.db) this.db = {};
    if (!this.db.settings) this.db.settings = {};
    const s = this.db.settings;

    const splashToggle = document.getElementById("sys-splash-enabled") as HTMLInputElement | null;
    const splashImg = document.getElementById("sys-splash-image") as HTMLInputElement | null;
    const splashUrl = document.getElementById("sys-splash-url") as HTMLInputElement | null;
    const splashTitle = document.getElementById("sys-splash-title") as HTMLInputElement | null;
    const splashSubtitle = document.getElementById("sys-splash-subtitle") as HTMLInputElement | null;
    const splashDuration = document.getElementById("sys-splash-duration") as HTMLInputElement | null;
    const splashActionText = document.getElementById("sys-splash-action-text") as HTMLInputElement | null;
    const splashWinner = document.getElementById("sys-splash-featured-winner") as HTMLSelectElement | null;
    const splashShowCard = document.getElementById("sys-splash-show-winner-card") as HTMLSelectElement | null;
    const splashSound = document.getElementById("sys-splash-sound") as HTMLSelectElement | null;
    const splashTheme = document.getElementById("sys-splash-theme") as HTMLSelectElement | null;

    if (splashToggle) s.splashEnabled = splashToggle.checked;
    if (splashImg) s.splashImage = splashImg.value.trim();
    if (splashUrl) s.splashActionUrl = splashUrl.value.trim();
    if (splashTitle) s.splashTitle = splashTitle.value.trim();
    if (splashSubtitle) s.splashSubtitle = splashSubtitle.value.trim();
    if (splashDuration) s.splashDuration = parseInt(splashDuration.value, 10) || 5;
    if (splashActionText) s.splashActionText = splashActionText.value.trim();
    if (splashWinner) s.splashFeaturedWinner = splashWinner.value;
    if (splashShowCard) s.splashShowWinnerCard = splashShowCard.value === "true";
    if (splashSound) s.splashSound = splashSound.value === "true";
    if (splashTheme) s.splashTheme = splashTheme.value;

    const submitBtn = formEl?.querySelector('button[type="submit"], button#save-splash-config-btn') as HTMLButtonElement | null;
    const origHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Saving...`;
    }

    try {
      await this.saveDB(true);
      this.showToast("✓ Splash screen configuration updated successfully!", "success");
    } catch (err: any) {
      console.error("[AdminSplash] Failed saving splash config:", err);
      this.showToast("Failed to save splash configuration", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    }
  }
};
