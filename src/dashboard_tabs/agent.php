<div class="flex flex-col w-full pb-28 font-sans text-slate-100 space-y-3 px-0 sm:px-1 select-none box-border overflow-x-hidden">
  
  <!-- Top App Navigation Header -->
  <div class="flex items-center justify-between bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 px-4 py-3 rounded-2xl shadow-xl sticky top-0 z-30">
    <div class="flex items-center gap-3">
      <button type="button" onclick="if(window.app){window.app.currentTab='wallet';window.app.render();}" class="w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 flex items-center justify-center text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm border border-slate-700/50 active:scale-95">
        <i class="fa-solid fa-arrow-left text-sm"></i>
      </button>
      <div>
        <h1 class="text-sm font-black text-white tracking-wide flex items-center gap-2">
          <span>Verified Agent Desk</span>
          <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        </h1>
        <p class="text-[10px] text-amber-400 font-mono font-semibold">ভেরিফাইড এজেন্ট নেটওয়ার্ক • Local Cash Counters</p>
      </div>
    </div>
    <div class="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-full shadow-inner">
      <i class="fa-solid fa-shield-halved text-amber-400 text-xs"></i>
      <span class="text-[9px] text-amber-300 font-mono font-bold tracking-wider">64 DISTRICTS</span>
    </div>
  </div>

  <!-- Agent Overview Stat Banner Cards -->
  <div class="grid grid-cols-3 gap-2">
    <div class="bg-gradient-to-br from-slate-900 via-[#19150d] to-slate-950 border border-amber-500/20 p-3 rounded-2xl shadow-lg relative overflow-hidden">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[9px] text-amber-400 font-mono uppercase font-bold">Desk Centers</span>
        <i class="fa-solid fa-map-location-dot text-amber-400 text-xs"></i>
      </div>
      <div class="text-lg font-black text-white font-mono">64 Districts</div>
      <p class="text-[8.5px] text-slate-400 leading-tight mt-0.5">দেশব্যাপী ক্যাশ কাউন্টার</p>
    </div>

    <div class="bg-gradient-to-br from-slate-900 via-[#0c1815] to-slate-950 border border-emerald-500/20 p-3 rounded-2xl shadow-lg relative overflow-hidden">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[9px] text-emerald-400 font-mono uppercase font-bold">Commission</span>
        <i class="fa-solid fa-percent text-emerald-400 text-xs"></i>
      </div>
      <div class="text-lg font-black text-emerald-400 font-mono">Up to 6.0%</div>
      <p class="text-[8.5px] text-slate-400 leading-tight mt-0.5">লাইফটাইম কমিশন</p>
    </div>

    <div class="bg-gradient-to-br from-slate-900 via-[#0e1624] to-slate-950 border border-cyan-500/20 p-3 rounded-2xl shadow-lg relative overflow-hidden">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[9px] text-cyan-400 font-mono uppercase font-bold">Helpline</span>
        <i class="fa-solid fa-headset text-cyan-400 text-xs"></i>
      </div>
      <div class="text-lg font-black text-white font-mono">24/7 Live</div>
      <p class="text-[8.5px] text-slate-400 leading-tight mt-0.5">হোয়াটসঅ্যাপ ও কল</p>
    </div>
  </div>

  <!-- Search & District Filter Container -->
  <div class="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-2xl space-y-3 shadow-xl">
    <div class="flex items-center justify-between">
      <h2 class="text-xs font-bold uppercase text-white font-mono flex items-center gap-1.5">
        <i class="fa-solid fa-magnifying-glass-location text-amber-400 text-xs"></i>
        <span>Find Local Authorized Agent Desk</span>
      </h2>
      <span class="text-[9px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">● Realtime Online</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <!-- District Dropdown -->
      <div class="space-y-1">
        <label class="block text-slate-400 text-[10px] uppercase font-mono font-bold">Select District / জেলা নির্বাচন করুন</label>
        <div class="relative">
          <select id="agent-page-district-select" onchange="if(window.AffiliateAgentSystem && window.AffiliateAgentSystem.filterAgentsByDistrict){window.AffiliateAgentSystem.filterAgentsByDistrict(this.value);}" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-amber-500 transition-colors cursor-pointer appearance-none font-mono">
            <option value="all">-- All 64 Districts (সকল জেলা) --</option>
            <option value="Dhaka">Dhaka (ঢাকা জেলা)</option>
            <option value="Chittagong">Chittagong (চট্টগ্রাম জেলা)</option>
            <option value="Sylhet">Sylhet (সিলেট জেলা)</option>
            <option value="Rajshahi">Rajshahi (রাজশাহী জেলা)</option>
            <option value="Khulna">Khulna (খুলনা জেলা)</option>
            <option value="Barisal">Barisal (বরিশাল জেলা)</option>
            <option value="Rangpur">Rangpur (রংপুর জেলা)</option>
            <option value="Mymensingh">Mymensingh (ময়মনসিংহ জেলা)</option>
            <option value="Comilla">Comilla (কুমিল্লা জেলা)</option>
            <option value="Gazipur">Gazipur (গাজীপুর জেলা)</option>
            <option value="Narayanganj">Narayanganj (নারায়ণগঞ্জ জেলা)</option>
            <option value="Bogra">Bogra (বগুড়া জেলা)</option>
            <option value="Cox's Bazar">Cox's Bazar (কক্সবাজার জেলা)</option>
          </select>
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
            <i class="fa-solid fa-chevron-down"></i>
          </div>
        </div>
      </div>

      <!-- Live Search Keyword -->
      <div class="space-y-1">
        <label class="block text-slate-400 text-[10px] uppercase font-mono font-bold">Search Agent / সার্চ করুন</label>
        <div class="relative">
          <input type="text" id="agent-search-input" oninput="if(window.AffiliateAgentSystem && window.AffiliateAgentSystem.searchAgents){window.AffiliateAgentSystem.searchAgents(this.value);}" placeholder="Search name, phone, area..." class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-3 text-xs text-white outline-none focus:border-amber-500 transition-colors font-mono" />
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">
            <i class="fa-solid fa-search"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action Shortcut Buttons -->
    <div class="grid grid-cols-2 gap-2 pt-1">
      <button type="button" onclick="if(window.app){window.app.currentTab='deposit'; window.app.render();}" class="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow">
        <i class="fa-solid fa-plus text-xs"></i>
        <span>Deposit via Agent</span>
      </button>
      <button type="button" onclick="if(window.app){window.app.currentTab='withdraw'; window.app.render();}" class="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow">
        <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
        <span>Withdraw at Desk</span>
      </button>
    </div>
  </div>

  <!-- Dynamic Agent Desk Cards List -->
  <div class="space-y-2.5" id="agent-list-container">
    
    <!-- Verified Agent 1: Dhaka Central -->
    <div class="agent-desk-card bg-slate-900/90 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-2xl space-y-3 shadow-lg hover:border-amber-500/40 transition-all" data-district="Dhaka" data-name="agent_dhaka" data-phone="01700000001">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg font-black shadow-sm shrink-0">
            <i class="fa-solid fa-user-tie"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="text-xs font-black text-white font-mono">@agent_dhaka</h3>
              <span class="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                <i class="fa-solid fa-circle-check text-[8px]"></i> VERIFIED
              </span>
            </div>
            <p class="text-[10px] text-slate-400 font-sans">Dhaka Central • Motijheel Commercial Area #4</p>
            <span class="text-[9px] text-slate-500 font-mono">Counter Code: DHK-01 • Cash In/Out Active</span>
          </div>
        </div>
        <span class="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-800/50">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
        </span>
      </div>

      <!-- Action Buttons for this Agent Desk -->
      <div class="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 font-mono text-[10px]">
        <a href="tel:01700000001" class="flex-1 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95">
          <i class="fa-solid fa-phone text-emerald-400"></i>
          <span>Call Desk</span>
        </a>
        <a href="https://wa.me/8801700000001" target="_blank" rel="noopener noreferrer" class="flex-1 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95">
          <i class="fa-brands fa-whatsapp text-emerald-400"></i>
          <span>WhatsApp</span>
        </a>
        <button type="button" onclick="if(window.app){window.app.currentTab='withdraw'; window.app.render();}" class="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer font-bold">
          <i class="fa-solid fa-money-bill-transfer"></i>
          <span>Cashout</span>
        </button>
      </div>
    </div>

    <!-- Verified Agent 2: Chittagong Port -->
    <div class="agent-desk-card bg-slate-900/90 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-2xl space-y-3 shadow-lg hover:border-amber-500/40 transition-all" data-district="Chittagong" data-name="agent_ctg_port" data-phone="01800000002">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-lg font-black shadow-sm shrink-0">
            <i class="fa-solid fa-user-tie"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="text-xs font-black text-white font-mono">@agent_ctg_port</h3>
              <span class="inline-flex items-center gap-1 bg-cyan-500/15 text-cyan-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
                <i class="fa-solid fa-circle-check text-[8px]"></i> VERIFIED
              </span>
            </div>
            <p class="text-[10px] text-slate-400 font-sans">Chittagong District • Agrabad Commercial Plaza #12</p>
            <span class="text-[9px] text-slate-500 font-mono">Counter Code: CTG-01 • Cash In/Out Active</span>
          </div>
        </div>
        <span class="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-800/50">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
        </span>
      </div>

      <div class="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 font-mono text-[10px]">
        <a href="tel:01800000002" class="flex-1 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95">
          <i class="fa-solid fa-phone text-emerald-400"></i>
          <span>Call Desk</span>
        </a>
        <a href="https://wa.me/8801800000002" target="_blank" rel="noopener noreferrer" class="flex-1 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95">
          <i class="fa-brands fa-whatsapp text-emerald-400"></i>
          <span>WhatsApp</span>
        </a>
        <button type="button" onclick="if(window.app){window.app.currentTab='withdraw'; window.app.render();}" class="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer font-bold">
          <i class="fa-solid fa-money-bill-transfer"></i>
          <span>Cashout</span>
        </button>
      </div>
    </div>

    <!-- Verified Agent 3: Sylhet Central -->
    <div class="agent-desk-card bg-slate-900/90 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-2xl space-y-3 shadow-lg hover:border-amber-500/40 transition-all" data-district="Sylhet" data-name="agent_sylhet" data-phone="01900000005">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 text-lg font-black shadow-sm shrink-0">
            <i class="fa-solid fa-user-tie"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="text-xs font-black text-white font-mono">@agent_sylhet</h3>
              <span class="inline-flex items-center gap-1 bg-purple-500/15 text-purple-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-purple-500/30">
                <i class="fa-solid fa-circle-check text-[8px]"></i> VERIFIED
              </span>
            </div>
            <p class="text-[10px] text-slate-400 font-sans">Sylhet District • Zindabazar Point #08</p>
            <span class="text-[9px] text-slate-500 font-mono">Counter Code: SYL-01 • Cash In/Out Active</span>
          </div>
        </div>
        <span class="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-800/50">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
        </span>
      </div>

      <div class="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 font-mono text-[10px]">
        <a href="tel:01900000005" class="flex-1 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95">
          <i class="fa-solid fa-phone text-emerald-400"></i>
          <span>Call Desk</span>
        </a>
        <a href="https://wa.me/8801900000005" target="_blank" rel="noopener noreferrer" class="flex-1 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95">
          <i class="fa-brands fa-whatsapp text-emerald-400"></i>
          <span>WhatsApp</span>
        </a>
        <button type="button" onclick="if(window.app){window.app.currentTab='withdraw'; window.app.render();}" class="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer font-bold">
          <i class="fa-solid fa-money-bill-transfer"></i>
          <span>Cashout</span>
        </button>
      </div>
    </div>

  </div>

  <!-- Become an Agent / Dealership Banner -->
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#19150d] to-slate-950 p-4 border border-amber-500/30 shadow-xl space-y-2.5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-handshake-angle text-amber-400 text-base"></i>
        <h3 class="text-xs font-black text-white font-mono uppercase">Become a District Agent Partner</h3>
      </div>
      <span class="bg-amber-500 text-slate-950 text-[8px] font-mono font-black px-1.5 py-0.5 rounded">EARN 1.5% - 6%</span>
    </div>
    <p class="text-[10px] text-slate-300 font-sans leading-relaxed">
      আপনার জেলা বা এলাকায় আমাদের অথরাইজড এজেন্ট ও ক্যাশ কাউন্টার পার্টনার হতে আবেদন করুন। প্রতিটি ক্যাশ-ইন ও ক্যাশ-আউটে তাৎক্ষণিক কমিশন উপভোগ করুন।
    </p>
    <div class="pt-1">
      <a href="https://wa.me/8801700000000?text=Hello%20I%20want%20to%20apply%20for%20Agent%20Dealership" target="_blank" rel="noopener noreferrer" class="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-98 shadow-md font-mono uppercase tracking-wider">
        <i class="fa-brands fa-whatsapp text-sm"></i>
        <span>Apply for Agent Dealership (এজেন্ট আবেদন)</span>
      </a>
    </div>
  </div>

</div>
