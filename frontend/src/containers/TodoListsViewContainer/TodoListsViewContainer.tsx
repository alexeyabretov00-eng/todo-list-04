/**
 * T087/T058 – TodoListsViewContainer
 * Fetches todos for the selected list on mount / selectedListId change.
 * Also fetches sub-items when a todo is visible.
 * T058: dispatches completion thunks for todos and subitems.
 */

import React, { useEffect } from 'react';
import { ErrorBanner, TodoListView } from '@components';
import { getTodoListsViewContainerProps } from '@selectors';
import {
  createSubItem,
  createTodo,
  fetchSubItems,
  fetchTodos,
  toggleSubItemComplete,
  toggleTodoComplete,
} from '@slices';
import { useAppDispatch, useAppSelector } from '@store';
import { Spin } from 'antd';

interface TodoListsViewContainerProps {
  listName: string;
}

export function TodoListsViewContainer({
  listName,
}: TodoListsViewContainerProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const { todos, subItemsByTodoId, selectedListId, loading, error } =
    useAppSelector(getTodoListsViewContainerProps);

  // Fetch todos whenever the selected list changes
  useEffect(() => {
    if (selectedListId) {
      void dispatch(fetchTodos(selectedListId));
    }
  }, [dispatch, selectedListId]);

  // Fetch sub-items for every visible todo
  useEffect(() => {
    for (const todo of todos) {
      void dispatch(fetchSubItems(todo.id));
    }
  }, [dispatch, todos]);

  const handleAddTodo = (title: string) => {
    if (selectedListId) {
      void dispatch(createTodo({ listId: selectedListId, title }));
    }
  };

  const handleAddSubItem = (todoId: string, title: string) => {
    void dispatch(createSubItem({ todoId, title }));
  };

  const handleToggleTodo = (todoId: string, completed: boolean) => {
    void dispatch(toggleTodoComplete({ todoId, completed }));
  };

  const handleToggleSubItem = (subItemId: string, completed: boolean) => {
    void dispatch(toggleSubItemComplete({ subItemId, completed }));
  };

  if (loading) {
    return (
      <span role="status" aria-label="Loading todos…" style={{ display: 'block', margin: '20vh auto', textAlign: 'center' }}>
        <Spin size="large" />
      </span>
    );
  }

  if (error) {
    return (
      <ErrorBanner
        message={error}
        onRetry={() => selectedListId && void dispatch(fetchTodos(selectedListId))}
      />
    );
  }

  const existingTodoTitles = todos.map((t) => t.title);

  return (
    <TodoListView
      listName={listName}
      todos={todos}
      subItemsByTodoId={subItemsByTodoId}
      onAddTodo={handleAddTodo}
      onAddSubItem={handleAddSubItem}
      onToggleTodo={handleToggleTodo}
      onToggleSubItem={handleToggleSubItem}
      existingTodoTitles={existingTodoTitles}
    />
  );
}
