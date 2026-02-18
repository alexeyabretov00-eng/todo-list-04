/**
 * T045 – ListPanel component
 * Shows the list of todo lists + add-list CTA via ListForm (FR-020).
 */

import React from 'react';
import { EmptyState, ListForm } from '@components';
import { Layout, Menu, Typography } from 'antd';

const { Sider } = Layout;
const { Title } = Typography;

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
      ) : (
        <Menu
          mode="inline"
          selectedKeys={selectedListId ? [selectedListId] : []}
          items={lists.map((list) => ({ key: list.id, label: list.name }))}
          onClick={({ key }) => onSelectList(key)}
          style={{ border: 'none' }}
        />
      )}

      <div style={{ padding: '0 16px' }}>
        <ListForm onSubmit={onCreateList} existingNames={existingNames} />
      </div>
    </Sider>
  );
}
