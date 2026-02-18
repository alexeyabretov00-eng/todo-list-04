import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '../EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    message: 'Nothing here yet.',
    ctaLabel: 'Add Item',
    onCta: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};

export const LongMessage: Story = {
  args: {
    message: 'No lists have been created. Start by adding your first list.',
    ctaLabel: 'Create List',
  },
};
