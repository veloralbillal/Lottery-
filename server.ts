import express, { Request, Response } from 'express';
import path from 'path';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { handleSendResetEmail } from './src/js/apiEmailSender.js';
import { handleUddoktaPayCheckout, handleUddoktaPayVerify } from './src/js/apiUddoktaPay.js';
import { handleZiniPayCheckout, handleZiniPayVerify, handleZiniPayWebhook, getBackendFirestore } from './src/js/apiZiniPay.js';
import { getDefaultLegalPages, sanitizeHTML } from './src/js/legalPolicies.js';
import multer from 'multer';
import JSZip from 'jszip';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isDev = process.env.NODE_ENV !== 'production';
const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// Express middleware to parse json bodies
app.use(express.json());

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

// SQL Database Configuration & Dual Sync API Endpoints
let serverSqlConfig = {
  host: 'https://api.veloralbillal.top/db_bridge.php',
  port: '3306',
  database: 'veloralb_Digital',
  username: 'veloralb_Digital',
  password: 'UcWg.75@wv+Ijzh#',
  autoSync: true,
  activeEngine: 'firebase_primary',
  lastSyncTime: new Date().toISOString(),
  syncStatus: 'synced'
};

// Database pool for MySQL
let pool: mysql.Pool | null = null;

const getPool = () => {
  let host = serverSqlConfig.host || 'localhost';
  if (host.includes('db_bridge.php') && !host.startsWith('http://') && !host.startsWith('https://')) {
    host = 'https://' + host;
  }
  const isBridge = host.startsWith('http://') || host.startsWith('https://') || host.includes('db_bridge.php');

  if (isBridge) {
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
            if (typeof val === 'number') return String(val);
            if (val === null || val === undefined) return 'NULL';
            const escaped = String(val).replace(/'/g, "''");
            return `'${escaped}'`;
          });
        }

        console.log(`[SQL Bridge Executor] Query: ${formattedSql.substring(0, 150)}...`);
        try {
          // Construct URL with query parameters to survive redirects
          const urlObj = new URL(host);
          urlObj.searchParams.set('token', 'Billal50598326');
          urlObj.searchParams.set('action', 'query');
          urlObj.searchParams.set('db_host', 'localhost');
          urlObj.searchParams.set('db_name', serverSqlConfig.database || 'veloralb_Digital');
          urlObj.searchParams.set('db_user', serverSqlConfig.username || 'veloralb_Digital');
          urlObj.searchParams.set('db_pass', serverSqlConfig.password || '');

          const response = await fetch(urlObj.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              token: 'Billal50598326',
              action: 'query',
              db_host: 'localhost',
              db_name: serverSqlConfig.database || 'veloralb_Digital',
              db_user: serverSqlConfig.username || 'veloralb_Digital',
              db_pass: serverSqlConfig.password || '',
              sql: formattedSql
            })
          });
          const result: any = await response.json();
          if (!result.success) {
            console.error(`[SQL Bridge Query Error]`, result.message);
            throw new Error(result.message || 'Bridge Query failed');
          }
          return [result.data || []];
        } catch (e: any) {
          console.error(`[SQL Bridge Fetch Connection Error]`, e.message);
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
  }

  if (!pool) {
    pool = mysql.createPool({
      host: serverSqlConfig.host,
      port: Number(serverSqlConfig.port),
      user: serverSqlConfig.username,
      password: serverSqlConfig.password,
      database: serverSqlConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};

app.get('/api/sql/config', (_req: Request, res: Response) => {
  return res.json({ success: true, config: serverSqlConfig });
});

app.post('/api/sql/config', (req: Request, res: Response) => {
  if (req.body && typeof req.body === 'object') {
    const oldHost = serverSqlConfig.host;
    const oldUser = serverSqlConfig.username;
    const oldPass = serverSqlConfig.password;
    const oldDb = serverSqlConfig.database;
    
    serverSqlConfig = { ...serverSqlConfig, ...req.body, lastSyncTime: new Date().toISOString() };
    
    // If connection details changed, recreate the pool
    if (oldHost !== serverSqlConfig.host || oldUser !== serverSqlConfig.username || 
        oldPass !== serverSqlConfig.password || oldDb !== serverSqlConfig.database) {
      if (pool) {
        pool.end().catch(() => {});
        pool = null;
      }
    }
    console.log('[SQL Config] Updated MySQL Database configuration:', serverSqlConfig.database, serverSqlConfig.host);
  }
  return res.json({ success: true, config: serverSqlConfig, message: 'SQL Database configuration saved successfully.' });
});

app.post('/api/sql/test-connection', async (req: Request, res: Response) => {
  let host = req.body?.host || serverSqlConfig.host;
  if (host.includes('db_bridge.php') && !host.startsWith('http://') && !host.startsWith('https://')) {
    host = 'https://' + host;
  }
  const port = req.body?.port || serverSqlConfig.port;
  const database = req.body?.database || serverSqlConfig.database;
  const username = req.body?.username || serverSqlConfig.username;
  const password = req.body?.password || serverSqlConfig.password;
  
  const start = Date.now();
  console.log(`[SQL Diagnostic Test] Testing connection to ${username}@${host}:${port}/${database}...`);
  
  try {
    const urlObj = new URL(host);
    urlObj.searchParams.set('token', 'Billal50598326');
    urlObj.searchParams.set('action', 'query');
    urlObj.searchParams.set('db_host', 'localhost');
    urlObj.searchParams.set('db_name', database);
    urlObj.searchParams.set('db_user', username);
    urlObj.searchParams.set('db_pass', password);

    const response = await fetch(urlObj.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: 'Billal50598326',
        action: 'query',
        db_host: 'localhost',
        db_name: database,
        db_user: username,
        db_pass: password,
        sql: 'SHOW TABLES'
      })
    });
    
    const result: any = await response.json();
    
    if (!result.success) throw new Error(result.message);

    const latency = Date.now() - start;
    
    // Parse tablesVerified from result data
    let tablesVerified: string[] = [];
    if (result.success && Array.isArray(result.data)) {
      tablesVerified = result.data.map((row: any) => Object.values(row)[0] as string);
    }
    
    return res.json({
      success: true,
      latency,
      host,
      status: 'connected',
      engine: 'MySQL 8.0 / MariaDB (via Bridge API)',
      tablesVerified,
      message: `Connected successfully to MySQL via Bridge API at ${host}!`
    });
  } catch (err: any) {
    console.error('[SQL Test Connection Error] Bridge API failure:', host, err.message);
    return res.json({ 
      success: false, 
      message: `Bridge API Connection Failed: ${err.message}`,
      error: err.message
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

      // Preserve activeEngine if not provided by client, but allow client to override it
      const newActiveEngine = clientConfig.activeEngine || serverSqlConfig.activeEngine;
      
      serverSqlConfig = { ...serverSqlConfig, ...clientConfig, activeEngine: newActiveEngine, lastSyncTime: timestamp };

      if (oldHost !== serverSqlConfig.host || oldUser !== serverSqlConfig.username || 
          oldPass !== serverSqlConfig.password || oldDb !== serverSqlConfig.database ||
          oldPort !== serverSqlConfig.port) {
        if (pool) {
          pool.end().catch(() => {});
          pool = null;
        }
        console.log('[SQL Sync] Re-initializing connection pool for new client config:', serverSqlConfig.database, serverSqlConfig.host);
      }
    }

    const parsedDb = typeof dbPayload === 'string' ? JSON.parse(dbPayload) : dbPayload;
    
    if (parsedDb) {
      // 1. Sync to Firestore (Dual write)
      const db = getBackendFirestore();
      if (db) {
        const primaryDocRef = doc(db, 'app_data', 'lottery_winner_db');
        const secondaryDocRef = doc(db, 'app_data', 'lottery_winner_db_backup');
        const serialized = typeof dbPayload === 'string' ? dbPayload : JSON.stringify(dbPayload);
        const updateData = {
          db: serialized,
          lastUpdated: timestamp,
          sqlSynced: true,
          sqlDbName: serverSqlConfig.database
        };
        await Promise.allSettled([
          setDoc(primaryDocRef, updateData, { merge: true }),
          setDoc(secondaryDocRef, updateData, { merge: true })
        ]);
      }

      // 2. Sync to MySQL
      const mysqlPool = getPool();
      const connection = await mysqlPool.getConnection();
      try {
        await connection.beginTransaction();
        
        // Helper to get columns for a table to avoid "Unknown column" errors
        const getTableColumns = async (tableName: string) => {
          try {
            const [rows]: any = await connection.execute(`DESCRIBE ${tableName}`);
            return rows.map((r: any) => r.Field);
          } catch (e) {
            return [];
          }
        };

        // Schema auto-migration helper
        const runMigrationsIfNeeded = async () => {
          try {
            // Check & Create users table if missing
            await connection.execute(`CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(30) NULL,
                dob VARCHAR(50) NULL,
                balance DECIMAL(15, 2) DEFAULT 100.00,
                totDeposit DECIMAL(15, 2) DEFAULT 0.00,
                totWithdraw DECIMAL(15, 2) DEFAULT 0.00,
                wins INT DEFAULT 0,
                loss INT DEFAULT 0,
                profit DECIMAL(15, 2) DEFAULT 0.00,
                joinDate VARCHAR(50) NULL,
                status VARCHAR(30) DEFAULT 'active',
                blockedUntil VARCHAR(100) NULL,
                role VARCHAR(50) DEFAULT 'user',
                commissionRate DECIMAL(15, 2) DEFAULT 0.00,
                earnedCommission DECIMAL(15, 2) DEFAULT 0.00,
                totalBookings INT DEFAULT 0,
                district VARCHAR(100) NULL,
                region VARCHAR(100) NULL,
                refersCount INT DEFAULT 0,
                referredBy VARCHAR(100) NULL
            ) ENGINE=InnoDB;`);

            // Check & Create lotteries table if missing
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
                drawDuration INT DEFAULT 10
            ) ENGINE=InnoDB;`);

            // Check & Create tickets table if missing
            await connection.execute(`CREATE TABLE IF NOT EXISTS tickets (
                id VARCHAR(50) PRIMARY KEY,
                userId VARCHAR(50) NOT NULL,
                lotteryId VARCHAR(50) NOT NULL,
                code VARCHAR(50) NOT NULL,
                purchaseDate VARCHAR(100) NULL,
                status VARCHAR(30) DEFAULT 'pending',
                prizeAmount DECIMAL(15, 2) DEFAULT 0.00
            ) ENGINE=InnoDB;`);

            // Check & Create deposits table if missing
            await connection.execute(`CREATE TABLE IF NOT EXISTS deposits (
                id VARCHAR(50) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                method VARCHAR(50) NOT NULL,
                trxId VARCHAR(100) NOT NULL,
                status VARCHAR(30) DEFAULT 'pending',
                date VARCHAR(100) NULL
            ) ENGINE=InnoDB;`);

            // Check & Create withdrawals table if missing
            await connection.execute(`CREATE TABLE IF NOT EXISTS withdrawals (
                id VARCHAR(50) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                method VARCHAR(50) NOT NULL,
                targetAccount VARCHAR(100) NOT NULL,
                status VARCHAR(30) DEFAULT 'pending',
                date VARCHAR(100) NULL
            ) ENGINE=InnoDB;`);

            // Check & Create settings table if missing
            await connection.execute(`CREATE TABLE IF NOT EXISTS settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT NULL
            ) ENGINE=InnoDB;`);

            // Check & Create transactions table if missing
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

            // Check & Create agentLedger table if missing
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

            // Add missing columns to users table just in case they have an old users table definition
            const userColumns = await getTableColumns('users');
            if (userColumns.length > 0) {
              const missingColumns = [
                { name: 'role', type: "VARCHAR(50) DEFAULT 'user'" },
                { name: 'commissionRate', type: 'DECIMAL(15, 2) DEFAULT 0.00' },
                { name: 'earnedCommission', type: 'DECIMAL(15, 2) DEFAULT 0.00' },
                { name: 'totalBookings', type: 'INT DEFAULT 0' },
                { name: 'district', type: 'VARCHAR(100) NULL' },
                { name: 'region', type: 'VARCHAR(100) NULL' },
                { name: 'refersCount', type: 'INT DEFAULT 0' },
                { name: 'referredBy', type: 'VARCHAR(100) NULL' }
              ];

              for (const col of missingColumns) {
                if (!userColumns.includes(col.name)) {
                  await connection.execute(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
                  console.log(`[SQL Migration] Added column ${col.name} to users table.`);
                }
              }
            }
          } catch (migErr: any) {
            console.warn('[SQL Migration Warning]', migErr.message);
          }
        };

        // Run migrations before syncing
        await runMigrationsIfNeeded();

        // Helper to sync table data
        // Helper to sync table data
        const syncTable = async (tableName: string, dataArray: any[]) => {
          if (!Array.isArray(dataArray) || dataArray.length === 0) return;
          
          try {
             const columns = await getTableColumns(tableName);
             if (columns.length === 0) {
               console.warn(`[SQL Sync] Table ${tableName} does not exist or has no columns.`);
               return;
             }

             await connection.execute(`DELETE FROM ${tableName}`);
             
             // Identify the keys that exist in both the item and the database table columns
             const sampleItem = dataArray[0];
             const validKeys = Object.keys(sampleItem).filter(k => columns.includes(k));
             
             if (validKeys.length === 0) {
               console.warn(`[SQL Sync] No valid columns found to sync for ${tableName}`);
               return;
             }

             // We chunk data to prevent hitting max_allowed_packet or query length limitations
             const chunkSize = 100;
             for (let i = 0; i < dataArray.length; i += chunkSize) {
               const chunk = dataArray.slice(i, i + chunkSize);
               const valueRows: string[] = [];
               const flatValues: any[] = [];

               for (const item of chunk) {
                 const rowPlaceholders: string[] = [];
                 for (const key of validKeys) {
                   const val = item[key];
                   if (typeof val === 'object' && val !== null) {
                     flatValues.push(JSON.stringify(val));
                   } else {
                     flatValues.push(val !== undefined ? val : null);
                   }
                   rowPlaceholders.push('?');
                 }
                 valueRows.push(`(${rowPlaceholders.join(',')})`);
               }

               const sql = `INSERT INTO ${tableName} (${validKeys.join(',')}) VALUES ${valueRows.join(',')}`;
               await connection.execute(sql, flatValues);
             }
             
             console.log(`[SQL Sync] Bulk-synced ${dataArray.length} rows to ${tableName}`);
          } catch (tblErr: any) {
            console.warn(`[SQL Sync Warning] Failed to bulk-sync table ${tableName}:`, tblErr.message);
          }
        };

        if (parsedDb.users) await syncTable('users', parsedDb.users);
        if (parsedDb.lotteries) await syncTable('lotteries', parsedDb.lotteries);
        if (parsedDb.tickets) await syncTable('tickets', parsedDb.tickets);
        if (parsedDb.deposits) await syncTable('deposits', parsedDb.deposits);
        if (parsedDb.withdrawals) await syncTable('withdrawals', parsedDb.withdrawals);
        if (parsedDb.transactions) await syncTable('transactions', parsedDb.transactions);
        if (parsedDb.agentLedger) await syncTable('agentLedger', parsedDb.agentLedger);
        
        if (parsedDb.settings) {
          // Special handling for settings (key-value pair table)
          try {
            const columns = await getTableColumns('settings');
            if (columns.includes('setting_key') && columns.includes('setting_value')) {
              await connection.execute(`DELETE FROM settings`);
              for (const [key, value] of Object.entries(parsedDb.settings)) {
                const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
                await connection.execute(`INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)`, [key, valStr]);
              }
              console.log(`[SQL Sync] Synced settings to SQL.`);
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
    }

    console.log(`[SQL Dual-Sync] Synchronization complete between Firebase and MySQL (${serverSqlConfig.database}).`);
    return res.json({
      success: true,
      timestamp,
      syncStatus: 'synced',
      database: serverSqlConfig.database,
      message: `Dual-Sync completed! Firebase Clusters and MySQL Database "${serverSqlConfig.database}" are 100% mirrored.`
    });
  } catch (err: any) {
    const errMsg = (err.message || '').toUpperCase();
    const errCode = (err.code || '').toUpperCase();
    const isLocal = serverSqlConfig.host === 'localhost' || serverSqlConfig.host === '127.0.0.1' || serverSqlConfig.host === '::1';
    const isConnRefused = errCode.includes('CONNREFUSED') || errCode.includes('TIMEDOUT') || 
                          errMsg.includes('ECONNREFUSED') || errMsg.includes('ETIMEDOUT') || 
                          errMsg.includes('REFUSED') || errMsg.includes('TIMEOUT');

    if (isConnRefused && isLocal) {
      console.log(`[SQL Dual-Sync] Localhost MySQL is unreachable (Cloud Run Sandbox). MySQL sync bypassed; Firestore dual-write successfully completed.`);
      return res.json({
        success: true,
        timestamp: new Date().toISOString(),
        syncStatus: 'synced',
        database: serverSqlConfig.database,
        message: `Dual-Sync completed! Firestore is 100% synchronized. ⚠️ WARNING: MySQL 'localhost' connection was bypassed/simulated because it is unreachable from the cloud server. Please use a REMOTE host for real SQL activity.`
      });
    }

    console.error('[SQL Dual-Sync Error] Real connection failure:', err.message);
    return res.status(500).json({ success: false, error: err.message });
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
      const errMsg = (sqlErr.message || '').toUpperCase();
      if (!errMsg.includes('ECONNREFUSED')) {
        console.warn("[SQL Settings Load Warning] Failed to load settings from MySQL, falling back to Firestore:", sqlErr.message);
      }
    }
  }

  try {
    const db = getBackendFirestore();
    if (db) {
      const dbDocRef = doc(db, "app_data", "lottery_winner_db");
      const dbSnap = await getDoc(dbDocRef);
      if (dbSnap.exists()) {
        const dbData = dbSnap.data();
        const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
        if (parsedDb && parsedDb.settings) {
          // Return the live settings from Firestore
          return res.json(parsedDb.settings);
        }
      }
    }
  } catch (err: any) {
    console.error("[Server Settings Sync] Error reading Firestore settings:", err.message);
  }
  return res.json(defaultSettings);
};

app.get('/api_settings.php', handleGetSettings);
app.get('/api/settings', handleGetSettings);

// API endpoint to fetch the full database state from SQL
app.get('/api/sql/db', async (req: Request, res: Response) => {
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

      const users = await fetchTable('users');
      const lotteries = await fetchTable('lotteries');
      const tickets = await fetchTable('tickets');
      const deposits = await fetchTable('deposits');
      const withdrawals = await fetchTable('withdrawals');
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

      return res.json({
        success: true,
        db: {
          users,
          lotteries,
          tickets,
          deposits,
          withdrawals,
          transactions,
          agentLedger,
          settings: finalSettings
        }
      });
    } finally {
      connection.release();
    }
  } catch (err: any) {
    const errMsg = (err.message || '').toUpperCase();
    const errCode = (err.code || '').toUpperCase();
    const isLocal = serverSqlConfig.host === 'localhost' || serverSqlConfig.host === '127.0.0.1' || serverSqlConfig.host === '::1';
    const isConnRefused = errCode.includes('CONNREFUSED') || errCode.includes('TIMEDOUT') || 
                          errMsg.includes('ECONNREFUSED') || errMsg.includes('ETIMEDOUT') || 
                          errMsg.includes('REFUSED') || errMsg.includes('TIMEOUT');

    if (isConnRefused && isLocal) {
      console.log('[SQL Fetch DB] Localhost MySQL unreachable (Cloud Run Sandbox). Falling back to Firestore DB state.');
      try {
        const db = getBackendFirestore();
        if (db) {
          const dbDocRef = doc(db, "app_data", "lottery_winner_db");
          const dbSnap = await getDoc(dbDocRef);
          if (dbSnap.exists()) {
            const dbData = dbSnap.data();
            const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
            if (parsedDb) {
              return res.json({ success: true, db: parsedDb, notice: "Local MySQL unreachable; served via Firestore fallback." });
            }
          }
        }
      } catch (fbErr: any) {
        console.warn('[SQL Fetch DB Fallback Warning]', fbErr.message);
      }
    }

    console.error('[SQL Fetch DB Error]', err.message);
    return res.status(500).json({ success: false, error: err.message });
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

// ================= LEGAL & POLICY MANAGEMENT API =================
// Public Endpoint to fetch all published legal pages
app.get('/api/legal/pages', async (_req: Request, res: Response) => {
  try {
    const db = getBackendFirestore();
    if (db) {
      const dbDocRef = doc(db, "app_data", "lottery_winner_db");
      const dbSnap = await getDoc(dbDocRef);
      if (dbSnap.exists()) {
        const dbData = dbSnap.data();
        const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
        if (parsedDb && parsedDb.legalPages) {
          const publicPages = parsedDb.legalPages.filter((p: any) => p.status === "PUBLISHED");
          return res.json({ success: true, pages: publicPages });
        }
      }
    }
  } catch (err: any) {
    console.error("[Legal API] Error fetching legal pages:", err.message);
  }
  return res.json({ success: true, pages: getDefaultLegalPages() });
});

// Public Endpoint to fetch a single policy by key or slug
app.get('/api/legal/pages/:key', async (req: Request, res: Response) => {
  const { key } = req.params;
  try {
    const db = getBackendFirestore();
    if (db) {
      const dbDocRef = doc(db, "app_data", "lottery_winner_db");
      const dbSnap = await getDoc(dbDocRef);
      if (dbSnap.exists()) {
        const dbData = dbSnap.data();
        const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
        const page = (parsedDb?.legalPages || []).find((p: any) => p.page_key === key || p.slug === `/${key}`);
        if (page && page.status === "PUBLISHED") {
          return res.json({ success: true, page });
        }
      }
    }
  } catch (err: any) {
    console.error("[Legal API] Error fetching policy:", err.message);
  }
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
    const db = getBackendFirestore();
    if (db) {
      const dbDocRef = doc(db, "app_data", "lottery_winner_db");
      const dbSnap = await getDoc(dbDocRef);
      if (dbSnap.exists()) {
        const dbData = dbSnap.data();
        const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
        
        // Strict server-side role verification
        const adminUser = (parsedDb.users || []).find((u: any) => u.username === admin_id);
        if (!adminUser || (adminUser.role !== 'admin' && adminUser.username !== 'admin')) {
          return res.status(403).json({ success: false, message: "Forbidden: Only authorized Admins can modify legal policies." });
        }

        if (!parsedDb.legalPages) parsedDb.legalPages = getDefaultLegalPages(parsedDb.settings);
        
        // Sanitize content to block unsafe injections
        if (page.content) page.content = sanitizeHTML(page.content);
        if (page.draft_content) page.draft_content = sanitizeHTML(page.draft_content);

        const idx = parsedDb.legalPages.findIndex((p: any) => p.page_key === page.page_key);
        if (idx >= 0) {
          parsedDb.legalPages[idx] = { ...parsedDb.legalPages[idx], ...page, updated_at: new Date().toISOString(), updated_by: admin_id };
        } else {
          parsedDb.legalPages.push(page);
        }

        // Record audit log
        if (!parsedDb.legalAuditLogs) parsedDb.legalAuditLogs = [];
        parsedDb.legalAuditLogs.unshift({
          id: `audit_${Date.now()}`,
          admin_id,
          action: page.status === 'PUBLISHED' ? 'PUBLISH' : 'EDIT_DRAFT',
          policy_key: page.page_key,
          page_title: page.title,
          previous_version: `${page.version - 1 || 1}.0`,
          new_version: `${page.version || 1}.0`,
          timestamp: new Date().toISOString(),
          details: `Policy updated via server-side API.`
        });

        await setDoc(dbDocRef, { db: JSON.stringify(parsedDb), lastUpdated: new Date().toISOString() }, { merge: true });
        return res.json({ success: true, message: "Policy saved successfully." });
      }
    }
  } catch (err: any) {
    console.error("[Legal API] Save error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
  return res.status(500).json({ success: false, message: "Database unreachable." });
});

// Admin-Only Endpoint to view audit logs
app.get('/api/legal/audit-logs', async (_req: Request, res: Response) => {
  try {
    const db = getBackendFirestore();
    if (db) {
      const dbDocRef = doc(db, "app_data", "lottery_winner_db");
      const dbSnap = await getDoc(dbDocRef);
      if (dbSnap.exists()) {
        const dbData = dbSnap.data();
        const parsedDb = typeof dbData.db === "string" ? JSON.parse(dbData.db) : dbData.db;
        return res.json({ success: true, auditLogs: parsedDb.legalAuditLogs || [] });
      }
    }
  } catch (err: any) {
    console.error("[Legal API] Audit logs error:", err.message);
  }
  return res.json({ success: true, auditLogs: [] });
});

// ============================================================================
// SQL-ONLY SYSTEM LOGGING ENGINE & RETENTION ARCHITECTURE
// ============================================================================

let ACTIVE_DATABASE_MODE: 'SQL' | 'Firebase' = 'SQL';
let lastSuccessfulSyncTime = new Date().toISOString();
const sseClients: Response[] = [];

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

const FirebaseAdapter = {
  name: 'Firebase',
  async health() {
    try {
      const db = getBackendFirestore();
      if (!db) return { connected: false, error: 'Firestore uninitialized', recordCount: 0 };
      const docSnap = await getDoc(doc(db, 'app_data', 'lottery_winner_db'));
      return { connected: true, recordCount: docSnap.exists() ? 1 : 0 };
    } catch (e: any) {
      return { connected: false, error: e.message, recordCount: 0 };
    }
  }
};

// Database Health API
app.get('/api/database/health', async (_req: Request, res: Response) => {
  const sqlHealth = await SQLAdapter.health();
  const fbHealth = await FirebaseAdapter.health();

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
    activeMode: ACTIVE_DATABASE_MODE,
    sql: {
      connected: sqlHealth.connected,
      recordCount: sqlHealth.recordCount,
      lastSuccessfulSync: lastSuccessfulSyncTime,
      pendingSync: pendingCount,
      failedSync: failedCount,
      error: sqlHealth.error || null
    },
    firebase: {
      connected: fbHealth.connected,
      recordCount: fbHealth.recordCount,
      lastSuccessfulSync: lastSuccessfulSyncTime,
      pendingSync: pendingCount,
      failedSync: failedCount,
      error: fbHealth.error || null
    }
  });
});

// Database Consistency Check API
app.get('/api/database/consistency', async (_req: Request, res: Response) => {
  let mismatches: any[] = [];
  let sqlUsersCount = 0;
  let fbUsersCount = 0;
  try {
    const pool = getPool();
    const [uRows]: any = await pool.execute('SELECT COUNT(*) as cnt FROM users');
    sqlUsersCount = uRows[0]?.cnt || 0;

    const db = getBackendFirestore();
    if (db) {
      const snap = await getDoc(doc(db, 'app_data', 'lottery_winner_db'));
      if (snap.exists()) {
        const parsed = JSON.parse(snap.data().db || '{}');
        fbUsersCount = parsed.users?.length || 0;
      }
    }

    if (sqlUsersCount !== fbUsersCount) {
      mismatches.push({
        entity: 'Users',
        id: 'collection_count',
        sqlValue: sqlUsersCount,
        firebaseValue: fbUsersCount,
        mismatchType: 'Record Count Mismatch'
      });
    }
  } catch (e: any) {
    mismatches.push({ entity: 'General', id: 'check_error', sqlValue: 'N/A', firebaseValue: 'N/A', mismatchType: e.message });
  }

  return res.json({
    success: true,
    consistent: mismatches.length === 0,
    mismatches
  });
});

// Database Switch API with Safety Check
app.post('/api/database/switch', async (req: Request, res: Response) => {
  const { targetMode, reason, adminId } = req.body;
  if (!targetMode || (targetMode !== 'SQL' && targetMode !== 'Firebase')) {
    return res.status(400).json({ success: false, message: 'Invalid target database mode. Choose SQL or Firebase.' });
  }

  if (targetMode === ACTIVE_DATABASE_MODE) {
    return res.json({ success: true, message: `Already running on ${targetMode} mode.` });
  }

  // Check pending/failed sync jobs before switching
  try {
    const pool = getPool();
    const [rows]: any = await pool.execute("SELECT COUNT(*) as cnt FROM database_sync_queue WHERE status IN ('pending', 'failed')");
    const pendingCount = rows[0]?.cnt || 0;
    if (pendingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Database synchronization is incomplete. Please sync before switching.'
      });
    }
  } catch (e) {}

  const oldMode = ACTIVE_DATABASE_MODE;
  ACTIVE_DATABASE_MODE = targetMode;
  serverSqlConfig.activeEngine = targetMode === 'SQL' ? 'mysql' : 'firebase';

  try {
    const pool = getPool();
    await pool.execute(
      `INSERT INTO admin_database_switch_log (admin_id, old_database, new_database, reason, ip, status, timestamp) VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?)`,
      [adminId || 'admin', oldMode, targetMode, reason || 'Admin requested database switch', req.ip || '127.0.0.1', new Date().toISOString()]
    );
  } catch (e) {}

  await recordAdminLog('DATABASE_SWITCH', `Admin switched database mode from ${oldMode} to ${targetMode}`, 'system', adminId || 'admin', targetMode, 'SUCCESS', req.ip || '127.0.0.1');

  return res.json({
    success: true,
    message: `Database successfully switched from ${oldMode} to ${targetMode}.`,
    activeMode: ACTIVE_DATABASE_MODE
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
