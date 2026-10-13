import { Router } from 'express';
import {
  getDashboardMetrics,
  getAdminOrders,
  updateOrderStatus,
  getAdminRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getAdminFoods,
  createFood,
  updateFood,
  deleteFood,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  getAdminUsers,
  toggleUserStatus,
  getAuditLogs,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticate, authorize(['ADMIN']));

// Overview Metrics
router.get('/dashboard', getDashboardMetrics);

// Order Management
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Restaurant Catalog
router.get('/restaurants', getAdminRestaurants);
router.post('/restaurants', createRestaurant);
router.put('/restaurants/:id', updateRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

// Food Catalog
router.get('/foods', getAdminFoods);
router.post('/foods', createFood);
router.put('/foods/:id', updateFood);
router.delete('/foods/:id', deleteFood);

// Coupon Management
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);

// User Management
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', toggleUserStatus);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

export default router;
