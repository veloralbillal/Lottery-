/**
 * LuckyBox Shop - UI Templates
 * Separates the HTML structure from the business logic.
 */

export class StoreUI {
  static getStoreShellHTML(settings?: any) {
    const shopName = settings?.name || "LuckyBox Shop";
    const shopTagline = settings?.tagline || "Premium Assets Hub";
    return `
      <!-- Store Custom Header -->
      <header class="bg-[#0f0f12]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div class="flex items-center gap-3">
          <button id="store-back-to-lottery" class="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition active:scale-95">
            <i class="fa-solid fa-arrow-left text-slate-300"></i>
          </button>
          <div>
            <h1 id="store-header-name" class="text-sm font-black tracking-tight text-white uppercase italic">${shopName}</h1>
            <p id="store-header-tagline" class="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">${shopTagline}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Store Wallet Balance -->
          <div class="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-2xl flex items-center gap-1.5">
            <span class="text-[10px] text-emerald-500 font-black">৳</span>
            <span id="store-header-balance" class="text-xs font-black text-white curr-balance">0.00</span>
          </div>
          <!-- Cart Icon -->
          <button id="store-header-cart-btn" class="relative w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition active:scale-95">
            <i class="fa-solid fa-shopping-bag text-base"></i>
            <span id="store-cart-badge-header" class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0a0c] hidden">0</span>
          </button>
        </div>
      </header>

      <!-- Store Main Viewport -->
      <main id="store-viewport" class="flex-grow pb-24 overflow-y-auto custom-scrollbar">
        <!-- Content will be injected here via StoreTab.render() -->
        <div id="store-content-area" class="animate-in fade-in slide-in-from-bottom-4 duration-500"></div>
      </main>

      <!-- Store Bottom Navigation Bar -->
      <nav class="bg-[#0f0f12]/95 backdrop-blur-2xl border-t border-white/5 fixed bottom-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button class="store-nav-btn flex flex-col items-center gap-1 transition-all active:scale-90" data-tab="catalog">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] text-slate-950" id="store-nav-icon-catalog">
            <i class="fa-solid fa-house-chimney text-base"></i>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest text-cyan-400">Shop</span>
        </button>

        <button class="store-nav-btn flex flex-col items-center gap-1 transition-all active:scale-90 opacity-40" data-tab="categories">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center transition-all" id="store-nav-icon-categories">
            <i class="fa-solid fa-layer-group text-base text-slate-400"></i>
          </div>
          <span class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Browse</span>
        </button>

        <button class="store-nav-btn flex flex-col items-center gap-1 transition-all active:scale-90 opacity-40" data-tab="wishlist">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center transition-all" id="store-nav-icon-wishlist">
            <i class="fa-solid fa-heart text-base text-slate-400"></i>
          </div>
          <span class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Saved</span>
        </button>

        <button class="store-nav-btn flex flex-col items-center gap-1 transition-all active:scale-90 opacity-40" data-tab="orders">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center transition-all" id="store-nav-icon-orders">
            <i class="fa-solid fa-box-open text-base text-slate-400"></i>
          </div>
          <span class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Orders</span>
        </button>

        <button class="store-nav-btn flex flex-col items-center gap-1 transition-all active:scale-90 opacity-40" data-tab="profile">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center transition-all" id="store-nav-icon-profile">
            <i class="fa-solid fa-circle-user text-base text-slate-400"></i>
          </div>
          <span class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Profile</span>
        </button>
      </nav>
    `;
  }

