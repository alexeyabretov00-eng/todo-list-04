/**
 * T035 – SubItem service: Create + Read
 * Rename/delete (T063) and reorder (T064) are added later.
 */

import { randomUUID } from 'crypto';
import { getDb } from './db';
import { rowToSubItem } from '../models/subItem';
import type { SubItem, SubItemRow } from '../models/subItem';

export function getSubItemsForTodo(todoId: string): SubItem[] | null {
  const db = getDb();
  // Verify todo exists
  const todo = db
    .prepare<[string], { id: string }>('SELECT id FROM todo_items WHERE id = ?')
    .get(todoId);
  if (!todo) return null;

  const rows = db
    .prepare<[string], SubItemRow>(
      'SELECT * FROM sub_items WHERE todo_id = ? ORDER BY position ASC'
    )
    .all(todoId);
  return rows.map(rowToSubItem);
}

export function getSubItemById(id: string): SubItem | null {
  const db = getDb();
  const row = db
    .prepare<[string], SubItemRow>('SELECT * FROM sub_items WHERE id = ?')
    .get(id);
  return row ? rowToSubItem(row) : null;
}

export function createSubItem(todoId: string, title: string): SubItem {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  const maxPositionRow = db
    .prepare<[string], { max: number | null }>(
      'SELECT MAX(position) as max FROM sub_items WHERE todo_id = ?'
    )
    .get(todoId);
  const position = (maxPositionRow?.max ?? -1) + 1;

  db.prepare(
    `INSERT INTO sub_items (id, todo_id, title, completed, position, created_at, updated_at)
     VALUES (?, ?, ?, 0, ?, ?, ?)`
  ).run(id, todoId, title, position, now, now);

  const row = db
    .prepare<[string], SubItemRow>('SELECT * FROM sub_items WHERE id = ?')
    .get(id);
  return rowToSubItem(row!);
}

export function updateSubItem(
  id: string,
  fields: { title?: string; completed?: boolean; position?: number }
): SubItem | null {
  const db = getDb();
  const existing = getSubItemById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const title = fields.title ?? existing.title;
  const completed = fields.completed !== undefined ? (fields.completed ? 1 : 0) : (existing.completed ? 1 : 0);
  const position = fields.position ?? existing.position;

  db.prepare(
    `UPDATE sub_items SET title = ?, completed = ?, position = ?, updated_at = ? WHERE id = ?`
  ).run(title, completed, position, now, id);

  return getSubItemById(id);
}

export function deleteSubItem(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM sub_items WHERE id = ?').run(id);
  return result.changes > 0;
}

export function reorderSubItems(todoId: string, orderedIds: string[]): void {
  const db = getDb();
  const now = new Date().toISOString();
  const update = db.prepare(
    'UPDATE sub_items SET position = ?, updated_at = ? WHERE id = ? AND todo_id = ?'
  );
  const reorder = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => {
      update.run(index, now, id, todoId);
    });
  });
  reorder(orderedIds);
}
