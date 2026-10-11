# Implementation Plan - Fix Navigation Menu and Agent Page Interactions

## Problem
- Clicking on main navigation menu items (like `.tab-selector-btn`), agent page links, or sidebar menus does nothing ("কিছুই হয় না").
- This occurs because tab selector event listeners are attached statically via `document.querySelectorAll(".tab-selector-btn")` only once on initial load, and are lost or non-responsive when tabs are re-rendered or loaded dynamically.

## Proposed Changes
1. **Global Event Delegation for Tab Selectors in `src/main.ts`**:
   - Add a robust delegation handler in the global `document.addEventListener("click", ...)` block for `.tab-selector-btn` (and any related nav buttons).
   - Ensure `app.currentTab = tab; app.render();` executes reliably regardless of when or where the tab button is rendered.

2. **Verify Agent Tab & Dashboard Interactivity**:
   - Check affiliate agent system and UI rendering to ensure clicks on agent menu items, district filters, search inputs, and action buttons work seamlessly on both desktop and mobile views.

3. **Verification**:
   - Compile and build the applet to verify zero syntax or build errors.
   - Test navigation menu clicks and agent page interactions.
