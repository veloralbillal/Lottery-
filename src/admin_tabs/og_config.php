<?php
/**
 * Admin Panel - Open Graph Configuration
 */
?>
<div id="admin-tab-og-config" class="hidden space-y-6">
    <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
    <div class="space-y-1">
        <h2 class="text-xl font-black text-white uppercase tracking-wide">Open Graph Meta Control</h2>
        <p class="text-xs text-slate-400">Configure how your site appears when shared on social media.</p>
    </div>

    <div class="space-y-4">
        <div>
            <label class="block text-xs text-slate-400 mb-1 font-mono uppercase">OG Title</label>
            <input type="text" id="og-title" class="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-mono text-sm focus:border-cyan-500 outline-none" placeholder="Mobile Lottery Portal">
        </div>
        <div>
            <label class="block text-xs text-slate-400 mb-1 font-mono uppercase">OG Description</label>
            <textarea id="og-description" class="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-mono text-sm focus:border-cyan-500 outline-none" placeholder="Join the best lottery experience."></textarea>
        </div>
        <div>
            <label class="block text-xs text-slate-400 mb-1 font-mono uppercase">OG Image URL</label>
            <input type="text" id="og-image" class="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-mono text-sm focus:border-cyan-500 outline-none" placeholder="https://example.com/logo.jpg">
        </div>
        <button onclick="saveOgSettings()" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/20">
            Save OG Configuration
        </button>
    </div>
</div>
</div>
