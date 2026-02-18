import Database from 'better-sqlite3';
import path from 'path';
import { runMigrations } from './migrations/runner';

const DB_PATH = process.env['DB_PATH'] ?? path.join(__dirname, '../../data/todos.db');

let _db: Database.Database | null = null;

/**
 * Returns the singleton SQLite database connection.
 * Opens the DB and runs all pending migrations on first call.
 */
export function getDb(): Database.Database {
  if (_db) {
    return _db;
  }
  _db = new Database(DB_PATH);
  // Enable WAL mode and foreign keys for all connections
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  runMigrations(_db);
  return _db;
}

/**
 * Closes the database connection. Used in tests and graceful shutdown.
 */
export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
