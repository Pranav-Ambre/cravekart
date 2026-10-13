import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import prisma from './config/db';

// Route imports
import authRoutes from './routes/authRoutes';
import restaurantRoutes from './routes/restaurantRoutes';
import foodRoutes from './routes/foodRoutes';
import couponRoutes from './routes/couponRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

export const app = express();

// Security and middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (
        origin === env.CLIENT_URL ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(generalLimiter);

// Root welcome endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to CraveKart API! Server is running smoothly.',
    version: '1.0.0',
    status: 'online',
    healthCheck: '/health',
    apiRoot: '/api',
  });
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'CraveKart API',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: 'healthy',
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'degraded',
      service: 'CraveKart API',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Root API information
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to CraveKart API',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      foods: '/api/foods',
      coupons: '/api/coupons',
      orders: '/api/orders',
      payments: '/api/payments',
      users: '/api/users',
      admin: '/api/admin',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
