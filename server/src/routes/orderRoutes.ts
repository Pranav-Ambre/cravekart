import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderByIdOrNumber,
  cancelOrder,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:identifier', getOrderByIdOrNumber);
router.post('/:id/cancel', cancelOrder);

export default router;
