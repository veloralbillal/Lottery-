<?php
/**
 * Admin Panel - Dedicated Security Operations Center (src/admin_tabs/security.php)
 * 
 * Provides real-time visibility into security audit logs, brute-force rate limit counters,
 * active session defense configurations, and administrative passphrase updates.
 */

// Fetch live security statistics
$sec_total_logs = 0;
$sec_failed_logins = 0;
$sec_locked_rates = 0;
$sec_audit_logs = [];
$sec_rate_records = [];

try {
  $sec_total_logs = (int)$conn->query("SELECT COUNT(*) FROM security_audit_logs")->fetchColumn();
  $sec_failed_logins = (int)$conn->query("SELECT COUNT(*) FROM security_audit_logs WHERE action LIKE '%FAILED%' OR action LIKE '%RATE_LIMITED%'")->fetchColumn();
  $sec_locked_rates = (int)$conn->query("SELECT COUNT(*) FROM rate_limits WHERE locked_until > UNIX_TIMESTAMP()")->fetchColumn();
  
  $stmt_logs = $conn->query("SELECT * FROM security_audit_logs ORDER BY created_at DESC LIMIT 30");
  $sec_audit_logs = $stmt_logs->fetchAll();

  $stmt_rates = $conn->query("SELECT * FROM rate_limits ORDER BY last_attempt DESC LIMIT 20");
  $sec_rate_records = $stmt_rates->fetchAll();
} catch (PDOException $e) {
  error_log("Security tab data fetch error: " . $e->getMessage());
}
?>

