import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBanner } from '../ErrorBanner';

const meta: Meta<typeof ErrorBanner> = {
  title: 'Components/ErrorBanner',
  component: ErrorBanner,
  args: {
    message: 'Failed to load data. Please try again.',
    onRetry: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBanner>;

export const Default: Story = {};

export const NetworkError: Story = {
  args: {
    message: 'Network error: Unable to connect to the server.',
  },
};
