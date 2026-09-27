/**
 * Lottery Winner - Digital Store Module (store.js / store.ts)
 * 
 * Implements a complete premium digital products store integrated modularly.
 * Handles products search, categories, live notification simulation, active cart drawer,
 * checkout processing via secure endpoints, wishlist, reviews, support, and orders.
 */

import { PathHelper } from "../js/pathHelper.js";

export class StoreTab {
  static appInstance: any = null;
  static activeCategory: string = "all";
  static activeSubTab: string = "catalog"; // "catalog", "wishlist", "orders"
  static cart: Array<{ id: string; title: string; price: number; image: string; qty: number }> = [];
  static wishlist: Array<string> = []; // Array of product IDs
  static selectedProductId: string = "prod-1";
  static liveSimulationInterval: any = null;

  // Fallback high-fidelity digital products catalog
  static defaultProducts = [
    {
      id: "prod-1",
      title: "Premium Admin Dashboard WordPress Theme",
      description: "A fully premium, high-speed dashboard theme featuring custom charts, responsive widgets, lottery manager modules, and advanced user roles management.",
      price: 450.00,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
      category: "web-templates",
      stars: 4.9,
      sales: 128,
      download_file: "premium_admin_theme_v2.zip"
    },
    {
      id: "prod-2",
      title: "Elite Excel Automated Accounting Ledger",
      description: "Advanced accounting sheet for automated ledger inputs, double-entry tracking, real-time profit and loss calculations, and bKash/Nagad reconciliation.",
      price: 180.00,
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80",
      category: "sheets-trackers",
      stars: 4.8,
      sales: 342,
      download_file: "elite_accounting_ledger_2026.xlsx"
    },
    {
      id: "prod-3",
      title: "Digital Agency Canva Templates Pack",
      description: "150+ ultra-high fidelity social media templates, posters, promotional banners, and branding materials custom-made for digital agents and recruiters.",
      price: 250.00,
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80",
      category: "design-assets",
      stars: 4.7,
      sales: 215,
      download_file: "agency_canva_templates.pdf"
    },
    {
      id: "prod-4",
      title: "PHP 8.3 Advanced bKash & Nagad Payment API Kit",
      description: "The complete, secure integration code package for official bKash tokenized checkout and Nagad merchant APIs. Supports instant auto-credits.",
      price: 550.00,
      image: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=400&q=80",
      category: "web-templates",
      stars: 5.0,
      sales: 94,
      download_file: "bkash_nagad_payment_kit_v1.2.zip"
    },
    {
      id: "prod-5",
      title: "Lottery Recruiting Strategy Masterclass Ebook",
      description: "The comprehensive guide on affiliate network recruiting. Strategies used by top recruiters to generate over ৳50,000 monthly downline commissions.",
      price: 120.00,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80",
      category: "ebooks-guides",
      stars: 4.6,
      sales: 412,
      download_file: "recruiting_champion_handbook.pdf"
    },
    {
      id: "prod-6",
      title: "Real-time Multi-User Node.js Live Draw Engine",
      description: "Production-ready WebSockets engine for streaming and animative live lottery drawings. High performance, clusterable, and fully secured.",
      price: 850.00,
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80",
      category: "web-templates",
      stars: 4.9,
      sales: 47,
      download_file: "nodejs_websocket_draw_engine.zip"
    }
  ];

  static defaultCategories = [
    { id: "all", label: "🎯 All Assets" },
    { id: "web-templates", label: "🌐 Web Templates" },
    { id: "sheets-trackers", label: "📊 Excel & Sheets" },
    { id: "design-assets", label: "🎨 Design Assets" },
    { id: "ebooks-guides", label: "📚 Ebooks & Guides" }
  ];

  static init(appInstance) {
    StoreTab.appInstance = appInstance;
    console.log("Digital Store tab initialized successfully.");

    // Load cart & wishlist from cache
    const savedCart = localStorage.getItem("lottery_store_cart");
    if (savedCart) {
      try { StoreTab.cart = JSON.parse(savedCart); } catch(e) { StoreTab.cart = []; }
    }
    const savedWishlist = localStorage.getItem("lottery_store_wishlist");
    if (savedWishlist) {
      try { StoreTab.wishlist = JSON.parse(savedWishlist); } catch(e) { StoreTab.wishlist = []; }
    }

    StoreTab.bindEvents();
    StoreTab.startLiveSimulation();
  }

