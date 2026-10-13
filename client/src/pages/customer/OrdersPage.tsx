import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services';
import { Order } from '../../types';
import { Package, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { clearCart, addItem } = useCart();
  const { info } = useToast();

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await orderService.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleReorder = (order: Order) => {
    navigate(`/restaurants/${order.restaurant.slug || order.restaurantId}`);
    info(`Redirected to ${order.restaurant.name} to view current menu & reorder.`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-8 h-8" />}
        title="No Orders Yet"
        description="You haven't placed any food orders on CraveKart yet. Pick something tasty from our featured restaurants!"
        actionLabel="Explore Restaurants"
        onAction={() => navigate('/restaurants')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-dark-primary">My Orders</h2>
        <p className="text-xs text-dark-secondary mt-0.5">
          View your active food deliveries and past order history.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isOngoing = !['DELIVERED', 'CANCELLED'].includes(order.status);

          return (
            <div
              key={order.id}
              className={`p-5 rounded-2xl border transition-all ${
                isOngoing
                  ? 'border-orange-300 bg-orange-50/20 shadow-sm'
                  : 'border-border bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={order.restaurant.imageUrl}
                      alt={order.restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-dark-primary">
                      {order.restaurant.name}
                    </h3>
                    <p className="text-[11px] text-dark-muted">
                      Order #{order.orderNumber} •{' '}
                      {new Date(order.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full self-start sm:self-auto ${
                    order.status === 'DELIVERED'
                      ? 'bg-green-50 text-success border border-green-200'
                      : order.status === 'CANCELLED'
                      ? 'bg-red-50 text-danger border border-red-200'
                      : 'bg-orange-50 text-primary-600 border border-orange-200 animate-pulse'
                  }`}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Items Summary */}
              <div className="py-3 text-xs text-dark-secondary">
                <p className="font-semibold text-dark-primary mb-1">
                  {order.items
                    .map((i) => `${i.quantity}x ${i.foodNameSnapshot}`)
                    .join(', ')}
                </p>
                <p className="text-dark-muted">Total Paid: ₹{order.totalAmount}</p>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleReorder(order)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-primary hover:text-primary-600 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reorder</span>
                </button>

                <Link
                  to={`/orders/${order.orderNumber}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-200 transition-colors"
                >
                  <span>{isOngoing ? 'Track Live Delivery' : 'View Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
