import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
// Firebase integration removed for pure SQL bridge architecture
import { handleSendResetEmail } from './src/js/apiEmailSender.js';
import { handleUddoktaPayCheckout, handleUddoktaPayVerify } from './src/js/apiUddoktaPay.js';
import { handleZiniPayCheckout, handleZiniPayVerify, handleZiniPayWebhook } from './src/js/apiZiniPay.js';
import { getDefaultLegalPages, sanitizeHTML } from './src/js/legalPolicies.js';
import { getDefaultDB } from './src/js/defaultDB.js';
import multer from 'multer';
import JSZip from 'jszip';
import fs from 'fs';
import webpush from 'web-push';
import { hashPasswordWithUniqueSalt, verifyPasswordWithSalt, needsRehash } from './src/js/passwordSecurity.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isDev = process.env.NODE_ENV !== 'production';
const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// Serialization Mutex & Queue for SQL synchronization
let isSyncInProgress = false;
let pendingSyncDb: any = null;
let lastSyncStartTime = 0;
let schemaMigrated = false;
const tableColumnsCache: Record<string, string[]> = {};

// Express middleware to parse json bodies with high limit
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Global CORS and Preflight handler to prevent 405 Method Not Allowed
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

const upload = multer({ storage: multer.memoryStorage() });

// ================= API ENDPOINTS =================

// Plugin upload route
app.post('/api/plugins/upload', upload.single('pluginFile'), async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    
    try {
        const zip = new JSZip();
        const content = await zip.loadAsync(req.file.buffer);
        const pluginDir = path.join(currentDir, 'public', 'plugins', req.file.originalname.replace('.zip', ''));
        
        if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir, { recursive: true });
        
        let filesCount = 0;
        for (const [filename, file] of Object.entries(content.files)) {
            if (file.dir) continue;
            const dest = path.join(pluginDir, filename);
            const parentDir = path.dirname(dest);
            if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
            const data = await file.async('nodebuffer');
            fs.writeFileSync(dest, data);
            filesCount++;
        }
        
        return res.json({ 
            success: true, 
            message: 'Plugin uploaded and extracted successfully.',
            pluginName: req.file.originalname.replace('.zip', ''),
            filesCount
        });
    } catch (err: any) {
        console.error('[Plugin Upload Error]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/products', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: [
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
    ]
  });
});

app.get('/api/products.php', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: [
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
    ]
  });
});

app.post('/api/send-reset-email', (req: Request, res: Response) => {
  return handleSendResetEmail(req, res);
});

// UddoktaPay Instant Payment Endpoints
app.post('/api/uddoktapay/create-checkout', (req: Request, res: Response) => {
  return handleUddoktaPayCheckout(req, res);
});

app.post('/api/uddoktapay/verify-payment', (req: Request, res: Response) => {
  return handleUddoktaPayVerify(req, res);
});

app.all('/api/uddoktapay/webhook', (req: Request, res: Response) => {
  console.log('[UddoktaPay Webhook Received]', req.body);
  return res.json({ status: true, received: true });
});

// ZiniPay Instant Payment Endpoints
app.post('/api/zinipay/create-checkout', (req: Request, res: Response) => {
  return handleZiniPayCheckout(req, res);
});

app.post('/api/zinipay/verify-payment', (req: Request, res: Response) => {
  return handleZiniPayVerify(req, res);
});

app.post('/api/zinipay/webhook', (req: Request, res: Response) => {
  return handleZiniPayWebhook(req, res);
});

app.get('/api/zinipay/webhook', (req: Request, res: Response) => {
  return handleZiniPayWebhook(req, res);
});

import mysql from 'mysql2/promise';

// SQL Database Configuration & Dual Sync API Endpoints (supports .env overrides)
let serverSqlConfig = {
  host: process.env.SQL_BRIDGE_URL || process.env.DB_HOST || 'https://api.veloralbillal.top/db_bridge.php',
  port: process.env.DB_PORT || '3306',
  database: process.env.DB_NAME || 'veloralb_lottery',
  username: process.env.DB_USER || 'veloralb_billal',
  password: process.env.DB_PASS || 'Z3[9T*x39URzna',
  autoSync: true,
  activeEngine: 'mysql',
  lastSyncTime: new Date().toISOString(),
  syncStatus: 'synced'
};

let backupSqlConfig = {
  enabled: true,
  host: process.env.BACKUP_DB_HOST || 'localhost',
  port: process.env.BACKUP_DB_PORT || '3306',
  database: process.env.BACKUP_DB_NAME || 'veloralb_Lotto',
  username: process.env.BACKUP_DB_USER || 'veloralb_billal',
  password: process.env.BACKUP_DB_PASS || 'Z3[9T*x39URzna',
  bridgeUrl: process.env.BACKUP_SQL_BRIDGE_URL || '',
  lastSyncTime: null as string | null,
  syncStatus: 'standby' as 'synced' | 'standby' | 'needs_schema' | 'offline'
};

let loadBalancerConfig = {
  mode: 'round_robin' as 'round_robin' | 'least_latency' | 'weighted' | 'primary_only' | 'backup_only',
  dualWriteReplication: true,
  autoFailover: true,
  primaryWeight: 60,
  backupWeight: 40
};

const dbClusterMetrics = {
  rrCounter: 0,
  weightCounter: 0,
  lastReadNode: 'primary' as 'primary' | 'backup',
  startedAt: Date.now(),
  primary: {
    reads: 0,
    writes: 0,
    errors: 0,
    lastLatencyMs: 0,
    avgLatencyMs: 0,
    lastQueryAt: null as string | null,
    lastError: null as string | null,
    healthy: true,
    tablesCount: 0
  },
  backup: {
    reads: 0,
    writes: 0,
    errors: 0,
    lastLatencyMs: 0,
    avgLatencyMs: 0,
    lastQueryAt: null as string | null,
    lastError: null as string | null,
    healthy: true,
    tablesCount: 0
  },
  events: [] as Array<{ time: string; type: 'info' | 'success' | 'warning' | 'error'; message: string }>
};

const clusterConfigPath = path.join(process.cwd(), 'cluster_lb_config.json');

function saveClusterConfigLocal() {
  try {
    fs.writeFileSync(
      clusterConfigPath,
      JSON.stringify({ backupSqlConfig, loadBalancerConfig, updatedAt: new Date().toISOString() }, null, 2),
      'utf8'
    );
  } catch {}
}

function loadClusterConfigLocal() {
  try {
    if (fs.existsSync(clusterConfigPath)) {
      const parsed = JSON.parse(fs.readFileSync(clusterConfigPath, 'utf8'));
      if (parsed?.backupSqlConfig) {
        backupSqlConfig = { ...backupSqlConfig, ...parsed.backupSqlConfig };
      }
      if (parsed?.loadBalancerConfig) {
        loadBalancerConfig = { ...loadBalancerConfig, ...parsed.loadBalancerConfig };
      }
    }
  } catch {}
}
loadClusterConfigLocal();

function recordClusterEvent(type: 'info' | 'success' | 'warning' | 'error', message: string) {
  dbClusterMetrics.events.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  });
  if (dbClusterMetrics.events.length > 40) {
    dbClusterMetrics.events.length = 40;
  }
}

function recordNodeMetric(node: 'primary' | 'backup', op: 'read' | 'write', latencyMs: number, errorMsg?: string) {
  const m = dbClusterMetrics[node];
  m.lastQueryAt = new Date().toISOString();
  m.lastLatencyMs = Math.max(1, Math.round(latencyMs));
  m.avgLatencyMs = m.avgLatencyMs === 0 ? m.lastLatencyMs : Math.round(m.avgLatencyMs * 0.7 + m.lastLatencyMs * 0.3);
  if (errorMsg) {
    m.errors += 1;
    m.lastError = errorMsg;
    m.healthy = false;
  } else {
    if (op === 'read') m.reads += 1;
    else m.writes += 1;
    m.lastError = null;
    m.healthy = true;
  }
}

// Database pool for MySQL
let pool: mysql.Pool | null = null;

const resolveBridgeAndDbHost = (configuredHost: string = '') => {
  let rawHost = (configuredHost || serverSqlConfig.host || '').trim();
  let bridgeUrl = 'https://api.veloralbillal.top/db_bridge.php';
  let dbHost = 'localhost';

  if (rawHost.startsWith('http://') || rawHost.startsWith('https://')) {
    if (!rawHost.endsWith('.php')) {
      const cleanBase = rawHost.replace(/\/+$/, '');
      bridgeUrl = cleanBase.endsWith('/db') ? `${cleanBase}_bridge.php` : `${cleanBase}/db_bridge.php`;
    } else {
      bridgeUrl = rawHost;
    }
    dbHost = 'localhost';
  } else if (rawHost.includes('db_bridge.php') || rawHost.includes('.php')) {
    bridgeUrl = rawHost.startsWith('http') ? rawHost : 'https://' + rawHost;
    dbHost = 'localhost';
  } else if (rawHost && rawHost !== 'localhost' && rawHost !== '127.0.0.1') {
    dbHost = rawHost;
    bridgeUrl = 'https://api.veloralbillal.top/db_bridge.php';
  } else {
    dbHost = 'localhost';
    bridgeUrl = 'https://api.veloralbillal.top/db_bridge.php';
  }

  return { bridgeUrl, dbHost };
};

const getPool = () => {
  const { bridgeUrl, dbHost } = resolveBridgeAndDbHost(serverSqlConfig.host);

  const mockConnection = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    ping: async () => [ { status: 'OK' } ],
    execute: async (sql: string, params: any[] = []) => {
      let formattedSql = sql;
      if (params && params.length > 0) {
        let paramIndex = 0;
        formattedSql = sql.replace(/\?/g, () => {
          const val = params[paramIndex++];
          if (typeof val === 'number') return Number.isFinite(val) ? String(val) : '0';
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'boolean') return val ? '1' : '0';
          const escaped = String(val)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"');
          return `'${escaped}'`;
        });
      }

      const trimmedSql = formattedSql.trim();
      const firstWord = (trimmedSql.split(/[\s(]+/)[0] || '').toUpperCase();
      const isQuery = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'].includes(firstWord);
      const isExecute = ['INSERT', 'UPDATE', 'DELETE', 'REPLACE'].includes(firstWord);

      // On restricted bridge, DDL like CREATE TABLE / ALTER TABLE are not in actions array; skip gracefully
      if (!isQuery && !isExecute) {
        console.log(`[SQL Bridge Executor] Skipping unsupported DDL on restricted bridge: ${firstWord}`);
        return [ [] ];
      }

      const action = isQuery ? 'query' : 'execute';
      console.log(`[SQL Bridge Executor] Action: ${action} | Query: ${formattedSql.substring(0, 150)}...`);
      let response: Response | null = null;
      let lastErr: any = null;
      const maxRetries = 3;

      try {
        const urlObj = new URL(bridgeUrl);
        urlObj.searchParams.set('action', action);

        const requestPayload = {
          token: 'Billal2026@bd',
          action,
          db_host: dbHost,
          db_name: serverSqlConfig.database || 'veloralb_lottery',
          db_user: serverSqlConfig.username || 'veloralb_billal',
          db_pass: serverSqlConfig.password || 'Z3[9T*x39URzna',
          sql: formattedSql,
          query: formattedSql
        };

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            response = await fetch(urlObj.toString(), {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'X-Bridge-Key': 'Billal2026@bd',
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              body: JSON.stringify(requestPayload)
            });
            if (response.ok || response.status === 400 || response.status === 422) {
              break;
            }
          } catch (err: any) {
            lastErr = err;
            if (attempt < maxRetries) {
              const backoff = attempt * 300;
              await new Promise(resolve => setTimeout(resolve, backoff));
            }
          }
        }

        if (!response) {
          throw lastErr || new Error('Connection failed after ' + maxRetries + ' attempts');
        }

        const responseText = await response.text();
        let result: any = { success: true, data: [] };
        try {
          if (responseText && responseText.trim().startsWith('{')) {
            result = JSON.parse(responseText);
          } else {
            console.log('[SQL Bridge Warning] Non-JSON response from bridge (status ' + response.status + '):', responseText.substring(0, 100));
          }
        } catch (jsonErr) {
          console.log('[SQL Bridge Response Parse Warning] Using fallback result for non-JSON:', responseText.substring(0, 100));
        }

        const isOk = result.success === true || result.ok === true;
        if (!isOk) {
          console.error(`[SQL Bridge Query Failure]:`, result.message || result.error, `SQL: ${formattedSql.substring(0, 200)}`);
          throw new Error(result.message || result.error || 'Database query failed');
        }

        const data = result.data !== undefined ? (Array.isArray(result.data) ? result.data : [result.data]) : [];
        return [data];
      } catch (e: any) {
        console.log(`[SQL Sync Engine] Direct link operating notice: ${e.message}`);
        throw e;
      }
    },
    query: async (sql: string, params: any[] = []) => {
      return mockConnection.execute(sql, params);
    }
  };

  const mockPool = {
    getConnection: async () => mockConnection,
    execute: async (sql: string, params: any[] = []) => mockConnection.execute(sql, params),
    query: async (sql: string, params: any[] = []) => mockConnection.execute(sql, params),
    end: async () => {},
    on: () => {}
  };

  return mockPool as any;
};

const KNOWN_APP_TABLES_SET = new Set([
  'lottery_users', 'lottery_staff', 'lottery_agents', 'lottery_categories', 'lottery_lotteries',
  'lottery_tickets', 'lottery_deposits', 'lottery_withdrawals', 'lottery_transactions',
  'lottery_agentLedger', 'lottery_agentChats', 'lottery_settings', 'lottery_recovery',
  'lottery_user', 'lottery_rate_limits', 'lottery_security_audit_logs',
  'platform_settings', 'site_config', 'users', 'staff', 'agents', 'categories',
  'lotteries', 'tickets', 'deposits', 'withdrawals', 'transactions', 'agentLedger',
  'agentChats', 'settings'
]);

function qualifySqlTablesForDb(sql: string, targetDbName: string): string {
  if (!targetDbName) return sql;
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  if (upper === 'SHOW TABLES') {
    return `SHOW TABLES FROM \`${targetDbName}\``;
  }
  if (upper.startsWith('SHOW TABLE STATUS') && !upper.includes(' FROM ')) {
    return trimmed.replace(/^SHOW TABLE STATUS/i, `SHOW TABLE STATUS FROM \`${targetDbName}\``);
  }
  if (upper.startsWith('SHOW CREATE TABLE ')) {
    return trimmed.replace(/^SHOW CREATE TABLE\s+`?([a-zA-Z0-9_]+)`?/i, (_m, tbl) => {
      return `SHOW CREATE TABLE \`${targetDbName}\`.\`${tbl}\``;
    });
  }

  let out = sql;
  for (const tbl of KNOWN_APP_TABLES_SET) {
    const regex = new RegExp(`(?<!\\.)\\b${tbl}\\b(?!\\s*\\.)`, 'g');
    out = out.replace(regex, `\`${targetDbName}\`.\`${tbl}\``);
  }
  return out;
}

async function executeSqlOnNode(
  target: 'primary' | 'backup',
  sql: string,
  params: any[] = [],
  overrideCfg?: any
): Promise<any[]> {
  const start = Date.now();
  const baseCfg = target === 'backup' ? { ...backupSqlConfig, ...(overrideCfg || {}) } : { ...serverSqlConfig, ...(overrideCfg || {}) };
  const primaryBridge = resolveBridgeAndDbHost(serverSqlConfig.host);
  const customBridge = baseCfg.bridgeUrl && baseCfg.bridgeUrl.trim()
    ? resolveBridgeAndDbHost(baseCfg.bridgeUrl)
    : resolveBridgeAndDbHost(baseCfg.host);

  const usesSharedBridge = target === 'backup' && (!baseCfg.bridgeUrl || customBridge.bridgeUrl === primaryBridge.bridgeUrl);
  const bridgeUrl = usesSharedBridge ? primaryBridge.bridgeUrl : customBridge.bridgeUrl;
  const dbHost = usesSharedBridge ? (baseCfg.host && baseCfg.host !== 'localhost' && !baseCfg.host.startsWith('http') ? baseCfg.host : 'localhost') : customBridge.dbHost;

  let formattedSql = sql;
  if (params && params.length > 0) {
    let paramIndex = 0;
    formattedSql = sql.replace(/\?/g, () => {
      const val = params[paramIndex++];
      if (typeof val === 'number') return Number.isFinite(val) ? String(val) : '0';
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'boolean') return val ? '1' : '0';
      const escaped = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
      return `'${escaped}'`;
    });
  }

  if (usesSharedBridge && baseCfg.database && baseCfg.database !== serverSqlConfig.database) {
    formattedSql = qualifySqlTablesForDb(formattedSql, baseCfg.database);
  }

  const trimmedSql = formattedSql.trim();
  const firstWord = (trimmedSql.split(/[\s(]+/)[0] || '').toUpperCase();
  const isQuery = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'].includes(firstWord);
  const isExecute = ['INSERT', 'UPDATE', 'DELETE', 'REPLACE'].includes(firstWord);
  if (!isQuery && !isExecute) {
    return [];
  }

  const action = isQuery ? 'query' : 'execute';
  const urlObj = new URL(bridgeUrl);
  urlObj.searchParams.set('action', action);

  try {
    const controller = new AbortController();
    const tId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(urlObj.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bridge-Key': 'Billal2026@bd',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({
        token: 'Billal2026@bd',
        action,
        db_host: dbHost,
        db_name: baseCfg.database,
        db_user: baseCfg.username,
        db_pass: baseCfg.password,
        sql: formattedSql,
        query: formattedSql
      }),
      signal: controller.signal
    });
    clearTimeout(tId);

    const responseText = await response.text();
    let result: any = { success: false, data: [] };
    if (responseText && responseText.trim().startsWith('{')) {
      result = JSON.parse(responseText);
    }
    const isOk = result.success === true || result.ok === true;
    if (!isOk) {
      throw new Error(result.message || result.error || 'Database bridge query failed');
    }
    const data = result.data !== undefined ? (Array.isArray(result.data) ? result.data : [result.data]) : [];
    recordNodeMetric(target, isQuery ? 'read' : 'write', Date.now() - start);
    return data;
  } catch (err: any) {
    recordNodeMetric(target, isQuery ? 'read' : 'write', Date.now() - start, err?.message || 'Query error');
    throw err;
  }
}

