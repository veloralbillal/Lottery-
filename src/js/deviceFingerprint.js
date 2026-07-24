/**
 * Lottery Winner - Device Fingerprinting Utility
 * 
 * Generates a stable and unique browser fingerprint combining multiple browser parameters
 * and canvas rendering quirks, preventing multi-account abuse.
 */

export const DeviceFingerprint = {
  get(username = "ANON") {
    return this.getFingerprint(username);
  },

  getFingerprint(username = "ANON") {
    try {
      const parts = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width + "x" + screen.height,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || "unknown",
        navigator.deviceMemory || "unknown",
        navigator.platform || "unknown"
      ];
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 200;
        canvas.height = 30;
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("LotteryWinner_FP", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("LotteryWinner_FP", 4, 17);
        parts.push(canvas.toDataURL());
      }
      
      const str = parts.join("||");
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return "FP-" + Math.abs(hash).toString(16).toUpperCase();
    } catch (e) {
      console.error("Fingerprinting error:", e);
      return "FP-FALLBACK-" + username;
    }
  },

  async getIPAddress() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return data.ip;
      }
    } catch (e) {
      console.warn("Could not fetch public IP address, using local simulation:", e);
    }
    
    let savedIP = localStorage.getItem("simulated_device_ip");
    if (!savedIP) {
      savedIP = `103.145.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      localStorage.setItem("simulated_device_ip", savedIP);
    }
    return savedIP;
  }
};
