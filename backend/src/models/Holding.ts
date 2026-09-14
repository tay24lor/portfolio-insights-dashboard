export interface Holding {
  id: number;
  user_id: number;
  symbol: string;
  shares: number;
  avg_price: number;
  current_price: number;
}

export interface HoldingInput {
  symbol: string;
  shares: number;
  avg_price: number;
  current_price: number;
}

export type HoldingUpdate = Partial<HoldingInput>;
