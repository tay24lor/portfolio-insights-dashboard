"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHolding = exports.updateHolding = exports.createHolding = exports.fetchHoldings = void 0;
const db_1 = __importDefault(require("../db"));
const fetchHoldings = async (userId) => {
    const result = await db_1.default.query(`SELECT id, user_id, symbol, shares, avg_price, current_price
     FROM holdings
     WHERE user_id = $1
     ORDER BY symbol`, [userId]);
    return result.rows;
};
exports.fetchHoldings = fetchHoldings;
const createHolding = async (userId, input) => {
    const result = await db_1.default.query(`INSERT INTO holdings (user_id, symbol, shares, avg_price, current_price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, symbol, shares, avg_price, current_price`, [userId, input.symbol.toUpperCase(), input.shares, input.avg_price, input.current_price]);
    return result.rows[0];
};
exports.createHolding = createHolding;
const updateHolding = async (userId, id, input) => {
    const fields = Object.entries(input).filter(([, value]) => value !== undefined);
    if (!fields.length)
        return null;
    const permittedFields = new Set(['symbol', 'shares', 'avg_price', 'current_price']);
    if (fields.some(([field]) => !permittedFields.has(field))) {
        throw new Error('Invalid holding field.');
    }
    const values = fields.map(([field, value]) => field === 'symbol' ? String(value).toUpperCase() : value);
    const assignments = fields.map(([field], index) => `${field} = $${index + 1}`).join(', ');
    const result = await db_1.default.query(`UPDATE holdings
     SET ${assignments}, updated_at = now()
     WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
     RETURNING id, user_id, symbol, shares, avg_price, current_price`, [...values, id, userId]);
    return result.rows[0] ?? null;
};
exports.updateHolding = updateHolding;
const deleteHolding = async (userId, id) => {
    const result = await db_1.default.query('DELETE FROM holdings WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rowCount === 1;
};
exports.deleteHolding = deleteHolding;
