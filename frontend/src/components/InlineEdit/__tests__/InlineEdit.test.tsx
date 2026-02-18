/**
 * T062 – Component tests for InlineEdit
 * Covers: (a) renders display text, (b) switches to edit mode on edit trigger,
 * (c) confirms edit on submit, (d) cancels edit on Escape,
 * (e) delete fires immediately without confirmation modal (FR-018).
 */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InlineEdit } from '../InlineEdit';

describe('InlineEdit', () => {
  it('renders the current value as display text', () => {
    render(
      <InlineEdit
        value="Buy milk"
        onRename={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('switches to an input when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <InlineEdit
        value="Buy milk"
        onRename={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Buy milk');
  });

  it('calls onRename with new value when form is submitted', async () => {
    const onRename = jest.fn();
    const user = userEvent.setup();
    render(
      <InlineEdit
        value="Buy milk"
        onRename={onRename}
        onDelete={jest.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: /edit/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Buy oat milk');
    await user.keyboard('{Enter}');
    expect(onRename).toHaveBeenCalledWith('Buy oat milk');
  });

  it('cancels edit and restores original value on Escape', async () => {
    const onRename = jest.fn();
    const user = userEvent.setup();
    render(
      <InlineEdit
        value="Buy milk"
        onRename={onRename}
        onDelete={jest.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: /edit/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Something else');
    await user.keyboard('{Escape}');
    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('does not show a confirmation dialog before calling onDelete — clicking delete fires immediately (FR-018)', () => {
    const onDelete = jest.fn();
    render(
      <InlineEdit
        value="Buy milk"
        onRename={jest.fn()}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    // onDelete fires immediately — no confirmation modal, popover, or second click required
    expect(onDelete).toHaveBeenCalledTimes(1);
    // No confirmation-related text should be in the document
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/confirm/i)).not.toBeInTheDocument();
  });

  it('does not call onRename when submitted with an empty value', async () => {
    const onRename = jest.fn();
    const user = userEvent.setup();
    render(
      <InlineEdit
        value="Buy milk"
        onRename={onRename}
        onDelete={jest.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: /edit/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.keyboard('{Enter}');
    expect(onRename).not.toHaveBeenCalled();
  });
});
