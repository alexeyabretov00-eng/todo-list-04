import { todosApi } from '@api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

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

// ─── Async thunks ──────────────────────────────────────────────────────────────

export const fetchTodos = createAsyncThunk<{ listId: string; items: TodoItem[] }, string>(
  'todos/fetchForList',
  async (listId) => {
    const items = await todosApi.getForList(listId);
    return { listId, items };
  }
);

export const createTodo = createAsyncThunk<TodoItem, { listId: string; title: string }>(
  'todos/create',
  async ({ listId, title }) => {
    return todosApi.create(listId, title);
  }
);

export const renameTodo = createAsyncThunk<TodoItem, { todoId: string; title: string }>(
  'todos/rename',
  async ({ todoId, title }) => {
    return todosApi.update(todoId, { title });
  }
);

export const deleteTodo = createAsyncThunk<{ id: string; listId: string }, { todoId: string; listId: string }>(
  'todos/delete',
  async ({ todoId, listId }) => {
    await todosApi.remove(todoId);
    return { id: todoId, listId };
  }
);

export const toggleTodoComplete = createAsyncThunk<TodoItem, { todoId: string; completed: boolean }>(
  'todos/toggleComplete',
  async ({ todoId, completed }) => {
    return todosApi.toggleComplete(todoId, completed);
  }
);

export const reorderTodos = createAsyncThunk<void, { listId: string; orderedIds: string[] }>(
  'todos/reorder',
  async ({ listId, orderedIds }) => {
    await todosApi.reorder(listId, orderedIds);
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.byListId[action.payload.listId] = action.payload.items;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch todos';
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        const list = state.byListId[action.payload.listId] ?? [];
        state.byListId[action.payload.listId] = [...list, action.payload];
      })
      .addCase(renameTodo.fulfilled, (state, action) => {
        const list = state.byListId[action.payload.listId] ?? [];
        const index = list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.byListId[action.payload.listId][index] = action.payload;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        const list = state.byListId[action.payload.listId] ?? [];
        state.byListId[action.payload.listId] = list.filter((t) => t.id !== action.payload.id);
      })
      .addCase(toggleTodoComplete.fulfilled, (state, action) => {
        const list = state.byListId[action.payload.listId] ?? [];
        const index = list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.byListId[action.payload.listId][index] = action.payload;
      });
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

