import { mockDb } from "../mock/mock.db";

export const fetchSummary = async (userId: number) => {
  const summary = await mockDb.getPortfolioSummary(userId);
  const holdings = await mockDb.getHoldingsByUserId(userId);
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
