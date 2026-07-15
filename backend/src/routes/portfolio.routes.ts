import { Router } from 'express';
import { getPerformance, getSummary } from '../controllers/portfolio.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/summary', authMiddleware, getSummary);
router.get('/performance', authMiddleware, getPerformance);

export default router;
