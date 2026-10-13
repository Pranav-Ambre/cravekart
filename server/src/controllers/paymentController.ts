import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { verifyRazorpaySignature, verifyWebhookSignature } from '../utils/paymentGateway';
import { AuthenticatedRequest } from '../middleware/auth';

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function verifyPayment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      verifyPaymentSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Check if already paid to prevent duplicate processing
    if ((order.paymentStatus as any) === 'PAID' || (order.paymentStatus as any) === 'SUCCESS') {
      res.json({
        success: true,
        message: 'Payment already verified.',
        data: order,
      });
      return;
    }

    // Cryptographic signature check
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      // Record failed payment attempt
      if (order.payment) {
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'FAILED',
            razorpayPaymentId,
            razorpaySignature,
          },
        });
      }

      res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.',
      });
      return;
    }

    // Atomically mark payment SUCCESS and order CONFIRMED
    const updated = await prisma.$transaction(async (tx) => {
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'SUCCESS',
            razorpayPaymentId,
            razorpaySignature,
          },
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID' as any,
          status: 'CONFIRMED',
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          note: `Payment verified successfully via Razorpay (Txn: ${razorpayPaymentId})`,
          changedByUserId: req.user!.id,
        },
      });

      return updatedOrder;
    });

    res.json({
      success: true,
      message: 'Payment verified and order confirmed!',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const bodyStr = JSON.stringify(req.body);

    if (!signature || !verifyWebhookSignature(bodyStr, signature)) {
      res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const rzpOrderId = paymentEntity.order_id;

      const paymentRecord = await prisma.payment.findFirst({
        where: { razorpayOrderId: rzpOrderId },
      });

      if (paymentRecord && paymentRecord.status !== 'SUCCESS') {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
              status: 'SUCCESS',
              razorpayPaymentId: paymentEntity.id,
            },
          }),
          prisma.order.update({
            where: { id: paymentRecord.orderId },
            data: {
              paymentStatus: 'PAID' as any,
              status: 'CONFIRMED',
            },
          }),
        ]);
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
}
