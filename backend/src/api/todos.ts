/**
 * T037 – Todo routes: Create + Read (Phase 3)
 * Completion (T054), rename/delete (T065), and reorder (T066) are added in later phases.
 *
 * Two mount points (both registered in api/index.ts):
 *   - Nested:    /api/lists/:listId/todos  (create + list)
 *   - Top-level: /api/todos/:todoId        (update + delete)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { createTodoItemSchema, updateTodoItemSchema, reorderSchema } from '../services/validation';
import {
  getTodosForList,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
  reorderTodos,
} from '../services/todoService';

// ─── Nested router: mounted at /api/lists/:listId/todos (mergeParams: true) ──

export const nestedTodosRouter = Router({ mergeParams: true });

// GET /api/lists/:listId/todos
nestedTodosRouter.get('/', (req: Request, res: Response) => {
  const { listId } = req.params as { listId: string };
  const todos = getTodosForList(listId);
  if (todos === null) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'List not found' });
    return;
  }
  res.json(todos);
});

// POST /api/lists/:listId/todos/reorder — before /:todoId
nestedTodosRouter.post('/reorder', (req: Request, res: Response, next: NextFunction) => {
  const { listId } = req.params as { listId: string };
  try {
    const { orderedIds } = reorderSchema.parse(req.body);
    reorderTodos(listId, orderedIds);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/lists/:listId/todos
nestedTodosRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  const { listId } = req.params as { listId: string };
  try {
    const { title } = createTodoItemSchema.parse(req.body);
    const todo = createTodo(listId, title);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// ─── Top-level router: mounted at /api/todos ──────────────────────────────────

export const todosRouter = Router();

// GET /api/todos/:todoId
todosRouter.get('/:todoId', (req: Request, res: Response) => {
  const { todoId } = req.params as { todoId: string };
  const todo = getTodoById(todoId);
  if (!todo) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Todo not found' });
    return;
  }
  res.json(todo);
});

// PATCH /api/todos/:todoId
todosRouter.patch('/:todoId', (req: Request, res: Response, next: NextFunction) => {
  const { todoId } = req.params as { todoId: string };
  try {
    const fields = updateTodoItemSchema.parse(req.body);
    const updated = updateTodo(todoId, fields);
    if (!updated) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Todo not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/:todoId
todosRouter.delete('/:todoId', (req: Request, res: Response) => {
  const { todoId } = req.params as { todoId: string };
  const deleted = deleteTodo(todoId);
  if (!deleted) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Todo not found' });
    return;
  }
  res.status(204).send();
});
