import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';

// Layouts
import { RootLayout } from './layouts/RootLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { RestaurantsPage } from './pages/RestaurantsPage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OffersPage } from './pages/OffersPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Customer Pages
import { CustomerOrdersPage } from './pages/customer/OrdersPage';
import { CustomerAddressesPage } from './pages/customer/AddressesPage';
import { CustomerFavoritesPage } from './pages/customer/FavoritesPage';
import { CustomerProfilePage } from './pages/customer/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminRestaurantsPage } from './pages/admin/AdminRestaurantsPage';
import { AdminFoodsPage } from './pages/admin/AdminFoodsPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Storefront Routes */}
                  <Route element={<RootLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="restaurants" element={<RestaurantsPage />} />
                    <Route path="restaurants/:idOrSlug" element={<RestaurantDetailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="orders/:identifier" element={<OrderTrackingPage />} />
                    <Route path="offers" element={<OffersPage />} />
                    <Route path="about" element={<AboutPage />} />

                    {/* Auth */}
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />

                    {/* Customer Portal */}
                    <Route path="customer" element={<CustomerLayout />}>
                      <Route index element={<Navigate to="/customer/orders" replace />} />
                      <Route path="orders" element={<CustomerOrdersPage />} />
                      <Route path="addresses" element={<CustomerAddressesPage />} />
                      <Route path="favorites" element={<CustomerFavoritesPage />} />
                      <Route path="profile" element={<CustomerProfilePage />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Admin Portal (Isolated Layout) */}
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="restaurants" element={<AdminRestaurantsPage />} />
                    <Route path="foods" element={<AdminFoodsPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
