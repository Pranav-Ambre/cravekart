import { Router } from 'express';
import {
  getPopularDishes,
  getCategories,
  searchGlobal,
  getFoodById,
} from '../controllers/foodController';

const router = Router();

router.get('/popular', getPopularDishes);
router.get('/categories', getCategories);
router.get('/search', searchGlobal);
router.get('/:id', getFoodById);

export default router;
