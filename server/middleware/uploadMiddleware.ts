import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

// Compute upload path matching config environment
const uploadPath = path.isAbsolute(env.UPLOADS_DIR)
  ? env.UPLOADS_DIR
  : path.join(process.cwd(), env.UPLOADS_DIR);

// Create directory recursively
try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(`📁 Made upload directory at: ${uploadPath}`);
  }
} catch (err) {
  console.error('⚠️ Could not initialize local upload folder structures:', err);
}

// 1. Configure Multer Disk Storage parameters
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${fileExtension}`);
  },
});

// 2. Configure File Type Filtering
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new ApiError('Invalid file type. Only PNG, JPG, JPEG and WEBP formats are accepted.', 400));
  }
};

// 3. Export configured Multer upload middleware
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024, // Convert MB to bytes
  },
});

export { uploadPath };
