import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

// Status transition matrix
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export async function getDashboardMetrics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      totalCustomers,
      activeRestaurants,
      paidOrdersAggregate,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { status: { in: ['PENDING_CONFIRMATION', 'CONFIRMED', 'PREPARING'] } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.restaurant.count({ where: { isActive: true } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
        where: {
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          restaurant: { select: { id: true, name: true } },
        },
      }),
    ]);

    const totalSales = Math.round(paidOrdersAggregate._sum.totalAmount || 0);
    const averageOrderValue = Math.round(paidOrdersAggregate._avg.totalAmount || 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        pendingOrders,
        totalCustomers,
        activeRestaurants,
        totalSales,
        averageOrderValue,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Order Management
export async function getAdminOrders(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status, search, page = '1', limit = '15' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          restaurant: { select: { id: true, name: true } },
          items: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: orders,
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

export async function updateOrderStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status, note } = z
      .object({
        status: z.string(),
        note: z.string().optional(),
      })
      .parse(req.body);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const allowedNext = VALID_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status transition from "${order.status}" to "${status}". Allowed transitions: ${
          allowedNext.length > 0 ? allowedNext.join(', ') : 'None (Terminal state)'
        }`,
      });
      return;
    }

    const updateData: any = { status };
    if (status === 'DELIVERED') {
      updateData.paymentStatus = 'PAID'; // If COD, mark paid upon delivery
    } else if (status === 'CANCELLED') {
      updateData.paymentStatus = ((order.paymentStatus as any) === 'PAID' || (order.paymentStatus as any) === 'SUCCESS') ? 'REFUNDED' : 'FAILED';
    }

    const updated = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: updateData,
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: status as any,
          note: note || `Status updated to ${status} by Admin`,
          changedByUserId: req.user?.id,
        },
      }),
    ]);

    await logAudit({
      userId: req.user?.id,
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'Order',
      entityId: id,
      details: { previousStatus: order.status, newStatus: status, note },
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
}

// Restaurant Management
export async function getAdminRestaurants(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { foodItems: true, orders: true },
        },
      },
    });

    res.json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
}

export async function createRestaurant(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schema = z.object({
      name: z.string().min(2),
      slug: z.string().min(2),
      description: z.string().min(5),
      cuisineTypes: z.string().min(2),
      address: z.string().min(3),
      city: z.string().default('Bengaluru'),
      deliveryTimeMin: z.number().int().default(25),
      deliveryTimeMax: z.number().int().default(35),
      deliveryFee: z.number().default(40),
      minOrderAmount: z.number().default(99),
      priceRange: z.string().default('₹₹'),
      imageUrl: z.string().url(),
      bannerUrl: z.string().url(),
      isOpen: z.boolean().default(true),
      isFeatured: z.boolean().default(false),
      isActive: z.boolean().default(true),
    });

    const data = schema.parse(req.body);

    const restaurant = await prisma.restaurant.create({
      data,
    });

    await logAudit({
      userId: req.user?.id,
      action: 'RESTAURANT_CREATED',
      entityType: 'Restaurant',
      entityId: restaurant.id,
      details: { name: restaurant.name },
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRestaurant(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: req.user?.id,
      action: 'RESTAURANT_UPDATED',
      entityType: 'Restaurant',
      entityId: id,
      details: updateData,
    });

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRestaurant(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    await prisma.restaurant.update({
      where: { id },
      data: { isActive: false },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'RESTAURANT_DEACTIVATED',
      entityType: 'Restaurant',
      entityId: id,
    });

    res.json({
      success: true,
      message: 'Restaurant deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
}

// Food Management
export async function getAdminFoods(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { restaurantId } = req.query;
    const where: any = {};
    if (restaurantId && typeof restaurantId === 'string') {
      where.restaurantId = restaurantId;
    }

    const foods = await prisma.foodItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        customizations: true,
      },
    });

    res.json({ success: true, data: foods });
  } catch (error) {
    next(error);
  }
}

export async function createFood(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schema = z.object({
      restaurantId: z.string().min(1),
      categoryId: z.string().min(1),
      name: z.string().min(2),
      description: z.string().min(5),
      price: z.number().min(1),
      isVeg: z.boolean().default(true),
      imageUrl: z.string().url(),
      isAvailable: z.boolean().default(true),
      isRecommended: z.boolean().default(false),
      preparationTimeMin: z.number().int().default(15),
      allergens: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const food = await prisma.foodItem.create({
      data: {
        restaurantId: data.restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        isVeg: data.isVeg,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable,
        isRecommended: data.isRecommended,
        preparationTimeMin: data.preparationTimeMin,
        allergens: data.allergens || null,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'FOOD_CREATED',
      entityType: 'FoodItem',
      entityId: food.id,
      details: { name: food.name, restaurantId: food.restaurantId },
    });

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: food,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateFood(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const food = await prisma.foodItem.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: req.user?.id,
      action: 'FOOD_UPDATED',
      entityType: 'FoodItem',
      entityId: id,
      details: updateData,
    });

    res.json({
      success: true,
      message: 'Food item updated successfully',
      data: food,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteFood(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    await prisma.foodItem.update({
      where: { id },
      data: { isAvailable: false },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'FOOD_DEACTIVATED',
      entityType: 'FoodItem',
      entityId: id,
    });

    res.json({
      success: true,
      message: 'Food item marked unavailable',
    });
  } catch (error) {
    next(error);
  }
}

// Coupon Management
export async function getAdminCoupons(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { redemptions: true } },
      },
    });

    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schema = z.object({
      code: z.string().min(3).toUpperCase(),
      description: z.string().min(5),
      discountType: z.enum(['PERCENTAGE', 'FIXED']),
      discountValue: z.number().min(1),
      minOrderValue: z.number().min(0).default(0),
      maxDiscountAmount: z.number().optional(),
      usageLimit: z.number().int().optional(),
      validUntil: z.string(),
      isActive: z.boolean().default(true),
    });

    const data = schema.parse(req.body);

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscountAmount: data.maxDiscountAmount || null,
        usageLimit: data.usageLimit || null,
        validUntil: new Date(data.validUntil),
        isActive: data.isActive,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'COUPON_CREATED',
      entityType: 'Coupon',
      entityId: coupon.id,
      details: { code: coupon.code },
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCoupon(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.validUntil) {
      updateData.validUntil = new Date(updateData.validUntil);
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: req.user?.id,
      action: 'COUPON_UPDATED',
      entityType: 'Coupon',
      entityId: id,
      details: updateData,
    });

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
}

// User Management
export async function getAdminUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    await logAudit({
      userId: req.user?.id,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: id,
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// Audit Logs
export async function getAuditLogs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}
