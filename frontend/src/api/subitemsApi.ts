/**
 * T041 – SubItems API service
 * Plain fetch functions for subitem CRUD + reorder + completion, using apiClient.
 */

import { apiClient } from './apiClient';

export const subitemsApi = {
  getForTodo(todoId: string): Promise<SubItem[]> {
    return apiClient.get<SubItem[]>(`/todos/${todoId}/subitems`);
  },

  getById(subItemId: string): Promise<SubItem> {
    return apiClient.get<SubItem>(`/subitems/${subItemId}`);
  },

  create(todoId: string, title: string): Promise<SubItem> {
    return apiClient.post<SubItem>(`/todos/${todoId}/subitems`, { title });
  },

  update(subItemId: string, fields: { title?: string; completed?: boolean; position?: number }): Promise<SubItem> {
    return apiClient.patch<SubItem>(`/subitems/${subItemId}`, fields);
  },

  remove(subItemId: string): Promise<void> {
    return apiClient.delete<void>(`/subitems/${subItemId}`);
  },

  reorder(todoId: string, orderedIds: string[]): Promise<{ ok: boolean }> {
    return apiClient.post<{ ok: boolean }>(`/todos/${todoId}/subitems/reorder`, { orderedIds });
  },

  toggleComplete(subItemId: string, completed: boolean): Promise<SubItem> {
    return apiClient.patch<SubItem>(`/subitems/${subItemId}`, { completed });
  },
};
