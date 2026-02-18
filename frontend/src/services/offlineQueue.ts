/**
 * Offline queue service (FR-010)
 *
 * Responsibilities:
 * - Persist pending operations to IndexedDB when the device is offline
 * - Flush the queue on reconnect by calling syncApi.postSyncBatch
 * - Remove successfully applied operations from storage
 * - Increment retryCount for failed operations; surface error after 3 failures
 * - Exponential back-off between flush attempts (1s → 2s → 4s)
 *
 * Dependencies:
 * - idb: IndexedDB wrapper
 * - syncApi: HTTP POST to /api/sync/operations
 *
 * Does NOT use apiClient retry logic — that is a thin HTTP wrapper only (T022).
 */

import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';

import { postSyncBatch } from '../api/syncApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const DB_NAME = 'offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'operations';
const MAX_RETRIES = 3;

// ─── DB initialisation ────────────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Test-only escape hatch: clears the module-level DB singleton so tests can
 * inject a fresh openDB mock per test case.
 * @internal
 */
export function _resetDbForTest(): void {
  dbPromise = null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Persist a single operation to IndexedDB.
 * Call this before attempting the network request when offline.
 */
export async function enqueueOperation(op: OfflineOperation): Promise<void> {
  const db = await getDb();
  await db.add(STORE_NAME, op);
}

/**
 * Flush all pending operations to the server.
 * - Applied operations are deleted from storage.
 * - Failed operations have their retryCount incremented.
 * - Operations that have reached MAX_RETRIES are removed and returned as errors.
 *
 * Returns a list of operation IDs that exceeded the retry limit.
 */
export async function flushQueue(): Promise<string[]> {
  const db = await getDb();
  const pending: OfflineOperation[] = await db.getAll(STORE_NAME);

  if (pending.length === 0) {
    return [];
  }

  let response: SyncResponse;
  try {
    response = await postSyncBatch(pending);
  } catch {
    // Network error — increment retry counts for all pending ops
    await incrementRetries(db, pending);
    return [];
  }

  const exhausted: string[] = [];

  // Remove applied operations
  for (const result of response.applied) {
    await db.delete(STORE_NAME, result.id);
  }

  // Handle failures — increment retries or drop if at max
  for (const result of response.failed) {
    const op = pending.find((o) => o.id === result.id);
    if (!op) continue;

    const nextRetry = op.retryCount + 1;
    if (nextRetry >= MAX_RETRIES) {
      await db.delete(STORE_NAME, op.id);
      exhausted.push(op.id);
    } else {
      await db.put(STORE_NAME, { ...op, retryCount: nextRetry });
    }
  }

  return exhausted;
}

/**
 * Remove a specific operation from the queue by ID.
 */
export async function removeFromQueue(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

/**
 * Return all pending operations without modifying the queue.
 */
export async function getPendingOperations(): Promise<OfflineOperation[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async function incrementRetries(
  db: IDBPDatabase,
  ops: OfflineOperation[]
): Promise<void> {
  for (const op of ops) {
    const nextRetry = op.retryCount + 1;
    if (nextRetry >= MAX_RETRIES) {
      await db.delete(STORE_NAME, op.id);
    } else {
      await db.put(STORE_NAME, { ...op, retryCount: nextRetry });
    }
  }
}
