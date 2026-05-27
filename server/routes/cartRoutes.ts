import { Router } from 'express';
import { getCart, addToCart, updateCartItemQuantity, removeCartItem, clearCart } from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Secure all access requests to shopping carts to verified JWT users only
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.patch('/quantity', updateCartItemQuantity);
router.delete('/:productId/:format', removeCartItem);
router.delete('/', (req, res, next) => {
  if (req.query.productId || req.body?.productId || req.body?.bookId) {
    return removeCartItem(req, res, next);
  }
  return clearCart(req, res, next);
});
router.delete('/clear', clearCart);

export default router;
