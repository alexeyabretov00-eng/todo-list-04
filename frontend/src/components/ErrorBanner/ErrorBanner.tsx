/**
 * T088 – ErrorBanner component (FR-021, research Decision 9)
 * Renders an error message and a retry button.
 * Used by AppContainer on startup load failure.
 */

import React from 'react';

import { BannerWrapper, ErrorMessage, RetryButton } from './ErrorBanner.styled';

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps): React.ReactElement {
  return (
    <BannerWrapper role="alert">
      <ErrorMessage>{message}</ErrorMessage>
      <RetryButton type="button" onClick={onRetry}>
        Retry
      </RetryButton>
    </BannerWrapper>
  );
}
