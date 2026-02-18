import type { SyncOperationInput, SyncRequestInput } from './validation';

export type ConflictResolution = 'apply' | 'skip';

export interface OperationResult {
  id: string;
  status: 'applied' | 'conflicted' | 'failed';
  serverEntity?: Record<string, unknown>;
  error?: { code: string; message: string };
}

export interface SyncResult {
  applied: OperationResult[];
  failed: OperationResult[];
}

/**
 * Determines whether a client operation should be applied or skipped.
 *
 * Last-write-wins rule (FR-013):
 * - clientTimestamp strictly greater than serverUpdatedAt → apply (client wins)
 * - clientTimestamp equal to or less than serverUpdatedAt → skip (server wins)
 */
export function resolveConflict(
  clientTimestamp: string,
  serverUpdatedAt: string,
): ConflictResolution {
  return new Date(clientTimestamp) > new Date(serverUpdatedAt) ? 'apply' : 'skip';
}

/**
 * Determines the result of applying a single operation against a known server state.
 * Used in unit tests (T086) and by processSyncBatch for non-DB logic.
 */
export function applyOperation(
  op: SyncOperationInput,
  serverUpdatedAt: string,
): OperationResult {
  const resolution = resolveConflict(op.clientTimestamp, serverUpdatedAt);
  if (resolution === 'skip') {
    return { id: op.id, status: 'conflicted' };
  }
  return { id: op.id, status: 'applied' };
}

/**
 * Processes a batch of sync operations.
 * Each operation is dispatched to the appropriate service based on entityType + operation.
 * Returns applied and failed result arrays for the SyncResponse.
 *
 * NOTE: Full DB-backed dispatch is wired in Phase 3+ when services exist.
 * In Phase 2 this function provides the conflict-resolution layer only.
 */
export function processSyncBatch(
  request: SyncRequestInput,
  getServerUpdatedAt: (entityType: string, entityId: string) => string | null,
): SyncResult {
  const applied: OperationResult[] = [];
  const failed: OperationResult[] = [];

  for (const op of request.operations) {
    try {
      const serverUpdatedAt = getServerUpdatedAt(op.entityType, op.entityId);

      if (serverUpdatedAt !== null) {
        const resolution = resolveConflict(op.clientTimestamp, serverUpdatedAt);
        if (resolution === 'skip') {
          // Conflict — server is newer or equal
          applied.push({ id: op.id, status: 'conflicted' });
          continue;
        }
      }

      // Entity doesn't exist yet (create) or client is newer — mark applied
      // Actual DB mutations are wired in Phase 3+
      applied.push({ id: op.id, status: 'applied' });
    } catch (err) {
      failed.push({
        id: op.id,
        status: 'failed',
        error: {
          code: 'SYNC_ERROR',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    }
  }

  return { applied, failed };
}