  static getCatalogHTML(categories: any[], settings?: any) {
    const shopName = settings?.name || "LuckyBox";
    const shopTagline = settings?.tagline || "Premium digital assets for developers.";
    const globalSettings = (window as any).app?.db?.settings;
    const isMaintenance = globalSettings?.shopMaintenanceMode === true || settings?.isOpen === false || settings?.isMaintenance === true;

    return `
      <div class="px-4 py-4 space-y-6 store-animate-fade">
        ${isMaintenance ? `
          <div class="bg-gradient-to-r from-rose-950/80 to-amber-950/80 border border-rose-500/40 p-6 rounded-3xl text-center space-y-2 shadow-2xl animate-pulse">
            <i class="fa-solid fa-screwdriver-wrench text-amber-400 text-3xl"></i>
            <h3 class="text-white font-black uppercase tracking-tight text-base">⚠️ SHOP UNDER MAINTENANCE</h3>
            <p class="text-xs text-rose-300 font-medium">Digital Shop operations and product purchases are temporarily paused by administration. Please check back soon.</p>
          </div>
        ` : ''}

        <!-- Search Bar -->
        <div class="relative group">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition"></i>
          <input type="text" id="store-catalog-search" placeholder="Search premium templates..." class="w-full bg-[#16161a] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-cyan-500/50 transition shadow-inner">
        </div>

        <!-- Hero Banners -->
        <div class="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
          <img src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop" class="w-full h-full object-cover opacity-60">
          <div class="absolute inset-0 p-6 flex flex-col justify-center gap-2">
            <span class="text-[10px] font-black bg-cyan-500 text-slate-950 px-2 py-1 rounded-lg w-fit uppercase tracking-tighter">New Arrival</span>
            <h2 class="text-xl font-black text-white leading-tight">Elite PHP<br>Lottery Engine</h2>
            <p class="text-[10px] text-slate-300 max-w-[180px]">Instant setup, secure SQL, and mobile-ready dashboard.</p>
          </div>
        </div>

        <!-- Category Grid -->
        <div class="grid grid-cols-4 gap-3">
          ${categories.filter(c => c.id !== 'all').map(cat => `
            <button class="store-category-chip flex flex-col items-center gap-2 group transition active:scale-95" data-cat="${cat.id}">
              <div class="w-14 h-14 rounded-2xl bg-[#16161a] border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition shadow-lg">
                <i class="fa-solid ${cat.icon} text-lg"></i>
              </div>
              <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">${cat.label.split(' ').pop()}</span>
            </button>
          `).join('')}
        </div>

        <!-- Section Title -->
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black uppercase tracking-tight text-white italic">Featured <span class="text-cyan-400">Products</span></h3>
          <button class="text-[10px] font-bold text-slate-500 hover:text-cyan-400 transition uppercase tracking-widest">See All <i class="fa-solid fa-chevron-right ml-1"></i></button>
        </div>

        <!-- Products Grid -->
        <div id="store-catalog-grid" class="grid grid-cols-2 gap-4 pb-8">
           <div class="col-span-full py-12 text-center text-xs text-slate-500 font-mono italic">Syncing with SQL master database...</div>
        </div>
      </div>
    `;
  }

