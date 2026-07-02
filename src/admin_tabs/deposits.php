<?php
/**
 * Admin Panel - Deposit Approvals Ledger
 */
?>
<!-- DEPOSIT APPROVAL LEDGER -->
<section id="admin-deposits-section" class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
    <div class="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div class="flex items-center gap-2">
            <i class="fa-solid fa-piggy-bank text-emerald-500 text-sm"></i>
            <h3 class="text-sm font-bold uppercase tracking-wider text-white font-mono">Deposit Approvals Ledger</h3>
        </div>
        <span class="text-[10px] font-mono text-slate-500">Verify Receipts</span>
    </div>

    <div class="space-y-3 max-h-[400px] overflow-y-auto scrollbar-none pr-1">
        <?php if (count($deposits_list) === 0): ?>
            <div class="text-center py-6 text-xs text-slate-600 font-mono">0 DEPOSIT SUBMISSIONS LOGGED PREVIOUSLY.</div>
        <?php else: ?>
            <?php foreach ($deposits_list as $dep): ?>
                <div class="bg-slate-950 border border-slate-800/60 p-4 rounded-2xl flex justify-between items-center gap-4">
                    <div class="space-y-1 text-xs font-mono">
                        <div class="font-bold text-white">@<?php echo htmlspecialchars($dep['username']); ?></div>
                        <div class="text-[10px] text-slate-400">Method: <?php echo htmlspecialchars($dep['method']); ?> | TrxID: <?php echo htmlspecialchars($dep['trxId']); ?></div>
                        <div class="text-[9px] text-slate-600"><?php echo htmlspecialchars($dep['date']); ?></div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-emerald-400 font-mono">৳<?php echo htmlspecialchars($dep['amount']); ?></span>
                        
                        <?php if ($dep['status'] === 'pending'): ?>
                            <div class="flex gap-1">
                                <form action="admin.php" method="POST">
                                    <input type="hidden" name="action" value="verify_deposit">
                                    <input type="hidden" name="id" value="<?php echo $dep['id']; ?>">
                                    <input type="hidden" name="status" value="approved">
                                    <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2.5 rounded-lg text-[9px] transition cursor-pointer">Approve</button>
                                </form>
                                <form action="admin.php" method="POST">
                                    <input type="hidden" name="action" value="verify_deposit">
                                    <input type="hidden" name="id" value="<?php echo $dep['id']; ?>">
                                    <input type="hidden" name="status" value="declined">
                                    <button type="submit" class="bg-rose-955 text-rose-400 hover:bg-rose-900 font-bold py-1 px-2.5 rounded-lg text-[9px] transition border border-rose-900/30 cursor-pointer">Decline</button>
                                </form>
                            </div>
                        <?php else: ?>
                            <span class="uppercase font-mono font-bold text-[9px] <?php echo $dep['status'] === 'approved' ? 'text-emerald-400' : 'text-rose-500'; ?>"><?php echo $dep['status']; ?></span>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</section>
