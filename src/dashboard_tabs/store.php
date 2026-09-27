<!-- Digital Store Front - tab-store (Mobile-First Redesign) -->
<div class="space-y-5 pb-24 font-sans text-slate-100 max-w-md mx-auto px-1 sm:px-2">
  
  <!-- Premium Mini Glassmorphic Header -->
  <div class="bg-gradient-to-br from-slate-900 via-[#101726] to-[#0b1220] border border-slate-800/80 p-5 rounded-3xl relative overflow-hidden shadow-xl">
    <div class="absolute -right-10 -top-10 w-36 h-36 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none"></div>
    <div class="absolute -left-10 -bottom-10 w-36 h-36 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>
    
    <div class="relative z-10 flex justify-between items-start">
      <div class="space-y-1">
        <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5 leading-tight">
          LuckyBox <span class="text-cyan-400">Shop</span>
        </h2>
        <!-- Metadata: Unboxed quiet text with separators -->
        <div class="flex items-center gap-1.5 text-[9.5px] text-slate-500 font-mono">
          <span>Instant Key</span>
          <span>·</span>
          <span>Automatic Access</span>
        </div>
      </div>
      
      <!-- Balance Display Widget -->
      <div class="bg-slate-950/80 border border-slate-850 px-3.5 py-2 rounded-2xl flex flex-col items-end shadow-inner">
        <span class="text-[7.5px] text-slate-500 uppercase tracking-widest font-mono">Your Balance</span>
        <strong id="store-user-wallet-balance" class="text-emerald-400 text-xs font-black font-mono">৳0.00</strong>
      </div>
    </div>
  </div>

  <!-- Realtime Buyer Activity Stream Widget -->
  <div id="store-live-notify" class="bg-slate-950/40 border border-slate-900 p-2.5 rounded-2xl flex items-center justify-between text-[10px] font-mono shadow-md">
    <div class="flex items-center gap-2 text-slate-400 min-w-0">
      <span class="relative flex h-2 w-2 shrink-0">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span id="store-live-notify-text" class="text-slate-300 font-medium truncate">Syncing catalog index...</span>
    </div>
    <span class="text-[8px] bg-slate-900 border border-slate-850 text-slate-400 px-2 py-0.5 rounded-md uppercase shrink-0 font-bold ml-1.5">LIVE</span>
  </div>

  <!-- Segmented Sub-Tab Bar - Sticky layout below header -->
  <div class="bg-slate-900/90 border border-slate-850/80 p-1.5 rounded-2xl flex items-center gap-1 shadow-lg sticky top-2 z-30 backdrop-blur-md font-mono text-[9px] font-black uppercase tracking-wider">
    <button id="store-subtab-catalog" class="flex-1 py-3 text-center rounded-xl bg-slate-950 text-cyan-400 border border-slate-850 transition duration-200 active:scale-95 cursor-pointer">
      <i class="fa-solid fa-border-all text-[11px] block mb-0.5"></i> Catalog
    </button>
    <button id="store-subtab-wishlist" class="flex-1 py-3 text-center rounded-xl hover:bg-slate-950/50 text-slate-400 hover:text-white transition duration-200 active:scale-95 cursor-pointer">
      <i class="fa-solid fa-heart text-rose-500 text-[11px] block mb-0.5"></i> Saved
    </button>
    <button id="store-subtab-orders" class="flex-1 py-3 text-center rounded-xl hover:bg-slate-950/50 text-slate-400 hover:text-white transition duration-200 active:scale-95 cursor-pointer">
      <i class="fa-solid fa-box-open text-[11px] block mb-0.5"></i> Orders
    </button>
    <button id="store-subtab-support" class="flex-1 py-3 text-center rounded-xl hover:bg-slate-950/50 text-slate-400 hover:text-white transition duration-200 active:scale-95 cursor-pointer">
      <i class="fa-solid fa-headset text-indigo-400 text-[11px] block mb-0.5"></i> Support
    </button>
  </div>

  <!-- Quick Search & Cart Widget -->
  <div class="grid grid-cols-12 gap-2">
    <!-- Search -->
    <div class="col-span-9 relative">
      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><i class="fa-solid fa-magnifying-glass text-xs"></i></span>
      <input type="text" id="store-search-input" class="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/60 rounded-2xl py-3 pl-9 pr-3 text-xs text-white outline-none placeholder-slate-600 transition" placeholder="Search templates, sheets..." />
    </div>

    <!-- Quick Floating Cart Icon -->
    <div class="col-span-3">
      <button id="store-cart-toggle-btn" class="w-full h-full bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-2xl flex items-center justify-center relative cursor-pointer shadow-lg active:scale-95 transition min-h-[44px]">
        <i class="fa-solid fa-cart-shopping text-base text-white"></i>
        <span id="store-cart-badge" class="absolute -top-1.5 -right-1.5 bg-rose-500 border-2 border-[#090e1c] text-white font-black px-2 py-0.5 rounded-full text-[8.5px] scale-95 shadow">0</span>
      </button>
    </div>
  </div>

  <!-- Horizontal Scrollable Categories Filter Bar -->
  <div class="space-y-1.5">
    <div id="store-categories-list" class="flex items-center gap-1.5 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-none font-mono">
      <!-- Horizontally scrolling categories populated dynamically via JS -->
      <div class="text-[10px] text-slate-650 py-1">Loading store catalog index...</div>
    </div>
  </div>

  <!-- Catalog View Panel -->
  <div id="store-main-catalog-panel" class="space-y-4">
    <!-- Header with Sort Select -->
    <div class="flex justify-between items-center bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl">
      <div class="min-w-0 flex-1">
        <h3 id="store-active-category-title" class="text-xs font-black text-white font-mono flex items-center gap-1.5">
          <i class="fa-solid fa-layer-group text-cyan-400"></i> Loading catalog...
        </h3>
      </div>
      <div class="flex items-center gap-1.5 shrink-0 ml-2">
        <select id="store-sort-select" class="bg-slate-950 border border-slate-850 text-[9px] text-slate-300 p-1.5 rounded-xl font-mono focus:border-cyan-500 outline-none cursor-pointer">
          <option value="popular">Popular</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>

    <!-- Empty Slate -->
    <div id="store-catalog-empty" class="hidden bg-slate-900 border border-slate-850 p-10 rounded-3xl text-center space-y-2.5">
      <div class="w-12 h-12 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-600 mx-auto text-lg">
        <i class="fa-solid fa-folder-open"></i>
      </div>
      <h4 class="text-xs font-bold text-white">No products matched query</h4>
      <p class="text-[10px] text-slate-500 max-w-xs mx-auto">Try typing another query or switching the category tab.</p>
    </div>

    <!-- Products Grid (Mobile Optimized Card Pack Layout) -->
    <div id="store-products-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <!-- Populated dynamically with high contrast single-elevation touchable cards -->
      <div class="col-span-full py-16 text-center text-xs text-slate-500 font-mono">
        <i class="fa-solid fa-spinner animate-spin text-cyan-400 block mb-2"></i>
        Loading catalog inventory...
      </div>
    </div>
  </div>

  <!-- Wishlist View Panel (Hidden by default) -->
  <div id="store-wishlist-panel" class="hidden space-y-4">
    <div class="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl">
      <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5">
        <i class="fa-solid fa-heart text-rose-500"></i> Saved Products
      </h3>
    </div>
    
    <div id="store-wishlist-empty" class="bg-slate-900 border border-slate-850 p-10 rounded-3xl text-center space-y-2.5">
      <div class="w-12 h-12 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-rose-950/40 mx-auto text-lg">
        <i class="fa-solid fa-heart"></i>
      </div>
      <h4 class="text-xs font-bold text-white font-mono">Wishlist is empty</h4>
      <p class="text-[10px] text-slate-550 max-w-xs mx-auto">Save premium assets by clicking the heart button inside the catalog.</p>
    </div>

    <div id="store-wishlist-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <!-- Saved items render here -->
    </div>
  </div>

  <!-- Purchases / Order Logs Panel (Hidden by default) -->
  <div id="store-orders-panel" class="hidden space-y-4">
    <div class="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl flex justify-between items-center">
      <div>
        <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5">
          <i class="fa-solid fa-box-open text-cyan-400"></i> Purchase Logs
        </h3>
      </div>
      <button id="store-refresh-orders-btn" class="bg-slate-950 border border-slate-850 text-[8.5px] text-slate-400 font-bold px-3 py-2 rounded-xl font-mono active:scale-95 transition flex items-center gap-1">
        <i class="fa-solid fa-rotate text-[8px]"></i> Refresh
      </button>
    </div>

    <div id="store-orders-empty" class="bg-slate-900 border border-slate-850 p-10 rounded-3xl text-center space-y-2.5">
      <div class="w-12 h-12 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-650 mx-auto text-lg">
        <i class="fa-solid fa-cloud-arrow-down"></i>
      </div>
      <h4 class="text-xs font-bold text-white font-mono">No purchases logged</h4>
      <p class="text-[10px] text-slate-550 max-w-xs mx-auto">Orders you place with your wallet will generate instant download tokens here.</p>
    </div>

    <div id="store-orders-list" class="space-y-3 font-mono text-[10.5px]">
      <!-- Purchase logs populated dynamically -->
    </div>
  </div>

  <!-- Helpdesk Support Panel (Hidden by default) -->
  <div id="store-support-panel" class="hidden space-y-4">
    <div class="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl">
      <h3 class="text-xs font-black text-white font-mono flex items-center gap-1.5">
        <i class="fa-solid fa-headset text-indigo-400 animate-pulse"></i> Store Helpdesk Support
      </h3>
    </div>

    <!-- Lodge support ticket card -->
    <div class="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4">
      <span class="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider font-mono">Lodge New Help Request</span>
      <form id="store-support-form" class="space-y-3.5 text-xs">
        <div class="space-y-1">
          <label class="block text-slate-400 text-[8.5px] uppercase font-bold font-mono">Request Subject</label>
          <select id="store-support-subject" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-cyan-500 text-xs">
            <option value="Product Configuration">Template Setup Help</option>
            <option value="Download Issue">File Download Problem</option>
            <option value="Payment Validation">Wallet / Balance Issue</option>
            <option value="Custom Modification Request">Custom Feature Request</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="block text-slate-400 text-[8.5px] uppercase font-bold font-mono">Message Description</label>
          <textarea id="store-support-message" rows="3" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-cyan-500 placeholder-slate-700 text-xs" placeholder="Detail your transaction error or setup query..." required></textarea>
        </div>
        <button type="submit" class="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black py-3 rounded-xl uppercase tracking-wider font-mono text-[9.5px] active:scale-95 transition cursor-pointer">Submit Help Ticket</button>
      </form>
    </div>

    <!-- Active Tickets Queue List -->
    <div class="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-3.5">
      <span class="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider font-mono">Active Support Records</span>
      <div id="store-support-tickets-list" class="space-y-2.5 max-h-[250px] overflow-y-auto pr-0.5 scrollbar-thin">
        <div class="text-[9px] text-slate-600 text-center py-10">No support history registered.</div>
      </div>
    </div>
  </div>

  <!-- Cart Slide-Up Drawer / Bottom Sheet (Mobile Optimized Touch Experience) -->
  <div id="store-cart-drawer" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
    <!-- Bottom Sheet Container (Slides up on mobile screens, matches center on desktop previews) -->
    <div class="absolute bottom-0 left-0 right-0 max-h-[82vh] bg-[#0c1221] border-t border-slate-850 rounded-t-[32px] shadow-2xl flex flex-col max-w-md mx-auto">
      
      <!-- Top Handle indicator bar -->
      <div class="w-12 h-1 bg-slate-800 rounded-full mx-auto my-3 shrink-0"></div>

      <!-- Header -->
      <div class="px-5 pb-4 border-b border-slate-850/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-cart-shopping text-cyan-400 text-base"></i>
          <div>
            <h3 class="text-xs font-extrabold text-white font-mono">Your Shopping Cart</h3>
            <p class="text-[8.5px] text-slate-500">Review items before balance checkout.</p>
          </div>
        </div>
        <button id="store-cart-close-btn" class="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer active:scale-95">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>

      <!-- Scrollable Cart List -->
      <div id="store-cart-items-container" class="flex-1 overflow-y-auto p-5 space-y-3.5 scrollbar-thin max-h-[40vh]">
        <!-- Rendered dynamically -->
      </div>

      <!-- Checkout panel & summary -->
      <div class="p-5 border-t border-slate-850 bg-slate-950/60 space-y-4 font-mono text-[10px]">
        <div class="space-y-1.5">
          <div class="flex justify-between text-slate-500">
            <span>Items Sub-Total:</span>
            <span id="store-cart-summary-subtotal" class="text-slate-300 font-bold">৳0.00</span>
          </div>
          <div class="flex justify-between border-t border-slate-850/40 pt-2 text-xs font-black text-white">
            <span>Total Payable:</span>
            <span id="store-cart-summary-total" class="text-cyan-400 font-extrabold">৳0.00</span>
          </div>
        </div>

        <div id="store-cart-checkout-actions" class="grid grid-cols-3 gap-2 pt-1">
          <button id="store-cart-clear-btn" class="col-span-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 font-bold py-3 rounded-xl text-[8.5px] uppercase cursor-pointer transition active:scale-95 text-center">
            Clear
          </button>
          <button id="store-cart-checkout-btn" class="col-span-2 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:brightness-110 text-white font-extrabold py-3 rounded-xl text-[9px] uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 transition">
            <i class="fa-solid fa-lock text-[10px]"></i> Pay with Wallet
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Review Modal Panel -->
  <div id="store-review-modal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-[#0b1021] border border-slate-850 p-5 rounded-3xl max-w-xs w-full space-y-4 shadow-2xl relative font-sans">
      <div class="flex justify-between items-center pb-2 border-b border-slate-850">
        <h4 class="text-xs font-black text-white font-mono flex items-center gap-1.5">
          <i class="fa-solid fa-star text-yellow-500 animate-pulse"></i> Submit Product Review
        </h4>
        <button id="store-review-close-btn" class="text-slate-400 hover:text-white transition text-xs"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <form id="store-review-form" class="space-y-4 text-xs">
        <input type="hidden" id="store-review-product-id" />
        <div class="space-y-1.5">
          <label class="block text-slate-400 text-[8.5px] uppercase font-bold font-mono">Select Star Rating</label>
          <div class="flex items-center gap-2.5 text-xl" id="store-rating-stars-container">
            <button type="button" class="store-rating-star text-slate-650 hover:text-yellow-400 transition" data-rating="1"><i class="fa-solid fa-star"></i></button>
            <button type="button" class="store-rating-star text-slate-650 hover:text-yellow-400 transition" data-rating="2"><i class="fa-solid fa-star"></i></button>
            <button type="button" class="store-rating-star text-slate-650 hover:text-yellow-400 transition" data-rating="3"><i class="fa-solid fa-star"></i></button>
            <button type="button" class="store-rating-star text-slate-650 hover:text-yellow-400 transition" data-rating="4"><i class="fa-solid fa-star"></i></button>
            <button type="button" class="store-rating-star text-slate-650 hover:text-yellow-400 transition" data-rating="5"><i class="fa-solid fa-star"></i></button>
          </div>
          <input type="hidden" id="store-review-rating-value" value="5" />
        </div>

        <div class="space-y-1.5">
          <label class="block text-slate-400 text-[8.5px] uppercase font-bold font-mono">Review Comments</label>
          <textarea id="store-review-comment" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500 text-xs" placeholder="What did you like about this asset?" required></textarea>
        </div>

        <button type="submit" class="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black py-2.5 rounded-xl uppercase font-mono tracking-wider text-[9px] cursor-pointer transition active:scale-95">Submit Review</button>
      </form>
    </div>
  </div>

</div>
