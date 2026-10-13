import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { createRazorpayOrder } from '../utils/paymentGateway';

const orderItemSchema = z.object({
  foodItemId: z.string().min(1),
  quantity: z.number().int().min(1),
  selectedOptions: z
    .array(
      z.object({
        groupId: z.string(),
        groupTitle: z.string(),
        optionId: z.string(),
        optionName: z.string(),
        price: z.number().min(0),
      })
    )
    .optional(),
});

const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z.array(orderItemSchema).min(1, 'Cart cannot be empty'),
  deliveryAddress: z.object({
    label: z.string(),
    street: z.string(),
    landmark: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
  }),
  deliveryInstructions: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['RAZORPAY', 'COD']),
});

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CK-${dateStr}-${randomSuffix}`;
}

export async function createOrder(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const data = createOrderSchema.parse(req.body);

    // 1. Verify restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    });

    if (!restaurant || !restaurant.isActive) {
      res.status(400).json({
        success: false,
        message: 'The selected restaurant is currently unavailable.',
      });
      return;
    }

    // 2. Fetch all food items from DB to prevent tampering
    const itemIds = data.items.map((i) => i.foodItemId);
    const dbFoodItems = await prisma.foodItem.findMany({
      where: {
        id: { in: itemIds },
        restaurantId: restaurant.id,
      },
      include: {
        customizations: true,
      },
    });

    if (dbFoodItems.length !== itemIds.length) {
      res.status(400).json({
        success: false,
        message: 'Some items in your cart do not belong to this restaurant or are no longer valid.',
      });
      return;
    }

    const unavailableItem = dbFoodItems.find((f) => !f.isAvailable);
    if (unavailableItem) {
      res.status(400).json({
        success: false,
        message: `"${unavailableItem.name}" is currently sold out. Please remove it to proceed.`,
      });
      return;
    }

    // 3. Compute accurate server-side subtotal & item details
    let calculatedSubtotal = 0;
    const validatedOrderItems: {
      foodItemId: string;
      foodNameSnapshot: string;
      foodPriceSnapshot: number;
      quantity: number;
      selectedOptionsJson: string | null;
      itemTotal: number;
    }[] = [];

    for (const item of data.items) {
      const dbFood = dbFoodItems.find((f) => f.id === item.foodItemId)!;
      let unitPrice = dbFood.price;

      // Validate customizations against DB customizations
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        for (const opt of item.selectedOptions) {
          const custGroup = dbFood.customizations.find((c) => c.id === opt.groupId);
          if (custGroup) {
            try {
              const optionsParsed = JSON.parse(custGroup.optionsJson) as Array<{
                id: string;
                price: number;
              }>;
              const matchedOption = optionsParsed.find((o) => o.id === opt.optionId);
              if (matchedOption) {
                unitPrice += matchedOption.price;
              }
            } catch (e) {
              unitPrice += opt.price;
            }
          }
        }
      }

      const itemTotal = unitPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedOrderItems.push({
        foodItemId: dbFood.id,
        foodNameSnapshot: dbFood.name,
        foodPriceSnapshot: unitPrice,
        quantity: item.quantity,
        selectedOptionsJson: item.selectedOptions ? JSON.stringify(item.selectedOptions) : null,
        itemTotal,
      });
    }

    // 4. Calculate delivery fee, packaging fee, tax
    const deliveryFee = calculatedSubtotal >= 499 ? 0 : restaurant.deliveryFee;
    const packagingFee = 20.0;
    const taxAmount = Math.round(calculatedSubtotal * 0.05);

    // 5. Validate coupon
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });

      if (
        coupon &&
        coupon.isActive &&
        coupon.validUntil >= new Date() &&
        calculatedSubtotal >= coupon.minOrderValue &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
      ) {
        appliedCoupon = coupon;
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (calculatedSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(Math.round(discountAmount), calculatedSubtotal);
      }
    }

    const totalAmount = Math.max(
      0,
      calculatedSubtotal + deliveryFee + packagingFee + taxAmount - discountAmount
    );

    // Estimated delivery time: 35 minutes from now
    const estimatedDeliveryTime = new Date(Date.now() + 35 * 60 * 1000);
    const orderNumber = generateOrderNumber();

    // Initial status: COD is CONFIRMED immediately, Razorpay is PENDING_CONFIRMATION until verified
    const initialStatus =
      data.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING_CONFIRMATION';
    const initialPaymentStatus = data.paymentMethod === 'COD' ? 'PENDING' : 'PENDING';

    // 6. DB Transaction to create Order, OrderItems, OrderStatusHistory, CouponRedemption
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user!.id,
          restaurantId: restaurant.id,
          status: initialStatus,
          deliveryAddressJson: JSON.stringify(data.deliveryAddress),
          deliveryInstructions: data.deliveryInstructions || null,
          subtotal: calculatedSubtotal,
          deliveryFee,
          packagingFee,
          taxAmount,
          discountAmount,
          totalAmount,
          paymentStatus: initialPaymentStatus,
          paymentMethod: data.paymentMethod,
          estimatedDeliveryTime,
          items: {
            create: validatedOrderItems,
          },
          statusHistory: {
            create: {
              status: initialStatus,
              note:
                data.paymentMethod === 'COD'
                  ? 'Order placed with Cash on Delivery'
                  : 'Order created, awaiting payment confirmation',
              changedByUserId: req.user!.id,
            },
          },
        },
        include: {
          items: true,
          restaurant: {
            select: { id: true, name: true, imageUrl: true, address: true },
          },
        },
      });

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponRedemption.create({
          data: {
            couponId: appliedCoupon.id,
            userId: req.user!.id,
            orderId: created.id,
            discountApplied: discountAmount,
          },
        });
      }

      return created;
    });

    // 7. Handle payment flow
    let razorpayDetails: any = null;
    if (data.paymentMethod === 'RAZORPAY') {
      const rzpOrder = await createRazorpayOrder({
        amount: totalAmount,
        orderId: order.orderNumber,
        notes: {
          orderId: order.id,
          userId: req.user.id,
        },
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'RAZORPAY',
          razorpayOrderId: rzpOrder.id,
          amount: totalAmount,
          currency: 'INR',
          status: 'PENDING',
        },
      });

      razorpayDetails = {
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
        isTestMode: rzpOrder.isTestMode,
      };
    } else {
      // COD Payment record
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'CASH_ON_DELIVERY',
          amount: totalAmount,
          currency: 'INR',
          status: 'PENDING',
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      data: {
        order,
        razorpay: razorpayDetails,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where: { userId: req.user.id } }),
      prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          restaurant: {
            select: { id: true, name: true, slug: true, imageUrl: true, address: true },
          },
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
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

export async function getOrderByIdOrNumber(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { identifier } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: identifier }, { orderNumber: identifier }],
        // If not admin, restrict to own order
        ...(req.user.role !== 'ADMIN' ? { userId: req.user.id } : {}),
      },
      include: {
        restaurant: true,
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        payment: true,
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(
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
    const { reason } = z.object({ reason: z.string().optional() }).parse(req.body);

    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(req.user.role !== 'ADMIN' ? { userId: req.user.id } : {}),
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (!['PENDING_CONFIRMATION', 'CONFIRMED'].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: 'Order can only be cancelled before food preparation has started.',
      });
      return;
    }

    const updated = await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason || 'Cancelled by customer',
          paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED',
        },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CANCELLED',
          note: reason || 'Order cancelled by user',
          changedByUserId: req.user.id,
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Order cancelled successfully.',
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
}
