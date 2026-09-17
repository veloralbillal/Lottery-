import express, { Request, Response } from 'express';
import path from 'path';
import { handleSendResetEmail } from './src/js/apiEmailSender.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// Express middleware to parse json bodies
app.use(express.json());

// API Endpoints
app.post('/api/send-reset-email', (req: Request, res: Response) => {
  return handleSendResetEmail(req, res);
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
