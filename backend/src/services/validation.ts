import { z } from 'zod';

// ─── TodoList ────────────────────────────────────────────────────────────────

/**
 * List name: required, max 255 chars, unique across all lists.
 * Uniqueness enforced at DB layer (UNIQUE index on todo_lists.name) — T082 is authoritative.
 */
export const todoListNameSchema = z
  .string()
  .min(1, 'name is required')
  .max(255, 'name must not exceed 255 characters');

export const createTodoListSchema = z.object({
  name: todoListNameSchema,
});

export const updateTodoListSchema = z.object({
  name: todoListNameSchema.optional(),
  position: z.number().int().min(0).optional(),
});

// ─── TodoItem ─────────────────────────────────────────────────────────────────

/**
 * Todo title: required, max 255 chars, unique within parent list.
 * Uniqueness enforced at DB layer (UNIQUE index on (list_id, title)) — T082 is authoritative.
 */
export const todoItemTitleSchema = z
  .string()
  .min(1, 'title is required')
  .max(255, 'title must not exceed 255 characters');

export const createTodoItemSchema = z.object({
  title: todoItemTitleSchema,
});

export const updateTodoItemSchema = z.object({
  title: todoItemTitleSchema.optional(),
  completed: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

// ─── SubItem ──────────────────────────────────────────────────────────────────

/**
 * Subitem title: required, max 255 chars, unique within parent todo.
 * Uniqueness enforced at DB layer (UNIQUE index on (todo_id, title)) — T082 is authoritative.
 */
export const subItemTitleSchema = z
  .string()
  .min(1, 'title is required')
  .max(255, 'title must not exceed 255 characters');

export const createSubItemSchema = z.object({
  title: subItemTitleSchema,
});

export const updateSubItemSchema = z.object({
  title: subItemTitleSchema.optional(),
  completed: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

// ─── Reorder ──────────────────────────────────────────────────────────────────

export const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

// ─── Sync ─────────────────────────────────────────────────────────────────────

export const syncOperationSchema = z.object({
  id: z.string(),
  entityType: z.enum(['list', 'todo', 'subitem']),
  operation: z.enum(['create', 'update', 'delete', 'reorder']),
  entityId: z.string(),
  payload: z.record(z.string(), z.unknown()),
  clientTimestamp: z.string().datetime(),
  idempotencyKey: z.string(),
});

export const syncRequestSchema = z.object({
  operations: z.array(syncOperationSchema).min(1),
});

// ─── Exported types ───────────────────────────────────────────────────────────

export type CreateTodoListInput = z.infer<typeof createTodoListSchema>;
export type UpdateTodoListInput = z.infer<typeof updateTodoListSchema>;
export type CreateTodoItemInput = z.infer<typeof createTodoItemSchema>;
export type UpdateTodoItemInput = z.infer<typeof updateTodoItemSchema>;
export type CreateSubItemInput = z.infer<typeof createSubItemSchema>;
export type UpdateSubItemInput = z.infer<typeof updateSubItemSchema>;
export type ReorderInput = z.infer<typeof reorderSchema>;
export type SyncOperationInput = z.infer<typeof syncOperationSchema>;
export type SyncRequestInput = z.infer<typeof syncRequestSchema>;
