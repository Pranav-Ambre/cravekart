import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Known custom errors
  if (err.statusCode) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma unique constraint errors
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      message: `A record with this ${err.meta?.target || 'field'} already exists.`,
    });
    return;
  }

  // Default internal server error
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message || 'Internal server error',
  });
}
