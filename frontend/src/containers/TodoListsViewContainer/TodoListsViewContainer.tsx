/**
 * T087/T058/T070 – TodoListsViewContainer
 * Fetches todos for the selected list on mount / selectedListId change.
 * Also fetches sub-items when a todo is visible.
 * T058: dispatches completion thunks for todos and subitems.
 * T070: dispatches rename/delete/reorder thunks for todos and subitems.
 */

import React, { useEffect } from 'react';
import { ErrorBanner, TodoListView } from '@components';
import { getTodoListsViewContainerProps } from '@selectors';
import {
  createSubItem,
  createTodo,
  deleteSubItem,
  deleteTodo,
  fetchSubItems,
  fetchTodos,
  renameSubItem,
  renameTodo,
  reorderSubItems,
  reorderTodos,
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

  const handleRenameTodo = (todoId: string, newTitle: string) => {
    void dispatch(renameTodo({ todoId, title: newTitle }));
  };

  const handleDeleteTodo = (todoId: string) => {
    if (selectedListId) {
      void dispatch(deleteTodo({ todoId, listId: selectedListId }));
    }
  };

  const handleReorderTodos = (orderedIds: string[]) => {
    if (selectedListId) {
      void dispatch(reorderTodos({ listId: selectedListId, orderedIds }));
    }
  };

  const handleRenameSubItem = (subItemId: string, newTitle: string) => {
    void dispatch(renameSubItem({ subItemId, title: newTitle }));
  };

  const handleDeleteSubItem = (subItemId: string, todoId: string) => {
    void dispatch(deleteSubItem({ subItemId, todoId }));
  };

  const handleReorderSubItems = (todoId: string, orderedIds: string[]) => {
    void dispatch(reorderSubItems({ todoId, orderedIds }));
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
      onRenameTodo={handleRenameTodo}
      onDeleteTodo={handleDeleteTodo}
      onReorderTodos={handleReorderTodos}
      onRenameSubItem={handleRenameSubItem}
      onDeleteSubItem={(subItemId) => {
        const todo = todos.find((t) =>
          (subItemsByTodoId[t.id] ?? []).some((s) => s.id === subItemId)
        );
        if (todo) handleDeleteSubItem(subItemId, todo.id);
      }}
      onReorderSubItems={handleReorderSubItems}
    />
  );
}
