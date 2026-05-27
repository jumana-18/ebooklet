import { Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

/**
 * Save or rewrite a book review and recalculate average rating stats
 */
export const createReview = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const { productId, rating, comment } = req.body;

  if (!productId || !rating || comment === undefined) {
    return next(new AppError('Please supply product ID, rating stars (1-5), and comment text.', 400));
  }

  const score = parseInt(rating, 10);
  if (score < 1 || score > 5) {
    return next(new AppError('Ratings must range bounded between 1 to 5 stars.', 400));
  }

  // 1. Verify target product existence
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return next(new AppError('The book you are trying to review is not indexed.', 404));
  }

  // 2. Insert or update the review record and update product average in a transaction
  const review = await prisma.$transaction(async (tx) => {
    // Upsert the review (a user can write exactly 1 review per product)
    const savedReview = await tx.review.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        rating: score,
        comment,
      },
      create: {
        userId,
        productId,
        rating: score,
        comment,
      },
    });

    // Fetch all reviews of this product to compute updated aggregates
    const productReviews = await tx.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const averageRating =
      productReviews.reduce((acc, curr) => acc + curr.rating, 0) / productReviews.length;

    // Apply the newly aggregated quality rating directly to the book
    await tx.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(averageRating.toFixed(1)),
      },
    });

    return savedReview;
  });

  res.status(201).json({
    status: 'success',
    review,
  });
});

/**
 * Fetch reviews for a specific ebook or physical printing
 */
export const getProductReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          name: true,
          avatarUrl: true,
          joinedDate: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    reviews,
  });
});
