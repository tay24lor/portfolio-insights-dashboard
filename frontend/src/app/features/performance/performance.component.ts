import { Component, inject, OnInit } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortfolioService, PerformanceSummary, PerformancePoint } from '../../core/services/portfolio.service';
import { appColors } from '../../shared/theme/colors';

@Component({
  standalone: true,
  selector: 'app-performance',
  imports: [NgIf, NgFor, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-shell">
      <div class="header">
        <div>
          <h1>Performance</h1>
          <p>Review recent value trends and portfolio momentum.</p>
        </div>
      </div>

      <div class="state loading-state" *ngIf="loading">
        <mat-spinner diameter="28"></mat-spinner>
        <span>Loading performance data…</span>
      </div>

      <div class="state error-state" *ngIf="error && !loading">
        <mat-icon>error_outline</mat-icon>
        <div class="error-content">
          <span class="error-title">Unable to load</span>
          <span class="error-detail">{{ error }}</span>
        </div>
      </div>

      <div class="content-grid" *ngIf="!loading && !error">
        <mat-card class="summary-card">
          <div class="card-label">
            <mat-icon>trending_up</mat-icon>
            Total Return
          </div>
          <div class="card-value">{{ formatCurrency(totalReturn) }}</div>
          <div class="card-caption">Based on current market value versus cost basis.</div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="card-label">
            <mat-icon>insights</mat-icon>
            Return Rate
          </div>
          <div class="card-value">{{ returnRate }}%</div>
          <div class="card-caption">Estimated gain on the current portfolio.</div>
        </mat-card>

        <mat-card class="chart-card">
          <div class="card-header">
            <h2>Portfolio Value Trend</h2>
            <span class="position-count">Last 6 months</span>
          </div>

          <div class="chart-area">
            <div class="chart-bars">
              <div class="bar-column" *ngFor="let point of trendData">
                <div class="bar" [style.height.%]="point.value"></div>
                <span class="bar-label">{{ point.label }}</span>
              </div>
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
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }

    .summary-card,
    .chart-card {
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--app-border);
    }

    .chart-card {
      grid-column: 1 / -1;
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

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-header h2 {
      margin: 0;
      font-size: 18px;
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

    .chart-area {
      height: 220px;
      display: flex;
      align-items: flex-end;
      padding-top: 12px;
    }

    .chart-bars {
      display: flex;
      gap: 16px;
      width: 100%;
      height: 100%;
      align-items: flex-end;
    }

    .bar-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      height: 100%;
    }

    .bar {
      width: 100%;
      max-width: 48px;
      background: linear-gradient(180deg, ${appColors.chartBarStart} 0%, ${appColors.chartBarEnd} 100%);
      border-radius: 8px 8px 0 0;
      min-height: 20px;
    }

    .bar-label {
      font-size: 12px;
      color: #6b7280;
    }
  `]
})
export class PerformanceComponent implements OnInit {
  private portfolioService = inject(PortfolioService);

  loading = true;
  error = '';
  totalReturn = 0;
  returnRate = 0;
  trendData: PerformancePoint[] = [];

  ngOnInit() {
    this.loadPerformance();
  }

  private loadPerformance() {
    this.portfolioService.getPerformance().subscribe({
      next: (summary: PerformanceSummary) => {
        this.totalReturn = summary.total_return;
        this.returnRate = summary.return_rate;
        this.trendData = summary.trend;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to load performance data.';
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
