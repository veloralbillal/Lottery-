/**
 * Lottery Winner - VIP Customization Store & Decor Module (customizer_store.js)
 * 
 * Manages the premium customizer interface, enabling users to preview and equip
 * high-fidelity avatar frames, profile board banners, and ambient aura glow effects.
 */

export const CUSTOM_FRAMES = [
  {
    id: "none",
    name: "None",
    price: 0,
    rating: 0,
    category: "frame",
    description: "Standard clean circular avatar profile mask"
  },
  // --- New Premium Frames from Image 1 ---
  {
    id: "cool",
    name: "Cool Golden Star",
    price: 399,
    rating: 3,
    category: "frame",
    description: "Shining gold star crown with high-luxury emojis and side feathers"
  },
  {
    id: "funny",
    name: "Funny Emoji Garden",
    price: 399,
    rating: 3,
    category: "frame",
    description: "Lively spring green frame filled with cheerful laughing emojis"
  },
  {
    id: "new",
    name: "New Challenger",
    price: 399,
    rating: 3,
    category: "frame",
    description: "Rich gold orbital ring with a prominent red diagonal 'NEW' badge"
  },
  {
    id: "wolf",
    name: "Neon Night Wolf",
    price: 399,
    rating: 3,
    category: "frame",
    description: "Fierce guardian alpha wolf with neon cybernetic wings at the base"
  },
  {
    id: "eagle",
    name: "Golden Valor Eagle",
    price: 399,
    rating: 3,
    category: "frame",
    description: "Golden metal crest featuring a soaring valor eagle and glorious wings"
  },
  {
    id: "lion",
    name: "Glacier Crest Lion",
    price: 399,
    rating: 3,
    category: "frame",
    description: "Royal icy crystal frame with a roaring blue ice lion emblem"
  },
  // --- New Premium Frames from Image 2 ---
  {
    id: "bear_hat",
    name: "Cute Plush Teddy",
    price: 159,
    rating: 2,
    category: "frame",
    description: "Adorable fluffy brown bear hat with sweet round ears sitting on top"
  },
  {
    id: "strawberry",
    name: "Strawberry Dream",
    price: 39,
    rating: 1,
    category: "frame",
    description: "Pink flower ring adorned with sweet ripe red strawberries"
  },
  {
    id: "popcorn",
    name: "Popcorn Carnival",
    price: 39,
    rating: 1,
    category: "frame",
    description: "Circus style striped popcorn box and floating golden kernels"
  },
  {
    id: "ramadan_kareem",
    name: "Ramadan Mubarak",
    price: 159,
    rating: 2,
    category: "frame",
    description: "Deep emerald ring with gold crescents and dangling lanterns"
  },
  {
    id: "islamic_crescent",
    name: "Islamic Crescent",
    price: 159,
    rating: 2,
    category: "frame",
    description: "Gleaming golden crescent moon with a hanging stellar lantern"
  },
  {
    id: "eid_mosque",
    name: "Holy Eid Mosque",
    price: 159,
    rating: 2,
    category: "frame",
    description: "Golden mosque minarets blueprint with a glowing starry sky"
  },
  // --- Standard/Classic Premium Frames ---
  {
    id: "royal",
    name: "Royal Crown Wings",
    price: 140,
    rating: 3,
    category: "frame",
    description: "Golden royal crown on top with beautiful flap-animated wings"
  },
  {
    id: "neon",
    name: "Cyberpunk Neon Grid",
    price: 80,
    rating: 2,
    category: "frame",
    description: "Vibrant pulsing cyan and hot-pink cyber laser array"
  },
  {
    id: "ruby",
    name: "Ruby Dragon Blaster",
    price: 160,
    rating: 3,
    category: "frame",
    description: "Double raging fire-breathing dragon horns on top of a ruby ring"
  },
  {
    id: "cosmic",
    name: "Cosmic Star Nebula",
    price: 90,
    rating: 2,
    category: "frame",
    description: "Starry purple cosmic galaxy with a small orbiting plasma orb"
  },
  {
    id: "phoenix",
    name: "Phoenix Rebirth",
    price: 170,
    rating: 3,
    category: "frame",
    description: "Raging orange phoenix crest with burning golden fire feathers"
  },
  {
    id: "dragon",
    name: "Emerald Jade Dragon",
    price: 180,
    rating: 3,
    category: "frame",
    description: "Majestic double emerald green jade dragons protecting a central gem"
  },
  {
    id: "love",
    name: "Cupid Love Valentine",
    price: 70,
    rating: 2,
    category: "frame",
    description: "Double pulsing Cupid red hearts with sweet soft angel wings"
  }
];

export const CUSTOM_BANNERS = [
  {
    id: "none",
    name: "None",
    price: 0,
    rating: 0,
    category: "banner",
    description: "Standard clean dark-slate background canvas"
  },
  {
    id: "gold_silk",
    name: "Golden Silk",
    price: 99,
    rating: 3,
    category: "banner",
    description: "Luxury shimming golden silk texture with premium golden glow"
  },
  {
    id: "cyber_neon",
    name: "Cyber Neon",
    price: 99,
    rating: 3,
    category: "banner",
    description: "Electrifying magenta to cyber blue tech lightning background"
  },
  {
    id: "nebula_starry",
    name: "Nebula Starry",
    price: 129,
    rating: 3,
    category: "banner",
    description: "Interstellar violet galaxy nebula containing thousands of stars"
  },
  {
    id: "sakura_blossom",
    name: "Sakura Dream",
    price: 79,
    rating: 2,
    category: "banner",
    description: "Dreamy cherry blossom pink breeze with soft glowing overlay"
  },
  {
    id: "volcano_flame",
    name: "Volcanic Magma",
    price: 89,
    rating: 2,
    category: "banner",
    description: "Fierce volcanic molten gold and blazing embers atmosphere"
  },
  {
    id: "ocean_breeze",
    name: "Ocean Breeze",
    price: 69,
    rating: 2,
    category: "banner",
    description: "Cool tropical emerald cyan tide and clean water ripples"
  }
];

export const CUSTOM_ANIMATIONS = [
  {
    id: "none",
    name: "None",
    price: 0,
    rating: 0,
    category: "animation",
    description: "No outer glow effect on profile board container"
  },
  {
    id: "pulse",
    name: "Radiant Rose Aura",
    price: 49,
    rating: 2,
    category: "animation",
    description: "Soft pulsing rich ruby aura that breathes around your card"
  },
  {
    id: "cyber",
    name: "Electric Cyan Spark",
    price: 59,
    rating: 2,
    category: "animation",
    description: "Electric cyberpunk tech lightning cyan glow board animation"
  },
  {
    id: "gold",
    name: "Amber VIP Royalty",
    price: 79,
    rating: 3,
    category: "animation",
    description: "Sovereign amber halo with golden sparkle highlights"
  },
  {
    id: "rainbow",
    name: "Quantum Rainbow",
    price: 89,
    rating: 3,
    category: "animation",
    description: "Full spectrum cosmic color wave that shifts smoothly across colors"
  },
  {
    id: "mystic",
    name: "Mystic Violet Pulse",
    price: 69,
    rating: 2,
    category: "animation",
    description: "Deep galactic purple aura radiating mystery and stardust"
  }
];

export class CustomizerStore {
  static activeTab = "frame"; // "frame", "banner", "animation"
  static previewFrame = "none";
  static previewBanner = "none";
  static previewAnimation = "none";

