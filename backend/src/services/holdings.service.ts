import { mockDb } from "../mock/mock.db";

export const fetchHoldings = async (userId: number) => {
  return mockDb.getHoldingsByUserId(userId);
};
