/**
 * T032 – Component tests for SubItemForm
 * Validates: render, submission, duplicate title warning (FR-016), 255-char limit (FR-019)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubItemForm } from '../SubItemForm';

describe('SubItemForm', () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  it('renders title input and submit button', () => {
    render(<SubItemForm onSubmit={onSubmit} existingTitles={[]} />);
    expect(screen.getByRole('textbox', { name: /subitem title/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add subitem/i })).toBeInTheDocument();
  });

  it('calls onSubmit with title on valid submission', async () => {
    render(<SubItemForm onSubmit={onSubmit} existingTitles={[]} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /subitem title/i }),
      'Buy apples'
    );
    fireEvent.click(screen.getByRole('button', { name: /add subitem/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('Buy apples'));
  });

  it('shows inline error for empty submission', async () => {
    render(<SubItemForm onSubmit={onSubmit} existingTitles={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /add subitem/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows inline validation error for duplicate subitem title (FR-016)', async () => {
    render(<SubItemForm onSubmit={onSubmit} existingTitles={['Existing Sub']} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /subitem title/i }),
      'Existing Sub'
    );
    fireEvent.click(screen.getByRole('button', { name: /add subitem/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/already exists|duplicate/i)
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows inline error when title exceeds 255 characters (FR-019)', async () => {
    render(<SubItemForm onSubmit={onSubmit} existingTitles={[]} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /subitem title/i }),
      'x'.repeat(256)
    );
    fireEvent.click(screen.getByRole('button', { name: /add subitem/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
