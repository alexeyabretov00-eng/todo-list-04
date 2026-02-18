/**
 * T068 – InlineEdit component
 * Displays a text value with edit (pencil) and delete (trash) action buttons.
 * Clicking edit switches to an input; Enter confirms, Escape cancels.
 * Delete fires immediately without a confirmation step — mirrors FR-018.
 */

import React, { useRef, useState } from 'react';
import { Button, Space } from 'antd';

import { DisplayText, EditInput, InlineEditContainer } from './InlineEdit.styled';

interface InlineEditProps {
  /** The current value to display and edit. */
  value: string;
  /** Called with the new value when the user confirms an edit. Not called if the value is empty or unchanged. */
  onRename: (newValue: string) => void;
  /** Called immediately when the delete button is clicked — no confirmation step (FR-018). */
  onDelete: () => void;
  /** Optional placeholder text shown in the edit input. */
  placeholder?: string;
}

export function InlineEdit({
  value,
  onRename,
  onDelete,
  placeholder,
}: InlineEditProps): React.ReactElement {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
    // Focus on next tick after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const confirmEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onRename(trimmed);
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      confirmEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <InlineEditContainer>
      {editing ? (
        <EditInput
          ref={inputRef}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={confirmEdit}
          aria-label="Edit value"
        />
      ) : (
        <DisplayText>{value}</DisplayText>
      )}
      <Space size={4}>
        {!editing && (
          <Button
            type="text"
            size="small"
            onClick={startEdit}
            aria-label="Edit"
          >
            ✎
          </Button>
        )}
        <Button
          type="text"
          size="small"
          danger
          onClick={onDelete}
          aria-label="Delete"
        >
          ✕
        </Button>
      </Space>
    </InlineEditContainer>
  );
}
