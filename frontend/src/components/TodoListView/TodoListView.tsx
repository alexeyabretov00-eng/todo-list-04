/**
 * T046 – TodoListView component
 * Renders the todos for a selected list, with sub-items per todo.
 * Shows EmptyState (FR-020) when the list has no todos.
 */

import React from 'react';

import { EmptyState } from '../EmptyState';
import { SubItemForm } from '../SubItemForm';
import { TodoItemForm } from '../TodoItemForm';

import {
  TodoItemContainer,
  TodoTitle,
  ViewTitle,
  ViewWrapper,
} from './TodoListView.styled';

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
    <ViewWrapper>
      <ViewTitle>{listName}</ViewTitle>

      {todos.length === 0 ? (
        <EmptyState
          message="No tasks yet."
          ctaLabel="Add Task"
          onCta={() => {
            document.getElementById('todo-title-input')?.focus();
          }}
        />
      ) : (
        todos.map((todo) => {
          const subItems = subItemsByTodoId[todo.id] ?? [];
          const existingSubTitles = subItems.map((s) => s.title);

          return (
            <TodoItemContainer key={todo.id}>
              <TodoTitle $completed={todo.completed}>{todo.title}</TodoTitle>

              {/* Sub-items list */}
              {subItems.length > 0 && (
                <ul style={{ listStyle: 'none', padding: '4px 0 4px 16px', margin: 0 }}>
                  {subItems.map((sub) => (
                    <li key={sub.id}>
                      <TodoTitle $completed={sub.completed} style={{ fontSize: '13px' }}>
                        {sub.title}
                      </TodoTitle>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add sub-item */}
              <SubItemForm
                onSubmit={(title) => onAddSubItem(todo.id, title)}
                existingTitles={existingSubTitles}
              />
            </TodoItemContainer>
          );
        })
      )}

      <TodoItemForm onSubmit={onAddTodo} existingTitles={existingTodoTitles} />
    </ViewWrapper>
  );
}
