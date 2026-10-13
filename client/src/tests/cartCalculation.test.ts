import { describe, it, expect } from 'vitest';

describe('CraveKart Cart Calculation Engine', () => {
  const calculateCartTotals = (
    items: Array<{ unitPrice: number; quantity: number }>,
    coupon?: { discountType: 'PERCENTAGE' | 'FIXED'; discountValue: number; maxDiscountAmount?: number; minOrderValue: number } | null
  ) => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const deliveryFee = subtotal >= 499 || items.length === 0 ? 0 : 40;
    const packagingFee = items.length > 0 ? 20 : 0;
    const taxAmount = Math.round(subtotal * 0.05);

    let discountAmount = 0;
    if (coupon && items.length > 0 && subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else {
        discountAmount = coupon.discountValue;
      }
      discountAmount = Math.min(Math.round(discountAmount), subtotal);
    }

    const totalAmount = Math.max(0, subtotal + deliveryFee + packagingFee + taxAmount - discountAmount);

    return {
      subtotal,
      deliveryFee,
      packagingFee,
      taxAmount,
      discountAmount,
      totalAmount,
    };
  };

  it('Calculates correct subtotal, taxes, and fees for standard order', () => {
    const items = [
      { unitPrice: 349, quantity: 1 }, // Biryani
      { unitPrice: 120, quantity: 1 }, // Idli
    ];
    const totals = calculateCartTotals(items);

    expect(totals.subtotal).toBe(469);
    expect(totals.deliveryFee).toBe(40); // < 499
    expect(totals.packagingFee).toBe(20);
    expect(totals.taxAmount).toBe(Math.round(469 * 0.05)); // 23
    expect(totals.discountAmount).toBe(0);
    expect(totals.totalAmount).toBe(469 + 40 + 20 + 23);
  });

  it('Applies free delivery when subtotal is >= ₹499', () => {
    const items = [
      { unitPrice: 349, quantity: 2 }, // 698
    ];
    const totals = calculateCartTotals(items);

    expect(totals.subtotal).toBe(698);
    expect(totals.deliveryFee).toBe(0); // Free delivery above 499!
  });

  it('Calculates percentage coupon with maximum discount cap', () => {
    const items = [{ unitPrice: 500, quantity: 1 }];
    const coupon = {
      discountType: 'PERCENTAGE' as const,
      discountValue: 50, // 50% = ₹250
      maxDiscountAmount: 100, // Capped at ₹100
      minOrderValue: 199,
    };
    const totals = calculateCartTotals(items, coupon);

    expect(totals.discountAmount).toBe(100);
  });

  it('Does not apply coupon if subtotal is below minimum order value', () => {
    const items = [{ unitPrice: 100, quantity: 1 }];
    const coupon = {
      discountType: 'PERCENTAGE' as const,
      discountValue: 50,
      minOrderValue: 299,
    };
    const totals = calculateCartTotals(items, coupon);

    expect(totals.discountAmount).toBe(0);
  });
});
