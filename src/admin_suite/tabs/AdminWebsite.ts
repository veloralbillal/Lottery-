import { updateSiteBranding } from "../../state_suite/ui_updates.js";

function readLogoAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const result = String(reader.result || "");
      if (file.type === "image/svg+xml") {
        resolve(result);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxSize = 256;
        let width = img.width;
        let height = img.height;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === "image/png" || file.type === "image/webp" ? "image/png" : "image/jpeg";
        resolve(canvas.toDataURL(mime, 0.88));
      };
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

function updateWebsiteLogoPreview(url: string) {
  const img = document.getElementById("web-header-logo-preview-img") as HTMLImageElement | null;
  const icon = document.getElementById("web-header-logo-preview-icon") as HTMLElement | null;
  if (!img || !icon) return;
  const trimmed = String(url || "").trim();
  if (trimmed) {
    img.onerror = () => {
      img.classList.add("hidden");
      icon.classList.remove("hidden");
    };
    img.src = trimmed;
    img.classList.remove("hidden");
    icon.classList.add("hidden");
  } else {
    img.removeAttribute("src");
    img.classList.add("hidden");
    icon.classList.remove("hidden");
  }
}

function setWebsiteLogoStatus(message: string, tone: "info" | "success" | "error") {
  const el = document.getElementById("web-logo-upload-status");
  if (!el) return;
  if (!message) {
    el.classList.add("hidden");
    el.textContent = "";
    return;
  }
  const colorClass =
    tone === "success" ? "text-emerald-400" : tone === "error" ? "text-rose-400" : "text-cyan-400";
  el.className = `text-[10px] font-sans ${colorClass}`;
  el.textContent = message;
  el.classList.remove("hidden");
}

