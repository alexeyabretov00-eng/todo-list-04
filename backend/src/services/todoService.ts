/**
 * T034 – Todo service: Create + Read
 * Rename/delete (T063) and reorder (T064) are added later.
 */

import { randomUUID } from 'crypto';
import { getDb } from './db';
import { rowToTodoItem } from '../models/todoItem';
import type { TodoItem, TodoItemRow } from '../models/todoItem';

export function getTodosForList(listId: string): TodoItem[] | null {
  const db = getDb();
  // Verify list exists
  const list = db
    .prepare<[string], { id: string }>('SELECT id FROM todo_lists WHERE id = ?')
    .get(listId);
  if (!list) return null;

  const rows = db
    .prepare<[string], TodoItemRow>(
      'SELECT * FROM todo_items WHERE list_id = ? ORDER BY position ASC'
    )
    .all(listId);
  return rows.map(rowToTodoItem);
}

export function getTodoById(id: string): TodoItem | null {
  const db = getDb();
  const row = db
    .prepare<[string], TodoItemRow>('SELECT * FROM todo_items WHERE id = ?')
    .get(id);
  return row ? rowToTodoItem(row) : null;
}

export function createTodo(listId: string, title: string): TodoItem {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  const maxPositionRow = db
    .prepare<[string], { max: number | null }>(
      'SELECT MAX(position) as max FROM todo_items WHERE list_id = ?'
    )
    .get(listId);
  const position = (maxPositionRow?.max ?? -1) + 1;

  db.prepare(
    `INSERT INTO todo_items (id, list_id, title, completed, position, created_at, updated_at)
     VALUES (?, ?, ?, 0, ?, ?, ?)`
  ).run(id, listId, title, position, now, now);

  const row = db
    .prepare<[string], TodoItemRow>('SELECT * FROM todo_items WHERE id = ?')
    .get(id);
  return rowToTodoItem(row!);
}

export function updateTodo(
  id: string,
  fields: { title?: string; completed?: boolean; position?: number }
): TodoItem | null {
  const db = getDb();
  const existing = getTodoById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const title = fields.title ?? existing.title;
  const completed = fields.completed !== undefined ? (fields.completed ? 1 : 0) : (existing.completed ? 1 : 0);
  const position = fields.position ?? existing.position;

  db.prepare(
    `UPDATE todo_items SET title = ?, completed = ?, position = ?, updated_at = ? WHERE id = ?`
  ).run(title, completed, position, now, id);

  return getTodoById(id);
}

export function deleteTodo(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM todo_items WHERE id = ?').run(id);
  return result.changes > 0;
}

export function reorderTodos(listId: string, orderedIds: string[]): void {
  const db = getDb();
  const now = new Date().toISOString();
  const update = db.prepare(
    'UPDATE todo_items SET position = ?, updated_at = ? WHERE id = ? AND list_id = ?'
  );
  const reorder = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => {
      update.run(index, now, id, listId);
    });
  });
  reorder(orderedIds);
}
