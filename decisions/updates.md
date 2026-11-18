# Recent System Updates & Architectural Enhancements
**Date**: November 2026  
**Reference Document**: [UPDATES.md](/UPDATES.md)

---

## Overview

This record summarizes the recent architectural and behavioral updates made across the Lottery Winner application.

### Key Changes
1. **Centralized User & Balance DOM Binding (`src/state_suite/ui_updates.ts`)**:
   - Standardized `.curr-username` and `.curr-balance` updates across all tab templates.
   - Fixed currency symbol redundancy (`৳৳` -> `৳`).
2. **Registration Bonus Reconciliation (`src/state_suite/session.ts`)**:
   - Introduced `reconcileBonusBalance(state)` to verify that any welcome bonus registered in ledger transactions is guaranteed to be reflected in the active player's purse balance and persisted across reloads.
3. **Mega Progressive Jackpot Tab UX (`src/state_suite/templates/tab-jackpot.ts` & `src/dashboard_tabs/jackpot.ts`)**:
   - Added live Purse Balance badge in the jackpot header bar.
   - Added "Available Purse Balance" status line inside the Interactive Ticket Purchase Card.
   - Added automatic wallet balance UI refreshing in `JackpotTab.render()`.
4. **User Profile Synchronization (`src/dashboard_tabs/profile.ts`)**:
   - Bound `.curr-username` elements to `currentUser.username` in `ProfileTab.render()`.
5. **Authentication Portal Event Delegation (`src/state_suite/auth_portal_events.ts` & `src/state_suite/boot.ts`)**:
   - Bound `#signInForm`, `#registerForm`, and `#auth-agent-login-form` to perform SPA submissions with math captcha, salted password verification, terms acceptance check, and automatic session initialization.

For full technical specifications and line-level changes, consult `/UPDATES.md`.
