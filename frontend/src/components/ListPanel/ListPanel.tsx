/**
 * T045/T070 – ListPanel component
 * Shows the list of todo lists + add-list CTA via ListForm (FR-020).
 * T070: optional onRenameList / onDeleteList / onReorderLists callbacks for Phase 5 wiring.
 */

import React from 'react';
import { EmptyState, InlineEdit, ListForm, ReorderList } from '@components';
import type { ReorderListItemData } from '@components';
import { Layout, Typography } from 'antd';

const { Sider } = Layout;
const { Title } = Typography;

interface ListPanelProps {
  lists: TodoList[];
  selectedListId: string | null;
  onSelectList: (id: string) => void;
  onCreateList: (name: string) => void;
  onRenameList?: (id: string, name: string) => void;
  onDeleteList?: (id: string) => void;
  onReorderLists?: (orderedIds: string[]) => void;
}

export function ListPanel({
  lists,
  selectedListId,
  onSelectList,
  onCreateList,
  onRenameList,
  onDeleteList,
  onReorderLists,
}: ListPanelProps): React.ReactElement {
  const existingNames = lists.map((l) => l.name);

  const listItems: ReorderListItemData[] = lists.map((list) => ({
    id: list.id,
    content: (
      <div
        role="button"
        tabIndex={0}
        style={{
          flex: 1,
          padding: '4px 0',
          fontWeight: selectedListId === list.id ? 600 : 400,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={() => onSelectList(list.id)}
        onKeyDown={(e) => e.key === 'Enter' && onSelectList(list.id)}
      >
        {onRenameList && onDeleteList ? (
          <InlineEdit
            value={list.name}
            onRename={(newName) => onRenameList(list.id, newName)}
            onDelete={() => onDeleteList(list.id)}
          />
        ) : (
          <span style={{ flex: 1 }}>{list.name}</span>
        )}
      </div>
    ),
  }));

  return (
    <Sider width={260} theme="light" style={{ borderRight: '1px solid #f0f0f0', padding: '16px 0', overflowY: 'auto' }}>
      <Title level={5} style={{ padding: '0 16px', marginBottom: 8 }}>Lists</Title>

      {lists.length === 0 ? (
        <EmptyState
          message="No lists yet."
          ctaLabel="Add List"
          onCta={() => {
            document.getElementById('list-name-input')?.focus();
          }}
        />
      ) : onReorderLists ? (
        <div style={{ padding: '0 8px' }}>
          <ReorderList items={listItems} onReorder={onReorderLists} />
        </div>
      ) : (
        <div style={{ padding: '0 8px' }}>
          {listItems.map((item) => (
            <div key={item.id}>{item.content}</div>
          ))}
        </div>
      )}

      <div style={{ padding: '0 16px' }}>
        <ListForm onSubmit={onCreateList} existingNames={existingNames} />
      </div>
    </Sider>
  );
}
