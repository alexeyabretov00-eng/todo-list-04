import { listsApi } from '@api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ListsState {
  items: TodoList[];
  loading: boolean;
  error: string | null;
}

const initialState: ListsState = {
  items: [],
  loading: false,
  error: null,
};

// ─── Async thunks ──────────────────────────────────────────────────────────────

export const fetchLists = createAsyncThunk<TodoList[]>('lists/fetchAll', async () => {
  return listsApi.getAll();
});

export const createList = createAsyncThunk<TodoList, string>(
  'lists/create',
  async (name) => {
    return listsApi.create(name);
  }
);

export const renameList = createAsyncThunk<TodoList, { id: string; name: string }>(
  'lists/rename',
  async ({ id, name }) => {
    return listsApi.update(id, { name });
  }
);

export const deleteList = createAsyncThunk<string, string>(
  'lists/delete',
  async (id) => {
    await listsApi.remove(id);
    return id;
  }
);

export const reorderLists = createAsyncThunk<void, string[]>(
  'lists/reorder',
  async (orderedIds) => {
    await listsApi.reorder(orderedIds);
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    setLists(state, action: PayloadAction<TodoList[]>) {
      state.items = action.payload;
    },
    addList(state, action: PayloadAction<TodoList>) {
      state.items.push(action.payload);
    },
    updateList(state, action: PayloadAction<TodoList>) {
      const index = state.items.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeList(state, action: PayloadAction<string>) {
      state.items = state.items.filter((l) => l.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch lists';
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(renameList.fulfilled, (state, action) => {
        const index = state.items.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l.id !== action.payload);
      });
  },
});

export const { setLists, addList, updateList, removeList } = listsSlice.actions;

