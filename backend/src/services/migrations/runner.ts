import type { Database } from 'better-sqlite3';
import * as migration001 from './001_initial_schema';
import * as migration002 from './002_auth_schema';

interface Migration {
  version: number;
  up: (db: Database) => void;
}

const migrations: Migration[] = [
  { version: 1, up: migration001.up },
  { version: 2, up: migration002.up },
];

/**
 * Runs all pending migrations in version order.
 * Records each applied migration in schema_migrations table.
 */
export function runMigrations(db: Database): void {
  // Ensure the tracking table exists before we read from it
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const getApplied = db.prepare<[], { version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version',
  );
  const appliedVersions = new Set(getApplied.all().map(r => r.version));

  const insert = db.prepare(
    'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
  );

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }
    const runMigration = db.transaction(() => {
      migration.up(db);
      // Only insert tracking record if not already created by the migration itself
      const exists = db
        .prepare<[number], { version: number }>(
          'SELECT version FROM schema_migrations WHERE version = ?',
        )
        .get(migration.version);
      if (!exists) {
        insert.run(migration.version, new Date().toISOString());
      }
    });
    runMigration();
    console.info(`[migrations] Applied migration ${migration.version}`);
  }
}
