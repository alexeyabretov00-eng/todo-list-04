/**
 * T087 – TodoListsViewContainer
 * Fetches todos for the selected list on mount / selectedListId change.
 * Also fetches sub-items when a todo is visible.
 */

import React, { useEffect } from 'react';
import { createSubItem, createTodo, fetchSubItems, fetchTodos } from '@slices';
import { useAppDispatch, useAppSelector } from '@store';

import { ErrorBanner } from '../../components/ErrorBanner';
import { TodoListView } from '../../components/TodoListView';
import { getTodoListsViewContainerProps } from '../../selectors/containers';
import { LoadingIndicator } from '../AppContainer/AppContainer.styled';

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

  if (loading) {
    return <LoadingIndicator role="status" aria-label="Loading todos…" />;
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
      existingTodoTitles={existingTodoTitles}
    />
  );
}
