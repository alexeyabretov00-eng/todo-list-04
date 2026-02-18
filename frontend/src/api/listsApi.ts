/**
 * T039 – Lists API service
 * Plain fetch functions for list CRUD + reorder, using apiClient.
 */

import { apiClient } from './apiClient';

export const listsApi = {
  getAll(): Promise<TodoList[]> {
    return apiClient.get<TodoList[]>('/lists');
  },

  getById(id: string): Promise<TodoList> {
    return apiClient.get<TodoList>(`/lists/${id}`);
  },

  create(name: string): Promise<TodoList> {
    return apiClient.post<TodoList>('/lists', { name });
  },

  update(id: string, fields: { name?: string; position?: number }): Promise<TodoList> {
    return apiClient.patch<TodoList>(`/lists/${id}`, fields);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/lists/${id}`);
  },

  reorder(orderedIds: string[]): Promise<{ ok: boolean }> {
    return apiClient.post<{ ok: boolean }>('/lists/reorder', { orderedIds });
  },
};
