/**
 * T094 – EmptyState component (FR-020)
 * Reusable placeholder used wherever a list or collection is empty.
 */

import React from 'react';

import { CtaButton, EmptyMessage, EmptyStateWrapper } from './EmptyState.styled';

interface EmptyStateProps {
  message: string;
  ctaLabel: string;
  onCta: () => void;
}

export function EmptyState({ message, ctaLabel, onCta }: EmptyStateProps): React.ReactElement {
  return (
    <EmptyStateWrapper>
      <EmptyMessage>{message}</EmptyMessage>
      <CtaButton type="button" onClick={onCta}>
        {ctaLabel}
      </CtaButton>
    </EmptyStateWrapper>
  );
}
