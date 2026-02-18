/**
 * T093 — TDD gate for TodoListsViewContainer (FR-011, FR-020)
 *
 * Validates:
 * (a) renders todos and sub-items from the store
 * (b) shows EmptyState when no todos are in the selected list
 * (c) getTodoListsViewContainerProps selector returns correct shape
 */

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import { TodoListsViewContainer } from '../TodoListsViewContainer';
import { getTodoListsViewContainerProps } from '../../../selectors/containers';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('@slices', () => ({
  ...jest.requireActual('@slices'),
  fetchTodos: jest.fn((listId: string) => ({ type: 'todos/fetchForList/pending', meta: { arg: listId } })),
  createTodo: jest.fn(() => ({ type: 'todos/create/pending' })),
  fetchSubItems: jest.fn((todoId: string) => ({ type: 'subitems/fetchForTodo/pending', meta: { arg: todoId } })),
  createSubItem: jest.fn(() => ({ type: 'subitems/create/pending' })),
}));

// ─── Store helpers ────────────────────────────────────────────────────────────

const LIST_ID = 'list-1';

const mockTodo: TodoItem = {
  id: 'todo-1',
  listId: LIST_ID,
  title: 'Write tests',
  completed: false,
  position: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockSubItem: SubItem = {
  id: 'sub-1',
  todoId: 'todo-1',
  title: 'Sub task A',
  completed: false,
  position: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function makeStore(overrides: {
  selectedListId?: string | null;
  todos?: TodoItem[];
  subItems?: SubItem[];
} = {}) {
  const { selectedListId = LIST_ID, todos = [], subItems = [] } = overrides;

  const byTodoId: Record<string, SubItem[]> = {};
  for (const sub of subItems) {
    (byTodoId[sub.todoId] ??= []).push(sub);
  }

  return configureStore({
    reducer: {
      lists: () => ({ items: [], loading: false, error: null }),
      todos: () => ({
        byListId: { [LIST_ID]: todos },
        loading: false,
        error: null,
      }),
      subitems: () => ({ byTodoId, loading: false, error: null }),
      ui: () => ({ selectedListId }),
    },
  });
}

function renderInStore(
  overrides: Parameters<typeof makeStore>[0] = {}
): ReturnType<typeof render> {
  const store = makeStore(overrides);
  return render(
    <Provider store={store}>
      <TodoListsViewContainer listName="My List" />
    </Provider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TodoListsViewContainer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('(a) renders todos from the store', () => {
    renderInStore({ todos: [mockTodo] });
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  it('(a) renders sub-items from the store', () => {
    renderInStore({ todos: [mockTodo], subItems: [mockSubItem] });
    expect(screen.getByText('Sub task A')).toBeInTheDocument();
  });

  it('(b) shows EmptyState when no todos in selected list', () => {
    renderInStore({ todos: [] });
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('(b) shows EmptyState when no list is selected', () => {
    renderInStore({ selectedListId: null, todos: [] });
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });
});

// ─── Selector unit tests ──────────────────────────────────────────────────────

describe('getTodoListsViewContainerProps selector', () => {
  it('(c) returns todos for the selected list', () => {
    const state = {
      lists: { items: [], loading: false, error: null },
      todos: {
        byListId: { [LIST_ID]: [mockTodo] },
        loading: false,
        error: null,
      },
      subitems: { byTodoId: {}, loading: false, error: null },
      ui: { selectedListId: LIST_ID },
    };
    // @ts-ignore partial RootState for test
    const result = getTodoListsViewContainerProps(state);
    expect(result.todos).toHaveLength(1);
    expect(result.todos[0]?.title).toBe('Write tests');
    expect(result.selectedListId).toBe(LIST_ID);
  });

  it('(c) returns empty todos array when no list selected', () => {
    const state = {
      lists: { items: [], loading: false, error: null },
      todos: {
        byListId: { [LIST_ID]: [mockTodo] },
        loading: false,
        error: null,
      },
      subitems: { byTodoId: {}, loading: false, error: null },
      ui: { selectedListId: null },
    };
    // @ts-ignore partial RootState for test
    const result = getTodoListsViewContainerProps(state);
    expect(result.todos).toHaveLength(0);
    expect(result.selectedListId).toBeNull();
  });
});
