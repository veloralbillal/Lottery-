/**
 * Lottery Winner - Wallet & Agent Support Module (wallet.js)
 * 
 * Manages deposits, withdrawals, and loading of District support agents.
 */

export class WalletTab {
  static init(appInstance) {
    console.log("Wallet Tab Module loaded successfully.");
  }

  static render(appInstance) {
    appInstance.rebuildDepositGatewaySelect();
    appInstance.rebuildWithdrawGatewaySelect();
    appInstance.updateSelectedDepositGatewayInstructions();
    appInstance.renderSupportAgentsList();
  }
}
