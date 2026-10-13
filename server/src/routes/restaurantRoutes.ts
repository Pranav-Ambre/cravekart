import { Router } from 'express';
import {
  getRestaurants,
  getFeaturedRestaurants,
  getRestaurantBySlugOrId,
} from '../controllers/restaurantController';

const router = Router();

router.get('/', getRestaurants);
router.get('/featured', getFeaturedRestaurants);
router.get('/:idOrSlug', getRestaurantBySlugOrId);

export default router;
