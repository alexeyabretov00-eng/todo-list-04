import { resolveConflict, applyOperation } from '../../src/services/syncService';
import type { SyncOperationInput } from '../../src/services/validation';

/**
 * T086 — Unit tests for last-write-wins conflict resolution (FR-013).
 *
 * Rules under test:
 * - When clientTimestamp > serverUpdatedAt → client wins (apply operation)
 * - When clientTimestamp < serverUpdatedAt → server wins (skip, mark conflicted)
 * - When clientTimestamp === serverUpdatedAt → server wins (already applied)
 */
describe('syncService — last-write-wins conflict resolution (FR-013)', () => {
  const baseOp: SyncOperationInput = {
    id: 'op-1',
    entityType: 'todo',
    operation: 'update',
    entityId: 'todo-123',
    payload: { title: 'Updated title' },
    clientTimestamp: '2026-01-01T12:00:00.000Z',
    idempotencyKey: 'idem-1',
  };

  describe('resolveConflict', () => {
    it('returns "apply" when clientTimestamp is strictly newer than serverUpdatedAt', () => {
      const result = resolveConflict(
        '2026-01-01T12:00:01.000Z', // clientTimestamp — 1 second later
        '2026-01-01T12:00:00.000Z', // serverUpdatedAt
      );
      expect(result).toBe('apply');
    });

    it('returns "skip" when clientTimestamp equals serverUpdatedAt (server wins tie)', () => {
      const result = resolveConflict(
        '2026-01-01T12:00:00.000Z',
        '2026-01-01T12:00:00.000Z',
      );
      expect(result).toBe('skip');
    });

    it('returns "skip" when clientTimestamp is older than serverUpdatedAt', () => {
      const result = resolveConflict(
        '2026-01-01T11:59:59.000Z', // clientTimestamp — 1 second earlier
        '2026-01-01T12:00:00.000Z', // serverUpdatedAt
      );
      expect(result).toBe('skip');
    });
  });

  describe('applyOperation — conflict scenarios', () => {
    it('marks operation as conflicted when server data is newer', () => {
      const serverUpdatedAt = '2026-01-01T13:00:00.000Z'; // newer than client
      const op: SyncOperationInput = {
        ...baseOp,
        clientTimestamp: '2026-01-01T12:00:00.000Z',
      };

      const result = applyOperation(op, serverUpdatedAt);
      expect(result.status).toBe('conflicted');
      expect(result.id).toBe(op.id);
    });

    it('marks operation as applied when client data is newer', () => {
      const serverUpdatedAt = '2026-01-01T11:00:00.000Z'; // older than client
      const op: SyncOperationInput = {
        ...baseOp,
        clientTimestamp: '2026-01-01T12:00:00.000Z',
      };

      const result = applyOperation(op, serverUpdatedAt);
      expect(result.status).toBe('applied');
      expect(result.id).toBe(op.id);
    });

    it('marks operation as conflicted when timestamps are equal (server wins)', () => {
      const ts = '2026-01-01T12:00:00.000Z';
      const op: SyncOperationInput = { ...baseOp, clientTimestamp: ts };

      const result = applyOperation(op, ts);
      expect(result.status).toBe('conflicted');
    });
  });
});
