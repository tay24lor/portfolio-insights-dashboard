import { Router } from 'express';
import { getHoldings, patchHolding, postHolding, removeHolding } from '../controllers/holdings.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getHoldings);
router.post('/', authMiddleware, postHolding);
router.patch('/:id', authMiddleware, patchHolding);
router.delete('/:id', authMiddleware, removeHolding);

export default router;
