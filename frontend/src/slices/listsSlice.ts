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

const API_PATH = process.env.API_PATH ?? '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText })) as { message: string };
    throw new Error(body.message);
  }
  return res.json() as Promise<T>;
}

export const fetchLists = createAsyncThunk<TodoList[]>('lists/fetchAll', async () => {
  return fetchJson<TodoList[]>(`${API_PATH}/lists`);
});

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
      });
  },
});

export const { setLists, addList, updateList, removeList } = listsSlice.actions;
