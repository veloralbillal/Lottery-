export const depositAmountModalTemplate = `
    <!-- ================= MODAL: DEPOSIT AMOUNT (QUICK SELECT) ================= -->
    <div id="deposit-amount-modal" class="hidden fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[9999] overflow-y-auto font-sans">
      <div class="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/20 relative space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <div class="flex items-center gap-2.5">
            <div id="amount-modal-gateway-icon-wrap" class="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 text-sm shadow">
              <i id="amount-modal-gateway-icon" class="fa-solid fa-bolt"></i>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h3 id="amount-modal-title" class="text-sm font-black text-white uppercase tracking-wide font-mono">Deposit Amount</h3>
                <span id="amount-modal-badge" class="text-[8px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded">INSTANT ⚡</span>
              </div>
              <p id="amount-modal-subtitle" class="text-[9.5px] text-slate-400 font-sans">UddoktaPay Instant Multi-Gateway (উদ্যোক্তা পে)</p>
            </div>
          </div>
          <button id="close-amount-modal-btn" type="button" class="text-slate-400 hover:text-white text-base cursor-pointer p-1" onclick="if(window.closeModal){window.closeModal('deposit-amount-modal')}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Current Balance & Min Deposit Strip -->
        <div class="flex items-center justify-between bg-slate-900/90 border border-slate-850 px-3.5 py-2 rounded-xl text-xs font-mono">
          <div class="flex items-center gap-1.5 text-slate-400 text-[10.5px]">
            <span>Current Balance:</span>
            <strong class="text-emerald-400 font-bold">৳<span class="curr-balance">0</span></strong>
          </div>
          <div class="text-[9.5px] text-amber-400 font-bold bg-amber-950/40 border border-amber-900/30 px-2 py-0.5 rounded-lg" id="amount-modal-min-badge">
            Min: ৳20
          </div>
        </div>

        <!-- Quick Amount Presets -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center text-[10px] font-mono">
            <label class="text-slate-400 uppercase font-bold tracking-wider">Quick Select Amount (দ্রুত নির্বাচন করুন)</label>
            <span class="text-slate-500">Tap to select</span>
          </div>
          <div class="grid grid-cols-4 gap-2 font-mono">
            <button type="button" class="amount-modal-preset-btn py-2 px-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer text-center" data-val="100">
              ৳100
            </button>
            <button type="button" class="amount-modal-preset-btn py-2 px-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer text-center" data-val="200">
              ৳200
            </button>
            <button type="button" class="amount-modal-preset-btn py-2 px-1 rounded-xl border border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold text-xs transition cursor-pointer text-center" data-val="500">
              ৳500
            </button>
            <button type="button" class="amount-modal-preset-btn py-2 px-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer text-center" data-val="1000">
              ৳1,000
            </button>
            <button type="button" class="amount-modal-preset-btn py-2 px-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer text-center" data-val="2000">
              ৳2,000
            </button>
            <button type="button" class="amount-modal-preset-btn py-2 px-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer text-center" data-val="5000">
              ৳5,000
            </button>
            <button type="button" class="amount-modal-preset-btn py-2 px-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer text-center" data-val="10000">
              ৳10,000
            </button>
            <button type="button" class="amount-modal-preset-btn py-2 px-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer text-center" data-val="20000">
              ৳20,000
            </button>
          </div>
        </div>

        <!-- Custom Amount Input Field -->
        <div class="space-y-1.5">
          <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">
            Or Enter Custom Amount (৳)
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-3.5 text-lg font-black text-emerald-400 font-mono select-none">৳</span>
            <input id="amount-modal-input" type="number" min="20" step="10" value="500" class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-2xl py-3 pl-9 pr-14 text-white font-mono text-lg font-black outline-none shadow-inner" placeholder="500" />
            <span class="absolute right-3.5 text-[10px] font-mono text-slate-500 uppercase font-bold">BDT</span>
          </div>
          <div id="amount-modal-error" class="hidden text-[10.5px] text-rose-400 font-sans flex items-center gap-1.5 mt-1">
            <i class="fa-solid fa-circle-exclamation"></i> <span id="amount-modal-error-text">Minimum deposit is ৳20</span>
          </div>
        </div>

        <!-- Conversion / perks summary -->
        <div class="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl space-y-1.5 text-[10px] font-mono">
          <div class="flex justify-between items-center text-slate-300">
            <span>Transfer Type:</span>
            <span id="amount-modal-type-text" class="text-emerald-400 font-bold">Instant Auto-Credit ⚡</span>
          </div>
          <div class="flex justify-between items-center text-slate-400">
            <span>Gateway Processing Fee:</span>
            <span class="text-emerald-400 font-bold">৳0.00 (Zero Fee)</span>
          </div>
          <div id="amount-modal-crypto-row" class="hidden flex justify-between items-center text-purple-300">
            <span>Estimated Crypto:</span>
            <span id="amount-modal-crypto-text" class="font-bold">≈ $4.00 USD (USDT)</span>
          </div>
        </div>

        <!-- Proceed Action Button -->
        <div class="space-y-2 pt-1">
          <button id="amount-modal-confirm-btn" type="button" class="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black py-3 px-4 rounded-2xl transition duration-150 cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 font-mono">
            <i class="fa-solid fa-arrow-right"></i> <span id="amount-modal-confirm-lbl">Proceed to UddoktaPay ⚡</span>
          </button>
          <button id="amount-modal-cancel-btn" type="button" class="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white py-2.5 rounded-xl transition text-xs font-mono cursor-pointer" onclick="if(window.closeModal){window.closeModal('deposit-amount-modal')}">
            Cancel (বাতিল)
          </button>
        </div>

        <!-- Security Badge Footer -->
        <div class="flex items-center justify-center gap-3 text-[8.5px] text-slate-500 font-mono pt-1 border-t border-slate-900">
          <span><i class="fa-solid fa-lock text-emerald-400"></i> Encrypted 256-Bit SSL</span>
          <span>•</span>
          <span>Instant Balance Addition</span>
        </div>

      </div>
    </div>
`;
