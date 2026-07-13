import { Pool } from 'pg';
import { config } from '../config/env';

const pool = new Pool({
  connectionString: config.dbUrl,
  ssl: { rejectUnauthorized: false }
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params)
};
