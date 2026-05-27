import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';
import { env } from '../config/env';

/**
 * Register a clean new user profile with hashed credentials
 */
export const register = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
  const { name, email, password, phone, avatarUrl, dailyGoal, favoriteGenres, role } = req.body;

  if (!name || !email || !password) {
    return next(new ApiError('Please provide a name, email and password.', 400));
  }

  const { user, token } = await AuthService.registerUser({
    name,
    email,
    password,
    phone,
    avatarUrl,
    dailyGoal,
    favoriteGenres,
    role,
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days matching token expiration
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(201).json({
    status: 'success',
    token,
    user,
  });
});

/**
 * Authenticate existing users using emails and passwords
 */
export const login = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError('Please provide an email and password.', 400));
  }

  const { user, token } = await AuthService.authenticateUser(email, password);

  res.cookie('jwt', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days matching token expiration
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

/**
 * Fetch the profile of the currently authenticated request session
 */
export const getProfile = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
  if (!req.user) {
    return next(new ApiError('Unauthenticated request.', 401));
  }

  const profile = await AuthService.getUserProfile(req.user.id);

  res.status(200).json({
    status: 'success',
    user: profile,
  });
});

/**
 * Refine/Update current profile properties
 */
export const updateProfile = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
  if (!req.user) {
    return next(new ApiError('Unauthenticated request context.', 401));
  }

  const updatedUser = await AuthService.updateUserProfile(req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

/**
 * Clean user session cookies upon requesting logout
 */
export const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie('jwt');
  res.status(200).json({
    status: 'success',
    message: 'Successfully logged out from EBOOKLET.',
  });
});
