import type { Meta, StoryObj } from '@storybook/react';

import { TodoItemRow } from '../TodoItemRow';

const mockSubItems: SubItem[] = [
  {
    id: 'sub-1',
    todoId: 'todo-1',
    title: 'Buy skimmed milk',
    completed: false,
    position: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-2',
    todoId: 'todo-1',
    title: 'Buy oat milk',
    completed: true,
    position: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const meta: Meta<typeof TodoItemRow> = {
  title: 'Components/TodoItemRow',
  component: TodoItemRow,
  args: {
    todo: {
      id: 'todo-1',
      listId: 'list-1',
      title: 'Buy groceries',
      completed: false,
      position: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    subItems: [],
    onToggleTodo: () => undefined,
    onToggleSubItem: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof TodoItemRow>;

export const Default: Story = {};

export const WithSubItems: Story = {
  args: {
    subItems: mockSubItems,
  },
};

export const Completed: Story = {
  args: {
    todo: {
      id: 'todo-1',
      listId: 'list-1',
      title: 'Buy groceries',
      completed: true,
      position: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    subItems: mockSubItems.map((s) => ({ ...s, completed: true })),
  },
};

export const PartiallyComplete: Story = {
  args: {
    subItems: mockSubItems,
  },
};
