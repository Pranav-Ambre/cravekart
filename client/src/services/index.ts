import api from './api';
import { ApiResponse, Restaurant, FoodItem, FoodCategory, Coupon, Order, Address } from '../types';

export const restaurantService = {
  getRestaurants: async (params?: Record<string, any>): Promise<ApiResponse<Restaurant[]>> => {
    const res = await api.get('/restaurants', { params });
    return res.data;
  },
  getFeatured: async (): Promise<ApiResponse<Restaurant[]>> => {
    const res = await api.get('/restaurants/featured');
    return res.data;
  },
  getBySlugOrId: async (idOrSlug: string): Promise<ApiResponse<Restaurant>> => {
    const res = await api.get(`/restaurants/${idOrSlug}`);
    return res.data;
  },
};

export const foodService = {
  getPopular: async (): Promise<ApiResponse<FoodItem[]>> => {
    const res = await api.get('/foods/popular');
    return res.data;
  },
  getCategories: async (): Promise<ApiResponse<FoodCategory[]>> => {
    const res = await api.get('/foods/categories');
    return res.data;
  },
  search: async (query: string): Promise<ApiResponse<{ restaurants: Restaurant[]; foods: FoodItem[] }>> => {
    const res = await api.get('/foods/search', { params: { q: query } });
    return res.data;
  },
  getById: async (id: string): Promise<ApiResponse<FoodItem>> => {
    const res = await api.get(`/foods/${id}`);
    return res.data;
  },
};

export const couponService = {
  getActive: async (): Promise<ApiResponse<Coupon[]>> => {
    const res = await api.get('/coupons/active');
    return res.data;
  },
  validate: async (code: string, subtotal: number): Promise<ApiResponse<{ coupon: Coupon; discountAmount: number }>> => {
    const res = await api.post('/coupons/validate', { code, subtotal });
    return res.data;
  },
};

export const orderService = {
  createOrder: async (data: any): Promise<ApiResponse<{ order: Order; razorpay?: any }>> => {
    const res = await api.post('/orders', data);
    return res.data;
  },
  getMyOrders: async (page = 1, limit = 10): Promise<ApiResponse<Order[]>> => {
    const res = await api.get('/orders/my-orders', { params: { page, limit } });
    return res.data;
  },
  getOrder: async (identifier: string): Promise<ApiResponse<Order>> => {
    const res = await api.get(`/orders/${identifier}`);
    return res.data;
  },
  cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<Order>> => {
    const res = await api.post(`/orders/${id}/cancel`, { reason });
    return res.data;
  },
};

export const paymentService = {
  verifyPayment: async (data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<ApiResponse<Order>> => {
    const res = await api.post('/payments/verify', data);
    return res.data;
  },
};

export const userService = {
  getAddresses: async (): Promise<ApiResponse<Address[]>> => {
    const res = await api.get('/users/addresses');
    return res.data;
  },
  addAddress: async (data: Omit<Address, 'id' | 'userId'>): Promise<ApiResponse<Address>> => {
    const res = await api.post('/users/addresses', data);
    return res.data;
  },
  updateAddress: async (id: string, data: Partial<Address>): Promise<ApiResponse<Address>> => {
    const res = await api.put(`/users/addresses/${id}`, data);
    return res.data;
  },
  deleteAddress: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/users/addresses/${id}`);
    return res.data;
  },
  getFavorites: async (): Promise<ApiResponse<any[]>> => {
    const res = await api.get('/users/favorites');
    return res.data;
  },
  toggleFavorite: async (params: { restaurantId?: string; foodItemId?: string }): Promise<ApiResponse<{ isFavorited: boolean }>> => {
    const res = await api.post('/users/favorites/toggle', params);
    return res.data;
  },
};

export const adminService = {
  getDashboard: async (): Promise<ApiResponse<any>> => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  getOrders: async (params?: Record<string, any>): Promise<ApiResponse<Order[]>> => {
    const res = await api.get('/admin/orders', { params });
    return res.data;
  },
  updateOrderStatus: async (id: string, status: string, note?: string): Promise<ApiResponse<Order>> => {
    const res = await api.patch(`/admin/orders/${id}/status`, { status, note });
    return res.data;
  },
  getRestaurants: async (): Promise<ApiResponse<Restaurant[]>> => {
    const res = await api.get('/admin/restaurants');
    return res.data;
  },
  createRestaurant: async (data: any): Promise<ApiResponse<Restaurant>> => {
    const res = await api.post('/admin/restaurants', data);
    return res.data;
  },
  updateRestaurant: async (id: string, data: any): Promise<ApiResponse<Restaurant>> => {
    const res = await api.put(`/admin/restaurants/${id}`, data);
    return res.data;
  },
  deleteRestaurant: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/admin/restaurants/${id}`);
    return res.data;
  },
  getFoods: async (restaurantId?: string): Promise<ApiResponse<FoodItem[]>> => {
    const res = await api.get('/admin/foods', { params: { restaurantId } });
    return res.data;
  },
  createFood: async (data: any): Promise<ApiResponse<FoodItem>> => {
    const res = await api.post('/admin/foods', data);
    return res.data;
  },
  updateFood: async (id: string, data: any): Promise<ApiResponse<FoodItem>> => {
    const res = await api.put(`/admin/foods/${id}`, data);
    return res.data;
  },
  deleteFood: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/admin/foods/${id}`);
    return res.data;
  },
  getCoupons: async (): Promise<ApiResponse<Coupon[]>> => {
    const res = await api.get('/admin/coupons');
    return res.data;
  },
  createCoupon: async (data: any): Promise<ApiResponse<Coupon>> => {
    const res = await api.post('/admin/coupons', data);
    return res.data;
  },
  updateCoupon: async (id: string, data: any): Promise<ApiResponse<Coupon>> => {
    const res = await api.put(`/admin/coupons/${id}`, data);
    return res.data;
  },
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  toggleUserStatus: async (id: string, isActive: boolean): Promise<ApiResponse<any>> => {
    const res = await api.patch(`/admin/users/${id}/status`, { isActive });
    return res.data;
  },
  getAuditLogs: async (): Promise<ApiResponse<any[]>> => {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },
};
