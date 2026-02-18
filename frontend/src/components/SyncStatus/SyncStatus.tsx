/**
 * T075 – SyncStatus component (FR-010, FR-013)
 *
 * Displays a small status indicator showing:
 *   - Offline: cloud-off icon with "Offline" label
 *   - Syncing: loading spinner with "Syncing…" label
 *   - Synced: check icon with "Synced" label (briefly visible then fades)
 *   - Error: warning icon with "Sync error" label and retry callback
 *
 * Rendered as a fixed footer badge in AppContainer (T076).
 */

import React from 'react';
import { SyncStatus as SyncStatusType } from '@slices';
import { Badge, Button, Space, Spin, Tag, Tooltip, Typography } from 'antd';

const { Text } = Typography;

export interface SyncStatusProps {
  isOnline: boolean;
  syncStatus: SyncStatusType;
  pendingCount: number;
  failedIds: string[];
  onRetry: () => void;
}

export function SyncStatus({
  isOnline,
  syncStatus,
  pendingCount,
  failedIds,
  onRetry,
}: SyncStatusProps): React.ReactElement {
  if (!isOnline) {
    return (
      <Tag
        color="default"
        role="status"
        aria-label="Offline – changes will sync when reconnected"
        style={{ margin: 0 }}
      >
        <Space size={4}>
          <Badge status="default" />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Offline
            {pendingCount > 0 ? ` (${pendingCount} pending)` : ''}
          </Text>
        </Space>
      </Tag>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <Tag
        color="processing"
        role="status"
        aria-label="Syncing changes"
        style={{ margin: 0 }}
      >
        <Space size={4}>
          <Spin size="small" />
          <Text style={{ fontSize: 12 }}>Syncing…</Text>
        </Space>
      </Tag>
    );
  }

  if (syncStatus === 'error') {
    return (
      <Tooltip title={`${failedIds.length} operation(s) failed to sync`}>
        <Tag
          color="error"
          role="status"
          aria-label="Sync error – some changes could not be saved"
          style={{ margin: 0 }}
        >
          <Space size={4}>
            <Badge status="error" />
            <Text type="danger" style={{ fontSize: 12 }}>
              Sync error
            </Text>
            <Button
              type="link"
              danger
              size="small"
              style={{ padding: 0, height: 'auto', fontSize: 12 }}
              onClick={onRetry}
            >
              Retry
            </Button>
          </Space>
        </Tag>
      </Tooltip>
    );
  }

  if (syncStatus === 'synced') {
    return (
      <Tag
        color="success"
        role="status"
        aria-label="All changes saved"
        style={{ margin: 0 }}
      >
        <Space size={4}>
          <Badge status="success" />
          <Text style={{ fontSize: 12 }}>Synced</Text>
        </Space>
      </Tag>
    );
  }

  // idle – no pending operations, all quiet
  return (
    <Tag
      color="default"
      role="status"
      aria-label="All changes saved"
      style={{ margin: 0, opacity: 0.6 }}
    >
      <Space size={4}>
        <Badge status="success" />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Online
        </Text>
      </Space>
    </Tag>
  );
}
