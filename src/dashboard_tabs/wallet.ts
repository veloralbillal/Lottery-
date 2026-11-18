/**
 * Lottery Winner - Wallet & Agent Support Module (wallet.js)
 * 
 * Manages deposits, withdrawals, and loading of District support agents.
 */

import { WalletExtensions } from "./wallet_extensions.js";

export class WalletTab {
  static init(appInstance) {
    console.log("Wallet Tab Module loaded successfully.");
    WalletExtensions.init(appInstance);
  }

  static render(appInstance) {
    if (appInstance && typeof appInstance.rebuildDepositGatewaySelect === "function") {
      appInstance.rebuildDepositGatewaySelect();
    }
    if (appInstance && typeof appInstance.rebuildWithdrawGatewaySelect === "function") {
      appInstance.rebuildWithdrawGatewaySelect();
    }
    if (appInstance && typeof appInstance.updateSelectedDepositGatewayInstructions === "function") {
      appInstance.updateSelectedDepositGatewayInstructions();
    }
    if (appInstance && typeof appInstance.renderSupportAgentsList === "function") {
      appInstance.renderSupportAgentsList();
    }
    if (WalletExtensions && typeof WalletExtensions.render === "function") {
      WalletExtensions.render(appInstance);
    }
  }
}
