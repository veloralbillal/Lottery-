import express, { Request, Response } from 'express';
import path from 'path';
import { handleSendResetEmail } from './src/js/apiEmailSender.js';
import { handleUddoktaPayCheckout, handleUddoktaPayVerify } from './src/js/apiUddoktaPay.js';
import { handleZiniPayCheckout, handleZiniPayVerify } from './src/js/apiZiniPay.js';

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

app.all('/api/zinipay/webhook', (req: Request, res: Response) => {
  console.log('[ZiniPay Webhook Received]', req.body);
  return res.json({ status: true, received: true });
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
