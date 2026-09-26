<?php
/**
 * Admin Panel - Dynamic Draw Pools List
 */
?>
<!-- Dynamic Pools list panel -->
<section id="admin-pools-section" class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
            <i class="fa-solid fa-ticket text-rose-500 text-sm"></i>
            <h3 class="text-sm font-bold uppercase tracking-wider text-white font-mono">Dynamic Draw Pools</h3>
        </div>
        <span class="text-[10px] font-mono text-slate-500">Live MySQL Datastore</span>
    </div>

    <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-none">
        <?php if (count($lotteries_list) === 0): ?>
            <div class="text-center py-8 text-xs text-slate-600 font-mono">0 ACTIVE DRAW POOLS DETECTED. CHOOSE CREATE OPTIONS BELOW.</div>
        <?php else: ?>
            <?php foreach ($lotteries_list as $lot): ?>
                <div class="bg-slate-950 border border-slate-800/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-700 transition">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="text-[9px] bg-cyan-950 text-cyan-400 font-mono tracking-widest px-2 py-0.5 rounded-full border border-cyan-800/40 block">
                                <?php echo htmlspecialchars($lot['category']); ?>
                            </span>
                            <?php if ($lot['status'] === 'drawn'): ?>
                                <span class="text-[9px] bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded-full block border border-slate-800">🏆 DRAWN OVER</span>
                            <?php else: ?>
                                <span class="text-[9px] bg-red-950 text-rose-400 font-mono px-2 py-0.5 rounded-full block border border-rose-900/40 animate-pulse">⏳ ACTIVE</span>
                            <?php endif; ?>
                        </div>
                        <h4 class="text-xs font-bold text-white"><?php echo htmlspecialchars($lot['name']); ?></h4>
                        <p class="text-[10px] text-slate-500 font-mono">ID: <?php echo $lot['id']; ?> | Prize Amount: ৳<?php echo number_format($lot['prizeAmount'], 2); ?></p>
                    </div>

                    <div class="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
                        <div class="text-right flex flex-col justify-center gap-0.5 pr-2 border-r border-slate-800 uppercase text-[10px]">
                            <span class="text-slate-400 font-bold">Fee: ৳<?php echo $lot['entryFee']; ?></span>
                            <span class="text-slate-500"><?php echo $lot['soldTickets']; ?> / <?php echo $lot['totalTickets']; ?> Sold</span>
                        </div>

                        <div class="flex items-center gap-1.5">
                            <!-- Force Draw Winner Action -->
                            <?php if ($lot['status'] === 'active'): ?>
                                <form action="admin.php" method="POST" onsubmit="return confirm('Initiate manual winner picker drawing for this pool?')">
                                    <input type="hidden" name="action" value="force_draw">
                                    <input type="hidden" name="lottery_id" value="<?php echo $lot['id']; ?>">
                                    <button type="submit" class="bg-gradient-to-r from-emerald-600 to-green-600 hover:opacity-95 text-[10px] text-white font-bold py-1.5 px-3 rounded-lg transition shadow-md shrink-0">
                                        Force Draw
                                    </button>
                                </form>
                            <?php endif; ?>

                            <!-- DELETE LOTTERY FORM (CRITICAL RESOLUTION POINT) -->
                            <form action="admin.php" method="POST" onsubmit="return confirm('STRICT ALERTS: Are you completely sure you want to permanently delete this lottery draw pool? This deletes all purchased tickets!')">
                                <input type="hidden" name="action" value="delete_lottery">
                                <input type="hidden" name="id" value="<?php echo $lot['id']; ?>">
                                <button type="submit" class="bg-rose-955/80 hover:bg-rose-900 border border-rose-900/30 text-rose-400 text-[10px] font-bold py-1.5 px-2.5 rounded-lg transition flex items-center justify-center cursor-pointer">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</section>
