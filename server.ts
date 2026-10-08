import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRouter } from './server/routes/auth.js';
import { paypalRouter } from './server/routes/paypalRoutes.js';
import { transactionsRouter } from './server/routes/transactions.js';
import { customersRouter } from './server/routes/customers.js';
import { paymentRequestsRouter } from './server/routes/paymentRequests.js';
import { aiRouter } from './server/routes/aiRoutes.js';
import { settingsRouter } from './server/routes/settingsRoutes.js';
import { invoiceRouter } from './server/routes/invoiceRoutes.js';
import { webhookRouter } from './server/routes/webhookRoutes.js';
import { refundRouter } from './server/routes/refundRoutes.js';
import { forecastRouter } from './server/routes/forecastRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'PayFlow AI',
    paypalMode: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
    geminiEnabled: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/paypal', paypalRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/payment-requests', paymentRequestsRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/refunds', refundRouter);
app.use('/api/forecast', forecastRouter);
app.use('/api/ai', aiRouter);
app.use('/api/settings', settingsRouter);

// Development with Vite middleware or Production static serving
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PayFlow AI server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