  static getProductCardHTML(p: any, inWish: boolean) {
    return `
      <div class="bg-[#16161a] border border-white/5 rounded-3xl p-3 flex flex-col gap-3 shadow-2xl hover:border-cyan-500/30 transition group relative animate-in zoom-in-95 duration-300">
        <div class="relative aspect-square rounded-2xl overflow-hidden bg-black/40 cursor-pointer store-item-click-target">
          <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-90 group-hover:opacity-100">
          <button class="wish-toggle-btn absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center transition active:scale-90 ${inWish ? 'text-rose-500' : 'text-slate-300'}">
            <i class="fa-${inWish ? 'solid' : 'regular'} fa-heart text-[10px]"></i>
          </button>
        </div>
        
        <div class="space-y-1.5 px-0.5">
          <div class="flex items-center justify-between">
            <span class="text-[8px] font-black text-cyan-400/80 uppercase tracking-tighter">${p.category}</span>
            <div class="flex items-center gap-1 text-[8px] font-bold text-yellow-500">
              <i class="fa-solid fa-star"></i>
              <span>${p.stars}</span>
            </div>
          </div>
          <h4 class="text-[11px] font-black text-white leading-tight line-clamp-1 group-hover:text-cyan-400 transition cursor-pointer store-item-click-target">${p.title}</h4>
          
          <div class="flex items-center justify-between pt-1">
            <span class="text-xs font-black text-white">৳${p.price.toFixed(0)}</span>
            <button class="add-to-cart-btn w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center hover:bg-cyan-400 transition active:scale-90">
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static getDetailsHTML(product: any) {
    return `
      <div class="px-4 py-4 space-y-6 pb-20 store-animate-fade">
        <div class="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/5">
          <img src="${product.image}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent"></div>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
             <span class="text-[10px] font-black text-cyan-400 uppercase tracking-widest">${product.category}</span>
             <h2 class="text-2xl font-black text-white leading-tight tracking-tight">${product.title}</h2>
          </div>

          <div class="flex items-center gap-4 py-3 border-y border-white/5">
             <div class="flex flex-col">
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Asset Price</span>
                <span class="text-lg font-black text-white">৳${product.price.toFixed(2)}</span>
             </div>
             <div class="flex flex-col">
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Downloads</span>
                <span class="text-lg font-black text-cyan-400">${product.sales || 0}</span>
             </div>
             <div class="flex flex-col">
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Rating</span>
                <span class="text-lg font-black text-yellow-500">★ ${product.stars}</span>
             </div>
          </div>

          <div class="space-y-2">
            <h4 class="text-xs font-black text-white uppercase tracking-widest">Asset Description</h4>
            <p class="text-xs text-slate-400 leading-relaxed font-medium">${product.description}</p>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-4">
             <button id="store-details-add-cart" class="py-4 rounded-2xl bg-[#16161a] border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/5 transition active:scale-95">Add to Cart</button>
             <button id="store-details-buy-now" class="py-4 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 transition active:scale-95">Buy Now</button>
          </div>
          <button id="store-details-share" class="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition active:scale-95 flex items-center justify-center gap-2">
            <i class="fa-solid fa-share-nodes text-cyan-400"></i> Share Asset Link
          </button>
        </div>
      </div>
    `;
  }

  static getCartEmptyHTML() {
    return `
      <div class="px-4 py-20 flex flex-col items-center justify-center text-center gap-4 store-animate-fade">
        <div class="w-20 h-20 rounded-full bg-[#16161a] flex items-center justify-center text-slate-700 border border-white/5 mb-2">
          <i class="fa-solid fa-cart-shopping text-3xl"></i>
        </div>
        <h3 class="text-lg font-black text-white">Your cart is empty</h3>
        <p class="text-xs text-slate-500 max-w-[200px]">Looks like you haven't added any premium assets yet.</p>
        <button id="cart-back-to-shop" class="mt-4 px-8 py-3 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-widest active:scale-95 transition">Explore Shop</button>
      </div>
    `;
  }

  static getCartHTML(cart: any[], total: number) {
    return `
      <div class="px-4 py-6 space-y-6 pb-32 store-animate-fade">
        <h2 class="text-xl font-black text-white italic tracking-tight">Shopping <span class="text-cyan-400">Cart</span></h2>
        
        <div class="space-y-4">
          ${cart.map(item => `
            <div class="bg-[#16161a] border border-white/5 p-4 rounded-3xl flex items-center gap-4 shadow-xl">
               <div class="w-16 h-16 rounded-2xl bg-black/40 overflow-hidden shrink-0">
                  <img src="${item.image}" class="w-full h-full object-cover">
               </div>
               <div class="flex-grow min-w-0">
                  <h4 class="text-xs font-black text-white truncate">${item.title}</h4>
                  <p class="text-[10px] font-bold text-cyan-400">৳${item.price.toFixed(2)}</p>
                  <div class="flex items-center gap-3 mt-2">
                     <button class="cart-qty-btn bg-white/5 w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 border border-white/5" data-id="${item.id}" data-action="dec">-</button>
                     <span class="text-xs font-black text-white">${item.qty}</span>
                     <button class="cart-qty-btn bg-white/5 w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 border border-white/5" data-id="${item.id}" data-action="inc">+</button>
                  </div>
               </div>
               <button class="cart-remove-btn text-slate-600 hover:text-rose-500 transition px-2" data-id="${item.id}">
                  <i class="fa-solid fa-trash-can"></i>
               </button>
            </div>
          `).join('')}
        </div>

        <div class="bg-[#16161a] border border-white/5 p-6 rounded-3xl space-y-4 shadow-inner">
           <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-500 uppercase tracking-widest">Subtotal</span>
              <span class="font-black text-white">৳${total.toFixed(2)}</span>
           </div>
           <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-500 uppercase tracking-widest">Digital Tax</span>
              <span class="font-black text-emerald-500">FREE</span>
           </div>
           <div class="pt-4 border-t border-white/5 flex justify-between items-center">
              <span class="text-sm font-black text-white uppercase tracking-tight">Total Payable</span>
              <span class="text-xl font-black text-cyan-400 italic">৳${total.toFixed(2)}</span>
           </div>
           <button id="cart-proceed-to-checkout" class="w-full py-4 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition">Checkout Now</button>
        </div>
      </div>
    `;
  }

  static getCheckoutHTML(balance: number, total: number, cart: any[], canPay: boolean) {
    return `
      <div class="px-4 py-6 space-y-6 store-animate-fade">
        <h2 class="text-xl font-black text-white italic tracking-tight">Secure <span class="text-cyan-400">Checkout</span></h2>

        <div class="bg-[#16161a] border border-white/5 p-6 rounded-3xl space-y-6 shadow-2xl">
          <div class="flex items-center gap-4 p-4 rounded-2xl bg-black/30 border border-white/5">
             <div class="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <i class="fa-solid fa-wallet text-xl"></i>
             </div>
             <div class="flex flex-col">
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Available Balance</span>
                <span class="text-base font-black text-emerald-400">৳${balance.toFixed(2)}</span>
             </div>
          </div>

          <div class="space-y-3">
             <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Summary</span>
             <div class="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                ${cart.map(i => `
                  <div class="flex justify-between text-xs">
                    <span class="text-slate-400 truncate max-w-[150px]">${i.title} (x${i.qty})</span>
                    <span class="font-black text-white">৳${(i.price * i.qty).toFixed(2)}</span>
                  </div>
                `).join('')}
             </div>
          </div>

          <div class="pt-6 border-t border-white/5 flex justify-between items-center">
             <span class="text-sm font-black text-white uppercase tracking-tight">Total Deduction</span>
             <span class="text-xl font-black text-rose-500 italic">৳${total.toFixed(2)}</span>
          </div>

          ${!canPay ? `
            <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center font-bold">
               Insufficient funds in your lottery wallet.
            </div>
          ` : ''}

          <button id="checkout-confirm-btn" class="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition ${!canPay ? 'opacity-50 cursor-not-allowed' : ''}">
             ${canPay ? 'Confirm & Purchase' : 'Deposit More Taka'}
          </button>
          
          <p class="text-[9px] text-slate-600 text-center uppercase font-bold tracking-widest flex items-center justify-center gap-1">
             <i class="fa-solid fa-shield-halved text-emerald-500"></i> SSL Secure End-to-End Encryption
          </p>
        </div>
      </div>
    `;
  }

