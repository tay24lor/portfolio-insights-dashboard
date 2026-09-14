import db from '../db';
import { Holding, HoldingInput, HoldingUpdate } from '../models/Holding';

export const fetchHoldings = async (userId: number): Promise<Holding[]> => {
  const result = await db.query(
    `SELECT id, user_id, symbol, shares, avg_price, current_price
     FROM holdings
     WHERE user_id = $1
     ORDER BY symbol`,
    [userId]
  );
  return result.rows;
};

export const createHolding = async (userId: number, input: HoldingInput): Promise<Holding> => {
  const result = await db.query(
    `INSERT INTO holdings (user_id, symbol, shares, avg_price, current_price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, symbol, shares, avg_price, current_price`,
    [userId, input.symbol.toUpperCase(), input.shares, input.avg_price, input.current_price]
  );
  return result.rows[0];
};

export const updateHolding = async (userId: number, id: number, input: HoldingUpdate): Promise<Holding | null> => {
  const fields = Object.entries(input).filter(([, value]) => value !== undefined);
  if (!fields.length) return null;

  const permittedFields = new Set(['symbol', 'shares', 'avg_price', 'current_price']);
  if (fields.some(([field]) => !permittedFields.has(field))) {
    throw new Error('Invalid holding field.');
  }

  const values = fields.map(([field, value]) => field === 'symbol' ? String(value).toUpperCase() : value);
  const assignments = fields.map(([field], index) => `${field} = $${index + 1}`).join(', ');
  const result = await db.query(
    `UPDATE holdings
     SET ${assignments}, updated_at = now()
     WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
     RETURNING id, user_id, symbol, shares, avg_price, current_price`,
    [...values, id, userId]
  );
  return result.rows[0] ?? null;
};

export const deleteHolding = async (userId: number, id: number): Promise<boolean> => {
  const result = await db.query('DELETE FROM holdings WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rowCount === 1;
};
