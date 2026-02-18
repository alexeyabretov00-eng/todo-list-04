/**
 * T094 – EmptyState component (FR-020)
 * Reusable placeholder used wherever a list or collection is empty.
 */

import React from 'react';
import { Button, Empty } from 'antd';

interface EmptyStateProps {
  message: string;
  ctaLabel: string;
  onCta: () => void;
}

export function EmptyState({ message, ctaLabel, onCta }: EmptyStateProps): React.ReactElement {
  return (
    <Empty description={message}>
      <Button type="primary" onClick={onCta}>
        {ctaLabel}
      </Button>
    </Empty>
  );
}
