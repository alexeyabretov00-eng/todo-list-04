import type { NextFunction, Request, Response } from 'express';

import { validateSession } from '../services/authService';

/**
 * Express middleware that enforces session authentication.
 *
 * Reads the `session_token` cookie set by POST /api/auth/login.
 * Returns 401 if the cookie is absent or the token is expired/unknown.
 * Calls next() when the session is valid.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token: string | undefined = req.cookies['session_token'];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const session = validateSession(token);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
