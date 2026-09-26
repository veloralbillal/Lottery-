# Implementation Plan: Admin Panel Sign-Up Bonus Control

Provide complete control over the new user registration welcome bonus from the Admin Panel Settings tab, allowing administrators to enable/disable the bonus and configure custom bonus amounts.

## Proposed Changes

### 1. Admin Settings Tab (`index.html`)
- Add a dedicated **Sign-Up Welcome Bonus** card in `#admin-tab-settings`:
  - **Enable/Disable Switch**: Toggle `signupBonusEnabled` on or off.
  - **Bonus Amount Input**: Custom number input for `signupBonus` (e.g., $50 / ৳50).
  - **Save Configuration Form**: `admin-settings-signup-bonus-form` with instant local/cloud synchronization and success toast notification.

### 2. State & Admin Form Handlers (`src/main.ts` & `src/js/admin.js`)
- Populate current `signupBonusEnabled` and `signupBonus` values when the Admin Settings tab loads.
- Handle form submissions to save `signupBonusEnabled` (boolean) and `signupBonus` (number) into `app.db.settings` and sync with Firestore.

### 3. Dynamic Registration Flow (`src/main.ts` & `index.html`)
- Update standard registration and 1-Click fast registration flows:
  - If `signupBonusEnabled === true`: Credit the configured `signupBonus` amount to the new user's initial wallet balance, and log the initial bonus transaction.
  - If `signupBonusEnabled === false`: Credit `0` balance on registration.
- Dynamically bind the bonus amounts and labels on the Sign-Up screen (e.g. `REGISTER NOW & GET $XX FREE BONUS`, `CLAIM $XX & REGISTER`, `1-CLICK REGISTER + $XX Bonus`).

## Verification Plan

### Automated Build Verification
- Run `compile_applet` to verify syntax, imports, and bundling.
- Run `npm run build` to update the production `dist/` directory.

### Functional Verification
1. **Admin Panel Control**:
   - Open Admin Panel -> Settings Tab -> change Sign-Up Bonus amount to 75 and save.
   - Verify toast confirmation and database persistence.
2. **Registration with Enabled Bonus**:
   - Register a new account -> Verify starting wallet balance is exactly 75.
3. **Registration with Disabled Bonus**:
   - Toggle Sign-Up Bonus to OFF in Admin Settings and save.
   - Register a new account -> Verify starting wallet balance is 0.