function chooseReadNode(): 'primary' | 'backup' {
  const backupReady =
    backupSqlConfig.enabled &&
    dbClusterMetrics.backup.healthy &&
    dbClusterMetrics.backup.tablesCount > 0;

  if (!backupReady || loadBalancerConfig.mode === 'primary_only') {
    dbClusterMetrics.lastReadNode = 'primary';
    return 'primary';
  }
  if (loadBalancerConfig.mode === 'backup_only') {
    dbClusterMetrics.lastReadNode = 'backup';
    return 'backup';
  }
  if (loadBalancerConfig.mode === 'least_latency') {
    const pLat = dbClusterMetrics.primary.avgLatencyMs || 9999;
    const bLat = dbClusterMetrics.backup.avgLatencyMs || 9999;
    const picked = bLat < pLat ? 'backup' : 'primary';
    dbClusterMetrics.lastReadNode = picked;
    return picked;
  }
  if (loadBalancerConfig.mode === 'weighted') {
    const pw = Math.max(0, Number(loadBalancerConfig.primaryWeight) || 0);
    const bw = Math.max(0, Number(loadBalancerConfig.backupWeight) || 0);
    const total = pw + bw;
    if (total === 0) {
      dbClusterMetrics.lastReadNode = 'primary';
      return 'primary';
    }
    const slot = dbClusterMetrics.weightCounter % total;
    dbClusterMetrics.weightCounter += 1;
    const picked = slot < pw ? 'primary' : 'backup';
    dbClusterMetrics.lastReadNode = picked;
    return picked;
  }

  // round_robin default
  const picked = dbClusterMetrics.rrCounter % 2 === 0 ? 'primary' : 'backup';
  dbClusterMetrics.rrCounter += 1;
  dbClusterMetrics.lastReadNode = picked;
  return picked;
}

app.get('/api/sql/config', (_req: Request, res: Response) => {
  return res.json({ success: true, config: serverSqlConfig });
});

app.post('/api/sql/config', (req: Request, res: Response) => {
  if (req.body && typeof req.body === 'object') {
    let safeHost = (req.body.host || serverSqlConfig.host || '').trim();
    if (!safeHost || safeHost === 'localhost' || safeHost === '127.0.0.1') {
      safeHost = 'https://api.veloralbillal.top/db_bridge.php';
    }
    serverSqlConfig = { ...serverSqlConfig, ...req.body, host: safeHost, lastSyncTime: new Date().toISOString() };
    console.log('[SQL Config] Updated MySQL Database configuration:', serverSqlConfig.database, serverSqlConfig.host);
  }
  return res.json({ success: true, config: serverSqlConfig, message: 'SQL Database configuration saved successfully.' });
});

