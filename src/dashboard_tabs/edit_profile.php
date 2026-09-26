<!-- ================= TAB: EDIT PROFILE (TIKTOK / INSTAGRAM STYLE FULL SCREEN) ================= -->
<div id="tab-edit-profile" class="hidden space-y-6 max-w-lg mx-auto pb-16">
  <!-- Top Navigation Bar (Sticky) -->
  <div class="flex items-center justify-between bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800/80 sticky top-0 z-30 backdrop-blur-md shadow-xl">
    <div class="flex items-center gap-3">
      <button type="button" id="edit-profile-back-btn" class="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer active:scale-95">
        <i class="fa-solid fa-arrow-left text-xs"></i>
      </button>
      <div>
        <h2 class="text-xs font-black text-white uppercase tracking-tight font-mono flex items-center gap-1.5">
          <span>Edit Profile & Bio</span>
          <span class="text-rose-500">✨</span>
        </h2>
        <p class="text-[9px] text-slate-400 font-mono">TikTok & Insta style creator profile</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" id="edit-profile-cancel-btn" class="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] font-bold py-2 px-3 rounded-xl border border-slate-800 transition cursor-pointer active:scale-95">
        Cancel
      </button>
      <button type="submit" form="edit-profile-main-form" id="edit-profile-save-top-btn" class="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-[10px] py-2 px-4 rounded-xl transition cursor-pointer shadow-lg shadow-rose-950/40 uppercase tracking-wider active:scale-95 flex items-center gap-1">
        <i class="fa-solid fa-check text-[9px]"></i> Save
      </button>
    </div>
  </div>

  <!-- Profile Identity Header Card -->
  <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-850 p-6 rounded-3xl text-center space-y-4 shadow-xl relative overflow-hidden">
    <div class="absolute -right-10 -top-10 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
    <div class="absolute -left-10 -bottom-10 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

    <div class="relative w-28 h-28 mx-auto flex items-center justify-center">
      <div id="edit-profile-avatar-preview" class="w-24 h-24 rounded-full border-2 border-rose-500/80 bg-slate-950 flex items-center justify-center text-white text-3xl font-black overflow-hidden shadow-2xl relative">
        <span id="edit-profile-avatar-initial">U</span>
      </div>
      <label for="edit-profile-avatar-file" class="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-center cursor-pointer shadow-xl transition transform hover:scale-110 active:scale-95 border-2 border-slate-950 z-10" title="Upload New Photo">
        <i class="fa-solid fa-camera text-xs"></i>
        <input type="file" id="edit-profile-avatar-file" accept="image/*" class="hidden">
      </label>
    </div>

    <div class="space-y-1">
      <h3 id="edit-profile-display-username" class="text-base font-black text-white font-mono tracking-tight">@username</h3>
      <p class="text-[10px] text-slate-400 font-mono">Customize your public creator persona & contact info</p>
      <div class="flex items-center justify-center gap-2 pt-1">
        <span id="edit-profile-vibe-pill" class="text-[9px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2.5 py-0.5 rounded-full font-mono">🍀 Feeling Lucky</span>
        <span class="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full font-mono">✓ Verified</span>
      </div>
    </div>
  </div>

  <!-- Edit Form Section -->
  <form id="edit-profile-main-form" class="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4 font-mono text-xs shadow-xl text-left">
    <h4 class="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
      <i class="fa-solid fa-user-pen"></i> Personal Information & Bio
    </h4>

    <div class="space-y-1">
      <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Username (@) / ইউজারনেম</label>
      <div class="relative">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono">@</span>
        <input type="text" id="edit-profile-username" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none font-mono" required placeholder="your_username" />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="space-y-1">
        <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Mobile Number / ফোন নম্বর</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><i class="fa-solid fa-phone text-[10px]"></i></span>
          <input type="text" id="edit-profile-phone" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none font-mono" placeholder="01700000000" />
        </div>
      </div>

      <div class="space-y-1">
        <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Email Address / ইমেইল</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><i class="fa-regular fa-envelope text-[10px]"></i></span>
          <input type="email" id="edit-profile-email" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none font-mono" placeholder="user@example.com" />
        </div>
      </div>
    </div>

    <div class="space-y-1">
      <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Bio / Creator Statement (বায়ো স্ট্যাটাস)</label>
      <textarea id="edit-profile-bio" rows="3" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-white outline-none resize-none font-sans text-xs" placeholder="Write something inspiring about yourself, your luck or your strategies..."></textarea>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="space-y-1">
        <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Date of Birth / জন্মতারিখ</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><i class="fa-regular fa-calendar text-[10px]"></i></span>
          <input type="date" id="edit-profile-dob" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none font-mono" />
        </div>
      </div>

      <div class="space-y-1">
        <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Residential Address / ঠিকানা</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><i class="fa-solid fa-location-dot text-[10px]"></i></span>
          <input type="text" id="edit-profile-address" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 pl-8 pr-3 text-white outline-none font-mono" placeholder="Dhaka, Bangladesh" />
        </div>
      </div>
    </div>

    <!-- Profile Ambient Glow Selection -->
    <div class="space-y-1">
      <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Profile Board Ambient Glow (লাইটিং ইফেক্ট)</label>
      <select id="edit-profile-glow" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl py-2.5 px-3 text-white outline-none font-sans text-xs cursor-pointer">
        <option value="none">None (Standard Dark)</option>
        <option value="pulse">❤️ Radiant Rose Aura</option>
        <option value="cyber">💙 Electric Cyan Spark</option>
        <option value="gold">💛 Amber VIP Royalty</option>
        <option value="rainbow">🌈 Rainbow Quantum Wave</option>
      </select>
    </div>

    <!-- Avatar Frame Selector -->
    <div class="bg-slate-950/80 border border-slate-850/60 p-3.5 rounded-2xl space-y-2">
      <span class="text-[9px] uppercase font-bold text-slate-400 block font-mono flex items-center gap-1.5">
        <i class="fa-solid fa-wand-magic-sparkles text-amber-400 animate-pulse"></i> Select Avatar Frame Effect
      </span>
      <div class="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin" id="edit-profile-frame-selector">
        <button type="button" class="edit-profile-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-slate-700/60 text-slate-400 cursor-pointer flex flex-col items-center gap-1 border-slate-850 shrink-0" data-frame="none">
          <span class="w-5 h-5 rounded-full border border-dashed border-slate-600 flex items-center justify-center"><i class="fa-solid fa-ban text-[8px]"></i></span>
          None
        </button>
        <button type="button" class="edit-profile-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-amber-500/60 text-amber-400 cursor-pointer flex flex-col items-center gap-1 border-slate-850 shrink-0" data-frame="royal">
          <span class="w-5 h-5 rounded-full border border-amber-500/80 bg-amber-950/30 flex items-center justify-center text-amber-400"><i class="fa-solid fa-crown text-[8px]"></i></span>
          Royal
        </button>
        <button type="button" class="edit-profile-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-cyan-500/60 text-cyan-400 cursor-pointer flex flex-col items-center gap-1 border-slate-850 shrink-0" data-frame="neon">
          <span class="w-5 h-5 rounded-full border border-cyan-400 bg-cyan-950/30 flex items-center justify-center text-cyan-400"><i class="fa-solid fa-bolt text-[8px]"></i></span>
          Neon
        </button>
        <button type="button" class="edit-profile-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-rose-500/60 text-rose-400 cursor-pointer flex flex-col items-center gap-1 border-slate-850 shrink-0" data-frame="ruby">
          <span class="w-5 h-5 rounded-full border border-rose-500 bg-rose-950/30 flex items-center justify-center text-rose-400"><i class="fa-solid fa-fire text-[8px]"></i></span>
          Ruby
        </button>
        <button type="button" class="edit-profile-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-purple-500/60 text-purple-400 cursor-pointer flex flex-col items-center gap-1 border-slate-850 shrink-0" data-frame="cosmic">
          <span class="w-5 h-5 rounded-full border border-purple-500 bg-purple-950/30 flex items-center justify-center text-purple-400"><i class="fa-solid fa-star text-[8px]"></i></span>
          Cosmic
        </button>
        <button type="button" class="edit-profile-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-orange-500/60 text-orange-400 cursor-pointer flex flex-col items-center gap-1 border-slate-850 shrink-0" data-frame="phoenix">
          <span class="w-5 h-5 rounded-full border border-orange-500 bg-orange-950/30 flex items-center justify-center text-orange-400"><i class="fa-solid fa-fire-flame-simple text-[8px]"></i></span>
          Phoenix
        </button>
        <button type="button" class="edit-profile-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-emerald-500/60 text-emerald-400 cursor-pointer flex flex-col items-center gap-1 border-slate-850 shrink-0" data-frame="dragon">
          <span class="w-5 h-5 rounded-full border border-emerald-500 bg-emerald-950/30 flex items-center justify-center text-emerald-400"><i class="fa-solid fa-dragon text-[8px]"></i></span>
          Dragon
        </button>
        <button type="button" class="edit-profile-frame-btn border px-2.5 py-1.5 rounded-xl text-[8px] font-mono font-bold uppercase transition bg-slate-900 hover:border-pink-500/60 text-pink-400 cursor-pointer flex flex-col items-center gap-1 border-slate-850 shrink-0" data-frame="love">
          <span class="w-5 h-5 rounded-full border border-pink-500 bg-pink-950/30 flex items-center justify-center text-pink-400"><i class="fa-solid fa-heart text-[8px]"></i></span>
          Love
        </button>
      </div>
    </div>

    <!-- Submit CTA & Back button -->
    <div class="pt-2 flex items-center gap-3">
      <button type="button" id="edit-profile-cancel-btn-bottom" class="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-3 rounded-xl transition cursor-pointer text-xs active:scale-95 text-center">
        Cancel
      </button>
      <button type="submit" class="flex-[2] bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs py-3 rounded-xl transition cursor-pointer shadow-lg shadow-rose-950/40 uppercase tracking-wider active:scale-95 flex items-center justify-center gap-1.5">
        <i class="fa-solid fa-circle-check"></i> Save Profile Changes
      </button>
    </div>
  </form>

  <!-- TikTok / Insta Style Sections: Posts & Badges Underneath -->
  <div class="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4 shadow-xl">
    <div class="flex border-b border-slate-800 font-mono text-xs">
      <button type="button" id="edit-profile-showcase-tab-posts" class="flex-1 pb-2.5 text-center font-black border-b-2 border-rose-500 text-white cursor-pointer transition">
        <i class="fa-solid fa-grip mr-1"></i> Posts & Activity
      </button>
      <button type="button" id="edit-profile-showcase-tab-badges" class="flex-1 pb-2.5 text-center font-bold text-slate-500 hover:text-slate-300 border-b-2 border-transparent cursor-pointer transition">
        <i class="fa-solid fa-award mr-1"></i> Badges & Rewards
      </button>
    </div>

    <div id="edit-profile-posts-badges-preview" class="py-2 text-center text-xs text-slate-400 font-mono space-y-3">
      <!-- Populated dynamically via JS -->
    </div>
  </div>
</div>
