import { Component, inject, OnInit } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortfolioService, CashflowSummary, CashflowPoint } from '../../core/services/portfolio.service';

@Component({
  standalone: true,
  selector: 'app-cashflow',
  imports: [NgIf, NgFor, CurrencyPipe, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-shell">
      <div class="header">
        <div>
          <h1>Cash Flow</h1>
          <p>Monitor liquidity, recurring inflows, and projected monthly coverage.</p>
        </div>
      </div>

      <div class="state loading-state" *ngIf="loading">
        <mat-spinner diameter="28"></mat-spinner>
        <span>Loading cash flow data…</span>
      </div>

      <div class="state error-state" *ngIf="error && !loading">
        <mat-icon>error_outline</mat-icon>
        <div class="error-content">
          <span class="error-title">Unable to load</span>
          <span class="error-detail">{{ error }}</span>
        </div>
      </div>

      <div class="content-grid" *ngIf="!loading && !error && cashflow">
        <mat-card class="summary-card">
          <div class="card-label">
            <mat-icon>account_balance_wallet</mat-icon>
            Available Cash
          </div>
          <div class="card-value">{{ formatCurrency(cashflow.available_cash) }}</div>
          <div class="card-caption">Unallocated liquidity currently available.</div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="card-label">
            <mat-icon>payments</mat-icon>
            Monthly Income
          </div>
          <div class="card-value">{{ formatCurrency(cashflow.monthly_income) }}</div>
          <div class="card-caption">Income run-rate across recurring sources.</div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="card-label">
            <mat-icon>local_atm</mat-icon>
            Monthly Spend
          </div>
          <div class="card-value">{{ formatCurrency(cashflow.monthly_spend) }}</div>
          <div class="card-caption">Expected outflows over the next month.</div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="card-label">
            <mat-icon>analytics</mat-icon>
            Net Monthly Cash
          </div>
          <div class="card-value" [class.net-positive]="cashflow.monthly_net >= 0" [class.net-negative]="cashflow.monthly_net < 0">
            {{ cashflow.monthly_net >= 0 ? '+' : '' }}{{ formatCurrency(cashflow.monthly_net) }}
          </div>
          <div class="card-caption">Projected surplus or deficit based on cash flow run-rate.</div>
        </mat-card>

        <mat-card class="forecast-card">
          <div class="card-header">
            <h2>Cash Flow Forecast</h2>
            <span class="position-count">6 month view</span>
          </div>

          <div class="forecast-grid">
            <div class="forecast-row header-row">
              <span>Month</span>
              <span>Inflow</span>
              <span>Outflow</span>
              <span>Net</span>
            </div>
            <div class="forecast-row" *ngFor="let point of cashflow.forecast">
              <span class="month-label">{{ point.month }}</span>
              <span>{{ formatCurrency(point.inflow) }}</span>
              <span>{{ formatCurrency(point.outflow) }}</span>
              <span [class.net-positive]="point.net >= 0" [class.net-negative]="point.net < 0">
                {{ point.net >= 0 ? '+' : '' }}{{ formatCurrency(point.net) }}
              </span>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-shell {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0 0 6px;
      font-size: 32px;
      font-weight: 600;
      color: var(--app-primary);
    }

    .header p {
      margin: 0;
      color: var(--app-muted-text);
      font-size: 15px;
    }

    .state {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px;
      border-radius: 10px;
      background: var(--app-muted-background);
      color: var(--app-chart-legend-text);
    }

    .loading-state {
      justify-content: center;
    }

    .error-state {
      background: var(--app-error-background);
      color: var(--app-error-text);
      gap: 16px;
    }

    .error-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .error-title {
      font-weight: 600;
    }

    .error-detail {
      font-size: 13px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }

    .summary-card,
    .forecast-card {
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--app-border);
    }

    .forecast-card {
      grid-column: 1 / -1;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--app-primary);
    }

    .position-count {
      color: var(--app-muted-text);
      font-size: 13px;
      background: var(--app-muted-background);
      padding: 4px 12px;
      border-radius: 6px;
    }

    .card-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--app-muted-text);
      font-weight: 600;
      margin-bottom: 12px;
    }

    .card-label mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--app-primary);
    }

    .card-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--app-primary);
      margin-bottom: 8px;
    }

    .card-caption {
      color: var(--app-muted-text);
      font-size: 13px;
    }

    .net-positive {
      color: var(--app-success);
    }

    .net-negative {
      color: var(--app-danger);
    }

    .forecast-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .forecast-row {
      display: grid;
      grid-template-columns: 1fr repeat(3, minmax(120px, auto));
      align-items: center;
      gap: 16px;
      padding: 12px 14px;
      border-radius: 8px;
      background: var(--app-muted-background);
      color: var(--app-chart-legend-text);
      font-size: 13px;
    }

    .header-row {
      background: var(--app-table-header-blue);
      color: var(--app-muted-text);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 11px;
    }

    .month-label {
      font-weight: 700;
      color: var(--app-primary);
    }
  `]
})
export class CashflowComponent implements OnInit {
  private portfolioService = inject(PortfolioService);

  loading = true;
  error = '';
  cashflow: CashflowSummary | null = null;

  ngOnInit() {
    this.loadCashflow();
  }

  private loadCashflow() {
    this.portfolioService.getCashflow().subscribe({
      next: (cashflow: CashflowSummary) => {
        this.cashflow = cashflow;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to load cash flow data.';
      }
    });
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}
