import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../prisma/client';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';
import { uploadPath } from '../middleware/uploadMiddleware';

/**
 * Handle user avatar upload and bind static local path to profile record in DB
 */
export const uploadProfileImage = asyncHandler<AuthenticatedRequest>(async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) return next(new ApiError('No authenticated user context.', 401));

  // 1. Enforce that multer successfully received and validated the file
  if (!req.file) {
    return next(new ApiError('Please provide a valid image file to upload.', 400));
  }

  // 2. Formulate the static accessible HTTP image URL relative path
  // Saves web-ready path like /uploads/profile-images/filename
  const relativePath = `/uploads/profile-images/${req.file.filename}`;

  // 3. Clean up user's previous customization avatar image from disk to prevent storage leak
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });

  if (userRecord?.avatarUrl && userRecord.avatarUrl.includes('/uploads/profile-images/')) {
    try {
      const oldFilename = userRecord.avatarUrl.split('/').pop();
      if (oldFilename) {
        const oldFilePath = path.join(uploadPath, oldFilename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`🗑️ Successfully deleted old avatar at: ${oldFilePath}`);
        }
      }
    } catch (cleanupErr) {
      console.warn('⚠️ Non-blocking warning: Failed to delete old user avatar from disk:', cleanupErr);
    }
  }

  // 4. Persist the clean new avatar URL in PostgreSQL
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl: relativePath,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Avatar uploaded successfully.',
    avatarUrl: relativePath,
    user: updatedUser,
  });
});
