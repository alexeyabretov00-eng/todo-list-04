import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { InlineEdit } from '../InlineEdit';

const meta: Meta<typeof InlineEdit> = {
  title: 'Components/InlineEdit',
  component: InlineEdit,
  args: {
    value: 'Buy groceries',
    onRename: fn(),
    onDelete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof InlineEdit>;

export const Default: Story = {};

export const LongValue: Story = {
  args: {
    value: 'A very long item title that should overflow gracefully within the edit component',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Enter a name…',
  },
};
