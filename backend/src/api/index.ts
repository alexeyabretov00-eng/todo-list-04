import { Router } from 'express';
import { syncRouter } from './sync';

// Route modules are imported here as they are implemented in Phase 3+
// import { listsRouter } from './lists';
// import { todosRouter } from './todos';
// import { subitemsRouter } from './subitems';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Offline sync (Phase 2)
router.use('/sync', syncRouter);

// Mounted in Phase 3+:
// router.use('/lists', listsRouter);
// router.use('/todos', todosRouter);
// router.use('/subitems', subitemsRouter);

export { router as apiRouter };
