/**
 * T045 – ListPanel component
 * Shows the list of todo lists + add-list CTA via ListForm (FR-020).
 */

import React from 'react';

import { EmptyState } from '../EmptyState';
import { ListForm } from '../ListForm';

import { ListItem, PanelTitle, PanelWrapper } from './ListPanel.styled';

interface ListPanelProps {
  lists: TodoList[];
  selectedListId: string | null;
  onSelectList: (id: string) => void;
  onCreateList: (name: string) => void;
}

export function ListPanel({
  lists,
  selectedListId,
  onSelectList,
  onCreateList,
}: ListPanelProps): React.ReactElement {
  const existingNames = lists.map((l) => l.name);

  return (
    <PanelWrapper>
      <PanelTitle>Lists</PanelTitle>

      {lists.length === 0 ? (
        <EmptyState
          message="No lists yet."
          ctaLabel="Add List"
          onCta={() => {
            // Focus the list form — the form is always shown below
            document.getElementById('list-name-input')?.focus();
          }}
        />
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {lists.map((list) => (
            <li key={list.id}>
              <ListItem
                $active={list.id === selectedListId}
                onClick={() => onSelectList(list.id)}
              >
                {list.name}
              </ListItem>
            </li>
          ))}
        </ul>
      )}

      <ListForm onSubmit={onCreateList} existingNames={existingNames} />
    </PanelWrapper>
  );
}
