import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { subitemsApi } from '@api';

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

// ─── Async thunks ──────────────────────────────────────────────────────────────

export const fetchSubItems = createAsyncThunk<{ todoId: string; items: SubItem[] }, string>(
  'subitems/fetchForTodo',
  async (todoId) => {
    const items = await subitemsApi.getForTodo(todoId);
    return { todoId, items };
  }
);

export const createSubItem = createAsyncThunk<SubItem, { todoId: string; title: string }>(
  'subitems/create',
  async ({ todoId, title }) => {
    return subitemsApi.create(todoId, title);
  }
);

export const renameSubItem = createAsyncThunk<SubItem, { subItemId: string; title: string }>(
  'subitems/rename',
  async ({ subItemId, title }) => {
    return subitemsApi.update(subItemId, { title });
  }
);

export const deleteSubItem = createAsyncThunk<{ id: string; todoId: string }, { subItemId: string; todoId: string }>(
  'subitems/delete',
  async ({ subItemId, todoId }) => {
    await subitemsApi.remove(subItemId);
    return { id: subItemId, todoId };
  }
);

export const toggleSubItemComplete = createAsyncThunk<SubItem, { subItemId: string; completed: boolean }>(
  'subitems/toggleComplete',
  async ({ subItemId, completed }) => {
    return subitemsApi.toggleComplete(subItemId, completed);
  }
);

export const reorderSubItems = createAsyncThunk<void, { todoId: string; orderedIds: string[] }>(
  'subitems/reorder',
  async ({ todoId, orderedIds }) => {
    await subitemsApi.reorder(todoId, orderedIds);
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubItems.fulfilled, (state, action) => {
        state.loading = false;
        state.byTodoId[action.payload.todoId] = action.payload.items;
      })
      .addCase(fetchSubItems.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createSubItem.fulfilled, (state, action) => {
        const list = state.byTodoId[action.payload.todoId] ?? [];
        state.byTodoId[action.payload.todoId] = [...list, action.payload];
      })
      .addCase(renameSubItem.fulfilled, (state, action) => {
        const list = state.byTodoId[action.payload.todoId] ?? [];
        const index = list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.byTodoId[action.payload.todoId][index] = action.payload;
      })
      .addCase(deleteSubItem.fulfilled, (state, action) => {
        const list = state.byTodoId[action.payload.todoId] ?? [];
        state.byTodoId[action.payload.todoId] = list.filter((s) => s.id !== action.payload.id);
      })
      .addCase(toggleSubItemComplete.fulfilled, (state, action) => {
        const list = state.byTodoId[action.payload.todoId] ?? [];
        const index = list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.byTodoId[action.payload.todoId][index] = action.payload;
      });
  },
});

export const {
  setSubItemsForTodo,
  addSubItem,
  updateSubItem,
  removeSubItem,
  setSubItemsLoading,
} = subItemsSlice.actions;

