export const AdminCommission = {
  renderAdminCommission(this: any) {
    const s = this.db.settings;
    const baseCommInput = document.getElementById("sys-base-commission") as HTMLInputElement;
    const agentCommInput = document.getElementById("sys-agent-commission") as HTMLInputElement;

    if (baseCommInput) baseCommInput.value = String(s.baseCommissionRate ?? 5.0);
    if (agentCommInput) agentCommInput.value = String(s.agentCommissionRate ?? 10.0);

    this.bindCommissionControls();
  },

  bindCommissionControls(this: any) {
    const saveBtn = document.getElementById("save-commission-settings-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const baseCommInput = document.getElementById("sys-base-commission") as HTMLInputElement;
        const agentCommInput = document.getElementById("sys-agent-commission") as HTMLInputElement;

        this.db.settings.baseCommissionRate = parseFloat(baseCommInput.value) || 5.0;
        this.db.settings.agentCommissionRate = parseFloat(agentCommInput.value) || 10.0;

        this.saveDB();
        this.showToast("Commission structure updated successfully!", "success");
      });
    }
  }
};
