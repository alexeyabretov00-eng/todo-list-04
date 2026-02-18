import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { listsSlice, subItemsSlice, syncSlice, todosSlice, uiSlice } from '@slices';

// ─── Store ────────────────────────────────────────────────────────────────────
// Each slice lives in store/slices/<name>Slice.ts.
// This file ONLY configures the store and exports shared types/hooks.

export const store = configureStore({
  reducer: {
    lists: listsSlice.reducer,
    todos: todosSlice.reducer,
    subitems: subItemsSlice.reducer,
    ui: uiSlice.reducer,
    sync: syncSlice.reducer,
  },
  // No persistence middleware — state is ephemeral per spec
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
