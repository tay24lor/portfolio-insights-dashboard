import { mockDb } from "../mock/mock.db";

export const fetchSummary = async (userId: number) => {
  return mockDb.getPortfolioSummary(userId);
};
