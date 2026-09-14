import { Pool } from 'pg';
import { config } from '../config/env';

const pool = config.dbUrl
  ? new Pool({
      connectionString: config.dbUrl,
      ssl: false
    })
  : null;

export default {
  query: (text: string, params?: unknown[]) => {
    if (!pool) {
      throw new Error('Database is not configured. Set DB_URL before saving portfolio data.');
    }

    return pool.query(text, params);
  }
};
