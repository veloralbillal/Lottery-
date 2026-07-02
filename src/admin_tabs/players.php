<?php
/**
 * Admin Panel - Registered Players Management
 */
?>
<!-- Players Tweak panel -->
<section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
    <div class="flex items-center gap-2 pb-2 border-b border-slate-800/60">
        <i class="fa-solid fa-users text-cyan-400 text-sm"></i>
        <h3 class="text-sm font-bold uppercase tracking-wider text-white font-mono">Registered Players</h3>
    </div>

    <div class="space-y-3 max-h-[600px] overflow-y-auto scrollbar-none pr-1">
        <?php foreach ($users_list as $usr): ?>
            <div class="bg-slate-950 border border-slate-800/50 p-4 rounded-2xl space-y-3">
                <div class="flex justify-between items-start gap-2">
                    <div class="text-xs font-mono">
                        <span class="font-bold text-white block">@<?php echo htmlspecialchars($usr['username']); ?></span>
                        <span class="text-[9px] text-slate-500 block truncate max-w-[150px]"><?php echo htmlspecialchars($usr['email']); ?></span>
                    </div>
                    <span class="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950/30 border border-cyan-800/20 text-cyan-400 uppercase">
                        <?php echo $usr['status']; ?>
                    </span>
                </div>

                <form action="admin.php" method="POST" class="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <input type="hidden" name="action" value="update_user">
                    <input type="hidden" name="id" value="<?php echo $usr['id']; ?>">
                    
                    <div class="space-y-1">
                        <span class="text-[8px] text-slate-500 block">BALANCE (৳)</span>
                        <input type="number" step="0.5" name="balance" value="<?php echo $usr['balance']; ?>" class="w-full bg-slate-900 border border-slate-800/80 rounded-lg py-1 px-2 text-white outline-none" />
                    </div>

                    <div class="space-y-1">
                        <span class="text-[8px] text-slate-500 block">STATUS PRIVILEGES</span>
                        <select name="status" class="w-full bg-slate-900 border border-slate-800/80 rounded-lg py-1 px-2 text-white outline-none cursor-pointer">
                            <option value="active" <?php echo $usr['status'] === 'active' ? 'selected' : ''; ?>>Active</option>
                            <option value="blocked" <?php echo $usr['status'] === 'blocked' ? 'selected' : ''; ?>>Block / Audit</option>
                            <option value="permanently_banned" <?php echo $usr['status'] === 'permanently_banned' ? 'selected' : ''; ?>>Permanently Ban</option>
                        </select>
                    </div>

                    <button type="submit" class="col-span-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] text-slate-300 hover:text-white font-bold py-1.5 rounded-lg transition mt-1 uppercase cursor-pointer">
                        Commit Changes
                    </button>
                </form>
            </div>
        <?php endforeach; ?>
    </div>
</section>
