/**
 * T030 – Component tests for ListForm
 * Validates: render, submission, duplicate name inline validation (FR-014), 255-char limit (FR-019)
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ListForm } from '../ListForm';

describe('ListForm', () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  it('renders name input and submit button', () => {
    render(<ListForm onSubmit={onSubmit} existingNames={[]} />);
    expect(screen.getByRole('textbox', { name: /list name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add list/i })).toBeInTheDocument();
  });

  it('calls onSubmit with name on valid submission', async () => {
    render(<ListForm onSubmit={onSubmit} existingNames={[]} />);
    await userEvent.type(screen.getByRole('textbox', { name: /list name/i }), 'My New List');
    fireEvent.click(screen.getByRole('button', { name: /add list/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('My New List'));
  });

  it('shows inline error for empty submission', async () => {
    render(<ListForm onSubmit={onSubmit} existingNames={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /add list/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows inline validation error for duplicate list name (FR-014)', async () => {
    render(<ListForm onSubmit={onSubmit} existingNames={['Existing List']} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /list name/i }),
      'Existing List'
    );
    fireEvent.click(screen.getByRole('button', { name: /add list/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/already exists|duplicate/i)
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows inline error when name exceeds 255 characters (FR-019)', async () => {
    render(<ListForm onSubmit={onSubmit} existingNames={[]} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /list name/i }),
      'x'.repeat(256)
    );
    fireEvent.click(screen.getByRole('button', { name: /add list/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