  static init(appInstance) {
    console.log("VIP Customizer Store initialized successfully.");

    // Event listener delegation on document for dynamic elements
    document.addEventListener("click", (e) => {
      if (!appInstance.currentUser) return;

      // Click: Toggle VIP Sidebar Menu instead of direct redirect
      if (e.target.closest("#profile-customize-menu-btn")) {
        const sidebar = document.getElementById("profile-sidebar-menu");
        if (sidebar) {
          const isClosed = sidebar.classList.contains("translate-x-full");
          const backdrop = document.getElementById("profile-sidebar-backdrop");
          if (isClosed) {
            sidebar.classList.remove("translate-x-full");
            if (backdrop) {
              backdrop.classList.remove("hidden");
              setTimeout(() => {
                backdrop.classList.add("opacity-100");
                backdrop.classList.remove("opacity-0");
              }, 10);
            }
            // Trigger badge updates
            window.chatProfileHelper?.updateNotificationBadgeOff();
          } else {
            sidebar.classList.add("translate-x-full");
            if (backdrop) {
              backdrop.classList.add("opacity-0");
              backdrop.classList.remove("opacity-100");
              setTimeout(() => {
                backdrop.classList.add("hidden");
              }, 300);
            }
          }
        }
        return;
      }

      // Click: Close sidebar via close button or clicking backdrop
      if (e.target.closest("#profile-sidebar-close-btn") || e.target.id === "profile-sidebar-backdrop") {
        const sidebar = document.getElementById("profile-sidebar-menu");
        if (sidebar) {
          sidebar.classList.add("translate-x-full");
          const backdrop = document.getElementById("profile-sidebar-backdrop");
          if (backdrop) {
            backdrop.classList.add("opacity-0");
            backdrop.classList.remove("opacity-100");
            setTimeout(() => {
              backdrop.classList.add("hidden");
            }, 300);
          }
        }
        return;
      }

      // Click option: Messenger
      if (e.target.closest("#sidebar-opt-messenger")) {
        const sidebar = document.getElementById("profile-sidebar-menu");
        if (sidebar) {
          sidebar.classList.add("translate-x-full");
          const backdrop = document.getElementById("profile-sidebar-backdrop");
          if (backdrop) {
            backdrop.classList.add("opacity-0");
            backdrop.classList.remove("opacity-100");
            setTimeout(() => {
              backdrop.classList.add("hidden");
            }, 300);
          }
        }
        // Open messenger center
        window.chatProfileHelper?.openChatCenter();
        return;
      }

      // Click option: Setting
      if (e.target.closest("#sidebar-opt-settings")) {
        const sidebar = document.getElementById("profile-sidebar-menu");
        if (sidebar) {
          sidebar.classList.add("translate-x-full");
          const backdrop = document.getElementById("profile-sidebar-backdrop");
          if (backdrop) {
            backdrop.classList.add("opacity-0");
            backdrop.classList.remove("opacity-100");
            setTimeout(() => {
              backdrop.classList.add("hidden");
            }, 300);
          }
        }
        appInstance.currentTab = "settings";
        appInstance.render();
        return;
      }

      // Click option: Customizer (Decor)
      if (e.target.closest("#sidebar-opt-customizer")) {
        const sidebar = document.getElementById("profile-sidebar-menu");
        if (sidebar) {
          sidebar.classList.add("translate-x-full");
          const backdrop = document.getElementById("profile-sidebar-backdrop");
          if (backdrop) {
            backdrop.classList.add("opacity-0");
            backdrop.classList.remove("opacity-100");
            setTimeout(() => {
              backdrop.classList.add("hidden");
            }, 300);
          }
        }
        appInstance.currentTab = "customizer";
        appInstance.render();
        return;
      }

      // Click: Go back to profile tab
      if (e.target.closest("#customizer-back-btn")) {
        appInstance.currentTab = "profile";
        appInstance.render();
        return;
      }

      // Click: Close VIP Customizer modal (legacy support)
      if (e.target.closest("#profile-customizer-close-btn") || e.target.id === "profile-customizer-modal") {
        this.closeModal();
        return;
      }

      // Click: Switch Customizer tab
      const tabBtn = e.target.closest(".customizer-tab-btn");
      if (tabBtn) {
        const targetTab = tabBtn.getAttribute("data-tab");
        this.activeTab = targetTab;
        this.updateTabButtons();
        this.renderItemsGrid(appInstance);
        return;
      }

      // Click: Preview Item
      const previewBtn = e.target.closest(".customizer-preview-btn");
      if (previewBtn) {
        const itemId = previewBtn.getAttribute("data-item-id");
        const category = previewBtn.getAttribute("data-category");

        if (category === "frame") this.previewFrame = itemId;
        else if (category === "banner") this.previewBanner = itemId;
        else if (category === "animation") this.previewAnimation = itemId;

        appInstance.showToast("Applied temporary preview to avatar board!", "info");
        this.renderLivePreviewCard(appInstance);
        return;
      }

      // Click: Unlock/Equip (Add) Item
      const equipBtn = e.target.closest(".customizer-equip-btn");
      if (equipBtn) {
        const itemId = equipBtn.getAttribute("data-item-id");
        const category = equipBtn.getAttribute("data-category");
        const price = parseInt(equipBtn.getAttribute("data-price") || "0");

        this.handleEquipItem(appInstance, category, itemId, price);
        return;
      }

      // Click: Profile Add Option (Change/Add Profile Avatar Photo)
      const addPhotoBtn = e.target.closest("#customizer-add-photo-btn");
      if (addPhotoBtn) {
        const photoUrl = prompt("Enter a profile avatar photo image URL:", appInstance.currentUser.photo || "");
        if (photoUrl !== null) {
          appInstance.currentUser.photo = photoUrl.trim();
          appInstance.saveDB();
          appInstance.showToast("Profile avatar photo updated successfully!", "success");
          this.renderLivePreviewCard(appInstance);
          appInstance.render(); // sync main tabs
        }
        return;
      }
    });
  }

