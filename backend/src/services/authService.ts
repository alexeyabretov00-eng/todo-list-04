import * as crypto from 'crypto';

import bcrypt from 'bcryptjs';

import { getDb } from './db';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CredentialRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

interface SessionRow {
  token: string;
  created_at: string;
  expires_at: string;
}

// ─── Session TTL ──────────────────────────────────────────────────────────────

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Credential functions ─────────────────────────────────────────────────────

/** Returns the single credentials row or null if none exists. */
export function getCredential(): CredentialRow | null {
  const db = getDb();
  return (
    db.prepare<[], CredentialRow>('SELECT * FROM credentials LIMIT 1').get() ??
    null
  );
}

/**
 * Verifies a plain-text password against a stored bcrypt hash.
 * Returns true if they match, false otherwise.
 */
export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

/** Hashes a plain-text password with bcrypt (work factor 12). */
export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}

/**
 * Updates the owner's password_hash and updated_at.
 * No-op if the credentials table is empty.
 */
export function updatePassword(newHash: string): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    'UPDATE credentials SET password_hash = ?, updated_at = ? WHERE id = 1',
  ).run(newHash, now);
}

// ─── Session functions ────────────────────────────────────────────────────────

/**
 * Creates a new session in the sessions table.
 * Returns the 256-bit hex token string.
 */
export function createSession(): string {
  const db = getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  db.prepare(
    'INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)',
  ).run(token, now.toISOString(), expiresAt.toISOString());

  return token;
}

/**
 * Validates a session token.
 * Returns the session row if the token exists and has not expired, null otherwise.
 */
export function validateSession(token: string): SessionRow | null {
  const db = getDb();
  const session = db
    .prepare<[string], SessionRow>('SELECT * FROM sessions WHERE token = ?')
    .get(token);

  if (!session) return null;

  if (new Date(session.expires_at) <= new Date()) {
    return null;
  }

  return session;
}

/** Deletes a single session by token. */
export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

/** Deletes all sessions (used on password change to invalidate all active sessions). */
export function deleteAllSessions(): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions').run();
}

/** Deletes all sessions whose expires_at is in the past (lazy cleanup called on login). */
export function cleanExpiredSessions(): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
}
