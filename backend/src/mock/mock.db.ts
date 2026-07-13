import { mockHoldings } from "./mock.holdings";
import { mockPortfolioSummary } from "./mock.portfolio";
import { mockUser } from "./mock.user";

export const mockDb = {
  getUserByEmail: async (email: string) => {
    if (email === mockUser.email) return mockUser;
    return null;
  },

  getHoldingsByUserId: async (userId: number) => {
    if (userId === mockUser.id) return mockHoldings;
    return [];
  },

  getPortfolioSummary: async (userId: number) => {
    if (userId === mockUser.id) return mockPortfolioSummary;
    return { total_value: 0, holdings_count: 0 };
  }
};
