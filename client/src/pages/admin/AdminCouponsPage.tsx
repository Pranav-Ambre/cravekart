import React, { useState, useEffect } from 'react';
import { adminService } from '../../services';
import { Coupon } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Tag, Plus, Power } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useToast();

  // Form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrderValue, setMinOrderValue] = useState(199);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | ''>(100);
  const [validDays, setValidDays] = useState(30);
  const [isSaving, setIsSaving] = useState(false);

  const loadCoupons = async () => {
    try {
      const res = await adminService.getCoupons();
      if (res.success && res.data) {
        setCoupons(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSaving(true);
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + validDays);

      const res = await adminService.createCoupon({
        code: code.trim().toUpperCase(),
        description,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        maxDiscountAmount: maxDiscountAmount !== '' ? Number(maxDiscountAmount) : undefined,
        validUntil: expiry.toISOString(),
        isActive: true,
      });

      if (res.success) {
        success(`Coupon ${code} created successfully!`);
        setIsModalOpen(false);
        setCode('');
        setDescription('');
        loadCoupons();
      }
    } catch (err: any) {
      error(err.message || 'Failed to create coupon');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await adminService.updateCoupon(coupon.id, {
        isActive: !coupon.isActive,
      });
      if (res.success) {
        success(`Coupon "${coupon.code}" ${!coupon.isActive ? 'activated' : 'deactivated'}`);
        loadCoupons();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-primary tracking-tight">
            Coupon Management
          </h1>
          <p className="text-xs text-dark-secondary mt-1">
            Configure discount codes, percentage caps, minimum cart values, and validity periods.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Coupon
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-dark-secondary font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min Order</th>
                <th className="py-3 px-4">Max Cap</th>
                <th className="py-3 px-4">Redemptions</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-dark-muted">
                    Loading coupons...
                  </td>
                </tr>
              ) : (
                coupons.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-extrabold font-mono bg-orange-50 text-primary-600 px-2 py-0.5 rounded border border-orange-200">
                        {c.code}
                      </span>
                      <p className="text-[11px] text-dark-muted mt-0.5">{c.description}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-dark-primary">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="py-3 px-4">₹{c.minOrderValue}</td>
                    <td className="py-3 px-4">
                      {c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : 'No limit'}
                    </td>
                    <td className="py-3 px-4 font-bold">{c.usedCount || 0} used</td>
                    <td className="py-3 px-4 text-dark-muted">
                      {new Date(c.validUntil).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          c.isActive ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          c.isActive
                            ? 'text-danger hover:bg-red-50'
                            : 'text-success hover:bg-green-50'
                        }`}
                        title={c.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Coupon"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <Input
            label="Coupon Code"
            required
            placeholder="e.g. FESTIVE30"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />

          <Input
            label="Description"
            required
            placeholder="30% OFF up to ₹150 on your favorite meals"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-dark-primary mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-white border border-border rounded-xl p-2.5 text-xs font-semibold text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>

            <Input
              label={discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
              type="number"
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Order Subtotal (₹)"
              type="number"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(Number(e.target.value))}
            />

            <Input
              label="Max Discount Cap (₹)"
              type="number"
              placeholder="Optional"
              value={maxDiscountAmount}
              onChange={(e) =>
                setMaxDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>

          <Input
            label="Validity (Days from today)"
            type="number"
            value={validDays}
            onChange={(e) => setValidDays(Number(e.target.value))}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSaving}>
              Save Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
