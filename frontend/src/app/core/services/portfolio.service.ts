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

export interface PerformanceSummary {
  total_return: number;
  return_rate: number;
  trend: PerformancePoint[];
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

  getPerformance(): Observable<PerformanceSummary> {
    return this.http.get<PerformanceSummary>(`${this.api}/portfolio/performance`);
  }
}
