import dotenv from 'dotenv';
dotenv.config();

export const config = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  dbUrl: process.env.DB_URL || ''
};
