import { Router } from 'express';
import { getSummary } from '../controllers/portfolio.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/summary', authMiddleware, getSummary);

export default router;
