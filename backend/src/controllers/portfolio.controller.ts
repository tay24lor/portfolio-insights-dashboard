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

export const getPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const range = (req.query.range as string) || '1Y';
    const performance = await portfolioService.fetchPerformance(userId, range);
    res.json(performance);
  } catch (err) {
    next(err);
  }
};

export const getBenchmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const benchmark = await portfolioService.fetchBenchmark(userId);
    res.json(benchmark);
  } catch (err) {
    next(err);
  }
};

export const getCashflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const cashflow = await portfolioService.fetchCashflow(userId);
    res.json(cashflow);
  } catch (err) {
    next(err);
  }
};

export const getRisk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const risk = await portfolioService.fetchRisk(userId);
    res.json(risk);
  } catch (err) {
    next(err);
  }
};

export const getRebalancing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const recommendations = await portfolioService.fetchRecommendations(userId);
    res.json(recommendations);
  } catch (err) {
    next(err);
  }
};

export const getWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const watchlist = await portfolioService.fetchWatchlist(userId);
    res.json(watchlist);
  } catch (err) {
    next(err);
  }
};

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const transactions = await portfolioService.fetchTransactions(userId);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};
