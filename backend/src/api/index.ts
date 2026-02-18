import { Router } from 'express';
import { syncRouter } from './sync';
import { listsRouter } from './lists';
import { todosRouter, nestedTodosRouter } from './todos';
import { subitemsRouter, nestedSubitemsRouter } from './subitems';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Offline sync (Phase 2)
router.use('/sync', syncRouter);

// List routes
router.use('/lists', listsRouter);

// Nested todo routes: GET/POST /api/lists/:listId/todos and /reorder
router.use('/lists/:listId/todos', nestedTodosRouter);

// Top-level todo routes: GET/PATCH/DELETE /api/todos/:todoId
router.use('/todos', todosRouter);

// Nested subitem routes: GET/POST /api/todos/:todoId/subitems and /reorder
router.use('/todos/:todoId/subitems', nestedSubitemsRouter);

// Top-level subitem routes: GET/PATCH/DELETE /api/subitems/:subItemId
router.use('/subitems', subitemsRouter);

export { router as apiRouter };
