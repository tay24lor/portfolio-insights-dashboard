import { Router } from 'express';
import { getBenchmark, getCashflow, getPerformance, getRisk, getRebalancing, getSummary, getTransactions, getWatchlist } from '../controllers/portfolio.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/summary', authMiddleware, getSummary);
router.get('/performance', authMiddleware, getPerformance);
router.get('/benchmark', authMiddleware, getBenchmark);
router.get('/cashflow', authMiddleware, getCashflow);
router.get('/risk', authMiddleware, getRisk);
router.get('/rebalancing', authMiddleware, getRebalancing);
router.get('/watchlist', authMiddleware, getWatchlist);
router.get('/transactions', authMiddleware, getTransactions);

export default router;
