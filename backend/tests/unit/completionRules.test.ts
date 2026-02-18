/**
 * T050 – Service tests for completion rules
 * Validates all four completion rules:
 *   FR-005: marking todo complete cascades to all subitems
 *   FR-006: any subitem incomplete marks parent incomplete
 *   FR-017: all subitems complete → auto-completes parent
 *   FR-022: marking todo incomplete does NOT cascade to subitems
 */

import type { Database } from 'better-sqlite3';
import { closeDb, getDb } from '../../src/services/db';
import { createList } from '../../src/services/listService';
import { createTodo, getTodoById } from '../../src/services/todoService';
import { createSubItem, getSubItemById } from '../../src/services/subItemService';
import {
  completeTodo,
  incompleteTodo,
  completeSubItem,
  incompleteSubItem,
} from '../../src/services/completionRules';

let db: Database;
let listId: string;
let todoId: string;
let subItem1Id: string;
let subItem2Id: string;

beforeAll(() => {
  process.env['DB_PATH'] = ':memory:';
  db = getDb();
});

afterAll(() => {
  closeDb();
  delete process.env['DB_PATH'];
});

beforeEach(() => {
  db.exec(`
    DELETE FROM sub_items;
    DELETE FROM todo_items;
    DELETE FROM todo_lists;
  `);
  const list = createList('Test List');
  listId = list.id;
  const todo = createTodo(listId, 'Test Todo');
  todoId = todo.id;
  const sub1 = createSubItem(todoId, 'Sub 1');
  const sub2 = createSubItem(todoId, 'Sub 2');
  subItem1Id = sub1.id;
  subItem2Id = sub2.id;
});

// FR-005: marking todo complete cascades to all subitems
describe('completeTodo (FR-005)', () => {
  it('marks the todo as completed', () => {
    const updated = completeTodo(todoId);
    expect(updated).not.toBeNull();
    expect(updated?.completed).toBe(true);
  });

  it('cascades completion to all subitems', () => {
    completeTodo(todoId);
    const sub1 = getSubItemById(subItem1Id);
    const sub2 = getSubItemById(subItem2Id);
    expect(sub1?.completed).toBe(true);
    expect(sub2?.completed).toBe(true);
  });

  it('returns null for a non-existent todo', () => {
    const result = completeTodo('non-existent-id');
    expect(result).toBeNull();
  });

  it('works when the todo has no subitems', () => {
    const todo2 = createTodo(listId, 'Empty Todo');
    const updated = completeTodo(todo2.id);
    expect(updated?.completed).toBe(true);
  });
});

// FR-022: marking todo incomplete does NOT cascade to subitems
describe('incompleteTodo (FR-022)', () => {
  it('marks the todo as incomplete', () => {
    // First complete it
    completeTodo(todoId);
    // Then incomplete it
    const updated = incompleteTodo(todoId);
    expect(updated).not.toBeNull();
    expect(updated?.completed).toBe(false);
  });

  it('does NOT cascade to subitems — each subitem retains its current state', () => {
    // Complete everything first
    completeTodo(todoId);
    // Both subitems should be complete
    expect(getSubItemById(subItem1Id)?.completed).toBe(true);
    expect(getSubItemById(subItem2Id)?.completed).toBe(true);

    // Now mark the todo incomplete
    incompleteTodo(todoId);

    // Subitems must retain their completed state
    expect(getSubItemById(subItem1Id)?.completed).toBe(true);
    expect(getSubItemById(subItem2Id)?.completed).toBe(true);
  });

  it('returns null for a non-existent todo', () => {
    const result = incompleteTodo('non-existent-id');
    expect(result).toBeNull();
  });
});

// FR-017: all subitems complete → auto-completes parent
describe('completeSubItem (FR-017)', () => {
  it('auto-completes the parent todo when all subitems become complete', () => {
    completeSubItem(subItem1Id);
    // Parent should still be incomplete (subItem2 still pending)
    expect(getTodoById(todoId)?.completed).toBe(false);

    completeSubItem(subItem2Id);
    // Now all subitems complete → parent auto-completes
    expect(getTodoById(todoId)?.completed).toBe(true);
  });

  it('marks the subitem itself as completed', () => {
    const updated = completeSubItem(subItem1Id);
    expect(updated?.completed).toBe(true);
  });

  it('returns null for non-existent subitem', () => {
    const result = completeSubItem('non-existent-id');
    expect(result).toBeNull();
  });

  it('marks parent complete when the only subitem is completed', () => {
    // Add a fresh todo with one subitem
    const todo2 = createTodo(listId, 'Solo todo');
    const only = createSubItem(todo2.id, 'Only sub');
    completeSubItem(only.id);
    expect(getTodoById(todo2.id)?.completed).toBe(true);
  });
});

// FR-006: any subitem incomplete marks parent incomplete
describe('incompleteSubItem (FR-006)', () => {
  it('marks the subitem as incomplete', () => {
    completeSubItem(subItem1Id);
    const updated = incompleteSubItem(subItem1Id);
    expect(updated?.completed).toBe(false);
  });

  it('marks parent todo as incomplete when any subitem is incomplete', () => {
    // Complete both subitems → parent becomes complete
    completeSubItem(subItem1Id);
    completeSubItem(subItem2Id);
    expect(getTodoById(todoId)?.completed).toBe(true);

    // Mark one subitem incomplete → parent should become incomplete
    incompleteSubItem(subItem1Id);
    expect(getTodoById(todoId)?.completed).toBe(false);
  });

  it('returns null for non-existent subitem', () => {
    const result = incompleteSubItem('non-existent-id');
    expect(result).toBeNull();
  });
});
