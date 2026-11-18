import { getCircularReplacer, removeCircularReferences, safeStringify } from "../js/serialization.js";

export { getCircularReplacer, removeCircularReferences, safeStringify };

export function initGlobalHandlers() {
  if (typeof window !== "undefined") {
    (window as any).switchTab = (tab: 'signin' | 'register') => {
      const formContainer = document.getElementById("formContainer");
      const signInTab = document.getElementById("signInTab");
      const registerTab = document.getElementById("registerTab");

      if (tab === 'register') {
        formContainer?.classList.add("show-register");
        registerTab?.classList.add("active");
        signInTab?.classList.remove("active");

        const pendingRef = localStorage.getItem("lw_pending_ref");
        const regReferInput = document.getElementById("reg-refer-by") as HTMLInputElement | null;
        if (pendingRef && regReferInput && !regReferInput.value) {
          regReferInput.value = pendingRef;
        }
      } else {
        formContainer?.classList.remove("show-register");
        signInTab?.classList.add("active");
        registerTab?.classList.remove("active");
      }
      if ((window as any).generateMathCaptcha) (window as any).generateMathCaptcha();
    };
    (window as any).switchAuthTab = (mode: 'login' | 'register') => (window as any).switchTab(mode === 'login' ? 'signin' : 'register');
  }
}
