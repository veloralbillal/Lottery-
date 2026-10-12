# Implementation Plan - Agent Live Chat UI & Feature Enhancement

Enhance the Agent page Live Chat Inbox and User-Agent Chat with a modern WhatsApp-inspired interface, Bengali labels/filters, real-time typing indicators, unread badge counters, quick replies, file attachment previews, user feedback ratings, and dedicated full-screen view.

## Proposed Changes

### 1. Agent Workspace (`src/dashboard_tabs/agent_workspace.php`)
- Update Live Chat Inbox filters to use Bengali terminology: All (সকল), Pending (অপেক্ষমাণ), Resolved (সম্পন্ন), Closed (বন্ধ), Unread (অপঠিত).
- Enhance UI with WhatsApp-inspired dark chat theme styling, clean bubble layouts, and smooth animations.
- Add dedicated full-screen ticket/chat detail view option when clicking a ticket.

### 2. Agent Suite JS Engine (`src/js/agent_suite_upgrade.js`)
- **Sorting & Filtering**: Sort unread and newest active threads to the top automatically. Support Bengali filter buttons (সকল, অপেক্ষমাণ, সম্পন্ন, বন্ধ, অপঠিত).
- **WhatsApp Style Chat Features**:
  - Real-time typing indicator simulation and status updates.
  - Unread badge counter for conversations.
  - Quick reply templates in Bengali for fast agent communication.
  - File attachment preview (image thumbnail with zoom link / document download).
  - User feedback / rating feature (allow users & agents to rate or leave feedback on resolved tickets).
- **Dedicated Screen View**: When clicking a conversation or ticket, transition smoothly to a dedicated full view mode or expanded chat pane.

## Verification Plan
- Compile applet with `compile_applet`.
- Test agent live chat inbox filtering in Bengali.
- Verify WhatsApp style message bubbles, read receipts, quick replies, and attachment previews.
