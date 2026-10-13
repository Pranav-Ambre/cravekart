import React, { useState, useEffect } from 'react';
import { adminService } from '../../services';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Search, Filter, Eye, ChevronRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

const STATUS_OPTIONS = [
  'ALL',
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const NEXT_STATUS_MAP: Record<string, string[]> = {
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { success, error } = useToast();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminService.getOrders(params);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await adminService.updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        success(`Order status updated to ${nextStatus}`);
        loadOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus as any } : null));
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-primary tracking-tight">
          Order Management
        </h1>
        <p className="text-xs text-dark-secondary mt-1">
          Review placed orders, customer details, and transition order workflow statuses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch}
            className="w-full bg-gray-50 border border-border rounded-xl py-2 pl-9 pr-3 text-xs text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-dark-secondary'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-dark-secondary font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-dark-muted">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-dark-muted">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord: any) => {
                  const nextAllowed = NEXT_STATUS_MAP[ord.status] || [];

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold font-mono text-dark-primary">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-dark-primary">{ord.user?.name}</p>
                        <p className="text-[11px] text-dark-muted">{ord.user?.phone || ord.user?.email}</p>
                      </td>
                      <td className="py-3 px-4">{ord.restaurant?.name}</td>
                      <td className="py-3 px-4 font-bold text-dark-primary">₹{ord.totalAmount}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-dark-primary block">
                          {ord.paymentMethod}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            ord.paymentStatus === 'PAID' ? 'text-success' : 'text-amber-600'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            ord.status === 'DELIVERED'
                              ? 'bg-green-50 text-success border border-green-200'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-50 text-danger border border-red-200'
                              : 'bg-orange-50 text-primary-600 border border-orange-200'
                          }`}
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 text-dark-secondary hover:text-dark-primary hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick advance status buttons */}
                          {nextAllowed.length > 0 && (
                            <select
                              value=""
                              disabled={updatingId === ord.id}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleUpdateStatus(ord.id, e.target.value);
                                }
                              }}
                              className="text-[11px] font-bold bg-primary-50 text-primary-700 border border-primary-200 rounded-lg py-1 px-2 focus:outline-none cursor-pointer"
                            >
                              <option value="">Update Status ▾</option>
                              {nextAllowed.map((st) => (
                                <option key={st} value={st}>
                                  ➔ {st.replace(/_/g, ' ')}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber}`}
          description={`Placed on ${new Date(selectedOrder.createdAt).toLocaleString()}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Status & Next step actions */}
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-dark-muted font-bold block">CURRENT STATUS</span>
                <span className="text-sm font-extrabold text-primary-600">
                  {selectedOrder.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex gap-2">
                {(NEXT_STATUS_MAP[selectedOrder.status] || []).map((st) => (
                  <Button
                    key={st}
                    size="sm"
                    variant={st === 'CANCELLED' ? 'danger' : 'primary'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                  >
                    Mark as {st.replace(/_/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-white border border-border rounded-xl">
              <div>
                <p className="font-bold text-dark-primary mb-1">Customer Info</p>
                <p>{(selectedOrder as any).user?.name}</p>
                <p className="text-dark-muted">{(selectedOrder as any).user?.email}</p>
                <p className="text-dark-muted">{(selectedOrder as any).user?.phone}</p>
              </div>
              <div>
                <p className="font-bold text-dark-primary mb-1">Delivery Address</p>
                <p className="text-dark-secondary">
                  {(() => {
                    try {
                      const a = JSON.parse(selectedOrder.deliveryAddressJson);
                      return `${a.street}, ${a.city} - ${a.postalCode}`;
                    } catch (e) {
                      return selectedOrder.deliveryAddressJson;
                    }
                  })()}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 border-t border-gray-100 pt-3">
              <p className="font-bold text-dark-primary">Items</p>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between py-1 border-b border-gray-50">
                  <span>
                    {item.quantity}x {item.foodNameSnapshot}
                  </span>
                  <span className="font-bold">₹{item.itemTotal}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-2 text-right space-y-1">
              <p>Subtotal: ₹{selectedOrder.subtotal}</p>
              <p>Delivery: ₹{selectedOrder.deliveryFee}</p>
              <p className="text-sm font-bold text-primary-600">
                Total: ₹{selectedOrder.totalAmount}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
