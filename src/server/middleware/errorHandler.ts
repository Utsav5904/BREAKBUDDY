import { Request, Response, NextFunction } from 'express';

/**
 * Standard API error response shape.
 */
export interface ApiError {
  success: false;
  message: string;
  code: string;
  errors?: string[];
}

/**
 * Custom error class with HTTP status code and machine-readable code.
 */
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public errors: string[];

  constructor(message: string, statusCode: number, code: string, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handling middleware.
 * Catches all errors and returns a consistent JSON response.
 * Never exposes stack traces in production.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Log the full error server-side
  console.error(`[error] ${req.method} ${req.path}:`, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  if (err instanceof AppError) {
    const response: ApiError = {
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors.length > 0 ? err.errors : undefined,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Unexpected errors — generic 500
  const response: ApiError = {
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  };
  res.status(500).json(response);
}

/**
 * 404 handler for unknown API routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  // Only handle /api/ routes as 404 JSON — let static file serving handle the rest
  if (req.path.startsWith('/api/')) {
    const response: ApiError = {
      success: false,
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
    };
    res.status(404).json(response);
  }
}
