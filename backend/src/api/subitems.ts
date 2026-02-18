/**
 * T038 – Subitem routes: Create + Read (Phase 3)
 * Completion (T054), rename/delete (T065), and reorder (T066) are added in later phases.
 *
 * Two mount points (both registered in api/index.ts):
 *   - Nested:    /api/todos/:todoId/subitems  (create + list)
 *   - Top-level: /api/subitems/:subItemId     (update + delete)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { createSubItemSchema, updateSubItemSchema, reorderSchema } from '../services/validation';
import {
  getSubItemsForTodo,
  createSubItem,
  getSubItemById,
  updateSubItem,
  deleteSubItem,
  reorderSubItems,
} from '../services/subItemService';

// ─── Nested router: mounted at /api/todos/:todoId/subitems (mergeParams: true) ─

export const nestedSubitemsRouter = Router({ mergeParams: true });

// GET /api/todos/:todoId/subitems
nestedSubitemsRouter.get('/', (req: Request, res: Response) => {
  const { todoId } = req.params as { todoId: string };
  const subitems = getSubItemsForTodo(todoId);
  if (subitems === null) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Todo not found' });
    return;
  }
  res.json(subitems);
});

// POST /api/todos/:todoId/subitems/reorder — before /:subItemId
nestedSubitemsRouter.post('/reorder', (req: Request, res: Response, next: NextFunction) => {
  const { todoId } = req.params as { todoId: string };
  try {
    const { orderedIds } = reorderSchema.parse(req.body);
    reorderSubItems(todoId, orderedIds);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/todos/:todoId/subitems
nestedSubitemsRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  const { todoId } = req.params as { todoId: string };
  try {
    const { title } = createSubItemSchema.parse(req.body);
    const subitem = createSubItem(todoId, title);
    res.status(201).json(subitem);
  } catch (err) {
    next(err);
  }
});

// ─── Top-level router: mounted at /api/subitems ───────────────────────────────

export const subitemsRouter = Router();

// GET /api/subitems/:subItemId
subitemsRouter.get('/:subItemId', (req: Request, res: Response) => {
  const { subItemId } = req.params as { subItemId: string };
  const subitem = getSubItemById(subItemId);
  if (!subitem) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'SubItem not found' });
    return;
  }
  res.json(subitem);
});

// PATCH /api/subitems/:subItemId
subitemsRouter.patch('/:subItemId', (req: Request, res: Response, next: NextFunction) => {
  const { subItemId } = req.params as { subItemId: string };
  try {
    const fields = updateSubItemSchema.parse(req.body);
    const updated = updateSubItem(subItemId, fields);
    if (!updated) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'SubItem not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/subitems/:subItemId
subitemsRouter.delete('/:subItemId', (req: Request, res: Response) => {
  const { subItemId } = req.params as { subItemId: string };
  const deleted = deleteSubItem(subItemId);
  if (!deleted) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'SubItem not found' });
    return;
  }
  res.status(204).send();
});
