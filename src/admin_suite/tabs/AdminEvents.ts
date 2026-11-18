function setStatusText(elId: string, msg: string, tone: "info" | "success" | "error") {
  const el = document.getElementById(elId);
  if (!el) return;
  if (!msg) {
    el.classList.add("hidden");
    el.textContent = "";
    return;
  }
  const color = tone === "success" ? "text-emerald-400" : tone === "error" ? "text-rose-400" : "text-cyan-400";
  el.className = `text-[10px] font-sans ${color}`;
  el.textContent = msg;
  el.classList.remove("hidden");
}

function updatePreviewImage(imgId: string, placeholderId: string, rawUrl: string) {
  const img = document.getElementById(imgId) as HTMLImageElement | null;
  const placeholder = document.getElementById(placeholderId) as HTMLElement | null;
  if (!img || !placeholder) return;

  const url = String(rawUrl || "").trim();
  if (!url) {
    img.removeAttribute("src");
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
    return;
  }

  img.onerror = () => {
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
  };
  img.src = url;
  img.classList.remove("hidden");
  placeholder.classList.add("hidden");
}

function readCompressedDataUrl(file: File, maxDim = 1024): Promise<string> {
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
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
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
        resolve(canvas.toDataURL(mime, 0.85));
      };
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadEventOrBannerImage(file: File): Promise<string> {
  const allowed = ["image/png", "image/jpeg", "image/svg+xml", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    throw new Error("Only PNG, JPG, SVG, WEBP, or GIF images are allowed.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image file must be 10MB or smaller.");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await resp.json().catch(() => null);
    if (resp.ok && json?.success && (json.url || json.fileUrl)) {
      return json.url || json.fileUrl;
    }
  } catch {
    // Fallback below if server upload route is unreachable
  }

  return await readCompressedDataUrl(file, 1024);
}

