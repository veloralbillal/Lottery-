/**
 * Lottery Winner - User Settings & Security Module (settings.js)
 * 
 * Standalone Settings tab logic for profile modifications, appearance customizer,
 * 4-digit security PIN management, password updates, and system preferences.
 */

import { CustomizerStore } from "./customizer_store.js";
import { DeviceFingerprint } from "../js/deviceFingerprint.js";

export class SettingsTab {
  static selectedFrame = "none";

  static init(appInstance) {
    console.log("Settings Tab Module initialized successfully.");

    // Delegated click event listeners for settings page
    document.addEventListener("click", (e) => {
      if (!appInstance.currentUser) return;

      // 1. Back button -> Return to Profile tab
      if (e.target.closest("#settings-back-btn")) {
        appInstance.currentTab = "profile";
        appInstance.render();
        return;
      }

      // 2. Select Avatar Frame button
      const frameBtn = e.target.closest(".settings-frame-btn");
      if (frameBtn) {
        const frameVal = frameBtn.getAttribute("data-frame") || "none";
        SettingsTab.selectedFrame = frameVal;
        SettingsTab.updateFrameSelectorUI();
        
        // Update live header overlay preview
        const headerOverlay = document.getElementById("settings-frame-overlay");
        if (headerOverlay) {
          headerOverlay.innerHTML = CustomizerStore.getFrameOverlayHTML(frameVal);
        }

        appInstance.showToast(`Selected Frame: ${frameVal.toUpperCase()}`, "info");
        return;
      }

      // 3. Google Photos Syncer
      if (e.target.closest("#settings-google-photo-btn")) {
        appInstance.launchGooglePickerForAvatar();
        return;
      }
    });

    // File Upload Listener for local avatar photo
    document.addEventListener("change", (e) => {
      if (e.target.id === "settings-upload-input" && e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          appInstance.showToast("Selected photo exceeds 5MB limit!", "error");
          return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
          if (appInstance.currentUser) {
            appInstance.currentUser.photo = evt.target.result;
            appInstance.saveDB();
            appInstance.showToast("Profile avatar photo updated successfully!", "success");
            SettingsTab.render(appInstance);
            appInstance.render();
          }
        };
        reader.readAsDataURL(file);
      }

      // Sound FX Preference Toggle
      if (e.target.id === "settings-toggle-sound") {
        if (appInstance.currentUser) {
          appInstance.currentUser.soundEnabled = e.target.checked;
          appInstance.saveDB();
          appInstance.showToast(`Sound Effects ${e.target.checked ? "enabled" : "disabled"}`, "info");
        }
      }

      // Community Consent Toggle
      if (e.target.id === "settings-toggle-community") {
        if (appInstance.currentUser) {
          appInstance.currentUser.communityConsent = e.target.checked;
          appInstance.saveDB();
          appInstance.showToast(`Community visibility ${e.target.checked ? "enabled" : "disabled"}`, "info");
        }
      }
    });

