import React, { useState, useEffect } from 'react';
import { adminService } from '../../services';
import { Order } from '../../types';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Store,
  Users,
  IndianRupee,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await adminService.getDashboard();
        if (res.success && res.data) {
          setMetrics(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-gray-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Sales Revenue',
      value: `₹${metrics?.totalSales?.toLocaleString('en-IN') || 0}`,
      icon: IndianRupee,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: metrics?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-primary-500',
    },
    {
      title: 'Orders Today',
      value: metrics?.todayOrders || 0,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Action',
      value: metrics?.pendingOrders || 0,
      icon: Clock,
      color: 'bg-amber-500',
    },
    {
      title: 'Average Order Value',
      value: `₹${metrics?.averageOrderValue || 0}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Restaurants',
      value: metrics?.activeRestaurants || 0,
      icon: Store,
      color: 'bg-indigo-500',
    },
    {
      title: 'Registered Customers',
      value: metrics?.totalCustomers || 0,
      icon: Users,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-primary tracking-tight">
          Executive Overview
        </h1>
        <p className="text-xs text-dark-secondary mt-1">
          Real-time metrics computed directly from PostgreSQL database records.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-dark-secondary">{stat.title}</p>
                <p className="text-2xl font-black text-dark-primary mt-1">{stat.value}</p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl ${stat.color} text-white flex items-center justify-center shadow-sm`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-primary">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-dark-secondary font-bold uppercase tracking-wider border-y border-gray-100">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {metrics?.recentOrders?.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-dark-primary font-mono">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3 px-4">{ord.user?.name}</td>
                  <td className="py-3 px-4">{ord.restaurant?.name}</td>
                  <td className="py-3 px-4 font-bold text-dark-primary">₹{ord.totalAmount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        ord.status === 'DELIVERED'
                          ? 'bg-green-50 text-success'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-50 text-danger'
                          : 'bg-orange-50 text-primary-600'
                      }`}
                    >
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-dark-muted">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
