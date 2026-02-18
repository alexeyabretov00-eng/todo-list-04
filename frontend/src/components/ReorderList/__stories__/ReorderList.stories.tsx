import type { Meta, StoryObj } from '@storybook/react';

import { ReorderList } from '../ReorderList';

const meta: Meta<typeof ReorderList> = {
  title: 'Components/ReorderList',
  component: ReorderList,
  args: {
    onReorder: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ReorderList>;

export const Default: Story = {
  args: {
    items: [
      { id: '1', content: <span>Buy groceries</span> },
      { id: '2', content: <span>Do laundry</span> },
      { id: '3', content: <span>Walk the dog</span> },
    ],
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ id: '1', content: <span>Only item</span> }],
  },
};

export const ManyItems: Story = {
  args: {
    items: Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      content: <span>List item {i + 1}</span>,
    })),
  },
};