    // Form Submissions
    document.addEventListener("submit", (e) => {
      if (!appInstance.currentUser) return;

      // A. Save Personal Info Form
      const personalForm = e.target.closest("#settings-personal-form");
      if (personalForm) {
        e.preventDefault();
        const newUsername = document.getElementById("settings-input-username")?.value.trim();
        const newEmail = document.getElementById("settings-input-email")?.value.trim();
        const newPhone = document.getElementById("settings-input-phone")?.value.trim();
        const newDob = document.getElementById("settings-input-dob")?.value.trim();
        const newAddress = document.getElementById("settings-input-address")?.value.trim();

        if (!newUsername) {
          appInstance.showToast("Username is required!", "error");
          return;
        }

        appInstance.currentUser.username = newUsername;
        if (newEmail) appInstance.currentUser.email = newEmail;
        if (newPhone) appInstance.currentUser.phone = newPhone;
        if (newDob) appInstance.currentUser.dob = newDob;
        if (newAddress) appInstance.currentUser.address = newAddress;

        appInstance.saveDB();
        appInstance.showToast("Personal details saved successfully!", "success");
        SettingsTab.render(appInstance);
        appInstance.render();
        return;
      }

      // B. Save Appearance & Decor Form
      const appearanceForm = e.target.closest("#settings-appearance-form");
      if (appearanceForm) {
        e.preventDefault();
        const glowVal = document.getElementById("settings-select-glow")?.value || "none";
        const frameVal = SettingsTab.selectedFrame || "none";

        appInstance.currentUser.profileGlow = glowVal;
        appInstance.currentUser.avatarFrame = frameVal;

        appInstance.saveDB();
        appInstance.showToast("Profile decor & appearance saved!", "success");
        SettingsTab.render(appInstance);
        appInstance.render();
        return;
      }

      // C. Save Security PIN & Password Form
      const securityForm = e.target.closest("#settings-security-form");
      if (securityForm) {
        e.preventDefault();
        const newPin = document.getElementById("settings-new-pin")?.value.trim();
        const confirmPin = document.getElementById("settings-confirm-pin")?.value.trim();

        const oldPass = document.getElementById("settings-old-pass")?.value.trim();
        const newPass = document.getElementById("settings-new-pass")?.value.trim();
        const confirmPass = document.getElementById("settings-confirm-pass")?.value.trim();

        let updatedAny = false;

        // Handle PIN update
        if (newPin || confirmPin) {
          if (!newPin || newPin.length !== 4 || isNaN(parseInt(newPin))) {
            appInstance.showToast("PIN code must be a 4-digit number!", "error");
            return;
          }
          if (newPin !== confirmPin) {
            appInstance.showToast("New PIN and confirm PIN do not match!", "error");
            return;
          }
          appInstance.currentUser.securityPin = newPin;
          updatedAny = true;
          
          // Clear input fields
          const pinEl = document.getElementById("settings-new-pin");
          if (pinEl) pinEl.value = "";
          const confPinEl = document.getElementById("settings-confirm-pin");
          if (confPinEl) confPinEl.value = "";

          appInstance.showToast("Security PIN updated successfully!", "success");
        }

        // Handle Password update
        if (oldPass || newPass || confirmPass) {
          if (!oldPass) {
            appInstance.showToast("Please enter your current password to change password!", "error");
            return;
          }
          if (appInstance.currentUser.password && oldPass !== appInstance.currentUser.password) {
            appInstance.showToast("Current password is incorrect!", "error");
            return;
          }
          if (!newPass || newPass.length < 4) {
            appInstance.showToast("New password must be at least 4 characters long!", "error");
            return;
          }
          if (newPass !== confirmPass) {
            appInstance.showToast("New password and confirm password do not match!", "error");
            return;
          }

          appInstance.currentUser.password = newPass;
          updatedAny = true;

          // Clear password fields
          const oldEl = document.getElementById("settings-old-pass");
          if (oldEl) oldEl.value = "";
          const newEl = document.getElementById("settings-new-pass");
          if (newEl) newEl.value = "";
          const confEl = document.getElementById("settings-confirm-pass");
          if (confEl) confEl.value = "";

          appInstance.showToast("Account password changed successfully!", "success");
        }

        if (updatedAny) {
          appInstance.saveDB();
          SettingsTab.render(appInstance);
        } else {
          appInstance.showToast("No security fields were changed.", "info");
        }
        return;
      }
    });
  }

  static render(appInstance) {
    const user = appInstance.currentUser;
    if (!user) return;

    // 1. Populate Header Summary
    const usernameEl = document.getElementById("settings-summary-username");
    if (usernameEl) usernameEl.innerText = user.username || "Player";

    const emailEl = document.getElementById("settings-summary-email");
    if (emailEl) emailEl.innerText = user.email || user.phone || "No email registered";

    const levelEl = document.getElementById("settings-summary-level");
    if (levelEl) levelEl.innerText = user.level || 1;

    const roleEl = document.getElementById("settings-summary-role");
    if (roleEl) roleEl.innerText = user.role || "Player";

    // Header Avatar & Frame
    const avatarImg = document.getElementById("settings-avatar-img");
    const avatarFallback = document.getElementById("settings-avatar-fallback");
    if (avatarImg && avatarFallback) {
      if (user.photo) {
        avatarImg.src = user.photo;
        avatarImg.classList.remove("hidden");
        avatarFallback.classList.add("hidden");
      } else {
        avatarImg.src = "";
        avatarImg.classList.add("hidden");
        avatarFallback.classList.remove("hidden");
      }
    }

    const frame = user.avatarFrame || "none";
    SettingsTab.selectedFrame = frame;

    const overlayEl = document.getElementById("settings-frame-overlay");
    if (overlayEl) {
      overlayEl.innerHTML = CustomizerStore.getFrameOverlayHTML(frame);
    }

    // 2. Populate Personal Info Form
    const inputUsername = document.getElementById("settings-input-username");
    if (inputUsername) inputUsername.value = user.username || "";

    const inputEmail = document.getElementById("settings-input-email");
    if (inputEmail) inputEmail.value = user.email || "";

    const inputPhone = document.getElementById("settings-input-phone");
    if (inputPhone) inputPhone.value = user.phone || "";

    const inputDob = document.getElementById("settings-input-dob");
    if (inputDob) inputDob.value = user.dob || "";

    const inputAddress = document.getElementById("settings-input-address");
    if (inputAddress) inputAddress.value = user.address || "";

    // 3. Populate Appearance Form
    const glowSelect = document.getElementById("settings-select-glow");
    if (glowSelect) glowSelect.value = user.profileGlow || "none";

    SettingsTab.updateFrameSelectorUI();

    // 4. Populate Security PIN Badge
    const pinBadge = document.getElementById("settings-pin-status-badge");
    if (pinBadge) {
      if (user.securityPin) {
        pinBadge.className = "text-[8px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60";
        pinBadge.innerText = "PIN Active (4-Digit)";
      } else {
        pinBadge.className = "text-[8px] font-mono px-2 py-0.5 rounded font-bold bg-rose-950 text-rose-400 border border-rose-800/60";
        pinBadge.innerText = "Not Set";
      }
    }

    // 5. Populate Toggles
    const toggleSound = document.getElementById("settings-toggle-sound");
    if (toggleSound) toggleSound.checked = user.soundEnabled !== false;

    const toggleComm = document.getElementById("settings-toggle-community");
    if (toggleComm) toggleComm.checked = user.communityConsent !== false;

    // 6. Populate Device Fingerprint & IP
    const fpEl = document.getElementById("settings-device-fingerprint");
    if (fpEl) {
      fpEl.innerText = DeviceFingerprint.getFingerprint(user.username) || "FP-LOCAL-USER";
    }

    const ipEl = document.getElementById("settings-device-ip");
    if (ipEl) {
      if (appInstance.userIP) {
        ipEl.innerText = appInstance.userIP;
      } else {
        DeviceFingerprint.getIPAddress().then(ip => {
          appInstance.userIP = ip;
          if (ipEl) ipEl.innerText = ip;
        });
      }
    }
  }

  static updateFrameSelectorUI() {
    const frame = SettingsTab.selectedFrame || "none";
    document.querySelectorAll(".settings-frame-btn").forEach((btn) => {
      const btnFrame = btn.getAttribute("data-frame") || "none";
      if (btnFrame === frame) {
        btn.classList.remove("border-slate-800");
        btn.classList.add("border-amber-500", "bg-slate-950");
      } else {
        btn.classList.add("border-slate-800");
        btn.classList.remove("border-amber-500", "bg-slate-950");
      }
    });
  }
}
