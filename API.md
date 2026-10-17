# API Documentation

The application operates primarily as a client-side Vite Single Page Application with local state persistence and simulated backend handlers.

## Client-Side Core State Methods (`StateManager`)
- `app.render()`: Triggers full UI re-render across active tabs.
- `app.saveDB()`: Persists current application database state to local storage.
- `app.showToast(message, type)`: Displays notification banners (`success`, `error`, `info`, `warning`).
- `app.purchaseTicket(lotteryId)`: Handles ticket purchasing logic, balance deduction, and pool increment.

## Wallet & Extensions API (`WalletExtensions`)
- `WalletExtensions.get24HLimitData(appInstance)`: Calculates 24-hour rolling transaction/disbursement usage against the daily limit quota.
- `WalletExtensions.render24HLimit(appInstance)`: Updates the UI progress bar and status text for the 24H transaction limit allowance.
- `WalletExtensions.submitWithdrawalForm(e)`: Intercepts withdrawal submissions, validates security PINs, enforces 24-hour limits, and files withdrawal requests.
