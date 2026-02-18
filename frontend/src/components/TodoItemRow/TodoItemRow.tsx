/**
 * T056 – TodoItemRow component
 * Renders a single todo item with a completion checkbox and its subitems.
 * Completion toggles call onToggleTodo / onToggleSubItem, supporting
 * FR-005, FR-006, FR-017, and FR-022 via the backend completion rules.
 */

import React from 'react';
import { SubItemRow } from '@components';
import { Checkbox, Typography } from 'antd';

import { RowContainer, SubItemList } from './TodoItemRow.styled';

const { Text } = Typography;

interface TodoItemRowProps {
  todo: TodoItem;
  subItems: SubItem[];
  onToggleTodo: (todoId: string, completed: boolean) => void;
  onToggleSubItem: (subItemId: string, completed: boolean) => void;
}

export function TodoItemRow({
  todo,
  subItems,
  onToggleTodo,
  onToggleSubItem,
}: TodoItemRowProps): React.ReactElement {
  return (
    <div>
      <RowContainer>
        <Checkbox
          checked={todo.completed}
          onChange={(e) => onToggleTodo(todo.id, e.target.checked)}
          aria-label={todo.title}
        />
        <Text delete={todo.completed}>{todo.title}</Text>
      </RowContainer>

      {subItems.length > 0 && (
        <SubItemList>
          {subItems.map((sub) => (
            <SubItemRow
              key={sub.id}
              subItem={sub}
              onToggle={onToggleSubItem}
            />
          ))}
        </SubItemList>
      )}
    </div>
  );
}
