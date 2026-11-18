import { template as tab_home } from './tab-home.js';
import { template as tab_events } from './tab-events.js';
import { template as tab_tickets } from './tab-tickets.js';
import { template as tab_wallet } from './tab-wallet.js';
import { template as tab_history } from './tab-history.js';
import { template as tab_deposit } from './tab-deposit.js';
import { template as tab_withdraw } from './tab-withdraw.js';
import { template as tab_agent } from './tab-agent.js';
import { template as tab_profile } from './tab-profile.js';
import { template as tab_edit_profile } from './tab-edit-profile.js';
import { template as tab_settings } from './tab-settings.js';
import { template as tab_badge_request } from './tab-badge-request.js';
import { template as tab_refer } from './tab-refer.js';
import { template as tab_jackpot } from './tab-jackpot.js';
import { template as tab_tasks } from './tab-tasks.js';
import { template as tab_otp } from './tab-otp.js';
import { template as tab_recovery } from './tab-recovery.js';
import { template as tab_video_bounty } from './tab-video-bounty.js';
import { template as tab_games } from './tab-games.js';
import { template as tab_group_chat } from './tab-group-chat.js';
import { template as tab_blog } from './tab-blog.js';
import { template as tab_daily_checkin } from './tab-daily-checkin.js';
import { template as admin_tab_blog } from './admin-tab-blog.js';
import { template as admin_tab_video_bounty } from './admin-tab-video-bounty.js';
import { template as admin_tab_agent_leaders } from './admin-tab-agent-leaders.js';
import { template as admin_tab_subagents_list } from './admin-tab-subagents-list.js';
import { template as admin_tab_users } from './admin-tab-users.js';
import { template as admin_tab_commission } from './admin-tab-commission.js';

import { splashScreenTemplate } from './splash-screen.js';
import { offlineModalTemplate } from './offline-modal.js';
import { cloudSyncModalTemplate } from './cloud-sync-modal.js';
import { maintenanceScreenTemplate } from './maintenance-screen.js';
import { authPortalTemplate } from './auth-portal.js';
import { groupChatScreenTemplate } from './group-chat-screen.js';
import { communityHubScreenTemplate } from './community-hub-screen.js';
import { memberProfileScreenTemplate } from './member-profile-screen.js';
import { membersListScreenTemplate } from './members-list-screen.js';
import { depositAmountModalTemplate } from './deposit-amount-modal.js';
import { refundApologyModalTemplate } from './refund-apology-modal.js';
import { twoFactorAuthModalTemplate } from './two-factor-auth-modal.js';
import { agentChatScreenTemplate } from './agent-chat-screen.js';

export const bundledTabs = {
  "tab-home": tab_home,
  "tab-events": tab_events,
  "tab-tickets": tab_tickets,
  "tab-wallet": tab_wallet,
  "tab-history": tab_history,
  "tab-deposit": tab_deposit,
  "tab-withdraw": tab_withdraw,
  "tab-agent": tab_agent,
  "tab-profile": tab_profile,
  "tab-edit-profile": tab_edit_profile,
  "tab-settings": tab_settings,
  "tab-badge-request": tab_badge_request,
  "tab-refer": tab_refer,
  "tab-jackpot": tab_jackpot,
  "tab-tasks": tab_tasks,
  "tab-daily-checkin": tab_daily_checkin,
  "tab-otp": tab_otp,
  "tab-recovery": tab_recovery,
  "tab-video-bounty": tab_video_bounty,
  "tab-games": tab_games,
  "tab-group-chat": tab_group_chat,
  "tab-blog": tab_blog,
  "admin-tab-blog": admin_tab_blog,
  "admin-tab-video-bounty": admin_tab_video_bounty,
  "admin-tab-agent-leaders": admin_tab_agent_leaders,
  "admin-tab-subagents-list": admin_tab_subagents_list,
  "admin-tab-users": admin_tab_users,
  "admin-tab-commission": admin_tab_commission
};

export const screenTemplates = {
  "splash-screen": splashScreenTemplate,
  "offline-modal": offlineModalTemplate,
  "cloud-sync-modal": cloudSyncModalTemplate,
  "screen-maintenance": maintenanceScreenTemplate,
  "screen-auth": authPortalTemplate,
  "screen-group-chat": groupChatScreenTemplate,
  "screen-community": communityHubScreenTemplate,
  "screen-member-profile": memberProfileScreenTemplate,
  "screen-members-list": membersListScreenTemplate,
  "screen-agent-chat": agentChatScreenTemplate,
  "deposit-amount-modal": depositAmountModalTemplate,
  "lottery-refund-apology-modal": refundApologyModalTemplate,
  "two-factor-auth-modal": twoFactorAuthModalTemplate
};

