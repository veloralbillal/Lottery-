import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleSendResetEmail } from './src/js/apiEmailSender.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express middleware to parse json bodies
app.use(express.json());

// API Endpoints
app.post('/api/send-reset-email', handleSendResetEmail);

// Serve static assets from the built dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback: send index.html for any unknown requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static server running on port ${PORT}`);
});
