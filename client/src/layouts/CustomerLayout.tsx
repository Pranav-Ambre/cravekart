import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navLinks = [
    { to: '/customer/orders', label: 'My Orders', icon: Package },
    { to: '/customer/favorites', label: 'Favorites', icon: Heart },
    { to: '/customer/addresses', label: 'Saved Addresses', icon: MapPin },
    { to: '/customer/profile', label: 'Account Profile', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="w-full md:w-64 bg-surface rounded-2xl border border-border p-4 shadow-card flex-shrink-0">
          <div className="flex items-center gap-3 p-3 border-b border-gray-100 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary-500 text-white font-extrabold text-lg flex items-center justify-center shadow-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-dark-primary truncate">{user?.name}</h3>
              <p className="text-xs text-dark-muted truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 border border-primary-200'
                        : 'text-dark-secondary hover:bg-gray-50 hover:text-dark-primary'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-danger hover:bg-red-50 transition-colors text-left pt-2"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full bg-surface rounded-2xl border border-border p-6 shadow-card min-h-[500px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
