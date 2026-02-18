import { Router } from 'express';
import { syncRequestSchema } from '../services/validation';
import { processSyncBatch } from '../services/syncService';

const router = Router();

/**
 * POST /api/sync/operations
 * Accepts a batch of queued offline operations and applies them with last-write-wins semantics.
 */
router.post('/operations', (req, res, next) => {
  try {
    const parsed = syncRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((e) => `${(e.path as unknown[]).join('.')}: ${e.message}`).join(', '),
      });
      return;
    }

    // Phase 2: conflict resolution only — DB mutations wired in Phase 3+
    const result = processSyncBatch(parsed.data, (_entityType, _entityId) => null);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export { router as syncRouter };
