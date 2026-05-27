import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * List all available book categories of our sanctuary
 */
export const getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    categories,
  });
});

/**
 * Query products with complex filters (search strings, category filters, minimum rating, price boundaries, and sort styles)
 */
export const getProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { search, category, rating, minPrice, maxPrice, sortBy } = req.query;

  // Build the query conditions dynamically
  const whereCondition: any = {};

  // 1. Full-text search (scans book title and author)
  if (search) {
    const searchStr = `${search}`.trim();
    whereCondition.OR = [
      { title: { contains: searchStr, mode: 'insensitive' } },
      { author: { contains: searchStr, mode: 'insensitive' } },
      { categorySlug: { contains: searchStr, mode: 'insensitive' } },
    ];
  }

  // 2. Filter by particular category
  if (category && category !== 'all') {
    whereCondition.categorySlug = `${category}`.toLowerCase();
  }

  // 3. Filter of minimum quality ratings
  if (rating) {
    whereCondition.rating = { gte: parseFloat(`${rating}`) };
  }

  // 4. Enforce financial boundaries
  if (minPrice || maxPrice) {
    whereCondition.price = {};
    if (minPrice) whereCondition.price.gte = parseFloat(`${minPrice}`);
    if (maxPrice) whereCondition.price.lte = parseFloat(`${maxPrice}`);
  }

  // 5. Apply dynamic catalogs sorting styles
  let orderByCondition: any = { createdAt: 'desc' }; // default fallback
  if (sortBy) {
    switch (sortBy) {
      case 'popular':
        orderByCondition = { rating: 'desc' };
        break;
      case 'price-low':
        orderByCondition = { price: 'asc' };
        break;
      case 'price-high':
        orderByCondition = { price: 'desc' };
        break;
      case 'newest':
        orderByCondition = { createdAt: 'desc' };
        break;
    }
  }

  const products = await prisma.product.findMany({
    where: whereCondition,
    orderBy: orderByCondition,
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    products,
  });
});

/**
 * Fetch a singular book detail using its unique identifier
 */
export const getProductById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'The requested book could not be found within our sanctuary.',
    });
  }

  res.status(200).json({
    status: 'success',
    product,
  });
});
