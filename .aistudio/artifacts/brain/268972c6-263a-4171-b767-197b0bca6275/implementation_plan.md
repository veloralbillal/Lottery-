# Implementation Plan - Fix Agent Main Menu Navigation Click Responsiveness

## Problem
When clicking any of the Agent workspace sidebar or top navigation menu items, the tab switcher updates the active tab state and visibility classes, but does not trigger the underlying data rendering (`renderAllPanels` / `renderUserLiveChat`), causing the panels to appear empty or unresponsive ("kaj kore na sob koytay").

## Proposed Changes
### `src/js/agent_suite_upgrade.js`
- Update `switchAgentTab(app, tabKey)` to call `this.renderAllPanels(app)` and `this.renderUserLiveChat(app)` (when tab is `live-chat`) so that switching tabs immediately renders and populates the selected tab's data and UI components.

## Verification Plan
- Compile applet with `compile_applet`.
- Lint codebase with `lint_applet`.
- Verify in browser that clicking any agent sidebar navigation item correctly switches the view and renders the corresponding data panel.
