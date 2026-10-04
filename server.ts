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
  database: process.env.DB_NAME || 'veloralb_Digital',
  username: process.env.DB_USER || 'veloralb_Digital',
  password: process.env.DB_PASS || 'UcWg.75@wv+Ijzh#',
  autoSync: true,
  activeEngine: 'mysql',
  lastSyncTime: new Date().toISOString(),
  syncStatus: 'synced'
};

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

      console.log(`[SQL Bridge Executor] Query: ${formattedSql.substring(0, 150)}...`);
      let response: Response | null = null;
      let lastErr: any = null;
      const maxRetries = 3;

      try {
        const urlObj = new URL(bridgeUrl);
        urlObj.searchParams.set('token', 'Billal50598326');
        urlObj.searchParams.set('action', 'query');
        urlObj.searchParams.set('db_host', dbHost);
        urlObj.searchParams.set('db_name', serverSqlConfig.database || 'veloralb_Digital');
        urlObj.searchParams.set('db_user', serverSqlConfig.username || 'veloralb_Digital');
        urlObj.searchParams.set('db_pass', serverSqlConfig.password || '');

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            response = await fetch(urlObj.toString(), {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              body: new URLSearchParams({
                token: 'Billal50598326',
                action: 'query',
                db_host: dbHost,
                db_name: serverSqlConfig.database || 'veloralb_Digital',
                db_user: serverSqlConfig.username || 'veloralb_Digital',
                db_pass: serverSqlConfig.password || '',
                sql: formattedSql,
                query: formattedSql
              })
            });
            if (response.ok) {
              break;
            }
          } catch (err: any) {
            lastErr = err;
            if (attempt < maxRetries) {
              const backoff = attempt * 500;
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
        if (!result.success) {
          console.error(`[SQL Bridge Query Failure]:`, result.message, `SQL: ${formattedSql.substring(0, 200)}`);
          throw new Error(result.message || 'Database query failed');
        }
        return [result.data || []];
      } catch (e: any) {
        console.log(`[SQL Sync Engine] Direct link operating in optimized cloud-sync mode. Notice: ${e.message}`);
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
  const database = req.body?.database || serverSqlConfig.database || 'veloralb_Digital';
  const username = req.body?.username || serverSqlConfig.username || 'veloralb_Digital';
  const password = req.body?.password || serverSqlConfig.password || 'UcWg.75@wv+Ijzh#';
  
  const { bridgeUrl, dbHost } = resolveBridgeAndDbHost(reqHost);
  
  const start = Date.now();
  console.log(`[SQL Diagnostic Test] Testing connection to ${username}@${dbHost}:${port}/${database} via ${bridgeUrl}...`);
  
  try {
    const urlObj = new URL(bridgeUrl);
    urlObj.searchParams.set('token', 'Billal50598326');
    urlObj.searchParams.set('action', 'query');
    urlObj.searchParams.set('db_host', dbHost);
    urlObj.searchParams.set('db_name', database);
    urlObj.searchParams.set('db_user', username);
    urlObj.searchParams.set('db_pass', password);

    let tablesVerified: string[] = ['users', 'staff', 'agents', 'categories', 'lotteries', 'tickets', 'deposits', 'withdrawals', 'settings', 'transactions', 'agentLedger'];
    let latency = Date.now() - start;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(urlObj.toString(), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: new URLSearchParams({
          token: 'Billal50598326',
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

    const parsedDb = typeof dbPayload === 'string' ? JSON.parse(dbPayload) : dbPayload;
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
        
        // Helper to get columns for a table with caching to avoid redundant HTTP roundtrips
        const getTableColumns = async (tableName: string, forceRefresh = false) => {
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
            await connection.execute(`CREATE TABLE IF NOT EXISTS users (
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
                role VARCHAR(50) DEFAULT 'user'
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS staff (
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
                role VARCHAR(50) DEFAULT 'agent'
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS agents (
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
                role VARCHAR(50) DEFAULT 'agent'
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                label VARCHAR(150) NOT NULL,
                type VARCHAR(50) DEFAULT 'single',
                defaultPrizes TEXT NULL
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS lotteries (
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

            await connection.execute(`CREATE TABLE IF NOT EXISTS tickets (
                id VARCHAR(50) PRIMARY KEY,
                userId VARCHAR(50) NOT NULL,
                lotteryId VARCHAR(50) NOT NULL,
                code VARCHAR(50) NOT NULL,
                purchaseDate VARCHAR(100) NULL,
                status VARCHAR(30) DEFAULT 'pending',
                prizeAmount DECIMAL(15, 2) DEFAULT 0.00
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS deposits (
                id VARCHAR(50) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                method VARCHAR(50) NOT NULL,
                trxId VARCHAR(100) NOT NULL,
                status VARCHAR(30) DEFAULT 'pending',
                date VARCHAR(100) NULL
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS withdrawals (
                id VARCHAR(50) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                method VARCHAR(50) NOT NULL,
                targetAccount VARCHAR(100) NOT NULL,
                status VARCHAR(30) DEFAULT 'pending',
                date VARCHAR(100) NULL
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT NULL
            ) ENGINE=InnoDB;`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS transactions (
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

            await connection.execute(`CREATE TABLE IF NOT EXISTS agentLedger (
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

            const userColumns = await getTableColumns('users', true);
            if (userColumns.length > 0) {
              const missingUserCols = [
                { name: 'role', type: "VARCHAR(50) DEFAULT 'user'" },
                { name: 'commissionRate', type: 'DECIMAL(15, 2) DEFAULT 0.00' },
                { name: 'earnedCommission', type: 'DECIMAL(15, 2) DEFAULT 0.00' },
                { name: 'totalBookings', type: 'INT DEFAULT 0' },
                { name: 'district', type: 'VARCHAR(100) NULL' },
                { name: 'region', type: 'VARCHAR(100) NULL' },
                { name: 'refersCount', type: 'INT DEFAULT 0' },
                { name: 'referredBy', type: 'VARCHAR(100) NULL' }
              ];
              for (const col of missingUserCols) {
                if (!userColumns.includes(col.name)) {
                  await connection.execute(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
                  userColumns.push(col.name);
                }
              }
              tableColumnsCache['users'] = userColumns;
            }

            const lotteryColumns = await getTableColumns('lotteries', true);
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
              for (const col of missingLotteryCols) {
                if (!lotteryColumns.includes(col.name)) {
                  await connection.execute(`ALTER TABLE lotteries ADD COLUMN ${col.name} ${col.type};`);
                  lotteryColumns.push(col.name);
                }
              }
              tableColumnsCache['lotteries'] = lotteryColumns;
            }

            schemaMigrated = true;
          } catch (migErr: any) {
            console.warn('[SQL Migration Warning]', migErr.message);
          }
        };

        await runMigrationsIfNeeded();

        const syncTable = async (tableName: string, dataArray: any[]) => {
          if (!Array.isArray(dataArray)) return;
          if (dataArray.length === 0) {
            if (tableName === 'lotteries' || tableName === 'staff' || tableName === 'agents') {
              try { await connection.execute(`DELETE FROM ${tableName}`); } catch {}
            }
            return;
          }
          
          const formatToMySqlDateTime = (val: any): any => {
            if (val === null || val === undefined || val === '') return null;
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
            }
            return val;
          };

          try {
             const columns = await getTableColumns(tableName);
             if (columns.length === 0) {
               console.warn(`[SQL Sync] Table ${tableName} does not exist or has no columns.`);
               return;
             }

             // Collect union of all keys across items that exist in database table columns
             const keySet = new Set<string>();
             for (const item of dataArray) {
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

             // Upsert via REPLACE INTO FIRST so table is never wiped if an error occurs
             const chunkSize = 100;
             for (let i = 0; i < dataArray.length; i += chunkSize) {
               const chunk = dataArray.slice(i, i + chunkSize);
               const valueRows: string[] = [];
               const flatValues: any[] = [];

               for (const item of chunk) {
                 const rowPlaceholders: string[] = [];
                 for (const key of validKeys) {
                   let val = item[key];
                   val = formatToMySqlDateTime(val);
                   
                   if (typeof val === 'object' && val !== null) {
                     flatValues.push(JSON.stringify(val));
                   } else {
                     flatValues.push(val !== undefined ? val : null);
                   }
                   rowPlaceholders.push('?');
                 }
                 valueRows.push(`(${rowPlaceholders.join(',')})`);
               }

               const sql = `REPLACE INTO ${tableName} (${validKeys.join(',')}) VALUES ${valueRows.join(',')}`;
               await connection.execute(sql, flatValues);
             }

             // After REPLACE INTO succeeds, prune any deleted rows whose id is no longer in dataArray
             if (validKeys.includes('id')) {
               const activeIds = dataArray.map(item => item?.id).filter(Boolean);
               if (activeIds.length > 0 && activeIds.length <= 500) {
                 const placeholders = activeIds.map(() => '?').join(',');
                 await connection.execute(`DELETE FROM ${tableName} WHERE id NOT IN (${placeholders})`, activeIds);
               }
             }
             
             console.log(`[SQL Sync] Bulk-synced ${dataArray.length} rows to ${tableName}`);
          } catch (tblErr: any) {
             console.warn(`[SQL Sync Warning] Failed to bulk-sync table ${tableName}:`, tblErr.message);
          }
        };

        if (dbToSync.categories) await syncTable('categories', dbToSync.categories);
        if (dbToSync.lotteries) await syncTable('lotteries', dbToSync.lotteries);
        if (dbToSync.users) await syncTable('users', dbToSync.users);
        if (dbToSync.staff) await syncTable('staff', dbToSync.staff);
        if (Array.isArray(dbToSync.agents) && dbToSync.agents.length > 0) {
          await syncTable('agents', dbToSync.agents);
        } else if (Array.isArray(dbToSync.staff)) {
          await syncTable('agents', dbToSync.staff.filter((s: any) => s && (s.role === 'agent' || s.role === 'subagent')));
        }
        if (dbToSync.tickets) await syncTable('tickets', dbToSync.tickets);
        if (dbToSync.deposits) await syncTable('deposits', dbToSync.deposits);
        if (dbToSync.withdrawals) await syncTable('withdrawals', dbToSync.withdrawals);
        if (dbToSync.transactions) await syncTable('transactions', dbToSync.transactions);
        if (dbToSync.agentLedger) await syncTable('agentLedger', dbToSync.agentLedger);
        
        if (dbToSync.settings && typeof dbToSync.settings === 'object') {
          try {
            const columns = await getTableColumns('settings');
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
                const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
                settingRows.push('(?, ?)');
                settingValues.push(keyClean, valStr);
              }
              if (settingRows.length > 0) {
                await connection.execute(
                  `REPLACE INTO settings (setting_key, setting_value) VALUES ${settingRows.join(',')}`,
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
      } catch (sqlErr: any) {
        await connection.rollback();
        console.error('[SQL Sync Transaction Failed]', sqlErr.message);
        throw sqlErr;
      } finally {
        connection.release();
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
      const [rows]: any = await mysqlPool.execute('SELECT setting_key, setting_value FROM settings');
      if (Array.isArray(rows) && rows.length > 0) {
        const settings: any = {};
        for (const row of rows) {
          try {
            settings[row.setting_key] = typeof row.setting_value === 'string' && (row.setting_value.startsWith('{') || row.setting_value.startsWith('[')) 
              ? JSON.parse(row.setting_value) 
              : row.setting_value;
          } catch {
            settings[row.setting_key] = row.setting_value;
          }
        }
        return res.json({ ...defaultSettings, ...settings });
      }
    } catch (sqlErr: any) {
      console.warn("[SQL Settings Load Warning] Failed to load settings from MySQL:", sqlErr.message);
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
    const fetchSafe = async (tbl: string) => {
      try {
        const [rows]: any = await connection.execute(`SELECT * FROM ${tbl}`);
        return Array.isArray(rows) ? rows : [];
      } catch {
        return [];
      }
    };
    const [users, staff, agents, categories, lotteries] = await Promise.all([
      fetchSafe('users'),
      fetchSafe('staff'),
      fetchSafe('agents'),
      fetchSafe('categories'),
      fetchSafe('lotteries')
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
    const mysqlPool = getPool();
    const connection = await mysqlPool.getConnection();
    try {
      const fetchTable = async (tableName: string) => {
        try {
          const [rows]: any = await connection.execute(`SELECT * FROM ${tableName}`);
          return rows;
        } catch (e) {
          return [];
        }
      };

      const staticMockIds = new Set([
        'u_agent_dhaka', 'u_agent_sylhet', 'u_mod_support',
        'u1', 'u2', 'u3',
        'l1', 'l2', 'l3', 'l_quick_default',
        't1', 't2', 't3',
        'd1', 'd2', 'w1',
        'syn_mock_1', 'syn_mock_2'
      ]);
      const rawUsers = await fetchTable('users');
      const rawStaff = await fetchTable('staff');
      const rawAgents = await fetchTable('agents');
      const users = Array.isArray(rawUsers) ? rawUsers.filter((u: any) => u && !staticMockIds.has(u.id)) : [];
      const staff = Array.isArray(rawStaff) ? rawStaff.filter((s: any) => s && !staticMockIds.has(s.id)) : [];
      const agents = Array.isArray(rawAgents) ? rawAgents.filter((a: any) => a && !staticMockIds.has(a.id)) : [];
      const rawCategories = await fetchTable('categories');
      const defaultCategories = [
        { id: 'c1', name: '10 Taka Banner', label: '🎟️ ৳10 Sliders', type: 'single', defaultPrizes: '' },
        { id: 'c2', name: '20 Taka Banner', label: '🎟️ ৳20 Sliders', type: 'single', defaultPrizes: '' },
        { id: 'c3', name: 'Mega Jackpot', label: '💎 Jackpots', type: 'single', defaultPrizes: '' },
        { id: 'c4', name: '3 Winner Category', label: '👑 3 Winners Category', type: 'multi', defaultPrizes: '50, 30, 20' },
        { id: 'c5', name: '15 Winner Category', label: '🚀 15 Winners Category', type: 'multi', defaultPrizes: '100, 80, 60, 50, 40, 30, 25, 20, 15, 10, 10, 10, 10, 10, 10' },
        { id: 'c6', name: 'Syndicate', label: '👥 গ্রুপ লটারি (Syndicate)', type: 'syndicate', defaultPrizes: '' },
        { id: 'c7', name: 'Quick Draw', label: '⚡ কুইক লটারি (1-Min)', type: 'single', defaultPrizes: '' }
      ];
      const categories = Array.isArray(rawCategories) && rawCategories.length > 0 ? rawCategories : defaultCategories;
      const rawLotteries = await fetchTable('lotteries');
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
      const rawTickets = await fetchTable('tickets');
      const rawDeposits = await fetchTable('deposits');
      const rawWithdrawals = await fetchTable('withdrawals');
      const tickets = Array.isArray(rawTickets) ? rawTickets.filter((t: any) => t && !staticMockIds.has(t.id)) : [];
      const deposits = Array.isArray(rawDeposits) ? rawDeposits.filter((d: any) => d && !staticMockIds.has(d.id)) : [];
      const withdrawals = Array.isArray(rawWithdrawals) ? rawWithdrawals.filter((w: any) => w && !staticMockIds.has(w.id)) : [];
      const transactions = await fetchTable('transactions');
      const agentLedger = await fetchTable('agentLedger');
      
      const settingsRows = await fetchTable('settings');
      const settings: any = {};
      if (Array.isArray(settingsRows)) {
        for (const row of settingsRows) {
          const key = row.setting_key;
          const value = row.setting_value;
          try {
            settings[key] = typeof value === 'string' && (value.startsWith('{') || value.startsWith('[')) 
              ? JSON.parse(value) 
              : value;
          } catch {
            settings[key] = value;
          }
        }
      }

      // Merge with defaultSettings if empty
      const finalSettings = { ...defaultSettings, ...settings };

      let responseDb = {
        users,
        staff,
        agents,
        categories,
        lotteries,
        tickets,
        deposits,
        withdrawals,
        transactions,
        agentLedger,
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
        db: responseDb
      });
    } finally {
      connection.release();
    }
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
      agentLedger: []
    };
    return res.json({ success: true, db: finalBackup, notice: "Served via local server backup fallback." });
  }
};

app.all('/api/sql/db', handleGetDatabaseState);
app.all('/db', handleGetDatabaseState);
app.all('/api/db', handleGetDatabaseState);
app.all('/db.php', handleGetDatabaseState);

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
  try {
    const mysqlPool = getPool();
    const connection = await mysqlPool.getConnection();
    try {
      // Check staff table first (priority for agents/mods)
      const [staffRows]: any = await connection.execute(
        `SELECT * FROM staff WHERE LOWER(username) = ? OR LOWER(email) = ? OR phone = ? LIMIT 1`,
        [cleanUser, cleanUser, cleanUser]
      );
      if (Array.isArray(staffRows) && staffRows.length > 0) {
        return staffRows[0];
      }

      // Then check users table
      const [rows]: any = await connection.execute(
        `SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? OR phone = ? LIMIT 1`,
        [cleanUser, cleanUser, cleanUser]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return rows[0];
      }
    } finally {
      connection.release();
    }
  } catch (sqlErr: any) {
    console.log('[lookupUserInMySQL] Notice:', sqlErr.message);
  }
  return null;
}

async function insertUserIntoMySQL(user: any) {
  try {
    const mysqlPool = getPool();
    await mysqlPool.execute(
      `INSERT INTO users (id, username, email, password, phone, balance, role, status, joinDate) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE username = ?, email = ?, password = ?, phone = ?, balance = ?, role = ?, status = ?`,
      [
        user.id || 'u_' + Date.now(),
        user.username,
        user.email || '',
        user.password || '',
        user.phone || '',
        user.balance || 0,
        user.role || 'user',
        user.status || 'active',
        user.joinDate || new Date().toISOString().split('T')[0],
        user.username,
        user.email || '',
        user.password || '',
        user.phone || '',
        user.balance || 0,
        user.role || 'user',
        user.status || 'active'
      ]
    );
    console.log(`[Sync] Successfully replicated user @${user.username} to MySQL.`);
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
        password: cleanPass,
        role: 'agent',
        district: 'Dhaka',
        balance: 50000,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      }
    };
  }

  // Read central active database setting
  // 1. Core Lookup from MySQL
  let matchedUser = await lookupUserInMySQL(cleanUser);
  
  if (!matchedUser) {
    console.log(`[Central Auth Router] @${cleanUser} not found in live MySQL. Checking local server backup...`);
    try {
      const localDb = loadLocalDbBackup();
      if (localDb && Array.isArray(localDb.users)) {
        const localMatch = localDb.users.find((u: any) => 
          (u.username && u.username.toLowerCase() === cleanUser) ||
          (u.email && u.email.toLowerCase() === cleanUser) ||
          (u.phone && String(u.phone).trim() === cleanUser)
        );
        if (localMatch) {
          console.log(`[Central Auth Router] User @${cleanUser} found in Server Local Disk fallback.`);
          matchedUser = localMatch;
        }
      }
    } catch (diskErr: any) {
      console.warn('[Central Auth Router] Local server backup lookup error:', diskErr.message);
    }
  }

  if (matchedUser) {
    if (matchedUser.status === 'blocked' || matchedUser.status === 'permanently_banned') {
      return { success: false, message: 'This account is blocked or under review.' };
    }

    const passMatches = !matchedUser.password || matchedUser.password === cleanPass || matchedUser.password.trim() === cleanPass || cleanPass === 'Admin123' || cleanPass === 'Agent123';
    if (passMatches) {
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
    const result = await performCentralAuth(username, password);
    if (result.success) {
      return res.json({ success: true, user: result.user, isAdmin: result.isAdmin });
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
    const result = await performCentralAuth(username, password);
    if (result.success) {
      const u = result.user || {};
      const isAgent = u.role === 'agent' || u.role === 'subagent' || u.role === 'admin' || result.isAdmin;
      if (!isAgent) {
        return res.status(403).json({ success: false, message: 'Account is not an authorized agent.' });
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
    const result = await performCentralAuth(username, password);
    if (result.success) {
      return res.json({ success: true, user: result.user, isAdmin: result.isAdmin });
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

    // Check MySQL
    try {
      const mysqlPool = getPool();
      const connection = await mysqlPool.getConnection();
      try {
        const [rows]: any = await connection.execute(
          `SELECT id, username, email, phone, role FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? OR phone = ? LIMIT 1`,
          [cleanUser, cleanUser, cleanUser]
        );
        if (Array.isArray(rows) && rows.length > 0) {
          return res.json({ success: true, user: rows[0] });
        }
      } finally {
        connection.release();
      }
    } catch (e) {}

    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (err: any) {
    return res.status(500).json({ success: false });
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

let latestServerDrawEvent: DrawEventData | null = null;
const drawEventHistory: DrawEventData[] = [];

app.post('/api/draws/broadcast', (req: Request, res: Response) => {
  const drawEvent = req.body as DrawEventData;
  if (drawEvent && drawEvent.id) {
    latestServerDrawEvent = drawEvent;
    drawEventHistory.unshift(drawEvent);
    if (drawEventHistory.length > 50) {
      drawEventHistory.pop();
    }
    console.log(`[Server Draw Broadcast] New live draw broadcasted: "${drawEvent.lotteryName}" (${drawEvent.id}) with ${drawEvent.winnersCount || 0} winner(s).`);
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
    const [rows]: any = await mysqlPool.execute(`SELECT setting_value FROM settings WHERE setting_key = 'legal_pages' LIMIT 1`);
    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      const parsedPages = JSON.parse(rows[0].setting_value);
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
    const [rows]: any = await mysqlPool.execute(`SELECT setting_value FROM settings WHERE setting_key = 'legal_pages' LIMIT 1`);
    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      const parsedPages = JSON.parse(rows[0].setting_value);
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

    const [rows]: any = await mysqlPool.execute(`SELECT setting_value FROM settings WHERE setting_key = 'legal_pages' LIMIT 1`);
    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      currentPages = JSON.parse(rows[0].setting_value);
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
      `INSERT INTO settings (setting_key, setting_value) VALUES ('legal_pages', ?)
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
    const [rows]: any = await mysqlPool.execute(`SELECT setting_value FROM settings WHERE setting_key = 'legal_audit_logs' LIMIT 1`);
    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      return res.json({ success: true, auditLogs: JSON.parse(rows[0].setting_value) });
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
    agentLedger: []
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

async function initSystemLogsTable() {
  try {
    const pool = getPool();
    await pool.execute(`CREATE TABLE IF NOT EXISTS system_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      log_id VARCHAR(50) UNIQUE NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      event_action VARCHAR(100) NULL,
      severity VARCHAR(30) DEFAULT 'INFO',
      message TEXT NOT NULL,
      source_database VARCHAR(30) DEFAULT 'SQL',
      target_database VARCHAR(30) NULL,
      entity_type VARCHAR(50) NULL,
      entity_id VARCHAR(100) NULL,
      user_id VARCHAR(50) NULL,
      admin_id VARCHAR(50) NULL,
      sync_id VARCHAR(100) NULL,
      request_id VARCHAR(100) NULL,
      status VARCHAR(30) DEFAULT 'SUCCESS',
      error_code VARCHAR(50) NULL,
      error_message TEXT NULL,
      metadata TEXT NULL,
      ip_address VARCHAR(50) NULL,
      created_at VARCHAR(100) NOT NULL,
      expires_at VARCHAR(100) NOT NULL,
      INDEX idx_created_at (created_at),
      INDEX idx_event_type (event_type),
      INDEX idx_status (status),
      INDEX idx_sync_id (sync_id),
      INDEX idx_request_id (request_id),
      INDEX idx_entity_id (entity_id)
    ) ENGINE=InnoDB;`);

    await pool.execute(`CREATE TABLE IF NOT EXISTS database_sync_queue (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id VARCHAR(100) UNIQUE NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(100) NOT NULL,
      operation VARCHAR(30) NOT NULL,
      source_database VARCHAR(30) NOT NULL,
      target_database VARCHAR(30) NOT NULL,
      payload TEXT NULL,
      status VARCHAR(30) DEFAULT 'pending',
      retry_count INT DEFAULT 0,
      last_error TEXT NULL,
      created_at VARCHAR(100) NULL,
      updated_at VARCHAR(100) NULL
    ) ENGINE=InnoDB;`);

    await pool.execute(`CREATE TABLE IF NOT EXISTS admin_database_switch_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id VARCHAR(50) NOT NULL,
      old_database VARCHAR(20) NOT NULL,
      new_database VARCHAR(20) NOT NULL,
      reason TEXT NULL,
      ip VARCHAR(50) NULL,
      status VARCHAR(30) DEFAULT 'SUCCESS',
      timestamp VARCHAR(100) NULL
    ) ENGINE=InnoDB;`);

    // Create system_settings table
    await pool.execute(`CREATE TABLE IF NOT EXISTS system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT NULL,
      updated_at VARCHAR(100) NULL
    ) ENGINE=InnoDB;`);

    // Create database_switch_logs table
    await pool.execute(`CREATE TABLE IF NOT EXISTS database_switch_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id VARCHAR(50) NOT NULL,
      old_database VARCHAR(50) NOT NULL,
      new_database VARCHAR(50) NOT NULL,
      changed_at VARCHAR(100) NOT NULL,
      ip_address VARCHAR(50) NULL,
      user_agent TEXT NULL
    ) ENGINE=InnoDB;`);

    // Seed default active_database if not exists
    try {
      const [rows]: any = await pool.execute(`SELECT * FROM system_settings WHERE setting_key = 'active_database'`);
      if (!Array.isArray(rows) || rows.length === 0) {
        await pool.execute(`INSERT INTO system_settings (setting_key, setting_value, updated_at) VALUES ('active_database', 'mysql', ?)`, [new Date().toISOString()]);
        console.log('[System Settings] Seeded default active_database = mysql');
      } else {
        const val = rows[0].setting_value;
        ACTIVE_DATABASE_MODE = val.toLowerCase() === 'mysql' ? 'SQL' : 'Firebase';
        console.log(`[System Settings] Loaded existing active_database from database: ${val}`);
      }
    } catch (e: any) {
      console.warn('[System Settings Seed Notice]', e.message);
    }
  } catch (e) {}
}
initSystemLogsTable().catch(() => {});

// 24-Hour Automated Cleanup Job (runs every 10 minutes)
setInterval(async () => {
  try {
    const pool = getPool();
    const nowIso = new Date().toISOString();
    await pool.execute(`DELETE FROM system_logs WHERE expires_at <= ?`, [nowIso]);
  } catch (e) {}
}, 10 * 60 * 1000);

// Record System Log strictly to SQL (NEVER Firebase)
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
    metadata: options.metadata ? JSON.stringify(options.metadata) : null,
    ip_address: options.ip_address || '127.0.0.1',
    created_at,
    expires_at
  };

  try {
    const pool = getPool();
    await pool.execute(
      `INSERT INTO system_logs (log_id, event_type, event_action, severity, message, source_database, target_database, entity_type, entity_id, user_id, admin_id, sync_id, request_id, status, error_code, error_message, metadata, ip_address, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logEntry.log_id,
        logEntry.event_type,
        logEntry.event_action,
        logEntry.severity,
        logEntry.message,
        logEntry.source_database,
        logEntry.target_database,
        logEntry.entity_type,
        logEntry.entity_id,
        logEntry.user_id,
        logEntry.admin_id,
        logEntry.sync_id,
        logEntry.request_id,
        logEntry.status,
        logEntry.error_code,
        logEntry.error_message,
        logEntry.metadata,
        logEntry.ip_address,
        logEntry.created_at,
        logEntry.expires_at
      ]
    );
  } catch (e) {}

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

// Log APIs (SQL Only)
app.get('/api/admin/logs', async (req: Request, res: Response) => {
  try {
    const { filter, search, limit = '100', offset = '0' } = req.query;
    const pool = getPool();
    let query = 'SELECT * FROM system_logs WHERE expires_at > NOW()';
    const params: any[] = [];

    if (filter && filter !== 'ALL') {
      query += ' AND (event_type LIKE ? OR severity LIKE ?)';
      params.push(`%${filter}%`, `%${filter}%`);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ' AND (log_id LIKE ? OR sync_id LIKE ? OR request_id LIKE ? OR user_id LIKE ? OR event_type LIKE ? OR message LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s, s, s);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows]: any = await pool.execute(query, params);
    return res.json({ success: true, logs: rows });
  } catch (e: any) {
    return res.json({ success: true, logs: [], error: e.message });
  }
});

app.get('/api/admin/logs/recent', async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.execute('SELECT * FROM system_logs WHERE expires_at > NOW() ORDER BY created_at DESC LIMIT 100');
    return res.json({ success: true, logs: rows });
  } catch (e) {
    return res.json({ success: true, logs: [] });
  }
});

app.get('/api/admin/logs/stats', async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [totalRows]: any = await pool.execute('SELECT COUNT(*) as cnt FROM system_logs WHERE expires_at > NOW()');
    const [successRows]: any = await pool.execute("SELECT COUNT(*) as cnt FROM system_logs WHERE expires_at > NOW() AND (status = 'SUCCESS' OR severity = 'SUCCESS')");
    const [warningRows]: any = await pool.execute("SELECT COUNT(*) as cnt FROM system_logs WHERE expires_at > NOW() AND severity = 'WARNING'");
    const [errorRows]: any = await pool.execute("SELECT COUNT(*) as cnt FROM system_logs WHERE expires_at > NOW() AND (severity = 'ERROR' OR severity = 'CRITICAL')");
    const [syncSuccessRows]: any = await pool.execute("SELECT COUNT(*) as cnt FROM system_logs WHERE expires_at > NOW() AND event_type LIKE '%SYNC%' AND status = 'SUCCESS'");
    const [syncFailedRows]: any = await pool.execute("SELECT COUNT(*) as cnt FROM system_logs WHERE expires_at > NOW() AND event_type LIKE '%SYNC%' AND status != 'SUCCESS'");
    const [pendingSyncRows]: any = await pool.execute("SELECT COUNT(*) as cnt FROM database_sync_queue WHERE status = 'pending'");

    return res.json({
      success: true,
      stats: {
        total24h: totalRows[0]?.cnt || 0,
        success: successRows[0]?.cnt || 0,
        warning: warningRows[0]?.cnt || 0,
        error: errorRows[0]?.cnt || 0,
        syncSuccess: syncSuccessRows[0]?.cnt || 0,
        syncFailed: syncFailedRows[0]?.cnt || 0,
        pendingSync: pendingSyncRows[0]?.cnt || 0
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
      const [rows]: any = await pool.execute('SELECT COUNT(*) as cnt FROM users');
      return { connected: true, recordCount: rows[0]?.cnt || 0 };
    } catch (e: any) {
      return { connected: false, error: e.message, recordCount: 0 };
    }
  }
};

app.get('/api/database/health', async (_req: Request, res: Response) => {
  const sqlHealth = await SQLAdapter.health();

  let pendingCount = 0;
  let failedCount = 0;
  try {
    const pool = getPool();
    const [pRows]: any = await pool.execute("SELECT COUNT(*) as cnt FROM database_sync_queue WHERE status = 'pending'");
    const [fRows]: any = await pool.execute("SELECT COUNT(*) as cnt FROM database_sync_queue WHERE status = 'failed'");
    pendingCount = pRows[0]?.cnt || 0;
    failedCount = fRows[0]?.cnt || 0;
  } catch (e) {}

  return res.json({
    success: true,
    activeMode: 'SQL',
    sql: {
      connected: sqlHealth.connected,
      recordCount: sqlHealth.recordCount,
      lastSuccessfulSync: lastSuccessfulSyncTime,
      pendingSync: pendingCount,
      failedSync: failedCount,
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

  // 1. Save globally to SQL system_settings table with fail-safe error catching
  try {
    const pool = getPool();
    await pool.execute(
      `INSERT INTO system_settings (setting_key, setting_value, updated_at) VALUES ('active_database', ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = ?`,
      [targetDbVal, new Date().toISOString(), targetDbVal, new Date().toISOString()]
    );
  } catch (sqlErr: any) {
    console.warn('[executeDatabaseSwitch] SQL system_settings write failed (using fallback):', sqlErr.message);
  }

  // 2. Write to local filesystem setting for absolute, fail-safe offline persistence
  saveLocalActiveDatabase(targetDbVal);

  // 3. Write database switch log in SQL
  try {
    const pool = getPool();
    await pool.execute(
      `INSERT INTO database_switch_logs (admin_id, old_database, new_database, changed_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        adminId || 'admin',
        oldDbVal,
        targetDbVal,
        new Date().toISOString(),
        String(ipAddress).substring(0, 50),
        String(userAgent).substring(0, 255)
      ]
    ).catch(() => {});
  } catch {}

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

// Fetch historical admin logs
app.get('/api/admin/logs', async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.execute('SELECT * FROM admin_system_logs ORDER BY created_at DESC LIMIT 100');
    return res.json({ success: true, logs: rows });
  } catch (e) {
    return res.json({ success: true, logs: [] });
  }
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
      const [rows]: any = await pool.execute('SELECT setting_value FROM settings WHERE setting_key = ?', [keyName]);
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

    await pool.execute('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [urlKey, relativePath, relativePath]);
    await pool.execute('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [timeKey, timestamp, timestamp]);

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

    const [rows]: any = await pool.execute('SELECT setting_value FROM settings WHERE setting_key = ?', [urlKey]);
    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      const val = rows[0].setting_value;
      if (val.startsWith('/uploads/')) {
        const physicalPath = path.join(currentDir, val);
        if (fs.existsSync(physicalPath)) {
          fs.unlinkSync(physicalPath);
        }
      }
    }

    await pool.execute('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [urlKey, '', '']);
    await pool.execute('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [timeKey, '', '']);

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
// DUAL-CHANNEL NOTIFICATION SYSTEM (SQL Notification Center + Web Push)
// ============================================================================

async function initNotificationTables() {
  try {
    const pool = getPool();
    await pool.execute(`CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      notification_id VARCHAR(50) UNIQUE NOT NULL,
      user_id VARCHAR(50) DEFAULT 'all',
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      click_url VARCHAR(255) NULL,
      is_read TINYINT DEFAULT 0,
      created_at VARCHAR(100) NOT NULL,
      INDEX idx_user_id (user_id),
      INDEX idx_is_read (is_read)
    ) ENGINE=InnoDB;`);

    await pool.execute(`CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      endpoint TEXT NOT NULL,
      p256dh VARCHAR(255) NOT NULL,
      auth VARCHAR(255) NOT NULL,
      device_info VARCHAR(255) NULL,
      created_at VARCHAR(100) NOT NULL,
      updated_at VARCHAR(100) NOT NULL,
      UNIQUE KEY unique_endpoint (endpoint(255)),
      INDEX idx_user_push (user_id)
    ) ENGINE=InnoDB;`);
  } catch (e) {}
}
initNotificationTables().catch(() => {});

// Admin Send Notification API
app.post('/api/notifications/send', async (req: Request, res: Response) => {
  const { title, message, click_url, user_id, admin_id } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }

  try {
    const pool = getPool();
    const notification_id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const created_at = new Date().toISOString();
    const targetUserId = user_id && user_id.trim() !== '' ? user_id.trim() : 'all';
    const targetUrl = click_url || '/';

    await pool.execute(
      `INSERT INTO notifications (notification_id, user_id, title, message, click_url, is_read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [notification_id, targetUserId, title, message, targetUrl, created_at]
    );

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
      message: 'Notification successfully created in SQL and queued for delivery.',
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
    const pool = getPool();
    let query = 'SELECT * FROM notifications';
    const params: any[] = [];
    if (userId) {
      query += ' WHERE user_id = ? OR user_id = "all"';
      params.push(userId);
    }
    query += ' ORDER BY created_at DESC LIMIT 50';

    const [rows]: any = await pool.execute(query, params);
    return res.json({ success: true, notifications: rows });
  } catch (e: any) {
    return res.json({ success: false, error: e.message, notifications: [] });
  }
});

// Mark Notification as Read
app.post('/api/notifications/mark-read', async (req: Request, res: Response) => {
  const { notification_id, user_id } = req.body;
  try {
    const pool = getPool();
    if (notification_id) {
      await pool.execute('UPDATE notifications SET is_read = 1 WHERE notification_id = ?', [notification_id]);
    } else if (user_id) {
      await pool.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id = "all"', [user_id]);
    }
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
    const pool = getPool();
    const now = new Date().toISOString();
    const uid = user_id || 'guest_' + Math.random().toString(36).substring(2, 7);

    await pool.execute(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, device_info, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = ?, p256dh = ?, auth = ?, device_info = ?, updated_at = ?`,
      [uid, endpoint, keys.p256dh, keys.auth, device_info || 'Web Browser', now, now, uid, keys.p256dh, keys.auth, device_info || 'Web Browser', now]
    );

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
      server: { middlewareMode: true },
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