export const AdminWebsite = {
  renderAdminWebsite(this: any) {
    const s = this.db.settings;
    if (!s) return;

    const siteNameEl = document.getElementById("sys-site-name") as HTMLInputElement | null;
    const siteInfoEl = document.getElementById("sys-site-info") as HTMLInputElement | null;
    const signupBonusEl = document.getElementById("sys-signup-bonus") as HTMLInputElement | null;
    const supportNumEl = document.getElementById("sys-support-num") as HTMLInputElement | null;
    const authFooterEl = document.getElementById("sys-auth-footer-text") as HTMLInputElement | null;
    const headerLogoInput = document.getElementById("sys-web-header-logo") as HTMLInputElement | null;

    if (siteNameEl) siteNameEl.value = s.siteName || "";
    if (siteInfoEl) siteInfoEl.value = s.siteInfo || s.maintenanceMessage || "";
    if (signupBonusEl) signupBonusEl.value = String(s.signupBonus ?? 50);
    if (supportNumEl) supportNumEl.value = s.supportNumber || s.whatsappUrl || "";
    if (authFooterEl) authFooterEl.value = s.authFooterText || "";

    const activeLogo = String(s.headerLogo || s.appLogo || s.logoUrl || "").trim();
    if (headerLogoInput) {
      headerLogoInput.value = activeLogo;
      if (!headerLogoInput.dataset.bound) {
        headerLogoInput.dataset.bound = "true";
        headerLogoInput.addEventListener("input", () => {
          updateWebsiteLogoPreview(headerLogoInput.value);
        });
      }
    }
    updateWebsiteLogoPreview(activeLogo);

    const uploadBtn = document.getElementById("btn-web-logo-upload") as HTMLButtonElement | null;
    const fileInput = document.getElementById("sys-web-logo-file") as HTMLInputElement | null;
    const removeBtn = document.getElementById("btn-web-logo-remove") as HTMLButtonElement | null;

    if (uploadBtn && fileInput && !uploadBtn.dataset.bound) {
      uploadBtn.dataset.bound = "true";
      uploadBtn.addEventListener("click", () => fileInput.click());

      fileInput.addEventListener("change", async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;

        const allowed = ["image/png", "image/jpeg", "image/svg+xml", "image/webp", "image/gif"];
        if (!allowed.includes(file.type)) {
          setWebsiteLogoStatus("Only PNG, JPG, SVG, WEBP, or GIF images are allowed.", "error");
          this.showToast("Only PNG, JPG, SVG, WEBP, or GIF images are allowed!", "error");
          fileInput.value = "";
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setWebsiteLogoStatus("Logo file must be 5MB or smaller.", "error");
          this.showToast("Logo file must be 5MB or smaller!", "error");
          fileInput.value = "";
          return;
        }

        setWebsiteLogoStatus("Uploading header logo...", "info");
        uploadBtn.disabled = true;

        let uploadedUrl = "";
        try {
          const formData = new FormData();
          formData.append("file", file);
          const resp = await fetch("/api/upload", { method: "POST", body: formData });
          const json = await resp.json().catch(() => null);
          if (resp.ok && json?.success && (json.url || json.fileUrl)) {
            uploadedUrl = json.url || json.fileUrl;
          }
        } catch {}

        if (!uploadedUrl) {
          try {
            uploadedUrl = await readLogoAsDataUrl(file);
          } catch {
            setWebsiteLogoStatus("Failed to upload or process logo image.", "error");
            this.showToast("Failed to process selected logo image.", "error");
            uploadBtn.disabled = false;
            fileInput.value = "";
            return;
          }
        }

        if (headerLogoInput) headerLogoInput.value = uploadedUrl;
        if (!this.db.settings) this.db.settings = {};
        this.db.settings.headerLogo = uploadedUrl;
        this.db.settings.appLogo = uploadedUrl;
        this.db.settings.logoUrl = uploadedUrl;

        updateWebsiteLogoPreview(uploadedUrl);
        updateSiteBranding(this.db);
        if (typeof this.updateMetaTags === "function") this.updateMetaTags();

        const syncOk = await this.saveDB(true);
        uploadBtn.disabled = false;
        fileInput.value = "";

        if (syncOk === false) {
          setWebsiteLogoStatus("Logo applied locally, but SQL sync failed.", "error");
          this.showToast("Header logo saved locally, but SQL sync failed.", "warning");
        } else {
          setWebsiteLogoStatus("✓ Header logo uploaded and live on User Panel!", "success");
          this.showToast("Header logo uploaded & applied to User Panel!", "success");
        }
      });
    }

    if (removeBtn && !removeBtn.dataset.bound) {
      removeBtn.dataset.bound = "true";
      removeBtn.addEventListener("click", async () => {
        if (headerLogoInput) headerLogoInput.value = "";
        if (!this.db.settings) this.db.settings = {};
        this.db.settings.headerLogo = "";
        this.db.settings.appLogo = "";
        this.db.settings.logoUrl = "";

        updateWebsiteLogoPreview("");
        updateSiteBranding(this.db);
        if (typeof this.updateMetaTags === "function") this.updateMetaTags();

        await this.saveDB(true);
        setWebsiteLogoStatus("Header logo reset to default icon.", "info");
        this.showToast("Header logo reset to default icon.", "info");
      });
    }

    const websiteForm = document.getElementById("admin-settings-website-form") as HTMLFormElement | null;
    if (websiteForm && !(websiteForm as any)._submitBound) {
      (websiteForm as any)._submitBound = true;
      websiteForm.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.saveWebsiteSettings(websiteForm);
      });
    }

    const saveBtn = document.getElementById("save-website-settings-btn");
    if (saveBtn && !(saveBtn as any)._clickBound) {
      (saveBtn as any)._clickBound = true;
      saveBtn.addEventListener("click", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.saveWebsiteSettings(websiteForm || undefined);
      });
    }
  },

  async saveWebsiteSettings(this: any, arg?: HTMLFormElement | Event) {
    if (arg && typeof (arg as Event).preventDefault === "function") {
      (arg as Event).preventDefault();
      (arg as Event).stopPropagation();
    }
    const formEl = arg instanceof HTMLFormElement ? arg : (document.getElementById("admin-settings-website-form") as HTMLFormElement | null);

    if (!this.db) this.db = {};
    if (!this.db.settings) this.db.settings = {};
    const s = this.db.settings;

    const getVal = (id: string, fallback = "") => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
      return el ? el.value.trim() : fallback;
    };

    const submitBtn = formEl?.querySelector('button[type="submit"], button#save-website-settings-btn') as HTMLButtonElement | null;
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-amber-300"></i> Saving Website Settings...`;
    }

    try {
      s.siteName = getVal("sys-site-name", s.siteName || "Lottery Winner");
      s.siteInfo = getVal("sys-site-info", s.siteInfo || "");
      const parsedBonus = parseFloat(getVal("sys-signup-bonus", "50"));
      s.signupBonus = !isNaN(parsedBonus) ? parsedBonus : 50;

      // Keep both signup bonus fields synchronized
      const sysSignupAmt = document.getElementById("sys-signup-bonus-amount") as HTMLInputElement | null;
      if (sysSignupAmt) sysSignupAmt.value = String(s.signupBonus);

      s.supportNumber = getVal("sys-support-num", s.supportNumber || "");
      s.authFooterText = getVal("sys-auth-footer-text", s.authFooterText || "");

      const logoInputEl = document.getElementById("sys-web-header-logo") as HTMLInputElement | null;
      if (logoInputEl) {
        const logoVal = logoInputEl.value.trim();
        s.headerLogo = logoVal;
        s.appLogo = logoVal;
        s.logoUrl = logoVal;
      }

      updateSiteBranding(this.db);
      if (typeof this.updateMetaTags === "function") {
        this.updateMetaTags();
      }

      const syncResult = await this.saveDB(true);

      if (syncResult === false) {
        this.showToast("Website settings saved locally, but SQL sync failed.", "warning");
      } else {
        this.showToast("⚡ Website settings saved & synced to SQL database!", "success");
      }
    } catch (err: any) {
      console.error("[AdminWebsite] Failed saving website settings:", err);
      this.showToast("Failed to save website settings: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    }
  }
};
