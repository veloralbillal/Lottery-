// ============================================================================
// DAILY CHECK-IN & SPONSOR LINK CONTROL TAB MODULE
// ============================================================================

export const CheckinSettingsTab = {
  renderCheckinSettings(adminInstance) {
    if (!adminInstance || !adminInstance.db) return;
    const s = adminInstance.db.settings || {};

    const sponsorTaskReq = document.getElementById("sys-checkin-task-required");
    if (sponsorTaskReq) sponsorTaskReq.checked = s.sponsorTaskRequired !== false;

    const sponsorLinkInput = document.getElementById("sys-checkin-sponsor-link");
    if (sponsorLinkInput) sponsorLinkInput.value = s.sponsorLink || "https://google.com";

    const sponsorTitleInput = document.getElementById("sys-checkin-sponsor-title");
    if (sponsorTitleInput) sponsorTitleInput.value = s.sponsorLinkTitle || "স্পন্সর লিংক ভিজিট করুন";

    const sponsorInstrInput = document.getElementById("sys-checkin-sponsor-instruction");
    if (sponsorInstrInput) sponsorInstrInput.value = s.sponsorLinkInstruction || "আজকের বোনাস আনলক করতে নিচের স্পন্সর লিংকটি ভিজিট করুন।";

    const sponsorTimerInput = document.getElementById("sys-checkin-sponsor-timer");
    if (sponsorTimerInput) sponsorTimerInput.value = s.sponsorTaskTimer ?? 5;

    const sponsorAutoOpen = document.getElementById("sys-checkin-auto-open");
    if (sponsorAutoOpen) sponsorAutoOpen.checked = s.sponsorAutoOpen !== false;

    const checkinRewards = s.checkinRewards || [2, 4, 6, 8, 10, 15, 25];
    for (let i = 1; i <= 7; i++) {
      const dayInput = document.getElementById(`sys-checkin-reward-day${i}`);
      if (dayInput) dayInput.value = checkinRewards[i - 1] ?? (i * 2);
    }

    if (typeof adminInstance.renderSponsorClickAnalytics === "function") {
      adminInstance.renderSponsorClickAnalytics();
    }
  }
};
