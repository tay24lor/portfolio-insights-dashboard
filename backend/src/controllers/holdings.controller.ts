// holdings.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as holdingsService from '../services/holdings.service';

export const getHoldings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    const holdings = await holdingsService.fetchHoldings(userId);
    res.json(holdings);
  } catch (err) {
    next(err);
  }
}