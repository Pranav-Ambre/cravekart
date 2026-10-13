import { Router } from 'express';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getFavorites,
  toggleFavorite,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Addresses
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Favorites
router.get('/favorites', getFavorites);
router.post('/favorites/toggle', toggleFavorite);

export default router;
