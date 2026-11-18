export const template = `<!-- ================= TAB: EDIT PROFILE (ROYAL ROOM STYLE ORGANIZED & RESPONSIVE) ================= -->
<div id="tab-edit-profile" class="hidden space-y-5 max-w-lg mx-auto pb-28 px-1 sm:px-0 animate-fade-in font-sans">
 
 <!-- Top Navigation Bar (Sticky) -->
 <div class="flex items-center justify-between bg-slate-950/95 p-3.5 rounded-2xl border border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl shadow-2xl">
  <div class="flex items-center gap-3">
   <button type="button" id="edit-profile-back-btn" class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer active:scale-95 shadow-md">
    <i data-lucide="arrow-left" class="w-4 h-4"></i>
   </button>
   <div>
    <h2 class="text-xs font-black text-white uppercase tracking-tight font-mono flex items-center gap-1.5">
     <span>Edit Royal Profile</span>
     <span class="text-rose-500">✨</span>
    </h2>
    <p class="text-[9px] text-slate-400 font-mono">প্রোফাইল কাস্টমাইজেশন ও বায়ো</p>
   </div>
  </div>
  <div class="flex items-center gap-2">
   <!-- VIEW AS PUBLIC PREVIEW BUTTON -->
   <button type="button" id="edit-profile-view-as-btn" class="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold py-2 px-3 rounded-xl transition cursor-pointer active:scale-95 font-mono flex items-center gap-1.5" title="Preview Public Profile">
    <i data-lucide="eye" class="w-3.5 h-3.5"></i> View As
   </button>

   <button type="submit" form="edit-profile-main-form" id="edit-profile-save-top-btn" class="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-[10px] py-2 px-4 rounded-xl transition cursor-pointer shadow-lg shadow-rose-950/40 uppercase tracking-wider active:scale-95 flex items-center gap-1 font-mono">
    <i data-lucide="check" class="w-3.5 h-3.5"></i> Save
   </button>
  </div>
 </div>

 <!-- Profile Identity Header Card -->
 <div class="bg-gradient-to-b from-slate-900 via-[#0d1224] to-slate-950 border border-slate-800 p-6 rounded-[2.5rem] text-center space-y-4 shadow-2xl relative overflow-hidden">
  <div class="absolute -right-12 -top-12 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute -left-12 -bottom-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

  <div class="relative w-28 h-28 mx-auto flex items-center justify-center">
   <div id="edit-profile-avatar-preview" class="w-24 h-24 rounded-full border-2 border-rose-500/80 bg-slate-950 flex items-center justify-center text-white text-3xl font-black overflow-hidden shadow-2xl relative">
    <span id="edit-profile-avatar-initial">U</span>
   </div>
   <label for="edit-profile-avatar-file" class="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-center cursor-pointer shadow-xl transition transform hover:scale-110 active:scale-95 border-2 border-slate-950 z-10" title="Upload New Photo">
    <i data-lucide="camera" class="w-4 h-4"></i>
    <input type="file" id="edit-profile-avatar-file" accept="image/*" class="hidden">
   </label>
  </div>

  <div class="space-y-1">
   <h3 id="edit-profile-display-username" class="text-base font-black text-white font-mono tracking-tight">@username</h3>
   <p class="text-[9px] text-slate-400 font-mono">Customize your public creator persona & contact info</p>
   <div class="flex items-center justify-center gap-2 pt-1">
    <span id="edit-profile-vibe-pill" class="text-[9px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2.5 py-0.5 rounded-full font-mono">🍀 Feeling Lucky</span>
    <span class="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full font-mono">✓ Verified</span>
   </div>
  </div>
 </div>

 <!-- NEW CARD: LINK SHARE & PUBLIC PROFILE -->
 <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-[2rem] space-y-3 shadow-xl font-mono text-xs text-left">
  <div class="flex items-center justify-between border-b border-slate-800 pb-3">
   <h4 class="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
    <i data-lucide="share-2" class="w-4 h-4"></i> Public Profile & Link Share <span class="text-[8px] font-sans lowercase opacity-60">(প্রোফাইল লিংক ও শেয়ার)</span>
   </h4>
   <span class="text-[9px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">Live Link</span>
  </div>

  <p class="text-[10px] text-slate-400 font-sans leading-relaxed">
   Share your profile or invite link with friends on social media or WhatsApp to earn referral bonuses.
  </p>

  <div class="flex items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
   <input type="text" id="edit-profile-share-link-input" readonly class="w-full bg-transparent text-slate-300 text-[11px] px-2 outline-none font-mono truncate select-all" value="" />
   <button type="button" id="edit-profile-copy-link-btn" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[10px] py-2 px-4 rounded-xl transition cursor-pointer shadow-md shrink-0 active:scale-95">
    <i data-lucide="copy" class="w-3.5 h-3.5 mr-1"></i> Copy
   </button>
  </div>

  <div class="grid grid-cols-2 gap-2 pt-1">
   <button type="button" onclick="app.shareOnWhatsAppViral()" class="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold py-2.5 rounded-xl text-[10px] transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
    <i data-lucide="message-square" class="w-4 h-4"></i> Share WhatsApp
   </button>
   <button type="button" id="edit-profile-view-as-trigger" class="w-full bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 font-bold py-2.5 rounded-xl text-[10px] transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
    <i data-lucide="eye" class="w-3.5 h-3.5"></i> View As Public
   </button>
  </div>
 </div>

 <!-- Edit Form Section (Organized Room Style Cards) -->
 <form id="edit-profile-main-form" class="space-y-4 font-mono text-xs text-left">
  
  <!-- CARD 1: Personal Info -->
  <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-[2rem] space-y-4 shadow-xl">
   <div class="flex items-center justify-between border-b border-slate-800 pb-3">
    <h4 class="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
     <i data-lucide="user" class="w-4 h-4"></i> Personal Information <span class="text-[8px] font-sans lowercase opacity-60">(ব্যক্তিগত তথ্য)</span>
    </h4>
    <span class="text-[9px] text-slate-500">Required</span>
   </div>

   <div class="space-y-1">
    <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Username (@) / ইউজারনেম</label>
    <div class="relative">
     <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-mono">@</span>
     <input type="text" id="edit-profile-username" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-2xl py-3 pl-8 pr-4 text-white outline-none font-mono text-xs transition" required placeholder="your_username" />
    </div>
   </div>

   <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div class="space-y-1">
     <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Mobile Number / ফোন নম্বর</label>
     <div class="relative">
      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><i data-lucide="phone" class="w-3.5 h-3.5"></i></span>
      <input type="text" id="edit-profile-phone" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-2xl py-3 pl-9 pr-4 text-white outline-none font-mono text-xs transition" placeholder="01700000000" />
     </div>
    </div>

    <div class="space-y-1">
     <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Email Address / ইমেইল</label>
     <div class="relative">
      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><i data-lucide="mail" class="w-3.5 h-3.5"></i></span>
      <input type="email" id="edit-profile-email" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-2xl py-3 pl-9 pr-4 text-white outline-none font-mono text-xs transition" placeholder="user@example.com" />
     </div>
    </div>
   </div>

   <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div class="space-y-1">
     <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Date of Birth / জন্মতারিখ</label>
     <div class="relative">
      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><i data-lucide="calendar" class="w-3.5 h-3.5"></i></span>
      <input type="date" id="edit-profile-dob" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-2xl py-3 pl-9 pr-4 text-white outline-none font-mono text-xs transition" />
     </div>
    </div>

    <div class="space-y-1">
     <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Residential Address / ঠিকানা</label>
     <div class="relative">
      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><i data-lucide="map-pin" class="w-3.5 h-3.5"></i></span>
      <input type="text" id="edit-profile-address" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-2xl py-3 pl-9 pr-4 text-white outline-none font-mono text-xs transition" placeholder="Dhaka, Bangladesh" />
     </div>
    </div>
   </div>
  </div>

  <!-- CARD 2: Bio & Creator Statement -->
  <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-[2rem] space-y-3 shadow-xl">
   <div class="flex items-center justify-between border-b border-slate-800 pb-3">
    <h4 class="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-2">
     <i data-lucide="quote" class="w-4 h-4"></i> Creator Bio & Statement <span class="text-[8px] font-sans lowercase opacity-60">(বায়ো স্ট্যাটাস)</span>
    </h4>
    <span class="text-[9px] text-slate-500">Max 150 chars</span>
   </div>

   <textarea id="edit-profile-bio" rows="3" maxlength="150" class="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl p-3.5 text-white outline-none resize-none font-sans text-xs transition" placeholder="Write something inspiring about yourself, your luck or your strategies..."></textarea>
  </div>

  <!-- CARD 3: Visual Customization & Decor -->
  <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-[2rem] space-y-4 shadow-xl">
   <div class="flex items-center justify-between border-b border-slate-800 pb-3">
    <h4 class="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-2">
     <i data-lucide="wand-2" class="w-4 h-4"></i> Visual Decor & Glow <span class="text-[8px] font-sans lowercase opacity-60">(প্রোফাইল সাজসজ্জা)</span>
    </h4>
    <span class="text-[9px] text-rose-400 font-bold">VIP Perks</span>
   </div>

   <!-- Profile Ambient Glow Selection -->
   <div class="space-y-1.5">
    <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Profile Board Ambient Glow (লাইটিং ইফেক্ট)</label>
    <select id="edit-profile-glow" class="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-2xl py-3 px-4 text-white outline-none font-sans text-xs cursor-pointer transition">
     <option value="none">None (Standard Dark)</option>
     <option value="pulse">❤️ Radiant Rose Aura</option>
     <option value="cyber">💙 Electric Cyan Spark</option>
     <option value="gold">💛 Amber VIP Royalty</option>
     <option value="rainbow">🌈 Rainbow Quantum Wave</option>
    </select>
   </div>

   <!-- Avatar Frame Selector -->
   <div class="bg-slate-950/80 border border-slate-850/60 p-4 rounded-2xl space-y-2.5">
    <span class="text-[10px] uppercase font-bold text-slate-400 block font-mono flex items-center gap-1.5">
     <i data-lucide="crown" class="w-4 h-4 text-amber-400"></i> Select Avatar Frame Effect
    </span>
    <div class="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none" id="edit-profile-frame-selector">
     <button type="button" class="edit-profile-frame-btn border px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition bg-slate-900 hover:border-slate-700/60 text-slate-400 cursor-pointer flex flex-col items-center gap-1.5 border-slate-850 shrink-0" data-frame="none">
      <span class="w-6 h-6 rounded-full border border-dashed border-slate-600 flex items-center justify-center"><i data-lucide="ban" class="w-3.5 h-3.5"></i></span>
      None
     </button>
     <button type="button" class="edit-profile-frame-btn border px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition bg-slate-900 hover:border-amber-500/60 text-amber-400 cursor-pointer flex flex-col items-center gap-1.5 border-slate-850 shrink-0" data-frame="royal">
      <span class="w-6 h-6 rounded-full border border-amber-500/80 bg-amber-950/30 flex items-center justify-center text-amber-400"><i data-lucide="crown" class="w-3.5 h-3.5"></i></span>
      Royal
     </button>
     <button type="button" class="edit-profile-frame-btn border px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition bg-slate-900 hover:border-cyan-500/60 text-cyan-400 cursor-pointer flex flex-col items-center gap-1.5 border-slate-850 shrink-0" data-frame="neon">
      <span class="w-6 h-6 rounded-full border border-cyan-400 bg-cyan-950/30 flex items-center justify-center text-cyan-400"><i data-lucide="zap" class="w-3.5 h-3.5"></i></span>
      Neon
     </button>
     <button type="button" class="edit-profile-frame-btn border px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition bg-slate-900 hover:border-rose-500/60 text-rose-400 cursor-pointer flex flex-col items-center gap-1.5 border-slate-850 shrink-0" data-frame="ruby">
      <span class="w-6 h-6 rounded-full border border-rose-500 bg-rose-950/30 flex items-center justify-center text-rose-400"><i data-lucide="flame" class="w-3.5 h-3.5"></i></span>
      Ruby
     </button>
     <button type="button" class="edit-profile-frame-btn border px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition bg-slate-900 hover:border-purple-500/60 text-purple-400 cursor-pointer flex flex-col items-center gap-1.5 border-slate-850 shrink-0" data-frame="cosmic">
      <span class="w-6 h-6 rounded-full border border-purple-500 bg-purple-950/30 flex items-center justify-center text-purple-400"><i data-lucide="star" class="w-3.5 h-3.5"></i></span>
      Cosmic
     </button>
     <button type="button" class="edit-profile-frame-btn border px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition bg-slate-900 hover:border-orange-500/60 text-orange-400 cursor-pointer flex flex-col items-center gap-1.5 border-slate-850 shrink-0" data-frame="phoenix">
      <span class="w-6 h-6 rounded-full border border-orange-500 bg-orange-950/30 flex items-center justify-center text-orange-400"><i data-lucide="flame" class="w-3.5 h-3.5"></i></span>
      Phoenix
     </button>
     <button type="button" class="edit-profile-frame-btn border px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition bg-slate-900 hover:border-emerald-500/60 text-emerald-400 cursor-pointer flex flex-col items-center gap-1.5 border-slate-850 shrink-0" data-frame="dragon">
      <span class="w-6 h-6 rounded-full border border-emerald-500 bg-emerald-950/30 flex items-center justify-center text-emerald-400"><i data-lucide="award" class="w-3.5 h-3.5"></i></span>
      Dragon
     </button>
     <button type="button" class="edit-profile-frame-btn border px-3 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition bg-slate-900 hover:border-pink-500/60 text-pink-400 cursor-pointer flex flex-col items-center gap-1.5 border-slate-850 shrink-0" data-frame="love">
      <span class="w-6 h-6 rounded-full border border-pink-500 bg-pink-950/30 flex items-center justify-center text-pink-400"><i data-lucide="heart" class="w-3.5 h-3.5"></i></span>
      Love
     </button>
    </div>
   </div>
  </div>

  <!-- Submit CTA & Back button -->
  <div class="pt-2 flex items-center gap-3">
   <button type="button" id="edit-profile-cancel-btn-bottom" class="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-3.5 rounded-2xl transition cursor-pointer text-xs active:scale-95 text-center font-mono">
    Cancel
   </button>
   <button type="submit" class="flex-[2] bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs py-3.5 rounded-2xl transition cursor-pointer shadow-xl shadow-rose-950/50 uppercase tracking-wider active:scale-95 flex items-center justify-center gap-2 font-mono">
    <i data-lucide="check-circle" class="w-4 h-4"></i> Save Profile Changes
   </button>
  </div>
 </form>

 <!-- TikTok / Insta Style Showcase Section -->
 <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-[2rem] space-y-4 shadow-xl">
  <div class="flex border-b border-slate-800 font-mono text-xs">
   <button type="button" id="edit-profile-showcase-tab-posts" class="flex-1 pb-3 text-center font-black border-b-2 border-rose-500 text-white cursor-pointer transition">
    <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 mr-1 inline-block"></i> Posts & Activity
   </button>
   <button type="button" id="edit-profile-showcase-tab-badges" class="flex-1 pb-3 text-center font-bold text-slate-500 hover:text-slate-300 border-b-2 border-transparent cursor-pointer transition">
    <i data-lucide="award" class="w-3.5 h-3.5 mr-1 inline-block"></i> Badges & Rewards
   </button>
  </div>

  <div id="edit-profile-posts-badges-preview" class="py-2 text-center text-xs text-slate-400 font-mono space-y-3">
   <!-- Populated dynamically via JS -->
  </div>
 </div>

 <!-- VIEW AS PUBLIC PROFILE MODAL PREVIEW -->
 <div id="public-profile-preview-modal" class="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4 hidden">
  <div class="relative bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-sm space-y-5 shadow-2xl text-center font-sans">
   <div class="flex justify-between items-center border-b border-slate-800 pb-3">
    <span class="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">👁️ Public Visitor View</span>
    <button type="button" id="public-profile-preview-close-btn" class="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer">
     <i data-lucide="x" class="w-3.5 h-3.5"></i>
    </button>
   </div>

   <!-- Preview Avatar & Header -->
   <div class="space-y-3">
    <div class="relative w-24 h-24 mx-auto flex items-center justify-center">
     <div class="absolute -inset-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/20 flex items-center justify-center"></div>
     <div id="preview-modal-avatar-box" class="w-20 h-20 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-white text-2xl font-black overflow-hidden relative z-10">
      <span id="preview-modal-avatar-initial">U</span>
      <img id="preview-modal-avatar-img" class="absolute inset-0 w-full h-full object-cover hidden" src="" alt="Avatar" />
     </div>
    </div>

    <div>
     <h3 id="preview-modal-username" class="text-base font-black text-white font-mono">@username</h3>
     <p id="preview-modal-vibe" class="text-[10px] text-amber-400 font-mono italic">"🍀 Feeling Lucky"</p>
    </div>

    <p id="preview-modal-bio" class="text-xs text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800 font-sans italic">
     "No creator statement provided yet."
    </p>

    <div class="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
     <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
      <span class="text-slate-500 block">Level</span>
      <strong id="preview-modal-level" class="text-amber-400 text-xs">Level 1</strong>
     </div>
     <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
      <span class="text-slate-500 block">Status</span>
      <strong class="text-emerald-400 text-xs">Verified VIP</strong>
     </div>
    </div>
   </div>

   <button type="button" id="public-profile-preview-done-btn" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl text-xs transition cursor-pointer font-mono">
    Close Preview
   </button>
  </div>
 </div>

</div>
`;