  static getProfileHTML(user: any) {
    return `
      <div class="px-4 py-6 space-y-6 pb-24 store-animate-fade">
        <h2 class="text-xl font-black text-white italic tracking-tight">Account <span class="text-cyan-400">Settings</span></h2>
        
        <!-- User Info Card -->
        <div class="bg-[#16161a] border border-white/5 p-5 rounded-3xl flex items-center gap-4 shadow-2xl">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg">
            <i class="fa-solid fa-user text-2xl"></i>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-black text-white">@${user.username}</span>
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${user.role || 'Member'}</span>
            <span class="text-[10px] font-bold text-cyan-400 mt-1">৳${user.balance.toFixed(2)} Balance</span>
          </div>
        </div>

        <!-- Settings List -->
        <div class="space-y-3">
          <button id="profile-nav-orders" class="w-full bg-[#16161a] border border-white/5 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <i class="fa-solid fa-cloud-arrow-down"></i>
              </div>
              <span class="text-xs font-bold text-slate-300 group-hover:text-white transition">My Downloads</span>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-700 text-xs"></i>
          </button>

          <button id="profile-nav-address" class="w-full bg-[#16161a] border border-white/5 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <i class="fa-solid fa-location-dot"></i>
              </div>
              <span class="text-xs font-bold text-slate-300 group-hover:text-white transition">Shipping Address</span>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-700 text-xs"></i>
          </button>

          <button id="profile-nav-help" class="w-full bg-[#16161a] border border-white/5 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <i class="fa-solid fa-headset"></i>
              </div>
              <span class="text-xs font-bold text-slate-300 group-hover:text-white transition">Help & Support</span>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-700 text-xs"></i>
          </button>

          ${(user.role === 'admin' || user.role === 'moderator') ? `
            <button id="profile-nav-admin" class="w-full bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition mt-6">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500 border border-rose-500/30">
                  <i class="fa-solid fa-user-shield"></i>
                </div>
                <span class="text-xs font-black text-rose-400 uppercase tracking-tighter">Shop Admin Control</span>
              </div>
              <i class="fa-solid fa-arrow-right text-rose-500 text-xs"></i>
            </button>
          ` : ''}
        </div>

        <div id="profile-sub-view" class="pt-4 animate-in fade-in slide-in-from-top-4 duration-300 hidden">
           <!-- Dynamic sub-view for Address or Support form -->
        </div>
      </div>
    `;
  }

