"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSummary = void 0;
const mock_db_1 = require("../mock/mock.db");
const fetchSummary = async (userId) => {
    const summary = await mock_db_1.mockDb.getPortfolioSummary(userId);
    const holdings = await mock_db_1.mockDb.getHoldingsByUserId(userId);
    const totalValue = holdings.reduce((sum, holding) => sum + holding.shares * holding.current_price, 0);
    const allocation = holdings
        .map((holding) => {
        const value = holding.shares * holding.current_price;
        return {
            symbol: holding.symbol,
            value,
            percentage: totalValue > 0 ? Number(((value / totalValue) * 100).toFixed(1)) : 0
        };
    })
        .sort((a, b) => b.value - a.value);
    return {
        ...summary,
        allocation
    };
};
exports.fetchSummary = fetchSummary;
