import { Request } from 'express';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
}

/**
 * Standard request interface with authenticated user context attached
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
