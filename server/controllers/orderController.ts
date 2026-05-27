import { Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';
import { OrderStatus, BookFormat } from '@prisma/client';

/**
 * Defensive date to ISO string formatter to handle different databases,
 * raw string representations, memory-stores, or missing/undefined values gracefully.
 */
const formatIsoDate = (dValue: any): string => {
  if (!dValue) {
    return new Date().toISOString();
  }
  if (typeof dValue.toISOString === 'function') {
    return dValue.toISOString();
  }
  try {
    const parsed = new Date(dValue);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } catch (e) {
    // disregard error
  }
  return new Date().toISOString();
};

/**
 * Handle checkout and place a new purchase order
 */
export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const {
    items, // Array of { bookId, price, quantity, format }
    addressLabel,
    shipping, // { fullName, emailAddress, street, city, zipCode, deliveryMethod }
    payment,  // { selectedMethod, cardNumberMasked }
  } = req.body;

  if (!items || !items.length || !shipping || !payment) {
    return next(new AppError('Purchase request is missing checkout items or logistics details.', 400));
  }

  // 1. Calculate the subtotal securely to match database decimal mapping
  let calculatedTotal = 0;
  for (const item of items) {
    calculatedTotal += parseFloat(item.price) * parseInt(item.quantity, 10);
  }

  // 2. Generate a professional unique order number sequence (e.g. BKL-xxxxx-XX)
  const uniqueId = Math.floor(10000 + Math.random() * 90000);
  const regionChars = ['WS', 'EL', 'DF', 'US', 'EU'][Math.floor(Math.random() * 5)];
  const orderNumber = `BKL-${uniqueId}-${regionChars}`;

  // 3. Persist order in a database transaction
  const result = await prisma.$transaction(async (tx) => {
    // A. Put order records
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        total: calculatedTotal,
        status: OrderStatus.Processing,
        recipientName: shipping.fullName || 'Purchaser',
        emailAddress: shipping.emailAddress || req.user?.email || '',
        street: shipping.street || '',
        city: shipping.city || '',
        zipCode: shipping.zipCode || '',
        deliveryMethod: shipping.deliveryMethod || 'Standard Delivery',
        paymentMethod: payment.selectedMethod || 'Credit Card',
        cardNumberMasked: payment.cardNumberMasked || '•••• •••• •••• 1234',
        addressLabel: addressLabel || 'Standard Address',
        timeOfOrder: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        items: {
          create: items.map((item: any) => ({
            productId: item.bookId || item.id,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity, 10),
            format: (item.format || 'physical').toLowerCase() as BookFormat,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // B. Wipe cart items
    const userCart = await tx.cart.findUnique({
      where: { userId },
    });
    if (userCart) {
      await tx.cartItem.deleteMany({
        where: { cartId: userCart.id },
      });
    }

    // C. Register user streak / poetic points increase
    await tx.user.update({
      where: { id: userId },
      data: {
        streak: { increment: 1 },
        poeticPoints: { increment: 20 },
      },
    });

    // D. Log user activity
    await tx.userActivity.create({
      data: {
        userId,
        actionType: 'order_complete',
        bookTitle: items[0]?.title || 'Multiple books',
        metadata: { orderNumber, total: calculatedTotal },
      },
    });

    return order;
  });

  // 4. Format purchase response to align with existing state templates
  const formattedOrder = {
    id: result.id,
    orderNumber: result.orderNumber,
    date: formatIsoDate(result.date).split('T')[0],
    total: Number(result.total),
    status: result.status,
    addressLabel: result.addressLabel,
    timeOfOrder: result.timeOfOrder,
    items: result.items.map((item) => ({
      bookId: item.product.id,
      title: item.product.title,
      author: item.product.author,
      coverImage: item.product.coverImage,
      price: Number(item.price),
      quantity: item.quantity,
      format: item.format,
    })),
    shipping: {
      fullName: result.recipientName,
      emailAddress: result.emailAddress,
      street: result.street,
      city: result.city,
      zipCode: result.zipCode,
      deliveryMethod: result.deliveryMethod,
    },
    payment: {
      selectedMethod: result.paymentMethod,
      cardNumberMasked: result.cardNumberMasked,
    },
  };

  res.status(201).json({
    status: 'success',
    order: formattedOrder,
  });
});

/**
 * Fetch purchases catalog of the authenticated user
 */
export const getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { date: 'desc' },
  });

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    date: formatIsoDate(order.date).split('T')[0],
    total: Number(order.total),
    status: order.status,
    addressLabel: order.addressLabel,
    timeOfOrder: order.timeOfOrder,
    items: order.items.map((item) => ({
      bookId: item.product.id,
      title: item.product.title,
      author: item.product.author,
      coverImage: item.product.coverImage,
      price: Number(item.price),
      quantity: item.quantity,
      format: item.format,
    })),
    shipping: {
      fullName: order.recipientName,
      emailAddress: order.emailAddress,
      street: order.street,
      city: order.city,
      zipCode: order.zipCode,
      deliveryMethod: order.deliveryMethod,
    },
    payment: {
      selectedMethod: order.paymentMethod,
      cardNumberMasked: order.cardNumberMasked,
    },
  }));

  res.status(200).json({
    status: 'success',
    orders: formattedOrders,
  });
});

/**
 * Fetch detailed state for tracking a specific purchase order
 */
export const getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return next(new AppError('The requested purchase order details were not found.', 404));
  }

  const formattedOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    date: formatIsoDate(order.date).split('T')[0],
    total: Number(order.total),
    status: order.status,
    addressLabel: order.addressLabel,
    timeOfOrder: order.timeOfOrder,
    items: order.items.map((item) => ({
      bookId: item.product.id,
      title: item.product.title,
      author: item.product.author,
      coverImage: item.product.coverImage,
      price: Number(item.price),
      quantity: item.quantity,
      format: item.format,
    })),
    shipping: {
      fullName: order.recipientName,
      emailAddress: order.emailAddress,
      street: order.street,
      city: order.city,
      zipCode: order.zipCode,
      deliveryMethod: order.deliveryMethod,
    },
    payment: {
      selectedMethod: order.paymentMethod,
      cardNumberMasked: order.cardNumberMasked,
    },
  };

  res.status(200).json({
    status: 'success',
    order: formattedOrder,
  });
});
