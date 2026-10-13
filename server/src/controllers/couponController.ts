import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';

const validateSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase(),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
});

export async function getActiveCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validUntil: { gt: new Date() },
      },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrderValue: true,
        maxDiscountAmount: true,
        validUntil: true,
      },
      orderBy: { discountValue: 'desc' },
    });

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
}

export async function validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, subtotal } = validateSchema.parse(req.body);

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      res.status(404).json({
        success: false,
        message: 'Invalid or inactive coupon code.',
      });
      return;
    }

    if (coupon.validUntil < new Date()) {
      res.status(400).json({
        success: false,
        message: 'This coupon code has expired.',
      });
      return;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({
        success: false,
        message: 'This coupon has reached its maximum redemption limit.',
      });
      return;
    }

    if (subtotal < coupon.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Cart subtotal must be at least ₹${coupon.minOrderValue} to use this coupon.`,
      });
      return;
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(Math.round(discount), subtotal);

    res.json({
      success: true,
      message: 'Coupon is valid!',
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderValue: coupon.minOrderValue,
          maxDiscountAmount: coupon.maxDiscountAmount,
        },
        discountAmount: discount,
      },
    });
  } catch (error) {
    next(error);
  }
}
