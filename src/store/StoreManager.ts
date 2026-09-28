/**
 * LuckyBox Shop - Store Manager (Business Logic)
 * Decoupled from the main lottery app for better modularity.
 */

import { PathHelper } from "../js/pathHelper.js";
import { StoreUI } from "./StoreUI.js";
import "./store.css";

export class StoreTab {
  static appInstance: any = null;
  static activeCategory: string = "all";
  static activeSubTab: string = "catalog"; // "catalog", "wishlist", "orders", "profile", "categories"
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
    { id: "all", label: "🎯 All Assets", icon: "fa-shapes" },
    { id: "web-templates", label: "🌐 Web Templates", icon: "fa-globe" },
    { id: "sheets-trackers", label: "📊 Excel Sheets", icon: "fa-table" },
    { id: "design-assets", label: "🎨 Design Assets", icon: "fa-palette" },
    { id: "ebooks-guides", label: "📚 Ebooks", icon: "fa-book" }
  ];

  static init(appInstance) {
    StoreTab.appInstance = appInstance;
    console.log("LuckyBox Shop logic initialized.");

    // Inject separate shell HTML if empty
    const storeScreen = document.getElementById("screen-store");
    if (storeScreen && !storeScreen.innerHTML.trim()) {
      storeScreen.innerHTML = StoreUI.getStoreShellHTML(appInstance.db.shopSettings);
    }

    // Load cart & wishlist from cache
    const savedCart = localStorage.getItem("lottery_store_cart");
    if (savedCart) {
      try { StoreTab.cart = JSON.parse(savedCart); } catch(e) { StoreTab.cart = []; }
    }
    const savedWishlist = localStorage.getItem("lottery_store_wishlist");
    if (savedWishlist) {
      try { StoreTab.wishlist = JSON.parse(savedWishlist); } catch(e) { StoreTab.wishlist = []; }
    }

    StoreTab.bindGlobalEvents();
    StoreTab.handleDeepLinking();
    StoreTab.startLiveSimulation();
  }

  static handleDeepLinking() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("productId");
    if (productId && StoreTab.appInstance) {
      StoreTab.selectedProductId = productId;
      if (StoreTab.appInstance.currentTab !== "store-details") {
        StoreTab.appInstance.currentTab = "store-details";
        // Do not call render() here as this is typically called during a render cycle already
      }
    }
  }

  static render(appInstance) {
    StoreTab.appInstance = appInstance;
    
    // Update Header UI
    StoreTab.updateHeaderUI();
    
    // Determine which "page" to render inside the store content area
    const contentArea = document.getElementById("store-content-area");
    if (!contentArea) return;

    if (appInstance.currentTab === "store-cart") {
      StoreTab.renderCartPage();
    } else if (appInstance.currentTab === "store-details") {
      StoreTab.renderDetailsPage();
    } else if (appInstance.currentTab === "store-checkout") {
      StoreTab.renderCheckoutPage();
    } else if (appInstance.currentTab === "store-profile") {
      StoreTab.renderProfilePage();
    } else {
      // Default shop sub-tabs
      if (StoreTab.activeSubTab === "catalog") {
        StoreTab.renderCatalogPage();
      } else if (StoreTab.activeSubTab === "wishlist") {
        StoreTab.renderWishlistPage();
      } else if (StoreTab.activeSubTab === "orders") {
        StoreTab.renderOrdersPage();
      } else if (StoreTab.activeSubTab === "categories") {
        StoreTab.renderCategoriesPage();
      } else if (StoreTab.activeSubTab === "profile") {
        StoreTab.renderProfilePage();
      }
    }

    StoreTab.updateBottomNavUI();
    StoreTab.updateCartBadge();
  }

  static updateHeaderUI() {
    const balEl = document.getElementById("store-header-balance");
    if (balEl && StoreTab.appInstance.currentUser) {
      balEl.innerText = StoreTab.appInstance.currentUser.balance.toFixed(2);
    }

    const settings = StoreTab.appInstance.db.shopSettings;
    if (settings) {
       const nameEl = document.getElementById("store-header-name");
       const tagEl = document.getElementById("store-header-tagline");
       if (nameEl) nameEl.innerText = settings.name || "LuckyBox Shop";
       if (tagEl) tagEl.innerText = settings.tagline || "Premium Assets Hub";
    }
  }

  static updateBottomNavUI() {
    const navButtons = document.querySelectorAll(".store-nav-btn");
    navButtons.forEach(btn => {
      const tab = btn.getAttribute("data-tab");
      const iconDiv = btn.querySelector("div");
      const label = btn.querySelector("span");
      
      let isActive = false;
      if (StoreTab.appInstance.currentTab === "store") {
        isActive = (tab === StoreTab.activeSubTab);
      } else {
        // Handle full screen pages that belong to a specific nav item
        if (StoreTab.appInstance.currentTab === "store-cart" && tab === "catalog") isActive = false; // special case
        if (StoreTab.appInstance.currentTab === "store-profile" && tab === "profile") isActive = true;
      }

      if (isActive) {
        btn.classList.add("active");
        btn.classList.remove("opacity-40");
      } else {
        btn.classList.remove("active");
        btn.classList.add("opacity-40");
      }
    });
  }

  static bindGlobalEvents() {
    // Back to lottery
    const backBtn = document.getElementById("store-back-to-lottery");
    if (backBtn) {
      backBtn.onclick = () => {
        // Clear shop-related params
        const url = new URL(window.location.href);
        url.searchParams.delete("tab");
        url.searchParams.delete("productId");
        window.history.pushState({}, "", url.toString());

        StoreTab.appInstance.currentTab = "home";
        StoreTab.appInstance.render();
      };
    }

    // Header Cart
    const cartBtn = document.getElementById("store-header-cart-btn");
    if (cartBtn) {
      cartBtn.onclick = () => {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "store-cart");
        url.searchParams.delete("productId");
        window.history.pushState({}, "", url.toString());

        StoreTab.appInstance.currentTab = "store-cart";
        StoreTab.appInstance.render();
      };
    }

    // Nav Buttons
    const navButtons = document.querySelectorAll(".store-nav-btn");
    navButtons.forEach(btn => {
      btn.onclick = () => {
        const tab = btn.getAttribute("data-tab");
        if (tab) {
          StoreTab.activeSubTab = tab;
          StoreTab.appInstance.currentTab = "store";

          // Sync URL
          const url = new URL(window.location.href);
          url.searchParams.set("tab", "store");
          url.searchParams.delete("productId");
          window.history.pushState({}, "", url.toString());

          StoreTab.appInstance.render();
        }
      };
    });
  }

  static updateCartBadge() {
    const count = StoreTab.cart.reduce((acc, item) => acc + item.qty, 0);
    const badge = document.getElementById("store-cart-badge-header");
    if (badge) {
      badge.innerText = count.toString();
      if (count > 0) badge.classList.remove("hidden");
      else badge.classList.add("hidden");
    }
  }

  // ================= PAGE RENDERING =================

  static async renderCatalogPage() {
    const contentArea = document.getElementById("store-content-area");
    if (!contentArea) return;

    contentArea.innerHTML = StoreUI.getCatalogHTML(StoreTab.defaultCategories, StoreTab.appInstance.db.shopSettings);

    // Bind search
    const searchInput = document.getElementById("store-catalog-search") as HTMLInputElement;
    if (searchInput) {
      searchInput.oninput = debounce(() => StoreTab.renderProductsGrid(), 300);
    }

    // Bind category chips
    document.querySelectorAll(".store-category-chip").forEach(btn => {
      (btn as HTMLElement).onclick = () => {
        StoreTab.activeCategory = btn.getAttribute("data-cat") || "all";
        StoreTab.renderProductsGrid();
      };
    });

    StoreTab.renderProductsGrid();
  }

  static async renderProductsGrid() {
    const grid = document.getElementById("store-catalog-grid");
    if (!grid) return;

    const products = await StoreTab.fetchActiveProducts();
    const searchVal = (document.getElementById("store-catalog-search") as HTMLInputElement)?.value.toLowerCase() || "";
    
    let filtered = products.filter(p => {
      const matchCat = StoreTab.activeCategory === "all" || p.category === StoreTab.activeCategory;
      const matchSearch = !searchVal || p.title.toLowerCase().includes(searchVal);
      return matchCat && matchSearch;
    });

    grid.innerHTML = "";
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-xs text-slate-500 font-mono">No assets found matching your query.</div>`;
      return;
    }

    filtered.forEach(p => {
      const inWish = StoreTab.wishlist.includes(p.id);
      const cardContainer = document.createElement("div");
      cardContainer.innerHTML = StoreUI.getProductCardHTML(p, inWish);
      const card = cardContainer.firstElementChild as HTMLElement;

      card.querySelectorAll(".store-item-click-target").forEach(el => {
        (el as HTMLElement).onclick = () => {
          StoreTab.selectedProductId = p.id;
          
          // Update URL for deep linking
          const url = new URL(window.location.href);
          url.searchParams.set("tab", "store-details");
          url.searchParams.set("productId", p.id);
          window.history.pushState({}, "", url.toString());

          StoreTab.appInstance.currentTab = "store-details";
          StoreTab.appInstance.render();
        };
      });

      card.querySelector(".wish-toggle-btn")!.addEventListener("click", (e) => {
        e.stopPropagation();
        StoreTab.toggleWishlistItem(p.id);
      });

      card.querySelector(".add-to-cart-btn")!.addEventListener("click", (e) => {
        e.stopPropagation();
        StoreTab.addToCart(p);
      });

      grid.appendChild(card);
    });
  }

  static isShopMaintenance(): boolean {
    const s = StoreTab.appInstance?.db?.settings;
    const shopS = StoreTab.appInstance?.db?.shopSettings;
    return s?.shopMaintenanceMode === true || shopS?.isOpen === false;
  }

  static renderDetailsPage() {
    const contentArea = document.getElementById("store-content-area");
    if (!contentArea) return;

    const product = StoreTab.defaultProducts.find(p => p.id === StoreTab.selectedProductId) || StoreTab.defaultProducts[0];

    contentArea.innerHTML = StoreUI.getDetailsHTML(product);

    document.getElementById("store-details-add-cart")!.onclick = () => {
      StoreTab.addToCart(product);
    };
    document.getElementById("store-details-buy-now")!.onclick = () => {
      StoreTab.addToCart(product);
      StoreTab.appInstance.currentTab = "store-checkout";
      StoreTab.appInstance.render();
    };

    const shareBtn = document.getElementById("store-details-share");
    if (shareBtn) {
      shareBtn.onclick = async () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?tab=store-details&productId=${product.id}`;
        
        if (navigator.share) {
          try {
            await navigator.share({
              title: product.title,
              text: `Check out this premium asset on LuckyBox Shop: ${product.title}`,
              url: shareUrl
            });
          } catch (err: any) {
            if (err.name !== 'AbortError') {
              console.error("Share failed:", err);
            }
          }
        } else {
          // Fallback: Copy to clipboard
          try {
            await navigator.clipboard.writeText(shareUrl);
            StoreTab.appInstance.showToast("Link copied to clipboard! 📋", "success");
          } catch (err) {
            StoreTab.appInstance.showToast("Failed to copy link.", "error");
          }
        }
      };
    }
  }

  static renderCartPage() {
    const contentArea = document.getElementById("store-content-area");
    if (!contentArea) return;

    if (StoreTab.cart.length === 0) {
      contentArea.innerHTML = StoreUI.getCartEmptyHTML();
      document.getElementById("cart-back-to-shop")!.onclick = () => {
        StoreTab.appInstance.currentTab = "store";
        StoreTab.activeSubTab = "catalog";
        StoreTab.appInstance.render();
      };
      return;
    }

    const total = StoreTab.cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    contentArea.innerHTML = StoreUI.getCartHTML(StoreTab.cart, total);

    document.querySelectorAll(".cart-qty-btn").forEach(btn => {
      (btn as HTMLElement).onclick = () => {
        const id = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action");
        const item = StoreTab.cart.find(i => i.id === id);
        if (!item) return;
        if (action === "inc") item.qty++;
        else if (action === "dec" && item.qty > 1) item.qty--;
        StoreTab.saveCartToCache();
        StoreTab.render(StoreTab.appInstance);
      };
    });

    document.querySelectorAll(".cart-remove-btn").forEach(btn => {
      (btn as HTMLElement).onclick = () => {
        const id = btn.getAttribute("data-id");
        StoreTab.cart = StoreTab.cart.filter(i => i.id !== id);
        StoreTab.saveCartToCache();
        StoreTab.render(StoreTab.appInstance);
      };
    });

    document.getElementById("cart-proceed-to-checkout")!.onclick = () => {
      StoreTab.appInstance.currentTab = "store-checkout";
      StoreTab.appInstance.render();
    };
  }

  static renderCheckoutPage() {
    const contentArea = document.getElementById("store-content-area");
    if (!contentArea) return;

    const total = StoreTab.cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const balance = StoreTab.appInstance.currentUser ? StoreTab.appInstance.currentUser.balance || 0 : 0;
    const canPay = balance >= total && total > 0;

    contentArea.innerHTML = StoreUI.getCheckoutHTML(balance, total, StoreTab.cart, canPay);

    const confirmBtn = document.getElementById("checkout-confirm-btn");
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        if (canPay) {
           StoreTab.processCheckout();
        } else {
           StoreTab.appInstance.currentTab = "deposit";
           StoreTab.appInstance.render();
           StoreTab.appInstance.showToast("Add funds to continue shopping!", "info");
        }
      };
    }
  }

  static renderProfilePage() {
    const contentArea = document.getElementById("store-content-area");
    if (!contentArea) return;

    contentArea.innerHTML = StoreUI.getProfileHTML(StoreTab.appInstance.currentUser);

    // Bind Profile Nav Actions
    document.getElementById("profile-nav-orders")!.onclick = () => {
      StoreTab.activeSubTab = "orders";
      StoreTab.appInstance.render();
    };

    document.getElementById("profile-nav-address")!.onclick = () => {
       const sub = document.getElementById("profile-sub-view");
       if (sub) {
          sub.classList.remove("hidden");
          sub.innerHTML = StoreUI.getAddressFormHTML();
          // Bind Save Address
          const saveBtn = document.getElementById("save-address-btn");
          if (saveBtn) {
             saveBtn.onclick = () => {
                StoreTab.appInstance.showToast("Address updated successfully!", "success");
                sub.classList.add("hidden");
             };
          }
       }
    };

    document.getElementById("profile-nav-help")!.onclick = () => {
       const sub = document.getElementById("profile-sub-view");
       if (sub) {
          sub.classList.remove("hidden");
          sub.innerHTML = StoreUI.getSupportFormHTML();
          
          const form = document.getElementById("store-support-form");
          if (form) {
             form.onsubmit = async (e) => {
                e.preventDefault();
                const subject = (document.getElementById("support-subject") as HTMLSelectElement).value;
                const message = (document.getElementById("support-message") as HTMLTextAreaElement).value.trim();
                await StoreTab.submitSupportTicket(subject, message);
                (form as HTMLFormElement).reset();
                StoreTab.renderSupportTicketsList();
             };
          }
          StoreTab.renderSupportTicketsList();
       }
    };

    const adminNavBtn = document.getElementById("profile-nav-admin");
    if (adminNavBtn) {
       adminNavBtn.onclick = () => {
          StoreTab.appInstance.isAdminMode = true;
          StoreTab.appInstance.currentAdminTab = "store";
          StoreTab.appInstance.render();
       };
    }
  }

  static renderSupportTicketsList() {
    const list = document.getElementById("store-support-tickets");
    if (!list) return;

    let tickets = [];
    if (StoreTab.appInstance.db.digitalSupportTickets) {
      tickets = StoreTab.appInstance.db.digitalSupportTickets.filter((t: any) => t.user_id === StoreTab.appInstance.currentUser.id);
    }

    list.innerHTML = "";
    if (tickets.length === 0) {
       list.innerHTML = `<div class="py-10 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-[#16161a] border border-white/5 rounded-3xl">No tickets found</div>`;
       return;
    }

    tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).forEach((t: any) => {
       const box = document.createElement("div");
       box.className = "bg-[#16161a] border border-white/5 p-4 rounded-2xl space-y-2 shadow-lg";
       box.innerHTML = `
         <div class="flex justify-between items-start">
            <span class="text-[10px] font-black text-white uppercase truncate max-w-[150px]">${t.subject}</span>
            <span class="text-[8px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-tighter">${t.status}</span>
         </div>
         <p class="text-[10px] text-slate-500 line-clamp-2">${t.message}</p>
         ${t.admin_reply ? `<div class="bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10 text-[9px] text-cyan-400 font-bold"><span class="text-white">Admin:</span> ${t.admin_reply}</div>` : ''}
       `;
       list.appendChild(box);
    });
  }

  static renderWishlistPage() {
    const contentArea = document.getElementById("store-content-area");
    if (!contentArea) return;

    contentArea.innerHTML = StoreUI.getWishlistHTML();
    StoreTab.renderProductsGrid();
  }

  static async renderOrdersPage() {
    const contentArea = document.getElementById("store-content-area");
    if (!contentArea) return;

    contentArea.innerHTML = StoreUI.getOrdersHTML();

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

    const list = document.getElementById("store-orders-list");
    if (!list) return;

    list.innerHTML = "";
    if (orders.length === 0) {
      list.innerHTML = `<div class="py-20 text-center flex flex-col items-center gap-4 bg-[#16161a] border border-white/5 rounded-3xl">
        <i class="fa-solid fa-cloud-arrow-down text-3xl text-slate-800"></i>
        <p class="text-[10px] text-slate-600 font-black uppercase tracking-widest">Library is empty</p>
      </div>`;
      return;
    }

    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).forEach((o: any) => {
      const card = document.createElement("div");
      card.className = "bg-[#16161a] border border-white/5 p-4 rounded-3xl space-y-4 shadow-2xl relative overflow-hidden group";
      
      const apiBase = PathHelper.getApiBaseUrl();
      const secureDownloadUrl = `${apiBase}download.php?token=${o.download_token}`;

      card.innerHTML = `
        <div class="flex items-center gap-4 relative z-10">
           <div class="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <i class="fa-solid fa-file-shield text-2xl"></i>
           </div>
           <div class="flex-grow min-w-0">
              <h4 class="text-xs font-black text-white truncate">${o.title}</h4>
              <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ref: ${o.id}</p>
           </div>
           <a href="${secureDownloadUrl}" target="_blank" class="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-90 transition">
              <i class="fa-solid fa-download"></i>
           </a>
        </div>
        <div class="pt-3 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-widest">
           <span>Quota: ${o.download_count}/${o.max_downloads}</span>
           <span>Exp: ${new Date(o.expires_at).toLocaleDateString()}</span>
        </div>
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500"></div>
      `;
      list.appendChild(card);
    });
  }

  static renderCategoriesPage() {
    const contentArea = document.getElementById("store-content-area");
    if (!contentArea) return;

    contentArea.innerHTML = StoreUI.getCategoriesHTML(StoreTab.defaultCategories);

    document.querySelectorAll(".store-category-large").forEach(btn => {
      (btn as HTMLElement).onclick = () => {
        StoreTab.activeCategory = btn.getAttribute("data-cat") || "all";
        StoreTab.activeSubTab = "catalog";
        StoreTab.appInstance.render();
      };
    });
  }

  // ================= HELPERS =================

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
      console.warn("SQL Store API offline. Fallback active.");
    }
    return StoreTab.defaultProducts;
  }

  static toggleWishlistItem(id: string) {
    const idx = StoreTab.wishlist.indexOf(id);
    if (idx !== -1) {
      StoreTab.wishlist.splice(idx, 1);
      StoreTab.appInstance.showToast("Removed from saved list.", "info");
    } else {
      StoreTab.wishlist.push(id);
      StoreTab.appInstance.showToast("Added to saved list!", "success");
    }
    localStorage.setItem("lottery_store_wishlist", JSON.stringify(StoreTab.wishlist));
    StoreTab.render(StoreTab.appInstance);
  }

  static addToCart(product: any) {
    if (StoreTab.isShopMaintenance()) {
      StoreTab.appInstance?.showToast("Shop is currently under maintenance! Product purchases are disabled.", "error");
      return;
    }
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
    StoreTab.appInstance.showToast(`🎉 Added ${product.title.substring(0, 15)}... to Cart!`, "success");
  }

  static saveCartToCache() {
    localStorage.setItem("lottery_store_cart", JSON.stringify(StoreTab.cart));
  }

  static async processCheckout() {
    if (StoreTab.isShopMaintenance()) {
      StoreTab.appInstance?.showToast("Shop is currently under maintenance! Checkout is disabled.", "error");
      return;
    }
    if (StoreTab.cart.length === 0) return;
    const total = StoreTab.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    if (StoreTab.appInstance.currentUser.balance < total) {
       StoreTab.appInstance.showToast("Insufficient balance!", "error");
       return;
    }

    const settings = StoreTab.appInstance.db.shopSettings;
    if (settings) {
       if (settings.isOpen === false) {
          StoreTab.appInstance.showToast("Purchase failed: Store is currently closed.", "error");
          return;
       }
       if (total < (settings.minOrder || 0)) {
          StoreTab.appInstance.showToast(`Minimum order amount is ৳${settings.minOrder}`, "error");
          return;
       }
       if (total > (settings.maxOrder || 999999)) {
          StoreTab.appInstance.showToast(`Maximum order amount is ৳${settings.maxOrder}`, "error");
          return;
       }
    }

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
    StoreTab.appInstance.saveDB();

    StoreTab.cart = [];
    StoreTab.saveCartToCache();
    StoreTab.updateCartBadge();

    StoreTab.appInstance.currentTab = "store";
    StoreTab.activeSubTab = "orders";
    StoreTab.appInstance.render();
    StoreTab.appInstance.showToast("🎉 Purchase Successful! Library updated.", "success");
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
    StoreTab.appInstance.saveDB();
    StoreTab.appInstance.showToast("Support ticket submitted!", "success");
  }

  static startLiveSimulation() {
    if (StoreTab.liveSimulationInterval) clearInterval(StoreTab.liveSimulationInterval);
    const locations = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Comilla"];
    const preNames = ["shakil", "rakib", "milon", "arman", "fahim", "tariq"];
    const runSim = () => {
      // Logic for live purchase simulation
    };
    setTimeout(runSim, 1000);
    StoreTab.liveSimulationInterval = setInterval(runSim, 12000);
  }
}

function debounce(func: Function, wait: number) {
  let timeout: any;
  return function(...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
