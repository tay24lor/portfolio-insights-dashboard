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

export const fetchPerformance = async (userId: number) => {
  const summary = await mockDb.getPortfolioSummary(userId);
  const costBasis = summary.total_value * 0.9;
  const totalReturn = summary.total_value - costBasis;
  const returnRate = Number((((summary.total_value - costBasis) / costBasis) * 100).toFixed(1));

  return {
    total_return: totalReturn,
    return_rate: returnRate,
    trend: [
      { label: 'Jan', value: 55 },
      { label: 'Feb', value: 68 },
      { label: 'Mar', value: 72 },
      { label: 'Apr', value: 76 },
      { label: 'May', value: 80 },
      { label: 'Jun', value: 88 }
    ]
  };
};
