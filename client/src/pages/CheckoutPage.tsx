import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { userService, orderService, paymentService } from '../services';
import { Address } from '../types';
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';

export const CheckoutPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const {
    items,
    restaurantId,
    restaurantInfo,
    coupon,
    subtotal,
    deliveryFee,
    packagingFee,
    taxAmount,
    discountAmount,
    totalAmount,
    clearCart,
  } = useCart();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  // State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newState, setNewState] = useState('Karnataka');
  const [newPincode, setNewPincode] = useState('560034');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Test Razorpay Simulator Modal state
  const [testRazorpayModal, setTestRazorpayModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderNumber: string;
    razorpayOrderId: string;
    amount: number;
  } | null>(null);

  // Fetch saved addresses
  useEffect(() => {
    if (isAuthenticated) {
      userService.getAddresses().then((res) => {
        if (res.success && res.data) {
          setAddresses(res.data);
          const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          }
        }
      });
    }
  }, [isAuthenticated]);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-dark-primary">Your cart is empty</h2>
        <p className="text-xs text-dark-secondary mt-1">Please add items before proceeding to checkout.</p>
        <Link
          to="/restaurants"
          className="mt-4 inline-block text-xs font-bold text-primary-600 hover:underline"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) {
      error('Street address is required');
      return;
    }
    setIsSavingAddress(true);
    try {
      const res = await userService.addAddress({
        label: newLabel,
        street: newStreet.trim(),
        landmark: newLandmark.trim() || undefined,
        city: newCity,
        state: newState,
        postalCode: newPincode,
        isDefault: addresses.length === 0,
      });

      if (res.success && res.data) {
        setAddresses((prev) => [res.data, ...prev]);
        setSelectedAddressId(res.data.id);
        setIsAddressModalOpen(false);
        success('Address saved successfully');
        // Reset form
        setNewStreet('');
        setNewLandmark('');
      }
    } catch (err: any) {
      error(err.message || 'Failed to save address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      info('Please sign in to complete your order.');
      navigate('/login?redirect=/checkout');
      return;
    }

    const chosenAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!chosenAddress) {
      error('Please select or add a delivery address to continue.');
      return;
    }

    if (!restaurantId) {
      error('Invalid restaurant information.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        restaurantId,
        items: items.map((item) => ({
          foodItemId: item.foodItemId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
        })),
        deliveryAddress: {
          label: chosenAddress.label,
          street: chosenAddress.street,
          landmark: chosenAddress.landmark || undefined,
          city: chosenAddress.city,
          state: chosenAddress.state,
          postalCode: chosenAddress.postalCode,
        },
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        couponCode: coupon?.code,
        paymentMethod,
      };

      const res = await orderService.createOrder(orderPayload);
      if (!res.success) {
        throw new Error(res.message || 'Order creation failed');
      }

      const createdOrder = res.data.order;

      // Handle Payment Method
      if (paymentMethod === 'COD') {
        clearCart();
        success('Order placed successfully with Cash on Delivery!');
        navigate(`/orders/${createdOrder.orderNumber}`);
      } else if (paymentMethod === 'RAZORPAY') {
        const rzp = res.data.razorpay;

        // Open Razorpay Simulator / Modal
        setTestRazorpayModal({
          isOpen: true,
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          razorpayOrderId: rzp.razorpayOrderId,
          amount: createdOrder.totalAmount,
        });
      }
    } catch (err: any) {
      error(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!testRazorpayModal) return;

    setIsSubmitting(true);
    try {
      const simulatedPaymentId = `pay_test_${Date.now()}`;
      const simulatedSignature = `sig_test_${simulatedPaymentId}`;

      const verifyRes = await paymentService.verifyPayment({
        orderId: testRazorpayModal.orderId,
        razorpayOrderId: testRazorpayModal.razorpayOrderId,
        razorpayPaymentId: simulatedPaymentId,
        razorpaySignature: simulatedSignature,
      });

      if (verifyRes.success) {
        clearCart();
        setTestRazorpayModal(null);
        success('Payment verified! Order confirmed.');
        navigate(`/orders/${testRazorpayModal.orderNumber}`);
      }
    } catch (err: any) {
      error(err.message || 'Payment verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-primary tracking-tight mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Delivery Address Section */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                <h3 className="text-base font-bold text-dark-primary">Delivery Address</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddressModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add New
              </Button>
            </div>

            {!isAuthenticated ? (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-center space-y-2">
                <p className="text-xs text-dark-primary font-bold">
                  Please log in to choose your saved delivery address.
                </p>
                <Button size="sm" onClick={() => navigate('/login?redirect=/checkout')}>
                  Sign In to Continue
                </Button>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-dark-secondary mb-3">No saved addresses found.</p>
                <Button size="sm" onClick={() => setIsAddressModalOpen(true)}>
                  Add Delivery Address
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-2 border-primary-500 bg-primary-50/50 shadow-sm'
                          : 'border-border bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-primary-500' : 'border-gray-400'
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-dark-primary">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-gray-100 text-dark-muted px-1.5 py-0.2 rounded font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-dark-secondary mt-1.5 pl-6 leading-relaxed">
                        {addr.street}
                        {addr.landmark ? `, Near ${addr.landmark}` : ''}, {addr.city} -{' '}
                        {addr.postalCode}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Delivery Instructions */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-dark-primary flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-500" />
              <span>Delivery Instructions (Optional)</span>
            </h3>
            <textarea
              rows={2}
              placeholder="e.g. Please do not ring bell, leave at the door, or call when arrived..."
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              className="w-full bg-white border border-border rounded-xl p-3 text-xs text-dark-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {/* 3. Payment Method Section */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Lock className="w-4 h-4 text-primary-500" />
              <h3 className="text-base font-bold text-dark-primary">Payment Method</h3>
            </div>

            <div className="space-y-3">
              {/* Razorpay Online / Test Mode */}
              <div
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-2 border-primary-500 bg-primary-50/50 shadow-sm'
                    : 'border-border bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center mt-0.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'RAZORPAY' ? 'border-primary-500' : 'border-gray-400'
                    }`}
                  >
                    {paymentMethod === 'RAZORPAY' && (
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-dark-primary">
                      Razorpay Online Payment (UPI, Cards, NetBanking)
                    </span>
                    <CreditCard className="w-4 h-4 text-primary-600" />
                  </div>
                  <p className="text-[11px] text-dark-secondary mt-1">
                    Fast, secure, cryptographic signature verified transactions in Sandbox Test Mode.
                  </p>
                </div>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'COD'
                    ? 'border-2 border-primary-500 bg-primary-50/50 shadow-sm'
                    : 'border-border bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center mt-0.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-primary-500' : 'border-gray-400'
                    }`}
                  >
                    {paymentMethod === 'COD' && (
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-dark-primary">
                      Cash on Delivery (Pay upon arrival)
                    </span>
                    <Banknote className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-[11px] text-dark-secondary mt-1">
                    Pay with physical cash or delivery agent QR code at your door.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-dark-primary uppercase tracking-wider">
              Order Summary
            </h3>

            {/* Quick list of items */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs divide-y divide-gray-100">
              {items.map((i) => (
                <div key={i.id} className="pt-2 first:pt-0 flex justify-between items-center">
                  <span className="text-dark-primary font-medium truncate max-w-[180px]">
                    {i.quantity}x {i.foodItem.name}
                  </span>
                  <span className="font-bold text-dark-primary">₹{i.totalPrice}</span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-gray-200 space-y-2 text-xs text-dark-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Packaging Fee</span>
                <span>₹{packagingFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{taxAmount}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-extrabold text-dark-primary">
                <span>Total Payable</span>
                <span className="text-primary-600">₹{totalAmount}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              isLoading={isSubmitting}
              className="w-full mt-4"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Confirm Order • ₹{totalAmount}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-dark-muted pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>Safe and encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Delivery Address"
        maxWidth="md"
      >
        <form onSubmit={handleSaveNewAddress} className="space-y-4">
          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setNewLabel(label)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  newLabel === label
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white border-border text-dark-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <Input
            label="Street Address / House No."
            placeholder="Flat 101, Palm Grove, 4th Cross"
            required
            value={newStreet}
            onChange={(e) => setNewStreet(e.target.value)}
          />

          <Input
            label="Landmark (Optional)"
            placeholder="Near Metro Station or Market"
            value={newLandmark}
            onChange={(e) => setNewLandmark(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              required
            />
            <Input
              label="Pincode"
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSavingAddress}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>

      {/* Test Razorpay Payment Gateway Simulator Modal */}
      {testRazorpayModal && (
        <Modal
          isOpen={testRazorpayModal.isOpen}
          onClose={() => setTestRazorpayModal(null)}
          title="Razorpay Payment Gateway (Test Mode)"
          description={`Order #${testRazorpayModal.orderNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900 leading-relaxed">
              <p className="font-bold mb-1">Sandbox Payment Environment Active</p>
              <p>
                In test mode, Razorpay orders are securely generated on the backend and validated
                via HMAC SHA-256 signature verification.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-1.5 text-xs text-dark-secondary">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold text-dark-primary text-sm">
                  ₹{testRazorpayModal.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Razorpay Order ID:</span>
                <span className="font-mono text-dark-primary truncate max-w-[200px]">
                  {testRazorpayModal.razorpayOrderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="text-dark-primary font-semibold">{user?.name}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTestRazorpayModal(null)}
                disabled={isSubmitting}
              >
                Cancel Payment
              </Button>
              <Button
                size="md"
                onClick={handleSimulatePaymentSuccess}
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Simulate Payment Success (₹{testRazorpayModal.amount})
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
