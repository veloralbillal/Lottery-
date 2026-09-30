# Implementation Plan - Database Engine Switch & State Synchronization Fix

## Problem Statement
When switching database engines (e.g., Firebase Firestore vs. MySQL Relational Database) or querying live metrics (such as agent counts), different browsers/sessions (e.g., Soul Browser vs. Brave Browser) exhibit state desynchronization because the active routing link and engine config are cached locally in browser storage rather than being enforced from a single server-side source of truth with real-time SSE broadcasting.

## Proposed Changes

### 1. Centralized Server-Side Database Configuration Store
- **Server (`server.ts`)**: Maintain authoritative active database engine and routing config on the server-side memory & persisted in Firestore (`app_data/db_config_master`) and MySQL settings table.
- Provide a robust API endpoint `/api/database/active-config` (GET and POST) that acts as the single source of truth for active engine state.

### 2. Real-Time Broadcaster via Server-Sent Events (SSE)
- **Server (`server.ts`)**: Implement an SSE endpoint `/api/events` to broadcast state changes (`db_engine_switched`, `sync_updated`) to all connected client browsers instantly.
- **Client (`src/js/syncCloud.ts` & `src/main.ts`)**: Connect to `/api/events` upon initialization. When an admin switches the database engine, all open browser sessions receive the SSE message and instantly update their routing link and database state without requiring manual refresh.

### 3. Unified Query & Cache Invalidation Layer
- **Client & Server**: Ensure database switch actions clear local state caches and force an immediate reload from the server authoritative source.
- Standardize agent filtering criteria across Firestore and MySQL adapters to ensure identical counts ("2 Agents" vs "7 Agents" discrepancy resolved).

## Verification Plan
- **Automated Compilation**: Run `compile_applet` and `lint_applet` to ensure zero compilation or TypeScript errors.
- **Cross-Browser Verification**: Test engine switching from one browser session and verify instant propagation to another browser session via SSE broadcast.