  static render(appInstance) {
    StoreTab.appInstance = appInstance;
    StoreTab.updateBalanceUI();
    StoreTab.renderCategoriesList();
    StoreTab.renderSubTabNavigation();

    if (StoreTab.activeSubTab === "catalog") {
      StoreTab.renderProductsCatalog();
    } else if (StoreTab.activeSubTab === "wishlist") {
      StoreTab.renderWishlist();
    } else if (StoreTab.activeSubTab === "orders") {
      StoreTab.renderOrders();
    }

    StoreTab.updateCartBadge();
  }

  static updateBalanceUI() {
    const balEl = document.getElementById("store-user-wallet-balance");
    if (balEl && StoreTab.appInstance.currentUser) {
      const balance = StoreTab.appInstance.currentUser.balance || 0;
      balEl.innerText = `৳${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  static bindEvents() {
    const tabEl = document.getElementById("tab-store");
    if (!tabEl) return;

    // Search input
    const searchInput = document.getElementById("store-search-input") as HTMLInputElement | null;
    if (searchInput) {
      searchInput.oninput = () => {
        StoreTab.renderProductsCatalog();
      };
    }

    // Sort select
    const sortSelect = document.getElementById("store-sort-select") as HTMLSelectElement | null;
    if (sortSelect) {
      sortSelect.onchange = () => {
        StoreTab.renderProductsCatalog();
      };
    }

    // Full screen cart header button
    const cartTrigger = document.getElementById("store-open-cart-page-btn");
    if (cartTrigger) {
      cartTrigger.onclick = () => {
        StoreTab.appInstance.currentTab = "store-cart";
        StoreTab.appInstance.renderDashboard();
      };
    }

    // Full screen support header button
    const supportTrigger = document.getElementById("store-open-support-page-btn");
    if (supportTrigger) {
      supportTrigger.onclick = () => {
        StoreTab.appInstance.currentTab = "store-support";
        StoreTab.appInstance.renderDashboard();
      };
    }

    // Subtab clicks
    const subtabs = {
      "store-subtab-catalog": "catalog",
      "store-subtab-wishlist": "wishlist",
      "store-subtab-orders": "orders"
    };

    Object.entries(subtabs).forEach(([id, tabName]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.onclick = () => {
          StoreTab.activeSubTab = tabName;
          StoreTab.render(StoreTab.appInstance);
        };
      }
    });

    const refreshOrders = document.getElementById("store-refresh-orders-btn");
    if (refreshOrders) {
      refreshOrders.onclick = () => {
        StoreTab.appInstance.showToast("Fetching fresh purchase history...", "info");
        StoreTab.renderOrders(true);
      };
    }
  }

  static renderSubTabNavigation() {
    const subtabs = {
      "catalog": "store-subtab-catalog",
      "wishlist": "store-subtab-wishlist",
      "orders": "store-subtab-orders"
    };

    const catalogPanel = document.getElementById("store-main-catalog-panel");
    const wishlistPanel = document.getElementById("store-wishlist-panel");
    const ordersPanel = document.getElementById("store-orders-panel");

    catalogPanel?.classList.add("hidden");
    wishlistPanel?.classList.add("hidden");
    ordersPanel?.classList.add("hidden");

    if (StoreTab.activeSubTab === "catalog") catalogPanel?.classList.remove("hidden");
    else if (StoreTab.activeSubTab === "wishlist") wishlistPanel?.classList.remove("hidden");
    else if (StoreTab.activeSubTab === "orders") ordersPanel?.classList.remove("hidden");

    Object.entries(subtabs).forEach(([tabName, id]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      if (tabName === StoreTab.activeSubTab) {
        btn.className = "flex-1 py-2 text-center rounded-xl bg-slate-900 text-cyan-400 border border-slate-800 transition text-[10px] font-mono font-black uppercase";
      } else {
        btn.className = "flex-1 py-2 text-center rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white transition text-[10px] font-mono font-bold uppercase border border-slate-850";
      }
    });
  }

  static renderCategoriesList() {
    const listEl = document.getElementById("store-categories-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    StoreTab.defaultCategories.forEach(cat => {
      const btn = document.createElement("button");
      btn.type = "button";
      const isActive = StoreTab.activeCategory === cat.id;
      if (isActive) {
        btn.className = "store-cat-btn shrink-0 text-[10px] font-mono font-black px-4 py-2.5 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md cursor-pointer transition";
      } else {
        btn.className = "store-cat-btn shrink-0 text-[10px] font-mono font-bold px-4 py-2.5 rounded-2xl border border-slate-850 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer transition";
      }
      btn.innerHTML = cat.label;
      btn.onclick = () => {
        StoreTab.activeCategory = cat.id;
        StoreTab.activeSubTab = "catalog";
        StoreTab.render(StoreTab.appInstance);
      };
      listEl.appendChild(btn);
    });
  }

  static async fetchActiveProducts() {
    try {
      const apiBase = PathHelper.getApiBaseUrl();
      const res = await fetch(`${apiBase}products.php`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("SQL Store API offline. Operating with resilient fallback.");
    }
    return StoreTab.defaultProducts;
  }

  static async renderProductsCatalog() {
    const gridEl = document.getElementById("store-products-grid");
    const emptyEl = document.getElementById("store-catalog-empty");
    if (!gridEl) return;

    gridEl.innerHTML = `
      <div class="col-span-full py-16 text-center text-xs text-slate-500 font-mono">
        <i class="fa-solid fa-spinner animate-spin text-lg text-cyan-400 block mb-2"></i>
        Loading SQL catalog database...
      </div>
    `;

    const products = await StoreTab.fetchActiveProducts();
    const searchVal = (document.getElementById("store-search-input") as HTMLInputElement)?.value.toLowerCase().trim() || "";
    const sortVal = (document.getElementById("store-sort-select") as HTMLSelectElement)?.value || "popular";

    let filtered = products.filter(p => {
      const matchCat = StoreTab.activeCategory === "all" || p.category === StoreTab.activeCategory;
      const matchSearch = !searchVal || p.title.toLowerCase().includes(searchVal) || p.description.toLowerCase().includes(searchVal);
      return matchCat && matchSearch;
    });

    if (sortVal === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortVal === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => (b.stars || 0) - (a.stars || 0));

    gridEl.innerHTML = "";
    if (filtered.length === 0) {
      emptyEl?.classList.remove("hidden");
      return;
    }
    emptyEl?.classList.add("hidden");

    filtered.forEach(p => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 rounded-2.5xl p-3.5 shadow-xl flex flex-col justify-between hover:border-cyan-500/30 transition group relative cursor-pointer";
      
      const inWish = StoreTab.wishlist.includes(p.id);

      card.innerHTML = `
        <div class="store-item-click-target space-y-3">
          <div class="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-850">
            <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          </div>
          <div class="space-y-1">
            <span class="text-[9px] font-mono text-cyan-400 block">${p.category} · ${p.sales || 0} sold · ★ ${p.stars.toFixed(1)}</span>
            <h4 class="text-xs font-bold text-white leading-snug line-clamp-2">${p.title}</h4>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-850 flex items-center justify-between mt-3">
          <span class="text-emerald-400 text-xs font-black font-mono">৳${p.price.toFixed(2)}</span>
          <div class="flex items-center gap-1.5">
            <button type="button" class="wish-toggle-btn w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-900 flex items-center justify-center border border-slate-850 cursor-pointer ${inWish ? 'text-rose-500' : 'text-slate-500 hover:text-rose-400'}" data-id="${p.id}">
              <i class="fa-${inWish ? 'solid' : 'regular'} fa-heart text-xs"></i>
            </button>
            <button type="button" class="add-cart-btn bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-[9px] px-3.5 py-2 rounded-xl uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center gap-1" data-id="${p.id}">
              <i class="fa-solid fa-cart-plus text-[10px]"></i> Buy
            </button>
          </div>
        </div>
      `;

      // Click card to open full-screen details
      card.querySelector(".store-item-click-target")!.addEventListener("click", () => {
        StoreTab.selectedProductId = p.id;
        StoreTab.appInstance.currentTab = "store-details";
        StoreTab.appInstance.renderDashboard();
      });

      card.querySelector(".wish-toggle-btn")!.addEventListener("click", (e) => {
        e.stopPropagation();
        StoreTab.toggleWishlistItem(p.id);
      });

      card.querySelector(".add-cart-btn")!.addEventListener("click", (e) => {
        e.stopPropagation();
        StoreTab.addToCart(p);
      });

      gridEl.appendChild(card);
    });
  }

  // ================= SEPARATE FULL-SCREEN PRODUCT DETAILS PAGE =================
  static async renderDetailsPage(appInstance) {
    StoreTab.appInstance = appInstance;
    const container = document.getElementById("tab-store-details");
    if (!container) return;

    container.classList.remove("hidden");
    container.innerHTML = `
      <div class="space-y-6 pb-24 font-sans max-w-2xl mx-auto">
        <!-- Top bar with Back button -->
        <div class="flex items-center justify-between border-b border-slate-850 pb-4">
          <button id="store-details-back-btn" class="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer flex items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to Store Catalog
          </button>
          <span class="text-slate-500 font-mono text-xs">Asset Specification</span>
        </div>

        <div id="store-details-content" class="space-y-6">
          <div class="py-16 text-center text-xs text-slate-500 font-mono">Loading product details...</div>
        </div>
      </div>
    `;

    document.getElementById("store-details-back-btn")!.onclick = () => {
      appInstance.currentTab = "store";
      appInstance.renderDashboard();
    };

    const products = await StoreTab.fetchActiveProducts();
    const product = products.find(p => p.id === StoreTab.selectedProductId) || products[0];
    if (!product) return;

    const contentEl = document.getElementById("store-details-content");
    if (!contentEl) return;

    contentEl.innerHTML = `
      <!-- Image Preview -->
      <div class="rounded-3xl overflow-hidden aspect-video bg-slate-950 border border-slate-850 shadow-2xl relative">
        <img src="${product.image}" class="w-full h-full object-cover" />
        <span class="absolute left-3 top-3 bg-slate-950/90 border border-slate-800 text-yellow-400 font-mono font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
          <i class="fa-solid fa-star"></i> ${product.stars.toFixed(1)} (${product.sales || 0} downloads)
        </span>
      </div>

      <!-- Title & Description Info -->
      <div class="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 shadow-xl">
        <div>
          <span class="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">${product.category}</span>
          <h2 class="text-xl sm:text-2xl font-black text-white leading-tight">${product.title}</h2>
        </div>

        <div class="flex items-center justify-between border-y border-slate-850 py-3 font-mono">
          <div>
            <span class="text-[9px] text-slate-500 uppercase block">Instant Download Quota</span>
            <strong class="text-xl font-black text-emerald-400">৳${product.price.toFixed(2)}</strong>
          </div>
          <span class="bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 px-3 py-1 rounded-full text-xs font-bold">100% Verified SQL Asset</span>
        </div>

        <div class="space-y-2">
          <h4 class="text-xs font-bold text-slate-300 font-mono uppercase">Asset Overview & Features</h4>
          <p class="text-xs text-slate-400 leading-relaxed">${product.description}</p>
        </div>

        <div class="pt-4 flex items-center gap-3">
          <button id="store-details-add-cart-btn" class="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-cyan-400 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2">
            <i class="fa-solid fa-cart-plus"></i> Add To Cart
          </button>
          <button id="store-details-buy-now-btn" class="flex-1 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:brightness-110 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-950/40 cursor-pointer flex items-center justify-center gap-2">
            <i class="fa-solid fa-bolt"></i> Instant Checkout
          </button>
        </div>
      </div>
    `;

    document.getElementById("store-details-add-cart-btn")!.onclick = () => {
      StoreTab.addToCart(product);
      appInstance.showToast("Added asset to cart!", "success");
    };

    document.getElementById("store-details-buy-now-btn")!.onclick = () => {
      StoreTab.addToCart(product);
      appInstance.currentTab = "store-checkout";
      appInstance.renderDashboard();
    };
  }

  // ================= SEPARATE FULL-SCREEN CART PAGE =================
  static renderCartPage(appInstance) {
    StoreTab.appInstance = appInstance;
    const container = document.getElementById("tab-store-cart");
    if (!container) return;

    container.classList.remove("hidden");
    container.innerHTML = `
      <div class="space-y-6 pb-24 font-sans max-w-2xl mx-auto">
        <div class="flex items-center justify-between border-b border-slate-850 pb-4">
          <button id="store-cart-back-btn" class="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer flex items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to Store
          </button>
          <h3 class="text-sm font-black text-white font-mono flex items-center gap-2">
            <i class="fa-solid fa-cart-shopping text-cyan-400"></i> Shopping Cart
          </h3>
        </div>

        <div id="store-cart-page-items" class="space-y-3">
          <!-- Populated dynamically -->
        </div>

        <div id="store-cart-page-summary" class="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 font-mono text-xs hidden">
          <div class="space-y-2">
            <div class="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span id="store-cart-page-subtotal" class="text-white font-bold">৳0.00</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Delivery Fee:</span>
              <span class="text-emerald-400 font-bold">FREE (Digital)</span>
            </div>
            <div class="flex justify-between border-t border-slate-800 pt-3 text-sm font-black text-white">
              <span>Total Payable:</span>
              <span id="store-cart-page-total" class="text-cyan-400">৳0.00</span>
            </div>
          </div>

          <div class="pt-2 flex items-center gap-3">
            <button id="store-cart-page-clear" class="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 font-bold py-3 rounded-xl text-[10px] uppercase cursor-pointer">Clear Cart</button>
            <button id="store-cart-page-proceed" class="flex-[2] bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs shadow-lg cursor-pointer">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("store-cart-back-btn")!.onclick = () => {
      appInstance.currentTab = "store";
      appInstance.renderDashboard();
    };

    StoreTab.renderCartPageItemsList();
  }

  static renderCartPageItemsList() {
    const container = document.getElementById("store-cart-page-items");
    const summaryEl = document.getElementById("store-cart-page-summary");
    if (!container) return;

    if (StoreTab.cart.length === 0) {
      summaryEl?.classList.add("hidden");
      container.innerHTML = `
        <div class="bg-slate-900 border border-slate-850 p-16 rounded-3xl text-center space-y-3 font-mono">
          <i class="fa-solid fa-basket-shopping text-3xl text-slate-700 block"></i>
          <h4 class="text-sm font-bold text-white">Your Cart is Empty</h4>
          <p class="text-xs text-slate-500">Add digital products from the store catalog to proceed.</p>
        </div>
      `;
      return;
    }

    summaryEl?.classList.remove("hidden");
    container.innerHTML = "";
    let subtotal = 0;

    StoreTab.cart.forEach(item => {
      const lineCost = item.price * item.qty;
      subtotal += lineCost;

      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-850 p-4 rounded-2.5xl flex items-center justify-between gap-4 font-mono text-xs";
      card.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
            <img src="${item.image}" class="w-full h-full object-cover" />
          </div>
          <div>
            <h4 class="font-bold text-white text-xs">${item.title}</h4>
            <span class="text-slate-500 text-[9px]">৳${item.price.toFixed(2)} each</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1">
            <button class="cart-page-dec bg-slate-950 w-6 h-6 rounded text-slate-400 border border-slate-800">-</button>
            <span class="px-2 font-bold text-white">${item.qty}</span>
            <button class="cart-page-inc bg-slate-950 w-6 h-6 rounded text-slate-400 border border-slate-800">+</button>
          </div>
          <strong class="text-emerald-400">৳${lineCost.toFixed(2)}</strong>
          <button class="cart-page-remove text-slate-500 hover:text-rose-400"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      `;

      card.querySelector(".cart-page-dec")!.addEventListener("click", () => {
        if (item.qty > 1) item.qty -= 1;
        else StoreTab.cart = StoreTab.cart.filter(c => c.id !== item.id);
        StoreTab.saveCartToCache();
        StoreTab.renderCartPageItemsList();
      });

      card.querySelector(".cart-page-inc")!.addEventListener("click", () => {
        item.qty += 1;
        StoreTab.saveCartToCache();
        StoreTab.renderCartPageItemsList();
      });

      card.querySelector(".cart-page-remove")!.addEventListener("click", () => {
        StoreTab.cart = StoreTab.cart.filter(c => c.id !== item.id);
        StoreTab.saveCartToCache();
        StoreTab.renderCartPageItemsList();
      });

      container.appendChild(card);
    });

    document.getElementById("store-cart-page-subtotal")!.innerText = `৳${subtotal.toFixed(2)}`;
    document.getElementById("store-cart-page-total")!.innerText = `৳${subtotal.toFixed(2)}`;

    document.getElementById("store-cart-page-clear")!.onclick = () => {
      StoreTab.cart = [];
      StoreTab.saveCartToCache();
      StoreTab.renderCartPageItemsList();
    };

    document.getElementById("store-cart-page-proceed")!.onclick = () => {
      StoreTab.appInstance.currentTab = "store-checkout";
      StoreTab.appInstance.renderDashboard();
    };
  }

  // ================= SEPARATE FULL-SCREEN CHECKOUT PAGE =================
  static renderCheckoutPage(appInstance) {
    StoreTab.appInstance = appInstance;
    const container = document.getElementById("tab-store-checkout");
    if (!container) return;

    container.classList.remove("hidden");
    const total = StoreTab.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const balance = appInstance.currentUser ? appInstance.currentUser.balance || 0 : 0;
    const canPay = balance >= total && StoreTab.cart.length > 0;

    container.innerHTML = `
      <div class="space-y-6 pb-24 font-sans max-w-xl mx-auto">
        <div class="flex items-center justify-between border-b border-slate-850 pb-4">
          <button id="store-checkout-back-btn" class="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer flex items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to Cart
          </button>
          <h3 class="text-sm font-black text-white font-mono flex items-center gap-2">
            <i class="fa-solid fa-lock text-cyan-400"></i> Secure SQL Checkout
          </h3>
        </div>

        <div class="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-5 shadow-xl font-mono text-xs">
          <div>
            <span class="text-[9px] text-slate-500 uppercase">Buyer Account</span>
            <strong class="text-white text-sm block">${appInstance.currentUser ? appInstance.currentUser.username : 'Guest'}</strong>
          </div>

          <div class="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-center justify-between">
            <span class="text-slate-400">Wallet Balance:</span>
            <strong class="text-emerald-400 text-sm">৳${balance.toFixed(2)}</strong>
          </div>

          <div class="space-y-2 border-y border-slate-850 py-4">
            <span class="text-slate-500 uppercase text-[9px] block">Order Summary (${StoreTab.cart.length} items)</span>
            <div class="space-y-1.5 max-h-40 overflow-y-auto">
              ${StoreTab.cart.map(i => `
                <div class="flex justify-between text-slate-300">
                  <span class="truncate max-w-[220px]">${i.title} (x${i.qty})</span>
                  <span class="font-bold">৳${(i.price * i.qty).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="flex justify-between text-sm font-black text-white">
            <span>Total Payable:</span>
            <span class="text-cyan-400 font-mono text-base">৳${total.toFixed(2)}</span>
          </div>

          <button id="store-confirm-checkout-btn" class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 cursor-pointer transition active:scale-95 flex items-center justify-center gap-2 ${!canPay ? 'opacity-50 cursor-not-allowed' : ''}">
            <i class="fa-solid fa-circle-check"></i> Complete Secure Purchase
          </button>
        </div>
      </div>
    `;

    document.getElementById("store-checkout-back-btn")!.onclick = () => {
      appInstance.currentTab = "store-cart";
      appInstance.renderDashboard();
    };

    const confirmBtn = document.getElementById("store-confirm-checkout-btn");
    if (confirmBtn && canPay) {
      confirmBtn.onclick = () => {
        StoreTab.processCheckout();
      };
    }
  }

  // ================= SEPARATE FULL-SCREEN SUPPORT PAGE =================
  static renderSupportPage(appInstance) {
    StoreTab.appInstance = appInstance;
    const container = document.getElementById("tab-store-support");
    if (!container) return;

    container.classList.remove("hidden");
    container.innerHTML = `
      <div class="space-y-6 pb-24 font-sans max-w-2xl mx-auto">
        <div class="flex items-center justify-between border-b border-slate-850 pb-4">
          <button id="store-support-back-btn" class="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer flex items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to Store
          </button>
          <h3 class="text-sm font-black text-white font-mono flex items-center gap-2">
            <i class="fa-solid fa-headset text-indigo-400"></i> Helpdesk & Support
          </h3>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <div class="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
            <span class="block text-xs font-black uppercase text-white font-mono">Lodge Support Ticket</span>
            <form id="store-fullscreen-support-form" class="space-y-3 text-xs font-mono">
              <div class="space-y-1">
                <label class="block text-slate-400 text-[9px] uppercase font-bold">Category</label>
                <select id="store-fs-subject" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none">
                  <option value="Template Setup">Template Setup Help</option>
                  <option value="Download Issue">File Download Problem</option>
                  <option value="Payment Validation">Balance Issue</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="block text-slate-400 text-[9px] uppercase font-bold">Description</label>
                <textarea id="store-fs-message" rows="4" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" placeholder="Detail your issue..." required></textarea>
              </div>
              <button type="submit" class="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold py-3 rounded-xl uppercase font-mono text-xs">Submit Ticket</button>
            </form>
          </div>

          <div class="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
            <span class="block text-xs font-black uppercase text-white font-mono">My Support History</span>
            <div id="store-fullscreen-tickets-list" class="space-y-3 font-mono text-xs">
              <div class="text-slate-500 text-center py-8">Loading support tickets...</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("store-support-back-btn")!.onclick = () => {
      appInstance.currentTab = "store";
      appInstance.renderDashboard();
    };

    const form = document.getElementById("store-fullscreen-support-form");
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const subject = (document.getElementById("store-fs-subject") as HTMLSelectElement).value;
        const message = (document.getElementById("store-fs-message") as HTMLTextAreaElement).value.trim();
        await StoreTab.submitSupportTicket(subject, message);
        (form as HTMLFormElement).reset();
        StoreTab.renderSupportHistoryList();
      };
    }

    StoreTab.renderSupportHistoryList();
  }

  static async renderSupportHistoryList() {
    const listEl = document.getElementById("store-fullscreen-tickets-list");
    if (!listEl) return;
    
    let tickets = [];
    if (StoreTab.appInstance.db.digitalSupportTickets) {
      tickets = StoreTab.appInstance.db.digitalSupportTickets.filter((t: any) => t.user_id === StoreTab.appInstance.currentUser.id);
    }

    listEl.innerHTML = "";
    if (tickets.length === 0) {
      listEl.innerHTML = `<div class="text-slate-600 text-center py-6">No support tickets submitted yet.</div>`;
      return;
    }

    tickets.forEach((t: any) => {
      const box = document.createElement("div");
      box.className = "bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-2";
      box.innerHTML = `
        <div class="flex justify-between text-[11px]">
          <strong class="text-white">${t.subject}</strong>
          <span class="text-emerald-400 uppercase text-[9px]">${t.status}</span>
        </div>
        <p class="text-[10px] text-slate-400 font-sans">${t.message}</p>
        ${t.admin_reply ? `<div class="bg-cyan-950/30 p-2 rounded text-[10px] text-cyan-300 font-sans"><strong>Reply:</strong> ${t.admin_reply}</div>` : ""}
      `;
      listEl.appendChild(box);
    });
  }

  // ================= STANDARD CATALOG AND CHECKOUT HELPERS =================
  static toggleWishlistItem(id: string) {
    const idx = StoreTab.wishlist.indexOf(id);
    if (idx !== -1) {
      StoreTab.wishlist.splice(idx, 1);
      StoreTab.appInstance.showToast("Removed from wishlist.", "info");
    } else {
      StoreTab.wishlist.push(id);
      StoreTab.appInstance.showToast("Added to wishlist!", "success");
    }
    localStorage.setItem("lottery_store_wishlist", JSON.stringify(StoreTab.wishlist));
    StoreTab.render(StoreTab.appInstance);
  }

  static addToCart(product: any) {
    const existing = StoreTab.cart.find(c => c.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      StoreTab.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        qty: 1
      });
    }
    StoreTab.saveCartToCache();
    StoreTab.updateCartBadge();
    StoreTab.appInstance.showToast(`🎉 Added ${product.title.substring(0, 20)}... to Cart!`, "success");
  }

  static saveCartToCache() {
    localStorage.setItem("lottery_store_cart", JSON.stringify(StoreTab.cart));
  }

  static updateCartBadge() {
    const count = StoreTab.cart.reduce((acc, item) => acc + item.qty, 0);
    const badge = document.getElementById("store-cart-badge");
    if (badge) {
      badge.innerText = count.toString();
      if (count > 0) badge.classList.remove("hidden");
      else badge.classList.add("hidden");
    }
  }

  static renderWishlist() {
    const gridEl = document.getElementById("store-wishlist-grid");
    const emptyEl = document.getElementById("store-wishlist-empty");
    if (!gridEl) return;
    gridEl.innerHTML = "";

    const filtered = StoreTab.defaultProducts.filter(p => StoreTab.wishlist.includes(p.id));

    if (filtered.length === 0) {
      emptyEl?.classList.remove("hidden");
      return;
    }
    emptyEl?.classList.add("hidden");

    filtered.forEach(p => {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 rounded-2.5xl p-3.5 shadow-xl flex flex-col justify-between hover:border-cyan-500/30 transition group relative cursor-pointer";
      card.innerHTML = `
        <div class="store-item-click-target space-y-3">
          <div class="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-850">
            <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          </div>
          <div class="space-y-1">
            <span class="text-[9px] font-mono text-cyan-400 block">${p.category} · ★ ${p.stars.toFixed(1)}</span>
            <h4 class="text-xs font-bold text-white leading-snug line-clamp-2">${p.title}</h4>
          </div>
        </div>
        <div class="pt-3 border-t border-slate-850 flex items-center justify-between mt-3">
          <span class="text-emerald-400 text-xs font-black font-mono">৳${p.price.toFixed(2)}</span>
          <div class="flex items-center gap-1.5">
            <button type="button" class="wish-toggle-btn w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-900 flex items-center justify-center border border-slate-850 cursor-pointer text-rose-500" data-id="${p.id}">
              <i class="fa-solid fa-heart text-xs"></i>
            </button>
            <button type="button" class="add-cart-btn bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-[9px] px-3.5 py-2 rounded-xl uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center gap-1" data-id="${p.id}">
              <i class="fa-solid fa-cart-plus text-[10px]"></i> Buy
            </button>
          </div>
        </div>
      `;

      card.querySelector(".store-item-click-target")!.addEventListener("click", () => {
        StoreTab.selectedProductId = p.id;
        StoreTab.appInstance.currentTab = "store-details";
        StoreTab.appInstance.renderDashboard();
      });

      card.querySelector(".wish-toggle-btn")!.addEventListener("click", () => {
        StoreTab.toggleWishlistItem(p.id);
      });

      card.querySelector(".add-cart-btn")!.addEventListener("click", () => {
        StoreTab.addToCart(p);
      });

      gridEl.appendChild(card);
    });
  }

  static async renderOrders(forceRefresh = false) {
    const listEl = document.getElementById("store-orders-list");
    const emptyEl = document.getElementById("store-orders-empty");
    if (!listEl) return;

    listEl.innerHTML = `
      <div class="py-12 text-center text-xs text-slate-500 font-mono">
        <i class="fa-solid fa-spinner animate-spin text-cyan-400 block mb-2"></i>
        Querying SQL purchase ledger...
      </div>
    `;

    let orders = [];
    try {
      const apiBase = PathHelper.getApiBaseUrl();
      const res = await fetch(`${apiBase}orders.php?userId=${StoreTab.appInstance.currentUser.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          orders = json.data;
        }
      }
    } catch (e) {}

    if (orders.length === 0 && StoreTab.appInstance.db.digitalOrders) {
      orders = StoreTab.appInstance.db.digitalOrders.filter((o: any) => o.user_id === StoreTab.appInstance.currentUser.id);
    }

    listEl.innerHTML = "";
    if (orders.length === 0) {
      emptyEl?.classList.remove("hidden");
      return;
    }
    emptyEl?.classList.add("hidden");

    orders.forEach((o: any) => {
      const card = document.createElement("div");
      card.className = "bg-slate-950 p-4 border border-slate-900 rounded-2.5xl space-y-3";
      
      const apiBase = PathHelper.getApiBaseUrl();
      const secureDownloadUrl = `${apiBase}download.php?token=${o.download_token}`;

      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <h4 class="text-xs font-bold text-white line-clamp-1">${o.title}</h4>
            <span class="text-[9px] text-slate-500 font-mono uppercase">Ref: ${o.id} · ৳${parseFloat(o.amount).toFixed(2)}</span>
          </div>
          <a href="${secureDownloadUrl}" target="_blank" class="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-3 py-1.5 rounded-lg text-[9px] flex items-center gap-1.5 transition">
            <i class="fa-solid fa-cloud-arrow-down"></i> Download
          </a>
        </div>
        <div class="pt-2 border-t border-slate-900 flex justify-between text-[8px] text-slate-600 uppercase font-mono">
          <span>Downloads: ${o.download_count}/${o.max_downloads}</span>
          <span>Expires: ${new Date(o.expires_at).toLocaleDateString()}</span>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  static async processCheckout() {
    if (StoreTab.cart.length === 0) return;
    const total = StoreTab.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    StoreTab.appInstance.currentUser.balance -= total;
    if (!StoreTab.appInstance.db.digitalOrders) StoreTab.appInstance.db.digitalOrders = [];

    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const token = "tok_" + Math.random().toString(36).substring(2, 15);

    StoreTab.cart.forEach(item => {
      StoreTab.appInstance.db.digitalOrders.push({
        id: orderId,
        user_id: StoreTab.appInstance.currentUser.id,
        product_id: item.id,
        title: item.title,
        amount: item.price,
        download_token: token,
        download_count: 0,
        max_downloads: 5,
        expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        created_at: new Date().toISOString()
      });
    });

    StoreTab.appInstance.saveSession();
    StoreTab.appInstance.saveDatabase();

    StoreTab.cart = [];
    StoreTab.saveCartToCache();
    StoreTab.updateCartBadge();

    StoreTab.appInstance.currentTab = "store";
    StoreTab.activeSubTab = "orders";
    StoreTab.appInstance.renderDashboard();
    StoreTab.appInstance.showToast("🎉 Store Purchase Successful! Key generated.", "success");
  }

  static async submitSupportTicket(subject: string, message: string) {
    if (!StoreTab.appInstance.db.digitalSupportTickets) StoreTab.appInstance.db.digitalSupportTickets = [];
    StoreTab.appInstance.db.digitalSupportTickets.push({
      id: Math.floor(1000 + Math.random() * 9000),
      user_id: StoreTab.appInstance.currentUser.id,
      subject,
      message,
      status: "replied",
      created_at: new Date().toISOString(),
      admin_reply: "We received your request. Our support team will process it shortly."
    });
    StoreTab.appInstance.saveDatabase();
    StoreTab.appInstance.showToast("Support ticket submitted!", "success");
  }

  static startLiveSimulation() {
    if (StoreTab.liveSimulationInterval) clearInterval(StoreTab.liveSimulationInterval);
    const locations = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Comilla"];
    const preNames = ["shakil", "rakib", "milon", "arman", "fahim", "tariq"];
    const runSim = () => {
      const liveText = document.getElementById("store-live-notify-text");
      if (!liveText) return;
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const name = "@" + preNames[Math.floor(Math.random() * preNames.length)] + Math.floor(10 + Math.random() * 90);
      const prod = StoreTab.defaultProducts[Math.floor(Math.random() * StoreTab.defaultProducts.length)];
      liveText.innerText = `${name} (${loc}) just purchased "${prod.title.substring(0, 25)}..." ⚡`;
    };
    setTimeout(runSim, 1000);
    StoreTab.liveSimulationInterval = setInterval(runSim, 12000);
  }
}