  static getAddressFormHTML() {
    return `
      <div class="bg-[#16161a] border border-white/5 p-6 rounded-3xl space-y-4 shadow-2xl">
        <h4 class="text-xs font-black text-white uppercase tracking-widest">Update Address</h4>
        <div class="space-y-4">
           <div class="space-y-1.5">
              <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
              <input type="text" id="addr-name" class="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50" placeholder="Your Name">
           </div>
           <div class="space-y-1.5">
              <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">City</label>
              <input type="text" id="addr-city" class="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50" placeholder="City">
           </div>
           <div class="space-y-1.5">
              <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Detailed Address</label>
              <textarea id="addr-full" rows="3" class="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50" placeholder="Street, Area, etc."></textarea>
           </div>
           <button id="save-address-btn" class="w-full py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-widest active:scale-95 transition">Save Address</button>
        </div>
      </div>
    `;
  }

  static getSupportFormHTML() {
    return `
      <div class="bg-[#16161a] border border-white/5 p-6 rounded-3xl space-y-4 shadow-2xl">
        <h4 class="text-xs font-black text-white uppercase tracking-widest">Contact Support</h4>
        <form id="store-support-form" class="space-y-4">
           <div class="space-y-1.5">
              <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Topic</label>
              <select id="support-subject" class="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50">
                 <option value="Product Help">Product Help</option>
                 <option value="Payment Issue">Payment Issue</option>
                 <option value="Account Query">Account Query</option>
              </select>
           </div>
           <div class="space-y-1.5">
              <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Message</label>
              <textarea id="support-message" rows="3" class="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50" placeholder="Tell us what's wrong..." required></textarea>
           </div>
           <button type="submit" class="w-full py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-widest active:scale-95 transition">Send Ticket</button>
        </form>
        
        <div class="pt-4 space-y-3">
           <h5 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Tickets</h5>
           <div id="store-support-tickets" class="space-y-2"></div>
        </div>
      </div>
    `;
  }

  static getOrdersHTML() {
    return `
      <div class="px-4 py-6 space-y-6 pb-20 store-animate-fade">
        <h2 class="text-xl font-black text-white italic tracking-tight">My <span class="text-cyan-400">Library</span></h2>
        <div id="store-orders-list" class="space-y-4">
           <div class="py-12 text-center text-xs text-slate-600 font-bold uppercase tracking-widest animate-pulse">Syncing digital library...</div>
        </div>
      </div>
    `;
  }

  static getWishlistHTML() {
    return `
      <div class="px-4 py-6 space-y-6 store-animate-fade">
        <h2 class="text-xl font-black text-white italic tracking-tight">Saved <span class="text-rose-500">Assets</span></h2>
        <div id="store-wishlist-grid" class="grid grid-cols-2 gap-4 pb-8">
           <!-- Populated by products grid -->
        </div>
      </div>
    `;
  }

  static getCategoriesHTML(categories: any[]) {
    return `
      <div class="px-4 py-6 space-y-6 store-animate-fade">
        <h2 class="text-xl font-black text-white italic tracking-tight">Browse <span class="text-cyan-400">Categories</span></h2>
        <div class="grid grid-cols-1 gap-4">
           ${categories.filter(c => c.id !== 'all').map(cat => `
             <button class="store-category-large flex items-center gap-4 p-5 rounded-3xl bg-[#16161a] border border-white/5 text-left group active:scale-[0.98] transition shadow-2xl" data-cat="${cat.id}">
                <div class="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition border border-white/5 group-hover:border-cyan-500/30">
                   <i class="fa-solid ${cat.icon} text-2xl"></i>
                </div>
                <div class="flex-grow">
                   <h4 class="text-sm font-black text-white tracking-tight uppercase">${cat.label.replace(/^[^\s]+\s/, '')}</h4>
                   <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">View Premium Assets</p>
                </div>
                <i class="fa-solid fa-chevron-right text-slate-700 group-hover:text-cyan-400 transition"></i>
             </button>
           `).join('')}
        </div>
      </div>
    `;
  }
}
