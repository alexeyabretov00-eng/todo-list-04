/**
 * T052 – Completion rules service
 *
 * Implements four completion rules:
 *   FR-005: Marking a todo complete cascades completion to ALL subitems.
 *   FR-006: Marking any subitem incomplete marks the parent todo incomplete.
 *   FR-017: When all subitems are complete, the parent todo auto-completes.
 *   FR-022: Marking a todo incomplete does NOT cascade to subitems (each retains its state).
 */

import { getDb } from './db';
import { getTodoById, updateTodo } from './todoService';
import { getSubItemById, getSubItemsForTodo, updateSubItem } from './subItemService';
import type { TodoItem } from '../models/todoItem';
import type { SubItem } from '../models/subItem';

/**
 * FR-005: Mark a todo as complete and cascade completion to all its subitems.
 */
export function completeTodo(todoId: string): TodoItem | null {
  const db = getDb();

  const todo = getTodoById(todoId);
  if (!todo) return null;

  // Cascade to all subitems first
  const markSubitemsComplete = db.prepare(
    `UPDATE sub_items SET completed = 1, updated_at = ? WHERE todo_id = ?`
  );
  const now = new Date().toISOString();
  markSubitemsComplete.run(now, todoId);

  // Mark the todo itself complete
  return updateTodo(todoId, { completed: true });
}

/**
 * FR-022: Mark a todo as incomplete WITHOUT cascading to subitems.
 * Each subitem retains its current completion state.
 */
export function incompleteTodo(todoId: string): TodoItem | null {
  const todo = getTodoById(todoId);
  if (!todo) return null;

  return updateTodo(todoId, { completed: false });
}

/**
 * FR-017 / FR-006: Mark a subitem as complete.
 * If all subitems for the parent todo are now complete, auto-completes the parent (FR-017).
 */
export function completeSubItem(subItemId: string): SubItem | null {
  const subItem = getSubItemById(subItemId);
  if (!subItem) return null;

  const updated = updateSubItem(subItemId, { completed: true });
  if (!updated) return null;

  // FR-017: check if all sibling subitems are now complete → auto-complete parent
  const siblings = getSubItemsForTodo(subItem.todoId);
  if (siblings && siblings.every((s) => s.id === subItemId || s.completed)) {
    updateTodo(subItem.todoId, { completed: true });
  }

  return updated;
}

/**
 * FR-006: Mark a subitem as incomplete.
 * Marks the parent todo as incomplete when any subitem is incomplete.
 */
export function incompleteSubItem(subItemId: string): SubItem | null {
  const subItem = getSubItemById(subItemId);
  if (!subItem) return null;

  const updated = updateSubItem(subItemId, { completed: false });
  if (!updated) return null;

  // FR-006: parent todo must become incomplete
  updateTodo(subItem.todoId, { completed: false });

  return updated;
}
