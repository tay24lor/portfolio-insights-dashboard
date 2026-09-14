"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const env_1 = require("../config/env");
const pool = env_1.config.dbUrl
    ? new pg_1.Pool({
        connectionString: env_1.config.dbUrl,
        ssl: { rejectUnauthorized: false }
    })
    : null;
exports.default = {
    query: (text, params) => {
        if (!pool) {
            throw new Error('Database is not configured. Set DB_URL before saving portfolio data.');
        }
        return pool.query(text, params);
    }
};
