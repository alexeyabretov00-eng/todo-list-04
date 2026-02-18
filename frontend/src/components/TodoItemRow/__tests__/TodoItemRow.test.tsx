/**
 * T051 – Component tests for completion toggle (TodoItemRow)
 * Validates toggle interaction for FR-005, FR-006, FR-017 at the component level.
 */

import { fireEvent, render, screen } from '@testing-library/react';

import { TodoItemRow } from '../TodoItemRow';

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

describe('TodoItemRow', () => {
  it('renders the todo title', () => {
    render(
      <TodoItemRow
        todo={mockTodo}
        subItems={[]}
        onToggleTodo={jest.fn()}
        onToggleSubItem={jest.fn()}
      />
    );
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('renders a checkbox for the todo', () => {
    render(
      <TodoItemRow
        todo={mockTodo}
        subItems={[]}
        onToggleTodo={jest.fn()}
        onToggleSubItem={jest.fn()}
      />
    );
    const checkbox = screen.getByRole('checkbox', { name: /buy milk/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('shows checkbox as checked when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(
      <TodoItemRow
        todo={completedTodo}
        subItems={[]}
        onToggleTodo={jest.fn()}
        onToggleSubItem={jest.fn()}
      />
    );
    expect(screen.getByRole('checkbox', { name: /buy milk/i })).toBeChecked();
  });

  it('calls onToggleTodo with (id, !completed) when the todo checkbox is clicked', () => {
    const onToggleTodo = jest.fn();
    render(
      <TodoItemRow
        todo={mockTodo}
        subItems={[]}
        onToggleTodo={onToggleTodo}
        onToggleSubItem={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /buy milk/i }));
    expect(onToggleTodo).toHaveBeenCalledWith('todo-1', true);
  });

  it('renders sub-items when provided', () => {
    render(
      <TodoItemRow
        todo={mockTodo}
        subItems={[mockSubItem]}
        onToggleTodo={jest.fn()}
        onToggleSubItem={jest.fn()}
      />
    );
    expect(screen.getByText('Skimmed milk')).toBeInTheDocument();
  });

  it('calls onToggleSubItem with (id, !completed) when a subitem checkbox is clicked', () => {
    const onToggleSubItem = jest.fn();
    render(
      <TodoItemRow
        todo={mockTodo}
        subItems={[mockSubItem]}
        onToggleTodo={jest.fn()}
        onToggleSubItem={onToggleSubItem}
      />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /skimmed milk/i }));
    expect(onToggleSubItem).toHaveBeenCalledWith('sub-1', true);
  });

  it('renders a crossed-out title when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    const { container } = render(
      <TodoItemRow
        todo={completedTodo}
        subItems={[]}
        onToggleTodo={jest.fn()}
        onToggleSubItem={jest.fn()}
      />
    );
    // Ant Design Typography.Text with delete prop renders <del>
    expect(container.querySelector('del')).toBeInTheDocument();
  });
});
