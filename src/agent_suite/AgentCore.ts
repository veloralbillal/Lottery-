export const AgentCore = {
  getAllUnifiedAgents(app: any) {
    const allAgents = Array.isArray(app.db?.agents) ? app.db.agents : [];
    const allStaff = Array.isArray(app.db?.staff) ? app.db.staff : [];
    const userAgents = (Array.isArray(app.db?.users) ? app.db.users : []).filter(
      (u: any) => u && (u.role === "agent" || u.role === "subagent")
    );
    const map = new Map();
    [...userAgents, ...allStaff, ...allAgents].forEach(a => {
      if (!a || !a.username) return;
      if (a.role !== "agent" && a.role !== "subagent") return;
      const key = a.username.toLowerCase();
      const prev = map.get(key) || {};
      const merged: any = { ...prev, ...a };
      if (!merged.photo && (prev.photo || prev.avatar || a.avatar)) {
        merged.photo = prev.photo || prev.avatar || a.avatar;
      }
      if (!merged.avatar && (merged.photo || prev.avatar)) {
        merged.avatar = merged.photo || prev.avatar;
      }
      if (!merged.displayName && prev.displayName) {
        merged.displayName = prev.displayName;
      }
      map.set(key, merged);
    });
    return Array.from(map.values());
  },

  syncAgentRecordEverywhere(app: any, agentUser: any) {
    if (!agentUser || !agentUser.username) return;
    const uLower = agentUser.username.toLowerCase();
    const normalizedPhoto = agentUser.photo !== undefined ? agentUser.photo : agentUser.avatar;
    const patch = normalizedPhoto !== undefined
      ? { ...agentUser, photo: normalizedPhoto || "", avatar: normalizedPhoto || "" }
      : { ...agentUser };

    const updateInArray = (arr: any[]) => {
      if (!Array.isArray(arr)) return false;
      let found = false;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] && (arr[i].id === agentUser.id || (arr[i].username && arr[i].username.toLowerCase() === uLower))) {
          arr[i] = { ...arr[i], ...patch };
          found = true;
        }
      }
      return found;
    };

    if (!Array.isArray(app.db.users)) app.db.users = [];
    if (!Array.isArray(app.db.staff)) app.db.staff = [];
    if (!Array.isArray(app.db.agents)) app.db.agents = [];

    const inUsers = updateInArray(app.db.users);
    const inStaff = updateInArray(app.db.staff);
    const inAgents = updateInArray(app.db.agents);

    if (!inUsers) app.db.users.push({ ...patch });
    if (!inStaff) app.db.staff.push({ ...patch });
    if (!inAgents) app.db.agents.push({ ...patch });

    try {
      if (app.sessionKey && app.currentUser && (app.currentUser.username || "").toLowerCase() === uLower) {
        localStorage.setItem(app.sessionKey, JSON.stringify(app.currentUser));
      }
    } catch {}
  },

  getMyReferredUsers(app: any) {
    if (!app.currentUser) return [];
    const myUsername = (app.currentUser.username || "").toLowerCase();
    const directSet = new Set();
    if (Array.isArray(app.currentUser.referredUsers)) {
      app.currentUser.referredUsers.forEach((r: any) => {
        if (r && r.username) directSet.add(r.username.toLowerCase());
      });
    }
    return (app.db.users || []).filter((u: any) => {
      if (!u || !u.username || u.role !== "user") return false;
      return (u.referredBy && u.referredBy.toLowerCase() === myUsername) || directSet.has(u.username.toLowerCase());
    });
  },

  validateAndReadAttachment(file: File, app: any) {
    return new Promise((resolve) => {
      if (!file) return resolve(null);
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        app.showToast("Invalid file type! Only JPG, PNG, WEBP, GIF, and PDF files are allowed.", "error");
        return resolve(null);
      }
      const maxBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxBytes) {
        app.showToast("File is too large! Maximum allowed attachment size is 2MB.", "error");
        return resolve(null);
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: String(reader.result || ""),
          name: file.name.replace(/[^\w.\- ]/g, "_").slice(0, 80),
          type: file.type,
          size: file.size
        });
      };
      reader.onerror = () => {
        app.showToast("Failed to read attachment file.", "error");
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  },

  filterByDateRange(timestampOrDateStr: string, range: string) {
    if (!range || range === "all") return true;
    if (!timestampOrDateStr) return false;
    const d = new Date(timestampOrDateStr);
    if (isNaN(d.getTime())) return true;
    const now = new Date();
    if (range === "today") {
      return d.toISOString().split("T")[0] === now.toISOString().split("T")[0];
    }
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
    if (range === "7d") return diffDays <= 7;
    if (range === "30d") return diffDays <= 30;
    return true;
  },

  updateBadge(id: string, count: number) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) {
      el.innerText = count > 99 ? "99+" : String(count);
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  },

  getAgentNotifications(app: any) {
    if (!app.currentUser) return [];
    const uLower = (app.currentUser.username || "").toLowerCase();
    const msgs = (app.db.messages || []).filter((m: any) => {
      if (!m) return false;
      if (m.recipientType === "all" || m.recipientType === "agents") return true;
      if (m.targetUsername && m.targetUsername.toLowerCase() === uLower) return true;
      return false;
    });

    return msgs.map((m: any) => ({
      id: m.id,
      title: m.subject || "System Notification",
      body: m.content || "",
      date: m.date || "",
      isRead: Array.isArray(m.readBy) && m.readBy.includes(app.currentUser.username),
      raw: m
    }));
  }
};
