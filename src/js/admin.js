import { AdminCore } from "../admin_suite/AdminCore.js";

/**
 * ADMIN MODULE PROXY
 * 
 * This file has been refactored to modular TypeScript components located in /src/admin_suite/.
 * AdminModule now acts as a proxy for AdminCore to preserve compatibility with existing
 * StateManager integration in src/main.ts.
 */
export const AdminModule = {
  ...AdminCore
};
