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
    appInstance.rebuildDepositGatewaySelect();
    appInstance.rebuildWithdrawGatewaySelect();
    appInstance.updateSelectedDepositGatewayInstructions();
    appInstance.renderSupportAgentsList();
    WalletExtensions.render(appInstance);
  }
}
