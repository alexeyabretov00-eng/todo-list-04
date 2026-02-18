import bcrypt from 'bcryptjs';
import type { Database } from 'better-sqlite3';

/**
 * Migration 002: Auth schema
 *
 * Creates:
 *   - credentials: single-row table for the owner's username + bcrypt hash
 *   - sessions:    token-keyed table for active session tokens
 *
 * Seeding: if OWNER_USERNAME and OWNER_PASSWORD are set in the environment
 * and the credentials table is empty, inserts the first credential row.
 */
export function up(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS credentials (
      id            INTEGER PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);

  const username = process.env['OWNER_USERNAME'];
  const password = process.env['OWNER_PASSWORD'];

  if (!username || !password) {
    console.info('[migrations] OWNER_USERNAME/OWNER_PASSWORD not set — skipping credential seed');
    return;
  }

  const existing = db
    .prepare<[], { id: number }>('SELECT id FROM credentials LIMIT 1')
    .get();

  if (existing) {
    console.info('[migrations] Credentials table already seeded — skipping');
    return;
  }

  const hash = bcrypt.hashSync(password, 12);
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO credentials (username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)',
  ).run(username, hash, now, now);

  console.info(`[migrations] Seeded owner credential for username "${username}"`);

  // Scrub the plain-text password from the environment after use
  delete process.env['OWNER_PASSWORD'];
}