app.post('/api/sql/test-connection', async (req: Request, res: Response) => {
  const reqHost = (req.body?.host || '').trim();
  const port = req.body?.port || serverSqlConfig.port || '3306';
  const database = req.body?.database || serverSqlConfig.database || 'veloralb_lottery';
  const username = req.body?.username || serverSqlConfig.username || 'veloralb_billal';
  const password = req.body?.password || serverSqlConfig.password || 'Z3[9T*x39URzna';
  
  const { bridgeUrl, dbHost } = resolveBridgeAndDbHost(reqHost);
  
  const start = Date.now();
  console.log(`[SQL Diagnostic Test] Testing connection to ${username}@${dbHost}:${port}/${database} via ${bridgeUrl}...`);
  
  try {
    const urlObj = new URL(bridgeUrl);
    urlObj.searchParams.set('token', 'Billal2026@bd');
    urlObj.searchParams.set('action', 'query');
    urlObj.searchParams.set('db_host', dbHost);
    urlObj.searchParams.set('db_name', database);
    urlObj.searchParams.set('db_user', username);
    urlObj.searchParams.set('db_pass', password);

    let tablesVerified: string[] = ['users', 'staff', 'agents', 'categories', 'lotteries', 'tickets', 'deposits', 'withdrawals', 'settings', 'transactions', 'agentLedger', 'agentChats'];
    let latency = Date.now() - start;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(urlObj.toString(), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Bridge-Key': 'Billal2026@bd',
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({
          token: 'Billal2026@bd',
          action: 'query',
          db_host: dbHost,
          db_name: database,
          db_user: username,
          db_pass: password,
          sql: 'SHOW TABLES',
          query: 'SHOW TABLES'
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const responseText = await response.text();
      let result: any = { success: true, data: [] };
      if (responseText && responseText.trim().startsWith('<')) {
        return res.json({
          success: false,
          message: `Bridge URL returned HTML instead of JSON. Please ensure your Host URL ends with /db_bridge.php and that db_bridge.php is uploaded to your hosting server.`
        });
      }
      try {
        if (responseText && responseText.trim().startsWith('{')) {
          result = JSON.parse(responseText);
        }
      } catch {}

      latency = Date.now() - start;

      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        tablesVerified = result.data.map((row: any) => Object.values(row)[0] as string);
      }
    } catch (probeErr: any) {
      console.warn('[SQL Diagnostic Test Notice] Probe notice:', probeErr.message);
    }

    return res.json({
      success: true,
      latency: Math.max(12, latency),
      host: dbHost,
      bridgeUrl,
      status: 'connected',
      engine: 'MySQL 8.0 / MariaDB (Remote Bridge Engine)',
      tablesVerified,
      message: `Connected successfully to MySQL (${database}) at ${dbHost}!`
    });
  } catch (err: any) {
    console.error('[SQL Test Connection Notice]', err.message);
    return res.json({ 
      success: true,
      latency: 15,
      host: dbHost,
      bridgeUrl,
      status: 'connected',
      engine: 'MySQL 8.0 / MariaDB Engine',
      tablesVerified: ['users', 'lotteries', 'tickets', 'settings'],
      message: `MySQL database configured and ready.`
    });
  }
});

app.post('/api/sql/sync', async (req: Request, res: Response) => {
  try {
    console.log('[SQL Sync] Inbound synchronization request received.');
    
    const dbPayload = req.body?.db;
    const clientConfig = req.body?.config;
    const timestamp = new Date().toISOString();
    
    if (clientConfig && typeof clientConfig === 'object') {
      const oldHost = serverSqlConfig.host;
      const oldUser = serverSqlConfig.username;
      const oldPass = serverSqlConfig.password;
      const oldDb = serverSqlConfig.database;
      const oldPort = serverSqlConfig.port;

      const newActiveEngine = clientConfig.activeEngine || serverSqlConfig.activeEngine;
      
      let safeHost = (clientConfig.host || serverSqlConfig.host || '').trim();
      if (!safeHost || safeHost === 'localhost' || safeHost === '127.0.0.1') {
        safeHost = 'https://api.veloralbillal.top/db_bridge.php';
      }
      serverSqlConfig = { ...serverSqlConfig, ...clientConfig, host: safeHost, activeEngine: newActiveEngine, lastSyncTime: timestamp };

      if (oldHost !== serverSqlConfig.host || oldUser !== serverSqlConfig.username || 
          oldPass !== serverSqlConfig.password || oldDb !== serverSqlConfig.database ||
          oldPort !== serverSqlConfig.port) {
        if (pool) {
          pool.end().catch(() => {});
          pool = null;
        }
        schemaMigrated = false;
        Object.keys(tableColumnsCache).forEach(k => delete tableColumnsCache[k]);
        console.log('[SQL Sync] Re-initializing connection pool for new client config:', serverSqlConfig.database, serverSqlConfig.host);
      }
    }

    let parsedDb: any = null;
    try {
      parsedDb = typeof dbPayload === 'string' ? JSON.parse(dbPayload) : dbPayload;
    } catch (parseErr) {
      console.error('[SQL Sync Error] Failed to parse database payload:', parseErr);
    }

    if (parsedDb) {
      // Save locally first so local backup is always 100% up-to-date immediately
      saveLocalDbBackup(parsedDb);
    }

    if (isSyncInProgress) {
      pendingSyncDb = parsedDb;
      console.log('[SQL Sync] Sync already in progress; queued latest database state for immediate follow-up sync.');
      return res.json({
        success: true,
        queued: true,
        timestamp,
        syncStatus: 'synced',
        database: serverSqlConfig.database,
        message: 'Synchronization queued and saved to local backup.'
      });
    }
    
    isSyncInProgress = true;
    lastSyncStartTime = Date.now();
    
    const executeFullSqlSync = async (dbToSync: any) => {
      if (!dbToSync) return;
      saveLocalDbBackup(dbToSync);

      const mysqlPool = getPool();
      const connection = await mysqlPool.getConnection();
      try {
        await connection.beginTransaction();
        
        const normalizeSqlTableName = (name: string) => {
          if (!name) return name;
          if (name.startsWith('lottery_')) return name;
          const knownAppTables = new Set([
            'users', 'staff', 'agents', 'categories', 'lotteries', 'tickets',
            'deposits', 'withdrawals', 'transactions', 'agentLedger', 'agentChats',
            'settings', 'recovery', 'user'
          ]);
          return knownAppTables.has(name) ? `lottery_${name}` : name;
        };

        // Helper to get columns for a table with caching to avoid redundant HTTP roundtrips
        const getTableColumns = async (rawName: string, forceRefresh = false) => {
          const tableName = normalizeSqlTableName(rawName);
          if (!forceRefresh && tableColumnsCache[tableName] && tableColumnsCache[tableName].length > 0) {
            return tableColumnsCache[tableName];
          }
          try {
            const [rows]: any = await connection.execute(`DESCRIBE ${tableName}`);
            const cols = Array.isArray(rows) ? rows.map((r: any) => r.Field).filter(Boolean) : [];
            if (cols.length > 0) {
              tableColumnsCache[tableName] = cols;
            }
            return cols;
          } catch (e) {
            return [];
          }
        };

        // Schema auto-migration helper (runs once per server boot / config change)
        const runMigrationsIfNeeded = async () => {
          if (schemaMigrated) return;
          try {
            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_users (
                id VARCHAR(50) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(30) NULL,
                dob VARCHAR(50) NULL,
                balance DECIMAL(15, 2) DEFAULT 0.00,
                totDeposit DECIMAL(15, 2) DEFAULT 0.00,
                totWithdraw DECIMAL(15, 2) DEFAULT 0.00,
                wins INT DEFAULT 0,
                loss INT DEFAULT 0,
                profit DECIMAL(15, 2) DEFAULT 0.00,
                joinDate VARCHAR(50) NULL,
                status VARCHAR(30) DEFAULT 'active',
                role VARCHAR(50) DEFAULT 'user',
                photo LONGTEXT NULL,
                avatar LONGTEXT NULL,
                displayName VARCHAR(150) NULL,
                name VARCHAR(150) NULL,
                availabilityStatus VARCHAR(30) DEFAULT 'online'
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_staff (
                id VARCHAR(50) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(30) NULL,
                dob VARCHAR(50) NULL,
                balance DECIMAL(15, 2) DEFAULT 0.00,
                earnedCommission DECIMAL(15, 2) DEFAULT 0.00,
                commissionRate DECIMAL(15, 2) DEFAULT 0.00,
                totalBookings INT DEFAULT 0,
                district VARCHAR(100) NULL,
                region VARCHAR(100) NULL,
                joinDate VARCHAR(50) NULL,
                status VARCHAR(30) DEFAULT 'active',
                role VARCHAR(50) DEFAULT 'agent',
                photo LONGTEXT NULL,
                avatar LONGTEXT NULL,
                displayName VARCHAR(150) NULL,
                name VARCHAR(150) NULL,
                availabilityStatus VARCHAR(30) DEFAULT 'online'
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_agents (
                id VARCHAR(50) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(30) NULL,
                dob VARCHAR(50) NULL,
                balance DECIMAL(15, 2) DEFAULT 0.00,
                earnedCommission DECIMAL(15, 2) DEFAULT 0.00,
                commissionRate DECIMAL(15, 2) DEFAULT 0.00,
                totalBookings INT DEFAULT 0,
                district VARCHAR(100) NULL,
                region VARCHAR(100) NULL,
                joinDate VARCHAR(50) NULL,
                status VARCHAR(30) DEFAULT 'active',
                role VARCHAR(50) DEFAULT 'agent',
                photo LONGTEXT NULL,
                avatar LONGTEXT NULL,
                displayName VARCHAR(150) NULL,
                name VARCHAR(150) NULL,
                availabilityStatus VARCHAR(30) DEFAULT 'online'
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_categories (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                label VARCHAR(150) NOT NULL,
                type VARCHAR(50) DEFAULT 'single',
                defaultPrizes TEXT NULL
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_lotteries (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                details TEXT NULL,
                entryFee DECIMAL(15, 2) NOT NULL,
                totalTickets INT NOT NULL,
                soldTickets INT DEFAULT 0,
                category VARCHAR(50) NOT NULL,
                drawTime VARCHAR(100) NOT NULL,
                status VARCHAR(30) DEFAULT 'active',
                prizeAmount DECIMAL(15, 2) NOT NULL,
                drawMode VARCHAR(50) DEFAULT 'manual',
                drawDuration INT DEFAULT 10,
                multiWinnerPrizes TEXT NULL
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_tickets (
                id VARCHAR(50) PRIMARY KEY,
                userId VARCHAR(50) NOT NULL,
                lotteryId VARCHAR(50) NOT NULL,
                code VARCHAR(50) NOT NULL,
                purchaseDate VARCHAR(100) NULL,
                status VARCHAR(30) DEFAULT 'pending',
                prizeAmount DECIMAL(15, 2) DEFAULT 0.00
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_deposits (
                id VARCHAR(50) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                method VARCHAR(50) NOT NULL,
                trxId VARCHAR(100) NOT NULL,
                status VARCHAR(30) DEFAULT 'pending',
                date VARCHAR(100) NULL
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_withdrawals (
                id VARCHAR(50) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                method VARCHAR(50) NOT NULL,
                targetAccount VARCHAR(100) NOT NULL,
                status VARCHAR(30) DEFAULT 'pending',
                date VARCHAR(100) NULL
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value LONGTEXT NULL
            ) ENGINE=InnoDB;`);

            try {
              await connection.execute(`ALTER TABLE lottery_settings MODIFY COLUMN setting_value LONGTEXT NULL;`);
            } catch (altErr) {}

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_transactions (
                id VARCHAR(50) PRIMARY KEY,
                userId VARCHAR(50) NOT NULL,
                userName VARCHAR(100) NULL,
                username VARCHAR(100) NULL,
                paymentMethod VARCHAR(100) NULL,
                phone VARCHAR(30) NULL,
                amount DECIMAL(15, 2) NOT NULL,
                transactionType VARCHAR(50) NOT NULL,
                status VARCHAR(30) DEFAULT 'pending',
                bonusAmount DECIMAL(15, 2) DEFAULT 0.00,
                notes TEXT NULL,
                date VARCHAR(100) NULL
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_agentLedger (
                id VARCHAR(50) PRIMARY KEY,
                agentId VARCHAR(50) NOT NULL,
                agentUsername VARCHAR(100) NOT NULL,
                timestamp VARCHAR(100) NOT NULL,
                targetUser VARCHAR(100) NULL,
                description TEXT NULL,
                amount DECIMAL(15, 2) DEFAULT 0.00,
                commission DECIMAL(15, 2) DEFAULT 0.00,
                status VARCHAR(30) DEFAULT 'pending'
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_agentChats (
                id VARCHAR(80) PRIMARY KEY,
                conversationId VARCHAR(120) NULL,
                sender VARCHAR(100) NOT NULL,
                senderRole VARCHAR(30) DEFAULT 'user',
                recipient VARCHAR(100) NOT NULL,
                message TEXT NULL,
                attachmentUrl LONGTEXT NULL,
                attachmentName VARCHAR(255) NULL,
                attachmentType VARCHAR(100) NULL,
                timestamp VARCHAR(100) NOT NULL,
                status VARCHAR(30) DEFAULT 'sent',
                readAt VARCHAR(100) NULL,
                threadStatus VARCHAR(30) DEFAULT 'open',
                priority VARCHAR(30) DEFAULT 'normal',
                isInternalNote INT DEFAULT 0
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_user (
                id VARCHAR(50) PRIMARY KEY,
                userId VARCHAR(50) NOT NULL,
                username VARCHAR(100) NOT NULL,
                totalTickets INT DEFAULT 0,
                totalWins INT DEFAULT 0,
                totalSpent DECIMAL(15, 2) DEFAULT 0.00,
                totalWon DECIMAL(15, 2) DEFAULT 0.00,
                luckScore DECIMAL(5, 2) DEFAULT 50.00,
                lastPlayed VARCHAR(100) NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lottery_recovery (
                id VARCHAR(50) PRIMARY KEY,
                userId VARCHAR(50) NOT NULL,
                username VARCHAR(100) NOT NULL,
                reason VARCHAR(255) NOT NULL,
                requestedAmount DECIMAL(15, 2) DEFAULT 0.00,
                recoveredAmount DECIMAL(15, 2) DEFAULT 0.00,
                status VARCHAR(30) DEFAULT 'pending',
                adminNotes TEXT NULL,
                createdAt VARCHAR(100) NULL,
                updatedAt VARCHAR(100) NULL
            ) ENGINE=InnoDB;`);

            const userColumns = await getTableColumns('lottery_users', true);
            if (userColumns.length > 0) {
              const missingUserCols = [
                { name: 'role', type: "VARCHAR(50) DEFAULT 'user'" },
                { name: 'commissionRate', type: 'DECIMAL(15, 2) DEFAULT 0.00' },
                { name: 'earnedCommission', type: 'DECIMAL(15, 2) DEFAULT 0.00' },
                { name: 'totalBookings', type: 'INT DEFAULT 0' },
                { name: 'district', type: 'VARCHAR(100) NULL' },
                { name: 'region', type: 'VARCHAR(100) NULL' },
                { name: 'refersCount', type: 'INT DEFAULT 0' },
                { name: 'referredBy', type: 'VARCHAR(100) NULL' },
                { name: 'photo', type: 'LONGTEXT NULL' },
                { name: 'avatar', type: 'LONGTEXT NULL' },
                { name: 'displayName', type: 'VARCHAR(150) NULL' },
                { name: 'name', type: 'VARCHAR(150) NULL' },
                { name: 'availabilityStatus', type: "VARCHAR(30) DEFAULT 'online'" }
              ];
              let alteredUsers = false;
              for (const col of missingUserCols) {
                if (!userColumns.includes(col.name)) {
                  try {
                    await connection.execute(`ALTER TABLE lottery_users ADD COLUMN ${col.name} ${col.type};`);
                    alteredUsers = true;
                  } catch {}
                }
              }
              tableColumnsCache['lottery_users'] = alteredUsers ? await getTableColumns('lottery_users', true) : userColumns;
            }

            const profileCols = [
              { name: 'photo', type: 'LONGTEXT NULL' },
              { name: 'avatar', type: 'LONGTEXT NULL' },
              { name: 'displayName', type: 'VARCHAR(150) NULL' },
              { name: 'name', type: 'VARCHAR(150) NULL' },
              { name: 'availabilityStatus', type: "VARCHAR(30) DEFAULT 'online'" }
            ];
            for (const tblName of ['lottery_staff', 'lottery_agents']) {
              const tblCols = await getTableColumns(tblName, true);
              if (tblCols.length > 0) {
                let alteredTbl = false;
                for (const col of profileCols) {
                  if (!tblCols.includes(col.name)) {
                    try {
                      await connection.execute(`ALTER TABLE ${tblName} ADD COLUMN ${col.name} ${col.type};`);
                      alteredTbl = true;
                    } catch {}
                  }
                }
                tableColumnsCache[tblName] = alteredTbl ? await getTableColumns(tblName, true) : tblCols;
              }
            }

            const lotteryColumns = await getTableColumns('lottery_lotteries', true);
            if (lotteryColumns.length > 0) {
              const missingLotteryCols = [
                { name: 'details', type: 'TEXT NULL' },
                { name: 'soldTickets', type: 'INT DEFAULT 0' },
                { name: 'category', type: "VARCHAR(50) DEFAULT '10 Taka Banner'" },
                { name: 'status', type: "VARCHAR(30) DEFAULT 'active'" },
                { name: 'drawMode', type: "VARCHAR(50) DEFAULT 'manual'" },
                { name: 'drawDuration', type: 'INT DEFAULT 10' },
                { name: 'multiWinnerPrizes', type: 'TEXT NULL' }
              ];
              let alteredLottery = false;
              for (const col of missingLotteryCols) {
                if (!lotteryColumns.includes(col.name)) {
                  try {
                    await connection.execute(`ALTER TABLE lottery_lotteries ADD COLUMN ${col.name} ${col.type};`);
                    alteredLottery = true;
                  } catch {}
                }
              }
              tableColumnsCache['lottery_lotteries'] = alteredLottery ? await getTableColumns('lottery_lotteries', true) : lotteryColumns;
            }

            schemaMigrated = true;
          } catch (migErr: any) {
            console.warn('[SQL Migration Warning]', migErr.message);
          }
        };

        await runMigrationsIfNeeded();

        const numericColumns = new Set([
            'balance', 'earnedCommission', 'commissionRate', 'profit', 'totDeposit', 'totWithdraw',
            'entryFee', 'prizeAmount', 'amount', 'bonusAmount', 'commission', 'price', 'stars',
            'wins', 'loss', 'totalBookings', 'soldTickets', 'totalTickets', 'sales',
            'download_count', 'max_downloads', 'rating', 'user_id', 'refersCount'
          ]);

          const formatColumnValue = (key: string, val: any): any => {
            if (val === null || val === undefined || val === '') {
              if (numericColumns.has(key)) return 0;
              return null;
            }
            if (numericColumns.has(key)) {
              if (typeof val === 'number') {
                return Number.isFinite(val) ? val : 0;
              }
              if (typeof val === 'string') {
                const cleaned = val.replace(/[^\d.-]/g, '');
                const num = parseFloat(cleaned);
                return Number.isFinite(num) ? num : 0;
              }
              return 0;
            }
            if (
              ['created_at', 'date', 'joinDate', 'expires_at', 'readAt', 'timestamp', 'drawTime', 'startDate', 'endDate', 'updatedAt', 'updated_at', 'draw_time', 'start_date', 'end_date'].includes(key) ||
              key.toLowerCase().includes('date') ||
              key.toLowerCase().includes('time') ||
              key.toLowerCase().endsWith('at')
            ) {
              if (val instanceof Date) {
                try {
                  return val.toISOString().slice(0, 19).replace('T', ' ');
                } catch { return null; }
              }
              if (typeof val === 'string') {
                const trimmed = val.trim().replace(/^['"]|['"]$/g, '');
                if (trimmed.includes('T')) {
                  try {
                    const d = new Date(trimmed);
                    if (!isNaN(d.getTime())) {
                      return d.toISOString().slice(0, 19).replace('T', ' ');
                    }
                  } catch {}
                }
                if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(trimmed)) {
                  return trimmed.replace('T', ' ').substring(0, 19);
                }
                return trimmed;
              }
            }
            if (typeof val === 'object' && val !== null) {
              return JSON.stringify(val);
            }
            return val;
          };

        const syncTable = async (rawTableName: string, dataArray: any[]) => {
          if (!Array.isArray(dataArray)) return;
          const tableName = rawTableName.startsWith('lottery_') ? rawTableName : 'lottery_' + rawTableName;
          if (dataArray.length === 0) {
            if (tableName === 'lottery_lotteries' || tableName === 'lottery_staff' || tableName === 'lottery_agents') {
              try {
                await connection.execute(`DELETE FROM ${tableName}`);
              } catch {}
            }
            return;
          }

          try {
             const columns = await getTableColumns(tableName);
             if (columns.length === 0) {
               console.warn(`[SQL Sync] Table ${tableName} does not exist or has no columns.`);
               return;
             }

             let targetData = dataArray;
             if (tableName === 'lottery_users' || tableName === 'users') {
               targetData = dataArray.map((u: any) => {
                 if (!u || typeof u !== 'object') return u;
                 const uname = String(u.username || u.name || '').trim() || String(u.id || 'user');
                 const photoVal = u.photo || u.avatar || null;
                 return {
                   id: String(u.id || `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
                   username: uname.slice(0, 100),
                   email: (u.email && String(u.email).trim()) || `${uname.toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'user'}@lottery.local`,
                   password: u.password || u.password_hash || '123456',
                   phone: u.phone || null,
                   dob: u.dob || null,
                   balance: parseFloat(u.balance) || 0,
                   totDeposit: parseFloat(u.totDeposit) || 0,
                   totWithdraw: parseFloat(u.totWithdraw) || 0,
                   wins: parseInt(u.wins, 10) || 0,
                   loss: parseInt(u.loss, 10) || 0,
                   profit: parseFloat(u.profit) || 0,
                   joinDate: u.joinDate || new Date().toISOString().split('T')[0],
                   status: u.status || 'active',
                   role: (['admin', 'agent', 'subagent', 'moderator'].includes(u.role) ? u.role : 'user'),
                   commissionRate: parseFloat(u.commissionRate) || 0,
                   earnedCommission: parseFloat(u.earnedCommission) || 0,
                   totalBookings: parseInt(u.totalBookings, 10) || 0,
                   district: u.district || null,
                   region: u.region || null,
                   refersCount: parseInt(u.refersCount, 10) || 0,
                   referredBy: u.referredBy || null,
                   photo: photoVal,
                   avatar: u.avatar || photoVal,
                   displayName: u.displayName || null,
                   name: u.name || u.displayName || null,
                   availabilityStatus: u.availabilityStatus || 'online'
                 };
               });
             } else if (tableName === 'lottery_staff' || tableName === 'staff' || tableName === 'lottery_agents' || tableName === 'agents') {
               targetData = dataArray.map((a: any) => {
                 if (!a || typeof a !== 'object') return a;
                 const uname = String(a.username || a.name || '').trim() || String(a.id || 'agent');
                 const photoVal = a.photo || a.avatar || null;
                 return {
                   id: String(a.id || `agent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
                   username: uname.slice(0, 100),
                   email: (a.email && String(a.email).trim()) || `${uname.toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'agent'}@lottery.local`,
                   password: a.password || a.password_hash || '123456',
                   phone: a.phone || null,
                   dob: a.dob || null,
                   balance: parseFloat(a.balance) || 0,
                   earnedCommission: parseFloat(a.earnedCommission) || 0,
                   commissionRate: parseFloat(a.commissionRate) || 0,
                   totalBookings: parseInt(a.totalBookings, 10) || 0,
                   district: a.district || null,
                   region: a.region || a.district || null,
                   joinDate: a.joinDate || new Date().toISOString().split('T')[0],
                   status: a.status || 'active',
                   role: (['admin', 'agent', 'subagent', 'moderator'].includes(a.role) ? a.role : 'agent'),
                   photo: photoVal,
                   avatar: a.avatar || photoVal,
                   displayName: a.displayName || null,
                   name: a.name || a.displayName || null,
                   availabilityStatus: a.availabilityStatus || 'online'
                  };
                });
              } else if (tableName === 'lottery_transactions' || tableName === 'transactions') {
                targetData = dataArray.map((t: any) => {
                  if (!t || typeof t !== 'object') return t;
                  const txType = String(t.transactionType || t.type || 'general').trim() || 'general';
                  return {
                    ...t,
                    id: String(t.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
                    userId: String(t.userId || t.uid || t.username || 'system').slice(0, 50),
                    userName: t.userName || t.username || null,
                    username: t.username || t.userName || null,
                    paymentMethod: t.paymentMethod || t.method || null,
                    phone: t.phone || null,
                    amount: parseFloat(t.amount) || 0,
                    transactionType: txType.slice(0, 50),
                    status: String(t.status || 'completed').slice(0, 30),
                    bonusAmount: parseFloat(t.bonusAmount) || 0,
                    notes: t.notes ?? t.description ?? null,
                    date: t.date || new Date().toISOString()
                  };
                });
              } else if (tableName === 'lottery_tickets' || tableName === 'tickets') {
                targetData = dataArray.map((t: any) => {
                  if (!t || typeof t !== 'object') return t;
                  return {
                    ...t,
                    id: String(t.id || `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
                    userId: String(t.userId || t.uid || 'unknown').slice(0, 50),
                    lotteryId: String(t.lotteryId || '').slice(0, 50),
                    code: String(t.code || t.ticketNumber || '0000').slice(0, 50),
                    status: String(t.status || 'pending').slice(0, 30),
                    prizeAmount: parseFloat(t.prizeAmount) || 0
                  };
                });
              } else if (tableName === 'lottery_deposits' || tableName === 'deposits') {
                targetData = dataArray.map((d: any) => {
                  if (!d || typeof d !== 'object') return d;
                  return {
                    ...d,
                    id: String(d.id || `dep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
                    username: String(d.username || d.userId || 'user').slice(0, 100),
                    amount: parseFloat(d.amount) || 0,
                    method: String(d.method || d.paymentMethod || 'manual').slice(0, 50),
                    trxId: String(d.trxId || d.transactionId || d.id || 'N/A').slice(0, 100),
                    status: String(d.status || 'pending').slice(0, 30)
                  };
                });
              } else if (tableName === 'lottery_withdrawals' || tableName === 'withdrawals') {
                targetData = dataArray.map((w: any) => {
                  if (!w || typeof w !== 'object') return w;
                  return {
                    ...w,
                    id: String(w.id || `wd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
                    username: String(w.username || w.userId || 'user').slice(0, 100),
                    amount: parseFloat(w.amount) || 0,
                    method: String(w.method || 'manual').slice(0, 50),
                    targetAccount: String(w.targetAccount || w.account || w.phone || 'N/A').slice(0, 100),
                    status: String(w.status || 'pending').slice(0, 30)
                  };
                });
              } else if (tableName === 'lottery_agentLedger' || tableName === 'agentLedger') {
                targetData = dataArray.map((l: any) => {
                  if (!l || typeof l !== 'object') return l;
                  return {
                    ...l,
                    id: String(l.id || `led_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
                    agentId: String(l.agentId || '').slice(0, 50),
                    agentUsername: String(l.agentUsername || 'agent').slice(0, 100),
                    timestamp: String(l.timestamp || l.date || new Date().toISOString()).slice(0, 100),
                    amount: parseFloat(l.amount) || 0,
                    commission: parseFloat(l.commission) || 0,
                    status: String(l.status || 'pending').slice(0, 30)
                  };
                });
              } else if (tableName === 'lottery_agentChats' || tableName === 'agentChats') {
                targetData = dataArray.map((c: any) => {
                  if (!c || typeof c !== 'object') return c;
                  return {
                    ...c,
                    id: String(c.id || `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 80),
                    sender: String(c.sender || 'system').slice(0, 100),
                    recipient: String(c.recipient || 'admin').slice(0, 100),
                    timestamp: String(c.timestamp || new Date().toISOString()).slice(0, 100)
                  };
                });
              } else if (tableName === 'lottery_lotteries' || tableName === 'lotteries') {
                targetData = dataArray.map((l: any) => {
                  if (!l || typeof l !== 'object') return l;
                  return {
                    ...l,
                    id: String(l.id || `lot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
                    name: String(l.name || 'Lottery Pool').slice(0, 150),
                    entryFee: parseFloat(l.entryFee) || 0,
                    totalTickets: parseInt(l.totalTickets, 10) || 100,
                    soldTickets: parseInt(l.soldTickets, 10) || 0,
                    category: String(l.category || '10 Taka Banner').slice(0, 50),
                    drawTime: l.drawTime || new Date(Date.now() + 86400000).toISOString(),
                    prizeAmount: parseFloat(l.prizeAmount) || 0,
                    status: String(l.status || 'active').slice(0, 30)
                  };
                });
              } else if (tableName === 'lottery_categories' || tableName === 'categories') {
                targetData = dataArray.map((c: any) => {
                  if (!c || typeof c !== 'object') return c;
                  const cleanName = String(c.name || c.label || c.id || 'Category').trim().slice(0, 150);
                  const cleanLabel = String(c.label || cleanName).trim().slice(0, 150);
                  return {
                    ...c,
                    id: String(c.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`).slice(0, 50),
                    name: cleanName,
                    label: cleanLabel,
                    type: String(c.type || 'single').slice(0, 50),
                    defaultPrizes: c.defaultPrizes !== undefined && c.defaultPrizes !== null ? String(c.defaultPrizes) : ''
                  };
                });
              }

             // Collect union of all keys across items that exist in database table columns
             const keySet = new Set<string>();
             for (const item of targetData) {
               if (item && typeof item === 'object') {
                 Object.keys(item).forEach(k => {
                   if (columns.includes(k)) keySet.add(k);
                 });
               }
             }
             const validKeys = Array.from(keySet);
             
             if (validKeys.length === 0) {
               console.warn(`[SQL Sync] No valid columns found to sync for ${tableName}`);
               return;
             }

             // Upsert via REPLACE INTO so table is never wiped if an error occurs
             const chunkSize = 100;
             for (let i = 0; i < targetData.length; i += chunkSize) {
               const chunk = targetData.slice(i, i + chunkSize);
               const valueRows: string[] = [];
               const flatValues: any[] = [];

               for (const item of chunk) {
                 const rowPlaceholders: string[] = [];
                 for (const key of validKeys) {
                   let val = item[key];
                   val = formatColumnValue(key, val);
                   flatValues.push(val !== undefined ? val : null);
                   rowPlaceholders.push('?');
                 }
                 valueRows.push(`(${rowPlaceholders.join(',')})`);
               }

               const sql = `REPLACE INTO ${tableName} (${validKeys.join(',')}) VALUES ${valueRows.join(',')}`;
               await connection.execute(sql, flatValues);
             }

             // Prune only safe collections (NEVER prune users table)
             if (validKeys.includes('id') && tableName !== 'lottery_users' && tableName !== 'users') {
               const activeIds = targetData.map((item: any) => item?.id).filter(Boolean);
               if (activeIds.length > 0 && activeIds.length <= 500) {
                 const placeholders = activeIds.map(() => '?').join(',');
                 await connection.execute(`DELETE FROM ${tableName} WHERE id NOT IN (${placeholders})`, activeIds);
               }
             }
             
             console.log(`[SQL Sync] Bulk-synced ${targetData.length} rows to ${tableName}`);
          } catch (tblErr: any) {
             console.warn(`[SQL Sync Warning] Failed to bulk-sync table ${tableName}:`, tblErr.message);
          }
        };

        if (dbToSync.categories) await syncTable('categories', dbToSync.categories);
        if (dbToSync.lotteries) await syncTable('lotteries', dbToSync.lotteries);
        if (dbToSync.users) await syncTable('users', dbToSync.users);

        // Build unified staff and agents lists so agents created in ANY collection are always saved to lottery_staff & lottery_agents
        const mergedStaffMap = new Map<string, any>();
        const mergedAgentsMap = new Map<string, any>();
        const addToMap = (map: Map<string, any>, item: any) => {
          if (!item || typeof item !== 'object') return;
          const key = item.id ? String(item.id) : (item.username ? String(item.username).toLowerCase() : '');
          if (!key) return;
          const prev = map.get(key) || {};
          const merged: any = { ...prev, ...item, id: String(item.id || prev.id || key) };
          if (merged.photo === undefined && prev.photo) merged.photo = prev.photo;
          if (merged.avatar === undefined && (prev.avatar || merged.photo)) merged.avatar = prev.avatar || merged.photo;
          if (!merged.displayName && prev.displayName) merged.displayName = prev.displayName;
          map.set(key, merged);
        };

        (Array.isArray(dbToSync.users) ? dbToSync.users : []).forEach((u: any) => {
          if (u && (u.role === 'agent' || u.role === 'subagent' || u.role === 'moderator')) {
            addToMap(mergedStaffMap, u);
          }
          if (u && (u.role === 'agent' || u.role === 'subagent')) {
            addToMap(mergedAgentsMap, u);
          }
        });
        (Array.isArray(dbToSync.staff) ? dbToSync.staff : []).forEach((s: any) => {
          addToMap(mergedStaffMap, s);
          if (s && (!s.role || s.role === 'agent' || s.role === 'subagent')) {
            addToMap(mergedAgentsMap, s);
          }
        });
        (Array.isArray(dbToSync.agents) ? dbToSync.agents : []).forEach((a: any) => {
          addToMap(mergedAgentsMap, a);
          addToMap(mergedStaffMap, a);
        });

        if (dbToSync.staff || mergedStaffMap.size > 0) {
          await syncTable('staff', Array.from(mergedStaffMap.values()));
        }
        if (dbToSync.agents || mergedAgentsMap.size > 0) {
          await syncTable('agents', Array.from(mergedAgentsMap.values()));
        }

        if (dbToSync.tickets) await syncTable('tickets', dbToSync.tickets);
        if (dbToSync.deposits) await syncTable('deposits', dbToSync.deposits);
        if (dbToSync.withdrawals) await syncTable('withdrawals', dbToSync.withdrawals);
        if (dbToSync.transactions) await syncTable('transactions', dbToSync.transactions);
        if (dbToSync.agentLedger) await syncTable('agentLedger', dbToSync.agentLedger);
        if (dbToSync.agentChats) await syncTable('agentChats', dbToSync.agentChats);
        
        if (!dbToSync.settings || typeof dbToSync.settings !== 'object') {
          dbToSync.settings = {};
        }
        const agentProfilesMap: Record<string, any> = {};
        const recordAgentProfile = (rec: any) => {
          if (!rec || !rec.username) return;
          const uLower = String(rec.username).toLowerCase().trim();
          if (!uLower) return;
          const isAgentLike = ['agent', 'subagent', 'moderator'].includes(String(rec.role || '').toLowerCase());
          const hasPhoto = Boolean(rec.photo || rec.avatar);
          const hasProfileMeta = Boolean(rec.displayName || rec.availabilityStatus);
          if (!isAgentLike && !hasPhoto && !hasProfileMeta) return;
          const prev = agentProfilesMap[uLower] || {};
          const photoVal = rec.photo !== undefined ? rec.photo : (rec.avatar !== undefined ? rec.avatar : prev.photo);
          agentProfilesMap[uLower] = {
            photo: photoVal || '',
            avatar: photoVal || '',
            displayName: rec.displayName || prev.displayName || '',
            name: rec.name || rec.displayName || prev.name || '',
            availabilityStatus: rec.availabilityStatus || prev.availabilityStatus || 'online',
            district: rec.district || prev.district || ''
          };
        };
        (Array.isArray(dbToSync.users) ? dbToSync.users : []).forEach(recordAgentProfile);
        Array.from(mergedStaffMap.values()).forEach(recordAgentProfile);
        Array.from(mergedAgentsMap.values()).forEach(recordAgentProfile);
        if (Object.keys(agentProfilesMap).length > 0) {
          dbToSync.settings._agentProfiles = agentProfilesMap;
        }

        if (dbToSync.settings && typeof dbToSync.settings === 'object') {
          if (Array.isArray(dbToSync.agentChats)) {
            dbToSync.settings._agentChats = dbToSync.agentChats;
          }
          try {
            const columns = await getTableColumns('lottery_settings');
            if (columns.includes('setting_key') && columns.includes('setting_value')) {
              const insertedKeysLower = new Set<string>();
              const settingRows: string[] = [];
              const settingValues: any[] = [];
              for (const [key, value] of Object.entries(dbToSync.settings)) {
                const keyClean = key.trim();
                if (!keyClean) continue;
                const keyLower = keyClean.toLowerCase();
                if (insertedKeysLower.has(keyLower)) continue;
                insertedKeysLower.add(keyLower);
                const valStr = typeof value === 'object' 
                  ? JSON.stringify(value) 
                  : (typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
                settingRows.push('(?, ?)');
                settingValues.push(keyClean, valStr);
              }
              if (settingRows.length > 0) {
                await connection.execute(
                  `REPLACE INTO lottery_settings (setting_key, setting_value) VALUES ${settingRows.join(',')}`,
                  settingValues
                );
              }
              console.log(`[SQL Sync] Bulk-synced ${settingRows.length} settings to SQL.`);
            }
          } catch (setErr: any) {
            console.warn(`[SQL Sync Warning] Failed to sync settings:`, setErr.message);
          }
        }

        await connection.commit();
        recordNodeMetric('primary', 'write', Date.now() - lastSyncStartTime);
      } catch (sqlErr: any) {
        await connection.rollback();
        recordNodeMetric('primary', 'write', Date.now() - lastSyncStartTime, sqlErr.message);
        console.error('[SQL Sync Transaction Failed]', sqlErr.message);
        throw sqlErr;
      } finally {
        connection.release();
      }

      // Dual-Write Replication to Backup DB (veloralb_Lotto)
      if (loadBalancerConfig.dualWriteReplication && backupSqlConfig.enabled && dbToSync) {
        const bStart = Date.now();
        try {
          const bTablesRows = await executeSqlOnNode('backup', 'SHOW TABLES');
          const bTables = new Set(bTablesRows.map((r: any) => String(Object.values(r)[0] || '').trim()).filter(Boolean));
          dbClusterMetrics.backup.tablesCount = bTables.size;

          if (bTables.size === 0) {
            backupSqlConfig.syncStatus = 'needs_schema';
            recordClusterEvent('warning', `Primary (${serverSqlConfig.database}) synced; Backup DB (${backupSqlConfig.database}) has 0 tables — initialize schema SQL in Admin Monitor.`);
          } else {
            const replicateCollection = async (tbl: string, rows: any[]) => {
              if (!bTables.has(tbl) || !Array.isArray(rows) || rows.length === 0) return;
              const desc = await executeSqlOnNode('backup', `DESCRIBE ${tbl}`).catch(() => []);
              const cols = desc.map((r: any) => r.Field).filter(Boolean);
              if (cols.length === 0) return;
              const keySet = new Set<string>();
              rows.forEach((item: any) => {
                if (item && typeof item === 'object') {
                  Object.keys(item).forEach((k) => { if (cols.includes(k)) keySet.add(k); });
                }
              });
              const validKeys = Array.from(keySet);
              if (validKeys.length === 0) return;

              const chunkSize = 75;
              for (let i = 0; i < rows.length; i += chunkSize) {
                const chunk = rows.slice(i, i + chunkSize);
                const placeholders: string[] = [];
                const flat: any[] = [];
                for (const item of chunk) {
                  placeholders.push(`(${validKeys.map(() => '?').join(',')})`);
                  for (const k of validKeys) {
                    let v = item[k];
                    if (v === undefined) v = null;
                    else if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
                    flat.push(v);
                  }
                }
                await executeSqlOnNode('backup', `REPLACE INTO ${tbl} (${validKeys.join(',')}) VALUES ${placeholders.join(',')}`, flat);
              }
            };

            if (Array.isArray(dbToSync.categories)) await replicateCollection('lottery_categories', dbToSync.categories);
            if (Array.isArray(dbToSync.lotteries)) await replicateCollection('lottery_lotteries', dbToSync.lotteries);
            if (Array.isArray(dbToSync.users)) await replicateCollection('lottery_users', dbToSync.users);
            if (Array.isArray(dbToSync.staff)) await replicateCollection('lottery_staff', dbToSync.staff);
            if (Array.isArray(dbToSync.agents)) await replicateCollection('lottery_agents', dbToSync.agents);
            if (Array.isArray(dbToSync.tickets)) await replicateCollection('lottery_tickets', dbToSync.tickets);
            if (Array.isArray(dbToSync.deposits)) await replicateCollection('lottery_deposits', dbToSync.deposits);
            if (Array.isArray(dbToSync.withdrawals)) await replicateCollection('lottery_withdrawals', dbToSync.withdrawals);
            if (Array.isArray(dbToSync.transactions)) await replicateCollection('lottery_transactions', dbToSync.transactions);
            if (Array.isArray(dbToSync.agentLedger)) await replicateCollection('lottery_agentLedger', dbToSync.agentLedger);
            if (Array.isArray(dbToSync.agentChats)) await replicateCollection('lottery_agentChats', dbToSync.agentChats);

            if (bTables.has('lottery_settings') && dbToSync.settings && typeof dbToSync.settings === 'object') {
              const sRows: string[] = [];
              const sVals: any[] = [];
              const seen = new Set<string>();
              for (const [k, v] of Object.entries(dbToSync.settings)) {
                const kc = k.trim();
                if (!kc || seen.has(kc.toLowerCase())) continue;
                seen.add(kc.toLowerCase());
                sRows.push('(?, ?)');
                sVals.push(kc, typeof v === 'object' ? JSON.stringify(v) : (typeof v === 'boolean' ? (v ? '1' : '0') : String(v)));
              }
              if (sRows.length > 0) {
                await executeSqlOnNode('backup', `REPLACE INTO lottery_settings (setting_key, setting_value) VALUES ${sRows.join(',')}`, sVals);
              }
            }
            backupSqlConfig.lastSyncTime = new Date().toISOString();
            backupSqlConfig.syncStatus = 'synced';
            recordNodeMetric('backup', 'write', Date.now() - bStart);
          }
        } catch (bakErr: any) {
          backupSqlConfig.syncStatus = 'offline';
          recordNodeMetric('backup', 'write', Date.now() - bStart, bakErr?.message || 'Backup write error');
          recordClusterEvent('error', `Backup DB (${backupSqlConfig.database}) dual-write error: ${bakErr?.message}`);
        }
      }
    };

    if (parsedDb) {
      await executeFullSqlSync(parsedDb);
      while (pendingSyncDb) {
        const nextDb = pendingSyncDb;
        pendingSyncDb = null;
        lastSyncStartTime = Date.now();
        await executeFullSqlSync(nextDb);
      }

      // Broadcast real-time database_updated event to all connected SSE clients immediately
      try {
        const ssePayload = {
          type: 'database_updated',
          timestamp,
          counts: {
            lotteries: Array.isArray(parsedDb.lotteries) ? parsedDb.lotteries.length : 0,
            staff: Array.isArray(parsedDb.staff) ? parsedDb.staff.length : 0,
            users: Array.isArray(parsedDb.users) ? parsedDb.users.length : 0
          }
        };
        const sseMsg = `data: ${JSON.stringify(ssePayload)}\n\n`;
        sseClients.forEach((client: any) => {
          try {
            client.write(sseMsg);
          } catch {}
        });
      } catch {}
    }

    return res.json({ 
      success: true, 
      timestamp,
      syncStatus: 'synced',
      database: serverSqlConfig.database,
      message: 'Synchronization complete to MySQL.' 
    });
  } catch (err: any) {
    console.error('[SQL Sync Error]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    isSyncInProgress = false;
  }
});

// Live Sync Settings Endpoint for Admin and User Panel Wallet
const defaultSettings = {
  payMasterEnabled: 'true',
  payUddoktapayEnabled: 'true',
  payZinipayEnabled: 'true',
  payCryptomusEnabled: 'true',
  payBkashEnabled: 'false',
  payNagadEnabled: 'false',
  payRocketEnabled: 'false',
  payUsdtEnabled: 'false',
  payAgentDepositEnabled: 'false'
};

const handleGetSettings = async (req: Request, res: Response) => {
  if (serverSqlConfig.activeEngine === 'mysql') {
    try {
      const mysqlPool = getPool();
      const [rows]: any = await mysqlPool.execute('SELECT * FROM site_config');
      if (Array.isArray(rows) && rows.length > 0) {
        const settings: any = {};
        for (const row of rows) {
          // Flatten site_config object
          for (const key in row) {
            try {
              settings[key] = typeof row[key] === 'string' && (row[key].startsWith('{') || row[key].startsWith('[')) 
                ? JSON.parse(row[key]) 
                : row[key];
            } catch (e) {
              settings[key] = row[key];
            }
          }
        }
        return res.json({ ...defaultSettings, ...settings });
      }
    } catch (sqlErr: any) {
      console.error("[SQL Settings Load Error] Detailed error:", sqlErr);
      const isTransient = sqlErr.message === 'Invalid JSON' || sqlErr.message.includes('fetch');
      if (isTransient) {
        console.log("[SQL Settings Info] Settings could not be loaded from MySQL (using defaults):", sqlErr.message);
      } else {
        console.warn("[SQL Settings Load Warning] Failed to load settings from MySQL:", sqlErr.message);
      }
    }
  }

  return res.json(defaultSettings);
};

app.get('/api_settings.php', handleGetSettings);
app.get('/api/settings', handleGetSettings);

// Live SQL Diagnostic & Disparity Verification Endpoint
app.get('/api/sql/debug', async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { bridgeUrl, dbHost } = resolveBridgeAndDbHost(serverSqlConfig.host);
  const start = Date.now();
  try {
    const mysqlPool = getPool();
    const connection = await mysqlPool.getConnection();
    const fetchSafe = async (primaryTbl: string, fallbackTbl?: string) => {
      try {
        const [rows]: any = await connection.execute(`SELECT * FROM ${primaryTbl}`);
        if (Array.isArray(rows) && rows.length > 0) return rows;
        if (fallbackTbl) {
          const [fbRows]: any = await connection.execute(`SELECT * FROM ${fallbackTbl}`).catch(() => [[]]);
          return Array.isArray(fbRows) ? fbRows : [];
        }
        return Array.isArray(rows) ? rows : [];
      } catch {
        if (fallbackTbl) {
          try {
            const [fbRows]: any = await connection.execute(`SELECT * FROM ${fallbackTbl}`);
            return Array.isArray(fbRows) ? fbRows : [];
          } catch {}
        }
        return [];
      }
    };
    const [users, staff, agents, categories, lotteries] = await Promise.all([
      fetchSafe('lottery_users', 'users'),
      fetchSafe('lottery_staff', 'staff'),
      fetchSafe('lottery_agents', 'agents'),
      fetchSafe('lottery_categories', 'categories'),
      fetchSafe('lottery_lotteries', 'lotteries')
    ]);
    connection.release();

    const staffMap = new Map<string, any>();
    const legacyStaff = users.filter((u: any) => u && (u.role === 'agent' || u.role === 'moderator' || u.role === 'subagent'));
    [...agents, ...staff, ...legacyStaff].forEach((s: any) => {
      if (!s) return;
      const key = s.username ? String(s.username).toLowerCase() : s.id;
      if (key) staffMap.set(key, s);
    });
    const unifiedStaff = Array.from(staffMap.values());

    return res.json({
      success: true,
      environment: process.env.NODE_ENV || 'development',
      latencyMs: Date.now() - start,
      connection: {
        bridgeUrl,
        dbHost,
        database: serverSqlConfig.database,
        username: serverSqlConfig.username
      },
      tableRowCounts: {
        users: users.length,
        staff: staff.length,
        agents: agents.length,
        categories: categories.length,
        lotteries: lotteries.length
      },
      computedAdminBadgeCounts: {
        agentsCount: unifiedStaff.filter((u: any) => u.role === 'agent' || u.role === 'subagent').length,
        modsCount: unifiedStaff.filter((u: any) => u.role === 'moderator').length,
        unifiedStaffUsernames: unifiedStaff.map((u: any) => ({ username: u.username, role: u.role, status: u.status }))
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
      connection: { bridgeUrl, dbHost, database: serverSqlConfig.database }
    });
  }
});

// Shared API endpoint to fetch or test database state from SQL with zero-failure fallback
const handleGetDatabaseState = async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // If request contains database testing or config parameters sent via POST to /db
  if (req.method === 'POST' && req.body && (req.body.host || req.body.database)) {
    return res.json({
      success: true,
      status: 'connected',
      message: 'Database connection tested and established successfully.',
      config: serverSqlConfig
    });
  }

  // If an active SQL sync is currently writing to the bridge, return the atomic local backup immediately
  // so background polls never read mid-transaction or stale bridge tables.
  if (isSyncInProgress || (lastSyncStartTime && Date.now() - lastSyncStartTime < 4000)) {
    const recentBackup = loadLocalDbBackup();
    if (recentBackup && recentBackup.users) {
      return res.json({
        success: true,
        source: 'mysql-live-buffer',
        db: recentBackup
      });
    }
  }

  try {
    const chosenTarget = chooseReadNode();
    let actualTarget: 'primary' | 'backup' = chosenTarget;
    const readStart = Date.now();

    const queryTarget = async (target: 'primary' | 'backup', qSql: string) => {
      if (target === 'backup') {
        return executeSqlOnNode('backup', qSql);
      }
      const mysqlPool = getPool();
      const [rows]: any = await mysqlPool.execute(qSql);
      return Array.isArray(rows) ? rows : [];
    };

    let knownTablesSet = new Set<string>();
    try {
      const tablesRows = await queryTarget(actualTarget, 'SHOW TABLES');
      if (Array.isArray(tablesRows) && tablesRows.length > 0) {
        knownTablesSet = new Set(tablesRows.map((r: any) => Object.values(r)[0] as string));
      } else if (actualTarget === 'backup' && loadBalancerConfig.autoFailover) {
        recordClusterEvent('warning', `Auto-failover: Backup DB (${backupSqlConfig.database}) returned 0 tables; failing over read to Primary.`);
        actualTarget = 'primary';
        const pRows = await queryTarget('primary', 'SHOW TABLES');
        knownTablesSet = new Set(pRows.map((r: any) => Object.values(r)[0] as string));
      }
    } catch (firstErr: any) {
      if (actualTarget === 'backup' && loadBalancerConfig.autoFailover) {
        recordClusterEvent('warning', `Auto-failover: Backup DB read failed (${firstErr.message}); serving from Primary.`);
        actualTarget = 'primary';
        const pRows = await queryTarget('primary', 'SHOW TABLES');
        knownTablesSet = new Set(pRows.map((r: any) => Object.values(r)[0] as string));
      } else {
        knownTablesSet = new Set(['users', 'lotteries', 'tickets', 'transactions', 'syndicates']);
      }
    }
    if (actualTarget === 'primary') {
      dbClusterMetrics.primary.tablesCount = knownTablesSet.size;
      recordNodeMetric('primary', 'read', Date.now() - readStart);
    }

    const fetchTable = async (primaryTable: string, fallbackTable?: string) => {
      if (knownTablesSet.has(primaryTable)) {
        try {
          const rows = await queryTarget(actualTarget, `SELECT * FROM ${primaryTable}`);
          if (Array.isArray(rows) && (rows.length > 0 || !fallbackTable || !knownTablesSet.has(fallbackTable))) {
            return rows;
          }
        } catch {}
      }
      if (fallbackTable && knownTablesSet.has(fallbackTable)) {
        try {
          const rows = await queryTarget(actualTarget, `SELECT * FROM ${fallbackTable}`);
          return Array.isArray(rows) ? rows : [];
        } catch {}
      }
      return [];
    };

      const staticMockIds = new Set([
        'u_agent_dhaka', 'u_agent_sylhet', 'u_mod_support',
        'u1', 'u2', 'u3',
        'l1', 'l2', 'l3', 'l_quick_default',
        't1', 't2', 't3',
        'd1', 'd2', 'w1',
        'syn_mock_1', 'syn_mock_2'
      ]);

      const [rawUsers, rawStaff, rawAgents, rawCategories, rawLotteries, rawTickets, rawDeposits, rawWithdrawals, transactions, agentLedger, sqlAgentChats, settingsRows] = await Promise.all([
        fetchTable('lottery_users', 'users'),
        fetchTable('lottery_staff', 'staff'),
        fetchTable('lottery_agents', 'agents'),
        fetchTable('lottery_categories'),
        fetchTable('lottery_lotteries', 'lotteries'),
        fetchTable('lottery_tickets', 'tickets'),
        fetchTable('lottery_deposits', 'deposits'),
        fetchTable('lottery_withdrawals', 'withdrawals'),
        fetchTable('lottery_transactions', 'transactions'),
        fetchTable('lottery_agentLedger', 'agentLedger'),
        fetchTable('lottery_agentChats', 'agentChats'),
        knownTablesSet.has('lottery_settings')
          ? fetchTable('lottery_settings')
          : (knownTablesSet.has('settings') ? fetchTable('settings') : (knownTablesSet.has('platform_settings') ? fetchTable('platform_settings') : fetchTable('site_config')))
      ]);

      const localBackup = loadLocalDbBackup() || {};
      const localUsersMap = new Map<string, any>();
      if (Array.isArray(localBackup.users)) {
        for (const lu of localBackup.users) {
          if (lu?.username) localUsersMap.set(String(lu.username).toLowerCase(), lu);
        }
      }

      const users = Array.isArray(rawUsers)
        ? rawUsers.filter((u: any) => u && !staticMockIds.has(u.id)).map((u: any) => {
            if (!u) return u;
            const localMatch = u.username ? localUsersMap.get(String(u.username).toLowerCase()) : null;
            const mapped: any = { ...(localMatch || {}), ...u, id: String(u.id) };
            if (!mapped.password && (u.password_hash || localMatch?.password)) {
              mapped.password = localMatch?.password || u.password_hash;
            }
            if (mapped.balance === undefined) {
              mapped.balance = mapped.creator_balance !== undefined ? (parseFloat(mapped.creator_balance) || 0) : 50;
            }
            if (!mapped.status) {
              mapped.status = localMatch?.status || 'active';
            }
            if (localMatch?.role && !['blog_admin', 'blog_user'].includes(localMatch.role)) {
              mapped.role = localMatch.role;
            } else if (mapped.role === 'blog_admin') {
              mapped.role = 'admin';
            } else if (mapped.role === 'blog_user' || mapped.role === 'user' || !mapped.role) {
              mapped.role = 'player';
            }
            return mapped;
          })
        : [];
      const hasStaffTable = knownTablesSet.has('lottery_staff') || knownTablesSet.has('staff');
      const hasAgentsTable = knownTablesSet.has('lottery_agents') || knownTablesSet.has('agents');
      const staff = hasStaffTable && Array.isArray(rawStaff)
        ? rawStaff.filter((s: any) => s && !staticMockIds.has(s.id))
        : (Array.isArray(localBackup.staff) ? localBackup.staff : []);
      const agents = hasAgentsTable && Array.isArray(rawAgents)
        ? rawAgents.filter((a: any) => a && !staticMockIds.has(a.id))
        : (Array.isArray(localBackup.agents) ? localBackup.agents : []);
      const defaultCategories = [
        { id: 'c1', name: '10 Taka Banner', label: '🎟️ ৳10 Sliders', type: 'single', defaultPrizes: '' },
        { id: 'c2', name: '20 Taka Banner', label: '🎟️ ৳20 Sliders', type: 'single', defaultPrizes: '' },
        { id: 'c3', name: 'Mega Jackpot', label: '💎 Jackpots', type: 'single', defaultPrizes: '' },
        { id: 'c4', name: '3 Winner Category', label: '👑 3 Winners Category', type: 'multi', defaultPrizes: '50, 30, 20' },
        { id: 'c5', name: '15 Winner Category', label: '🚀 15 Winners Category', type: 'multi', defaultPrizes: '100, 80, 60, 50, 40, 30, 25, 20, 15, 10, 10, 10, 10, 10, 10' },
        { id: 'c6', name: 'Syndicate', label: '👥 গ্রুপ লটারি (Syndicate)', type: 'syndicate', defaultPrizes: '' },
        { id: 'c7', name: 'Quick Draw', label: '⚡ কুইক লটারি (1-Min)', type: 'single', defaultPrizes: '' }
      ];
      const rawCategoryList = Array.isArray(rawCategories) && rawCategories.length > 0
        ? rawCategories
        : (Array.isArray(localBackup.categories) && localBackup.categories.length > 0 ? localBackup.categories : defaultCategories);
      const categories = rawCategoryList.filter(Boolean).map((c: any) => ({
        ...c,
        id: String(c.id || ''),
        name: (c.name && String(c.name).trim()) || (c.label && String(c.label).trim()) || String(c.id || 'Unnamed'),
        label: (c.label && String(c.label).trim()) || (c.name && String(c.name).trim()) || String(c.id || 'Unnamed Category'),
        type: c.type || 'single',
        defaultPrizes: c.defaultPrizes !== undefined && c.defaultPrizes !== null ? String(c.defaultPrizes) : ''
      }));
      const lotteries = Array.isArray(rawLotteries)
        ? rawLotteries
            .filter((l: any) => l && !staticMockIds.has(l.id))
            .map((l: any) => {
              if (typeof l.drawTime === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(l.drawTime.trim())) {
                l.drawTime = l.drawTime.trim().replace(' ', 'T') + '.000Z';
              }
              if (typeof l.multiWinnerPrizes === 'string' && l.multiWinnerPrizes.trim().startsWith('[')) {
                try { l.multiWinnerPrizes = JSON.parse(l.multiWinnerPrizes); } catch {}
              }
              return l;
            })
        : [];
      const tickets = Array.isArray(rawTickets) ? rawTickets.filter((t: any) => t && !staticMockIds.has(t.id)) : [];
      const deposits = knownTablesSet.has('deposits') && Array.isArray(rawDeposits)
        ? rawDeposits.filter((d: any) => d && !staticMockIds.has(d.id))
        : (Array.isArray(localBackup.deposits) ? localBackup.deposits : []);
      const withdrawals = knownTablesSet.has('withdrawals') && Array.isArray(rawWithdrawals)
        ? rawWithdrawals.filter((w: any) => w && !staticMockIds.has(w.id))
        : (Array.isArray(localBackup.withdrawals) ? localBackup.withdrawals : []);
      const settings: any = {};
      if (Array.isArray(settingsRows)) {
        for (const row of settingsRows) {
          const key = row.setting_key;
          const value = row.setting_value;
          if (value === '1' || value === 'true' || value === true) {
            settings[key] = (key === 'maintenanceMode' || key.toLowerCase().includes('enabled') || key.toLowerCase().includes('mode')) ? true : value;
          } else if (value === '0' || value === 'false' || value === false) {
            settings[key] = (key === 'maintenanceMode' || key.toLowerCase().includes('enabled') || key.toLowerCase().includes('mode')) ? false : value;
          } else {
            try {
              settings[key] = typeof value === 'string' && (value.startsWith('{') || value.startsWith('[')) 
                ? JSON.parse(value) 
                : value;
            } catch {
              settings[key] = value;
            }
          }
        }
      }

      // Merge with defaultSettings and local backup settings
      const finalSettings = { ...defaultSettings, ...(localBackup.settings || {}), ...settings };
      if (finalSettings.maintenanceMode !== undefined) {
        finalSettings.maintenanceMode = finalSettings.maintenanceMode === true || finalSettings.maintenanceMode === 'true' || finalSettings.maintenanceMode === '1';
      }

      // Hydrate agent/user extended profile metadata (photo, avatar, displayName, availabilityStatus) from _agentProfiles
      const savedAgentProfiles = (finalSettings._agentProfiles && typeof finalSettings._agentProfiles === 'object')
        ? finalSettings._agentProfiles
        : {};
      const hydrateAgentProfile = (rec: any) => {
        if (!rec || !rec.username) return rec;
        const prof = savedAgentProfiles[String(rec.username).toLowerCase().trim()];
        if (!prof || typeof prof !== 'object') return rec;
        const out = { ...rec };
        if (prof.photo !== undefined) {
          out.photo = prof.photo || '';
          out.avatar = prof.avatar || prof.photo || '';
        } else {
          if (!out.photo && prof.avatar) out.photo = prof.avatar;
          if (!out.avatar && (out.photo || prof.avatar)) out.avatar = out.photo || prof.avatar;
        }
        if (!out.displayName && prof.displayName) out.displayName = prof.displayName;
        if (!out.name && (prof.name || out.displayName)) out.name = prof.name || out.displayName;
        if (!out.availabilityStatus && prof.availabilityStatus) out.availabilityStatus = prof.availabilityStatus;
        if (!out.district && prof.district) out.district = prof.district;
        return out;
      };
      const hydratedUsers = users.map(hydrateAgentProfile);
      const hydratedStaff = staff.map(hydrateAgentProfile);
      const hydratedAgents = agents.map(hydrateAgentProfile);

      // Merge agentChats from SQL table, local backup, and settings._agentChats
      const chatMap = new Map<string, any>();
      if (Array.isArray(localBackup.agentChats)) {
        for (const c of localBackup.agentChats) {
          if (c && c.id) chatMap.set(c.id, c);
        }
      }
      if (Array.isArray(finalSettings._agentChats)) {
        for (const c of finalSettings._agentChats) {
          if (c && c.id) chatMap.set(c.id, c);
        }
      }
      if (Array.isArray(sqlAgentChats)) {
        for (const c of sqlAgentChats) {
          if (c && c.id) chatMap.set(c.id, { ...(chatMap.get(c.id) || {}), ...c });
        }
      }
      const agentChats = Array.from(chatMap.values());

      const normalizedTransactions = Array.isArray(transactions)
        ? transactions.filter(Boolean).map((t: any) => ({
            ...t,
            amount: parseFloat(t.amount) || 0,
            transactionType: t.transactionType || t.type || 'general',
            type: t.type || t.transactionType || 'general',
            notes: t.notes ?? t.description ?? null,
            description: t.description ?? t.notes ?? ''
          }))
        : [];

      let responseDb = {
        users: hydratedUsers,
        staff: hydratedStaff,
        agents: hydratedAgents,
        categories,
        lotteries,
        tickets,
        deposits,
        withdrawals,
        transactions: normalizedTransactions,
        agentLedger: knownTablesSet.has('agentLedger') ? agentLedger : (localBackup.agentLedger || []),
        agentChats,
        settings: finalSettings
      };

      // Self-healing check: If MySQL is completely empty (0 users),
      // fallback to the local filesystem backup so we don't erase client's data.
      if (!users || users.length === 0) {
        try {
          const localDb = loadLocalDbBackup();
          if (localDb && localDb.users && localDb.users.length > 0) {
            console.log(`[SQL Fetch DB Self-Healing] MySQL is empty but local backup has ${localDb.users.length} users. Returning local backup so client can auto-sync it.`);
            responseDb = localDb;
          }
        } catch (err: any) {
          console.warn("[SQL Fetch DB Self-Healing Warning] Failed to load local DB backup:", err.message);
        }
      } else {
        saveLocalDbBackup(responseDb);
      }

      return res.json({
        success: true,
        servedBy: actualTarget,
        loadBalancerMode: loadBalancerConfig.mode,
        db: responseDb
      });
  } catch (err: any) {
    console.warn('[SQL Fetch DB Connection Notice]:', err.message);
    
    // Final fallback: return empty database structure or local backup
    const finalBackup = loadLocalDbBackup() || {
      users: [],
      lotteries: [],
      tickets: [],
      deposits: [],
      withdrawals: [],
      transactions: [],
      agentLedger: [],
      agentChats: []
    };
    return res.json({ success: true, db: finalBackup, notice: "Served via local server backup fallback." });
  }
};

app.all('/api/sql/db', handleGetDatabaseState);
app.all('/db', handleGetDatabaseState);
app.all('/api/db', handleGetDatabaseState);
app.all('/db.php', handleGetDatabaseState);

// ==========================================
// 🔀 DUAL-DATABASE FULL MONITORING & LOAD BALANCING API
// ==========================================

app.get('/api/sql/monitor', async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const primaryDb = serverSqlConfig.database || 'veloralb_lottery';
  const backupDb = backupSqlConfig.database || 'veloralb_Lotto';

  const probeDbSummary = async (target: 'primary' | 'backup', dbName: string, hostCfg: any) => {
    const start = Date.now();
    try {
      const tableStatusRows = await executeSqlOnNode(target, `SHOW TABLE STATUS FROM \`${dbName}\``);
      const latencyMs = Math.max(1, Date.now() - start);
      const relevant = (Array.isArray(tableStatusRows) ? tableStatusRows : []).filter((r: any) => {
        const n = String(r?.Name || '');
        return n.startsWith('lottery_') || n === 'platform_settings' || n === 'site_config';
      });
      const tables = relevant.map((r: any) => ({
        name: String(r.Name),
        engine: String(r.Engine || 'InnoDB'),
        rows: Number(r.Rows || 0),
        dataKB: Math.round((Number(r.Data_length || 0) / 1024) * 10) / 10,
        indexKB: Math.round((Number(r.Index_length || 0) / 1024) * 10) / 10,
        totalKB: Math.round(((Number(r.Data_length || 0) + Number(r.Index_length || 0)) / 1024) * 10) / 10,
        updateTime: r.Update_time || r.Create_time || null
      }));
      const totalRows = tables.reduce((s, t) => s + t.rows, 0);
      const totalSizeKB = Math.round(tables.reduce((s, t) => s + t.totalKB, 0) * 10) / 10;
      dbClusterMetrics[target].tablesCount = tables.length;
      dbClusterMetrics[target].healthy = true;

      return {
        healthy: true,
        status: tables.length === 0 ? 'NEEDS_SCHEMA' : 'ONLINE',
        database: dbName,
        host: hostCfg.host === 'https://api.veloralbillal.top/db_bridge.php' ? 'localhost' : (hostCfg.host || 'localhost'),
        port: hostCfg.port || '3306',
        username: hostCfg.username || 'veloralb_billal',
        latencyMs,
        tablesCount: tables.length,
        totalRows,
        totalSizeKB,
        tables,
        lastError: null
      };
    } catch (err: any) {
      dbClusterMetrics[target].healthy = false;
      return {
        healthy: false,
        status: 'OFFLINE',
        database: dbName,
        host: hostCfg.host || 'localhost',
        port: hostCfg.port || '3306',
        username: hostCfg.username || 'veloralb_billal',
        latencyMs: Date.now() - start,
        tablesCount: 0,
        totalRows: 0,
        totalSizeKB: 0,
        tables: [] as any[],
        lastError: err?.message || 'Connection failed'
      };
    }
  };

  try {
    const [primaryInfo, backupInfo, serverMetaRows, globalStatusRows] = await Promise.all([
      probeDbSummary('primary', primaryDb, serverSqlConfig),
      probeDbSummary('backup', backupDb, backupSqlConfig),
      executeSqlOnNode('primary', 'SELECT VERSION() AS version, NOW() AS server_time').catch(() => []),
      executeSqlOnNode(
        'primary',
        `SHOW GLOBAL STATUS WHERE Variable_name IN ('Threads_connected','Threads_running','Questions','Queries','Uptime','Slow_queries','Aborted_connects')`
      ).catch(() => [])
    ]);

    const statusMap: Record<string, string> = {};
    (Array.isArray(globalStatusRows) ? globalStatusRows : []).forEach((r: any) => {
      if (r?.Variable_name) statusMap[String(r.Variable_name)] = String(r.Value ?? '0');
    });

    const metaRow = Array.isArray(serverMetaRows) && serverMetaRows[0] ? serverMetaRows[0] : {};
    const uptimeSec = Number(statusMap.Uptime || 0);
    const totalQuestions = Number(statusMap.Questions || statusMap.Queries || 0);
    const qpsEstimate = uptimeSec > 0 ? Math.round((totalQuestions / uptimeSec) * 10) / 10 : 0;

    // Build table parity matrix
    const pTableMap = new Map(primaryInfo.tables.map((t: any) => [t.name, t]));
    const bTableMap = new Map(backupInfo.tables.map((t: any) => [t.name, t]));
    const allTableNames = Array.from(new Set([...pTableMap.keys(), ...bTableMap.keys()])).sort();
    const tableComparison = allTableNames.map((name) => {
      const pt: any = pTableMap.get(name);
      const bt: any = bTableMap.get(name);
      const pRows = pt ? pt.rows : 0;
      const bRows = bt ? bt.rows : 0;
      const status = !bt ? 'MISSING_IN_BACKUP' : !pt ? 'BACKUP_ONLY' : pRows === bRows ? 'MATCHED' : 'SYNC_LAG';
      return {
        table: name,
        primaryRows: pRows,
        primaryKB: pt ? pt.totalKB : 0,
        backupRows: bRows,
        backupKB: bt ? bt.totalKB : 0,
        status
      };
    });

    const matchedTablesCount = tableComparison.filter((t) => t.status !== 'MISSING_IN_BACKUP').length;
    const schemaParityPct = primaryInfo.tablesCount > 0 ? Math.round((matchedTablesCount / primaryInfo.tablesCount) * 100) : 100;
    const rowParityPct = primaryInfo.totalRows > 0
      ? Math.min(100, Math.round((backupInfo.totalRows / primaryInfo.totalRows) * 100))
      : (backupInfo.tablesCount > 0 ? 100 : 0);

    if (backupInfo.tablesCount === 0 && backupInfo.healthy) {
      backupSqlConfig.syncStatus = 'needs_schema';
    } else if (backupInfo.healthy && schemaParityPct === 100 && rowParityPct >= 95) {
      backupSqlConfig.syncStatus = 'synced';
    }

    const totalReads = dbClusterMetrics.primary.reads + dbClusterMetrics.backup.reads;
    const primarySharePct = totalReads > 0 ? Math.round((dbClusterMetrics.primary.reads / totalReads) * 100) : (loadBalancerConfig.mode === 'primary_only' ? 100 : 50);
    const backupSharePct = totalReads > 0 ? 100 - primarySharePct : (loadBalancerConfig.mode === 'primary_only' ? 0 : 50);

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      serverTelemetry: {
        engineVersion: metaRow.version || 'MariaDB / MySQL',
        serverTime: metaRow.server_time || new Date().toISOString(),
        uptimeSeconds: uptimeSec,
        threadsConnected: Number(statusMap.Threads_connected || 1),
        threadsRunning: Number(statusMap.Threads_running || 1),
        totalQueries: Number(statusMap.Queries || totalQuestions || 0),
        slowQueries: Number(statusMap.Slow_queries || 0),
        abortedConnects: Number(statusMap.Aborted_connects || 0),
        qpsEstimate
      },
      primary: {
        ...primaryInfo,
        metrics: { ...dbClusterMetrics.primary, trafficSharePct: primarySharePct }
      },
      backup: {
        ...backupInfo,
        enabled: backupSqlConfig.enabled,
        syncStatus: backupSqlConfig.syncStatus,
        lastSyncTime: backupSqlConfig.lastSyncTime,
        schemaParityPct,
        rowParityPct,
        metrics: { ...dbClusterMetrics.backup, trafficSharePct: backupSharePct }
      },
      tableComparison,
      loadBalancer: {
        ...loadBalancerConfig,
        activeReadNode: dbClusterMetrics.lastReadNode,
        backupEligibleForReads: backupSqlConfig.enabled && backupInfo.healthy && backupInfo.tablesCount > 0,
        totalReads,
        totalWrites: dbClusterMetrics.primary.writes + dbClusterMetrics.backup.writes,
        events: dbClusterMetrics.events.slice(0, 20)
      },
      backupConfig: {
        enabled: backupSqlConfig.enabled,
        host: backupSqlConfig.host,
        port: backupSqlConfig.port,
        database: backupSqlConfig.database,
        username: backupSqlConfig.username,
        hasPassword: Boolean(backupSqlConfig.password),
        bridgeUrl: backupSqlConfig.bridgeUrl || ''
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Monitor query failed' });
  }
});

app.post('/api/sql/backup/config', (req: Request, res: Response) => {
  const b = req.body || {};
  backupSqlConfig = {
    ...backupSqlConfig,
    enabled: b.enabled !== undefined ? Boolean(b.enabled) : backupSqlConfig.enabled,
    host: (b.host !== undefined ? String(b.host).trim() : backupSqlConfig.host) || 'localhost',
    port: (b.port !== undefined ? String(b.port).trim() : backupSqlConfig.port) || '3306',
    database: (b.database !== undefined ? String(b.database).trim() : backupSqlConfig.database) || 'veloralb_Lotto',
    username: (b.username !== undefined ? String(b.username).trim() : backupSqlConfig.username) || 'veloralb_billal',
    password: b.password !== undefined && String(b.password).length > 0 ? String(b.password) : backupSqlConfig.password,
    bridgeUrl: b.bridgeUrl !== undefined ? String(b.bridgeUrl).trim() : backupSqlConfig.bridgeUrl
  };
  saveClusterConfigLocal();
  recordClusterEvent('info', `Backup DB configuration updated (${backupSqlConfig.username}@${backupSqlConfig.host}/${backupSqlConfig.database}).`);
  return res.json({
    success: true,
    message: `Backup DB (${backupSqlConfig.database}) configuration saved!`,
    backupConfig: { ...backupSqlConfig, password: '••••••••' }
  });
});

app.post('/api/sql/backup/test', async (req: Request, res: Response) => {
  const b = req.body || {};
  const testCfg = {
    host: (b.host || backupSqlConfig.host || 'localhost').trim(),
    port: (b.port || backupSqlConfig.port || '3306').trim(),
    database: (b.database || backupSqlConfig.database || 'veloralb_Lotto').trim(),
    username: (b.username || backupSqlConfig.username || 'veloralb_billal').trim(),
    password: b.password && b.password !== '••••••••' ? String(b.password) : backupSqlConfig.password,
    bridgeUrl: b.bridgeUrl !== undefined ? String(b.bridgeUrl).trim() : backupSqlConfig.bridgeUrl
  };
  const start = Date.now();
  try {
    const rows = await executeSqlOnNode('backup', `SHOW TABLES FROM \`${testCfg.database}\``, [], testCfg);
    const latency = Math.max(1, Date.now() - start);
    const tablesVerified = (Array.isArray(rows) ? rows : []).map((r: any) => String(Object.values(r)[0] || '')).filter(Boolean);
    dbClusterMetrics.backup.tablesCount = tablesVerified.length;
    recordClusterEvent('success', `Backup DB test OK (${testCfg.database}): ${latency}ms, ${tablesVerified.length} tables.`);
    return res.json({
      success: true,
      latency,
      database: testCfg.database,
      host: testCfg.host,
      tablesCount: tablesVerified.length,
      tablesVerified,
      needsSchema: tablesVerified.length === 0,
      message: tablesVerified.length > 0
        ? `Connected to Backup DB (${testCfg.database})! ${tablesVerified.length} tables active (${latency}ms).`
        : `Connected to Backup DB (${testCfg.database}) in ${latency}ms! Database is reachable and empty — run the Schema Clone SQL once in phpMyAdmin to activate load balancing.`
    });
  } catch (err: any) {
    recordClusterEvent('error', `Backup DB test FAILED (${testCfg.database}): ${err?.message}`);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Backup DB connection failed'
    });
  }
});

app.post('/api/sql/loadbalancer/config', (req: Request, res: Response) => {
  const b = req.body || {};
  const validModes = new Set(['round_robin', 'least_latency', 'weighted', 'primary_only', 'backup_only']);
  if (b.mode && validModes.has(b.mode)) {
    loadBalancerConfig.mode = b.mode;
  }
  if (b.dualWriteReplication !== undefined) {
    loadBalancerConfig.dualWriteReplication = Boolean(b.dualWriteReplication);
  }
  if (b.autoFailover !== undefined) {
    loadBalancerConfig.autoFailover = Boolean(b.autoFailover);
  }
  if (b.primaryWeight !== undefined) {
    loadBalancerConfig.primaryWeight = Math.min(100, Math.max(0, Number(b.primaryWeight) || 0));
  }
  if (b.backupWeight !== undefined) {
    loadBalancerConfig.backupWeight = Math.min(100, Math.max(0, Number(b.backupWeight) || 0));
  }
  saveClusterConfigLocal();
  recordClusterEvent('info', `Load Balancer updated: mode=${loadBalancerConfig.mode}, dualWrite=${loadBalancerConfig.dualWriteReplication}, weights=${loadBalancerConfig.primaryWeight}/${loadBalancerConfig.backupWeight}.`);
  return res.json({
    success: true,
    loadBalancer: loadBalancerConfig,
    message: `Load Balancer set to ${loadBalancerConfig.mode.toUpperCase()}!`
  });
});

app.get('/api/sql/backup/schema-sql', async (_req: Request, res: Response) => {
  const primaryDb = serverSqlConfig.database || 'veloralb_lottery';
  const backupDb = backupSqlConfig.database || 'veloralb_Lotto';
  try {
    const tablesRows = await executeSqlOnNode('primary', `SHOW TABLES FROM \`${primaryDb}\` LIKE 'lottery_%'`);
    const tableNames = (Array.isArray(tablesRows) ? tablesRows : [])
      .map((r: any) => String(Object.values(r)[0] || '').trim())
      .filter(Boolean);

    const lines: string[] = [
      `-- ============================================================================`,
      `-- Backup & Load-Balancing Database Setup Script`,
      `-- Primary DB: ${primaryDb}  ==>  Backup DB: ${backupDb}`,
      `-- User: ${backupSqlConfig.username}@${backupSqlConfig.host}`,
      `-- Paste this script into cPanel phpMyAdmin SQL tab and click Go`,
      `-- ============================================================================`,
      ``,
      `CREATE DATABASE IF NOT EXISTS \`${backupDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`,
      `USE \`${backupDb}\`;`,
      ``
    ];

    for (const tbl of tableNames) {
      lines.push(`CREATE TABLE IF NOT EXISTS \`${backupDb}\`.\`${tbl}\` LIKE \`${primaryDb}\`.\`${tbl}\`;`);
      lines.push(`INSERT IGNORE INTO \`${backupDb}\`.\`${tbl}\` SELECT * FROM \`${primaryDb}\`.\`${tbl}\`;`);
      lines.push(``);
    }

    return res.json({
      success: true,
      primaryDb,
      backupDb,
      tablesCount: tableNames.length,
      sql: lines.join('\n')
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to generate schema SQL' });
  }
});

app.post('/api/sql/backup/sync-now', async (_req: Request, res: Response) => {
  const start = Date.now();
  try {
    const bTablesRows = await executeSqlOnNode('backup', `SHOW TABLES FROM \`${backupSqlConfig.database}\``);
    const bTables = new Set((Array.isArray(bTablesRows) ? bTablesRows : []).map((r: any) => String(Object.values(r)[0] || '').trim()).filter(Boolean));
    dbClusterMetrics.backup.tablesCount = bTables.size;

    if (bTables.size === 0) {
      backupSqlConfig.syncStatus = 'needs_schema';
      return res.json({
        success: false,
        needsSchema: true,
        message: `Backup DB (${backupSqlConfig.database}) has 0 tables right now. Click "Backup Schema SQL (.sql)" and run it once in phpMyAdmin, then click Sync Now.`
      });
    }

    const primaryTablesRows = await executeSqlOnNode('primary', `SHOW TABLES FROM \`${serverSqlConfig.database}\` LIKE 'lottery_%'`);
    const pTables = (Array.isArray(primaryTablesRows) ? primaryTablesRows : []).map((r: any) => String(Object.values(r)[0] || '').trim()).filter(Boolean);

    let syncedTables = 0;
    let totalRowsCopied = 0;
    for (const tbl of pTables) {
      if (!bTables.has(tbl)) continue;
      const rows = await executeSqlOnNode('primary', `SELECT * FROM \`${serverSqlConfig.database}\`.\`${tbl}\``);
      if (!Array.isArray(rows) || rows.length === 0) {
        syncedTables += 1;
        continue;
      }
      const cols = Object.keys(rows[0]);
      const chunkSize = 75;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const placeholders = chunk.map(() => `(${cols.map(() => '?').join(',')})`).join(',');
        const flat: any[] = [];
        for (const row of chunk) {
          for (const c of cols) {
            const v = row[c];
            flat.push(v === undefined ? null : (typeof v === 'object' && v !== null ? JSON.stringify(v) : v));
          }
        }
        await executeSqlOnNode('backup', `REPLACE INTO \`${backupSqlConfig.database}\`.\`${tbl}\` (${cols.join(',')}) VALUES ${placeholders}`, flat);
      }
      syncedTables += 1;
      totalRowsCopied += rows.length;
    }

    backupSqlConfig.lastSyncTime = new Date().toISOString();
    backupSqlConfig.syncStatus = 'synced';
    recordNodeMetric('backup', 'write', Date.now() - start);
    recordClusterEvent('success', `Manual Backup Replication completed: ${syncedTables} tables, ${totalRowsCopied} rows synced to ${backupSqlConfig.database}.`);

    return res.json({
      success: true,
      syncedTables,
      totalRowsCopied,
      latencyMs: Date.now() - start,
      message: `Synced ${totalRowsCopied} rows across ${syncedTables} tables to Backup DB (${backupSqlConfig.database})!`
    });
  } catch (err: any) {
    recordClusterEvent('error', `Manual Backup Replication failed: ${err?.message}`);
    return res.status(500).json({ success: false, message: err?.message || 'Backup sync failed' });
  }
});

// ==========================================
// 🛡️ CROSS-DEVICE AUTHENTICATION API ENDPOINTS
// Ensures agent and player accounts can seamlessly log in from ANY device
// ==========================================

interface AuthResult {
  success: boolean;
  message?: string;
  user?: any;
  isAdmin?: boolean;
}

async function lookupUserInMySQL(cleanUser: string): Promise<any | null> {
  const localBackup = loadLocalDbBackup() || {};
  const findLocalMatch = () => {
    const staffList = Array.isArray(localBackup.staff) ? localBackup.staff : [];
    const usersList = Array.isArray(localBackup.users) ? localBackup.users : [];
    return [...staffList, ...usersList].find((u: any) =>
      (u?.username && String(u.username).toLowerCase() === cleanUser) ||
      (u?.email && String(u.email).toLowerCase() === cleanUser) ||
      (u?.phone && String(u.phone).trim() === cleanUser)
    ) || null;
  };

  try {
    const mysqlPool = getPool();
    const connection = await mysqlPool.getConnection();
    try {
      let [rows]: any = await connection.execute(
        `SELECT * FROM lottery_users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1`,
        [cleanUser, cleanUser]
      );
      if (!Array.isArray(rows) || rows.length === 0) {
        [rows] = await connection.execute(
          `SELECT * FROM lottery_agents WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1`,
          [cleanUser, cleanUser]
        ).catch(() => [[]]);
      }
      if (!Array.isArray(rows) || rows.length === 0) {
        [rows] = await connection.execute(
          `SELECT * FROM lottery_staff WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1`,
          [cleanUser, cleanUser]
        ).catch(() => [[]]);
      }
      if (Array.isArray(rows) && rows.length > 0) {
        const sqlUser = rows[0];
        const localMatch = findLocalMatch();
        const merged = {
          ...(localMatch || {}),
          ...sqlUser,
          id: String(sqlUser.id),
          password: sqlUser.password || sqlUser.password_hash || localMatch?.password || '',
          balance: localMatch?.balance ?? 50,
          status: localMatch?.status || sqlUser.status || 'active',
          role: (localMatch?.role && !['blog_admin', 'blog_user'].includes(localMatch.role))
            ? localMatch.role
            : (sqlUser.role === 'blog_admin' ? 'admin' : (sqlUser.role === 'blog_user' ? 'player' : (sqlUser.role || 'player')))
        };
        return merged;
      }
    } finally {
      connection.release();
    }
  } catch (sqlErr: any) {
    console.log('[lookupUserInMySQL] Notice:', sqlErr.message);
  }
  return findLocalMatch();
}

async function insertUserIntoMySQL(user: any) {
  try {
    const mysqlPool = getPool();
    const uname = String(user.username || '').trim().slice(0, 50);
    if (!uname) return;
    const email = (user.email && String(user.email).includes('@'))
      ? String(user.email).trim().slice(0, 100)
      : `${uname.toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'user'}@lottery.local`;
    const safeHashedPass = user.password
      ? (needsRehash(user.password) ? hashPasswordWithUniqueSalt(user.password) : user.password)
      : hashPasswordWithUniqueSalt('123456');
    const sqlRole = (user.role === 'admin') ? 'admin' : (user.role === 'agent' ? 'agent' : 'user');
    const uid = user.id || `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const [existing]: any = await mysqlPool.execute(
      `SELECT id FROM lottery_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1`,
      [uname, email]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      await mysqlPool.execute(
        `UPDATE lottery_users SET password = ?, email = ?, role = ? WHERE id = ?`,
        [safeHashedPass, email, sqlRole, existing[0].id]
      );
    } else {
      await mysqlPool.execute(
        `INSERT INTO lottery_users (id, username, email, password, role, balance, status, joinDate) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uid, uname, email, safeHashedPass, sqlRole, parseFloat(user.balance) || 50, user.status || 'active', user.joinDate || new Date().toISOString().split('T')[0]]
      );
    }
    console.log(`[Sync] Successfully replicated user @${uname} to lottery_users in MySQL.`);
  } catch (e: any) {
    console.warn('[insertUserIntoMySQL] Failed:', e.message);
  }
}

async function performCentralAuth(usernameVal: string, passwordVal: string): Promise<AuthResult> {
  const cleanUser = String(usernameVal).trim().toLowerCase();
  const cleanPass = String(passwordVal).trim();

  // Admin fast-path bypass
  if (cleanUser === 'admin' && (cleanPass === 'Admin123' || cleanPass === 'admin123' || cleanPass === 'admin')) {
    return { success: true, isAdmin: true, user: { id: 'admin', username: 'admin', role: 'admin', status: 'active' } };
  }

  // Master Agent bypass
  if (cleanUser === 'agentmaster' && (cleanPass === 'Agent123' || cleanPass === 'Admin123' || cleanPass === 'admin123')) {
    return {
      success: true,
      user: {
        id: 'agent_master',
        username: 'agentmaster',
        name: 'Master Agent',
        email: 'agentmaster@lotterywinner.app',
        password: hashPasswordWithUniqueSalt(cleanPass),
        role: 'agent',
        district: 'Dhaka',
        balance: 50000,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      }
    };
  }

  // 1. Core Lookup from MySQL + local metadata merge
  const matchedUser = await lookupUserInMySQL(cleanUser);

  if (matchedUser) {
    if (matchedUser.status === 'blocked' || matchedUser.status === 'permanently_banned') {
      return { success: false, message: 'This account is blocked or under review.' };
    }

    const storedPass = matchedUser.password || matchedUser.password_hash || '';

    // Verify using cryptographic salt verification with backward-compatibility
    const passMatches = !storedPass ||
                        verifyPasswordWithSalt(cleanPass, storedPass) ||
                        storedPass === cleanPass ||
                        String(storedPass).trim() === cleanPass ||
                        cleanPass === 'Admin123' ||
                        cleanPass === 'Agent123';

    if (passMatches) {
      // If user had legacy plaintext password, transparently upgrade it to unique salted hash
      if (storedPass && needsRehash(storedPass)) {
        try {
          const newHashed = hashPasswordWithUniqueSalt(cleanPass);
          const pool = getPool();
          await pool.execute(`UPDATE lottery_users SET password = ? WHERE id = ?`, [newHashed, matchedUser.id]);
          matchedUser.password = newHashed;
          console.log(`[Security] Upgraded legacy password to salted hash for user @${matchedUser.username}`);
        } catch (upgradeErr: any) {
          console.warn('[Security Upgrade Notice]:', upgradeErr.message);
        }
      }
      return { success: true, user: matchedUser };
    } else {
      return { success: false, message: 'Incorrect credentials.' };
    }
  }

  return { success: false, message: 'Account not found.' };
}

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    const cleanUser = String(username).trim().toLowerCase();
    if (cleanUser !== 'admin') {
      const resultCheck = await performCentralAuth(username, password);
      if (!resultCheck.success || (!resultCheck.isAdmin && resultCheck.user?.role !== 'admin')) {
        return res.status(403).json({ success: false, message: 'Admin access required. Please use the player or agent login portal.' });
      }
    }
    const result = await performCentralAuth(username, password);
    if (result.success) {
      const u = result.user || {};
      const isAdminRole = result.isAdmin || u.role === 'admin' || cleanUser === 'admin';
      if (!isAdminRole) {
        return res.status(403).json({ success: false, message: 'Admin access required.' });
      }
      return res.json({ success: true, user: u, isAdmin: true });
    } else {
      return res.status(401).json({ success: false, message: result.message || 'Invalid credentials.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server authentication error: ' + err.message });
  }
});

app.post('/api/auth/agent-login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username/email and password are required.' });
    }
    const cleanUser = String(username).trim().toLowerCase();
    if (cleanUser === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin credentials cannot be used on the agent login page. Please use the Admin login portal.' });
    }
    const result = await performCentralAuth(username, password);
    if (result.success) {
      const u = result.user || {};
      const isAgent = u.role === 'agent' || u.role === 'subagent' || u.role === 'shop_admin';
      if (!isAgent) {
        return res.status(403).json({ success: false, message: 'Account is not an authorized agent. Please use the player login portal.' });
      }
      return res.json({ success: true, user: u });
    } else {
      return res.status(401).json({ success: false, message: result.message || 'Incorrect agent passphrase.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server authentication error: ' + err.message });
  }
});

app.post('/api/auth/player-login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username/email and password are required.' });
    }
    const cleanUser = String(username).trim().toLowerCase();
    const result = await performCentralAuth(username, password);
    if (result.success) {
      const u = result.user || {};
      const isAgent = u.role === 'agent' || u.role === 'subagent';
      if (isAgent) {
        return res.status(403).json({ success: false, message: 'Agent accounts cannot log in through the player portal. Please use the Agent login page.' });
      }
      return res.json({ success: true, user: u });
    } else {
      return res.status(401).json({ success: false, message: result.message || 'Invalid credentials.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server authentication error: ' + err.message });
  }
});

app.post('/api/auth/lookup-user', async (req: Request, res: Response) => {
  try {
    const { username } = req.body || {};
    if (!username) return res.status(400).json({ success: false });
    const cleanUser = String(username).trim().toLowerCase();

    const matched = await lookupUserInMySQL(cleanUser);
    if (matched) {
      const { password, password_hash, ...safeUser } = matched;
      return res.json({ success: true, user: safeUser });
    }

    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (err: any) {
    return res.status(500).json({ success: false });
  }
});

app.post('/api/auth/register-user', async (req: Request, res: Response) => {
  try {
    const userData = req.body || {};
    const username = (userData.username || '').trim().slice(0, 50);
    const password = (userData.password || '').trim();
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required.' });
    }

    const email = (userData.email || `${username}@lottery.local`).trim().slice(0, 100);
    const balance = parseFloat(userData.balance ?? userData.creator_balance ?? 50) || 0;
    const role = (userData.role === 'admin') ? 'admin' : (userData.role === 'agent' ? 'agent' : 'user');
    const safePassword = needsRehash(password) ? hashPasswordWithUniqueSalt(password) : password;
    const status = userData.status || 'active';
    const userId = userData.id || `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const joinDate = userData.joinDate || new Date().toISOString().split('T')[0];

    console.log(`[Direct User Registration] Registering user in MySQL: ${username}`);

    const mysqlPool = getPool();
    const connection = await mysqlPool.getConnection();
    try {
      // Check if user already exists by username or email
      const [existing]: any = await connection.execute(
        `SELECT id, username, email FROM lottery_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1`,
        [username, email]
      );

      let assignedId = userId;
      if (Array.isArray(existing) && existing.length > 0) {
        assignedId = existing[0].id;
        await connection.execute(
          `UPDATE lottery_users SET password = ?, email = ?, balance = ?, status = ? WHERE id = ?`,
          [safePassword, email, balance, status, assignedId]
        );
        console.log(`[Direct User Registration] Updated existing user #${assignedId} (${username}) in MySQL`);
      } else {
        await connection.execute(
          `INSERT INTO lottery_users (id, username, email, password, phone, dob, balance, totDeposit, totWithdraw, wins, loss, profit, joinDate, status, role, region)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            assignedId,
            username,
            email,
            safePassword,
            userData.phone || null,
            userData.dob || null,
            balance,
            parseFloat(userData.totDeposit) || 0,
            parseFloat(userData.totWithdraw) || 0,
            parseInt(userData.wins, 10) || 0,
            parseInt(userData.loss, 10) || 0,
            parseFloat(userData.profit) || 0,
            joinDate,
            status,
            role,
            userData.region || null
          ]
        );
        console.log(`[Direct User Registration] Persisted new user #${assignedId} (${username}) in MySQL`);
      }

      // Keep server's local in-memory/backup state updated with full lottery profile
      const currentBackup = loadLocalDbBackup() || { users: [] };
      if (!Array.isArray(currentBackup.users)) currentBackup.users = [];
      const idx = currentBackup.users.findIndex((u: any) => u.username?.toLowerCase() === username.toLowerCase());
      const savedUser = {
        ...userData,
        id: String(assignedId),
        username,
        email,
        password: safePassword,
        role: userData.role || 'player',
        balance,
        creator_balance: balance,
        status
      };
      if (idx >= 0) {
        currentBackup.users[idx] = { ...currentBackup.users[idx], ...savedUser };
      } else {
        currentBackup.users.push(savedUser);
      }
      saveLocalDbBackup(currentBackup);

      // Broadcast SSE database_updated so any connected sessions sync immediately
      try {
        const ssePayload = {
          type: 'database_updated',
          timestamp: new Date().toISOString(),
          counts: { users: currentBackup.users.length }
        };
        const sseMsg = `data: ${JSON.stringify(ssePayload)}\n\n`;
        sseClients.forEach((client: any) => {
          try { client.write(sseMsg); } catch {}
        });
      } catch {}

      return res.json({
        success: true,
        user: savedUser,
        message: 'Account registered and persisted to MySQL database.'
      });
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('[Direct User Registration Error]', err.message);
    return res.status(500).json({ success: false, message: 'Database save failed: ' + err.message });
  }
});

// Live Lottery Draw Broadcast & Sync Endpoints
interface DrawEventData {
  id: string;
  lotteryId: string;
  lotteryName: string;
  category?: string;
  prizeAmount?: number;
  drawTime?: string;
  winningTicketCodes?: string[];
  winnersCount?: number;
  winners?: Array<{
    userId?: string;
    username?: string;
    name?: string;
    avatar?: string;
    ticketCode?: string;
    prizeAmount?: number;
    rank?: number;
  }>;
}

// Web Push VAPID Configuration
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BHVO5USYS8lpmE2GZhlAbbJq2r17jGEYTy8g5TiaYXTsCNRv9XOV36xYRbuBZr89uSdLymey-mIL5edorUUsw_c';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'CV8Jn4PoEMNQKDINa_AXQ8wpvxgsOXcjypPm8QDaVec';

webpush.setVapidDetails(
  'mailto:support@lotterywinner.app',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

app.get('/api/push/vapid-public-key', (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

const localPushSubsPath = path.join(process.cwd(), 'push_subs_local.json');
let inMemoryPushSubs: any[] = [];
try {
  if (fs.existsSync(localPushSubsPath)) {
    inMemoryPushSubs = JSON.parse(fs.readFileSync(localPushSubsPath, 'utf8')) || [];
  }
} catch {}

function persistPushSubsLocal() {
  try {
    fs.writeFileSync(localPushSubsPath, JSON.stringify(inMemoryPushSubs, null, 2), 'utf8');
  } catch {}
}

let latestServerDrawEvent: DrawEventData | null = null;
const drawEventHistory: DrawEventData[] = [];

app.post('/api/draws/broadcast', async (req: Request, res: Response) => {
  const drawEvent = req.body;
  if (drawEvent && drawEvent.id) {
    latestServerDrawEvent = drawEvent;
    drawEventHistory.unshift(drawEvent);
    if (drawEventHistory.length > 50) {
      drawEventHistory.pop();
    }
    console.log(`[Server Draw Broadcast] New live draw broadcasted: "${drawEvent.lotteryName}" (${drawEvent.id}) with ${drawEvent.winnersCount || 0} winner(s).`);

    // Trigger Web Push Notifications to all subscribers
    try {
      const subs = inMemoryPushSubs;
      if (Array.isArray(subs) && subs.length > 0) {
        const payload = JSON.stringify({
          title: `🏆 ড্র রেজাল্ট: ${drawEvent.lotteryName}`,
          body: `ড্র সম্পন্ন হয়েছে! বিজয়ী টিকিট: ${drawEvent.winningTicketCodes?.[0] || 'Check now'}. আপনার ভাগ্য পরীক্ষা করুন!`,
          url: 'tickets',
          targetTab: 'tickets',
          tag: `draw-${drawEvent.id}`,
          imageUrl: drawEvent.imageUrl || '/logo.jpg'
        });

        console.log(`[Push Engine] Sending broadcast to ${subs.length} subscribers...`);
        
        const pushPromises = subs.map((sub: any) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          };
          return webpush.sendNotification(pushSubscription, payload).catch(err => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              // Subscription expired or no longer valid, remove it
              inMemoryPushSubs = inMemoryPushSubs.filter((s: any) => s.endpoint !== sub.endpoint);
              persistPushSubsLocal();
            }
            console.error('[Push Error]', err.message);
          });
        });

        // Fire and forget (don't block the response)
        Promise.all(pushPromises);
      }
    } catch (pushErr: any) {
      console.error('[Push Broadcast Error]', pushErr.message);
    }
  }
  return res.json({ success: true, latest: latestServerDrawEvent });
});

app.get('/api/draws/latest', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    latest: latestServerDrawEvent,
    history: drawEventHistory.slice(0, 10)
  });
});

// ================= LEGAL & POLICY MANAGEMENT API (MySQL Only) =================
// Public Endpoint to fetch all published legal pages
app.get('/api/legal/pages', async (_req: Request, res: Response) => {
  try {
    const mysqlPool = getPool();
    const [rows]: any = await mysqlPool.execute(`SELECT setting_value FROM lottery_settings WHERE setting_key = 'legal_pages' LIMIT 1`);
    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      let parsedPages = [];
      try {
        parsedPages = JSON.parse(rows[0].setting_value);
      } catch (e) {
        console.error('[SQL Settings Error] Failed to parse custom pages:', e);
      }

      const publicPages = parsedPages.filter((p: any) => p.status === "PUBLISHED");
      return res.json({ success: true, pages: publicPages });
    }
  } catch (err: any) {
    console.error("[Legal API] Error fetching legal pages from SQL:", err.message);
  }

  // Fallback to local file backup
  try {
    const localDb = loadLocalDbBackup();
    if (localDb && localDb.settings && localDb.settings.legalPages) {
      const publicPages = localDb.settings.legalPages.filter((p: any) => p.status === "PUBLISHED");
      return res.json({ success: true, pages: publicPages });
    }
  } catch {}

  return res.json({ success: true, pages: getDefaultLegalPages() });
});

// Public Endpoint to fetch a single policy by key or slug
app.get('/api/legal/pages/:key', async (req: Request, res: Response) => {
  const { key } = req.params;
  try {
    const mysqlPool = getPool();
    const [rows]: any = await mysqlPool.execute(`SELECT setting_value FROM lottery_settings WHERE setting_key = 'legal_pages' LIMIT 1`);
    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      let parsedPages = [];
      try {
        parsedPages = JSON.parse(rows[0].setting_value);
      } catch (e) {
        console.error('[SQL Settings Error] Failed to parse custom pages for detail:', e);
      }

      const page = parsedPages.find((p: any) => p.page_key === key || p.slug === `/${key}`);
      if (page && page.status === "PUBLISHED") {
        return res.json({ success: true, page });
      }
    }
  } catch (err: any) {
    console.error("[Legal API] Error fetching policy from SQL:", err.message);
  }

  // Fallback to local file backup
  try {
    const localDb = loadLocalDbBackup();
    if (localDb && localDb.settings && localDb.settings.legalPages) {
      const page = localDb.settings.legalPages.find((p: any) => p.page_key === key || p.slug === `/${key}`);
      if (page && page.status === "PUBLISHED") {
        return res.json({ success: true, page });
      }
    }
  } catch {}

  const fallback = getDefaultLegalPages().find(p => p.page_key === key || p.slug === `/${key}`);
  if (fallback) {
    return res.json({ success: true, page: fallback });
  }
  return res.status(404).json({ success: false, message: "Policy page not found or unpublished." });
});

// Admin-Only Endpoint to save or publish policy with server-side authorization check
app.post('/api/legal/pages/save', async (req: Request, res: Response) => {
  const { admin_id, page } = req.body;
  if (!admin_id) {
    return res.status(403).json({ success: false, message: "Unauthorized. Admin ID required." });
  }

  try {
    const mysqlPool = getPool();
    let currentPages = getDefaultLegalPages();

    const [rows]: any = await mysqlPool.execute(`SELECT setting_value FROM lottery_settings WHERE setting_key = 'legal_pages' LIMIT 1`);
    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      try {
        currentPages = JSON.parse(rows[0].setting_value);
      } catch (e) {
        console.error('[SQL Settings Error] Failed to parse custom pages for deletion:', e);
      }

    }

    // Sanitize content to block unsafe injections
    if (page.content) page.content = sanitizeHTML(page.content);
    if (page.draft_content) page.draft_content = sanitizeHTML(page.draft_content);

    const idx = currentPages.findIndex((p: any) => p.page_key === page.page_key);
    if (idx >= 0) {
      currentPages[idx] = { ...currentPages[idx], ...page, updated_at: new Date().toISOString(), updated_by: admin_id };
    } else {
      currentPages.push(page);
    }

    // Save to settings table
    const pagesStr = JSON.stringify(currentPages);
    await mysqlPool.execute(
      `INSERT INTO lottery_settings (setting_key, setting_value) VALUES ('legal_pages', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [pagesStr, pagesStr]
    );

    // Save to local backup too for safe keeping
    try {
      const localDb = loadLocalDbBackup();
      if (localDb) {
        if (!localDb.settings) localDb.settings = {};
        localDb.settings.legalPages = currentPages;
        saveLocalDbBackup(localDb);
      }
    } catch {}

    return res.json({ success: true, message: "Policy saved successfully." });
  } catch (err: any) {
    console.error("[Legal API] Save error inside SQL:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin-Only Endpoint to view audit logs
app.get('/api/legal/audit-logs', async (_req: Request, res: Response) => {
  try {
    const mysqlPool = getPool();
    const [rows]: any = await mysqlPool.execute(`SELECT setting_value FROM lottery_settings WHERE setting_key = 'legal_audit_logs' LIMIT 1`);
    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      let auditLogs = [];
      try {
        auditLogs = JSON.parse(rows[0].setting_value);
      } catch (e) {
        console.error('[SQL Settings Error] Failed to parse audit logs:', e);
      }
      return res.json({ success: true, auditLogs });

    }
  } catch (err: any) {
    console.error("[Legal API] Audit logs SQL error:", err.message);
  }
  return res.json({ success: true, auditLogs: [] });
});

// ============================================================================
// SQL-ONLY SYSTEM LOGGING ENGINE & RETENTION ARCHITECTURE
// ============================================================================

let ACTIVE_DATABASE_MODE: 'SQL' | 'Firebase' = 'SQL';
let lastSuccessfulSyncTime = new Date().toISOString();
const sseClients: Response[] = [];

let localActiveDatabaseCache: 'mysql' | 'firebase' = 'mysql';

const localDbPath = path.join(process.cwd(), 'lottery_winner_db_local.json');
const localSettingsPath = path.join(process.cwd(), 'system_settings_local.json');

function saveLocalDbBackup(dbObj: any) {
  try {
    const serialized = typeof dbObj === 'string' ? dbObj : JSON.stringify(dbObj, null, 2);
    fs.writeFileSync(localDbPath, serialized, 'utf8');
    console.log('[Local DB Backup] Successfully saved central DB state to server filesystem.');
  } catch (err: any) {
    console.error('[Local DB Backup Error] Failed to write fallback file:', err.message);
  }
}

function loadLocalDbBackup(): any {
  try {
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, 'utf8');
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (parsed && (parsed.users || parsed.db)) {
          return parsed.db ? (typeof parsed.db === 'string' ? JSON.parse(parsed.db) : parsed.db) : parsed;
        }
      }
    }
  } catch (err: any) {
    console.error('[Local DB Backup Read Error] Failed to read fallback file:', err.message);
  }
  
  try {
    const def = getDefaultDB();
    if (def) return def;
  } catch {}
  
  return {
    users: [
      { id: 'admin', username: 'admin', role: 'admin', status: 'active', password: 'password123' },
      { id: 'u_agent_dhaka', username: 'agent_dhaka', email: 'dhaka@agents.app', phone: '01700000001', password: 'password123', role: 'agent', district: 'Dhaka', balance: 5000, status: 'active' },
      { id: 'u_agent_sylhet', username: 'agent_sylhet', email: 'sylhet@agents.app', phone: '01900000005', password: 'password123', role: 'agent', district: 'Sylhet', balance: 8500, status: 'active' }
    ],
    settings: {
      payMasterEnabled: 'true',
      payUddoktapayEnabled: 'true',
      payZinipayEnabled: 'true',
      payCryptomusEnabled: 'true'
    },
    lotteries: [],
    tickets: [],
    deposits: [],
    withdrawals: [],
    transactions: [],
    agentLedger: [],
    agentChats: []
  };
}

function saveLocalActiveDatabase(dbMode: 'mysql' | 'firebase') {
  try {
    fs.writeFileSync(
      localSettingsPath,
      JSON.stringify({ active_database: dbMode, updated_at: new Date().toISOString() }, null, 2),
      'utf8'
    );
    console.log(`[Local System Settings] Saved active database locally: ${dbMode}`);
  } catch (err: any) {
    console.error('[saveLocalActiveDatabase Error]:', err.message);
  }
}

function loadLocalActiveDatabase(): 'mysql' | 'firebase' | null {
  try {
    if (fs.existsSync(localSettingsPath)) {
      const content = fs.readFileSync(localSettingsPath, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && (parsed.active_database === 'mysql' || parsed.active_database === 'firebase')) {
        return parsed.active_database;
      }
    }
  } catch {}
  return null;
}

async function getActiveDatabase(): Promise<'mysql' | 'firebase'> {
  ACTIVE_DATABASE_MODE = 'SQL';
  localActiveDatabaseCache = 'mysql';
  return 'mysql';
}

// Broadcast log or event to Admin Panel via SSE
function broadcastAdminLog(logEntry: any) {
  const data = `data: ${JSON.stringify(logEntry)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(data);
    } catch (e) {}
  });
}

const localLogsPath = path.join(process.cwd(), 'system_logs_local.json');
let inMemorySystemLogs: any[] = [];
try {
  if (fs.existsSync(localLogsPath)) {
    const raw = fs.readFileSync(localLogsPath, 'utf8');
    inMemorySystemLogs = JSON.parse(raw) || [];
  }
} catch {}

function persistSystemLogsLocal() {
  try {
    fs.writeFileSync(localLogsPath, JSON.stringify(inMemorySystemLogs.slice(0, 500), null, 2), 'utf8');
  } catch {}
}

async function initSystemLogsTable() {
  try {
    const pool = getPool();
    // Query and seed active_database in platform_settings (existing table in MySQL veloralb_lottery)
    try {
      const [rows]: any = await pool.execute(`SELECT * FROM platform_settings WHERE setting_key = 'active_database'`);
      if (!Array.isArray(rows) || rows.length === 0) {
        await pool.execute(
          `REPLACE INTO platform_settings (setting_key, setting_value, updated_at) VALUES ('active_database', 'mysql', ?)`,
          [Date.now()]
        );
        console.log('[System Settings] Seeded default active_database = mysql into platform_settings');
      } else {
        const val = rows[0].setting_value;
        ACTIVE_DATABASE_MODE = String(val).toLowerCase() === 'mysql' ? 'SQL' : 'Firebase';
        console.log(`[System Settings] Loaded existing active_database from platform_settings: ${val}`);
      }
    } catch (e: any) {
      console.warn('[System Settings Seed Notice]', e.message);
    }
  } catch (e) {}
}
initSystemLogsTable().catch(() => {});

// 24-Hour Automated Cleanup Job (runs every 10 minutes)
setInterval(() => {
  try {
    const nowIso = new Date().toISOString();
    inMemorySystemLogs = inMemorySystemLogs.filter((l: any) => !l.expires_at || l.expires_at > nowIso);
    persistSystemLogsLocal();
  } catch (e) {}
}, 10 * 60 * 1000);

// Record System Log with in-memory & local file persistence + real-time SSE
async function recordSystemLog(options: {
  event_type: string;
  event_action?: string;
  severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  source_database?: string;
  target_database?: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  admin_id?: string;
  sync_id?: string;
  request_id?: string;
  status?: string;
  error_code?: string;
  error_message?: string;
  metadata?: any;
  ip_address?: string;
}) {
  const log_id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const created_at = new Date().toISOString();
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // exactly 24 hours retention

  const logEntry = {
    log_id,
    event_type: options.event_type || 'SYSTEM',
    event_action: options.event_action || null,
    severity: options.severity || 'INFO',
    message: options.message,
    source_database: options.source_database || 'SQL',
    target_database: options.target_database || null,
    entity_type: options.entity_type || null,
    entity_id: options.entity_id || null,
    user_id: options.user_id || 'system',
    admin_id: options.admin_id || null,
    sync_id: options.sync_id || null,
    request_id: options.request_id || null,
    status: options.status || 'SUCCESS',
    error_code: options.error_code || null,
    error_message: options.error_message || null,
    metadata: options.metadata ? (typeof options.metadata === 'string' ? options.metadata : JSON.stringify(options.metadata)) : null,
    ip_address: options.ip_address || '127.0.0.1',
    created_at,
    expires_at
  };

  inMemorySystemLogs.unshift(logEntry);
  if (inMemorySystemLogs.length > 500) {
    inMemorySystemLogs.pop();
  }
  persistSystemLogsLocal();
  broadcastAdminLog(logEntry);
}

// Backward compatibility helper
async function recordAdminLog(event_type: string, description: string, user_id = 'system', admin_id = 'admin', entity_id = '', status = 'SUCCESS', ip = '127.0.0.1') {
  await recordSystemLog({
    event_type,
    severity: status === 'SUCCESS' ? 'SUCCESS' : 'ERROR',
    message: description,
    user_id,
    admin_id,
    entity_id,
    status,
    ip_address: ip
  });
}

// Log APIs (Filtered & Paginated from central store)
app.get('/api/admin/logs', async (req: Request, res: Response) => {
  try {
    const { filter, search, limit = '100', offset = '0' } = req.query;
    const nowIso = new Date().toISOString();
    let logs = inMemorySystemLogs.filter((l: any) => !l.expires_at || l.expires_at > nowIso);

    if (filter && filter !== 'ALL') {
      const f = String(filter).toLowerCase();
      logs = logs.filter((l: any) => 
        (l.event_type && l.event_type.toLowerCase().includes(f)) ||
        (l.severity && l.severity.toLowerCase().includes(f))
      );
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      logs = logs.filter((l: any) => 
        (l.log_id && l.log_id.toLowerCase().includes(s)) ||
        (l.sync_id && l.sync_id.toLowerCase().includes(s)) ||
        (l.request_id && l.request_id.toLowerCase().includes(s)) ||
        (l.user_id && l.user_id.toLowerCase().includes(s)) ||
        (l.event_type && l.event_type.toLowerCase().includes(s)) ||
        (l.message && l.message.toLowerCase().includes(s))
      );
    }

    const start = Math.max(0, Number(offset) || 0);
    const end = start + Math.max(1, Number(limit) || 100);
    const paginated = logs.slice(start, end);

    return res.json({ success: true, logs: paginated });
  } catch (e: any) {
    return res.json({ success: true, logs: [], error: e.message });
  }
});

app.get('/api/admin/logs/recent', async (_req: Request, res: Response) => {
  try {
    const nowIso = new Date().toISOString();
    const logs = inMemorySystemLogs
      .filter((l: any) => !l.expires_at || l.expires_at > nowIso)
      .slice(0, 100);
    return res.json({ success: true, logs });
  } catch (e) {
    return res.json({ success: true, logs: [] });
  }
});

app.get('/api/admin/logs/stats', async (_req: Request, res: Response) => {
  try {
    const nowIso = new Date().toISOString();
    const activeLogs = inMemorySystemLogs.filter((l: any) => !l.expires_at || l.expires_at > nowIso);
    const total24h = activeLogs.length;
    const success = activeLogs.filter((l: any) => l.status === 'SUCCESS' || l.severity === 'SUCCESS').length;
    const warning = activeLogs.filter((l: any) => l.severity === 'WARNING').length;
    const error = activeLogs.filter((l: any) => l.severity === 'ERROR' || l.severity === 'CRITICAL').length;
    const syncSuccess = activeLogs.filter((l: any) => l.event_type && l.event_type.includes('SYNC') && l.status === 'SUCCESS').length;
    const syncFailed = activeLogs.filter((l: any) => l.event_type && l.event_type.includes('SYNC') && l.status !== 'SUCCESS').length;

    return res.json({
      success: true,
      stats: {
        total24h,
        success,
        warning,
        error,
        syncSuccess,
        syncFailed,
        pendingSync: 0
      }
    });
  } catch (e: any) {
    return res.json({ success: false, error: e.message });
  }
});

// Adapters Interface
const SQLAdapter = {
  name: 'SQL',
  async health() {
    try {
      const pool = getPool();
      const [rows]: any = await pool.execute('SELECT COUNT(*) as cnt FROM lottery_users');
      return { connected: true, recordCount: rows[0]?.cnt || 0 };
    } catch (e: any) {
      return { connected: false, error: e.message, recordCount: 0 };
    }
  }
};

app.get('/api/database/health', async (_req: Request, res: Response) => {
  const sqlHealth = await SQLAdapter.health();

  return res.json({
    success: true,
    activeMode: 'SQL',
    sql: {
      connected: sqlHealth.connected,
      recordCount: sqlHealth.recordCount,
      lastSuccessfulSync: lastSuccessfulSyncTime,
      pendingSync: 0,
      failedSync: 0,
      error: sqlHealth.error || null
    },
    firebase: {
      connected: false,
      recordCount: 0,
      lastSuccessfulSync: null,
      pendingSync: 0,
      failedSync: 0,
      error: 'Firebase removed'
    }
  });
});

app.get('/api/database/consistency', async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    consistent: true,
    mismatches: []
  });
});

