import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before parsing
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default('postgresql://postgres:password@localhost:5440/ebooklet_db?schema=public'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long').default('supersafesecretkeychangeinproduction'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  UPLOADS_DIR: z.string().default(path.join(process.cwd(), 'uploads/profile-images')),
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  // In development, do not crash but warn; in production, fail fast
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsed.success ? parsed.data : {
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5440/ebooklet_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'supersafesecretkeychangeinproduction',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  UPLOADS_DIR: process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads/profile-images'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
};
