/**
 * T025/T047/T058/T070/T076 – AppContainer
 *
 * Root application container. Responsibilities:
 *   - Fetch lists on mount (FR-011)
 *   - Handle loading / error states
 *   - Wire list create / rename / delete / reorder (T047, T070)
 *   - Wire todo and subitem completion (T058)
 *   - Display SyncStatus indicator (T076, FR-010)
 *   - Listen for online/offline events and flush the offline queue on reconnect
 */

import React, { useCallback, useEffect } from 'react';
import { ErrorBanner, ListPanel, SyncStatus } from '@components';
import { TodoListsViewContainer } from '@containers';
import { getAppContainerProps } from '@selectors';
import { flushQueue, getPendingOperations } from '@services';
import {
  clearFailedIds,
  createList,
  deleteList,
  fetchLists,
  renameList,
  reorderLists,
  selectList,
  setOnline,
  setSynced,
  setSyncError,
  setSyncing,
} from '@slices';
import { useAppDispatch, useAppSelector } from '@store';
import { Layout, Spin, Typography } from 'antd';

const { Text } = Typography;

export function AppContainer(): React.ReactElement {
  const dispatch = useAppDispatch();
  const {
    lists,
    selectedListId,
    loading,
    error,
    isOnline,
    syncStatus,
    pendingCount,
    failedIds,
  } = useAppSelector(getAppContainerProps);

  // ── Initial data load ──────────────────────────────────────────────────────
  useEffect(() => {
    void dispatch(fetchLists());
  }, [dispatch]);

  // ── Online / offline detection + queue flush ───────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnline(true));
      void (async () => {
        dispatch(setSyncing());
        try {
          const exhausted = await flushQueue();
          const remaining = await getPendingOperations();
          if (exhausted.length > 0) {
            dispatch(setSyncError({ failedIds: exhausted }));
          } else {
            dispatch(setSynced({ pendingCount: remaining.length }));
          }
        } catch {
          dispatch(setSyncError({ failedIds: [] }));
        }
      })();
    };

    const handleOffline = () => {
      dispatch(setOnline(false));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  // ── Retry handler ──────────────────────────────────────────────────────────
  const handleSyncRetry = useCallback(() => {
    dispatch(clearFailedIds());
    dispatch(setSyncing());
    void (async () => {
      try {
        const exhausted = await flushQueue();
        const remaining = await getPendingOperations();
        if (exhausted.length > 0) {
          dispatch(setSyncError({ failedIds: exhausted }));
        } else {
          dispatch(setSynced({ pendingCount: remaining.length }));
        }
      } catch {
        dispatch(setSyncError({ failedIds: [] }));
      }
    })();
  }, [dispatch]);

  // ── List event handlers ────────────────────────────────────────────────────
  const handleSelectList = (id: string) => {
    dispatch(selectList(id));
  };

  const handleCreateList = (name: string) => {
    void dispatch(createList(name));
  };

  const handleRenameList = (id: string, name: string) => {
    void dispatch(renameList({ id, name }));
  };

  const handleDeleteList = (id: string) => {
    void dispatch(deleteList(id));
    if (selectedListId === id) {
      dispatch(selectList(null));
    }
  };

  const handleReorderLists = (orderedIds: string[]) => {
    void dispatch(reorderLists(orderedIds));
  };

  // ── Render: loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <span role="status" aria-label="Loading lists…">
          <Spin size="large" />
        </span>
      </Layout>
    );
  }

  // ── Render: error ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <ErrorBanner
          message={error}
          onRetry={() => void dispatch(fetchLists())}
        />
      </Layout>
    );
  }

  const selectedList = lists.find((l) => l.id === selectedListId) ?? null;

  // ── Render: main layout ────────────────────────────────────────────────────
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <ListPanel
        lists={lists}
        selectedListId={selectedListId}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
        onRenameList={handleRenameList}
        onDeleteList={handleDeleteList}
        onReorderLists={handleReorderLists}
      />
      {selectedList ? (
        <TodoListsViewContainer listName={selectedList.name} />
      ) : (
        <Layout.Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">
            {lists.length === 0
              ? 'Create a list to get started.'
              : 'Select a list to view tasks.'}
          </Text>
        </Layout.Content>
      )}
      {/* T076 – SyncStatus indicator (FR-010) */}
      <Layout.Footer
        style={{
          position: 'fixed',
          bottom: 0,
          right: 16,
          background: 'transparent',
          padding: '8px 0',
          zIndex: 100,
        }}
      >
        <SyncStatus
          isOnline={isOnline}
          syncStatus={syncStatus}
          pendingCount={pendingCount}
          failedIds={failedIds}
          onRetry={handleSyncRetry}
        />
      </Layout.Footer>
    </Layout>
  );
}
