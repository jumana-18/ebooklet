import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { TokenPayload, UserRole } from '../types';

/**
 * Generate JWT utility
 */
export const generateToken = (id: string, email: string, role: UserRole): string => {
  const payload: TokenPayload = { id, email, role };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export class AuthService {
  /**
   * Register a user record with automatic cart and wishlist creation
   */
  static async registerUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    avatarUrl?: string;
    dailyGoal?: number | string;
    favoriteGenres?: string[];
    role?: UserRole;
  }) {
    const { name, email, password, phone, avatarUrl, dailyGoal, favoriteGenres, role } = data;

    const formattedEmail = email.toLowerCase().trim();

    // Enforce unique constraints
    const existingUser = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (existingUser) {
      throw new ApiError('A user with that email address is already registered.', 409);
    }

    // Cryptographic hash using bcrypt
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Persist complete structure
    const newUser = await prisma.user.create({
      data: {
        name,
        email: formattedEmail,
        passwordHash,
        phone: phone || null,
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        readingGoalMinutes: dailyGoal ? parseInt(dailyGoal as string, 10) : 30,
        favoriteGenres: favoriteGenres || [],
        joinedDate: new Date(),
        membership: 'Bronze Member',
        streak: 1,
        poeticPoints: 10,
        role: role || 'buyer',
        cart: {
          create: {},
        },
        wishlist: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        membership: true,
        streak: true,
        poeticPoints: true,
        favoriteGenres: true,
        readingGoalMinutes: true,
        joinedDate: true,
        role: true,
      },
    });

    const token = generateToken(newUser.id, newUser.email, newUser.role as UserRole);

    return { user: newUser, token };
  }

  /**
   * Authenticate email / password credentials
   */
  static async authenticateUser(email: string, password: string) {
    const formattedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new ApiError('Incorrect email or password.', 401);
    }

    const token = generateToken(user.id, user.email, user.role as UserRole);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        membership: user.membership,
        streak: user.streak,
        poeticPoints: user.poeticPoints,
        favoriteGenres: user.favoriteGenres,
        readingGoalMinutes: user.readingGoalMinutes,
        joinedDate: user.joinedDate,
        role: user.role as UserRole,
      },
      token,
    };
  }

  /**
   * Fetch user profile securely
   */
  static async getUserProfile(id: string) {
    const profile = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        membership: true,
        streak: true,
        poeticPoints: true,
        favoriteGenres: true,
        readingGoalMinutes: true,
        joinedDate: true,
        role: true,
      },
    });

    if (!profile) {
      throw new ApiError('Profile record not discovered.', 404);
    }

    return profile;
  }

  /**
   * Refine and persist user updates
   */
  static async updateUserProfile(id: string, data: any) {
    const dataToUpdate: any = {};
    if (data.name !== undefined) dataToUpdate.name = data.name;
    if (data.phone !== undefined) dataToUpdate.phone = data.phone;
    if (data.avatarUrl !== undefined) dataToUpdate.avatarUrl = data.avatarUrl;
    if (data.avatar !== undefined) dataToUpdate.avatarUrl = data.avatar;
    if (data.dailyGoal !== undefined) dataToUpdate.readingGoalMinutes = parseInt(data.dailyGoal, 10);
    if (data.readingGoalMinutes !== undefined) dataToUpdate.readingGoalMinutes = parseInt(data.readingGoalMinutes, 10);
    if (data.favoriteGenres !== undefined) dataToUpdate.favoriteGenres = data.favoriteGenres;
    if (data.streak !== undefined) dataToUpdate.streak = parseInt(data.streak, 10);
    if (data.poeticPoints !== undefined) dataToUpdate.poeticPoints = parseInt(data.poeticPoints, 10);
    if (data.membership !== undefined) dataToUpdate.membership = data.membership;
    if (data.role !== undefined) dataToUpdate.role = data.role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        membership: true,
        streak: true,
        poeticPoints: true,
        favoriteGenres: true,
        readingGoalMinutes: true,
        joinedDate: true,
        role: true,
      },
    });

    return updatedUser;
  }
}
