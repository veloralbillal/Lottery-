/**
 * Lottery Winner - Purchased Tickets Ledger Module (tickets.js)
 * 
 * Handles rendering of user-purchased lottery codes and verifying pending states.
 */

import { TicketsExtensions } from "./tickets_extensions.js";

export class TicketsTab {
  static init(appInstance) {
    console.log("Tickets Tab Module initialized successfully.");
    TicketsExtensions.init(appInstance);
  }

  static render(appInstance) {
    TicketsExtensions.render(appInstance);
  }
}
