import { Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

/**
 * Utility to guarantee a user has a wishlist before performing alterations
 */
async function getOrCreateWishlist(userId: string) {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  return wishlist;
}

/**
 * Fetch the authenticated user's curated wishlist
 */
export const getWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const wishlist = await getOrCreateWishlist(userId);

  // Format array to align with frontend book interface
  const formattedItems = wishlist.items.map((item) => ({
    id: item.product.id,
    title: item.product.title,
    author: item.product.author,
    coverImage: item.product.coverImage,
    price: Number(item.product.price),
    rating: Number(item.product.rating),
    bookType: item.product.bookType,
    category: item.product.categorySlug,
  }));

  res.status(200).json({
    status: 'success',
    wishlist: formattedItems,
  });
});

/**
 * Add a book to the wishlist
 */
export const addToWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const productId = req.body.productId || req.body.bookId || req.body.id;

  if (!userId) return next(new AppError('No authenticated user context.', 401));
  if (!productId) return next(new AppError('Identify the book to wishlist.', 400));

  // Check product existence
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return next(new AppError('This book is not indexed in the catalog.', 404));
  }

  const wishlist = await getOrCreateWishlist(userId);

  // Enforce unique wishlist entries
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });

  if (!existingItem) {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Added to your wishlist.',
  });
});

/**
 * Remove a book from the wishlist
 */
export const removeFromWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const productId = req.params.productId || req.query.productId || req.body?.productId || req.body?.bookId;

  if (!userId) return next(new AppError('No authenticated user context.', 401));
  if (!productId) return next(new AppError('Identify the book to remove.', 400));

  const wishlist = await getOrCreateWishlist(userId);

  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId: productId as string,
      },
    },
  });

  if (!existingItem) {
    return next(new AppError('That item did not reside in your wishlist.', 404));
  }

  await prisma.wishlistItem.delete({
    where: { id: existingItem.id },
  });

  res.status(200).json({
    status: 'success',
    message: 'Discarded item from wishlist.',
  });
});
