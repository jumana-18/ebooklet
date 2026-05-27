import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';
import { AuthenticatedRequest, TokenPayload } from '../types';

/**
 * Middleware to restrict route access solely to authenticated JWT holders
 */
export const protect = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
  let token: string | undefined;

  // Debug investigation logs to check incoming auth channel headers and cookies
  console.log(`[AuthDebug] Path: ${req.url || req.originalUrl}`);

  // 1. Inspect headers or secure cookies for the JWT authentication token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new ApiError('You are not authorized to view this resource. Please log in.', 401));
  }

  // 2. Cryptographically verify the signature
  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (err) {
    return next(new ApiError('Your session token has expired or is invalid. Please log in again.', 401));
  }

  // 3. Ensure the target user account still exists in the database
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
    }
  });

  if (!user) {
    return next(new ApiError('The user account linked to this security token no longer exists.', 401));
  }

  // 4. Inject clean session profile context into the request object
  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: (user.role as any) || 'buyer',
    avatarUrl: user.avatarUrl
  };

  next();
});

/**
 * Gatekeeper to restrict route access by role
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'buyer';
    if (!roles.includes(userRole)) {
      return next(new ApiError('You do not possess the necessary privileges to carry out this action.', 403));
    }
    next();
  };
};
