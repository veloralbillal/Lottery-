# Implementation Plan: Fix Lottery Description Bug and Add Completed Visual Indicator

## 1. Fix "undefined" description bug
- **Target File**: `/src/js/admin.js`
- **Action**: Modify the lottery rendering logic to ensure the `details` field is properly sanitized.
- **Change**: Replace `${this.escapeHTML(lot.details || "...")}` with a more robust check that handles the string "undefined" if present, or ensures it's a valid string.

## 2. Add visual indicator for completed lotteries
- **Target File**: `/src/js/admin.js`
- **Action**: Modify the lottery rendering logic to check if the draw time has passed.
- **Logic**:
    - `const isCompleted = new Date(lot.drawTime) < new Date();`
    - Add a CSS overlay (e.g., using `absolute inset-0 bg-slate-900/80 flex items-center justify-center`) to display "Completed" text and a visual indicator (like a cross-bar or strike-through) over the lottery card if `isCompleted` is true.

## 3. Verification
- Compile the app (`npm run build`) to ensure no syntax errors.
- Check the admin panel and user view to verify the "Completed" lotteries display correctly and the "undefined" bug is gone.
