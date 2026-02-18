/**
 * T077 – SyncStatus Storybook stories
 */

import type { Meta, StoryObj } from '@storybook/react';

import { SyncStatus } from '../SyncStatus';

const meta: Meta<typeof SyncStatus> = {
  title: 'Components/SyncStatus',
  component: SyncStatus,
  args: {
    onRetry: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof SyncStatus>;

export const Online: Story = {
  args: {
    isOnline: true,
    syncStatus: 'idle',
    pendingCount: 0,
    failedIds: [],
  },
};

export const Offline: Story = {
  args: {
    isOnline: false,
    syncStatus: 'idle',
    pendingCount: 3,
    failedIds: [],
  },
};

export const OfflineNoPending: Story = {
  args: {
    isOnline: false,
    syncStatus: 'idle',
    pendingCount: 0,
    failedIds: [],
  },
};

export const Syncing: Story = {
  args: {
    isOnline: true,
    syncStatus: 'syncing',
    pendingCount: 2,
    failedIds: [],
  },
};

export const Synced: Story = {
  args: {
    isOnline: true,
    syncStatus: 'synced',
    pendingCount: 0,
    failedIds: [],
  },
};

export const SyncError: Story = {
  args: {
    isOnline: true,
    syncStatus: 'error',
    pendingCount: 0,
    failedIds: ['op-1', 'op-2'],
  },
};
