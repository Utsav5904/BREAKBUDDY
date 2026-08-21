import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './src/config/env.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import healthRouter from './src/routes/health.js';
import aiRouter from './src/routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Security Headers ───────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ─── Body Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ─── Request Logging ────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Only log API requests to keep logs clean
    if (req.path.startsWith('/api/')) {
      console.log(`[http] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// ─── CORS (Development) ────────────────────────────────────────────
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });
}

// ─── API Routes ─────────────────────────────────────────────────────
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/ai', aiRouter);

// ─── API 404 Handler ────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Static Frontend (Production) ───────────────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback — serve index.html for all non-API, non-file routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Global Error Handler ───────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`\n🌿 BreakBuddy server running on port ${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${env.PORT}/api/v1/health`);
  console.log(`   AI Status: http://localhost:${env.PORT}/api/v1/ai/status`);
  if (env.NODE_ENV === 'production') {
    console.log(`   Frontend: http://localhost:${env.PORT}/`);
  }
  console.log('');
});

export default app;
