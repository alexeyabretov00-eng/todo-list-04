import type { Meta, StoryObj } from '@storybook/react';

import { SubItemForm } from '../SubItemForm';

const meta: Meta<typeof SubItemForm> = {
  title: 'Components/SubItemForm',
  component: SubItemForm,
  args: {
    existingTitles: [],
    onSubmit: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof SubItemForm>;

export const Empty: Story = {};

export const WithExistingTitles: Story = {
  args: {
    existingTitles: ['Research options', 'Book appointment'],
  },
};
