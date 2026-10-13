import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export async function getPopularDishes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dishes = await prisma.foodItem.findMany({
      where: {
        isAvailable: true,
        restaurant: {
          isActive: true,
        },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            deliveryFee: true,
            deliveryTimeMin: true,
          },
        },
        customizations: true,
      },
      orderBy: [{ isRecommended: 'desc' }, { rating: 'desc' }],
      take: 8,
    });

    res.json({
      success: true,
      data: dishes,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.foodCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { foodItems: true },
        },
      },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

export async function searchGlobal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      res.json({
        success: true,
        data: {
          restaurants: [],
          foods: [],
        },
      });
      return;
    }

    const trimmed = query.trim();

    const [restaurants, foods] = await Promise.all([
      prisma.restaurant.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: trimmed } },
            { cuisineTypes: { contains: trimmed } },
            { description: { contains: trimmed } },
          ],
        },
        take: 6,
        select: {
          id: true,
          name: true,
          slug: true,
          cuisineTypes: true,
          imageUrl: true,
          rating: true,
          deliveryTimeMin: true,
        },
      }),
      prisma.foodItem.findMany({
        where: {
          isAvailable: true,
          restaurant: { isActive: true },
          OR: [
            { name: { contains: trimmed } },
            { description: { contains: trimmed } },
          ],
        },
        take: 8,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
              deliveryFee: true,
            },
          },
          customizations: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        restaurants,
        foods,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFoodById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const food = await prisma.foodItem.findUnique({
      where: { id },
      include: {
        restaurant: true,
        category: true,
        customizations: true,
      },
    });

    if (!food) {
      res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
      return;
    }

    res.json({
      success: true,
      data: food,
    });
  } catch (error) {
    next(error);
  }
}
