/**
 * T046/T058 – TodoListView component
 * Renders the todos for a selected list, with sub-items per todo.
 * Shows EmptyState (FR-020) when the list has no todos.
 * T058: forwards completion toggle callbacks to TodoItemRow.
 */

import React from 'react';
import { EmptyState, SubItemForm, TodoItemForm, TodoItemRow } from '@components';
import { Card, Layout, List, Typography } from 'antd';

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
}: TodoListViewProps): React.ReactElement {
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
      ) : (
        <List
          dataSource={todos}
          renderItem={(todo) => {
            const subItems = subItemsByTodoId[todo.id] ?? [];
            const existingSubTitles = subItems.map((s) => s.title);

            return (
              <List.Item style={{ display: 'block', padding: 0, marginBottom: 8 }}>
                <Card size="small" bodyStyle={{ padding: '12px' }}>
                  <TodoItemRow
                    todo={todo}
                    subItems={subItems}
                    onToggleTodo={onToggleTodo}
                    onToggleSubItem={onToggleSubItem}
                  />

                  <SubItemForm
                    onSubmit={(title) => onAddSubItem(todo.id, title)}
                    existingTitles={existingSubTitles}
                  />
                </Card>
              </List.Item>
            );
          }}
        />
      )}

      <TodoItemForm onSubmit={onAddTodo} existingTitles={existingTodoTitles} />
    </Layout.Content>
  );
}
