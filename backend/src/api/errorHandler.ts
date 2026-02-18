import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export interface ApiError {
  code: string;
  message: string;
}

/**
 * Global error handling middleware.
 * Converts known error types to structured JSON responses.
 * Must be registered last (after all routes).
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Zod validation errors → 422
  if (err instanceof ZodError) {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(422).json({ code: 'VALIDATION_ERROR', message } satisfies ApiError);
    return;
  }

  // Known application errors with a statusCode property
  if (err && typeof err === 'object' && 'statusCode' in err) {
    const appErr = err as { statusCode: number; code: string; message: string };
    res.status(appErr.statusCode).json({
      code: appErr.code ?? 'ERROR',
      message: appErr.message ?? 'An error occurred',
    } satisfies ApiError);
    return;
  }

  // Unexpected errors → 500
  console.error('[errorHandler]', err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } satisfies ApiError);
};

/**
 * Creates a structured application error with an HTTP status code.
 */
export function createAppError(statusCode: number, code: string, message: string): Error & { statusCode: number; code: string } {
  const err = new Error(message) as Error & { statusCode: number; code: string };
  err.statusCode = statusCode;
  err.code = code;
  return err;
}
