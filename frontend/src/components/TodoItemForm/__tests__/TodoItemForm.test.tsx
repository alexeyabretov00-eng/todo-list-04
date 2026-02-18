/**
 * T031 – Component tests for TodoItemForm
 * Validates: render, submission, duplicate title warning (FR-015), 255-char limit (FR-019)
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TodoItemForm } from '../TodoItemForm';

describe('TodoItemForm', () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
  });

  it('renders title input and submit button', () => {
    render(<TodoItemForm onSubmit={onSubmit} existingTitles={[]} />);
    expect(screen.getByRole('textbox', { name: /todo title/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('calls onSubmit with title on valid submission', async () => {
    render(<TodoItemForm onSubmit={onSubmit} existingTitles={[]} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /todo title/i }),
      'Buy groceries'
    );
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('Buy groceries'));
  });

  it('shows inline error for empty submission', async () => {
    render(<TodoItemForm onSubmit={onSubmit} existingTitles={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows inline validation error for duplicate todo title (FR-015)', async () => {
    render(<TodoItemForm onSubmit={onSubmit} existingTitles={['Existing Todo']} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /todo title/i }),
      'Existing Todo'
    );
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/already exists|duplicate/i)
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows inline error when title exceeds 255 characters (FR-019)', async () => {
    render(<TodoItemForm onSubmit={onSubmit} existingTitles={[]} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /todo title/i }),
      'x'.repeat(256)
    );
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
