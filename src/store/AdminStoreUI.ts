export class AdminStoreUI {
  static getStoreTabShellHTML(subTab: string = "dashboard") {
    let content = "";
    
    if (subTab === "dashboard") {
      content = this.getDashboardGridHTML();
    } else if (subTab === "product") {
      content = this.getProductManagementHTML();
    } else if (subTab === "payment") {
      content = this.getPaymentManagementHTML();
    } else if (subTab === "category") {
      content = this.getCategoryManagementHTML();
    } else if (subTab === "ticket") {
      content = this.getTicketManagementHTML();
    } else if (subTab === "configuration") {
      content = this.getConfigurationHTML();
    } else if (subTab === "setting") {
      content = this.getSettingHTML();
    } else if (subTab === "plugin") {
      content = this.getPluginInstallHTML();
    } else if (subTab === "admin") {
      content = this.getAdminManagementHTML();
    } else if (subTab === "admin-option") {
      content = this.getAdminOptionHTML();
    }

    return `
      <div class="space-y-4 sm:space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 class="text-lg sm:text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <i class="fa-solid fa-store text-cyan-400"></i> Shop Admin Control
            </h2>
            <p class="text-[10px] text-slate-500 font-mono mt-1">
              ${subTab === "dashboard" ? "Main overview and module selection." : `Module: <span class="text-cyan-500 uppercase">${subTab}</span> Control Page`}
            </p>
          </div>
          ${subTab !== "dashboard" ? `
            <button id="admin-store-back-btn" class="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer">
              <i class="fa-solid fa-arrow-left"></i> Back to Grid
            </button>
          ` : ""}
        </div>
        <div id="admin-store-subtab-container">
          ${content}
        </div>
      </div>
    `;
  }

  static getDashboardGridHTML() {
    const items = [
      { id: "product", label: "Product", icon: "fa-box", color: "text-emerald-400", desc: "Manage catalog assets" },
      { id: "payment", label: "Payment", icon: "fa-credit-card", color: "text-blue-400", desc: "Logs & Gateways" },
      { id: "category", label: "Category", icon: "fa-tags", color: "text-amber-400", desc: "Organize collections" },
      { id: "ticket", label: "Ticket", icon: "fa-headset", color: "text-indigo-400", desc: "Customer helpdesk" },
      { id: "configuration", label: "Configuration", icon: "fa-sliders", color: "text-rose-400", desc: "Core parameters" },
      { id: "setting", label: "Setting", icon: "fa-gear", color: "text-slate-400", desc: "Shop appearance" },
      { id: "plugin", label: "Plugin Install", icon: "fa-plug", color: "text-purple-400", desc: "Extended features" },
      { id: "admin", label: "Admin", icon: "fa-user-shield", color: "text-cyan-400", desc: "Manage shop admins" },
      { id: "admin-option", label: "Admin Option", icon: "fa-list-check", color: "text-teal-400", desc: "Advanced controls" }
    ];

    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        ${items.map(item => `
          <button class="store-grid-item bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] hover:border-cyan-500/50 hover:bg-slate-850 transition-all duration-300 group text-left relative overflow-hidden" data-subtab="${item.id}">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition duration-500"></div>
            <div class="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center mb-4 border border-slate-800 group-hover:border-cyan-500/30 transition shadow-inner">
              <i class="fa-solid ${item.icon} text-xl ${item.color}"></i>
            </div>
            <h3 class="text-lg font-black text-white uppercase tracking-tight">${item.label}</h3>
            <p class="text-xs text-slate-500 font-medium mt-1">${item.desc}</p>
          </button>
        `).join("")}
      </div>
    `;
  }

  static getProductManagementHTML() {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl space-y-5">
            <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <i class="fa-solid fa-plus-circle text-emerald-400"></i> Index WooCommerce Product
            </h3>
            <form id="admin-add-product-form" class="space-y-3.5 text-[10px]">
              <div class="space-y-1">
                <label class="text-slate-500 uppercase font-bold px-1">Product ID</label>
                <input id="admin-prod-id" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none font-mono" placeholder="prod-tshirt-01" required />
              </div>
              <div class="space-y-1">
                <label class="text-slate-500 uppercase font-bold px-1">Product Title (e.g. Premium Cotton T-Shirt)</label>
                <input id="admin-prod-title" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" placeholder="e.g. LuckyBox Summer Shirt" required />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-slate-500 uppercase font-bold px-1">Product Type</label>
                  <select id="admin-prod-type" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none cursor-pointer font-bold">
                    <option value="digital">Digital Download</option>
                    <option value="physical" selected>Physical / T-Shirt / Apparel</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-slate-500 uppercase font-bold px-1">Payment Mode</label>
                  <select id="admin-prod-payment-mode" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 focus:border-cyan-500 outline-none cursor-pointer font-bold">
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="advance">Advance Payment (Online)</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-slate-500 uppercase font-bold px-1">Category</label>
                  <select id="admin-prod-category" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none cursor-pointer">
                    <option value="apparel">Apparel & T-Shirts</option>
                    <option value="web-templates">Web Templates</option>
                    <option value="sheets-trackers">Excel Sheets</option>
                    <option value="design-assets">Design Assets</option>
                    <option value="ebooks-guides">Ebooks</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-slate-500 uppercase font-bold px-1">Price (৳)</label>
                  <input id="admin-prod-price" type="number" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none font-mono" placeholder="499" required />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-slate-500 uppercase font-bold px-1">Sizes (comma separated)</label>
                  <input id="admin-prod-sizes" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none font-mono" placeholder="S, M, L, XL, XXL" />
                </div>
                <div class="space-y-1">
                  <label class="text-slate-500 uppercase font-bold px-1">Colors</label>
                  <input id="admin-prod-colors" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" placeholder="Black, Navy, White" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-slate-500 uppercase font-bold px-1">Image URL / Download Path</label>
                <input id="admin-prod-filepath" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none font-mono" placeholder="logo.jpg or t shirt image url" required />
              </div>
              <div class="space-y-1">
                <label class="text-slate-500 uppercase font-bold px-1">Product Description</label>
                <textarea id="admin-prod-desc" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 outline-none" placeholder="100% cotton premium T-shirt..."></textarea>
              </div>
              <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black py-3.5 rounded-2xl uppercase tracking-widest shadow-lg transition active:scale-95 cursor-pointer mt-2">
                Deploy Product to Store
              </button>
            </form>
          </div>
        </div>
        <div class="lg:col-span-8">
          <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl h-full">
            <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
              <i class="fa-solid fa-list-check text-cyan-400"></i> Active Inventory Catalog
            </h3>
            <div id="admin-store-catalog-list" class="space-y-2.5 max-h-[720px] overflow-y-auto pr-1 scrollbar-thin">
               <div class="text-[10px] text-slate-500 text-center py-20 font-mono italic">Scanning product index...</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static getPaymentManagementHTML() {
    return `
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
            <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Total Volume</span>
            <div id="admin-payment-total-vol" class="text-2xl font-black text-white tabular-nums">৳0.00</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
            <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Successful Logs</span>
            <div id="admin-payment-success-count" class="text-2xl font-black text-emerald-400">0</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
            <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Failed Attempts</span>
            <div id="admin-payment-fail-count" class="text-2xl font-black text-rose-500">0</div>
          </div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
          <div class="p-5 border-b border-slate-800 bg-slate-950/30 flex justify-between items-center">
            <h3 class="text-xs font-black text-white uppercase tracking-widest">Payment Transaction Ledger</h3>
            <button class="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition">Export CSV</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-[11px]">
              <thead>
                <tr class="text-slate-500 border-b border-slate-800 bg-slate-900/50 uppercase font-bold">
                  <th class="p-4">Transaction ID</th>
                  <th class="p-4">User</th>
                  <th class="p-4">Gateway</th>
                  <th class="p-4">Amount</th>
                  <th class="p-4">Status</th>
                  <th class="p-4">Date</th>
                </tr>
              </thead>
              <tbody id="admin-payment-ledger-body">
                <tr><td colspan="6" class="p-10 text-center text-slate-600 italic">No transaction records found.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  static getCategoryManagementHTML() {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-5">
           <h3 class="text-xs font-black text-white uppercase tracking-widest">Add Shop Category</h3>
           <div class="space-y-4">
              <div>
                <label class="text-[10px] text-slate-500 uppercase font-bold px-1">Category Label</label>
                <input id="admin-cat-label" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" placeholder="e.g. Premium Scripts" />
              </div>
              <div>
                <label class="text-[10px] text-slate-500 uppercase font-bold px-1">Internal Slug</label>
                <input id="admin-cat-slug" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none font-mono" placeholder="premium-scripts" />
              </div>
              <button id="admin-add-cat-btn" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-2xl uppercase transition tracking-widest">Create Category</button>
           </div>
        </div>
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-4">
           <h3 class="text-xs font-black text-white uppercase tracking-widest">Category Registry</h3>
           <div id="admin-cat-list" class="space-y-2">
              <!-- Categories will be rendered here -->
           </div>
        </div>
      </div>
    `;
  }

  static getTicketManagementHTML() {
    return `
      <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl space-y-5">
        <div class="flex justify-between items-center border-b border-slate-800 pb-4">
          <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <i class="fa-solid fa-headset text-indigo-400"></i> Digital Store Helpdesk Queue
          </h3>
          <span class="bg-indigo-950 text-indigo-400 text-[8px] font-bold px-2 py-0.5 rounded border border-indigo-900/40 uppercase tracking-widest">Global Queue</span>
        </div>
        <div id="admin-store-tickets-list" class="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            <div class="text-[10px] text-slate-500 text-center py-20 font-mono italic">Scanning for active help requests...</div>
        </div>
      </div>
    `;
  }

  static getConfigurationHTML() {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-6">
          <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <i class="fa-solid fa-database text-rose-500"></i> Database Node Configuration
          </h3>
          <div class="space-y-4 text-[11px]">
             <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/50 space-y-3">
                <div class="flex justify-between border-b border-slate-800 pb-2">
                   <span class="text-slate-500 font-bold uppercase tracking-tighter">User</span>
                   <span class="text-white font-black">veloralb_Digital</span>
                </div>
                <div class="flex justify-between border-b border-slate-800 pb-2">
                   <span class="text-slate-500 font-bold uppercase tracking-tighter">Host</span>
                   <span class="text-white font-black">localhost</span>
                </div>
                <div class="flex justify-between border-b border-slate-800 pb-2">
                   <span class="text-slate-500 font-bold uppercase tracking-tighter">Database</span>
                   <span class="text-white font-black">veloralb_Digital</span>
                </div>
                <div class="space-y-1">
                   <label class="text-slate-500 uppercase font-bold">Node Password</label>
                   <input type="password" id="admin-db-pass" value="UcWg.75@wv+Ijzh#" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono outline-none" />
                </div>
             </div>
             <div class="space-y-2">
                <label class="text-slate-500 uppercase font-bold">Sync Strategy</label>
                <div class="grid grid-cols-1 gap-2">
                   <label class="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800/50 cursor-pointer hover:bg-slate-900 transition">
                      <input type="radio" name="db-sync-mode" value="dual" checked />
                      <span class="text-slate-300 font-bold">Bidirectional Real-time Mirror</span>
                   </label>
                   <label class="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800/50 cursor-pointer hover:bg-slate-900 transition">
                      <input type="radio" name="db-sync-mode" value="f2s" />
                      <span class="text-slate-300 font-bold">Source of Truth: Firebase</span>
                   </label>
                </div>
             </div>
             <button id="admin-save-db-config" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-2xl uppercase tracking-widest transition">Save Config</button>
          </div>
        </div>
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-6">
          <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <i class="fa-solid fa-cloud-arrow-up text-cyan-400"></i> Manual Sync Engine
          </h3>
          <div class="p-10 border border-dashed border-slate-800 rounded-[2rem] text-center space-y-4">
             <div class="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto">
                <i class="fa-solid fa-rotate text-cyan-400 text-2xl"></i>
             </div>
             <div>
                <h4 class="text-white font-black uppercase">Instant Handshake</h4>
                <p class="text-[10px] text-slate-500 mt-1">Force push/pull between Firebase Cloud and Local SQL node.</p>
             </div>
             <button id="admin-sync-now-btn" class="bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 px-8 rounded-2xl uppercase tracking-widest transition shadow-lg shadow-cyan-950/20">Trigger Sync Now</button>
          </div>
        </div>
      </div>
    `;
  }

  static getSettingHTML() {
    return `
      <div class="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] max-w-2xl mx-auto space-y-6">
        <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <i class="fa-solid fa-desktop text-cyan-400"></i> Storefront Branding & Limits
        </h3>
        <div class="space-y-4 text-[11px]">
           <div class="space-y-1">
              <label class="text-slate-500 uppercase font-bold">Shop Public Name</label>
              <input type="text" id="admin-shop-name" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none font-bold" placeholder="LuckyBox Shop" />
           </div>
           <div class="space-y-1">
              <label class="text-slate-500 uppercase font-bold">Tagline / Mission</label>
              <textarea id="admin-shop-tagline" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" placeholder="Premium assets..."></textarea>
           </div>
           <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                 <label class="text-slate-500 uppercase font-bold">Min Order (৳)</label>
                 <input type="number" id="admin-shop-min-order" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none font-mono" />
              </div>
              <div class="space-y-1">
                 <label class="text-slate-500 uppercase font-bold">Max Order (৳)</label>
                 <input type="number" id="admin-shop-max-order" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none font-mono" />
              </div>
           </div>
           <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/50 flex items-center justify-between">
              <div>
                 <span class="text-white font-bold block">Shop Master Enable / Disable</span>
                 <span class="text-[9px] text-slate-500 uppercase">Enable or disable shop across lottery app</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" id="admin-shop-enabled-toggle" class="sr-only peer">
                 <div class="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-cyan-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
           </div>
           <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/50 flex items-center justify-between">
              <div>
                 <span class="text-white font-bold block">Maintenance Mode</span>
                 <span class="text-[9px] text-slate-500 uppercase">Block all new purchases</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" id="admin-shop-status-toggle" class="sr-only peer">
                 <div class="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-cyan-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
           </div>
           <button id="admin-save-shop-settings" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg transition active:scale-95">Save Changes</button>
        </div>
      </div>
    `;
  }

  static getPluginInstallHTML() {
    return `
      <div class="space-y-4 sm:space-y-6">
        <!-- Top Banner / WordPress Style Installer Header -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                  <i class="fa-brands fa-wordpress"></i> WordPress Engine
                </span>
                <span class="text-[9px] text-slate-500 font-mono">ZIP Auto-Extractor v2.4</span>
              </div>
              <h2 class="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-puzzle-piece text-cyan-400"></i> Plugin Manager & ZIP Installer
              </h2>
              <p class="text-[11px] text-slate-400 mt-1 max-w-xl">
                Upload any WordPress plugin, WooCommerce payment gateway, or LuckyBox extension archive (<code class="text-cyan-300 font-mono">.zip</code>). The system automatically decompresses, reads WordPress metadata, and configures database tables.
              </p>
            </div>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button id="admin-trigger-upload-view-btn" class="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-black py-2.5 px-5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Plugin
              </button>
            </div>
          </div>
        </div>

        <!-- Upload & Extraction Card / Dropzone Section -->
        <div id="plugin-upload-card" class="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] space-y-4">
           <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
             <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
               <i class="fa-solid fa-file-zipper text-cyan-400"></i> Upload Plugin ZIP Archive
             </h3>
             <span class="text-[10px] text-slate-500 font-mono">Accepts: .zip (Max 50MB)</span>
           </div>

           <!-- Drag and Drop Dropzone -->
           <div id="plugin-dropzone" class="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-2xl p-5 sm:p-8 text-center bg-slate-950/70 hover:bg-cyan-950/10 transition-all cursor-pointer group relative">
             <input id="plugin-file-upload" type="file" accept=".zip" class="hidden" />
             
             <div class="flex flex-col items-center justify-center space-y-3">
               <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl sm:text-2xl group-hover:scale-110 transition-transform shadow-inner">
                 <i class="fa-solid fa-cloud-arrow-up"></i>
               </div>
               <div>
                 <p class="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition">
                   Click to browse or drag & drop plugin <span class="text-cyan-400 font-mono">.ZIP</span>
                 </p>
                 <p class="text-[10px] text-slate-500 mt-1">
                   Supports standard WordPress plugins, bKash/Nagad gateways, Telegram bots & custom modules
                 </p>
               </div>
               <div id="plugin-selected-file-info" class="hidden items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-300 font-mono max-w-full truncate">
                 <i class="fa-solid fa-file-zipper text-cyan-400"></i>
                 <span id="plugin-selected-filename" class="truncate">selected-file.zip</span>
                 <span id="plugin-selected-filesize" class="text-slate-400 text-[10px] flex-shrink-0">(0 KB)</span>
               </div>
             </div>
           </div>

           <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
             <div class="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
               <span><i class="fa-solid fa-check text-emerald-400 mr-1"></i> Auto-Extraction</span>
               <span><i class="fa-solid fa-check text-emerald-400 mr-1"></i> Manifest Reading</span>
               <span><i class="fa-solid fa-check text-emerald-400 mr-1"></i> Safe Isolated Delete</span>
             </div>
             <div class="flex gap-2 w-full sm:w-auto justify-end">
               <button id="admin-reset-file-btn" class="hidden bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer">
                 Clear
               </button>
               <button id="admin-upload-plugin-btn" class="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-900/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95" disabled>
                 <i class="fa-solid fa-bolt"></i> Upload & Auto-Extract
               </button>
             </div>
           </div>
        </div>

        <!-- UPLOAD & EXTRACTION ANIMATION CONTAINER (Shown during processing) -->
        <div id="plugin-upload-progress-container" class="hidden bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/45 p-5 sm:p-7 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <!-- Glowing ambient background -->
           <div class="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
           <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

           <div class="relative space-y-5">
             <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                   <div class="relative flex items-center justify-center flex-shrink-0">
                      <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xl animate-pulse">
                         <i id="plugin-progress-icon" class="fa-solid fa-box-open"></i>
                      </div>
                      <span class="absolute -top-1 -right-1 flex h-3 w-3">
                         <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                         <span class="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                      </span>
                   </div>
                   <div class="min-w-0">
                      <h4 id="plugin-progress-title" class="text-white font-black text-xs sm:text-sm uppercase tracking-wide truncate">
                        Extracting Plugin Archive...
                      </h4>
                      <p id="plugin-progress-filename" class="text-[11px] text-cyan-300 font-mono mt-0.5 truncate">
                        plugin-archive.zip
                      </p>
                   </div>
                </div>

                <div class="text-left sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                   <div id="plugin-progress-percent" class="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                      0%
                   </div>
                   <span class="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Progress</span>
                </div>
             </div>

             <!-- Animated Progress Bar -->
             <div class="space-y-2">
                <div class="w-full bg-slate-950/80 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden shadow-inner">
                   <div id="plugin-progress-bar" class="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-300 relative shadow-lg shadow-cyan-500/50" style="width: 0%">
                      <div class="absolute inset-0 bg-white/20 animate-[pulse_1s_infinite]"></div>
                   </div>
                </div>
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px] text-slate-400 font-mono gap-1">
                   <span id="plugin-progress-status-text" class="truncate">Initializing extraction engine...</span>
                   <span id="plugin-progress-subdetail" class="text-slate-500 flex-shrink-0">Standby...</span>
                </div>
             </div>

             <!-- Step by step visual badges -->
             <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div id="plugin-step-1" class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-slate-400 transition-colors">
                   <i class="fa-solid fa-spinner fa-spin text-cyan-400 flex-shrink-0"></i>
                   <span class="truncate">1. Read ZIP</span>
                </div>
                <div id="plugin-step-2" class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-slate-500 transition-colors">
                   <i class="fa-regular fa-circle flex-shrink-0"></i>
                   <span class="truncate">2. WP Headers</span>
                </div>
                <div id="plugin-step-3" class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-slate-500 transition-colors">
                   <i class="fa-regular fa-circle flex-shrink-0"></i>
                   <span class="truncate">3. Extract Files</span>
                </div>
                <div id="plugin-step-4" class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-slate-500 transition-colors">
                   <i class="fa-regular fa-circle flex-shrink-0"></i>
                   <span class="truncate">4. Activate</span>
                </div>
             </div>

             <!-- Success or Error state banner -->
             <div id="plugin-upload-result-box" class="hidden p-4 rounded-2xl text-xs font-medium"></div>
           </div>
        </div>

        <!-- Installed Plugins Section -->
        <div class="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] space-y-5">
           <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xs font-black text-white uppercase tracking-widest">Installed Plugins</h3>
                  <span id="admin-plugin-count-badge" class="bg-slate-800 text-cyan-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-slate-700">0</span>
                </div>
                <p class="text-[10px] text-slate-500 mt-0.5">Manage, update, activate or cleanly delete plugins without touching any other site data.</p>
              </div>

              <!-- Filter tabs -->
              <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto w-full sm:w-auto">
                 <button class="plugin-filter-btn flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition bg-cyan-600 text-white whitespace-nowrap" data-filter="all">All</button>
                 <button class="plugin-filter-btn flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition text-slate-400 hover:text-white whitespace-nowrap" data-filter="active">Active</button>
                 <button class="plugin-filter-btn flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition text-slate-400 hover:text-white whitespace-nowrap" data-filter="inactive">Inactive</button>
              </div>
           </div>

           <!-- Search bar -->
           <div class="relative">
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-500 text-xs"></i>
              <input id="admin-plugin-search" type="text" placeholder="Search installed plugins by name, author, or keyword..." class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500/50" />
           </div>

           <!-- Plugin List Cards Container -->
           <div id="admin-plugin-list" class="space-y-3">
              <div class="p-12 text-center text-slate-600 italic text-[11px] flex flex-col items-center gap-2">
                 <i class="fa-solid fa-spinner fa-spin text-cyan-400 text-xl"></i>
                 <span>Loading installed plugins...</span>
              </div>
           </div>
        </div>

        <!-- Hidden input for updating an existing plugin with a new ZIP -->
        <input id="plugin-update-file-input" type="file" accept=".zip" class="hidden" />

        <!-- Plugin Details / Extracted Files Modal -->
        <div id="plugin-details-modal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
           <div class="bg-slate-900 border border-slate-800 rounded-[1.5rem] sm:rounded-[2rem] max-w-lg w-[95vw] sm:w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                 <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg flex-shrink-0">
                       <i class="fa-solid fa-box-archive"></i>
                    </div>
                    <div class="min-w-0">
                       <h3 id="plugin-modal-title" class="text-xs sm:text-sm font-black text-white uppercase truncate">Plugin Details</h3>
                       <span id="plugin-modal-version" class="text-[10px] text-cyan-400 font-mono font-bold">v1.0.0</span>
                    </div>
                 </div>
                 <button id="plugin-modal-close-btn" class="text-slate-500 hover:text-white p-2 rounded-lg cursor-pointer flex-shrink-0">
                    <i class="fa-solid fa-xmark text-sm"></i>
                 </button>
              </div>

              <div id="plugin-modal-body" class="space-y-4 overflow-y-auto pr-1 flex-grow scrollbar-thin text-xs text-slate-300">
                 <!-- Populated dynamically -->
              </div>

              <div class="border-t border-slate-800 pt-3 flex justify-end">
                 <button id="plugin-modal-ok-btn" class="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-5 rounded-xl text-xs uppercase cursor-pointer">
                   Close
                 </button>
              </div>
           </div>
        </div>
      </div>
    `;
  }

  static getPluginCardHTML(p: any) {
    const isActive = p.status === "active";
    const statusBg = isActive ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-400";
    const statusDot = isActive ? "bg-emerald-400 shadow-emerald-400/50 shadow-sm" : "bg-slate-500";
    const iconClass = p.icon || "fa-solid fa-puzzle-piece";

    return `
      <div class="p-4 bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-2xl transition-all duration-200 group relative ${isActive ? 'ring-1 ring-emerald-500/10' : ''}">
         <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            <!-- Left Info -->
            <div class="flex items-start gap-3.5 flex-grow min-w-0">
               <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 text-lg sm:text-xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  <i class="${iconClass}"></i>
               </div>
               
               <div class="space-y-1 min-w-0 flex-grow">
                  <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                     <h4 class="text-white font-black text-xs sm:text-sm tracking-wide truncate max-w-[200px] sm:max-w-xs">${p.name}</h4>
                     <span class="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-400 font-mono font-bold text-[10px]">v${p.version || "1.0.0"}</span>
                     <span class="px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusBg}">
                        <span class="w-1.5 h-1.5 rounded-full ${statusDot}"></span>
                        ${p.status || "active"}
                     </span>
                     ${p.sourceType === "uploaded_zip" ? `<span class="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 text-[8px] font-mono uppercase font-bold"><i class="fa-solid fa-file-zipper"></i> ZIP Upload</span>` : ''}
                  </div>

                  <p class="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                     ${p.description || "No description provided."}
                  </p>

                  <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] text-slate-500 font-mono pt-1">
                     <span>By <strong class="text-slate-300">${p.author || "WordPress Contributor"}</strong></span>
                     <span>•</span>
                     <span><i class="fa-solid fa-file-lines text-slate-600 mr-1"></i>${p.filesCount || (p.fileList ? p.fileList.length : 1)} files</span>
                     ${p.sizeFormatted ? `<span>•</span><span><i class="fa-solid fa-hard-drive text-slate-600 mr-1"></i>${p.sizeFormatted}</span>` : ''}
                     ${p.updatedAt ? `<span>•</span><span class="text-cyan-500/80">Updated ${new Date(p.updatedAt).toLocaleDateString()}</span>` : ''}
                  </div>
               </div>
            </div>

            <!-- Right Action Controls (WordPress Style) -->
            <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start xl:self-center flex-shrink-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-900 w-full xl:w-auto justify-start xl:justify-end">
               
               <!-- Activate / Deactivate Toggle -->
               <button class="toggle-plugin-status-btn flex-1 sm:flex-none px-3 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${isActive ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40'}" data-id="${p.id}" title="${isActive ? 'Deactivate plugin' : 'Activate plugin'}">
                  <i class="fa-solid ${isActive ? 'fa-pause' : 'fa-play'}"></i>
                  <span>${isActive ? 'Deactivate' : 'Activate'}</span>
               </button>

               <!-- Update Plugin ZIP Button -->
               <button class="update-plugin-btn flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95" data-id="${p.id}" title="Upload new ZIP to update this plugin">
                  <i class="fa-solid fa-cloud-arrow-up text-cyan-400"></i>
                  <span>Update</span>
               </button>

               <!-- Details / Files Modal Button -->
               <button class="view-plugin-files-btn p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 text-xs transition cursor-pointer active:scale-95 flex items-center justify-center" data-id="${p.id}" title="View extracted files">
                  <i class="fa-solid fa-folder-tree"></i>
               </button>

               <!-- Delete Button (Clean isolated delete) -->
               <button class="remove-plugin-btn p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 text-xs transition cursor-pointer active:scale-95 flex items-center justify-center" data-id="${p.id}" data-name="${p.name}" title="Delete plugin only">
                  <i class="fa-solid fa-trash-can"></i>
               </button>
            </div>

         </div>
      </div>
    `;
  }

  static getAdminManagementHTML() {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-5 h-fit">
           <h3 class="text-xs font-black text-white uppercase tracking-widest">Assign Shop Admin</h3>
           <div class="space-y-4">
              <div>
                <label class="text-[10px] text-slate-500 uppercase font-bold px-1">User ID / Username</label>
                <input id="admin-shop-user-id" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" placeholder="@username" />
              </div>
              <div>
                <label class="text-[10px] text-slate-500 uppercase font-bold px-1">Permissions Level</label>
                <select id="admin-shop-perm-level" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none cursor-pointer">
                  <option value="shop_staff">Shop Staff (Support Only)</option>
                  <option value="shop_manager" selected>Shop Manager (Catalog + Support)</option>
                  <option value="shop_owner">Shop Owner (Full Access)</option>
                </select>
              </div>
              <button id="admin-add-shop-admin-btn" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-2xl uppercase tracking-widest transition">Add To Staff</button>
           </div>
        </div>
        <div class="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-4">
           <h3 class="text-xs font-black text-white uppercase tracking-widest">Active Staff Members</h3>
           <div id="admin-shop-staff-list" class="space-y-2">
              <div class="p-8 text-center text-slate-600 italic text-[10px]">Loading staff registry...</div>
           </div>
        </div>
      </div>
    `;
  }

  static getAdminOptionHTML() {
    return `
      <div class="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h4 class="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
              <i class="fa-solid fa-trash-can text-rose-500"></i> Data Cleanup
            </h4>
            <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <p class="text-[10px] text-slate-500 italic">Caution: Destructive actions ahead.</p>
              <button id="admin-clear-logs" class="w-full py-2.5 rounded-xl bg-rose-950/20 text-rose-500 border border-rose-900/40 font-bold text-[10px] uppercase transition hover:bg-rose-900 hover:text-white">Clear Payment Logs</button>
              <button id="admin-clear-tickets" class="w-full py-2.5 rounded-xl bg-amber-950/20 text-amber-500 border border-amber-900/40 font-bold text-[10px] uppercase transition hover:bg-amber-900 hover:text-white">Purge Resolved Tickets</button>
            </div>
          </div>
          <div class="space-y-4">
            <h4 class="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
              <i class="fa-solid fa-vial text-teal-400"></i> System Diagnostics
            </h4>
            <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <button id="admin-test-sql" class="w-full py-2.5 rounded-xl bg-teal-950/20 text-teal-400 border border-teal-900/40 font-bold text-[10px] uppercase transition hover:bg-teal-900 hover:text-white">Test SQL Connection</button>
              <button id="admin-rebuild-index" class="w-full py-2.5 rounded-xl bg-cyan-950/20 text-cyan-400 border border-cyan-900/40 font-bold text-[10px] uppercase transition hover:bg-cyan-900 hover:text-white">Rebuild Search Index</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static getProductItemHTML(p: any) {
    const isCod = p.paymentMode === "cod";
    const paymentBadge = isCod 
      ? `<span class="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase text-[8px]">COD</span>` 
      : `<span class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[8px]">Advance Payment</span>`;
    
    const typeBadge = p.productType === "physical" 
      ? `<span class="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase text-[8px]"><i class="fa-solid fa-shirt"></i> Apparel/Physical</span>`
      : `<span class="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase text-[8px]"><i class="fa-solid fa-download"></i> Digital</span>`;

    return `
      <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between group hover:border-cyan-500/30 transition">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
            <img src="${p.image || p.filePath || 'logo.jpg'}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="text-white font-bold text-[11px]">${p.title}</h4>
              ${typeBadge}
              ${paymentBadge}
            </div>
            <div class="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
              <span class="text-cyan-400 font-bold font-mono text-xs">৳${p.price}</span>
              <span>·</span>
              <span class="uppercase tracking-tighter text-[8px] font-bold text-slate-500">${p.category || 'general'}</span>
              ${p.sizes ? `<span>· Sizes: ${p.sizes}</span>` : ''}
              ${p.colors ? `<span>· Colors: ${p.colors}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
           <button class="admin-del-prod-btn text-slate-600 hover:text-rose-500 p-2 transition cursor-pointer" data-id="${p.id}" title="Purge product">
             <i class="fa-solid fa-trash-can text-xs"></i>
           </button>
        </div>
      </div>
    `;
  }
}
