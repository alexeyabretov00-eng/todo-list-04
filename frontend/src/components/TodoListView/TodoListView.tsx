/**
 * T046/T058/T070 – TodoListView component
 * Renders the todos for a selected list, with sub-items per todo.
 * Shows EmptyState (FR-020) when the list has no todos.
 * T058: forwards completion toggle callbacks to TodoItemRow.
 * T070: forwards rename/delete/reorder callbacks (optional) to enable Phase 5 wiring.
 */

import React from 'react';
import type { ReorderListItemData } from '@components';
import { EmptyState, ReorderList, SubItemForm, TodoItemForm, TodoItemRow } from '@components';
import { Card, Layout, Typography } from 'antd';

const { Title } = Typography;

interface TodoListViewProps {
  listName: string;
  todos: TodoItem[];
  subItemsByTodoId: Record<string, SubItem[]>;
  onAddTodo: (title: string) => void;
  onAddSubItem: (todoId: string, title: string) => void;
  onToggleTodo: (todoId: string, completed: boolean) => void;
  onToggleSubItem: (subItemId: string, completed: boolean) => void;
  existingTodoTitles: string[];
  onRenameTodo?: (todoId: string, newTitle: string) => void;
  onDeleteTodo?: (todoId: string) => void;
  onReorderTodos?: (orderedIds: string[]) => void;
  onRenameSubItem?: (subItemId: string, newTitle: string) => void;
  onDeleteSubItem?: (subItemId: string) => void;
  onReorderSubItems?: (todoId: string, orderedIds: string[]) => void;
}

export function TodoListView({
  listName,
  todos,
  subItemsByTodoId,
  onAddTodo,
  onAddSubItem,
  onToggleTodo,
  onToggleSubItem,
  existingTodoTitles,
  onRenameTodo,
  onDeleteTodo,
  onReorderTodos,
  onRenameSubItem,
  onDeleteSubItem,
  onReorderSubItems,
}: TodoListViewProps): React.ReactElement {
  const todoItems: ReorderListItemData[] = todos.map((todo) => {
    const subItems = subItemsByTodoId[todo.id] ?? [];
    const existingSubTitles = subItems.map((s) => s.title);

    return {
      id: todo.id,
      content: (
        <Card size="small" style={{ flex: 1 }} styles={{ body: { padding: '12px' } }}>
          <TodoItemRow
            todo={todo}
            subItems={subItems}
            onToggleTodo={onToggleTodo}
            onToggleSubItem={onToggleSubItem}
            onRenameTodo={onRenameTodo}
            onDeleteTodo={onDeleteTodo}
            onRenameSubItem={onRenameSubItem}
            onDeleteSubItem={onDeleteSubItem}
          />
          {onReorderSubItems ? (
            <ReorderList
              items={(subItemsByTodoId[todo.id] ?? []).map((sub) => ({
                id: sub.id,
                content: null,
              }))}
              onReorder={(orderedIds) => onReorderSubItems(todo.id, orderedIds)}
            />
          ) : null}
          <SubItemForm
            onSubmit={(title) => onAddSubItem(todo.id, title)}
            existingTitles={existingSubTitles}
          />
        </Card>
      ),
    };
  });

  return (
    <Layout.Content style={{ padding: '16px 24px', overflowY: 'auto' }}>
      <Title level={3} style={{ marginBottom: 16 }}>{listName}</Title>

      {todos.length === 0 ? (
        <EmptyState
          message="No tasks yet."
          ctaLabel="Add Task"
          onCta={() => {
            document.getElementById('todo-title-input')?.focus();
          }}
        />
      ) : onReorderTodos ? (
        <ReorderList items={todoItems} onReorder={onReorderTodos} />
      ) : (
        <div>
          {todoItems.map((item) => (
            <div key={item.id} style={{ marginBottom: 8 }}>
              {item.content}
            </div>
          ))}
        </div>
      )}

      <TodoItemForm onSubmit={onAddTodo} existingTitles={existingTodoTitles} />
    </Layout.Content>
  );
}
