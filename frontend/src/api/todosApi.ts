/**
 * T040 – Todos API service
 * Plain fetch functions for todo CRUD + reorder + completion, using apiClient.
 */

import { apiClient } from './apiClient';

export const todosApi = {
  getForList(listId: string): Promise<TodoItem[]> {
    return apiClient.get<TodoItem[]>(`/lists/${listId}/todos`);
  },

  getById(todoId: string): Promise<TodoItem> {
    return apiClient.get<TodoItem>(`/todos/${todoId}`);
  },

  create(listId: string, title: string): Promise<TodoItem> {
    return apiClient.post<TodoItem>(`/lists/${listId}/todos`, { title });
  },

  update(todoId: string, fields: { title?: string; completed?: boolean; position?: number }): Promise<TodoItem> {
    return apiClient.patch<TodoItem>(`/todos/${todoId}`, fields);
  },

  remove(todoId: string): Promise<void> {
    return apiClient.delete<void>(`/todos/${todoId}`);
  },

  reorder(listId: string, orderedIds: string[]): Promise<{ ok: boolean }> {
    return apiClient.post<{ ok: boolean }>(`/lists/${listId}/todos/reorder`, { orderedIds });
  },

  toggleComplete(todoId: string, completed: boolean): Promise<TodoItem> {
    return apiClient.patch<TodoItem>(`/todos/${todoId}`, { completed });
  },
};
