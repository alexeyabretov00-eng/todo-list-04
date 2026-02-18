import type { Meta, StoryObj } from '@storybook/react';

import { SubItemRow } from '../SubItemRow';

const meta: Meta<typeof SubItemRow> = {
  title: 'Components/SubItemRow',
  component: SubItemRow,
  args: {
    subItem: {
      id: 'sub-1',
      todoId: 'todo-1',
      title: 'Buy skimmed milk',
      completed: false,
      position: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    onToggle: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof SubItemRow>;

export const Default: Story = {};

export const Completed: Story = {
  args: {
    subItem: {
      id: 'sub-1',
      todoId: 'todo-1',
      title: 'Buy skimmed milk',
      completed: true,
      position: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  },
};