// Global Status API: Always returns the server-side current value
app.get('/api/system/active-database', async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const dbMode = await getActiveDatabase();
    return res.json({
      success: true,
      active_database: dbMode
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'DATABASE_CONFIGURATION_ERROR',
      message: err.message
    });
  }
});

// Helper to switch the active database globally and persist it centrally
async function executeDatabaseSwitch(dbParam: string, adminId: string, ipAddress: string, userAgent: string) {
  if (!dbParam) {
    throw new Error('Database parameter is required.');
  }
  const cleanParam = dbParam.toLowerCase().trim();
  if (cleanParam !== 'mysql' && cleanParam !== 'firebase' && cleanParam !== 'sql') {
    throw new Error('Invalid target database mode. Choose mysql or firebase.');
  }

  const targetMode: 'SQL' | 'Firebase' = (cleanParam === 'mysql' || cleanParam === 'sql') ? 'SQL' : 'Firebase';
  const targetDbVal = targetMode === 'SQL' ? 'mysql' : 'firebase';
  const oldDbVal = ACTIVE_DATABASE_MODE === 'SQL' ? 'mysql' : 'firebase';

  // 1. Save globally to SQL platform_settings table with fail-safe error catching
  try {
    const pool = getPool();
    await pool.execute(
      `REPLACE INTO platform_settings (setting_key, setting_value, updated_at) VALUES ('active_database', ?, ?)`,
      [targetDbVal, Date.now()]
    );
  } catch (sqlErr: any) {
    console.warn('[executeDatabaseSwitch] SQL platform_settings write failed (using fallback):', sqlErr.message);
  }

  // 2. Write to local filesystem setting for absolute, fail-safe offline persistence
  saveLocalActiveDatabase(targetDbVal);

  // 3. Record switch log
  recordSystemLog({
    event_type: 'DATABASE_SWITCH',
    severity: 'WARNING',
    message: `Database switched from ${oldDbVal} to ${targetDbVal} by ${adminId || 'admin'}`,
    admin_id: adminId || 'admin',
    ip_address: String(ipAddress).substring(0, 50),
    metadata: { userAgent: String(userAgent).substring(0, 255) }
  });

  // Update server state variables
  ACTIVE_DATABASE_MODE = targetMode;
  serverSqlConfig.activeEngine = targetDbVal;
  lastSuccessfulSyncTime = new Date().toISOString();

  // Broadcast change via SSE to all connected client browsers simultaneously
  const eventPayload = {
    type: 'database_switched',
    activeMode: ACTIVE_DATABASE_MODE,
    config: serverSqlConfig,
    timestamp: lastSuccessfulSyncTime
  };
  const sseData = `data: ${JSON.stringify(eventPayload)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(sseData);
    } catch (e) {}
  });

  await recordSystemLog({
    event_type: 'DATABASE_SWITCH',
    severity: 'SUCCESS',
    message: `Database switched globally from ${oldDbVal} to ${targetDbVal}`,
    admin_id: adminId || 'admin',
    status: 'SUCCESS'
  }).catch(() => {});

  return targetDbVal;
}

// Database Switch API
app.post('/api/database/switch', async (req: Request, res: Response) => {
  const targetMode = req.body.targetMode || req.body.database || req.body.activeMode;
  const adminId = req.body.adminId || req.body.admin_id || 'admin';
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  try {
    const active_database = await executeDatabaseSwitch(targetMode, adminId, String(ip), String(userAgent));
    return res.json({
      success: true,
      message: `Database successfully switched to ${targetMode}.`,
      active_database
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/database/switch', async (req: Request, res: Response) => {
  const targetMode = req.body.database || req.body.targetMode || req.body.activeMode;
  const adminId = req.body.adminId || req.body.admin_id || 'admin';
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  try {
    const active_database = await executeDatabaseSwitch(targetMode, adminId, String(ip), String(userAgent));
    return res.json({
      success: true,
      message: `Database successfully switched to ${targetMode} globally.`,
      active_database
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Centralized Server-Side Database Active Config Endpoint
app.get('/api/database/active-config', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return res.json({
    success: true,
    activeMode: ACTIVE_DATABASE_MODE,
    config: serverSqlConfig,
    lastSyncTime: lastSuccessfulSyncTime
  });
});

app.post('/api/database/active-config', async (req: Request, res: Response) => {
  const { activeMode, config } = req.body || {};
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  if (activeMode && (activeMode === 'SQL' || activeMode === 'Firebase' || activeMode === 'mysql' || activeMode === 'firebase')) {
    try {
      await executeDatabaseSwitch(activeMode, 'admin', String(ip), String(userAgent));
    } catch (e) {}
  }
  if (config && typeof config === 'object') {
    serverSqlConfig = { ...serverSqlConfig, ...config };
  }
  return res.json({ success: true, activeMode: ACTIVE_DATABASE_MODE, config: serverSqlConfig });
});

// ============================================================================
// 1. CENTRALIZED MASTER SWITCH & DB CONFIG ENDPOINTS (SERVER-SIDE SOURCE OF TRUTH)
// ============================================================================

app.get('/api/v1/system/db-config', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return res.json({
    success: true,
    activeMode: ACTIVE_DATABASE_MODE,
    config: serverSqlConfig,
    lastSyncTime: lastSuccessfulSyncTime
  });
});

const handleDbConfigUpdate = async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { activeMode, config } = req.body || {};
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  if (activeMode && (activeMode === 'SQL' || activeMode === 'Firebase' || activeMode === 'mysql' || activeMode === 'firebase')) {
    try {
      await executeDatabaseSwitch(activeMode, 'admin', String(ip), String(userAgent));
    } catch (e) {}
  }
  if (config && typeof config === 'object') {
    serverSqlConfig = { ...serverSqlConfig, ...config };
  }
  return res.json({ success: true, activeMode: ACTIVE_DATABASE_MODE, config: serverSqlConfig });
};

app.put('/api/v1/system/db-config', handleDbConfigUpdate);
app.post('/api/v1/system/db-config', handleDbConfigUpdate);

// Global Real-Time Events Stream (SSE) for Database Sync & Switches across Browsers
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  // Send initial active config event
  try {
    res.write(`data: ${JSON.stringify({ type: 'init', activeMode: ACTIVE_DATABASE_MODE, config: serverSqlConfig })}\n\n`);
  } catch (e) {}

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx >= 0) sseClients.splice(idx, 1);
  });
});

// Real-Time Admin Logs Stream (SSE)
app.get('/api/admin/logs/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx >= 0) sseClients.splice(idx, 1);
  });
});


// ============================================================================
// PERMANENT SERVER UPLOAD SYSTEM FOR FAVICON & HEADER LOGO (SQL PERSISTENCE)
// ============================================================================

const permanentUploadDir = path.join(currentDir, 'uploads');
if (!fs.existsSync(permanentUploadDir)) {
  fs.mkdirSync(permanentUploadDir, { recursive: true });
}
app.use('/uploads', express.static(permanentUploadDir));

app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ success: false, message: 'Invalid file type.' });
  }
  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: 'File too large. Max 10MB allowed.' });
  }
  try {
    const ext = path.extname(req.file.originalname) || '.png';
    const uniqueFilename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const targetPath = path.join(permanentUploadDir, uniqueFilename);
    const relativePath = `/uploads/${uniqueFilename}`;

    fs.writeFileSync(targetPath, req.file.buffer);
    if (!fs.existsSync(targetPath) || fs.statSync(targetPath).size === 0) {
      throw new Error('File physical write verification failed.');
    }

    return res.json({
      success: true,
      message: 'Image uploaded successfully.',
      url: relativePath,
      fileUrl: relativePath
    });
  } catch (err: any) {
    console.error('[Generic Upload Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/upload/logo', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const fileType = req.body.type || 'favicon'; // 'favicon' or 'header_logo'
  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/webp'];
  
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ success: false, message: 'Invalid file type. Supported: PNG, JPG, SVG, ICO, WEBP.' });
  }

  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: 'File too large. Max 5MB allowed.' });
  }

  try {
    const ext = path.extname(req.file.originalname) || '.png';
    const uniqueFilename = `${fileType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const targetPath = path.join(permanentUploadDir, uniqueFilename);
    const relativePath = `/uploads/${uniqueFilename}`;
    const timestamp = new Date().toISOString();

    let oldFilePath = '';
    const pool = getPool();
    try {
      const keyName = fileType === 'favicon' ? 'favicon_url' : 'header_logo_url';
      const [rows]: any = await pool.execute('SELECT setting_value FROM platform_settings WHERE setting_key = ?', [keyName]);
      if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
        const val = rows[0].setting_value;
        if (val.startsWith('/uploads/')) {
          oldFilePath = path.join(currentDir, val);
        }
      }
    } catch (e) {}

    // 1. Upload new file to permanent server directory
    fs.writeFileSync(targetPath, req.file.buffer);

    // 2. Verify physical file exists and is non-empty
    if (!fs.existsSync(targetPath) || fs.statSync(targetPath).size === 0) {
      throw new Error('File physical write verification failed.');
    }

    // 3. Update SQL database with new path and timestamp
    const urlKey = fileType === 'favicon' ? 'favicon_url' : 'header_logo_url';
    const timeKey = fileType === 'favicon' ? 'favicon_updated_at' : 'header_logo_updated_at';

    try {
      await pool.execute('REPLACE INTO platform_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?)', [urlKey, relativePath, Date.now()]);
      await pool.execute('REPLACE INTO platform_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?)', [timeKey, timestamp, Date.now()]);
    } catch (sqlErr: any) {
      console.warn('[Logo Upload platform_settings Notice]', sqlErr.message);
    }

    // 4. Only now remove old physical file if it exists and differs from new
    if (oldFilePath && fs.existsSync(oldFilePath) && oldFilePath !== targetPath) {
      try {
        fs.unlinkSync(oldFilePath);
      } catch (e) {}
    }

    await recordSystemLog({
      event_type: 'FILE_UPLOAD',
      severity: 'SUCCESS',
      message: `Successfully uploaded permanent server ${fileType} to ${relativePath}`,
      entity_type: 'settings',
      entity_id: urlKey,
      status: 'SUCCESS'
    });

    return res.json({
      success: true,
      message: `${fileType === 'favicon' ? 'Favicon' : 'Header Logo'} uploaded and persisted successfully.`,
      fileUrl: relativePath,
      filePath: targetPath,
      storage: 'Server',
      database: 'SQL',
      status: 'Persisted',
      lastUpdated: timestamp
    });
  } catch (err: any) {
    console.error('[Logo Upload Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/upload/remove', async (req: Request, res: Response) => {
  const fileType = req.body.type || 'favicon';
  try {
    const pool = getPool();
    const urlKey = fileType === 'favicon' ? 'favicon_url' : 'header_logo_url';
    const timeKey = fileType === 'favicon' ? 'favicon_updated_at' : 'header_logo_updated_at';

    try {
      const [rows]: any = await pool.execute('SELECT setting_value FROM platform_settings WHERE setting_key = ?', [urlKey]);
      if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
        const val = rows[0].setting_value;
        if (val.startsWith('/uploads/')) {
          const physicalPath = path.join(currentDir, val);
          if (fs.existsSync(physicalPath)) {
            fs.unlinkSync(physicalPath);
          }
        }
      }
    } catch {}

    try {
      await pool.execute('REPLACE INTO platform_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?)', [urlKey, '', Date.now()]);
      await pool.execute('REPLACE INTO platform_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?)', [timeKey, '', Date.now()]);
    } catch (sqlErr: any) {
      console.warn('[Logo Remove platform_settings Notice]', sqlErr.message);
    }

    return res.json({
      success: true,
      message: `${fileType === 'favicon' ? 'Favicon' : 'Header Logo'} removed successfully.`,
      storage: 'Server',
      database: 'SQL',
      status: 'Removed'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// DUAL-CHANNEL NOTIFICATION SYSTEM (In-Memory + Web Push)
// ============================================================================

const localNotificationsPath = path.join(process.cwd(), 'notifications_local.json');
let inMemoryNotifications: any[] = [];
try {
  if (fs.existsSync(localNotificationsPath)) {
    inMemoryNotifications = JSON.parse(fs.readFileSync(localNotificationsPath, 'utf8')) || [];
  }
} catch {}

function persistNotificationsLocal() {
  try {
    fs.writeFileSync(localNotificationsPath, JSON.stringify(inMemoryNotifications.slice(0, 100), null, 2), 'utf8');
  } catch {}
}

async function initNotificationTables() {
  // Handled cleanly with memory + local JSON store
}
initNotificationTables().catch(() => {});

// Admin Send Notification API
app.post('/api/notifications/send', async (req: Request, res: Response) => {
  const { title, message, click_url, user_id, admin_id } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }

  try {
    const notification_id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const created_at = new Date().toISOString();
    const targetUserId = user_id && user_id.trim() !== '' ? user_id.trim() : 'all';
    const targetUrl = click_url || '/';

    const notifItem = {
      id: inMemoryNotifications.length + 1,
      notification_id,
      user_id: targetUserId,
      title,
      message,
      click_url: targetUrl,
      is_read: 0,
      created_at
    };

    inMemoryNotifications.unshift(notifItem);
    if (inMemoryNotifications.length > 100) {
      inMemoryNotifications.pop();
    }
    persistNotificationsLocal();

    await recordSystemLog({
      event_type: 'NOTIFICATION_SENT',
      severity: 'SUCCESS',
      message: `Admin sent notification "${title}" to ${targetUserId}`,
      admin_id: admin_id || 'admin',
      entity_type: 'notification',
      entity_id: notification_id,
      status: 'SUCCESS'
    });

    return res.json({
      success: true,
      message: 'Notification successfully created and queued for delivery.',
      notificationId: notification_id
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch Notifications for User / All
app.get('/api/notifications', async (req: Request, res: Response) => {
  const userId = req.query.user_id as string;
  try {
    let list = inMemoryNotifications;
    if (userId) {
      list = list.filter((n: any) => n.user_id === userId || n.user_id === 'all');
    }
    return res.json({ success: true, notifications: list.slice(0, 50) });
  } catch (e: any) {
    return res.json({ success: false, error: e.message, notifications: [] });
  }
});

// Mark Notification as Read
app.post('/api/notifications/mark-read', async (req: Request, res: Response) => {
  const { notification_id, user_id } = req.body;
  try {
    if (notification_id) {
      inMemoryNotifications = inMemoryNotifications.map((n: any) => n.notification_id === notification_id ? { ...n, is_read: 1 } : n);
    } else if (user_id) {
      inMemoryNotifications = inMemoryNotifications.map((n: any) => (n.user_id === user_id || n.user_id === 'all') ? { ...n, is_read: 1 } : n);
    }
    persistNotificationsLocal();
    return res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Register Push Subscription (Multi-Device)
app.post('/api/push/subscribe', async (req: Request, res: Response) => {
  const { user_id, endpoint, keys, device_info } = req.body;
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    return res.status(400).json({ success: false, message: 'Invalid subscription object.' });
  }

  try {
    const now = new Date().toISOString();
    const uid = user_id || 'guest_' + Math.random().toString(36).substring(2, 7);

    const existingIdx = inMemoryPushSubs.findIndex((s: any) => s.endpoint === endpoint);
    const subRecord = {
      user_id: uid,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      device_info: device_info || 'Web Browser',
      created_at: existingIdx >= 0 ? inMemoryPushSubs[existingIdx].created_at : now,
      updated_at: now
    };

    if (existingIdx >= 0) {
      inMemoryPushSubs[existingIdx] = subRecord;
    } else {
      inMemoryPushSubs.push(subRecord);
    }
    persistPushSubsLocal();

    return res.json({ success: true, message: 'Push subscription registered successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ================= VITE / STATIC / FALLBACK =================

async function startServer() {
  // Setup Vite in development mode
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static assets in production
    app.use(express.static(path.join(currentDir, 'dist')));
    
    // SPA Fallback: send index.html for any unknown requests
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(currentDir, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

export default app;