  static renderTab(appInstance) {
    const user = appInstance.currentUser;
    if (!user) return;
    
    // If we are opening the tab fresh, initialize preview selections to the equipped ones
    if (this.previewFrame === undefined) this.previewFrame = user.avatarFrame || "none";
    if (this.previewBanner === undefined) this.previewBanner = user.profileBanner || "none";
    if (this.previewAnimation === undefined) this.previewAnimation = user.profileGlow || "none";
    if (!this.activeTab) this.activeTab = "frame";

    const container = document.getElementById("tab-customizer");
    if (!container) return;

    // Inject Base Tab Shell Structure (designed to be fully inline and mobile responsive)
    container.innerHTML = `
      <div class="space-y-5 animate-fade-in">
        <!-- Back navigation row & Header Info -->
        <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
          <button type="button" id="customizer-back-btn" class="w-8 h-8 rounded-xl bg-slate-950 border border-slate-850 hover:border-rose-500/60 flex items-center justify-center text-slate-400 hover:text-rose-450 transition cursor-pointer" title="Go back to profile">
            <i class="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <div class="flex-1">
            <h2 class="text-sm font-black text-white flex items-center gap-1.5 font-display uppercase tracking-wide">
              <i class="fa-solid fa-gem text-amber-500 animate-pulse"></i> VIP Customizer
            </h2>
            <p class="text-[9px] text-slate-500 font-sans mt-0.5">Personalize your live avatar profile board</p>
          </div>
        </div>

        <!-- Single Column stacked layout: Visual Showcase Preview Card -->
        <div class="bg-slate-950/75 border border-slate-850/60 p-5 rounded-3xl text-center space-y-4 relative overflow-hidden">
          <div class="absolute -right-12 -top-12 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none"></div>
          <div class="absolute -left-12 -bottom-12 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none"></div>

          <div class="space-y-1">
            <span class="text-[8px] uppercase font-mono tracking-widest text-amber-500 font-bold flex items-center justify-center gap-1">
              <i class="fa-solid fa-wand-magic-sparkles animate-pulse"></i> Interactive Live Preview
            </span>
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Custom Board</h4>
          </div>

          <!-- Preview Mockup Display -->
          <div class="py-2 flex flex-col items-center gap-3">
            <div id="customizer-preview-board-container" class="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 p-5 rounded-3xl text-center space-y-3.5 shadow-xl transition-all duration-500 w-full max-w-[210px]">
              
              <!-- Preview Banner Background Overlay -->
              <div id="customizer-preview-banner-overlay" class="absolute inset-0 opacity-40 pointer-events-none transition-all duration-300"></div>

              <!-- Avatar with Frame Overlay -->
              <div class="relative w-16 h-16 mx-auto flex items-center justify-center" id="customizer-preview-avatar-outer-wrapper">
                <!-- Frame Container -->
                <div id="customizer-preview-frame-overlay" class="absolute -inset-1.5 z-10 flex items-center justify-center pointer-events-none"></div>
                <!-- Core avatar mask -->
                <div class="relative w-16 h-16 bg-slate-950 border border-slate-900 text-slate-400 rounded-full flex items-center justify-center text-2xl overflow-hidden font-sans">
                  <img id="customizer-preview-avatar-img" class="absolute inset-0 w-full h-full object-cover rounded-full hidden" src="" alt="Avatar" referrerPolicy="no-referrer" />
                  <i id="customizer-preview-avatar-fallback" class="fa-solid fa-user-astronaut text-slate-500 absolute"></i>
                </div>
              </div>

              <!-- Username & Stats Mockup -->
              <div class="space-y-0.5 pointer-events-none">
                <div class="text-[11px] font-black text-white truncate flex items-center justify-center gap-1">
                  @${user.username}
                  <i class="fa-solid fa-circle-check text-sky-400 text-[9px]"></i>
                </div>
                <div class="text-[8px] text-slate-500 font-mono text-center">LEVEL ${user.level || 1} • VIP PLAYER</div>
              </div>
            </div>

            <!-- Profile photo change option -->
            <div class="flex items-center gap-1.5 w-full max-w-[210px]">
              <button type="button" id="customizer-add-photo-btn" class="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] text-amber-400 font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition shadow-sm" title="Change via Image URL">
                <i class="fa-solid fa-link text-amber-500 text-[8.5px]"></i> URL
              </button>
              <label class="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] text-amber-400 font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition shadow-sm" title="Upload local image file">
                <i class="fa-solid fa-cloud-arrow-up text-amber-500 text-[8.5px]"></i> Upload
                <input type="file" id="customizer-tab-upload-input" accept="image/*" class="hidden" />
              </label>
            </div>
          </div>

          <!-- Wallet Balance details -->
          <div class="bg-slate-900 border border-slate-850 p-3 rounded-2xl flex justify-between items-center max-w-[210px] mx-auto">
            <span class="text-[9px] text-slate-500 font-mono font-bold uppercase">Balance:</span>
            <span class="text-xs font-black text-emerald-400 font-mono">৳${(user.balance || 0).toFixed(2)}</span>
          </div>
        </div>

        <!-- Store Section -->
        <div class="bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl space-y-4">
          <!-- Category Segment Tabs -->
          <div class="flex border-b border-slate-850 pb-2.5 gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
            <button type="button" class="customizer-tab-btn flex-1 py-2 px-3 rounded-xl text-[9.5px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap" data-tab="frame">
              <i class="fa-solid fa-wand-magic-sparkles text-xs"></i> Frame
            </button>
            <button type="button" class="customizer-tab-btn flex-1 py-2 px-3 rounded-xl text-[9.5px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap" data-tab="banner">
              <i class="fa-solid fa-image text-xs"></i> Banner
            </button>
            <button type="button" class="customizer-tab-btn flex-1 py-2 px-3 rounded-xl text-[9.5px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap" data-tab="animation">
              <i class="fa-solid fa-circle-nodes text-xs"></i> Glows
            </button>
          </div>

          <!-- Product Grid List Container -->
          <div id="customizer-items-grid" class="space-y-2.5 max-h-[400px] overflow-y-auto pr-1 scrollbar-none">
            <!-- Rendered Dynamically -->
          </div>
        </div>

        <!-- Bottom details -->
        <div class="text-center text-[9px] text-slate-600 font-mono py-2">
          <span>Premium Personalization Suite • Crafted in Style</span>
        </div>
      </div>
    `;

    this.updateTabButtons();
    this.renderLivePreviewCard(appInstance);
    this.renderItemsGrid(appInstance);
  }

