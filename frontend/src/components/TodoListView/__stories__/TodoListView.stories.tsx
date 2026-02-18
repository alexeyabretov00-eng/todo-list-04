import type { Meta, StoryObj } from '@storybook/react';

import { TodoListView } from '../TodoListView';

const sampleTodos: TodoItem[] = [
  {
    id: 'todo-1',
    listId: 'list-1',
    title: 'Buy groceries',
    completed: false,
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'todo-2',
    listId: 'list-1',
    title: 'Call the bank',
    completed: true,
    position: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleSubItems: SubItem[] = [
  {
    id: 'sub-1',
    todoId: 'todo-1',
    title: 'Milk',
    completed: false,
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-2',
    todoId: 'todo-1',
    title: 'Eggs',
    completed: true,
    position: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const meta: Meta<typeof TodoListView> = {
  title: 'Components/TodoListView',
  component: TodoListView,
  args: {
    listName: 'Shopping',
    todos: sampleTodos,
    subItemsByTodoId: { 'todo-1': sampleSubItems },
    existingTodoTitles: sampleTodos.map((t) => t.title),
    onAddTodo: () => undefined,
    onAddSubItem: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof TodoListView>;

export const WithTodos: Story = {};

export const EmptyList: Story = {
  args: {
    todos: [],
    subItemsByTodoId: {},
    existingTodoTitles: [],
  },
};

export const NoSubItems: Story = {
  args: {
    subItemsByTodoId: {},
  },
};
