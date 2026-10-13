import React from 'react';
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Tag,
  Users,
  FileText,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-danger flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-dark-primary">Access Restricted</h2>
        <p className="text-sm text-dark-secondary mt-1 max-w-sm">
          You do not have administrative privileges to access this area.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-600 bg-primary-50 px-4 py-2.5 rounded-xl border border-primary-200 hover:bg-primary-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    );
  }

  const adminNav = [
    { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/restaurants', label: 'Restaurants', icon: Store },
    { to: '/admin/foods', label: 'Food Items', icon: UtensilsCrossed },
    { to: '/admin/coupons', label: 'Coupons', icon: Tag },
    { to: '/admin/users', label: 'Customers', icon: Users },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-secondary text-gray-300 flex-shrink-0 flex flex-col justify-between border-r border-gray-800">
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold">
                CK
              </div>
              <div>
                <span className="font-extrabold text-white text-base block leading-tight">
                  CraveKart
                </span>
                <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider block">
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>

          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-border h-16 px-6 flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-primary">CraveKart Management Console</h2>
          <div className="flex items-center gap-2 text-xs font-semibold text-dark-secondary">
            <span>Signed in as:</span>
            <span className="text-dark-primary font-bold">{user?.name}</span>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
