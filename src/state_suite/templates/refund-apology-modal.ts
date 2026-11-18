export const refundApologyModalTemplate = `
    <!-- ================= MODAL: LOTTERY REFUND NOTIFICATION (BENGALI APOLOGY) ================= -->
    <div id="lottery-refund-apology-modal" class="hidden fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[99999] overflow-y-auto">
      <div class="max-w-md w-full bg-slate-950 border border-red-500/30 rounded-3xl p-6 shadow-2xl shadow-red-950/20 relative space-y-5 my-auto animate-in fade-in zoom-in-95 duration-200 text-center">
        
        <!-- Apology Icon with Pulse -->
        <div class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-2xl mx-auto animate-pulse">
          🙏
        </div>

        <div class="space-y-2">
          <h3 class="text-base font-black text-red-400 uppercase tracking-wide">আন্তরিকভাবে দুঃখিত ও ক্ষমাপ্রার্থী</h3>
          <p class="text-xs text-slate-300 font-medium leading-relaxed font-sans" id="refund-apology-message-body">
            লটারির নির্ধারিত সকল টিকেট বিক্রি না হওয়ায় ড্র সম্পন্ন করা সম্ভব হয়নি। আপনাদের কষ্টের টাকা স্বয়ংক্রিয়ভাবে ওয়ালেটে রিফান্ড করে দেওয়া হয়েছে।
          </p>
        </div>

        <!-- Details Box -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-left font-mono space-y-2 text-[11px]">
          <div class="flex justify-between border-b border-slate-800 pb-1.5 text-slate-400">
            <span>লটারি নাম:</span>
            <strong class="text-white" id="refund-modal-lottery-name">N/A</strong>
          </div>
          <div class="flex justify-between border-b border-slate-800 pb-1.5 text-slate-400">
            <span>টিকেট টার্গেট:</span>
            <strong class="text-amber-400" id="refund-modal-target-count">20</strong>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>রিফান্ড কৃত টাকা:</span>
            <strong class="text-emerald-400 font-bold">৳<span id="refund-modal-amount">0.00</span> BDT</strong>
          </div>
        </div>

        <!-- Button -->
        <button id="close-refund-apology-modal-btn" type="button" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white font-black py-3 px-4 rounded-xl transition duration-150 cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 font-sans" onclick="if(window.closeModal){window.closeModal('lottery-refund-apology-modal')}">
          ঠিক আছে, বুঝতে পেরেছি (Ok) 👍
        </button>
      </div>
    </div>
`;
