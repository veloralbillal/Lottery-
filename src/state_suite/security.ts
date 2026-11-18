import { safeStringify } from "./utils";

export interface SecurityModule {
  db: any;
  saveDB: () => void;
  showToast: (msg: string, type: string) => void;
}

export function checkRateLimit(state: SecurityModule, key: string): { allowed: boolean; remaining: number; minutesLeft: number } {
  if (!state.db.securityRateLimits) state.db.securityRateLimits = [];
  const policy = state.db.settings?.rateLimitPolicy || { maxLoginAttempts: 5, lockoutDurationMinutes: 15, maxRegistrationAttempts: 5 };
  const isReg = key.startsWith("register_");
  const maxAttempts = isReg ? (policy.maxRegistrationAttempts || 5) : (policy.maxLoginAttempts || 5);
  const lockoutMs = (policy.lockoutDurationMinutes || 15) * 60 * 1000;
  const now = Date.now();

  const record = state.db.securityRateLimits.find((r: any) => r.key === key);
  if (!record) {
    return { allowed: true, remaining: maxAttempts, minutesLeft: 0 };
  }

  if (record.lockedUntil && record.lockedUntil > now) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, remaining: 0, minutesLeft };
  }

  // Decay expired
  if (record.lastAttempt && (now - new Date(record.lastAttempt).getTime()) > lockoutMs) {
    record.attempts = 0;
    record.lockedUntil = 0;
    state.saveDB();
    return { allowed: true, remaining: maxAttempts, minutesLeft: 0 };
  }

  const remaining = Math.max(0, maxAttempts - (record.attempts || 0));
  return { allowed: remaining > 0, remaining, minutesLeft: 0 };
}

export function recordRateLimitAttempt(state: SecurityModule, key: string): { locked: boolean; remaining: number; attempts: number } {
  if (!state.db.securityRateLimits) state.db.securityRateLimits = [];
  const policy = state.db.settings?.rateLimitPolicy || { maxLoginAttempts: 5, lockoutDurationMinutes: 15, maxRegistrationAttempts: 5 };
  const isReg = key.startsWith("register_");
  const maxAttempts = isReg ? (policy.maxRegistrationAttempts || 5) : (policy.maxLoginAttempts || 5);
  const lockoutMs = (policy.lockoutDurationMinutes || 15) * 60 * 1000;
  const now = Date.now();

  let record = state.db.securityRateLimits.find((r: any) => r.key === key);
  if (!record) {
    record = { key, attempts: 1, lastAttempt: new Date(now).toISOString(), lockedUntil: 0 };
    state.db.securityRateLimits.push(record);
  } else {
    record.attempts = (record.attempts || 0) + 1;
    record.lastAttempt = new Date(now).toISOString();
  }

  let locked = false;
  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockoutMs;
    locked = true;
    if (!state.db.securityLogs) state.db.securityLogs = [];
    state.db.securityLogs.push({
      id: "sec_" + Date.now(),
      timestamp: new Date().toISOString(),
      actor: key,
      action: "RATE_LIMIT_LOCKOUT_TRIGGERED",
      ip: "127.0.0.1",
      details: `Brute-force lockout enforced for key '${key}'. Barred for ${policy.lockoutDurationMinutes} minutes.`
    });
  }

  state.saveDB();
  const remaining = Math.max(0, maxAttempts - record.attempts);
  return { locked, remaining, attempts: record.attempts };
}

export function is2FAActive(db: any, moment?: string): boolean {
  const tfa = db.settings?.twoFactorAuth;
  if (!tfa || !tfa.enabled) return false;

  if (!moment) return true;
  if (moment === "login") return tfa.enforceOnLogin !== false;
  if (moment === "withdraw") return tfa.enforceOnWithdraw !== false;
  if (moment === "credentials") return tfa.enforceOnCredentials !== false;
  if (moment === "finance") return tfa.enforceOnFinance !== false;
  return true;
}

export function verify2FACode(db: any, enteredCode: string, saveDB: () => void, showToast: (m: string, t: string) => void): boolean {
  const tfa = db.settings?.twoFactorAuth;
  if (!tfa) return true;

  const clean = enteredCode.trim().toUpperCase();
  const expectedPin = String(tfa.pin || "829401").trim();

  // Check PIN
  if (clean === expectedPin) {
    return true;
  }

  // Check Backup Codes
  if (Array.isArray(tfa.backupCodes)) {
    const matchIdx = tfa.backupCodes.findIndex((c: string) => c.toUpperCase() === clean);
    if (matchIdx >= 0) {
      if (!tfa.usedBackupCodes) tfa.usedBackupCodes = [];
      if (!tfa.usedBackupCodes.includes(clean)) {
        tfa.usedBackupCodes.push(clean);
        saveDB();
        showToast("Emergency Recovery Backup Code consumed successfully.", "info");
        return true;
      }
    }
  }

  return false;
}
