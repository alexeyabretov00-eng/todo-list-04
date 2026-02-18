/**
 * T090 — TDD gate for AppContainer startup data-load sequence (FR-011, FR-020)
 *
 * Validates:
 * (a) GET /api/lists is called on component mount
 * (b) returned list data is rendered
 * (c) loading state is shown while request is in-flight
 * (d) when API returns empty array, the add-list CTA is visible (FR-020)
 */

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';

import { AppContainer } from '../AppContainer';

// ─── Module mocks ─────────────────────────────────────────────────────────────

const mockFetchListsAction = { type: 'lists/fetchAll/pending' };

jest.mock('@slices', () => ({
  ...jest.requireActual('@slices'),
  fetchLists: jest.fn(() => mockFetchListsAction),
}));

const { fetchLists } = jest.requireMock('@slices') as {
  fetchLists: jest.MockedFunction<() => typeof mockFetchListsAction>;
};

// ─── Test store helpers ───────────────────────────────────────────────────────

interface ListsState { items: TodoList[]; loading: boolean; error: string | null }
interface TodosState { byListId: Record<string, unknown>; loading: boolean; error: string | null }
interface SubItemsState { byTodoId: Record<string, unknown>; loading: boolean; error: string | null }
interface UiState { selectedListId: string | null }
interface SyncState { isOnline: boolean; syncStatus: string; pendingCount: number; failedIds: string[] }

const defaultTodos: TodosState = { byListId: {}, loading: false, error: null };
const defaultSubItems: SubItemsState = { byTodoId: {}, loading: false, error: null };
const defaultUi: UiState = { selectedListId: null };
const defaultSync: SyncState = { isOnline: true, syncStatus: 'idle', pendingCount: 0, failedIds: [] };

function makeStore(lists: ListsState) {
  return configureStore({
    reducer: {
      lists: (s: ListsState = lists): ListsState => s,
      todos: (s: TodosState = defaultTodos): TodosState => s,
      subitems: (s: SubItemsState = defaultSubItems): SubItemsState => s,
      ui: (s: UiState = defaultUi): UiState => s,
      sync: (s: SyncState = defaultSync): SyncState => s,
    },
    preloadedState: { lists, todos: defaultTodos, subitems: defaultSubItems, ui: defaultUi, sync: defaultSync },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AppContainer — startup data-load sequence (FR-011, FR-020)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('(a) dispatches fetchLists on mount', async () => {
    const store = makeStore({ items: [], loading: false, error: null });
    render(<Provider store={store}><AppContainer /></Provider>);
    await waitFor(() => expect(fetchLists).toHaveBeenCalledTimes(1));
  });

  it('(c) shows loading indicator while request is in-flight', () => {
    const store = makeStore({ items: [], loading: true, error: null });
    render(<Provider store={store}><AppContainer /></Provider>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('(b) renders list names when data is loaded', () => {
    const items: TodoList[] = [
      { id: 'l1', name: 'My List', position: 0, createdAt: '', updatedAt: '' },
    ];
    const store = makeStore({ items, loading: false, error: null });
    render(<Provider store={store}><AppContainer /></Provider>);
    expect(screen.getByText('My List')).toBeInTheDocument();
  });

  it('(d) shows add-list CTA when API returns empty array (FR-020)', () => {
    const store = makeStore({ items: [], loading: false, error: null });
    render(<Provider store={store}><AppContainer /></Provider>);
    const addListButtons = screen.getAllByRole('button', { name: /add.*list|create.*list/i });
    expect(addListButtons.length).toBeGreaterThanOrEqual(1);
  });
});
