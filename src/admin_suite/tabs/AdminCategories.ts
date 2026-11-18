function escapeHtml(val: any): string {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeCategory(cat: any) {
  if (!cat || typeof cat !== "object") {
    return {
      id: "",
      label: "Unnamed Category",
      name: "—",
      type: "single",
      defaultPrizes: ""
    };
  }
  const rawName = cat.name !== undefined && cat.name !== null ? String(cat.name).trim() : "";
  const rawSlug = cat.slug !== undefined && cat.slug !== null ? String(cat.slug).trim() : "";
  const rawLabel = cat.label !== undefined && cat.label !== null ? String(cat.label).trim() : "";

  const cleanName = rawName && rawName !== "undefined" && rawName !== "null"
    ? rawName
    : (rawSlug && rawSlug !== "undefined" && rawSlug !== "null" ? rawSlug : (cat.id ? String(cat.id) : "Unnamed"));

  const cleanLabel = rawLabel && rawLabel !== "undefined" && rawLabel !== "null"
    ? rawLabel
    : cleanName;

  const cleanType = cat.type === "multi" || cat.type === "syndicate" ? cat.type : "single";
  const rawPrizes = cat.defaultPrizes !== undefined && cat.defaultPrizes !== null ? String(cat.defaultPrizes).trim() : "";
  const cleanPrizes = cleanType === "multi" && rawPrizes && rawPrizes !== "undefined" && rawPrizes !== "null" ? rawPrizes : "";

  return {
    ...cat,
    id: String(cat.id || ""),
    name: cleanName,
    label: cleanLabel,
    type: cleanType,
    defaultPrizes: cleanPrizes
  };
}

export const AdminCategories = {
  setupCategoryListeners(this: any) {
    const app = this;
    const createBtn = document.getElementById("admin-create-category-btn") as HTMLButtonElement | null;
    const creationZone = document.getElementById("category-creation-zone");
    const cancelBtn = document.getElementById("cancel-category-btn") as HTMLButtonElement | null;
    const saveBtn = document.getElementById("save-category-btn") as HTMLButtonElement | null;
    const nameInput = document.getElementById("new-cat-name") as HTMLInputElement | null;
    const labelInput = document.getElementById("new-cat-label") as HTMLInputElement | null;
    const typeSelect = document.getElementById("new-cat-type") as HTMLSelectElement | null;
    const prizesInput = document.getElementById("new-cat-prizes") as HTMLInputElement | null;

    const syncPrizesFieldState = () => {
      if (!typeSelect || !prizesInput) return;
      const isMulti = typeSelect.value === "multi";
      prizesInput.disabled = !isMulti;
      prizesInput.classList.toggle("opacity-50", !isMulti);
      prizesInput.placeholder = isMulti ? "e.g. 100, 50, 30, 20, 10" : "Only used for Multiple Winners Split";
    };

    if (createBtn && createBtn.dataset.bound !== "1") {
      createBtn.dataset.bound = "1";
      createBtn.addEventListener("click", () => {
        if (!creationZone) return;
        const isHidden = creationZone.classList.contains("hidden");
        creationZone.classList.toggle("hidden", !isHidden);
        if (isHidden) {
          if (nameInput) nameInput.value = "";
          if (labelInput) labelInput.value = "";
          if (typeSelect) typeSelect.value = "single";
          if (prizesInput) prizesInput.value = "";
          syncPrizesFieldState();
          setTimeout(() => nameInput?.focus(), 40);
        }
      });
    }

    if (cancelBtn && cancelBtn.dataset.bound !== "1") {
      cancelBtn.dataset.bound = "1";
      cancelBtn.addEventListener("click", () => {
        creationZone?.classList.add("hidden");
      });
    }

    if (typeSelect && typeSelect.dataset.bound !== "1") {
      typeSelect.dataset.bound = "1";
      typeSelect.addEventListener("change", syncPrizesFieldState);
      syncPrizesFieldState();
    }

    if (saveBtn && saveBtn.dataset.bound !== "1") {
      saveBtn.dataset.bound = "1";
      saveBtn.addEventListener("click", async () => {
        const nameVal = (nameInput?.value || "").trim();
        const labelVal = (labelInput?.value || "").trim() || nameVal;
        const typeVal = (typeSelect?.value || "single").trim();
        const prizesVal = typeVal === "multi" ? (prizesInput?.value || "").trim() : "";

        if (!nameVal) {
          app.showToast?.("Please enter a category name.", "error");
          nameInput?.focus();
          return;
        }
        if (typeVal === "multi" && !prizesVal) {
          app.showToast?.("Please enter comma-separated default prizes for multi-winner split.", "error");
          prizesInput?.focus();
          return;
        }

        if (!Array.isArray(app.db.categories)) app.db.categories = [];
        const duplicate = app.db.categories.some(
          (c: any) => String(c?.name || "").trim().toLowerCase() === nameVal.toLowerCase()
        );
        if (duplicate) {
          app.showToast?.("A category with this name already exists.", "error");
          return;
        }

        const newCategory = {
          id: `cat_${Date.now()}`,
          name: nameVal,
          label: labelVal,
          type: typeVal,
          defaultPrizes: prizesVal
        };

        app.db.categories.push(newCategory);
        creationZone?.classList.add("hidden");
        saveBtn.disabled = true;
        try {
          if (typeof app.saveDB === "function") {
            await app.saveDB(true);
          }
          app.renderAdminCategories();
          app.showToast?.(`Category '${labelVal}' created and synced to SQL.`, "success");
        } finally {
          saveBtn.disabled = false;
        }
      });
    }
  },

  renderAdminCategories(this: any) {
    this.setupCategoryListeners?.();

    const listEl = document.getElementById("admin-categories-tbody");
    const mobileEl = document.getElementById("admin-categories-mobile-list");
    if (!listEl && !mobileEl) return;

    if (listEl) listEl.innerHTML = "";
    if (mobileEl) mobileEl.innerHTML = "";

    const rawCategories = Array.isArray(this.db?.categories) ? this.db.categories : [];
    const normalizedCategories = rawCategories.map((c: any) => normalizeCategory(c));
    if (Array.isArray(this.db?.categories)) {
      this.db.categories = normalizedCategories;
    }

    const coreIds = new Set(["c1", "c2", "c3", "c4", "c5", "c6", "c7"]);

    if (normalizedCategories.length === 0) {
      if (listEl) {
        listEl.innerHTML = `
          <tr>
            <td colspan="5" class="p-6 text-center text-slate-500">No categories configured yet. Click "+ Add Category" to create one.</td>
          </tr>
        `;
      }
      if (mobileEl) {
        mobileEl.innerHTML = `
          <div class="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center text-slate-400">
            No categories configured yet. Tap "+ Add Category" above to create one.
          </div>
        `;
      }
      this.refreshIcons?.();
      return;
    }

    normalizedCategories.forEach((cat: any) => {
      const showPrizes = cat.type === "multi" ? (cat.defaultPrizes || "—") : "—";
      const badgeClass =
        cat.type === "multi"
          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
          : cat.type === "syndicate"
          ? "bg-purple-950 text-purple-300 border border-purple-800/40"
          : "bg-cyan-950 text-cyan-400 border border-cyan-800/40";
      const badgeText =
        cat.type === "multi"
          ? "MULTI WINNER SPLIT"
          : cat.type === "syndicate"
          ? "GROUP SYNDICATE"
          : "SINGLE WINNER";

      const isCore = coreIds.has(cat.id);
      const actionMarkup = isCore
        ? `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">Core Default</span>`
        : `<button type="button" class="admin-delete-category-btn bg-red-950 hover:bg-red-900/80 text-red-300 border border-red-900/50 text-[10px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer" data-id="${escapeHtml(cat.id)}">Delete</button>`;

      if (listEl) {
        const row = document.createElement("tr");
        row.className = "hover:bg-slate-900/40 border-b border-slate-800/60";
        row.innerHTML = `
          <td class="p-3 font-bold text-white">${escapeHtml(cat.label)}</td>
          <td class="p-3 font-mono text-slate-400">${escapeHtml(cat.name)}</td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap ${badgeClass}">
              ${badgeText}
            </span>
          </td>
          <td class="p-3 font-mono text-cyan-400 break-words max-w-[220px]">${escapeHtml(showPrizes)}</td>
          <td class="p-3 text-right">${actionMarkup}</td>
        `;
        listEl.appendChild(row);
      }

      if (mobileEl) {
        const card = document.createElement("div");
        card.className = "bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm";
        card.innerHTML = `
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="text-sm font-bold text-white break-words">${escapeHtml(cat.label)}</div>
              <div class="text-[11px] font-mono text-slate-400 mt-0.5 break-all">Slug: ${escapeHtml(cat.name)}</div>
            </div>
            <span class="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap ${badgeClass}">
              ${badgeText}
            </span>
          </div>
          ${cat.type === "multi" ? `
            <div class="bg-slate-900/80 border border-slate-800/80 rounded-xl px-2.5 py-2 text-[11px] font-mono text-cyan-300 break-words">
              <span class="text-slate-500 font-sans block text-[10px] mb-0.5">Default Multiplier Prizes</span>
              ${escapeHtml(showPrizes)}
            </div>
          ` : ""}
          <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/70">
            <span class="text-[10px] text-slate-500 font-mono">ID: ${escapeHtml(cat.id || "—")}</span>
            <div>${actionMarkup}</div>
          </div>
        `;
        mobileEl.appendChild(card);
      }
    });

    document.querySelectorAll(".admin-delete-category-btn").forEach((btnEl) => {
      const btn = btnEl as HTMLButtonElement;
      btn.addEventListener("click", async () => {
        const catId = btn.getAttribute("data-id");
        if (!catId) return;
        const matched = (this.db.categories || []).find((c: any) => c.id === catId);
        if (!matched) return;

        if (coreIds.has(catId)) {
          this.showToast?.("Cannot delete core defaults, only custom categories.", "error");
          return;
        }

        if (btn.dataset.confirming !== "1") {
          btn.dataset.confirming = "1";
          btn.textContent = "Confirm Delete?";
          btn.classList.remove("bg-red-950", "text-red-300");
          btn.classList.add("bg-red-600", "text-white");
          setTimeout(() => {
            if (btn.isConnected && btn.dataset.confirming === "1") {
              btn.dataset.confirming = "0";
              btn.textContent = "Delete";
              btn.classList.add("bg-red-950", "text-red-300");
              btn.classList.remove("bg-red-600", "text-white");
            }
          }, 3000);
          return;
        }

        if (!this._deletedIds) this._deletedIds = new Set();
        this._deletedIds.add(catId);
        this.db.categories = (this.db.categories || []).filter((c: any) => c.id !== catId);
        if (typeof this.saveDB === "function") {
          await this.saveDB(true);
        }
        this.renderAdminCategories();
        this.showToast?.(`Category '${matched.label || matched.name}' removed.`, "info");
      });
    });

    this.refreshIcons?.();
  }
};
