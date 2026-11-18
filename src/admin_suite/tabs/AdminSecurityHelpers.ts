export const AdminSecurityHelpers = {
  async getClientIP(this: any) {
    try {
      const res = await this.fetchWithTimeout("https://api.ipify.org?format=json", {}, 2000);
      const data = await res.json();
      return data.ip || "127.0.0.1";
    } catch (err) {
      let storedIp = localStorage.getItem("lw_simulated_ip");
      if (!storedIp) {
        const randA = Math.floor(Math.random() * 150) + 100;
        const randB = Math.floor(Math.random() * 200) + 20;
        storedIp = `103.45.${randA}.${randB}`;
        localStorage.setItem("lw_simulated_ip", storedIp);
      }
      return storedIp;
    }
  },

  async getIPDetails(this: any) {
    try {
      const response = await this.fetchWithTimeout("https://ipapi.co/json/", {}, 2000);
      if (response.ok) {
        const details = await response.json();
        return {
          ip: details.ip || "127.0.0.1",
          country: details.country_name || "",
          org: details.org || "",
          timezone: details.timezone || "",
          region: details.region || ""
        };
      }
    } catch (e) {
      console.warn("Retrying IP details fetch via fallback due to blocker", e);
    }
    const ip = await this.getClientIP();
    return { ip, country: "", org: "", timezone: "", region: "" };
  },

  isVPN(details: any) {
    if (!details) return false;
    const orgLower = (details.org || "").toLowerCase();
    const vpnKeywords = [
      "vpn", "proxy", "hosting", "cloud", "server", "datacenter", "mullvad", 
      "nordvpn", "expressvpn", "surfshark", "digitalocean", "linode", "ovh", 
      "colocation", "amazon", "google", "microsoft", "leaseweb", "vultr", "packet", 
      "private internet", "windscribe", "tor", "exit-node", "proton", "cloudflare", 
      "fastly", "dedicated", "contabo", "interserver", "hetzner"
    ];
    const isVpnOrg = vpnKeywords.some(keyword => orgLower.includes(keyword));
    if (isVpnOrg) return true;

    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (details.timezone && clientTimezone && details.timezone !== clientTimezone) {
      return true;
    }
    return false;
  },

  triggerAdminSecurityAlert(this: any, type: string, message: string) {
    if (!this.db.securityLogs) {
      this.db.securityLogs = [];
    }
    const newLog = {
      id: "sec_" + Date.now() + "_" + Math.floor(Math.random() * 999),
      type: type, 
      message: message,
      timestamp: new Date().toISOString()
    };
    this.db.securityLogs.unshift(newLog);
    
    if (this.db.securityLogs.length > 150) {
      this.db.securityLogs = this.db.securityLogs.slice(0, 150);
    }

    if (!this.db.pendingAdminToasts) {
      this.db.pendingAdminToasts = [];
    }
    this.db.pendingAdminToasts.push({
      id: newLog.id,
      message: message,
      type: type
    });

    this.saveDB();

    if (this.isAdminMode) {
      this.flushAdminToasts();
    }
  },

  flushAdminToasts(this: any) {
    if (!this.isAdminMode) return;
    const toasts = this.db.pendingAdminToasts || [];
    if (toasts.length === 0) return;

    toasts.forEach((t: any) => {
      let icon = "shield";
      if (t.type === "duplicate_ip") {
        icon = "fingerprint";
      } else if (t.type === "region_restriction") {
        icon = "globe";
      }
      
      this.showToast(`<span class="flex items-center gap-1 font-mono text-[10px] text-rose-400">
        <i class="${icon}"></i>
        <strong>[AUTO-SECURITY]</strong> ${this.escapeHTML(t.message)}
      </span>`, "error");
    });

    this.db.pendingAdminToasts = [];
    this.saveDB();

    if (this.currentAdminTab === "refer") {
      this.renderAdminRefer();
    }
  }
};
