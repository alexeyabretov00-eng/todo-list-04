import type { Database } from 'better-sqlite3';

/**
 * Migration 001: Initial schema
 *
 * Sole owner of all DDL for the todo app.
 * Creates todo_lists, todo_items, sub_items tables with:
 * - UNIQUE constraints mirrored by Zod schemas in validation.ts
 * - Cascade deletes for child records
 * - WAL mode for concurrent reads
 */
export function up(db: Database): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS todo_lists (
      id         TEXT PRIMARY KEY NOT NULL,
      name       TEXT NOT NULL,
      position   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (name)
    );

    CREATE INDEX IF NOT EXISTS idx_todo_lists_position ON todo_lists (position);

    CREATE TABLE IF NOT EXISTS todo_items (
      id         TEXT PRIMARY KEY NOT NULL,
      list_id    TEXT NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
      title      TEXT NOT NULL,
      completed  INTEGER NOT NULL DEFAULT 0,
      position   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (list_id, title)
    );

    CREATE INDEX IF NOT EXISTS idx_todo_items_list_id ON todo_items (list_id);
    CREATE INDEX IF NOT EXISTS idx_todo_items_position ON todo_items (list_id, position);

    CREATE TABLE IF NOT EXISTS sub_items (
      id         TEXT PRIMARY KEY NOT NULL,
      todo_id    TEXT NOT NULL REFERENCES todo_items(id) ON DELETE CASCADE,
      title      TEXT NOT NULL,
      completed  INTEGER NOT NULL DEFAULT 0,
      position   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (todo_id, title)
    );

    CREATE INDEX IF NOT EXISTS idx_sub_items_todo_id ON sub_items (todo_id);
    CREATE INDEX IF NOT EXISTS idx_sub_items_position ON sub_items (todo_id, position);

    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
}

export function down(db: Database): void {
  db.exec(`
    DROP TABLE IF EXISTS sub_items;
    DROP TABLE IF EXISTS todo_items;
    DROP TABLE IF EXISTS todo_lists;
    DROP TABLE IF EXISTS schema_migrations;
  `);
}
