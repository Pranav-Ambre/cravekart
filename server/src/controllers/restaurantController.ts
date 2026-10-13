import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export async function getRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      search,
      cuisine,
      minRating,
      maxDeliveryTime,
      priceRange,
      vegOnly,
      sort = 'popularity',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isActive: true,
    };

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { cuisineTypes: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (cuisine && typeof cuisine === 'string') {
      where.cuisineTypes = { contains: cuisine };
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating as string) };
    }

    if (maxDeliveryTime) {
      where.deliveryTimeMax = { lte: parseInt(maxDeliveryTime as string, 10) };
    }

    if (priceRange && typeof priceRange === 'string') {
      where.priceRange = priceRange;
    }

    if (vegOnly === 'true') {
      where.foodItems = {
        some: {
          isVeg: true,
          isAvailable: true,
        },
      };
    }

    let orderBy: any = { rating: 'desc' };
    if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'deliveryTime') {
      orderBy = { deliveryTimeMin: 'asc' };
    } else if (sort === 'priceLow') {
      orderBy = { deliveryFee: 'asc' };
    } else if (sort === 'popularity') {
      orderBy = [{ isFeatured: 'desc' }, { reviewCount: 'desc' }];
    }

    const [total, restaurants] = await prisma.$transaction([
      prisma.restaurant.count({ where }),
      prisma.restaurant.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          cuisineTypes: true,
          address: true,
          city: true,
          rating: true,
          reviewCount: true,
          deliveryTimeMin: true,
          deliveryTimeMax: true,
          deliveryFee: true,
          minOrderAmount: true,
          priceRange: true,
          imageUrl: true,
          bannerUrl: true,
          isOpen: true,
          isFeatured: true,
          isActive: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: restaurants,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const featured = await prisma.restaurant.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: 8,
      orderBy: { rating: 'desc' },
    });

    res.json({
      success: true,
      data: featured,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRestaurantBySlugOrId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { idOrSlug } = req.params;

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
      },
      include: {
        foodCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            foodItems: {
              where: { isAvailable: true },
              include: {
                customizations: true,
              },
            },
          },
        },
        foodItems: {
          include: {
            customizations: true,
            category: true,
          },
        },
        operatingHours: true,
      },
    });

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
      return;
    }

    res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
}
