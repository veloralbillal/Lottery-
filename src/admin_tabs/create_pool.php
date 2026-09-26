<?php
/**
 * Admin Panel - Create Lottery Pool Form
 */
?>
<!-- Launch Draw pool creator -->
<section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
    <div class="flex items-center gap-2 pb-2 border-b border-slate-800/60">
        <i class="fa-solid fa-calendar-plus text-rose-500 text-sm"></i>
        <h3 class="text-sm font-bold uppercase tracking-wider text-white font-mono">Launch New Lottery Draw Pool</h3>
    </div>

    <form action="admin.php" method="POST" class="space-y-4 text-xs font-mono">
        <input type="hidden" name="action" value="create_lottery">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
                <label class="block text-slate-500">Lottery / Event Name</label>
                <input type="text" name="name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" placeholder="e.g. 10-Taka Fast Cash Daily" />
            </div>
            <div class="space-y-1.5">
                <label class="block text-slate-500">Category / Banner Label</label>
                <input type="text" name="category" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" placeholder="e.g. 10 Taka Banner" />
            </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
            <div class="space-y-1.5">
                <label class="block text-slate-500">Entry Ticket (৳)</label>
                <input type="number" step="0.5" min="1" name="entryFee" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" placeholder="e.g. 10" />
            </div>
            <div class="space-y-1.5">
                <label class="block text-slate-500">Prize Reward (৳)</label>
                <input type="number" step="1" min="1" name="prizeAmount" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" placeholder="e.g. 500" />
            </div>
            <div class="space-y-1.5">
                <label class="block text-slate-500">Total Tickets Capacity</label>
                <input type="number" min="1" name="totalTickets" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" placeholder="e.g. 1000" />
            </div>
        </div>

        <div class="space-y-1.5">
            <label class="block text-slate-500">Detailed Rules Description (Optional)</label>
            <textarea name="details" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white outline-none focus:border-rose-500 font-sans" placeholder="Describe eligibility and bonus patterns..."></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
                <label class="block text-slate-500">Draw Mode Select</label>
                <select id="admin-draw-mode-select" name="drawMode" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500 cursor-pointer">
                    <option value="manual">Manual Draw</option>
                    <option value="auto">Auto Draw (Timer - Min)</option>
                    <option value="auto_datetime">Auto Draw (Exact Date & Time)</option>
                </select>
            </div>
            <div id="admin-timer-container" class="space-y-1.5 hidden">
                <label class="block text-slate-500">Timer (In Minutes)</label>
                <input type="number" min="1" max="1440" name="drawDuration" value="10" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" />
            </div>
            <div id="admin-datetime-container" class="space-y-1.5 hidden">
                <label class="block text-slate-500">Exact Date & Time</label>
                <input type="datetime-local" name="exactDrawTime" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500" />
            </div>
        </div>

        <button type="submit" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition active:scale-[0.98] cursor-pointer">
            Publish Live Draw Event
        </button>
    </form>
</section>
