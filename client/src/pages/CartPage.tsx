import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { couponService } from '../services';
import { useToast } from '../context/ToastContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  Bike,
  Sparkles,
} from 'lucide-react';
import { VegBadge } from '../components/food/VegBadge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export const CartPage: React.FC = () => {
  const {
    items,
    restaurantInfo,
    coupon,
    itemCount,
    subtotal,
    deliveryFee,
    packagingFee,
    taxAmount,
    discountAmount,
    totalAmount,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { error } = useToast();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const res = await couponService.validate(couponInput.trim().toUpperCase(), subtotal);
      if (res.success && res.data) {
        applyCoupon(res.data.coupon);
        setCouponInput('');
      }
    } catch (err: any) {
      error(err.message || 'Invalid coupon code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your Cart is Empty"
          description="Looks like you haven't added any delicious food yet. Explore our top restaurants to fill your cart!"
          actionLabel="Explore Restaurants"
          onAction={() => navigate('/restaurants')}
        />
      </div>
    );
  }

  // Free delivery threshold: ₹499
  const freeDeliveryThreshold = 499;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryPercentage = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-primary tracking-tight">
            Your Cart
          </h1>
          <p className="text-xs sm:text-sm text-dark-secondary mt-1">
            Ordering from <strong className="text-dark-primary">{restaurantInfo?.name}</strong> •{' '}
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-danger hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Free delivery tracker */}
          <div className="bg-orange-50/70 border border-orange-200 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold text-dark-primary mb-2">
              <span className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-primary-500" />
                {amountNeededForFreeDelivery > 0 ? (
                  <>
                    Add <strong className="text-primary-600">₹{amountNeededForFreeDelivery}</strong>{' '}
                    more for <strong>FREE Delivery</strong>
                  </>
                ) : (
                  <span className="text-success font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    You unlocked FREE Delivery!
                  </span>
                )}
              </span>
              <span>{freeDeliveryPercentage}%</span>
            </div>
            <div className="w-full bg-orange-200/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeDeliveryPercentage}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-border">
                  <img
                    src={item.foodItem.imageUrl}
                    alt={item.foodItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <VegBadge isVeg={item.foodItem.isVeg} />
                        <h4 className="text-sm font-bold text-dark-primary truncate">
                          {item.foodItem.name}
                        </h4>
                      </div>
                      <p className="text-xs font-semibold text-dark-primary">
                        ₹{item.unitPrice}
                      </p>
                    </div>

                    <p className="text-sm font-extrabold text-dark-primary">
                      ₹{item.totalPrice}
                    </p>
                  </div>

                  {/* Selected Customizations */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="mt-1.5 text-[11px] text-dark-muted flex flex-wrap gap-1">
                      {item.selectedOptions.map((opt, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-dark-secondary px-2 py-0.5 rounded"
                        >
                          {opt.optionName} {opt.price > 0 && `(+₹${opt.price})`}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-lg bg-white shadow-sm overflow-hidden text-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-100 text-dark-secondary"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 font-bold text-dark-primary">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-100 text-dark-secondary"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-dark-muted hover:text-danger transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-right">
            <Link
              to={`/restaurants/${restaurantInfo?.id}`}
              className="text-xs font-bold text-primary-600 hover:underline"
            >
              + Add more items from {restaurantInfo?.name}
            </Link>
          </div>
        </div>

        {/* Right Column: Coupon & Bill Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coupon Box */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-dark-primary flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary-500" />
              <span>Apply Coupon</span>
            </h3>

            {!coupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. CRAVE50)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-white border border-border rounded-xl py-2 px-3 text-xs uppercase font-bold text-dark-primary placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isValidatingCoupon}
                  disabled={!couponInput.trim()}
                >
                  Apply
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl text-xs">
                <div>
                  <p className="font-extrabold text-success">
                    {coupon.code} applied!
                  </p>
                  <p className="text-[11px] text-green-700 mt-0.5">
                    Saved ₹{discountAmount} on this order
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-dark-primary uppercase tracking-wider">
              Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs text-dark-secondary">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-semibold text-dark-primary">₹{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-success font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Restaurant Packaging & Service</span>
                <span>₹{packagingFee}</span>
              </div>

              <div className="flex justify-between">
                <span>GST and Restaurant Taxes (5%)</span>
                <span>₹{taxAmount}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-extrabold text-dark-primary">
                <span>To Pay</span>
                <span className="text-primary-600">₹{totalAmount}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              className="w-full mt-4"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Checkout • ₹{totalAmount}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-dark-muted pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>Safe and secure payments with Razorpay & COD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
