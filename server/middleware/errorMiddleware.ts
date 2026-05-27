import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

/**
 * Express error middleware to catch and serialize operational and programming errors.
 */
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log full error depending on status
  if (err.statusCode < 500) {
    console.log(`ℹ️ [Operational Warning - ${err.statusCode}]: ${err.message || 'Operational exception.'}`);
  } else {
    console.error('🔥 [Critical System Error]:', err);
  }

  let errorInstance = { ...err, message: err.message, stack: err.stack };

  // Prisma Unique Constraint Error (e.g., Email already registered)
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? ` (${(err.meta.target as string[]).join(', ')})` : '';
    errorInstance = new ApiError(`A resource with that unique characteristic already exists.${fields}`, 409);
  }

  // Prisma Foreign Key Constraint failed
  if (err.code === 'P2003') {
    errorInstance = new ApiError('Related reference record not found or dependency constraints violated.', 400);
  }

  // Prisma Record Not Found for updates/deletion
  if (err.code === 'P2025') {
    errorInstance = new ApiError(err.meta?.cause || 'Requested record was not found or has been removed.', 404);
  }

  // JsonWebToken Signature Error
  if (err.name === 'JsonWebTokenError') {
    errorInstance = new ApiError('Invalid token signature. Please authenticate again.', 401);
  }

  // JsonWebToken Expired Error
  if (err.name === 'TokenExpiredError') {
    errorInstance = new ApiError('Your session token has expired. Please log in again.', 401);
  }

  // Multer Upload Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    errorInstance = new ApiError(`File exceeds maximum size threshold of ${env.MAX_FILE_SIZE_MB}MB.`, 400);
  }

  // Respond to the client
  if (env.NODE_ENV === 'development') {
    res.status(errorInstance.statusCode).json({
      status: errorInstance.status || 'error',
      message: errorInstance.message,
      error: errorInstance,
      stack: errorInstance.stack,
    });
  } else {
    // Production Response (Sensitive details are masked)
    if (errorInstance.isOperational) {
      res.status(errorInstance.statusCode).json({
        status: errorInstance.status || 'fail',
        message: errorInstance.message,
      });
    } else {
      // General Programming/Infrastructure issues
      res.status(500).json({
        status: 'error',
        message: 'Something went incorrect on the server. Please try again later.',
      });
    }
  }
};
