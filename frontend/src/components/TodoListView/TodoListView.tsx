/**
 * T046 – TodoListView component
 * Renders the todos for a selected list, with sub-items per todo.
 * Shows EmptyState (FR-020) when the list has no todos.
 */

import React from 'react';
import { EmptyState, SubItemForm, TodoItemForm } from '@components';
import { Card, Layout, List, Typography } from 'antd';

const { Title, Text } = Typography;

interface TodoListViewProps {
  listName: string;
  todos: TodoItem[];
  subItemsByTodoId: Record<string, SubItem[]>;
  onAddTodo: (title: string) => void;
  onAddSubItem: (todoId: string, title: string) => void;
  existingTodoTitles: string[];
}

export function TodoListView({
  listName,
  todos,
  subItemsByTodoId,
  onAddTodo,
  onAddSubItem,
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
                  <Text delete={todo.completed} style={{ fontSize: 14 }}>
                    {todo.title}
                  </Text>

                  {subItems.length > 0 && (
                    <List
                      size="small"
                      dataSource={subItems}
                      renderItem={(sub) => (
                        <List.Item style={{ padding: '2px 0 2px 16px' }}>
                          <Text delete={sub.completed} style={{ fontSize: 13 }}>
                            {sub.title}
                          </Text>
                        </List.Item>
                      )}
                      style={{ marginTop: 4 }}
                    />
                  )}

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
