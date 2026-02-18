import type { Meta, StoryObj } from '@storybook/react';
import { ListPanel } from '../ListPanel';

const sampleLists: TodoList[] = [
  {
    id: '1',
    name: 'Work',
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Personal',
    position: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const meta: Meta<typeof ListPanel> = {
  title: 'Components/ListPanel',
  component: ListPanel,
  args: {
    lists: sampleLists,
    selectedListId: '1',
    onSelectList: () => undefined,
    onCreateList: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ListPanel>;

export const WithLists: Story = {};

export const EmptyLists: Story = {
  args: {
    lists: [],
    selectedListId: null,
  },
};

export const NoneSelected: Story = {
  args: {
    selectedListId: null,
  },
};
