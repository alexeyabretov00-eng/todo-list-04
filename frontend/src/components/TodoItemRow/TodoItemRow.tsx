/**
 * T056/T070 – TodoItemRow component
 * Renders a single todo item with a completion checkbox and its subitems.
 * Completion toggles call onToggleTodo / onToggleSubItem, supporting
 * FR-005, FR-006, FR-017, and FR-022 via the backend completion rules.
 * T070: optional onRenameTodo / onDeleteTodo / onRenameSubItem / onDeleteSubItem
 * for Phase 5 edit/delete wiring.
 */

import React from 'react';
import { InlineEdit, SubItemRow } from '@components';
import { Checkbox, Typography } from 'antd';

import { RowContainer, SubItemList } from './TodoItemRow.styled';

const { Text } = Typography;

interface TodoItemRowProps {
  todo: TodoItem;
  subItems: SubItem[];
  onToggleTodo: (todoId: string, completed: boolean) => void;
  onToggleSubItem: (subItemId: string, completed: boolean) => void;
  onRenameTodo?: (todoId: string, newTitle: string) => void;
  onDeleteTodo?: (todoId: string) => void;
  onRenameSubItem?: (subItemId: string, newTitle: string) => void;
  onDeleteSubItem?: (subItemId: string) => void;
}

export function TodoItemRow({
  todo,
  subItems,
  onToggleTodo,
  onToggleSubItem,
  onRenameTodo,
  onDeleteTodo,
  onRenameSubItem,
  onDeleteSubItem,
}: TodoItemRowProps): React.ReactElement {
  return (
    <div>
      <RowContainer>
        <Checkbox
          checked={todo.completed}
          onChange={(e) => onToggleTodo(todo.id, e.target.checked)}
          aria-label={todo.title}
        />
        {onRenameTodo && onDeleteTodo ? (
          <InlineEdit
            value={todo.title}
            onRename={(newTitle) => onRenameTodo(todo.id, newTitle)}
            onDelete={() => onDeleteTodo(todo.id)}
          />
        ) : (
          <Text delete={todo.completed}>{todo.title}</Text>
        )}
      </RowContainer>

      {subItems.length > 0 && (
        <SubItemList>
          {subItems.map((sub) => (
            <SubItemRow
              key={sub.id}
              subItem={sub}
              onToggle={onToggleSubItem}
              onRename={onRenameSubItem}
              onDelete={onDeleteSubItem}
            />
          ))}
        </SubItemList>
      )}
    </div>
  );
}
