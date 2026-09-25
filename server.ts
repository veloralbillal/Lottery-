import express, { Request, Response } from 'express';
import path from 'path';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { handleSendResetEmail } from './src/js/apiEmailSender.js';
import { handleUddoktaPayCheckout, handleUddoktaPayVerify } from './src/js/apiUddoktaPay.js';
import { handleZiniPayCheckout, handleZiniPayVerify, handleZiniPayWebhook, getBackendFirestore } from './src/js/apiZiniPay.js';
import { getDefaultLegalPages, sanitizeHTML } from './src/js/legalPolicies.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// Express middleware to parse json bodies
app.use(express.json());

// API Endpoints
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

// Serve static assets from the built dist directory
app.use(express.static(path.join(currentDir, 'dist')));

// SPA Fallback: send index.html for any unknown requests
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(currentDir, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
