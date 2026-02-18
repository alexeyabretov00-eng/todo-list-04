import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';

import { apiRouter } from './api/index';
import { errorHandler } from './api/errorHandler';
import { getDb } from './services/db';

dotenv.config();

const PORT = Number(process.env['PORT'] ?? 4000);
const FRONTEND_ORIGIN = process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:3000';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── Error handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

// ─── Startup ──────────────────────────────────────────────────────────────────
function start(): void {
  // Initialise DB (runs migrations) before accepting requests
  getDb();

  app.listen(PORT, () => {
    console.info(`[server] Listening on http://localhost:${PORT}`);
  });
}

start();

export { app };
