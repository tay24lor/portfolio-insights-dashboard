"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDb = void 0;
const mock_holdings_1 = require("./mock.holdings");
const mock_portfolio_1 = require("./mock.portfolio");
const mock_user_1 = require("./mock.user");
exports.mockDb = {
    getUserByEmail: async (email) => {
        if (email === mock_user_1.mockUser.email)
            return mock_user_1.mockUser;
        return null;
    },
    getHoldingsByUserId: async (userId) => {
        if (userId === mock_user_1.mockUser.id)
            return mock_holdings_1.mockHoldings;
        return [];
    },
    getPortfolioSummary: async (userId) => {
        if (userId === mock_user_1.mockUser.id)
            return mock_portfolio_1.mockPortfolioSummary;
        return { total_value: 0, holdings_count: 0 };
    }
};
