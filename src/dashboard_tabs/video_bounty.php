<!-- ================= TAB: VIDEO BOUNTY (SEPARATE VIEW) ================= -->
<div id="tab-video-bounty" class="hidden space-y-6">
  <!-- Header with back button -->
  <div class="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-900">
    <button id="video-bounty-back-btn" class="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer">
      <i class="fa-solid fa-arrow-left text-xs"></i>
    </button>
    <div>
      <h2 class="text-xs font-black text-white uppercase tracking-tight font-mono">TikTok & Reels Video Bounty</h2>
      <p class="text-[9px] text-slate-500 font-mono">Review our app & earn ৳100 - ৳500 instant wallet bonus!</p>
    </div>
  </div>

  <!-- Campaign info banner -->
  <div class="bg-gradient-to-r from-rose-950/20 to-slate-950 p-4 border border-rose-500/20 rounded-2xl text-slate-400 text-[10px] space-y-2 font-mono">
    <h4 class="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
      <i class="fa-solid fa-gift text-rose-500 animate-bounce"></i> 🎥 review bounty program instructions
    </h4>
    <p class="leading-relaxed">
      আমাদের অ্যাপ নিয়ে একটি সুন্দর রিভিউ ভিডিও বানিয়ে <strong>TikTok, YouTube Shorts</strong> অথবা <strong>Facebook Reels</strong>-এ আপলোড করুন।
    </p>
    <ul class="list-disc pl-4 space-y-1 text-slate-300">
      <li>ভিডিওতে ন্যূনতম <strong class="text-cyan-400">২,০০০+ ভিউ</strong> হতে হবে।</li>
      <li>ভিডিওর ক্যাপশন বা ডেসক্রিপশনে আপনার রেফার কোড অথবা আমাদের অ্যাপের লিংক যুক্ত করুন।</li>
      <li>নিচের ফর্মটি পূরণ করে আপনার আপলোড করা ভিডিওর লিংক সাবমিট করুন।</li>
      <li>অ্যাডমিন যাচাই করার পর সাথে সাথে আপনার ওয়ালেটে <strong class="text-rose-400">৳১০০ - ৳৫০০ বোনাস</strong> যোগ করা হবে!</li>
    </ul>
  </div>

  <!-- Submit Form -->
  <div class="bg-slate-905 border border-slate-800 p-5 rounded-3xl space-y-4">
    <h3 class="text-[10px] font-bold uppercase text-white tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2 font-mono">
      <i class="fa-solid fa-video text-rose-500"></i> Submit Video Review URL
    </h3>

    <div class="space-y-4 text-xs font-mono">
      <div class="space-y-1.5">
        <label class="block text-slate-500 text-[10px] uppercase">Select Social Network</label>
        <select id="user-bounty-platform" class="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/80 rounded-xl py-2.5 px-3 text-white outline-none cursor-pointer">
          <option value="tiktok">🎵 TikTok Video</option>
          <option value="youtube">📹 YouTube Shorts</option>
          <option value="facebook">👥 Facebook Reels</option>
          <option value="instagram">📸 Instagram Reels</option>
        </select>
      </div>

      <div class="space-y-1.5">
        <label class="block text-slate-500 text-[10px] uppercase">Video Link (URL)</label>
        <input type="url" id="user-bounty-video-url" class="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/80 rounded-xl py-2.5 px-3 text-white outline-none" placeholder="https://www.tiktok.com/@username/video/..." required />
      </div>

      <div class="space-y-1.5">
        <label class="block text-slate-500 text-[10px] uppercase">Estimated / Current Views</label>
        <input type="number" id="user-bounty-views" class="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/80 rounded-xl py-2.5 px-3 text-white outline-none" placeholder="e.g. 2500" min="0" required />
      </div>

      <div class="space-y-1.5">
        <label class="block text-slate-500 text-[10px] uppercase">Short Note (Optional)</label>
        <textarea id="user-bounty-note" rows="2" class="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/80 rounded-xl p-3 text-white outline-none resize-none" placeholder="Write any message or description for the administrators..."></textarea>
      </div>

      <button id="user-submit-bounty-btn" class="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-black py-3 rounded-xl transition cursor-pointer hover:scale-[1.01] shadow-lg flex items-center justify-center gap-1.5 text-xs">
        <i class="fa-solid fa-paper-plane mr-0.5"></i> Submit Bounty Application
      </button>
    </div>
  </div>

  <!-- Submit History list -->
  <div class="space-y-3">
    <h3 class="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-mono">
      <i class="fa-solid fa-history"></i> Your Submissions & Status
    </h3>
    <div id="user-bounty-history-list" class="space-y-2.5">
      <!-- Inline items populated via JS -->
    </div>
  </div>
</div>
