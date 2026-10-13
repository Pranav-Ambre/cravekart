import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

const addressSchema = z.object({
  label: z.string().default('Home'),
  street: z.string().min(3, 'Street is required'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  isDefault: z.boolean().default(false),
});

export async function getAddresses(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
}

export async function addAddress(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const data = addressSchema.parse(req.body);

    if (data.isDefault) {
      // Remove other defaults
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    } else {
      // If first address, make it default automatically
      const count = await prisma.address.count({ where: { userId: req.user.id } });
      if (count === 0) {
        data.isDefault = true;
      }
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        label: data.label,
        street: data.street,
        landmark: data.landmark || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        isDefault: data.isDefault,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const data = addressSchema.partial().parse(req.body);

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    await prisma.address.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Address removed successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getFavorites(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        restaurant: true,
        foodItem: {
          include: { restaurant: true },
        },
      },
    });

    res.json({ success: true, data: favorites });
  } catch (error) {
    next(error);
  }
}

export async function toggleFavorite(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { restaurantId, foodItemId } = z
      .object({
        restaurantId: z.string().optional(),
        foodItemId: z.string().optional(),
      })
      .parse(req.body);

    if (!restaurantId && !foodItemId) {
      res.status(400).json({ success: false, message: 'Specify restaurantId or foodItemId' });
      return;
    }

    const existing = await prisma.favorite.findFirst({
      where: {
        userId: req.user.id,
        restaurantId: restaurantId || null,
        foodItemId: foodItemId || null,
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ success: true, message: 'Removed from favorites', isFavorited: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId: req.user.id,
          restaurantId: restaurantId || null,
          foodItemId: foodItemId || null,
        },
      });
      res.json({ success: true, message: 'Added to favorites', isFavorited: true });
    }
  } catch (error) {
    next(error);
  }
}
