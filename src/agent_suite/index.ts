import { AgentCore } from "./AgentCore.js";
import { AgentNavigation } from "./AgentNavigation.js";
import { AgentPanels } from "./AgentPanels.js";
import { AgentChat } from "./AgentChat.js";
import { AgentActions } from "./AgentActions.js";
import { AgentEvents } from "./AgentEvents.js";
import { AgentPolling } from "./AgentPolling.js";

export const AgentSuiteUpgrade = {
  // State
  sidebarCollapsed: localStorage.getItem("agent_sidebar_collapsed") === "true",
  activeSubTab: "overview",
  activeChatUser: null as string | null,
  chatInboxFilter: "all",
  chatComposerMode: "reply",
  chatPollTimer: null as any,
  agentPendingAttachment: null as any,
  userPendingAttachment: null as any,
  lastSentSignature: "",
  lastSentTimestamp: 0,

  // Core
  getAllUnifiedAgents(app: any) { return AgentCore.getAllUnifiedAgents(app); },
  syncAgentRecordEverywhere(app: any, agentUser: any) { AgentCore.syncAgentRecordEverywhere(app, agentUser); },
  getMyReferredUsers(app: any) { return AgentCore.getMyReferredUsers(app); },
  validateAndReadAttachment(file: File, app: any) { return AgentCore.validateAndReadAttachment(file, app); },
  filterByDateRange(timestampOrDateStr: string, range: string) { return AgentCore.filterByDateRange(timestampOrDateStr, range); },
  updateBadge(id: string, count: number) { AgentCore.updateBadge(id, count); },
  getAgentNotifications(app: any) { return AgentCore.getAgentNotifications(app); },

  // Navigation
  applySidebarState() { AgentNavigation.applySidebarState(this); },
  openMobileDrawer() { AgentNavigation.openMobileDrawer(); },
  closeMobileDrawer() { AgentNavigation.closeMobileDrawer(); },
  switchAgentTab(app: any, tabId: string) { AgentNavigation.switchAgentTab(this, app, tabId); },

  // Panels
  renderAllPanels(app: any) { AgentPanels.renderAllPanels(this, app); },
  renderOverview(app: any) { AgentPanels.renderOverview(this, app); },
  renderPlayersTable(app: any) { AgentPanels.renderPlayersTable(this, app); },
  renderCommissions(app: any) { AgentPanels.renderCommissions(this, app); },
  renderTransactions(app: any) { AgentPanels.renderTransactions(this, app); },
  renderPaymentRequests(app: any) { AgentPanels.renderPaymentRequests(this, app); },
  renderReferrals(app: any) { AgentPanels.renderReferrals(this, app); },
  renderAnalytics(app: any) { AgentPanels.renderAnalytics(this, app); },
  renderStationProfile(app: any) { AgentPanels.renderStationProfile(this, app); },
  renderSupportTickets(app: any) { AgentPanels.renderSupportTickets(this, app); },
  renderWalletOverview(app: any) { AgentPanels.renderWalletOverview(this, app); },
  populateProfileForm(app: any, force = false) { AgentPanels.populateProfileForm(app, force); },

  // Chat
  getAgentChatThreads(app: any) { return AgentChat.getAgentChatThreads(this, app); },
  renderAgentChatInbox(app: any, threads: any[]) { AgentChat.renderAgentChatInbox(this, app, threads); },
  markThreadAsReadByAgent(app: any, targetUsername: string) { AgentChat.markThreadAsReadByAgent(this, app, targetUsername); },
  renderActiveAgentConversation(app: any, threads: any[]) { AgentChat.renderActiveAgentConversation(this, app, threads); },
  renderUserLiveChat(app: any) { AgentChat.renderUserLiveChat(this, app); },
  updateThreadMetadata(app: any, targetUsername: string, updates: any) {
    if (!targetUsername || !app.currentUser || !Array.isArray(app.db.agentChats)) return;
    const uLower = targetUsername.toLowerCase();
    const agentLower = app.currentUser.username.toLowerCase();
    app.db.agentChats.forEach((c: any) => {
      if (!c) return;
      const s = (c.sender || "").toLowerCase();
      const r = (c.recipient || "").toLowerCase();
      if ((s === uLower && (r === agentLower || r === "agent")) || (s === agentLower && r === uLower)) {
        Object.assign(c, updates);
      }
    });
  },
  openWhatsAppFullscreenModal(app: any) { AgentPanels.openWhatsAppFullscreenModal(this, app); },
  closeWhatsAppFullscreenModal() { AgentPanels.closeWhatsAppFullscreenModal(); },
  renderWhatsAppFullscreenModal(app: any) { AgentPanels.renderWhatsAppFullscreenModal(this, app); },

  // Actions
  handleCommissionTransfer(app: any, e: Event) { AgentActions.handleCommissionTransfer(this, app, e); },
  handleRefillRequest(app: any, e: Event) { AgentActions.handleRefillRequest(this, app, e); },
  handleProfileUpdate(app: any, e: Event) { AgentActions.handleProfileUpdate(this, app, e); },
  handleSecurityUpdate(app: any, e: Event) { AgentActions.handleSecurityUpdate(this, app, e); },
  handleSupportTicket(app: any, e: Event) { AgentActions.handleSupportTicket(this, app, e); },

  // Events
  setupAllListeners(app: any) { AgentEvents.setupAllListeners(this, app); },
  setupAgentChatInboxListeners(app: any) { AgentEvents.setupAgentChatInboxListeners(this, app); },
  setupUserLiveChatListeners(app: any) { AgentEvents.setupUserLiveChatListeners(this, app); },

  // Polling
  startPollingIfNeeded(app: any) { AgentPolling.startPollingIfNeeded(this, app); },
  pollLatestChats(app: any) { return AgentPolling.pollLatestChats(this, app); }
};
