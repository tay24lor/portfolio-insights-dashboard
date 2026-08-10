import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AllocationItem {
  symbol: string;
  value: number;
  percentage: number;
}

export interface PortfolioSummary {
  total_value: number;
  holdings_count: number;
  allocation: AllocationItem[];
}

export interface HoldingRow {
  symbol: string;
  shares: number;
  avg_price: number;
  current_price: number;
}

export interface PerformancePoint {
  label: string;
  value: number;
}

export type PerformanceRange = '1M' | '3M' | 'YTD' | '1Y';

export interface PerformanceSummary {
  total_return: number;
  return_rate: number;
  trend: PerformancePoint[];
}

export interface BenchmarkSummary {
  benchmark_name: string;
  benchmark_return: number;
  portfolio_return: number;
  difference: number;
  status: 'Outperforming' | 'Lagging' | 'In line';
}

export interface CashflowPoint {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface CashflowSummary {
  available_cash: number;
  monthly_income: number;
  monthly_spend: number;
  monthly_net: number;
  forecast: CashflowPoint[];
}

export interface RiskExposureSummary {
  risk_level: 'Low' | 'Moderate' | 'Elevated' | 'High';
  concentration_pct: number;
  diversification_score: number;
  largest_position_symbol: string;
  largest_position_value: number;
}

export interface RebalanceRecommendation {
  symbol: string;
  current_pct: number;
  target_pct: number;
  action: 'Add' | 'Trim' | 'Hold';
  delta_pct: number;
}

export interface RebalanceSummary {
  recommendations: RebalanceRecommendation[];
}

export interface WatchlistItem {
  symbol: string;
  current_price: number;
  target_price: number;
  direction: 'Up' | 'Down' | 'Flat';
  alert_active: boolean;
}

export interface TransactionItem {
  id: number;
  type: 'Buy' | 'Sell' | 'Dividend' | 'Deposit' | 'Withdrawal';
  symbol?: string;
  amount: number;
  date: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  getSummary(): Observable<PortfolioSummary> {
    return this.http.get<PortfolioSummary>(`${this.api}/portfolio/summary`);
  }

  getHoldings(): Observable<HoldingRow[]> {
    return this.http.get<HoldingRow[]>(`${this.api}/holdings`);
  }

  getPerformance(range: PerformanceRange = '1Y'): Observable<PerformanceSummary> {
    return this.http.get<PerformanceSummary>(`${this.api}/portfolio/performance?range=${range}`);
  }

  getBenchmark(): Observable<BenchmarkSummary> {
    return this.http.get<BenchmarkSummary>(`${this.api}/portfolio/benchmark`);
  }

  getCashflow(): Observable<CashflowSummary> {
    return this.http.get<CashflowSummary>(`${this.api}/portfolio/cashflow`);
  }

  getRisk(): Observable<RiskExposureSummary> {
    return this.http.get<RiskExposureSummary>(`${this.api}/portfolio/risk`);
  }

  getRecommendations(): Observable<RebalanceSummary> {
    return this.http.get<RebalanceSummary>(`${this.api}/portfolio/rebalancing`);
  }

  getWatchlist(): Observable<WatchlistItem[]> {
    return this.http.get<WatchlistItem[]>(`${this.api}/portfolio/watchlist`);
  }

  getTransactions(): Observable<TransactionItem[]> {
    return this.http.get<TransactionItem[]>(`${this.api}/portfolio/transactions`);
  }
}
