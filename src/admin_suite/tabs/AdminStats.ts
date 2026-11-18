export const AdminStats = {
  renderAdminStats(this: any) {
    const users = this.db.users || [];
    const lotteries = this.db.lotteries || [];
    const deposits = this.db.deposits || [];
    const withdrawals = this.db.withdrawals || [];
    const tickets = this.db.tickets || [];

    const totalUsers = users.length;
    const activeLotteries = lotteries.filter((l: any) => l.status === "active").length;
    const completedLotteries = lotteries.filter((l: any) => l.status === "drawn").length;

    const totalDepositedApproved = deposits.filter((d: any) => d.status === "approved").reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0);
    const pendingDeposCount = deposits.filter((d: any) => d.status === "pending").length;
    const pendingWdsCount = withdrawals.filter((w: any) => w.status === "pending").length;
    const totalWdsApproved = withdrawals.filter((w: any) => w.status === "approved").reduce((sum: number, w: any) => sum + (parseFloat(w.amount) || 0), 0);

    let actualPaidTicketSpent = 0;
    tickets.forEach((ticket: any) => {
      const lot = lotteries.find((l: any) => l.id === ticket.lotteryId);
      if (lot) actualPaidTicketSpent += (parseFloat(lot.entryFee) || 0);
    });

    const shopSales = (this.db.digitalOrders || []).reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    const setEl = (id: string, text: string | number) => {
      const el = document.getElementById(id);
      if (el) el.innerText = String(text);
    };

    setEl("admin-stat-sales", `৳${actualPaidTicketSpent}`);
    setEl("admin-stat-shop-sales", `৳${shopSales.toFixed(2)}`);
    setEl("admin-stat-players", totalUsers);
    setEl("admin-stat-deposits", `৳${totalDepositedApproved}`);
    setEl("admin-stat-pending", `${pendingDeposCount + pendingWdsCount} Ops`);

    setEl("admin-metric-total-pools", `${lotteries.length} pools`);
    setEl("admin-metric-active-pools", `${activeLotteries} active Pools`);
    setEl("admin-metric-total-completes", `${completedLotteries} completed Pools`);
    setEl("admin-metric-withdrawn-approved", `৳${totalWdsApproved} paid out`);
  }
};
