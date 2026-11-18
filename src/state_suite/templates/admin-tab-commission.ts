export const template = `
      <!-- ================= ADMIN TAB: COMMISSION & REFERRAL PAYOUTS ================= -->
      <div id="admin-tab-commission" class="hidden space-y-6">
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xl">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center text-xl shadow-lg border border-emerald-500/20">
              <i data-lucide="percent" class="w-6 h-6"></i>
            </div>
            <div>
              <h2 class="text-sm font-black text-white uppercase tracking-wider">Commission & Referrals</h2>
              <p class="text-[11px] text-slate-500 font-mono">Manage payout rates and view affiliate earnings.</p>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-[9px] text-slate-500 uppercase font-bold mb-1">Total Payouts</span>
            <span class="text-lg font-black text-emerald-400 tabular-nums">৳0.00</span>
          </div>
        </div>

        <!-- Commission Config Card -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
            <h3 class="text-xs font-bold text-white uppercase flex items-center gap-2">
              <i data-lucide="settings" class="w-4 h-4 text-emerald-400"></i>
              Global Rates
            </h3>
            <div class="space-y-3">
              <div class="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Agent Commission</span>
                  <span class="text-[9px] text-slate-500 font-mono leading-none">Percentage per ticket sold</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="number" class="bg-slate-900 border border-slate-800 text-white font-black px-3 py-1.5 rounded-xl w-16 text-center text-xs" value="5.0" step="0.1">
                  <span class="text-slate-400 text-xs font-bold">%</span>
                </div>
              </div>
            </div>
            <button class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/40 transition">Save Rates</button>
          </div>
        </div>
      </div>
`;
