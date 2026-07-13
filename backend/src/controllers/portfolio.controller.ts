import { Request, Response, NextFunction } from 'express';
import * as portfolioService from '../services/portfolio.service';

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const summary = await portfolioService.fetchSummary(userId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};
