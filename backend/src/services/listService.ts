/**
 * T033 – List service: Create + Read
 * Rename/delete (T063) and reorder (T064) are added later.
 */

import { randomUUID } from 'crypto';
import { getDb } from './db';
import { rowToTodoList } from '../models/todoList';
import type { TodoList, TodoListRow } from '../models/todoList';

export function getAllLists(): TodoList[] {
  const db = getDb();
  const rows = db
    .prepare<[], TodoListRow>(
      'SELECT * FROM todo_lists ORDER BY position ASC'
    )
    .all();
  return rows.map(rowToTodoList);
}

export function getListById(id: string): TodoList | null {
  const db = getDb();
  const row = db
    .prepare<[string], TodoListRow>('SELECT * FROM todo_lists WHERE id = ?')
    .get(id);
  return row ? rowToTodoList(row) : null;
}

export function createList(name: string): TodoList {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  const maxPositionRow = db
    .prepare<[], { max: number | null }>('SELECT MAX(position) as max FROM todo_lists')
    .get();
  const position = (maxPositionRow?.max ?? -1) + 1;

  db.prepare(
    `INSERT INTO todo_lists (id, name, position, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, name, position, now, now);

  const row = db
    .prepare<[string], TodoListRow>('SELECT * FROM todo_lists WHERE id = ?')
    .get(id);
  return rowToTodoList(row!);
}

export function updateList(id: string, fields: { name?: string; position?: number }): TodoList | null {
  const db = getDb();
  const existing = getListById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const name = fields.name ?? existing.name;
  const position = fields.position ?? existing.position;

  db.prepare(
    `UPDATE todo_lists SET name = ?, position = ?, updated_at = ? WHERE id = ?`
  ).run(name, position, now, id);

  return getListById(id);
}

export function deleteList(id: string): boolean {
  const db = getDb();
  const result = db
    .prepare('DELETE FROM todo_lists WHERE id = ?')
    .run(id);
  return result.changes > 0;
}

export function reorderLists(orderedIds: string[]): void {
  const db = getDb();
  const now = new Date().toISOString();
  const update = db.prepare(
    'UPDATE todo_lists SET position = ?, updated_at = ? WHERE id = ?'
  );
  const reorder = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => {
      update.run(index, now, id);
    });
  });
  reorder(orderedIds);
}
