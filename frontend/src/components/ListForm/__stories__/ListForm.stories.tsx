import type { Meta, StoryObj } from '@storybook/react';
import { ListForm } from '../ListForm';

const meta: Meta<typeof ListForm> = {
  title: 'Components/ListForm',
  component: ListForm,
  args: {
    existingNames: [],
    onSubmit: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ListForm>;

export const Empty: Story = {};

export const WithExistingNames: Story = {
  args: {
    existingNames: ['Work', 'Personal', 'Shopping'],
  },
};
