import { Router } from 'express';
import { getHoldings } from '../controllers/holdings.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getHoldings);

export default router;
