import { Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';

/**
 * List all saved shipping address options for authorized user profile
 */
export const getAddresses = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  res.status(200).json({
    status: 'success',
    addresses,
  });
});

/**
 * Append or save a fresh delivery address profile
 */
export const createAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const { label, recipientName, street, city, province, zipCode, phone, isDefault } = req.body;

  if (!label || !recipientName || !street || !city || !zipCode || !phone) {
    return next(new AppError('Address submission is missing key fields.', 400));
  }

  // If this address is set to default, unset other addresses' isDefault properties
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  // Check if this is the user's very first address record. If yes, default it.
  const addressCount = await prisma.address.count({ where: { userId } });
  const finalIsDefault = addressCount === 0 ? true : !!isDefault;

  const newAddress = await prisma.address.create({
    data: {
      userId,
      label,
      recipientName,
      street,
      city,
      province: province || '',
      zipCode,
      phone,
      isDefault: finalIsDefault,
    },
  });

  res.status(201).json({
    status: 'success',
    address: newAddress,
  });
});

/**
 * Update particulars of an existing address
 */
export const updateAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { label, recipientName, street, city, province, zipCode, phone, isDefault } = req.body;

  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const address = await prisma.address.findFirst({
    where: { id, userId },
  });

  if (!address) {
    return next(new AppError('The requested address was not registered for this user.', 404));
  }

  // If setting this address to default, unset previous options
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true, NOT: { id } },
      data: { isDefault: false },
    });
  }

  const updatedAddress = await prisma.address.update({
    where: { id },
    data: {
      label: label !== undefined ? label : address.label,
      recipientName: recipientName !== undefined ? recipientName : address.recipientName,
      street: street !== undefined ? street : address.street,
      city: city !== undefined ? city : address.city,
      province: province !== undefined ? province : address.province,
      zipCode: zipCode !== undefined ? zipCode : address.zipCode,
      phone: phone !== undefined ? phone : address.phone,
      isDefault: isDefault !== undefined ? !!isDefault : address.isDefault,
    },
  });

  res.status(200).json({
    status: 'success',
    address: updatedAddress,
  });
});

/**
 * Remove an address and re-evaluate default address state
 */
export const deleteAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) return next(new AppError('No authenticated user context.', 401));

  const address = await prisma.address.findFirst({
    where: { id, userId },
  });

  if (!address) {
    return next(new AppError('Address could not be found.', 404));
  }

  await prisma.address.delete({
    where: { id },
  });

  // If we deleted the default address, promote another active address if present
  if (address.isDefault) {
    const backupAddress = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (backupAddress) {
      await prisma.address.update({
        where: { id: backupAddress.id },
        data: { isDefault: true },
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Address record purged successfully.',
  });
});
