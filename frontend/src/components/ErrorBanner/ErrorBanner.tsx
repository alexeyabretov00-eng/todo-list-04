/**
 * T088 – ErrorBanner component (FR-021, research Decision 9)
 * Renders an error message and a retry button.
 * Used by AppContainer on startup load failure.
 */

import React from 'react';
import { Alert, Button } from 'antd';

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps): React.ReactElement {
  return (
    <Alert
      type="error"
      description={message}
      role="alert"
      action={
        <Button size="small" danger onClick={onRetry}>
          Retry
        </Button>
      }
    />
  );
}
