"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchHoldings = void 0;
const mock_db_1 = require("../mock/mock.db");
const fetchHoldings = async (userId) => {
    return mock_db_1.mockDb.getHoldingsByUserId(userId);
};
exports.fetchHoldings = fetchHoldings;
