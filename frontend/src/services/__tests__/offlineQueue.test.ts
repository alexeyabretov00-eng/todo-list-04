/**
 * T089 — TDD gate for offlineQueue service (FR-010)
 *
 * Validates:
 * (a) pending operation is written to IndexedDB when offline
 * (b) queue is read and dispatched on reconnect
 * (c) successfully synced operations are removed from the queue
 *
 * Architecture note:
 * offlineQueue.ts owns a module-level singleton `dbPromise`.
 * To allow each test to control the IDB mock, we expose a `_resetDbForTest`
 * escape hatch in the module that clears the singleton between tests.
 */

import type { IDBPDatabase } from 'idb';

// ─── Module mocks ─────────────────────────────────────────────────────────────

// Must mock BEFORE importing the module under test
const mockAdd = jest.fn();
const mockGetAll = jest.fn();
const mockDelete = jest.fn();
const mockPut = jest.fn();

// Build a fresh db-mock object per test — shared mock functions allow assertions
function freshDbMock(stored: OfflineOperation[] = []): IDBPDatabase {
  const store = new Map<string, OfflineOperation>(stored.map((op) => [op.id, op]));
  mockAdd.mockImplementation(async (_s: string, op: OfflineOperation) => {
    store.set(op.id, op); return op.id;
  });
  mockGetAll.mockImplementation(async () => Array.from(store.values()));
  mockDelete.mockImplementation(async (_s: string, id: string) => { store.delete(id); });
  mockPut.mockImplementation(async (_s: string, op: OfflineOperation) => {
    store.set(op.id, op); return op.id;
  });
  return { add: mockAdd, getAll: mockGetAll, delete: mockDelete, put: mockPut } as unknown as IDBPDatabase;
}

const mockOpenDB = jest.fn();

jest.mock('idb', () => ({
  openDB: (...args: unknown[]) => mockOpenDB(...args),
}));

const mockPostSyncBatch = jest.fn();

jest.mock('../../api/syncApi', () => ({
  postSyncBatch: (...args: unknown[]) => mockPostSyncBatch(...args),
}));

// ─── Module under test (imported AFTER mocks are registered) ──────────────────

import { _resetDbForTest,enqueueOperation, flushQueue } from '../offlineQueue';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeOperation(overrides: Partial<OfflineOperation> = {}): OfflineOperation {
  return {
    id: 'op-1',
    entityType: 'list',
    operation: 'create',
    entityId: 'entity-1',
    payload: { name: 'Test List' },
    clientTimestamp: new Date().toISOString(),
    idempotencyKey: 'idem-1',
    retryCount: 0,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('offlineQueue (TDD gate — FR-010)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the module-level singleton so each test gets a fresh openDB call
    _resetDbForTest();
    mockOpenDB.mockResolvedValue(freshDbMock());
  });

  describe('(a) enqueueOperation — writes to IndexedDB when offline', () => {
    it('calls db.add with the operation when the device is offline', async () => {
      const op = makeOperation();
      await enqueueOperation(op);

      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ id: 'op-1', entityType: 'list' })
      );
    });

    it('stores the correct operation fields in IndexedDB', async () => {
      const op = makeOperation({ entityId: 'list-42', operation: 'update', retryCount: 0 });
      await enqueueOperation(op);

      const [, storedOp] = mockAdd.mock.calls[0] as [string, OfflineOperation];
      expect(storedOp.entityId).toBe('list-42');
      expect(storedOp.operation).toBe('update');
      expect(storedOp.retryCount).toBe(0);
    });
  });

  describe('(b) flushQueue — reads queue and dispatches on reconnect', () => {
    it('calls postSyncBatch with all pending operations', async () => {
      const pending = [makeOperation({ id: 'op-a' }), makeOperation({ id: 'op-b' })];
      _resetDbForTest();
      mockOpenDB.mockResolvedValue(freshDbMock(pending));
      mockPostSyncBatch.mockResolvedValue({ applied: [], failed: [] });

      await flushQueue();

      expect(mockGetAll).toHaveBeenCalledTimes(1);
      expect(mockPostSyncBatch).toHaveBeenCalledTimes(1);
      const [calledOps] = mockPostSyncBatch.mock.calls[0] as [OfflineOperation[]];
      expect(calledOps).toHaveLength(2);
      expect(calledOps.map((o) => o.id)).toEqual(expect.arrayContaining(['op-a', 'op-b']));
    });

    it('does not call postSyncBatch when the queue is empty', async () => {
      mockPostSyncBatch.mockResolvedValue({ applied: [], failed: [] });
      // freshDbMock() defaults to empty store — already set in beforeEach
      await flushQueue();

      expect(mockPostSyncBatch).not.toHaveBeenCalled();
    });
  });

  describe('(c) removeFromQueue — removes successfully synced operations', () => {
    it('deletes applied operations from IndexedDB after successful sync', async () => {
      const op = makeOperation({ id: 'op-success' });
      _resetDbForTest();
      mockOpenDB.mockResolvedValue(freshDbMock([op]));
      mockPostSyncBatch.mockResolvedValue({
        applied: [{ id: 'op-success', status: 'applied' }],
        failed: [],
      });

      await flushQueue();

      expect(mockDelete).toHaveBeenCalledWith(expect.any(String), 'op-success');
    });

    it('does not delete operations that failed sync', async () => {
      const op = makeOperation({ id: 'op-fail' });
      _resetDbForTest();
      mockOpenDB.mockResolvedValue(freshDbMock([op]));
      mockPostSyncBatch.mockResolvedValue({
        applied: [],
        failed: [{ id: 'op-fail', status: 'failed' }],
      });

      await flushQueue();

      expect(mockDelete).not.toHaveBeenCalledWith(expect.any(String), 'op-fail');
    });

    it('increments retryCount for failed operations (up to max 3)', async () => {
      const op = makeOperation({ id: 'op-retry', retryCount: 0 });
      _resetDbForTest();
      mockOpenDB.mockResolvedValue(freshDbMock([op]));
      mockPostSyncBatch.mockResolvedValue({
        applied: [],
        failed: [{ id: 'op-retry', status: 'failed' }],
      });

      await flushQueue();

      expect(mockPut).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ id: 'op-retry', retryCount: 1 })
      );
    });
  });
});
