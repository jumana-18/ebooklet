import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  dbUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'supersafesecretkeychangeinproduction',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadsDir: process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
};

// Validate critical parameters in non-development mode
if (config.env === 'production' && (!process.env.DATABASE_URL || !process.env.JWT_SECRET)) {
  console.warn('⚠️ [WARNING] Production environment is missing critical configurations (DATABASE_URL or JWT_SECRET). Please check your environment variables.');
}
