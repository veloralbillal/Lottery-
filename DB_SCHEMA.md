# Database Schema

The application persists state locally using a robust JSON structure stored in `localStorage` (`lottery_winner_db` or similar state object) managed by `StateManager` in `src/main.ts`.

## Core Entities

### 1. Users (`db.users`)
- `id` (String): Unique identifier
- `username` (String): Unique handle (e.g. `@player`)
- `email` (String): User email address
- `balance` (Number): Liquid Taka balance
- `vault` / `vaultBalance` (Number): Secured savings vault balance
- `level` (Number): User account level (default 1)
- `xp` (Number): Experience points
- `status` (String): `active` or `blocked`
- `pinLockEnabled` (Boolean): Cashout PIN protection toggle
- `securityPin` (String): 4-digit security PIN

### 2. Lotteries & Pools (`db.lotteries`)
- `id` (String): Pool identifier
- `name` (String): Pool display title
- `entryFee` (Number): Ticket cost in BDT (৳)
- `prizeAmount` (Number): Total prize pool value
- `soldTickets` (Number): Current ticket count sold
- `totalTickets` (Number): Maximum ticket capacity
- `category` (String): Category filter (e.g. `Mega Jackpot`, `Quick Draw`)

### 3. Transactions (`db.transactions`)
- `id` (String): Transaction identifier
- `username` (String): Associated user
- `type` (String): `credit` or `debit`
- `amount` (Number): Transaction amount
- `method` (String): Payment channel (`bKash`, `Nagad`, `USDT`, etc.)
- `status` (String): `approved`, `pending`, or `declined`
- `date` (ISO Timestamp)

### 4. Withdrawals (`db.withdrawals`)
- `id` (String): Payout request ID
- `username` (String): Requesting user
- `amount` (Number): Cashout amount
- `fee` (Number): Gateway fee
- `totalDebit` (Number): Total deducted amount including fee
- `method` (String): Payout channel
- `targetAccount` (String): Recipient account/number
- `status` (String): `pending`, `approved`, or `declined`
- `date` (ISO Timestamp)
