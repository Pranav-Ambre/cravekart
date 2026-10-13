import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services';
import { Order } from '../types';
import { useToast } from '../context/ToastContext';
import {
  Clock,
  CheckCircle2,
  Package,
  Bike,
  AlertCircle,
  ArrowLeft,
  XCircle,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/common/Button';

const STATUS_STEPS = [
  { status: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Preparing Food', icon: Package },
  { status: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: CheckCircle2 },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

export const OrderTrackingPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const { success, error } = useToast();

  const fetchOrder = async (showLoading = false) => {
    if (!identifier) return;
    if (showLoading) setIsLoading(true);
    try {
      const res = await orderService.getOrder(identifier);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load order:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder(true);

    // Auto-polling every 6 seconds to update live status
    const interval = setInterval(() => {
      fetchOrder(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [identifier]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setIsCancelling(true);
    try {
      const res = await orderService.cancelOrder(order.id, 'Cancelled by customer');
      if (res.success) {
        success('Order cancelled successfully.');
        fetchOrder(true);
      }
    } catch (err: any) {
      error(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
        <p className="text-xs text-dark-secondary">Loading live order tracking details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
        <h2 className="text-xl font-bold text-dark-primary">Order Not Found</h2>
        <p className="text-xs text-dark-secondary mt-1">Please verify the order number and try again.</p>
        <Link
          to="/customer/orders"
          className="mt-4 inline-block text-xs font-bold text-primary-600 hover:underline"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const canCancel = ['PENDING_CONFIRMATION', 'CONFIRMED'].includes(order.status);

  // Parse delivery address snapshot
  let deliveryAddress: any = null;
  try {
    deliveryAddress = JSON.parse(order.deliveryAddressJson);
  } catch (e) {
    deliveryAddress = null;
  }

  // Calculate current step index for the stepper
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header with back navigation and polling indicator */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-secondary hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Orders</span>
        </Link>

        <div className="flex items-center gap-2 text-[11px] text-dark-muted">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live Tracking Active</span>
          <button
            onClick={() => fetchOrder(false)}
            className="p-1 hover:text-dark-primary transition-colors"
            title="Refresh order status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Status Header Card */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-dark-muted">
                Order #{order.orderNumber}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  isCancelled
                    ? 'bg-red-50 text-danger border border-red-200'
                    : isDelivered
                    ? 'bg-green-50 text-success border border-green-200'
                    : 'bg-orange-50 text-primary-600 border border-orange-200'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-dark-primary">
              {isCancelled
                ? 'This order was cancelled'
                : isDelivered
                ? 'Order Delivered Safely'
                : 'Arriving in approximately 25-35 mins'}
            </h1>
          </div>

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelOrder}
              isLoading={isCancelling}
              className="text-danger border-red-200 hover:bg-red-50 self-start sm:self-auto"
            >
              Cancel Order
            </Button>
          )}
        </div>

        {/* Status Stepper (if not cancelled) */}
        {!isCancelled ? (
          <div className="py-4">
            <div className="grid grid-cols-5 relative">
              {/* Progress bar background line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%`,
                }}
              />

              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.status} className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-orange-100 scale-110' : ''}`}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-bold mt-2 max-w-[70px] sm:max-w-none leading-tight ${
                        isCurrent
                          ? 'text-primary-600'
                          : isPassed
                          ? 'text-dark-primary'
                          : 'text-dark-muted'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3">
            <XCircle className="w-6 h-6 text-danger flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-danger">Cancellation Confirmed</p>
              <p className="text-xs text-red-700 mt-0.5">
                {order.cancellationReason || 'Order was cancelled.'}
              </p>
            </div>
          </div>
        )}

        {/* Status History Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-muted mb-3">
              Status Timeline
            </h3>
            <div className="space-y-3">
              {order.statusHistory.map((hist) => (
                <div key={hist.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-dark-primary">{hist.status.replace(/_/g, ' ')}</p>
                    {hist.note && <p className="text-dark-secondary mt-0.5">{hist.note}</p>}
                  </div>
                  <span className="text-[11px] text-dark-muted">
                    {new Date(hist.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Details & Summary Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restaurant & Delivery Address Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-dark-muted">
            Delivery Details
          </h3>

          <div>
            <h4 className="text-sm font-bold text-dark-primary">{order.restaurant.name}</h4>
            <p className="text-xs text-dark-secondary">{order.restaurant.address}</p>
          </div>

          {deliveryAddress && (
            <div className="pt-3 border-t border-gray-100">
              <span className="text-[11px] font-bold uppercase text-primary-600 block mb-0.5">
                Delivering To ({deliveryAddress.label})
              </span>
              <p className="text-xs text-dark-secondary leading-relaxed">
                {deliveryAddress.street}
                {deliveryAddress.landmark ? `, Near ${deliveryAddress.landmark}` : ''},{' '}
                {deliveryAddress.city} - {deliveryAddress.postalCode}
              </p>
              {order.deliveryInstructions && (
                <p className="text-[11px] text-dark-muted italic mt-1">
                  Note: "{order.deliveryInstructions}"
                </p>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-dark-secondary">Payment Method:</span>
            <span className="font-bold text-dark-primary">
              {order.paymentMethod === 'RAZORPAY' ? 'Razorpay Online' : 'Cash on Delivery'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-dark-secondary">Payment Status:</span>
            <span
              className={`font-bold ${
                order.paymentStatus === 'PAID'
                  ? 'text-success'
                  : order.paymentStatus === 'FAILED'
                  ? 'text-danger'
                  : 'text-amber-600'
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Items Summary Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-dark-muted">
            Items Ordered
          </h3>

          <div className="space-y-2 text-xs divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-center">
                <span className="text-dark-primary font-medium">
                  {item.quantity}x {item.foodNameSnapshot}
                </span>
                <span className="font-bold text-dark-primary">₹{item.itemTotal}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-200 space-y-1.5 text-xs text-dark-secondary">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Packaging Fee</span>
              <span>₹{order.packagingFee}</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Taxes</span>
              <span>₹{order.taxAmount}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-success font-semibold">
                <span>Discount</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-dark-primary">
              <span>Total Paid / Payable</span>
              <span className="text-primary-600">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