export const AdminEvents = {
  _editingBannerId: null as string | null,

  ensureEventSettingsDefaults(this: any) {
    if (!this.db) this.db = {};
    if (!this.db.settings) this.db.settings = {};
    const s = this.db.settings;
    if (!s.popupEvent) {
      s.popupEvent = {
        enabled: true,
        title: "Eid Mega Draw Festival! 🎉",
        message: "Deposit ৳500 or more today and get a free Ticket to the ৳100,000 Eid Pool!",
        imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=600&auto=format&fit=crop",
        actionText: "Claim Bonus",
        actionLink: "wallet"
      };
    }
    if (!Array.isArray(s.bannerSlides)) {
      s.bannerSlides = [];
    }
    return s;
  },

  renderAdminEvents(this: any) {
    const s = this.ensureEventSettingsDefaults();
    const popup = s.popupEvent;

    // 1. Populate Popup Event Inputs
    const enabledEl = document.getElementById("admin-popup-enabled") as HTMLInputElement | null;
    const titleEl = document.getElementById("admin-popup-title") as HTMLInputElement | null;
    const actionTextEl = document.getElementById("admin-popup-action-text") as HTMLInputElement | null;
    const imageUrlEl = document.getElementById("admin-popup-image-url") as HTMLInputElement | null;
    const redirectTabEl = document.getElementById("admin-popup-redirect-tab") as HTMLSelectElement | null;
    const messageEl = document.getElementById("admin-popup-message") as HTMLTextAreaElement | null;

    if (enabledEl) enabledEl.checked = popup.enabled !== false;
    if (titleEl) titleEl.value = popup.title || "";
    if (actionTextEl) actionTextEl.value = popup.actionText || "";
    if (imageUrlEl) imageUrlEl.value = popup.imageUrl || "";
    if (redirectTabEl) redirectTabEl.value = popup.actionLink || "wallet";
    if (messageEl) messageEl.value = popup.message || "";

    updatePreviewImage("popup-image-preview", "popup-image-preview-placeholder", popup.imageUrl || "");

    // 2. Populate Fee Adjustment Inputs
    const depFeeEl = document.getElementById("admin-dep-charge-pct") as HTMLInputElement | null;
    const withFeeEl = document.getElementById("admin-withdraw-charge-pct") as HTMLInputElement | null;
    if (depFeeEl) depFeeEl.value = String(s.depositFeePct ?? 0);
    if (withFeeEl) withFeeEl.value = String(s.withdrawFeePct ?? 2.0);

    // 3. Render Active Banner Slider Cards
    this.renderActiveBannersList();

    // 4. Bind All Event & Banner Listeners (Idempotent)
    this.bindAdminEventsHandlers();

    if (typeof this.refreshIcons === "function") {
      this.refreshIcons();
    }
  },

  renderActiveBannersList(this: any) {
    const container = document.getElementById("admin-active-banners-container");
    if (!container) return;

    const s = this.ensureEventSettingsDefaults();
    const slides: any[] = Array.isArray(s.bannerSlides) ? s.bannerSlides : [];

    if (slides.length === 0) {
      container.innerHTML = `
        <div class="md:col-span-2 bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-1.5">
          <i class="fa-regular fa-images text-slate-600 text-2xl"></i>
          <p class="text-xs font-bold text-slate-400">No promotional banner slides configured yet.</p>
          <p class="text-[10px] text-slate-500 font-sans">Use the form below to upload an image or add a banner slide for the Home feed.</p>
        </div>
      `;
      return;
    }

    const esc = (str: string) =>
      typeof this.escapeHTML === "function" ? this.escapeHTML(String(str || "")) : String(str || "");

    container.innerHTML = slides
      .map((slide: any, idx: number) => {
        const imgUrl = esc(
          slide.imageUrl ||
            "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=800&auto=format&fit=crop"
        );
        const title = esc(slide.title || "Untitled Banner");
        const subtitle = esc(slide.subtitle || "Promotional offer banner");
        const link = esc(slide.link || "home");
        const slideId = esc(slide.id || `slide_${idx}`);

        return `
          <div class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg group">
            <div class="relative h-28 bg-slate-900 overflow-hidden">
              <img src="${imgUrl}" alt="${title}" class="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-500" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
              <div class="absolute top-2 left-2 flex items-center gap-1.5">
                <span class="px-2 py-0.5 rounded-full bg-slate-950/85 border border-slate-700 text-[9px] font-mono text-cyan-400 font-bold">#${idx + 1}</span>
                <span class="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[9px] font-mono text-rose-300 font-bold uppercase">${link}</span>
              </div>
              <div class="absolute top-2 right-2 flex items-center gap-1">
                ${
                  idx > 0
                    ? `<button type="button" data-banner-move="${slideId}" data-dir="-1" title="Move Left / Up" class="w-6 h-6 rounded-lg bg-slate-950/85 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] flex items-center justify-center cursor-pointer"><i class="fa-solid fa-arrow-up"></i></button>`
                    : ""
                }
                ${
                  idx < slides.length - 1
                    ? `<button type="button" data-banner-move="${slideId}" data-dir="1" title="Move Right / Down" class="w-6 h-6 rounded-lg bg-slate-950/85 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] flex items-center justify-center cursor-pointer"><i class="fa-solid fa-arrow-down"></i></button>`
                    : ""
                }
              </div>
            </div>

            <div class="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
              <div class="space-y-1">
                <h5 class="text-xs font-black text-white line-clamp-1">${title}</h5>
                <p class="text-[10px] text-slate-400 font-sans line-clamp-2">${subtitle}</p>
              </div>
              <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button type="button" data-banner-edit="${slideId}" class="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition">
                  <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button type="button" data-banner-delete="${slideId}" class="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition">
                  <i class="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll("[data-banner-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-banner-edit");
        const target = slides.find((x: any, i: number) => (x.id || `slide_${i}`) === id);
        if (!target) return;

        this._editingBannerId = target.id || id;
        const titleInput = document.getElementById("admin-banner-title") as HTMLInputElement | null;
        const subInput = document.getElementById("admin-banner-subtitle") as HTMLInputElement | null;
        const imgInput = document.getElementById("admin-banner-image") as HTMLInputElement | null;
        const linkSelect = document.getElementById("admin-banner-link-tab") as HTMLSelectElement | null;
        const heading = document.getElementById("admin-banner-form-heading");
        const submitBtn = document.getElementById("add-new-banner-btn");
        const cancelBtn = document.getElementById("cancel-edit-banner-btn");

        if (titleInput) titleInput.value = target.title || "";
        if (subInput) subInput.value = target.subtitle || "";
        if (imgInput) imgInput.value = target.imageUrl || "";
        if (linkSelect) linkSelect.value = target.link || "home";
        updatePreviewImage("banner-image-preview", "banner-image-preview-placeholder", target.imageUrl || "");

        if (heading) {
          heading.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Promotional Banner Slide`;
        }
        if (submitBtn) {
          submitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Banner Changes`;
        }
        if (cancelBtn) cancelBtn.classList.remove("hidden");
        titleInput?.focus();
      });
    });

    container.querySelectorAll("[data-banner-move]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-banner-move");
        const dir = Number(btn.getAttribute("data-dir") || "0");
        const idx = slides.findIndex((x: any, i: number) => (x.id || `slide_${i}`) === id);
        if (idx < 0 || dir === 0) return;
        const nextIdx = idx + dir;
        if (nextIdx < 0 || nextIdx >= slides.length) return;

        const [moved] = slides.splice(idx, 1);
        slides.splice(nextIdx, 0, moved);
        this.db.settings.bannerSlides = slides;
        await this.saveDB(true);
        this.renderActiveBannersList();
        if (typeof this.renderHomeBannerSliders === "function") this.renderHomeBannerSliders();
        this.showToast("Banner display order updated!", "success");
      });
    });

    container.querySelectorAll("[data-banner-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-banner-delete");
        this.db.settings.bannerSlides = slides.filter((x: any, i: number) => (x.id || `slide_${i}`) !== id);
        if (this._editingBannerId === id) {
          this.resetBannerForm();
        }
        await this.saveDB(true);
        this.renderActiveBannersList();
        if (typeof this.renderHomeBannerSliders === "function") this.renderHomeBannerSliders();
        this.showToast("Banner slide removed and synced!", "info");
      });
    });
  },

  resetBannerForm(this: any) {
    this._editingBannerId = null;
    const titleInput = document.getElementById("admin-banner-title") as HTMLInputElement | null;
    const subInput = document.getElementById("admin-banner-subtitle") as HTMLInputElement | null;
    const imgInput = document.getElementById("admin-banner-image") as HTMLInputElement | null;
    const linkSelect = document.getElementById("admin-banner-link-tab") as HTMLSelectElement | null;
    const heading = document.getElementById("admin-banner-form-heading");
    const submitBtn = document.getElementById("add-new-banner-btn");
    const cancelBtn = document.getElementById("cancel-edit-banner-btn");

    if (titleInput) titleInput.value = "";
    if (subInput) subInput.value = "";
    if (imgInput) imgInput.value = "";
    if (linkSelect) linkSelect.value = "home";
    updatePreviewImage("banner-image-preview", "banner-image-preview-placeholder", "");
    setStatusText("banner-image-upload-status", "", "info");

    if (heading) {
      heading.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Add New Promo Slider Banner`;
    }
    if (submitBtn) {
      submitBtn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Add Banner Slide`;
    }
    if (cancelBtn) cancelBtn.classList.add("hidden");
  },

  bindAdminEventsHandlers(this: any) {
    // --- Popup Image Live Input + Upload + Clear ---
    const popupImageUrlEl = document.getElementById("admin-popup-image-url") as HTMLInputElement | null;
    if (popupImageUrlEl && !popupImageUrlEl.dataset.bound) {
      popupImageUrlEl.dataset.bound = "true";
      popupImageUrlEl.addEventListener("input", () => {
        updatePreviewImage("popup-image-preview", "popup-image-preview-placeholder", popupImageUrlEl.value);
      });
    }

    const popupUploadBtn = document.getElementById("btn-popup-image-upload") as HTMLButtonElement | null;
    const popupFileInput = document.getElementById("admin-popup-image-file") as HTMLInputElement | null;
    const popupClearBtn = document.getElementById("btn-popup-image-clear") as HTMLButtonElement | null;

    if (popupUploadBtn && popupFileInput && !popupUploadBtn.dataset.bound) {
      popupUploadBtn.dataset.bound = "true";
      popupUploadBtn.addEventListener("click", () => popupFileInput.click());

      popupFileInput.addEventListener("change", async () => {
        const file = popupFileInput.files && popupFileInput.files[0];
        if (!file) return;
        popupUploadBtn.disabled = true;
        setStatusText("popup-image-upload-status", "Uploading popup image...", "info");
        try {
          const uploadedUrl = await uploadEventOrBannerImage(file);
          if (popupImageUrlEl) popupImageUrlEl.value = uploadedUrl;
          updatePreviewImage("popup-image-preview", "popup-image-preview-placeholder", uploadedUrl);
          setStatusText("popup-image-upload-status", "✓ Image uploaded! Click Save to publish.", "success");
          this.showToast("Popup event image uploaded!", "success");
        } catch (err: any) {
          const msg = err?.message || "Failed to upload popup image.";
          setStatusText("popup-image-upload-status", msg, "error");
          this.showToast(msg, "error");
        } finally {
          popupUploadBtn.disabled = false;
          popupFileInput.value = "";
        }
      });
    }

    if (popupClearBtn && !popupClearBtn.dataset.bound) {
      popupClearBtn.dataset.bound = "true";
      popupClearBtn.addEventListener("click", () => {
        if (popupImageUrlEl) popupImageUrlEl.value = "";
        updatePreviewImage("popup-image-preview", "popup-image-preview-placeholder", "");
        setStatusText("popup-image-upload-status", "Popup image cleared. Click Save to apply.", "info");
      });
    }

    // --- Popup Enable Toggle ---
    const popupEnabledEl = document.getElementById("admin-popup-enabled") as HTMLInputElement | null;
    if (popupEnabledEl && !popupEnabledEl.dataset.bound) {
      popupEnabledEl.dataset.bound = "true";
      popupEnabledEl.addEventListener("change", async () => {
        const s = this.ensureEventSettingsDefaults();
        s.popupEvent.enabled = popupEnabledEl.checked;
        await this.saveDB(true);
        this.showToast(
          popupEnabledEl.checked ? "Full-screen popup event enabled!" : "Full-screen popup event paused.",
          "info"
        );
      });
    }

    // --- Popup Event Save Form & Button ---
    const popupForm = document.getElementById("admin-popup-event-form") as HTMLFormElement | null;
    const savePopupBtn = document.getElementById("save-popup-event-btn") as HTMLButtonElement | null;

    if (popupForm && !popupForm.dataset.bound) {
      popupForm.dataset.bound = "true";
      popupForm.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.savePopupEventSettings();
      });
    }

    if (savePopupBtn && !savePopupBtn.dataset.bound) {
      savePopupBtn.dataset.bound = "true";
      savePopupBtn.addEventListener("click", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.savePopupEventSettings();
      });
    }

    // --- Banner Image Live Input + Upload + Clear ---
    const bannerImageUrlEl = document.getElementById("admin-banner-image") as HTMLInputElement | null;
    if (bannerImageUrlEl && !bannerImageUrlEl.dataset.bound) {
      bannerImageUrlEl.dataset.bound = "true";
      bannerImageUrlEl.addEventListener("input", () => {
        updatePreviewImage("banner-image-preview", "banner-image-preview-placeholder", bannerImageUrlEl.value);
      });
    }

    const bannerUploadBtn = document.getElementById("btn-banner-image-upload") as HTMLButtonElement | null;
    const bannerFileInput = document.getElementById("admin-banner-image-file") as HTMLInputElement | null;
    const bannerClearBtn = document.getElementById("btn-banner-image-clear") as HTMLButtonElement | null;

    if (bannerUploadBtn && bannerFileInput && !bannerUploadBtn.dataset.bound) {
      bannerUploadBtn.dataset.bound = "true";
      bannerUploadBtn.addEventListener("click", () => bannerFileInput.click());

      bannerFileInput.addEventListener("change", async () => {
        const file = bannerFileInput.files && bannerFileInput.files[0];
        if (!file) return;
        bannerUploadBtn.disabled = true;
        setStatusText("banner-image-upload-status", "Uploading banner image...", "info");
        try {
          const uploadedUrl = await uploadEventOrBannerImage(file);
          if (bannerImageUrlEl) bannerImageUrlEl.value = uploadedUrl;
          updatePreviewImage("banner-image-preview", "banner-image-preview-placeholder", uploadedUrl);
          setStatusText("banner-image-upload-status", "✓ Banner image uploaded! Click Add/Save Slide.", "success");
          this.showToast("Banner image uploaded!", "success");
        } catch (err: any) {
          const msg = err?.message || "Failed to upload banner image.";
          setStatusText("banner-image-upload-status", msg, "error");
          this.showToast(msg, "error");
        } finally {
          bannerUploadBtn.disabled = false;
          bannerFileInput.value = "";
        }
      });
    }

    if (bannerClearBtn && !bannerClearBtn.dataset.bound) {
      bannerClearBtn.dataset.bound = "true";
      bannerClearBtn.addEventListener("click", () => {
        if (bannerImageUrlEl) bannerImageUrlEl.value = "";
        updatePreviewImage("banner-image-preview", "banner-image-preview-placeholder", "");
        setStatusText("banner-image-upload-status", "", "info");
      });
    }

    const cancelEditBtn = document.getElementById("cancel-edit-banner-btn") as HTMLButtonElement | null;
    if (cancelEditBtn && !cancelEditBtn.dataset.bound) {
      cancelEditBtn.dataset.bound = "true";
      cancelEditBtn.addEventListener("click", () => this.resetBannerForm());
    }

    // --- Add / Save Banner Slide Form & Button ---
    const bannerForm = document.getElementById("admin-add-banner-form") as HTMLFormElement | null;
    const addBannerBtn = document.getElementById("add-new-banner-btn") as HTMLButtonElement | null;

    if (bannerForm && !bannerForm.dataset.bound) {
      bannerForm.dataset.bound = "true";
      bannerForm.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.saveBannerSlide();
      });
    }

    if (addBannerBtn && !addBannerBtn.dataset.bound) {
      addBannerBtn.dataset.bound = "true";
      addBannerBtn.addEventListener("click", async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await this.saveBannerSlide();
      });
    }

    // --- Advanced Operations: Fees, Sim Deposits, DB Reset ---
    const saveFeesBtn = document.getElementById("save-adv-fees-btn") as HTMLButtonElement | null;
    if (saveFeesBtn && !saveFeesBtn.dataset.bound) {
      saveFeesBtn.dataset.bound = "true";
      saveFeesBtn.addEventListener("click", async () => {
        const s = this.ensureEventSettingsDefaults();
        const depInput = document.getElementById("admin-dep-charge-pct") as HTMLInputElement | null;
        const withInput = document.getElementById("admin-withdraw-charge-pct") as HTMLInputElement | null;

        const depPct = parseFloat(depInput?.value || "0");
        const withPct = parseFloat(withInput?.value || "2.0");

        if (isNaN(depPct) || depPct < 0 || depPct > 50 || isNaN(withPct) || withPct < 0 || withPct > 50) {
          this.showToast("Fee percentages must be between 0% and 50%.", "error");
          return;
        }

        s.depositFeePct = depPct;
        s.withdrawFeePct = withPct;
        const origHtml = saveFeesBtn.innerHTML;
        saveFeesBtn.disabled = true;
        saveFeesBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Saving...`;
        try {
          const syncOk = await this.saveDB(true);
          this.showToast(
            syncOk === false
              ? "Fees saved locally, but SQL sync failed."
              : "Deposit & Payout fees updated & synced!",
            syncOk === false ? "warning" : "success"
          );
        } finally {
          saveFeesBtn.disabled = false;
          saveFeesBtn.innerHTML = origHtml;
        }
      });
    }

    const simPulseBtn = document.getElementById("sim-deposit-pulse-btn") as HTMLButtonElement | null;
    if (simPulseBtn && !simPulseBtn.dataset.bound) {
      simPulseBtn.dataset.bound = "true";
      simPulseBtn.addEventListener("click", async () => {
        const spinner = document.getElementById("pulse-spinner");
        const icon = document.getElementById("pulse-icon");
        if (spinner) spinner.classList.remove("hidden");
        if (icon) icon.classList.add("hidden");
        simPulseBtn.disabled = true;

        try {
          if (!Array.isArray(this.db.deposits)) this.db.deposits = [];
          const players = (this.db.users || []).filter((u: any) => !u.role || u.role === "user");
          const sampleUser = players[0];
          if (!sampleUser) {
            this.showToast("No registered player account found for deposit simulation.", "warning");
            return;
          }
          const amount = [200, 500, 1000][Math.floor(Math.random() * 3)];
          this.db.deposits.unshift({
            id: "dep_sim_" + Date.now(),
            userId: sampleUser.id,
            username: sampleUser.username,
            amount,
            gateway: "bKash",
            trxId: "SIM" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            status: "pending",
            timestamp: new Date().toISOString()
          });
          await this.saveDB(true);
          this.showToast(`Simulated ৳${amount} pending deposit for @${sampleUser.username}.`, "success");
        } finally {
          if (spinner) spinner.classList.add("hidden");
          if (icon) icon.classList.remove("hidden");
          simPulseBtn.disabled = false;
        }
      });
    }

    const factoryResetBtn = document.getElementById("factory-reset-db-btn") as HTMLButtonElement | null;
    if (factoryResetBtn && !factoryResetBtn.dataset.bound) {
      factoryResetBtn.dataset.bound = "true";
      let confirmArmed = false;
      let armTimer: any = null;
      factoryResetBtn.addEventListener("click", async () => {
        if (!confirmArmed) {
          confirmArmed = true;
          factoryResetBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Click Again to Reset Events`;
          this.showToast("Click again within 5s to reset Event & Banner settings to defaults.", "warning");
          armTimer = setTimeout(() => {
            confirmArmed = false;
            factoryResetBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Full DB Reset`;
          }, 5000);
          return;
        }
        clearTimeout(armTimer);
        confirmArmed = false;
        factoryResetBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Full DB Reset`;

        const s = this.ensureEventSettingsDefaults();
        s.popupEvent = {
          enabled: true,
          title: "Eid Mega Draw Festival! 🎉",
          message: "Deposit ৳500 or more today and get a free Ticket to the ৳100,000 Eid Pool!",
          imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=600&auto=format&fit=crop",
          actionText: "Claim Bonus",
          actionLink: "wallet"
        };
        s.bannerSlides = [
          {
            id: "b1",
            title: "Super Fast Payouts In 5 Minutes! ⚡",
            subtitle: "bKash, Nagad, Rocket & Crypto USDT - 0% Fee Instant Cashout",
            imageUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=800&auto=format&fit=crop",
            link: "wallet"
          },
          {
            id: "b2",
            title: "Earn 10% Referral Lifetime Bonus! 👥",
            subtitle: "বন্ধুদের ইনভাইট করুন এবং পান আজীবন ১০% আনলিমিটেড কমিশন!",
            imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop",
            link: "refer"
          }
        ];
        await this.saveDB(true);
        this.renderAdminEvents();
        if (typeof this.renderHomeBannerSliders === "function") this.renderHomeBannerSliders();
        this.showToast("Event & Banner defaults restored & synced!", "success");
      });
    }
  },

  async savePopupEventSettings(this: any) {
    const s = this.ensureEventSettingsDefaults();
    const saveBtn = document.getElementById("save-popup-event-btn") as HTMLButtonElement | null;
    const origHtml = saveBtn ? saveBtn.innerHTML : "";
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Saving...`;
    }

    try {
      const enabledEl = document.getElementById("admin-popup-enabled") as HTMLInputElement | null;
      const titleEl = document.getElementById("admin-popup-title") as HTMLInputElement | null;
      const actionTextEl = document.getElementById("admin-popup-action-text") as HTMLInputElement | null;
      const imageUrlEl = document.getElementById("admin-popup-image-url") as HTMLInputElement | null;
      const redirectTabEl = document.getElementById("admin-popup-redirect-tab") as HTMLSelectElement | null;
      const messageEl = document.getElementById("admin-popup-message") as HTMLTextAreaElement | null;

      const title = (titleEl?.value || "").trim();
      if (!title) {
        this.showToast("Please enter a Popup Title before saving.", "error");
        titleEl?.focus();
        return;
      }

      s.popupEvent = {
        enabled: enabledEl ? enabledEl.checked : true,
        title,
        actionText: (actionTextEl?.value || "").trim() || "Claim Bonus",
        imageUrl:
          (imageUrlEl?.value || "").trim() ||
          "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=600&auto=format&fit=crop",
        actionLink: redirectTabEl?.value || "wallet",
        message: (messageEl?.value || "").trim()
      };

      sessionStorage.removeItem("lw_popup_dismissed");
      setStatusText("popup-image-upload-status", "", "info");

      const syncOk = await this.saveDB(true);
      if (syncOk === false) {
        this.showToast("Popup Event saved locally, but SQL sync failed.", "warning");
      } else {
        this.showToast("Popup Event Settings saved & synced to database!", "success");
      }
    } catch (err: any) {
      console.error("[AdminEvents] Failed to save popup event settings:", err);
      this.showToast("Failed to save popup settings: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = origHtml;
      }
    }
  },

  async saveBannerSlide(this: any) {
    const s = this.ensureEventSettingsDefaults();
    const saveBtn = document.getElementById("add-new-banner-btn") as HTMLButtonElement | null;
    const origHtml = saveBtn ? saveBtn.innerHTML : "";

    const titleEl = document.getElementById("admin-banner-title") as HTMLInputElement | null;
    const subEl = document.getElementById("admin-banner-subtitle") as HTMLInputElement | null;
    const imgEl = document.getElementById("admin-banner-image") as HTMLInputElement | null;
    const linkEl = document.getElementById("admin-banner-link-tab") as HTMLSelectElement | null;

    const title = (titleEl?.value || "").trim();
    if (!title) {
      this.showToast("Please enter a Banner Title.", "error");
      titleEl?.focus();
      return;
    }

    const subtitle = (subEl?.value || "").trim();
    const imageUrl =
      (imgEl?.value || "").trim() ||
      "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=800&auto=format&fit=crop";
    const link = linkEl?.value || "home";

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Saving...`;
    }

    try {
      const slides: any[] = Array.isArray(s.bannerSlides) ? s.bannerSlides : [];
      if (this._editingBannerId) {
        const idx = slides.findIndex((x: any, i: number) => (x.id || `slide_${i}`) === this._editingBannerId);
        if (idx >= 0) {
          slides[idx] = {
            ...slides[idx],
            id: slides[idx].id || this._editingBannerId,
            title,
            subtitle,
            imageUrl,
            link
          };
        } else {
          slides.push({ id: "banner_" + Date.now(), title, subtitle, imageUrl, link });
        }
      } else {
        slides.push({
          id: "banner_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          title,
          subtitle,
          imageUrl,
          link
        });
      }

      s.bannerSlides = slides;
      const wasEdit = Boolean(this._editingBannerId);
      const syncOk = await this.saveDB(true);

      this.resetBannerForm();
      this.renderActiveBannersList();
      if (typeof this.renderHomeBannerSliders === "function") {
        this.renderHomeBannerSliders();
      }

      if (syncOk === false) {
        this.showToast("Banner saved locally, but SQL sync failed.", "warning");
      } else {
        this.showToast(
          wasEdit ? "Banner slide updated & synced!" : "New promo banner slide added & synced!",
          "success"
        );
      }
    } catch (err: any) {
      console.error("[AdminEvents] Failed to save banner slide:", err);
      this.showToast("Failed to save banner slide: " + (err?.message || "Unknown error"), "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = origHtml;
      }
    }
  }
};
