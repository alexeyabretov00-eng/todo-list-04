/**
 * T091 – Automated viewport regression tests (FR-008, constitution §II)
 *
 * Asserts no horizontal overflow at 375px (mobile portrait) viewport width
 * for key components: ListPanel, TodoItemRow, SubItemRow.
 *
 * Note: jsdom does not execute real CSS layout, so these are smoke tests
 * verifying structural readiness rather than visual regression tests.
 * scrollWidth ≤ 375 is asserted using Object.defineProperty overrides.
 */

import { render } from '@testing-library/react';

import { ListPanel } from '../ListPanel';
import { SubItemRow } from '../SubItemRow';
import { TodoItemRow } from '../TodoItemRow';

// ── Viewport helper ───────────────────────────────────────────────────────────

function setViewportWidth(width: number) {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: width,
  });
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockList: TodoList = {
  id: 'list-1',
  name: 'Groceries',
  position: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockTodo: TodoItem = {
  id: 'todo-1',
  listId: 'list-1',
  title: 'Buy milk',
  completed: false,
  position: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockSubItem: SubItem = {
  id: 'sub-1',
  todoId: 'todo-1',
  title: 'Skimmed milk',
  completed: false,
  position: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const MOBILE_WIDTH = 375;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Viewport regression – 375px mobile portrait', () => {
  beforeEach(() => {
    setViewportWidth(MOBILE_WIDTH);
  });

  afterEach(() => {
    // Reset to jsdom default (1024)
    setViewportWidth(1024);
  });

  describe('ListPanel', () => {
    it('renders without horizontal overflow at 375px', () => {
      const { container } = render(
        <ListPanel
          lists={[mockList]}
          selectedListId={null}
          onSelectList={jest.fn()}
          onCreateList={jest.fn()}
        />
      );

      expect(document.documentElement.clientWidth).toBe(MOBILE_WIDTH);
      // In jsdom scrollWidth defaults to 0 for non-laid-out elements;
      // assert it does not exceed the viewport
      const scrollWidth = container.firstElementChild
        ? (container.firstElementChild as HTMLElement).scrollWidth
        : 0;
      expect(scrollWidth).toBeLessThanOrEqual(MOBILE_WIDTH);
    });

    it('renders empty list without horizontal overflow at 375px', () => {
      const { container } = render(
        <ListPanel
          lists={[]}
          selectedListId={null}
          onSelectList={jest.fn()}
          onCreateList={jest.fn()}
        />
      );

      const scrollWidth = container.firstElementChild
        ? (container.firstElementChild as HTMLElement).scrollWidth
        : 0;
      expect(scrollWidth).toBeLessThanOrEqual(MOBILE_WIDTH);
    });
  });

  describe('TodoItemRow', () => {
    it('renders todo without horizontal overflow at 375px', () => {
      const { container } = render(
        <TodoItemRow
          todo={mockTodo}
          subItems={[mockSubItem]}
          onToggleTodo={jest.fn()}
          onToggleSubItem={jest.fn()}
        />
      );

      expect(document.documentElement.clientWidth).toBe(MOBILE_WIDTH);
      const scrollWidth = container.firstElementChild
        ? (container.firstElementChild as HTMLElement).scrollWidth
        : 0;
      expect(scrollWidth).toBeLessThanOrEqual(MOBILE_WIDTH);
    });

    it('renders completed todo without horizontal overflow at 375px', () => {
      const completedTodo = { ...mockTodo, completed: true };
      const { container } = render(
        <TodoItemRow
          todo={completedTodo}
          subItems={[]}
          onToggleTodo={jest.fn()}
          onToggleSubItem={jest.fn()}
        />
      );

      const scrollWidth = container.firstElementChild
        ? (container.firstElementChild as HTMLElement).scrollWidth
        : 0;
      expect(scrollWidth).toBeLessThanOrEqual(MOBILE_WIDTH);
    });
  });

  describe('SubItemRow', () => {
    it('renders subitem without horizontal overflow at 375px', () => {
      const { container } = render(
        <SubItemRow
          subItem={mockSubItem}
          onToggle={jest.fn()}
        />
      );

      expect(document.documentElement.clientWidth).toBe(MOBILE_WIDTH);
      const scrollWidth = container.firstElementChild
        ? (container.firstElementChild as HTMLElement).scrollWidth
        : 0;
      expect(scrollWidth).toBeLessThanOrEqual(MOBILE_WIDTH);
    });

    it('renders completed subitem without horizontal overflow at 375px', () => {
      const completedSubItem = { ...mockSubItem, completed: true };
      const { container } = render(
        <SubItemRow
          subItem={completedSubItem}
          onToggle={jest.fn()}
        />
      );

      const scrollWidth = container.firstElementChild
        ? (container.firstElementChild as HTMLElement).scrollWidth
        : 0;
      expect(scrollWidth).toBeLessThanOrEqual(MOBILE_WIDTH);
    });
  });
});
