/**
 * T075/T076 – syncSlice
 *
 * Tracks connectivity and offline-queue sync state for the SyncStatus UI
 * indicator (FR-010, FR-013).
 *
 * State shape:
 *   isOnline      – mirrors navigator.onLine / window online/offline events
 *   syncStatus    – 'idle' | 'syncing' | 'synced' | 'error'
 *   pendingCount  – number of operations still waiting in the offline queue
 *   failedIds     – operation IDs that exhausted all retries (error state)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface SyncState {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  failedIds: string[];
}

const initialState: SyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncStatus: 'idle',
  pendingCount: 0,
  failedIds: [],
};

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
      if (action.payload && state.syncStatus === 'error') {
        // Reset error when coming back online so flush can retry
        state.syncStatus = 'idle';
      }
    },
    setSyncing(state) {
      state.syncStatus = 'syncing';
    },
    setSynced(state, action: PayloadAction<{ pendingCount: number }>) {
      state.syncStatus = action.payload.pendingCount === 0 ? 'synced' : 'idle';
      state.pendingCount = action.payload.pendingCount;
    },
    setSyncError(state, action: PayloadAction<{ failedIds: string[] }>) {
      state.syncStatus = 'error';
      state.failedIds = action.payload.failedIds;
    },
    setPendingCount(state, action: PayloadAction<number>) {
      state.pendingCount = action.payload;
    },
    clearFailedIds(state) {
      state.failedIds = [];
      if (state.syncStatus === 'error') {
        state.syncStatus = 'idle';
      }
    },
  },
});

export const {
  setOnline,
  setSyncing,
  setSynced,
  setSyncError,
  setPendingCount,
  clearFailedIds,
} = syncSlice.actions;
