import React, { useState, useEffect } from 'react';
import { couponService } from '../services';
import { Coupon } from '../types';
import { Tag, Copy, Check, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const OffersPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { success } = useToast();

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await couponService.getActive();
        if (res.success) setCoupons(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOffers();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Copied coupon code ${code}!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Save on every order</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-primary tracking-tight">
          Deals, Coupons & Exclusive Offers
        </h1>
        <p className="text-xs sm:text-sm text-dark-secondary mt-1">
          Apply these verified promotional codes at checkout to unlock instant discounts.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-gray-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <Tag className="w-10 h-10 text-dark-muted mx-auto mb-2" />
          <h3 className="text-base font-bold text-dark-primary">No active offers right now</h3>
          <p className="text-xs text-dark-secondary mt-1">
            Check back soon for fresh seasonal promo codes and discounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-surface rounded-2xl border border-border p-6 shadow-sm hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-sm font-extrabold tracking-wider bg-orange-50 text-primary-600 px-3 py-1 rounded-xl border border-orange-200">
                    {coupon.code}
                  </span>
                  <span className="text-[11px] font-bold text-dark-muted">
                    Min Order: ₹{coupon.minOrderValue}
                  </span>
                </div>

                <h3 className="text-base font-bold text-dark-primary mb-1">
                  {coupon.discountType === 'PERCENTAGE'
                    ? `${coupon.discountValue}% Discount`
                    : `Flat ₹${coupon.discountValue} OFF`}
                </h3>
                <p className="text-xs text-dark-secondary leading-relaxed mb-4">
                  {coupon.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-dark-muted">
                  Valid until {new Date(coupon.validUntil).toLocaleDateString()}
                </span>
                <button
                  onClick={() => copyCode(coupon.code)}
                  className="flex items-center gap-1.5 font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200 transition-colors"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
