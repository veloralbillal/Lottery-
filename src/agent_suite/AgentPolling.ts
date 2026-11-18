export const AgentPolling = {
  startPollingIfNeeded(system: any, app: any) {
    if (system.chatPollTimer) return;
    system.chatPollTimer = setInterval(async () => {
      const agentScreen = document.getElementById("screen-agent");
      const userChatScreen = document.getElementById("screen-agent-chat");
      const isAgentOpen = agentScreen && !agentScreen.classList.contains("hidden");
      const isUserChatOpen = userChatScreen && !userChatScreen.classList.contains("hidden");
      if (!isAgentOpen && !isUserChatOpen) return;

      const prevCount = Array.isArray(app.db?.agentChats) ? app.db.agentChats.length : 0;
      await this.pollLatestChats(system, app);
      const nextCount = Array.isArray(app.db?.agentChats) ? app.db.agentChats.length : 0;

      if (nextCount !== prevCount) {
        if (isAgentOpen) system.renderAllPanels(app);
        if (isUserChatOpen) system.renderUserLiveChat(app);
      }
    }, 4000);
  },

  async pollLatestChats(system: any, app: any) {
    try {
      const res = await fetch("/api/sql/db", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success && data.db) {
        const incomingChats = Array.isArray(data.db.agentChats)
          ? data.db.agentChats
          : (Array.isArray(data.db.settings?._agentChats) ? data.db.settings._agentChats : []);
        if (incomingChats.length > 0) {
          const map = new Map();
          (app.db.agentChats || []).forEach((c: any) => { if (c && c.id) map.set(c.id, c); });
          incomingChats.forEach((c: any) => { if (c && c.id) map.set(c.id, { ...(map.get(c.id) || {}), ...c }); });
          app.db.agentChats = Array.from(map.values());
        }
      }
    } catch {}
  }
};
