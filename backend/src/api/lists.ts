/**
 * T036 – List routes: Create + Read (Phase 3)
 * Rename/delete (T065) and reorder (T066) are added in Phase 5.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createTodoListSchema, updateTodoListSchema, reorderSchema } from '../services/validation';
import {
  getAllLists,
  getListById,
  createList,
  updateList,
  deleteList,
  reorderLists,
} from '../services/listService';

export const listsRouter = Router();

// GET /api/lists
listsRouter.get('/', (_req: Request, res: Response) => {
  const lists = getAllLists();
  res.json(lists);
});

// POST /api/lists/reorder — must be before /:listId to avoid matching "reorder" as an id
listsRouter.post('/reorder', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderedIds } = reorderSchema.parse(req.body);
    reorderLists(orderedIds);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/lists
listsRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = createTodoListSchema.parse(req.body);
    const list = createList(name);
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
});

// GET /api/lists/:listId
listsRouter.get('/:listId', (req: Request, res: Response) => {
  const { listId } = req.params as { listId: string };
  const list = getListById(listId);
  if (!list) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'List not found' });
    return;
  }
  res.json(list);
});

// PATCH /api/lists/:listId
listsRouter.patch('/:listId', (req: Request, res: Response, next: NextFunction) => {
  const { listId } = req.params as { listId: string };
  try {
    const fields = updateTodoListSchema.parse(req.body);
    const updated = updateList(listId, fields);
    if (!updated) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'List not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/lists/:listId
listsRouter.delete('/:listId', (req: Request, res: Response) => {
  const { listId } = req.params as { listId: string };
  const deleted = deleteList(listId);
  if (!deleted) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'List not found' });
    return;
  }
  res.status(204).send();
});

// Nested todos routes (imported from todosRouter in api/index.ts)
// GET /api/lists/:listId/todos and POST /api/lists/:listId/todos
// are handled by the todos router mounted with :listId mergeParams
