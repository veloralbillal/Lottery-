<!-- ================= ADMIN TAB: POPUP EVENTS & BANNER SLIDERS ================= -->
<div id="admin-tab-events" class="space-y-6">
  <!-- POPUP EVENT MANAGER CARD -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
      <div class="space-y-0.5">
        <h3 class="text-xs font-bold font-mono tracking-wider uppercase text-cyan-400">Full-Screen Popup Event Configuration</h3>
        <p class="text-[10px] text-slate-500 font-sans">Set a beautiful interactive full-screen announcement overlay for users</p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input id="admin-popup-enabled" type="checkbox" class="sr-only peer">
        <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
      </label>
    </div>

    <form id="admin-popup-event-form" class="space-y-4 text-xs font-mono">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-[10px] uppercase tracking-wider text-slate-400">Popup Title</label>
          <input id="admin-popup-title" type="text" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-sans" placeholder="e.g. Eid Mega Draw Festival! 🎉">
        </div>
        <div class="space-y-1.5">
          <label class="text-[10px] uppercase tracking-wider text-slate-400">Action Button Text</label>
          <input id="admin-popup-action-text" type="text" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-sans" placeholder="e.g. Claim Bonus">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-[10px] uppercase tracking-wider text-slate-400">Popup Image URL</label>
          <input id="admin-popup-image-url" type="text" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-sans text-xs" placeholder="e.g. https://images.unsplash.com/photo-...">
        </div>
        <div class="space-y-1.5">
          <label class="text-[10px] uppercase tracking-wider text-slate-400">Target Redirect Tab</label>
          <select id="admin-popup-redirect-tab" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-sans">
            <option value="home">Home (Pools)</option>
            <option value="wallet">Wallet (Deposit & Cashout)</option>
            <option value="history">History</option>
            <option value="refer">Refer & Earn</option>
            <option value="jackpot">Mega Jackpot</option>
            <option value="tasks">Daily Missions</option>
            <option value="profile">User Profile</option>
          </select>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-[10px] uppercase tracking-wider text-slate-400">Popup Announcement Message</label>
        <textarea id="admin-popup-message" rows="3" class="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-sans text-xs leading-relaxed" placeholder="Write promotional rules, event highlights or custom instructions here..."></textarea>
      </div>

      <div class="flex items-center justify-end pt-2">
        <button id="save-popup-event-btn" type="button" class="bg-gradient-to-r from-cyan-500 to-rose-600 hover:scale-102 transition text-white font-black py-2.5 px-6 rounded-xl shadow-lg shadow-cyan-500/10 cursor-pointer text-xs">
          <i class="fa-solid fa-floppy-disk mr-1"></i> Save Popup Event Settings
        </button>
      </div>
    </form>
  </div>

  <!-- HOME BANNER SLIDER CARD -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
    <div class="border-b border-slate-800 pb-3">
      <h3 class="text-xs font-bold font-mono tracking-wider uppercase text-rose-500">Home Page Promotional Banner Slider</h3>
      <p class="text-[10px] text-slate-500 font-sans">Manage multiple rotating banners shown at the top of the Home (Pools) feed</p>
    </div>

    <!-- Active Banners List -->
    <div class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Active Sliding Banners</h4>
      <div id="admin-active-banners-container" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Banners rendered dynamically -->
      </div>
    </div>

    <!-- Add New Banner Form -->
    <div class="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-4">
      <h4 class="text-[10px] uppercase tracking-wider text-cyan-400 font-mono font-bold flex items-center gap-1.5">
        <i class="fa-solid fa-plus-circle"></i> Add New Promo Slider Banner
      </h4>
      <form id="admin-add-banner-form" class="space-y-3 text-xs font-mono">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase tracking-wider text-slate-400">Banner Title</label>
            <input id="admin-banner-title" type="text" class="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-sans" placeholder="e.g. Mega Giveaway Pool Active! 🎁">
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase tracking-wider text-slate-400">Subtitle/Promo Badge</label>
            <input id="admin-banner-subtitle" type="text" class="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-sans" placeholder="e.g. Free ৳50 signup ticket bonus">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase tracking-wider text-slate-400">Banner Image URL</label>
            <input id="admin-banner-image" type="text" class="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-sans text-xs" placeholder="e.g. https://images.unsplash.com/...">
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase tracking-wider text-slate-400">Target Action Link / Tab</label>
            <select id="admin-banner-link-tab" class="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-sans">
              <option value="home">Home (Pools)</option>
              <option value="wallet">Wallet (Deposit & Cashout)</option>
              <option value="history">History</option>
              <option value="refer">Refer & Earn</option>
              <option value="jackpot">Mega Jackpot</option>
              <option value="tasks">Daily Missions</option>
              <option value="profile">User Profile</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end pt-1">
          <button id="add-new-banner-btn" type="button" class="bg-gradient-to-r from-red-600 to-rose-600 hover:scale-102 transition text-white font-black py-2 px-5 rounded-xl shadow-lg cursor-pointer text-xs">
            <i class="fa-solid fa-plus-circle mr-1"></i> Add Banner Slide
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ADVANCED ADMIN OPERATIONS AND CONTROL DECK -->
  <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
    <div class="border-b border-slate-800 pb-3">
      <h3 class="text-xs font-bold font-mono tracking-wider uppercase text-yellow-500">Advanced Developer & Database Control Deck</h3>
      <p class="text-[10px] text-slate-500 font-sans">System tuning, pool reset, financial fee controls and sandbox simulations</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
      <!-- Fee Override & Commission Controls -->
      <div class="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-3">
        <h4 class="text-[10px] uppercase font-bold text-yellow-400">Deposit & Payout Fee Adjustments</h4>
        <div class="space-y-3">
          <div class="space-y-1">
            <label class="text-[9px] uppercase text-slate-400">bKash / MFS Deposit Charge (%)</label>
            <input id="admin-dep-charge-pct" type="number" step="0.1" class="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" placeholder="e.g. 0.0">
          </div>
          <div class="space-y-1">
            <label class="text-[9px] uppercase text-slate-400">MFS Withdrawal / Cashout Charge (%)</label>
            <input id="admin-withdraw-charge-pct" type="number" step="0.1" class="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" placeholder="e.g. 2.0">
          </div>
          <div class="flex justify-end">
            <button id="save-adv-fees-btn" class="bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer">
              Update Fees
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Database Sandbox Trigger Controls -->
      <div class="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
        <div>
          <h4 class="text-[10px] uppercase font-bold text-red-400">Emergency System Operations</h4>
          <p class="text-[9.5px] text-slate-500 font-sans mt-1 leading-normal">Perform complete local DB resets or trigger instant mock player deposit simulations for load testing.</p>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-2">
          <button id="sim-deposit-pulse-btn" class="bg-emerald-950 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-900 text-[10px] font-bold p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-spinner animate-spin text-emerald-500 hidden" id="pulse-spinner"></i>
            <i class="fa-solid fa-money-bill-wave text-emerald-400" id="pulse-icon"></i> Sim Deposits
          </button>
          <button id="factory-reset-db-btn" class="bg-red-950 border border-red-800/60 text-red-400 hover:bg-red-900 text-[10px] font-bold p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-triangle-exclamation"></i> Full DB Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
