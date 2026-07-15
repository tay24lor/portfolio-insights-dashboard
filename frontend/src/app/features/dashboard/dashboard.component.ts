import { Component, inject, OnInit } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { PortfolioService, PortfolioSummary, AllocationItem } from '../../core/services/portfolio.service';

interface ChartSegment {
  color: string;
  dashArray: string;
  dashOffset: string;
}

interface HoldingRow {
  symbol: string;
  shares: number;
  avg_price: number;
  current_price: number;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [NgIf, NgFor, CurrencyPipe, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatTableModule, MatButtonModule],
  template: `
    <div class="dashboard-shell">
      <div class="header">
        <div>
          <h1>Portfolio Overview</h1>
          <p>Here is a snapshot of your current holdings.</p>
        </div>
      </div>

      <div class="state loading-state" *ngIf="loading">
        <mat-spinner diameter="28"></mat-spinner>
        <span>Loading your portfolio…</span>
      </div>

      <div class="state error-state" *ngIf="error && !loading">
        <mat-icon>error_outline</mat-icon>
        <div class="error-content">
          <span class="error-title">Unable to load</span>
          <span class="error-detail">{{ error }}</span>
        </div>
      </div>

      <div class="summary-grid" *ngIf="summary && !loading">
        <mat-card class="summary-card">
          <div class="card-content">
            <div class="card-label">
              <mat-icon>account_balance_wallet</mat-icon>
              Total Value
            </div>
            <div class="card-value">{{ formatCurrency(summary.total_value) }}</div>
          </div>
        </mat-card>

        <mat-card class="summary-card">
          <div class="card-content">
            <div class="card-label">
              <mat-icon>inventory_2</mat-icon>
              Holdings
            </div>
            <div class="card-value">{{ summary.holdings_count }}</div>
          </div>
        </mat-card>
      </div>

      <mat-card class="allocation-card" *ngIf="!loading && !error">
        <div class="card-header">
          <h2>Allocation</h2>
          <span class="position-count">{{ allocation.length }} position{{ allocation.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="allocation-content" *ngIf="allocation.length; else emptyAllocation">
          <svg class="allocation-chart" viewBox="0 0 100 100" aria-label="Portfolio allocation chart">
            <circle cx="50" cy="50" r="38" class="chart-track"></circle>
            <circle
              *ngFor="let segment of chartSegments"
              cx="50"
              cy="50"
              r="38"
              class="chart-segment"
              [attr.stroke]="segment.color"
              [attr.stroke-dasharray]="segment.dashArray"
              [attr.stroke-dashoffset]="segment.dashOffset"
              transform="rotate(-90 50 50)"></circle>
          </svg>

          <div class="legend">
            <div class="legend-item" *ngFor="let item of allocation">
              <span class="legend-color" [style.background]="item.color"></span>
              <div class="legend-text">
                <span class="legend-symbol">{{ item.symbol }}</span>
                <span class="legend-value">{{ formatCurrency(item.value) }} · {{ item.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <ng-template #emptyAllocation>
          <div class="empty-state">
            <mat-icon class="empty-icon">pie_chart</mat-icon>
            <span class="empty-title">No allocation data yet</span>
            <span class="empty-detail">Your positions will appear here once available.</span>
          </div>
        </ng-template>
      </mat-card>

      <mat-card class="holdings-card" *ngIf="!loading && !error">
        <div class="card-header">
          <h2>Your Holdings</h2>
          <span class="position-count">{{ holdings.length }} position{{ holdings.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="table-wrapper" *ngIf="holdings.length; else emptyState">
          <table mat-table [dataSource]="holdings" class="holdings-table">
            <ng-container matColumnDef="symbol">
              <th mat-header-cell *matHeaderCellDef>Symbol</th>
              <td mat-cell *matCellDef="let holding">
                <span class="symbol-badge">{{ holding.symbol }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="shares">
              <th mat-header-cell *matHeaderCellDef>Shares</th>
              <td mat-cell *matCellDef="let holding">{{ holding.shares }}</td>
            </ng-container>

            <ng-container matColumnDef="avg_price">
              <th mat-header-cell *matHeaderCellDef>Avg Cost</th>
              <td mat-cell *matCellDef="let holding">{{ formatCurrency(holding.avg_price) }}</td>
            </ng-container>

            <ng-container matColumnDef="current_price">
              <th mat-header-cell *matHeaderCellDef>Current Price</th>
              <td mat-cell *matCellDef="let holding">{{ formatCurrency(holding.current_price) }}</td>
            </ng-container>

            <ng-container matColumnDef="gain_loss">
              <th mat-header-cell *matHeaderCellDef>Gain / Loss</th>
              <td mat-cell *matCellDef="let holding" [class.gain]="holding.current_price > holding.avg_price" [class.loss]="holding.current_price < holding.avg_price">
                <mat-icon *ngIf="holding.current_price > holding.avg_price" class="trend-icon">trending_up</mat-icon>
                <mat-icon *ngIf="holding.current_price < holding.avg_price" class="trend-icon">trending_down</mat-icon>
                <mat-icon *ngIf="holding.current_price === holding.avg_price" class="trend-icon">remove</mat-icon>
                {{ (holding.current_price - holding.avg_price | currency: 'USD':'symbol':'1.0-2') }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
          </table>
        </div>

        <ng-template #emptyState>
          <div class="empty-state">
            <mat-icon class="empty-icon">inventory_2</mat-icon>
            <span class="empty-title">No holdings yet</span>
            <span class="empty-detail">Start by adding positions to your portfolio.</span>
          </div>
        </ng-template>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-shell {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 28px;
    }

    .header h1 {
      margin: 0 0 6px;
      font-size: 32px;
      font-weight: 600;
      color: #003057;
    }

    .header p {
      margin: 0;
      color: #6b7280;
      font-size: 15px;
    }

    .state {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px;
      border-radius: 10px;
      background: #f3f4f6;
      color: #374151;
    }

    .loading-state {
      justify-content: center;
    }

    .error-state {
      background: #fee2e2;
      color: #991b1b;
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

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      background: linear-gradient(135deg, #f8f9fb 0%, #ffffff 100%);
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;
    }

    .summary-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      font-weight: 600;
    }

    .card-label mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #003057;
    }

    .card-value {
      font-size: 28px;
      font-weight: 700;
      color: #003057;
    }

    .allocation-card,
    .holdings-card {
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .card-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #003057;
    }

    .position-count {
      color: #6b7280;
      font-size: 13px;
      background: #f3f4f6;
      padding: 4px 12px;
      border-radius: 6px;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .holdings-table {
      width: 100%;
      border-collapse: collapse;
    }

    .holdings-table th {
      background-color: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
      padding: 12px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
    }

    .holdings-table td {
      border-bottom: 1px solid #e5e7eb;
      padding: 14px 16px;
      color: #1f2937;
      font-size: 14px;
    }

    .table-row:hover {
      background-color: #f9fafb;
    }

    .allocation-content {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .allocation-chart {
      width: 180px;
      height: 180px;
      flex-shrink: 0;
    }

    .chart-track {
      fill: none;
      stroke: #e5e7eb;
      stroke-width: 14;
    }

    .chart-segment {
      fill: none;
      stroke-width: 14;
      stroke-linecap: round;
    }

    .legend {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 220px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .legend-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      flex-shrink: 0;
    }

    .legend-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .legend-symbol {
      font-weight: 700;
      color: #003057;
      font-size: 14px;
    }

    .legend-value {
      color: #6b7280;
      font-size: 13px;
    }

    .symbol-badge {
      display: inline-block;
      background: #e0e7ff;
      color: #3730a3;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
    }

    .gain {
      color: #059669;
      font-weight: 600;
    }

    .loss {
      color: #dc2626;
      font-weight: 600;
    }

    .trend-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
      vertical-align: middle;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: #6b7280;
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #d1d5db;
      margin-bottom: 8px;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }

    .empty-detail {
      font-size: 14px;
      color: #6b7280;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private portfolioService = inject(PortfolioService);

  summary: PortfolioSummary | null = null;
  holdings: HoldingRow[] = [];
  allocation: Array<AllocationItem & { color: string }> = [];
  chartSegments: ChartSegment[] = [];
  displayedColumns = ['symbol', 'shares', 'avg_price', 'current_price', 'gain_loss'];
  loading = true;
  error = '';

  ngOnInit() {
    this.loadSummary();
    this.loadHoldings();
  }

  loadSummary() {
    this.portfolioService.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.allocation = (summary.allocation ?? []).map((item, index) => ({
          ...item,
          color: this.getChartColor(index)
        }));
        this.chartSegments = this.buildChartSegments(this.allocation);
      },
      error: () => {
        this.error = 'Unable to load portfolio summary.';
      }
    });
  }

  loadHoldings() {
    this.portfolioService.getHoldings().subscribe({
      next: (holdings) => {
        this.holdings = holdings;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to load holdings.';
      }
    });
  }

  private buildChartSegments(allocation: Array<AllocationItem & { color: string }>): ChartSegment[] {
    const totalValue = allocation.reduce((sum, item) => sum + item.value, 0);
    const circumference = 2 * Math.PI * 38;
    let offset = 0;

    return allocation.map((item) => {
      const length = totalValue > 0 ? (item.value / totalValue) * circumference : 0;
      const segment: ChartSegment = {
        color: item.color,
        dashArray: `${length.toFixed(2)} ${circumference.toFixed(2)}`,
        dashOffset: `${(-offset).toFixed(2)}`
      };
      offset += length;
      return segment;
    });
  }

  private getChartColor(index: number) {
    const colors = ['#003057', '#4f46e5', '#0f766e', '#d97706', '#dc2626', '#7c3aed'];
    return colors[index % colors.length];
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}
