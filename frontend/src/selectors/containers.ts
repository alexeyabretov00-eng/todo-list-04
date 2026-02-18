import { createSelector } from '@reduxjs/toolkit';
import type { SyncStatus } from '@slices';
import type { RootState } from '@store';

// ─── AppContainer selectors ───────────────────────────────────────────────────

export interface AppContainerProps {
  lists: TodoList[];
  selectedListId: string | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  failedIds: string[];
}

export const getAppContainerProps = createSelector(
  (state: RootState) => state.lists.items,
  (state: RootState) => state.ui.selectedListId,
  (state: RootState) => state.lists.loading,
  (state: RootState) => state.lists.error,
  (state: RootState) => state.sync.isOnline,
  (state: RootState) => state.sync.syncStatus,
  (state: RootState) => state.sync.pendingCount,
  (state: RootState) => state.sync.failedIds,
  (lists, selectedListId, loading, error, isOnline, syncStatus, pendingCount, failedIds): AppContainerProps => ({
    lists,
    selectedListId,
    loading,
    error,
    isOnline,
    syncStatus,
    pendingCount,
    failedIds,
  })
);

// ─── TodoListsViewContainer selectors ─────────────────────────────────────────

export interface TodoListsViewContainerProps {
  todos: TodoItem[];
  subItemsByTodoId: Record<string, SubItem[]>;
  selectedListId: string | null;
  loading: boolean;
  error: string | null;
}

export const getTodoListsViewContainerProps = createSelector(
  (state: RootState) => state.todos.byListId,
  (state: RootState) => state.subitems.byTodoId,
  (state: RootState) => state.ui.selectedListId,
  (state: RootState) => state.todos.loading,
  (state: RootState) => state.todos.error,
  (byListId, byTodoId, selectedListId, loading, error): TodoListsViewContainerProps => ({
    todos: selectedListId ? (byListId[selectedListId] ?? []) : [],
    subItemsByTodoId: byTodoId,
    selectedListId,
    loading,
    error,
  })
);
