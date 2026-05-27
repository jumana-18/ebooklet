import { Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';
import { BookFormat } from '@prisma/client';

/**
 * Utility to guarantee a user has a cart before adding items to it
 */
async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  return cart;
}

/**
 * Get active cart items for the currently logged-in user session
 */
export const getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const cart = await getOrCreateCart(userId);

  // Format response to fit frontend structure
  const formattedItems = cart.items.map((item) => ({
    book: {
      id: item.product.id,
      title: item.product.title,
      author: item.product.author,
      coverImage: item.product.coverImage,
      price: Number(item.product.price),
      rating: Number(item.product.rating),
      bookType: item.product.bookType,
      category: item.product.categorySlug,
    },
    quantity: item.quantity,
    format: item.format,
  }));

  res.status(200).json({
    status: 'success',
    items: formattedItems,
  });
});

/**
 * Add an item or update its count in the shopping cart
 */
export const addToCart = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const productId = req.body.productId || req.body.bookId || req.body.book?.id;
  const quantity = req.body.quantity;
  const format = req.body.format || req.body.book?.format;

  if (!userId) return next(new AppError('No authenticated user context.', 401));
  if (!productId) return next(new AppError('Please specify a product ID to purchase.', 400));

  // Determine correct prisma format enum
  let rawFormat = (format || 'physical').toString().toLowerCase();
  if (rawFormat === 'printed book' || rawFormat === 'printed codex') {
    rawFormat = 'physical';
  }
  const targetFormat = rawFormat as BookFormat;

  // Let's verify the book exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return next(new AppError('The requested book does not exist in the catalog.', 404));
  }

  const cart = await getOrCreateCart(userId);

  // Check if item of same book and format already resides in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_format: {
        cartId: cart.id,
        productId,
        format: targetFormat,
      },
    },
  });

  const qty = parseInt(quantity || '1', 10);

  if (existingItem) {
    // Increment quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + qty },
    });
  } else {
    // Store as a new record
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: qty,
        format: targetFormat,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Book successfully added to your cart!',
  });
});

/**
 * Update the exact quantity of an existing item in the shopping cart
 */
export const updateCartItemQuantity = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const productId = req.body.productId || req.body.bookId || req.body.book?.id;
  const format = req.body.format || req.body.book?.format;
  const quantity = req.body.quantity;

  if (!userId) return next(new AppError('No authenticated user context.', 401));
  if (!productId || quantity === undefined) {
    return next(new AppError('Please provide both product identifier and desired quantity.', 400));
  }

  let rawFormat = (format || 'physical').toString().toLowerCase();
  if (rawFormat === 'printed book' || rawFormat === 'printed codex') {
    rawFormat = 'physical';
  }
  const targetFormat = rawFormat as BookFormat;
  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_format: {
        cartId: cart.id,
        productId,
        format: targetFormat,
      },
    },
  });

  if (!existingItem) {
    return next(new AppError('Item was not found in your cart.', 404));
  }

  const newQty = parseInt(quantity, 10);
  if (newQty <= 0) {
    // Delete item if quantity reaches zero or negative
    await prisma.cartItem.delete({
      where: { id: existingItem.id },
    });
  } else {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Cart quantities adjusted.',
  });
});

/**
 * Eliminate an item from the cart entirely
 */
export const removeCartItem = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const productId = req.params.productId || req.query.productId;
  const format = req.params.format || req.query.format;

  if (!userId) return next(new AppError('No authenticated user context.', 401));
  if (!productId) return next(new AppError('Please specify the book to discard.', 400));

  let rawFormat = ((format as string) || 'physical').toLowerCase();
  if (rawFormat === 'printed book' || rawFormat === 'printed codex') {
    rawFormat = 'physical';
  }
  const targetFormat = rawFormat as BookFormat;
  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_format: {
        cartId: cart.id,
        productId: productId as string,
        format: targetFormat,
      },
    },
  });

  if (!existingItem) {
    return next(new AppError('That book and format combination is not present in your cart.', 404));
  }

  await prisma.cartItem.delete({
    where: { id: existingItem.id },
  });

  res.status(200).json({
    status: 'success',
    message: 'Discarded item successfully.',
  });
});

/**
 * Wipe all items from the current user's cart
 */
export const clearCart = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  res.status(200).json({
    status: 'success',
    message: 'All items swept from the cart.',
  });
});
