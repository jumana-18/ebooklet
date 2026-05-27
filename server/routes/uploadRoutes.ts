import { Router } from 'express';
import { uploadProfileImage } from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';
import { uploadAvatar } from '../middleware/uploadMiddleware';

const router = Router();

// Single file upload route - handles file upload with validation limits
router.post('/avatar', protect, uploadAvatar.single('avatar'), uploadProfileImage);

export default router;
