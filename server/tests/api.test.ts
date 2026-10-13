import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/db';

describe('CraveKart Backend API Suite', () => {
  let customerToken: string;
  let adminToken: string;
  let restaurantId: string;
  let foodItemId: string;

  beforeAll(async () => {
    // Authenticate demo customer
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul@example.com', password: 'Password123!' });
    customerToken = customerLogin.body.data?.token;

    // Authenticate admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@cravekart.com', password: 'AdminPassword123!' });
    adminToken = adminLogin.body.data?.token;

    // Fetch a sample restaurant and its food item
    const restRes = await request(app).get('/api/restaurants');
    restaurantId = restRes.body.data[0].id;

    const restDetail = await request(app).get(`/api/restaurants/${restaurantId}`);
    foodItemId = restDetail.body.data.foodItems[0].id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Health and Meta Endpoints', () => {
    it('GET /health returns healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('CraveKart API');
    });

    it('GET /api returns endpoint directory', async () => {
      const res = await request(app).get('/api');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.endpoints).toBeDefined();
    });
  });

  describe('2. Authentication Flow', () => {
    it('Customer login returns user profile and JWT token', async () => {
      expect(customerToken).toBeDefined();
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.email).toBe('rahul@example.com');
      expect(meRes.body.data.role).toBe('CUSTOMER');
    });

    it('Rejects invalid login credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'rahul@example.com', password: 'WrongPassword!' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Can register a new user account', async () => {
      const testEmail = `newuser_${Date.now()}@example.com`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'New Tester',
        email: testEmail,
        password: 'Password123!',
        phone: '+91 9988776655',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
    });
  });

  describe('3. Restaurant & Menu Discovery', () => {
    it('GET /api/restaurants returns paginated active restaurants', async () => {
      const res = await request(app).get('/api/restaurants');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
    });

    it('Supports filtering restaurants by query', async () => {
      const res = await request(app).get('/api/restaurants?search=Biryani');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].cuisineTypes).toMatch(/Biryani/i);
    });

    it('GET /api/restaurants/:idOrSlug returns restaurant with categories and menu items', async () => {
      const res = await request(app).get(`/api/restaurants/${restaurantId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(restaurantId);
      expect(Array.isArray(res.body.data.foodItems)).toBe(true);
    });

    it('GET /api/foods/popular returns top dishes', async () => {
      const res = await request(app).get('/api/foods/popular');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].price).toBeGreaterThan(0);
    });

    it('GET /api/foods/search returns matching results', async () => {
      const res = await request(app).get('/api/foods/search?q=pizza');
      expect(res.status).toBe(200);
      expect(res.body.data.foods).toBeDefined();
      expect(res.body.data.restaurants).toBeDefined();
    });
  });

  describe('4. Coupons & Price Calculations', () => {
    it('GET /api/coupons/active returns available discount codes', async () => {
      const res = await request(app).get('/api/coupons/active');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Validates coupon CRAVE50 and calculates discount', async () => {
      const res = await request(app).post('/api/coupons/validate').send({
        code: 'CRAVE50',
        subtotal: 500,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.discountAmount).toBe(100); // capped at 100
    });

    it('Rejects coupon if subtotal is below minimum order value', async () => {
      const res = await request(app).post('/api/coupons/validate').send({
        code: 'CRAVE50',
        subtotal: 100, // min is 199
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. Checkout & Order Flow', () => {
    it('Creates an order with COD payment', async () => {
      const orderPayload = {
        restaurantId,
        items: [
          {
            foodItemId,
            quantity: 2,
          },
        ],
        deliveryAddress: {
          label: 'Home',
          street: '123 Main Street',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560034',
        },
        deliveryInstructions: 'Call on arrival',
        paymentMethod: 'COD',
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.orderNumber).toMatch(/^CK-/);
      expect(res.body.data.order.status).toBe('CONFIRMED');
      expect(res.body.data.order.paymentMethod).toBe('COD');
    });

    it('Allows customer to fetch their order history', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('6. Role-Based Access Control & Admin Operations', () => {
    it('Blocks non-admin customer from accessing /api/admin/dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('Allows admin to fetch real DB dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalOrders).toBeGreaterThan(0);
      expect(res.body.data.totalSales).toBeGreaterThan(0);
      expect(res.body.data.activeRestaurants).toBeGreaterThan(0);
    });

    it('Allows admin to fetch all orders with status filter', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
