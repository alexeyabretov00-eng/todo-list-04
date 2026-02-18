import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TodosState {
  byListId: Record<string, TodoItem[]>;
  loading: boolean;
  error: string | null;
}

const initialState: TodosState = {
  byListId: {},
  loading: false,
  error: null,
};

export const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setTodosForList(state, action: PayloadAction<{ listId: string; items: TodoItem[] }>) {
      state.byListId[action.payload.listId] = action.payload.items;
    },
    addTodo(state, action: PayloadAction<TodoItem>) {
      const list = state.byListId[action.payload.listId] ?? [];
      state.byListId[action.payload.listId] = [...list, action.payload];
    },
    updateTodo(state, action: PayloadAction<TodoItem>) {
      const list = state.byListId[action.payload.listId] ?? [];
      const index = list.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.byListId[action.payload.listId][index] = action.payload;
      }
    },
    removeTodo(state, action: PayloadAction<{ id: string; listId: string }>) {
      const list = state.byListId[action.payload.listId] ?? [];
      state.byListId[action.payload.listId] = list.filter((t) => t.id !== action.payload.id);
    },
    setTodosLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setTodosError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setTodosForList,
  addTodo,
  updateTodo,
  removeTodo,
  setTodosLoading,
  setTodosError,
} = todosSlice.actions;
