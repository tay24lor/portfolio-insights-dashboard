// holdings.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as holdingsService from '../services/holdings.service';
import { HoldingInput, HoldingUpdate } from '../models/Holding';

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const readHoldingInput = (body: unknown, partial = false): HoldingInput | HoldingUpdate => {
  const input = body as Record<string, unknown>;
  const result: HoldingUpdate = {};

  if (!partial || input.symbol !== undefined) {
    if (typeof input.symbol !== 'string' || !/^[A-Za-z.]{1,12}$/.test(input.symbol.trim())) {
      throw new Error('A valid symbol is required.');
    }
    result.symbol = input.symbol.trim();
  }

  for (const field of ['shares', 'avg_price', 'current_price'] as const) {
    if (!partial || input[field] !== undefined) {
      if (!isNonNegativeNumber(input[field])) throw new Error(`${field} must be a non-negative number.`);
      result[field] = input[field];
    }
  }

  return result as HoldingInput | HoldingUpdate;
};

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

export const postHolding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const holding = await holdingsService.createHolding(req.user.id, readHoldingInput(req.body) as HoldingInput);
    res.status(201).json(holding);
  } catch (err) {
    next(err);
  }
};

export const patchHolding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid holding id.' });

    const holding = await holdingsService.updateHolding(req.user.id, id, readHoldingInput(req.body, true));
    if (!holding) return res.status(404).json({ message: 'Holding not found.' });
    res.json(holding);
  } catch (err) {
    next(err);
  }
};

export const removeHolding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid holding id.' });

    const deleted = await holdingsService.deleteHolding(req.user.id, id);
    if (!deleted) return res.status(404).json({ message: 'Holding not found.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
