import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SubItemsState {
  byTodoId: Record<string, SubItem[]>;
  loading: boolean;
  error: string | null;
}

const initialState: SubItemsState = {
  byTodoId: {},
  loading: false,
  error: null,
};

export const subItemsSlice = createSlice({
  name: 'subitems',
  initialState,
  reducers: {
    setSubItemsForTodo(state, action: PayloadAction<{ todoId: string; items: SubItem[] }>) {
      state.byTodoId[action.payload.todoId] = action.payload.items;
    },
    addSubItem(state, action: PayloadAction<SubItem>) {
      const list = state.byTodoId[action.payload.todoId] ?? [];
      state.byTodoId[action.payload.todoId] = [...list, action.payload];
    },
    updateSubItem(state, action: PayloadAction<SubItem>) {
      const list = state.byTodoId[action.payload.todoId] ?? [];
      const index = list.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.byTodoId[action.payload.todoId][index] = action.payload;
      }
    },
    removeSubItem(state, action: PayloadAction<{ id: string; todoId: string }>) {
      const list = state.byTodoId[action.payload.todoId] ?? [];
      state.byTodoId[action.payload.todoId] = list.filter((s) => s.id !== action.payload.id);
    },
    setSubItemsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const {
  setSubItemsForTodo,
  addSubItem,
  updateSubItem,
  removeSubItem,
  setSubItemsLoading,
} = subItemsSlice.actions;
