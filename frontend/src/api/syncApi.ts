import { apiClient } from './apiClient';

/**
 * Dispatch a batch of queued offline operations to the server.
 * Maps to POST /api/sync/operations.
 */
export async function postSyncBatch(operations: OfflineOperation[]): Promise<SyncResponse> {
  return apiClient.post<SyncResponse>('/sync/operations', { operations });
}
