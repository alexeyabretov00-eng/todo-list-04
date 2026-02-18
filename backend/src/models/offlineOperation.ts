export type EntityType = 'list' | 'todo' | 'subitem';
export type OperationType = 'create' | 'update' | 'delete' | 'reorder';

/**
 * OfflineOperation — represents a queued mutation to be replayed against the server.
 * Stored in IndexedDB on the client; sent to POST /api/sync/operations on reconnect.
 */
export interface OfflineOperation {
  id: string;
  entityType: EntityType;
  operation: OperationType;
  entityId: string;
  /** Full updated field values for the operation */
  payload: Record<string, unknown>;
  /** ISO 8601 timestamp set by the client at time of mutation */
  clientTimestamp: string;
  /** Prevents duplicate application on retry */
  idempotencyKey: string;
  /** Incremented on each failed sync attempt; max 3 per FR-010 */
  retryCount: number;
}
