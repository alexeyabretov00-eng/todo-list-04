import type { Meta, StoryObj } from '@storybook/react';
import { TodoItemForm } from '../TodoItemForm';

const meta: Meta<typeof TodoItemForm> = {
  title: 'Components/TodoItemForm',
  component: TodoItemForm,
  args: {
    existingTitles: [],
    onSubmit: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof TodoItemForm>;

export const Empty: Story = {};

export const WithExistingTitles: Story = {
  args: {
    existingTitles: ['Buy groceries', 'Call dentist'],
  },
};
