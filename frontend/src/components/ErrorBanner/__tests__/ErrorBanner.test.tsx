/**
 * T088 – ErrorBanner component tests
 * Covers: (a) renders with message and retry button, (b) onRetry fires on click
 */

import { fireEvent, render, screen } from '@testing-library/react';

import { ErrorBanner } from '../ErrorBanner';

describe('ErrorBanner', () => {
  it('renders with the error message and a retry button', () => {
    render(<ErrorBanner message="Failed to load lists" onRetry={jest.fn()} />);
    expect(screen.getByText('Failed to load lists')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls onRetry callback when retry button is clicked', () => {
    const onRetry = jest.fn();
    render(<ErrorBanner message="Something went wrong" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
