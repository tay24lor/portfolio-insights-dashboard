"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSummary = void 0;
const mock_db_1 = require("../mock/mock.db");
const fetchSummary = async (userId) => {
    return mock_db_1.mockDb.getPortfolioSummary(userId);
};
exports.fetchSummary = fetchSummary;
