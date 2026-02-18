/**
 * T094 – EmptyState component tests
 * Covers: (a) renders message, (b) renders CTA label, (c) onCta fires on click
 */

import { fireEvent, render, screen } from '@testing-library/react';

import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders the message text', () => {
    render(
      <EmptyState message="No items yet" ctaLabel="Add Item" onCta={jest.fn()} />
    );
    expect(screen.getByText('No items yet')).toBeInTheDocument();
  });

  it('renders the CTA button with correct label', () => {
    render(
      <EmptyState message="No items yet" ctaLabel="Add Item" onCta={jest.fn()} />
    );
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('calls onCta callback when button is clicked', () => {
    const onCta = jest.fn();
    render(<EmptyState message="No items yet" ctaLabel="Add Item" onCta={onCta} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));
    expect(onCta).toHaveBeenCalledTimes(1);
  });
});
