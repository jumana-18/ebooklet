import { Router } from 'express';
import { createReview, getProductReviews } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/:productId', getProductReviews);
router.post('/', protect, createReview);

export default router;