  static openModal(appInstance) {
    const user = appInstance.currentUser;
    this.previewFrame = user.avatarFrame || "none";
    this.previewBanner = user.profileBanner || "none";
    this.previewAnimation = user.profileGlow || "none";
    this.activeTab = "frame";

    // Ensure modal container is appended to document body
    let modal = document.getElementById("profile-customizer-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "profile-customizer-modal";
      modal.className = "hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto";
      document.body.appendChild(modal);
    }

    // Inject Base Modal Shell Structure
    modal.innerHTML = `
      <div class="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[90vh]">
        <!-- Left Column: Visual Showcase Frame Center -->
        <div class="w-full md:w-5/12 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-850 p-5 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div class="absolute -left-12 -top-12 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none"></div>
          <div class="absolute -right-12 -bottom-12 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none"></div>

          <div class="text-center md:text-left space-y-1 z-10">
            <span class="text-[8px] uppercase font-mono tracking-widest text-amber-500 font-bold flex items-center justify-center md:justify-start gap-1">
              <i class="fa-solid fa-wand-magic-sparkles animate-pulse"></i> Interactive Preview
            </span>
            <h3 class="text-sm font-black text-white font-display uppercase tracking-wide">Avatar Board Live</h3>
          </div>

          <!-- The Live Interactive Avatar Board Mockup -->
          <div class="my-4 py-2 flex flex-col items-center gap-3 z-10">
            <div id="customizer-preview-board-container" class="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 p-4 rounded-2xl text-center space-y-3 shadow-xl transition-all duration-500 w-full max-w-[190px]">
              
              <!-- Preview Banner Background -->
              <div id="customizer-preview-banner-overlay" class="absolute inset-0 opacity-40 pointer-events-none transition-all duration-300"></div>

              <!-- Avatar with Frame Overlay -->
              <div class="relative w-14 h-14 mx-auto flex items-center justify-center" id="customizer-preview-avatar-outer-wrapper">
                <!-- Frame Container -->
                <div id="customizer-preview-frame-overlay" class="absolute -inset-1 z-10 flex items-center justify-center pointer-events-none"></div>
                <!-- Core avatar -->
                <div class="relative w-14 h-14 bg-slate-950 border border-slate-800 text-slate-400 rounded-full flex items-center justify-center text-xl overflow-hidden font-sans">
                  <img id="customizer-preview-avatar-img" class="absolute inset-0 w-full h-full object-cover rounded-full hidden" src="" alt="Avatar" referrerPolicy="no-referrer" />
                  <i id="customizer-preview-avatar-fallback" class="fa-solid fa-user-astronaut text-slate-500 absolute"></i>
                </div>
              </div>

              <!-- Username & Stats Mockup -->
              <div class="space-y-0.5 pointer-events-none">
                <div class="text-[10px] font-black text-white truncate flex items-center justify-center gap-1">
                  @${user.username}
                  <i class="fa-solid fa-circle-check text-sky-400 text-[8px]"></i>
                </div>
                <div class="text-[8px] text-slate-500 font-mono text-center">LEVEL ${user.level || 1} • VIP PLAYER</div>
              </div>
            </div>

            <!-- Profile Add / Photo Change Button option -->
            <button type="button" id="customizer-add-photo-btn" class="w-full max-w-[190px] py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] text-amber-400 font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition">
              <i class="fa-solid fa-camera-retro text-amber-500"></i> Change Avatar Photo
            </button>
          </div>

          <!-- Bottom: Wallet Balance indicator -->
          <div class="bg-slate-900 border border-slate-850 p-3 rounded-2xl z-10 flex justify-between items-center">
            <span class="text-[9px] text-slate-500 font-mono font-bold uppercase">Your Wallet:</span>
            <span class="text-xs font-black text-emerald-400 font-mono">৳${(user.balance || 0).toFixed(2)}</span>
          </div>
        </div>

        <!-- Right Column: Product Store Tabs Grid -->
        <div class="flex-1 p-5 flex flex-col justify-between overflow-hidden min-w-0">
          
          <!-- Header and Close -->
          <div class="flex justify-between items-start border-b border-slate-850 pb-3 shrink-0">
            <div>
              <h2 class="text-sm font-black text-white flex items-center gap-1.5 font-display uppercase tracking-wider">
                <i class="fa-solid fa-gem text-amber-500 animate-bounce"></i> VIP Personalization Store
              </h2>
              <p class="text-[9px] text-slate-400 font-sans mt-0.5">Customize your frame, profile banner, and premium glows.</p>
            </div>
            <button type="button" id="profile-customizer-close-btn" class="w-7 h-7 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer">
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>

          <!-- Category Top Segment Tabs -->
          <div class="flex border-b border-slate-850 py-2.5 gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
            <button type="button" class="customizer-tab-btn flex-1 py-1.5 px-3 rounded-xl text-[9px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap" data-tab="frame">
              <i class="fa-solid fa-wand-magic-sparkles text-xs"></i> Frame
            </button>
            <button type="button" class="customizer-tab-btn flex-1 py-1.5 px-3 rounded-xl text-[9px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap" data-tab="banner">
              <i class="fa-solid fa-image text-xs"></i> Banner
            </button>
            <button type="button" class="customizer-tab-btn flex-1 py-1.5 px-3 rounded-xl text-[9px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap" data-tab="animation">
              <i class="fa-solid fa-circle-nodes text-xs"></i> Glows
            </button>
          </div>

          <!-- Product Grid List Container -->
          <div id="customizer-items-grid" class="flex-1 overflow-y-auto py-4 space-y-2.5 max-h-[350px] md:max-h-none scrollbar-none">
            <!-- Rendered Dynamically -->
          </div>

          <!-- Save and Equip Status -->
          <div class="border-t border-slate-850 pt-3 flex justify-end shrink-0 text-[10px] text-slate-500 font-mono">
            <span>Powered by Premium Royal Asset Engine</span>
          </div>

        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    this.updateTabButtons();
    this.renderLivePreviewCard(appInstance);
    this.renderItemsGrid(appInstance);
  }

  static closeModal() {
    const modal = document.getElementById("profile-customizer-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  static updateTabButtons() {
    const btns = document.querySelectorAll(".customizer-tab-btn");
    btns.forEach(btn => {
      const tab = btn.getAttribute("data-tab");
      if (tab === this.activeTab) {
        btn.className = "customizer-tab-btn flex-1 py-1.5 px-3 rounded-xl text-[9px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30";
      } else {
        btn.className = "customizer-tab-btn flex-1 py-1.5 px-3 rounded-xl text-[9px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap bg-slate-950 border border-slate-850/80 text-slate-400 hover:text-slate-200 hover:border-slate-800";
      }
    });
  }

  static renderLivePreviewCard(appInstance) {
    const user = appInstance.currentUser;
    if (!user) return;

    // Use querySelectorAll to find ALL instances of these preview elements in the document
    const boardContainers = document.querySelectorAll("[id='customizer-preview-board-container']");
    const bannerOverlays = document.querySelectorAll("[id='customizer-preview-banner-overlay']");
    const frameOverlays = document.querySelectorAll("[id='customizer-preview-frame-overlay']");
    const previewImgs = document.querySelectorAll("[id='customizer-preview-avatar-img']");
    const previewFallbacks = document.querySelectorAll("[id='customizer-preview-avatar-fallback']");

    // Apply Preview Board Glow to all matching containers
    boardContainers.forEach(boardContainer => {
      boardContainer.classList.remove(
        "shadow-[0_0_15px_rgba(244,63,94,0.35)]", "border-rose-500/50",
        "shadow-[0_0_15px_rgba(34,211,238,0.35)]", "border-cyan-500/50",
        "shadow-[0_0_15px_rgba(245,158,11,0.35)]", "border-amber-500/50",
        "shadow-[0_0_20px_rgba(168,85,247,0.3)]", "border-purple-500/50", "animate-pulse"
      );

      const glow = this.previewAnimation;
      if (glow === "pulse") {
        boardContainer.classList.add("shadow-[0_0_15px_rgba(244,63,94,0.35)]", "border-rose-500/50");
      } else if (glow === "cyber") {
        boardContainer.classList.add("shadow-[0_0_15px_rgba(34,211,238,0.35)]", "border-cyan-500/50");
      } else if (glow === "gold") {
        boardContainer.classList.add("shadow-[0_0_15px_rgba(245,158,11,0.35)]", "border-amber-500/50");
      } else if (glow === "rainbow") {
        boardContainer.classList.add("shadow-[0_0_20px_rgba(168,85,247,0.3)]", "border-purple-500/50", "animate-pulse");
      } else if (glow === "mystic") {
        boardContainer.classList.add("shadow-[0_0_20px_rgba(168,85,247,0.35)]", "border-purple-500/60");
      }
    });

    // Apply Preview Banner Background to all overlays
    bannerOverlays.forEach(bannerOverlay => {
      bannerOverlay.className = "absolute inset-0 opacity-45 pointer-events-none transition-all duration-300 z-0";
      const banner = this.previewBanner;

      if (banner === "gold_silk") {
        bannerOverlay.classList.add("bg-gradient-to-tr", "from-amber-700/30", "via-yellow-600/20", "to-amber-900/40", "animate-gold-shine");
      } else if (banner === "cyber_neon") {
        bannerOverlay.classList.add("bg-gradient-to-tr", "from-fuchsia-900/45", "via-purple-950/20", "to-cyan-900/45");
      } else if (banner === "nebula_starry") {
        bannerOverlay.classList.add("bg-gradient-to-b", "from-slate-950", "via-indigo-950/50", "to-slate-950");
      } else if (banner === "sakura_blossom") {
        bannerOverlay.classList.add("bg-gradient-to-tr", "from-pink-900/35", "via-rose-950/25", "to-pink-950/40");
      } else if (banner === "volcano_flame") {
        bannerOverlay.classList.add("bg-gradient-to-br", "from-red-950/45", "via-slate-950", "to-orange-950/30");
      } else if (banner === "ocean_breeze") {
        bannerOverlay.classList.add("bg-gradient-to-tr", "from-teal-950/45", "via-slate-950", "to-cyan-950/30");
      } else {
        bannerOverlay.classList.add("bg-transparent");
      }
    });

    // Apply Preview Frame Overlay
    frameOverlays.forEach(frameOverlay => {
      frameOverlay.innerHTML = this.getFrameOverlayHTML(this.previewFrame);
    });

    // Set Avatar Image Source
    previewImgs.forEach((previewImg, index) => {
      const previewFallback = previewFallbacks[index];
      if (user.photo) {
        previewImg.src = user.photo;
        previewImg.classList.remove("hidden");
        if (previewFallback) previewFallback.classList.add("hidden");
      } else {
        previewImg.src = "";
        previewImg.classList.add("hidden");
        if (previewFallback) previewFallback.classList.remove("hidden");
      }
    });
  }

  static renderItemsGrid(appInstance) {
    const grid = document.getElementById("customizer-items-grid");
    if (!grid) return;

    grid.innerHTML = "";
    const user = appInstance.currentUser;

    let itemsList = [];
    if (this.activeTab === "frame") itemsList = CUSTOM_FRAMES;
    else if (this.activeTab === "banner") itemsList = CUSTOM_BANNERS;
    else if (this.activeTab === "animation") itemsList = CUSTOM_ANIMATIONS;

    itemsList.forEach(item => {
      // Determine if unlocked/owned
      const isFree = item.price === 0;
      const isUnlocked = isFree || (user.unlockedItems && user.unlockedItems.includes(item.id));
      
      // Determine if currently equipped
      let isEquipped = false;
      if (item.category === "frame") isEquipped = (user.avatarFrame || "none") === item.id;
      else if (item.category === "banner") isEquipped = (user.profileBanner || "none") === item.id;
      else if (item.category === "animation") isEquipped = (user.profileGlow || "none") === item.id;

      // Determine if actively previewed
      let isPreviewed = false;
      if (item.category === "frame") isPreviewed = this.previewFrame === item.id;
      else if (item.category === "banner") isPreviewed = this.previewBanner === item.id;
      else if (item.category === "animation") isPreviewed = this.previewAnimation === item.id;

      // Draw star items
      let starHtml = "";
      if (item.rating > 0) {
        for (let i = 0; i < 3; i++) {
          if (i < item.rating) {
            starHtml += `<i class="fa-solid fa-star text-amber-400 text-[8px]"></i>`;
          } else {
            starHtml += `<i class="fa-regular fa-star text-slate-700 text-[8px]"></i>`;
          }
        }
      }

      // Border and BG highlight
      let cardBorderClass = "border-slate-850 bg-slate-950/60";
      if (isEquipped) {
        cardBorderClass = "border-emerald-500/40 bg-emerald-950/15";
      } else if (isPreviewed) {
        cardBorderClass = "border-amber-500/40 bg-amber-950/10";
      }

      const itemCard = document.createElement("div");
      itemCard.className = `flex items-center gap-3.5 p-3 rounded-2xl border ${cardBorderClass} transition duration-150 relative overflow-hidden group`;

      // Thumbnail Representation
      let thumbnailHtml = "";
      if (item.category === "frame") {
        thumbnailHtml = `
          <div class="relative w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center overflow-hidden shrink-0">
            <span class="text-slate-700 text-xs"><i class="fa-solid fa-user"></i></span>
            <div class="absolute inset-0 z-10 flex items-center justify-center scale-90 pointer-events-none">
              ${this.getFrameOverlayHTML(item.id)}
            </div>
          </div>
        `;
      } else if (item.category === "banner") {
        let bannerBgClass = "bg-slate-900";
        if (item.id === "gold_silk") bannerBgClass = "bg-gradient-to-tr from-amber-700 via-yellow-600 to-amber-900";
        else if (item.id === "cyber_neon") bannerBgClass = "bg-gradient-to-tr from-fuchsia-900 via-purple-950 to-cyan-900";
        else if (item.id === "nebula_starry") bannerBgClass = "bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950";
        else if (item.id === "sakura_blossom") bannerBgClass = "bg-gradient-to-tr from-pink-900 via-slate-950 to-pink-900";
        else if (item.id === "volcano_flame") bannerBgClass = "bg-gradient-to-br from-red-950 via-slate-950 to-orange-950";
        else if (item.id === "ocean_breeze") bannerBgClass = "bg-gradient-to-tr from-teal-950 via-slate-950 to-cyan-950";

        thumbnailHtml = `
          <div class="w-12 h-12 rounded-xl ${bannerBgClass} border border-slate-800 shrink-0 relative overflow-hidden flex items-center justify-center">
            <span class="text-white/20 text-xs"><i class="fa-solid fa-image"></i></span>
          </div>
        `;
      } else if (item.category === "animation") {
        let auraShadowClass = "bg-slate-900";
        if (item.id === "pulse") auraShadowClass = "bg-slate-900 shadow-[0_0_12px_rgba(244,63,94,0.85)] border-rose-500/50";
        else if (item.id === "cyber") auraShadowClass = "bg-slate-900 shadow-[0_0_12px_rgba(34,211,238,0.85)] border-cyan-500/50";
        else if (item.id === "gold") auraShadowClass = "bg-slate-900 shadow-[0_0_12px_rgba(245,158,11,0.85)] border-amber-500/50";
        else if (item.id === "rainbow") auraShadowClass = "bg-slate-900 shadow-[0_0_15px_rgba(168,85,247,0.85)] border-purple-500/50";
        else if (item.id === "mystic") auraShadowClass = "bg-slate-900 shadow-[0_0_15px_rgba(168,85,247,0.85)] border-purple-500/60";

        thumbnailHtml = `
          <div class="w-12 h-12 rounded-full border border-slate-800 shrink-0 flex items-center justify-center ${auraShadowClass} relative transition">
            <span class="text-[9px] text-slate-600"><i class="fa-solid fa-bolt"></i></span>
          </div>
        `;
      }

      // Badge/Price configuration
      let actionBtnHtml = "";
      if (isEquipped) {
        actionBtnHtml = `
          <span class="text-[8px] font-black uppercase text-emerald-400 bg-emerald-950 border border-emerald-900/60 px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
            <i class="fa-solid fa-circle-check"></i> Equipped
          </span>
        `;
      } else {
        const previewBtnClass = isPreviewed
          ? "bg-amber-600/20 text-amber-400 border border-amber-500/30"
          : "bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-850 hover:text-slate-200";

        const equipBtnText = isUnlocked ? "Equip" : `Buy ৳${item.price}`;
        const equipIcon = isUnlocked ? "fa-circle-check" : "fa-lock";
        const equipBtnClass = isUnlocked
          ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/20"
          : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-rose-950/20";

        actionBtnHtml = `
          <div class="flex items-center gap-1.5">
            <button type="button" class="customizer-preview-btn ${previewBtnClass} font-mono font-bold text-[8px] uppercase px-2.5 py-1.5 rounded-xl transition cursor-pointer shrink-0" data-item-id="${item.id}" data-category="${item.category}" title="Preview on card">
              Preview
            </button>
            <button type="button" class="customizer-equip-btn ${equipBtnClass} font-black font-mono text-[8px] uppercase px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0" data-item-id="${item.id}" data-category="${item.category}" data-price="${item.price}">
              <i class="fa-solid ${equipIcon} text-[9px]"></i> ${equipBtnText}
            </button>
          </div>
        `;
      }

      itemCard.innerHTML = `
        ${thumbnailHtml}
        <div class="flex-1 min-w-0 space-y-0.5">
          <div class="flex items-center gap-1.5">
            <h4 class="text-xs font-black text-white truncate uppercase tracking-tight">${item.name}</h4>
            ${starHtml ? `<div class="flex items-center gap-0.5">${starHtml}</div>` : ""}
          </div>
          <p class="text-[9.5px] text-slate-400 leading-snug font-sans truncate pr-2">${item.description}</p>
          <div class="flex items-center gap-2 pt-0.5">
            <span class="text-[8px] font-mono uppercase font-black tracking-wider text-slate-500">
              ${isFree ? "Default Free" : `VIP PREMIUM • ৳${item.price}`}
            </span>
            ${isUnlocked && !isFree ? `<span class="text-[8px] text-emerald-400 font-bold bg-emerald-950/30 px-1 py-0.2 rounded">Purchased</span>` : ""}
          </div>
        </div>
        <div class="shrink-0">
          ${actionBtnHtml}
        </div>
      `;

      grid.appendChild(itemCard);
    });
  }

  static handleEquipItem(appInstance, category, itemId, price) {
    const user = appInstance.currentUser;
    if (!user) return;

    const isFree = price === 0;
    user.unlockedItems = user.unlockedItems || [];
    const isUnlocked = isFree || user.unlockedItems.includes(itemId);

    if (!isUnlocked) {
      // Purchase Flow
      const currentBalance = user.balance || 0;
      if (currentBalance < price) {
        appInstance.showToast(`Insufficient balance! You need ৳${price} to unlock this item.`, "error");
        return;
      }

      // Deduct balance
      user.balance = currentBalance - price;
      user.unlockedItems.push(itemId);
      appInstance.showToast(`Unlocked and added ${itemId.toUpperCase()} to your collections!`, "success");
    }

    // Equip Flow
    if (category === "frame") {
      user.avatarFrame = itemId;
    } else if (category === "banner") {
      user.profileBanner = itemId;
    } else if (category === "animation") {
      user.profileGlow = itemId;
    }

    appInstance.saveDB();
    appInstance.showToast("Your royal profile decor applied successfully!", "success");

    // Sync live previews in customizer store
    this.previewFrame = user.avatarFrame || "none";
    this.previewBanner = user.profileBanner || "none";
    this.previewAnimation = user.profileGlow || "none";

    this.renderLivePreviewCard(appInstance);
    this.renderItemsGrid(appInstance);

    // Sync original profile tab
    const profileOverlay = document.getElementById("profile-frame-overlay");
    if (profileOverlay) {
      profileOverlay.innerHTML = this.getFrameOverlayHTML(user.avatarFrame);
    }

    // Refresh original profile banner background
    const profileBannerOverlay = document.getElementById("profile-banner-overlay");
    if (profileBannerOverlay) {
      this.applyBannerBackground(profileBannerOverlay, user.profileBanner);
    }

    // Refresh original profile board container glow
    const boardContainer = document.getElementById("profile-identity-board-container");
    if (boardContainer) {
      boardContainer.classList.remove(
        "shadow-[0_0_20px_rgba(244,63,94,0.35)]", "border-rose-500/50",
        "shadow-[0_0_20px_rgba(34,211,238,0.35)]", "border-cyan-500/50",
        "shadow-[0_0_20px_rgba(245,158,11,0.35)]", "border-amber-500/50",
        "shadow-[0_0_25px_rgba(168,85,247,0.3)]", "border-purple-500/50", "animate-pulse"
      );

      const glow = user.profileGlow || "none";
      if (glow === "pulse") {
        boardContainer.classList.add("shadow-[0_0_20px_rgba(244,63,94,0.35)]", "border-rose-500/50");
      } else if (glow === "cyber") {
        boardContainer.classList.add("shadow-[0_0_20px_rgba(34,211,238,0.35)]", "border-cyan-500/50");
      } else if (glow === "gold") {
        boardContainer.classList.add("shadow-[0_0_20px_rgba(245,158,11,0.35)]", "border-amber-500/50");
      } else if (glow === "rainbow") {
        boardContainer.classList.add("shadow-[0_0_25px_rgba(168,85,247,0.3)]", "border-purple-500/50", "animate-pulse");
      } else if (glow === "mystic") {
        boardContainer.classList.add("shadow-[0_0_25px_rgba(168,85,247,0.35)]", "border-purple-500/60");
      }
    }

    // Refresh general app metrics (e.g. balance display in header/wallet)
    appInstance.render();
  }

  static applyBannerBackground(element, bannerId) {
    if (!element) return;
    element.className = "absolute inset-0 opacity-40 pointer-events-none transition-all duration-500 z-0";
    if (bannerId === "gold_silk") {
      element.classList.add("bg-gradient-to-tr", "from-amber-700/30", "via-yellow-600/20", "to-amber-900/40", "animate-gold-shine");
    } else if (bannerId === "cyber_neon") {
      element.classList.add("bg-gradient-to-tr", "from-fuchsia-900/45", "via-purple-950/20", "to-cyan-900/45");
    } else if (bannerId === "nebula_starry") {
      element.classList.add("bg-gradient-to-b", "from-slate-950", "via-indigo-950/50", "to-slate-950");
    } else if (bannerId === "sakura_blossom") {
      element.classList.add("bg-gradient-to-tr", "from-pink-900/35", "via-rose-950/25", "to-pink-950/40");
    } else if (bannerId === "volcano_flame") {
      element.classList.add("bg-gradient-to-br", "from-red-950/45", "via-slate-950", "to-orange-950/30");
    } else if (bannerId === "ocean_breeze") {
      element.classList.add("bg-gradient-to-tr", "from-teal-950/45", "via-slate-950", "to-cyan-950/30");
    } else {
      element.classList.add("bg-transparent");
    }
  }

  static getFrameOverlayHTML(frame) {
    if (frame === "royal") {
      return `
        <!-- Royal Outer Golden Ring -->
        <div class="absolute -inset-1 rounded-full border-2 border-amber-400 animate-spin-slow drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] pointer-events-none"></div>
        <div class="absolute -inset-2 rounded-full border border-amber-400/30 animate-pulse pointer-events-none"></div>
        
        <!-- Top Crown with Gemstone -->
        <div class="absolute top-[-15px] left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-none flex flex-col items-center" style="animation-duration: 2.2s;">
          <i class="fa-solid fa-crown text-amber-300 text-sm drop-shadow-[0_0_10px_rgba(245,158,11,1)]"></i>
        </div>

        <!-- Left Glowing Feather Wing -->
        <div class="absolute left-[-16px] top-[calc(50%-10px)] z-20 pointer-events-none animate-flap-wings origin-right">
          <i class="fa-solid fa-feather text-amber-300 text-sm drop-shadow-[0_0_6px_rgba(245,158,11,0.9)] transform -rotate-[25deg]"></i>
        </div>

        <!-- Right Glowing Feather Wing -->
        <div class="absolute right-[-16px] top-[calc(50%-10px)] z-20 pointer-events-none animate-flap-wings origin-left" style="animation-delay: 0.3s;">
          <i class="fa-solid fa-feather text-amber-300 text-sm drop-shadow-[0_0_6px_rgba(245,158,11,0.9)] transform rotate-[25deg] scale-x-[-1]"></i>
        </div>
      `;
    } else if (frame === "neon") {
      return `
        <!-- Neon Pulsing Ring -->
        <div class="absolute -inset-1 rounded-full border-2 border-cyan-400 animate-pulse-glow drop-shadow-[0_0_10px_rgba(34,211,238,0.9)] pointer-events-none"></div>
        <div class="absolute -inset-2 rounded-full border border-dashed border-pink-500 animate-spin-slow opacity-90 pointer-events-none" style="animation-duration: 25s;"></div>
        
        <!-- Tech Nodes -->
        <div class="absolute top-[-12px] left-[8px] text-cyan-400 text-[9px] animate-pulse pointer-events-none"><i class="fa-solid fa-circle-nodes drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]"></i></div>
        <div class="absolute top-[-12px] right-[8px] text-pink-400 text-[9px] animate-pulse pointer-events-none" style="animation-delay: 0.4s;"><i class="fa-solid fa-circle-nodes drop-shadow-[0_0_4px_rgba(236,72,153,0.8)]"></i></div>
      `;
    } else if (frame === "ruby") {
      return `
        <!-- Inner Blazing Ring -->
        <div class="absolute -inset-1 rounded-full border border-rose-500 pointer-events-none animate-pulse-glow"></div>
        <!-- Outer Fire Particles Ring -->
        <div class="absolute -inset-2 rounded-full border-2 border-rose-600 animate-fire-burn pointer-events-none drop-shadow-[0_0_10px_rgba(225,29,72,0.95)]"></div>
        
        <!-- Top Flame Horns -->
        <div class="absolute top-[-14px] left-1/2 -translate-x-1/2 flex gap-1.5 text-rose-500 text-xs animate-bounce pointer-events-none" style="animation-duration: 1.8s;">
          <i class="fa-solid fa-fire drop-shadow-[0_0_6px_rgba(225,29,72,1)]"></i>
          <i class="fa-solid fa-fire drop-shadow-[0_0_6px_rgba(225,29,72,1)]"></i>
        </div>
      `;
    } else if (frame === "cosmic") {
      return `
        <!-- Cosmic Purple Ring -->
        <div class="absolute -inset-1 rounded-full border-2 border-purple-500 animate-pulse-glow drop-shadow-[0_0_10px_rgba(168,85,247,0.9)] pointer-events-none"></div>
        <div class="absolute -inset-2.5 rounded-full border border-dotted border-fuchsia-450 animate-spin-slow opacity-80 pointer-events-none" style="animation-duration: 8s;"></div>
        
        <!-- Stars -->
        <div class="absolute top-[-6px] left-[-6px] text-fuchsia-400 text-[9px] animate-drift-sparkle pointer-events-none"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
        <div class="absolute top-[-6px] right-[-6px] text-purple-400 text-[9px] animate-drift-sparkle pointer-events-none" style="animation-delay: 0.4s;"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
      `;
    } else if (frame === "phoenix") {
      return `
        <!-- Phoenix Blazing Sun Ring -->
        <div class="absolute -inset-1.5 rounded-full border-2 border-amber-500 animate-pulse-glow drop-shadow-[0_0_10px_rgba(245,158,11,0.9)] pointer-events-none"></div>
        
        <!-- Burning Top Crown -->
        <div class="absolute top-[-16px] left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-none flex flex-col items-center">
          <i class="fa-solid fa-fire-flame-simple text-amber-450 text-sm drop-shadow-[0_0_8px_rgba(245,158,11,1)]"></i>
        </div>
      `;
    } else if (frame === "dragon") {
      return `
        <!-- Jade Dragon Ring -->
        <div class="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-pulse-glow drop-shadow-[0_0_10px_rgba(16,185,129,0.9)] pointer-events-none"></div>

        <!-- Dragon Emblem Left -->
        <div class="absolute left-[-18px] top-[calc(50%-8px)] text-emerald-400 text-xs animate-bounce pointer-events-none">
          <i class="fa-solid fa-dragon drop-shadow-[0_0_8px_rgba(16,185,129,1)]"></i>
        </div>
        <!-- Dragon Emblem Right -->
        <div class="absolute right-[-18px] top-[calc(50%-8px)] text-emerald-400 text-xs animate-bounce pointer-events-none" style="animation-delay: 0.4s;">
          <i class="fa-solid fa-dragon drop-shadow-[0_0_8px_rgba(16,185,129,1)] scale-x-[-1]"></i>
        </div>
      `;
    } else if (frame === "love") {
      return `
        <!-- Sweet Pink Ring -->
        <div class="absolute -inset-1 rounded-full border border-pink-400 animate-pulse-glow drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] pointer-events-none"></div>
        
        <!-- Top Double Cupid Hearts -->
        <div class="absolute top-[-14px] left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-none flex gap-0.5 items-end">
          <i class="fa-solid fa-heart text-rose-500 text-xs drop-shadow-[0_0_6px_rgba(244,63,94,1)] animate-heart-beat"></i>
          <i class="fa-solid fa-heart text-pink-400 text-[8px] drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]"></i>
        </div>
      `;
    }
    
    // --- New Custom Premium Frames matching Image 1 ---
    else if (frame === "cool") {
      return `
        <!-- Cool Golden Crown Ring -->
        <div class="absolute -inset-1.5 rounded-full border-2 border-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] pointer-events-none animate-pulse-glow"></div>
        <div class="absolute -inset-2.5 rounded-full border border-yellow-500/15 pointer-events-none"></div>
        
        <!-- Top Sovereign Gold Crown with emoji decor -->
        <div class="absolute top-[-18px] left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-none flex flex-col items-center" style="animation-duration: 2.4s;">
          <i class="fa-solid fa-crown text-amber-300 text-sm drop-shadow-[0_0_10px_rgba(245,158,11,1)]"></i>
          <span class="text-[6px] text-amber-300 font-black -mt-1 font-sans animate-pulse">😎</span>
        </div>

        <!-- Feather decorations on sides -->
        <div class="absolute left-[-16px] top-[calc(50%-10px)] z-20 pointer-events-none animate-flap-wings origin-right text-yellow-400">
          <i class="fa-solid fa-feather text-sm drop-shadow-[0_0_6px_rgba(245,158,11,0.8)] transform -rotate-12"></i>
        </div>
        <div class="absolute right-[-16px] top-[calc(50%-10px)] z-20 pointer-events-none animate-flap-wings origin-left text-yellow-400" style="animation-delay: 0.3s;">
          <i class="fa-solid fa-feather text-sm drop-shadow-[0_0_6px_rgba(245,158,11,0.8)] transform rotate-12 scale-x-[-1]"></i>
        </div>

        <!-- Cute Star Emojis -->
        <div class="absolute top-[-4px] left-[2px] text-yellow-300 text-[6px] animate-ping"><i class="fa-solid fa-star"></i></div>
        <div class="absolute top-[-4px] right-[2px] text-white text-[6px] animate-ping" style="animation-delay: 0.5s;"><i class="fa-solid fa-star"></i></div>
      `;
    } else if (frame === "funny") {
      return `
        <!-- Green spring theme ring -->
        <div class="absolute -inset-1.5 rounded-full border-2 border-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] pointer-events-none animate-pulse-glow"></div>
        
        <!-- Funny laughing emojis -->
        <div class="absolute top-[-14px] left-1/2 -translate-x-1/2 z-20 text-xs animate-bounce pointer-events-none" style="animation-duration: 1.5s;">
          🤣
        </div>
        <div class="absolute left-[-14px] top-[calc(50%-8px)] text-xs pointer-events-none animate-pulse">
          😜
        </div>
        <div class="absolute right-[-14px] top-[calc(50%-8px)] text-xs pointer-events-none animate-pulse" style="animation-delay: 0.5s;">
          🤪
        </div>
        <div class="absolute bottom-[-10px] left-1/2 -translate-x-1/2 text-[9px] pointer-events-none font-black text-emerald-400 tracking-wider">
          FUNNY
        </div>
      `;
    } else if (frame === "new") {
      return `
        <!-- Orbital yellow glow ring -->
        <div class="absolute -inset-1 rounded-full border-2 border-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.85)] pointer-events-none"></div>
        
        <!-- Red banner 'NEW' at top-left -->
        <div class="absolute top-[-10px] left-[-12px] bg-red-600 text-[6px] px-1 py-0.5 rounded font-black text-white font-mono z-20 shadow-md border border-slate-900 rotate-[-12deg] tracking-widest animate-pulse">
          NEW
        </div>

        <!-- Stars and sparkles around the frame -->
        <div class="absolute bottom-[-5px] right-[10px] text-yellow-300 text-[8px] animate-ping"><i class="fa-solid fa-star"></i></div>
        <div class="absolute top-[8px] right-[-6px] text-white text-[6px] animate-ping" style="animation-delay: 0.8s;"><i class="fa-solid fa-star"></i></div>
      `;
    } else if (frame === "wolf") {
      return `
        <!-- Dark violet cyber energy ring -->
        <div class="absolute -inset-1.5 rounded-full border-2 border-purple-600 drop-shadow-[0_0_10px_rgba(168,85,247,0.95)] pointer-events-none animate-pulse-glow"></div>
        
        <!-- Alpha Wolf Crest head at the bottom -->
        <div class="absolute bottom-[-16px] left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce flex flex-col items-center" style="animation-duration: 2s;">
          <span class="text-base filter drop-shadow-[0_0_6px_rgba(168,85,247,1)]">🐺</span>
        </div>

        <!-- Cyber violet-blue glowing side wings -->
        <div class="absolute left-[-22px] top-[calc(50%-10px)] z-20 pointer-events-none text-indigo-400 animate-flap-wings origin-right">
          <i class="fa-solid fa-reply-all text-sm drop-shadow-[0_0_8px_rgba(99,102,241,1)] transform -rotate-[135deg]"></i>
        </div>
        <div class="absolute right-[-22px] top-[calc(50%-10px)] z-20 pointer-events-none text-indigo-400 animate-flap-wings origin-left" style="animation-delay: 0.3s;">
          <i class="fa-solid fa-reply-all text-sm drop-shadow-[0_0_8px_rgba(99,102,241,1)] transform rotate-[135deg] scale-y-[-1]"></i>
        </div>
      `;
    } else if (frame === "eagle") {
      return `
        <!-- Gold / Bronze crest ring -->
        <div class="absolute -inset-1.5 rounded-full border-2 border-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] pointer-events-none"></div>

        <!-- Flying Eagle Crest Emblem at the bottom -->
        <div class="absolute bottom-[-16px] left-1/2 -translate-x-1/2 z-20 pointer-events-none text-base animate-pulse">
          🦅
        </div>

        <!-- Majestic gold metal side wing arrays -->
        <div class="absolute left-[-22px] top-[calc(50%-10px)] z-20 pointer-events-none text-amber-400 animate-flap-wings origin-right">
          <i class="fa-solid fa-angles-left text-sm drop-shadow-[0_0_6px_rgba(245,158,11,1)]"></i>
        </div>
        <div class="absolute right-[-22px] top-[calc(50%-10px)] z-20 pointer-events-none text-amber-400 animate-flap-wings origin-left" style="animation-delay: 0.3s;">
          <i class="fa-solid fa-angles-right text-sm drop-shadow-[0_0_6px_rgba(245,158,11,1)]"></i>
        </div>
      `;
    } else if (frame === "lion") {
      return `
        <!-- Icy Blue Crystal Ring -->
        <div class="absolute -inset-1.5 rounded-full border-2 border-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.95)] pointer-events-none animate-pulse-glow"></div>

        <!-- Ice Lion Head at the bottom -->
        <div class="absolute bottom-[-14px] left-1/2 -translate-x-1/2 z-20 pointer-events-none text-base animate-pulse">
          🦁
        </div>

        <!-- Ice shard sparkles -->
        <div class="absolute top-[-6px] left-[-6px] text-cyan-200 text-[8px] animate-drift-sparkle"><i class="fa-solid fa-gem"></i></div>
        <div class="absolute top-[-6px] right-[-6px] text-white text-[8px] animate-drift-sparkle" style="animation-delay: 0.4s;"><i class="fa-solid fa-gem"></i></div>
      `;
    }

    // --- New Custom Premium Frames matching Image 2 ---
    else if (frame === "bear_hat") {
      return `
        <!-- Cozy Brown Ring -->
        <div class="absolute -inset-1 rounded-full border border-amber-800/60 pointer-events-none"></div>
        
        <!-- Adorable Fluffy Bear Hat overlay sitting on top -->
        <div class="absolute top-[-18px] left-1/2 -translate-x-1/2 z-20 text-lg pointer-events-none animate-bounce" style="animation-duration: 2.8s;">
          🐻
        </div>
        
        <!-- Soft teddy bear paws at bottom -->
        <div class="absolute bottom-[-10px] left-[15px] text-[10px] pointer-events-none">🐾</div>
        <div class="absolute bottom-[-10px] right-[15px] text-[10px] pointer-events-none">🐾</div>
      `;
    } else if (frame === "strawberry") {
      return `
        <!-- Pink Blossom Ring -->
        <div class="absolute -inset-1 rounded-full border border-pink-400 pointer-events-none animate-pulse-glow"></div>

        <!-- Cute red strawberries dangling around -->
        <div class="absolute top-[-14px] left-1/2 -translate-x-1/2 text-xs pointer-events-none animate-bounce">🍓</div>
        <div class="absolute left-[-12px] bottom-[5px] text-xs pointer-events-none">🍓</div>
        <div class="absolute right-[-12px] bottom-[5px] text-xs pointer-events-none">🍓</div>
      `;
    } else if (frame === "popcorn") {
      return `
        <!-- Light Cream / Pastel Pink Ring -->
        <div class="absolute -inset-1 rounded-full border border-yellow-200/50 pointer-events-none"></div>

        <!-- Movie popcorn box at bottom -->
        <div class="absolute bottom-[-14px] left-1/2 -translate-x-1/2 z-20 pointer-events-none text-base animate-bounce">
          🍿
        </div>

        <!-- Floating golden kernels -->
        <div class="absolute top-[-8px] left-[5px] text-[6px] text-yellow-300 animate-ping">🍿</div>
        <div class="absolute top-[-4px] right-[2px] text-[5px] text-white animate-pulse">✨</div>
      `;
    } else if (frame === "ramadan_kareem") {
      return `
        <!-- Sacred emerald ring -->
        <div class="absolute -inset-1.5 rounded-full border-2 border-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] pointer-events-none"></div>
        
        <!-- Gold Islamic Crescent at top -->
        <div class="absolute top-[-16px] left-1/2 -translate-x-1/2 text-xs text-yellow-400 z-20 animate-bounce" style="animation-duration: 2s;">
          🌙
        </div>

        <!-- Hanging lanterns on the sides -->
        <div class="absolute left-[-14px] top-[14px] text-[9px] pointer-events-none animate-pulse text-yellow-500">🏮</div>
        <div class="absolute right-[-14px] top-[14px] text-[9px] pointer-events-none animate-pulse text-yellow-500" style="animation-delay: 0.5s;">🏮</div>
      `;
    } else if (frame === "islamic_crescent") {
      return `
        <!-- Golden Celestial Moon Ring -->
        <div class="absolute -inset-1.5 rounded-full border-2 border-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] pointer-events-none animate-pulse-glow"></div>
        
        <!-- Large Golden Crescent Moon on the top-right -->
        <div class="absolute top-[-15px] right-[-12px] text-sm pointer-events-none animate-bounce" style="animation-duration: 2.2s;">
          🌙
        </div>

        <!-- Hanging Lantern on bottom-left -->
        <div class="absolute bottom-[-10px] left-[-8px] text-xs pointer-events-none animate-pulse">
          🏮
        </div>
      `;
    } else if (frame === "eid_mosque") {
      return `
        <!-- Starry Emerald Ring -->
        <div class="absolute -inset-1.5 rounded-full border-2 border-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.95)] pointer-events-none"></div>

        <!-- Golden Mosque dome silhouette at bottom -->
        <div class="absolute bottom-[-14px] left-1/2 -translate-x-1/2 z-20 text-base pointer-events-none filter drop-shadow-[0_0_4px_rgba(234,179,8,0.8)]">
          🕌
        </div>

        <!-- Starry sparkles -->
        <div class="absolute top-[-6px] left-[-6px] text-yellow-300 text-[8px] animate-drift-sparkle"><i class="fa-solid fa-star"></i></div>
        <div class="absolute top-[-6px] right-[-6px] text-white text-[8px] animate-drift-sparkle" style="animation-delay: 0.5s;"><i class="fa-solid fa-star"></i></div>
      `;
    }

    return ``;
  }
}
