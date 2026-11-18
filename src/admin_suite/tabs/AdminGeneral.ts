import { AdminStoreManager } from "../../store/AdminStoreManager.js";

export const AdminGeneral = {
  async renderAdminStore(this: any) {
    AdminStoreManager.render(this);
  },

  renderAdminOgConfig(this: any) {
    const s = this.db.settings.ogSettings;
    if (!s) return;

    const titleEl = document.getElementById("og-title") as HTMLInputElement;
    const descEl = document.getElementById("og-description") as HTMLInputElement;
    const imageEl = document.getElementById("og-image") as HTMLInputElement;

    if (titleEl) titleEl.value = s.title || "";
    if (descEl) descEl.value = s.description || "";
    if (imageEl) imageEl.value = s.image || "";
    
    (window as any).saveOgSettings = () => this.saveOgSettings();
  },

  saveOgSettings(this: any) {
    const title = (document.getElementById("og-title") as HTMLInputElement).value;
    const description = (document.getElementById("og-description") as HTMLInputElement).value;
    const image = (document.getElementById("og-image") as HTMLInputElement).value;
       
    this.db.settings.ogSettings = { title, description, image };
    this.saveDB();
    this.showToast("OG Configuration saved successfully!", "success");
  }
};