<!-- SECURITY OPERATIONS CENTER MAIN SECTION -->
<section id="admin-security-section" class="space-y-6">

  <!-- Top Security Banner & Diagnostics Header -->
  <div class="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-6 rounded-3xl shadow-xl relative overflow-hidden">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xl font-black shadow-lg">
          <i data-lucide="shield" ></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-black text-white uppercase tracking-wider font-display">Security Operations Center</h3>
            <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">Armored</span>
          </div>
          <p class="text-xs text-slate-400 font-mono mt-0.5">Real-time audit log monitoring, brute-force rate limit tracking & credential security.</p>
        </div>
      </div>

      <!-- Global Security Status Indicator -->
      <div class="flex items-center gap-2 bg-slate-950/80 border border-emerald-900/40 rounded-2xl px-4 py-2 font-mono text-xs">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-emerald-400 font-bold">ALL SHIELDS ACTIVE</span>
      </div>
    </div>

    <!-- Metric Badges Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 font-mono">
      <div class="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-2xl">
        <span class="text-[10px] text-slate-500 uppercase block">Total Audit Events</span>
        <span class="text-lg font-black text-white mt-1 block"><?php echo number_format($sec_total_logs); ?></span>
      </div>
      <div class="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-2xl">
        <span class="text-[10px] text-slate-500 uppercase block">Security Blocks / Fails</span>
        <span class="text-lg font-black text-rose-400 mt-1 block"><?php echo number_format($sec_failed_logins); ?></span>
      </div>
      <div class="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-2xl">
        <span class="text-[10px] text-slate-500 uppercase block">Active Locked Keys</span>
        <span class="text-lg font-black text-amber-400 mt-1 block"><?php echo number_format($sec_locked_rates); ?></span>
      </div>
      <div class="bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-2xl">
        <span class="text-[10px] text-slate-500 uppercase block">Session Defense</span>
        <span class="text-xs font-bold text-cyan-400 mt-2 block">30m Idle / 8h Max</span>
      </div>
    </div>
  </div>

  <!-- Active Shield Health Checklist -->
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
      <div class="flex items-center gap-2">
        <i data-lucide="clipboard" class=" text-cyan-400 text-sm"></i>
        <h4 class="text-xs font-bold uppercase tracking-wider text-white font-mono">Active Defense Matrix</h4>
      </div>
      <span class="text-[10px] font-mono text-slate-500">Standards Verified</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
      <div class="bg-slate-950/70 border border-emerald-900/30 rounded-2xl p-3 flex items-start gap-3">
        <i data-lucide="check-circle" class=" text-emerald-400 text-sm mt-0.5 shrink-0"></i>
        <div>
          <span class="font-bold text-white block">SQL Injection Barrier</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">PDO Prepared Statements enforced on all queries.</span>
        </div>
      </div>
      <div class="bg-slate-950/70 border border-emerald-900/30 rounded-2xl p-3 flex items-start gap-3">
        <i data-lucide="check-circle" class=" text-emerald-400 text-sm mt-0.5 shrink-0"></i>
        <div>
          <span class="font-bold text-white block">CSRF Token Shield</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">Constant-time token validation on state-changing requests.</span>
        </div>
      </div>
      <div class="bg-slate-950/70 border border-emerald-900/30 rounded-2xl p-3 flex items-start gap-3">
        <i data-lucide="check-circle" class=" text-emerald-400 text-sm mt-0.5 shrink-0"></i>
        <div>
          <span class="font-bold text-white block">Provably Fair Draws</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">Cryptographic `random_int()` RNG for lottery winners.</span>
        </div>
      </div>
      <div class="bg-slate-950/70 border border-emerald-900/30 rounded-2xl p-3 flex items-start gap-3">
        <i data-lucide="check-circle" class=" text-emerald-400 text-sm mt-0.5 shrink-0"></i>
        <div>
          <span class="font-bold text-white block">Brute-Force Rate Limiting</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">Persistent database-backed attempt throttlers.</span>
        </div>
      </div>
      <div class="bg-slate-950/70 border border-emerald-900/30 rounded-2xl p-3 flex items-start gap-3">
        <i data-lucide="check-circle" class=" text-emerald-400 text-sm mt-0.5 shrink-0"></i>
        <div>
          <span class="font-bold text-white block">Deposit Idempotency</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">Unique TrxID verification stops duplicate credit replay attacks.</span>
        </div>
      </div>
      <div class="bg-slate-950/70 border border-emerald-900/30 rounded-2xl p-3 flex items-start gap-3">
        <i data-lucide="check-circle" class=" text-emerald-400 text-sm mt-0.5 shrink-0"></i>
        <div>
          <span class="font-bold text-white block">Upload Execution Barrier</span>
          <span class="text-[10px] text-slate-400 block mt-0.5">`.htaccess` script execution deny rules active in uploads.</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Live Security Audit Log Stream -->
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
      <div class="flex items-center gap-2">
        <i data-lucide="clock" class="-rotate-left text-amber-400 text-sm"></i>
        <h4 class="text-xs font-bold uppercase tracking-wider text-white font-mono">Live Security Audit Log (Latest 30 Events)</h4>
      </div>
      <form action="admin.php" method="POST" onsubmit="return confirm('Prune audit logs older than 30 days?')">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(csrf_token()); ?>">
        <input type="hidden" name="action" value="prune_audit_logs">
        <button type="submit" class="text-[10px] font-mono text-slate-400 hover:text-rose-400 transition bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer">
          <i class="fa-broom mr-1"></i> Prune Old Logs
        </button>
      </form>
    </div>

    <div class="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-none">
      <table class="w-full text-left border-collapse font-mono text-[11px]">
        <thead>
          <tr class="border-b border-slate-800 text-slate-500 uppercase text-[9px] tracking-wider sticky top-0 bg-slate-900 z-10">
            <th class="py-2.5 px-3">Timestamp</th>
            <th class="py-2.5 px-3">Actor</th>
            <th class="py-2.5 px-3">Action Event</th>
            <th class="py-2.5 px-3">Client IP</th>
            <th class="py-2.5 px-3">Security Details</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-850 text-slate-300">
          <?php if (count($sec_audit_logs) === 0): ?>
            <tr>
              <td colspan="5" class="py-6 text-center text-slate-600 font-mono text-xs">
                0 security events recorded yet. All operations normal.
              </td>
            </tr>
          <?php else: ?>
            <?php foreach ($sec_audit_logs as $log): 
              $is_fail = strpos($log['action'], 'FAIL') !== false || strpos($log['action'], 'REJECT') !== false || strpos($log['action'], 'BLOCKED') !== false || strpos($log['action'], 'LIMITED') !== false;
              $is_succ = strpos($log['action'], 'SUCCESS') !== false || strpos($log['action'], 'APPROVED') !== false;
            ?>
              <tr class="hover:bg-slate-950/50 transition">
                <td class="py-2.5 px-3 whitespace-nowrap text-slate-500 text-[10px]">
                  <?php echo htmlspecialchars($log['created_at']); ?>
                </td>
                <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                  @<?php echo htmlspecialchars($log['actor_username'] ?: 'GUEST'); ?>
                </td>
                <td class="py-2.5 px-3 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold inline-block <?php echo $is_fail ? 'bg-rose-950/60 border border-rose-900/50 text-rose-400' : ($is_succ ? 'bg-emerald-950/60 border border-emerald-900/50 text-emerald-400' : 'bg-cyan-950/60 border border-cyan-900/50 text-cyan-400'); ?>">
                    <?php echo htmlspecialchars($log['action']); ?>
                  </span>
                </td>
                <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[10px]">
                  <?php echo htmlspecialchars($log['ip_address']); ?>
                </td>
                <td class="py-2.5 px-3 text-slate-400 text-[10px] max-w-xs truncate">
                  <?php echo htmlspecialchars($log['details'] ?: '-'); ?>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>

  <?php
  $sec_2fa = $_SESSION['two_factor_auth'] ?? [
    'enabled' => 0,
    'pin' => '829401',
    'enforce_login' => 1,
    'enforce_withdraw' => 1,
    'enforce_credentials' => 1,
    'enforce_finance' => 1
  ];
  $sec_rates_policy = $_SESSION['rate_limit_policy'] ?? [
    'max_attempts' => 5,
    'max_reg_attempts' => 5,
    'decay_mins' => 15,
    'sensitive_per_min' => 10
  ];
  ?>

  <!-- 2-FACTOR AUTHENTICATION & RATE LIMIT POLICY GRID -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- Two-Factor Authentication (2FA) Configurator -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <i data-lucide="shield" class=" text-emerald-400 text-sm"></i>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white font-mono">Two-Factor Authentication (2FA)</h4>
        </div>
        <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold <?php echo !empty($sec_2fa['enabled']) ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-950 text-slate-400 border border-slate-800'; ?> uppercase">
          <?php echo !empty($sec_2fa['enabled']) ? 'Active (Enforced)' : 'Disabled'; ?>
        </span>
      </div>

      <form action="admin.php?tab=security" method="POST" class="space-y-4 font-mono text-xs">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(csrf_token()); ?>">
        <input type="hidden" name="action" value="save_2fa_policy">

        <!-- Master 2FA Toggle -->
        <div class="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 p-3 rounded-2xl">
          <div>
            <span class="text-white font-bold block text-xs font-sans">Enforce Two-Factor Authentication</span>
            <span class="text-[10px] text-slate-400 block font-sans">Requires 6-digit PIN code on critical checkpoints.</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="admin-sec-2fa-toggle" name="two_factor_enabled" value="1" <?php echo !empty($sec_2fa['enabled']) ? 'checked' : ''; ?> class="sr-only peer">
            <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <!-- 6-Digit Master Security Code (PIN) -->
        <div class="space-y-1">
          <label class="block text-slate-400 text-[10px] uppercase font-bold">Master 6-Digit Security Code (PIN)</label>
          <input type="text" id="admin-sec-2fa-pin" name="two_factor_pin" maxlength="6" value="<?php echo htmlspecialchars($sec_2fa['pin'] ?? '829401'); ?>" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-center font-mono tracking-[0.3em] font-black text-sm outline-none focus:border-emerald-500" />
          <span class="text-[9px] text-slate-500 font-sans block">6-digit code required when signing in or approving financial operations.</span>
        </div>

        <!-- Important Moments Enforced -->
        <div class="space-y-2 pt-1 border-t border-slate-800/80">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Enforce on Checkpoint Moments:</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
            <label class="flex items-center gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/60 cursor-pointer">
              <input type="checkbox" id="admin-sec-2fa-chk-login" name="enforce_login" value="1" <?php echo !empty($sec_2fa['enforce_login']) ? 'checked' : ''; ?> class="rounded border-slate-700 text-emerald-500 focus:ring-0">
              <span class="text-slate-200">User & Admin Login</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/60 cursor-pointer">
              <input type="checkbox" id="admin-sec-2fa-chk-withdraw" name="enforce_withdraw" value="1" <?php echo !empty($sec_2fa['enforce_withdraw']) ? 'checked' : ''; ?> class="rounded border-slate-700 text-emerald-500 focus:ring-0">
              <span class="text-slate-200">Wallet Withdrawals</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/60 cursor-pointer">
              <input type="checkbox" id="admin-sec-2fa-chk-credentials" name="enforce_credentials" value="1" <?php echo !empty($sec_2fa['enforce_credentials']) ? 'checked' : ''; ?> class="rounded border-slate-700 text-emerald-500 focus:ring-0">
              <span class="text-slate-200">Password Changes</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/60 cursor-pointer">
              <input type="checkbox" id="admin-sec-2fa-chk-finance" name="enforce_finance" value="1" <?php echo !empty($sec_2fa['enforce_finance']) ? 'checked' : ''; ?> class="rounded border-slate-700 text-emerald-500 focus:ring-0">
              <span class="text-slate-200">Manual Draws & Payouts</span>
            </label>
          </div>
        </div>

        <button type="button" id="btn-sec-save-2fa" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs py-2.5 rounded-xl transition duration-200 shadow-md uppercase tracking-wider cursor-pointer">
          <i data-lucide="save" class=" mr-1.5"></i> Save 2FA Policy Settings
        </button>
      </form>
    </div>

    <!-- Rate Limiting Rules & Throttle Policy -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <i class="fa-gauge-high text-rose-400 text-sm"></i>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white font-mono">Rate Limiting Policy</h4>
        </div>
        <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-955 text-rose-400 border border-rose-900/40 uppercase">
          Active Defense
        </span>
      </div>

      <form action="admin.php?tab=security" method="POST" class="space-y-4 font-mono text-xs">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(csrf_token()); ?>">
        <input type="hidden" name="action" value="save_rate_policy">

        <div class="space-y-1">
          <label class="block text-slate-400 text-[10px] uppercase font-bold">Max Registration Attempts / IP</label>
          <select id="admin-sec-rate-max-reg" name="max_reg_attempts" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500 font-mono text-xs">
            <option value="1" <?php echo ($sec_rates_policy['max_reg_attempts'] == 1) ? 'selected' : ''; ?>>1 Attempt (Ultra Strict)</option>
            <option value="3" <?php echo ($sec_rates_policy['max_reg_attempts'] == 3) ? 'selected' : ''; ?>>3 Attempts (Strict)</option>
            <option value="5" <?php echo ($sec_rates_policy['max_reg_attempts'] == 5) ? 'selected' : ''; ?>>5 Attempts (Standard)</option>
            <option value="10" <?php echo ($sec_rates_policy['max_reg_attempts'] == 10) ? 'selected' : ''; ?>>10 Attempts (Relaxed)</option>
          </select>
          <span class="text-[9px] text-slate-500 font-sans block">Throttle limit for creating new accounts from a single IP address.</span>
        </div>

        <div class="space-y-1">
          <label class="block text-slate-400 text-[10px] uppercase font-bold">Max Failed Login Attempts</label>
          <select id="admin-sec-rate-max-attempts" name="max_attempts" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500 font-mono text-xs">
            <option value="3" <?php echo ($sec_rates_policy['max_attempts'] == 3) ? 'selected' : ''; ?>>3 Attempts (Strict High Security)</option>
            <option value="5" <?php echo ($sec_rates_policy['max_attempts'] == 5) ? 'selected' : ''; ?>>5 Attempts (Recommended Standard)</option>
            <option value="10" <?php echo ($sec_rates_policy['max_attempts'] == 10) ? 'selected' : ''; ?>>10 Attempts (Lenient)</option>
          </select>
          <span class="text-[9px] text-slate-500 font-sans block">Consecutive wrong password attempts before temporary account/IP lockout.</span>
        </div>

        <div class="space-y-1">
          <label class="block text-slate-400 text-[10px] uppercase font-bold">Temporary Lockout Duration</label>
          <select id="admin-sec-rate-decay-mins" name="decay_mins" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500 font-mono text-xs">
            <option value="5" <?php echo ($sec_rates_policy['decay_mins'] == 5) ? 'selected' : ''; ?>>5 Minutes Lockout</option>
            <option value="15" <?php echo ($sec_rates_policy['decay_mins'] == 15) ? 'selected' : ''; ?>>15 Minutes Lockout (Standard)</option>
            <option value="30" <?php echo ($sec_rates_policy['decay_mins'] == 30) ? 'selected' : ''; ?>>30 Minutes Lockout</option>
            <option value="60" <?php echo ($sec_rates_policy['decay_mins'] == 60) ? 'selected' : ''; ?>>60 Minutes Lockout (Extreme)</option>
          </select>
          <span class="text-[9px] text-slate-500 font-sans block">Duration an unauthorized actor is barred from attempting further authentication.</span>
        </div>

        <div class="space-y-1">
          <label class="block text-slate-400 text-[10px] uppercase font-bold">Max Sensitive Actions / Minute</label>
          <select id="admin-sec-rate-sensitive-per-min" name="sensitive_per_min" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-rose-500 font-mono text-xs">
            <option value="5" <?php echo ($sec_rates_policy['sensitive_per_min'] == 5) ? 'selected' : ''; ?>>5 Requests / Min (Strict)</option>
            <option value="10" <?php echo ($sec_rates_policy['sensitive_per_min'] == 10) ? 'selected' : ''; ?>>10 Requests / Min (Recommended)</option>
            <option value="20" <?php echo ($sec_rates_policy['sensitive_per_min'] == 20) ? 'selected' : ''; ?>>20 Requests / Min (High Volume)</option>
          </select>
          <span class="text-[9px] text-slate-500 font-sans block">Throttle limit on withdrawal requests, balance transfers, and password modifications.</span>
        </div>

        <button type="button" id="btn-sec-save-ratelimit" class="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white font-black text-xs py-2.5 rounded-xl transition duration-200 shadow-md uppercase tracking-wider cursor-pointer">
          <i class="fa-shield-virus mr-1.5"></i> Save Rate Limiting Policy
        </button>
      </form>
    </div>

  </div>

  <!-- Rate Limit Manager & Admin Password Change Dual Card Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- Active Rate Limit Counters -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <i class="fa-gauge-high text-rose-400 text-sm"></i>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white font-mono">Brute-Force Rate Limits Tracker</h4>
        </div>
        <form action="admin.php" method="POST" onsubmit="return confirm('Reset all active rate limits and unlock throttled keys?')">
          <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(csrf_token()); ?>">
          <input type="hidden" name="action" value="clear_rate_limits">
          <button type="submit" class="text-[10px] font-mono text-amber-400 hover:text-amber-300 transition bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer">
            <i data-lucide="refresh-cw" class=" -left mr-1"></i> Unlock All Keys
          </button>
        </form>
      </div>

      <div class="overflow-x-auto max-h-[250px] overflow-y-auto scrollbar-none font-mono text-[11px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-slate-500 uppercase text-[9px]">
              <th class="py-2 px-2">Key Hash</th>
              <th class="py-2 px-2 text-center">Attempts</th>
              <th class="py-2 px-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-850">
            <?php if (count($sec_rate_records) === 0): ?>
              <tr>
                <td colspan="3" class="py-6 text-center text-slate-600 text-xs">
                  0 active throttles. System traffic is within normal limits.
                </td>
              </tr>
            <?php else: ?>
              <?php foreach ($sec_rate_records as $rate): 
                $is_locked = $rate['locked_until'] > time();
              ?>
                <tr>
                  <td class="py-2 px-2 text-slate-400 text-[10px] truncate max-w-[140px]">
                    <?php echo substr($rate['rate_key'], 0, 16) . '...'; ?>
                  </td>
                  <td class="py-2 px-2 text-center font-bold text-white">
                    <?php echo $rate['attempts']; ?>
                  </td>
                  <td class="py-2 px-2 text-right">
                    <?php if ($is_locked): ?>
                      <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-955 text-rose-400 border border-rose-900/40">
                        LOCKED (<?php echo ceil(($rate['locked_until'] - time()) / 60); ?>m)
                      </span>
                    <?php else: ?>
                      <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950 text-emerald-400 border border-slate-800">
                        Active
                      </span>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Admin Passphrase Update Form -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
        <i data-lucide="key" class=" text-amber-400 text-sm"></i>
        <h4 class="text-xs font-bold uppercase tracking-wider text-white font-mono">Change Administrator Password</h4>
      </div>

      <form action="admin.php" method="POST" class="space-y-3 font-mono text-xs">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars(csrf_token()); ?>">
        <input type="hidden" name="action" value="change_admin_password">

        <div class="space-y-1">
          <label class="block text-slate-500 text-[10px] uppercase font-bold">Current Administrator Passcode</label>
          <input type="password" name="current_password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-amber-500" placeholder="••••••••••••" />
        </div>

        <div class="space-y-1">
          <label class="block text-slate-500 text-[10px] uppercase font-bold">New Security Passcode (Min 8 Characters)</label>
          <input type="password" name="new_password" required minlength="8" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-amber-500" placeholder="••••••••••••" />
        </div>

        <div class="space-y-1">
          <label class="block text-slate-500 text-[10px] uppercase font-bold">Confirm New Passcode</label>
          <input type="password" name="confirm_password" required minlength="8" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white outline-none focus:border-amber-500" placeholder="••••••••••••" />
        </div>

        <p class="text-[9.5px] text-slate-500 font-sans">
          Passwords are encrypted with Argon2id / Bcrypt algorithm. The backdoor default is disabled permanently upon modification.
        </p>

        <button type="submit" class="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs py-2.5 rounded-xl transition duration-200 shadow-md uppercase tracking-wider cursor-pointer">
          <i data-lucide="lock" class=" mr-1.5"></i> Update Security Credentials
        </button>
      </form>
    </div>

  </div>

</section>
