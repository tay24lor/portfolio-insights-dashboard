"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const env_1 = require("../config/env");
const pool = new pg_1.Pool({
    connectionString: env_1.config.dbUrl,
    ssl: { rejectUnauthorized: false }
});
exports.default = {
    query: (text, params) => pool.query(text, params)
};
