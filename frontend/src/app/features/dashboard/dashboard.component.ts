import { Component, inject, OnInit } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { PortfolioService, PortfolioSummary, AllocationItem, RiskExposureSummary, RebalanceSummary, RebalanceRecommendation, WatchlistItem, TransactionItem } from '../../core/services/portfolio.service';
import { appColors } from '../../shared/theme/colors';

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

        <mat-card class="summary-card risk-card" *ngIf="riskSummary">
          <div class="card-content">
            <div class="card-label">
              <mat-icon>health_and_safety</mat-icon>
              Risk Exposure
            </div>
            <div class="card-value risk-value">{{ riskSummary.risk_level }}</div>
            <div class="risk-detail">
              <span>{{ riskSummary.concentration_pct }}% top position</span>
              <span class="divider">·</span>
              <span>{{ riskSummary.diversification_score }}% diversification</span>
            </div>
          </div>
        </mat-card>
      </div>

      <mat-card class="recommendations-card" *ngIf="!loading && !error">
        <div class="card-header">
          <h2>Rebalancing Recommendations</h2>
          <span class="position-count">{{ recommendations.length }} item{{ recommendations.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="recommendation-grid" *ngIf="recommendations.length; else emptyRecommendations">
          <div class="rec-row" *ngFor="let rec of recommendations">
            <span class="symbol-badge">{{ rec.symbol }}</span>
            <span class="rec-status" [class.add-action]="rec.action === 'Add'" [class.trim-action]="rec.action === 'Trim'">
              {{ rec.action }} {{ rec.delta_pct }}% target weight
            </span>
            <span class="rec-meta">Current {{ rec.current_pct }}% · Target {{ rec.target_pct }}%</span>
          </div>
        </div>

        <ng-template #emptyRecommendations>
          <div class="empty-state compact-empty">
            <mat-icon class="empty-icon">balance</mat-icon>
            <span class="empty-title">No recommendations yet</span>
            <span class="empty-detail">Your model will flag drift once holdings are available.</span>
          </div>
        </ng-template>
      </mat-card>

      <mat-card class="watchlist-card" *ngIf="!loading && !error">
        <div class="card-header">
          <h2>Watchlist & Alerts</h2>
          <span class="position-count">{{ watchlist.length }} symbol{{ watchlist.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="watchlist-grid" *ngIf="watchlist.length; else emptyWatchlist">
          <div class="watch-row" *ngFor="let item of watchlist">
            <span class="symbol-badge">{{ item.symbol }}</span>
            <span class="watch-price">{{ formatCurrency(item.current_price) }}</span>
            <span class="watch-direction" [class.up]="item.direction === 'Up'" [class.down]="item.direction === 'Down'">
              {{ item.direction }} target {{ formatCurrency(item.target_price) }}
            </span>
            <span class="alert-chip" *ngIf="item.alert_active">Alert</span>
          </div>
        </div>

        <ng-template #emptyWatchlist>
          <div class="empty-state compact-empty">
            <mat-icon class="empty-icon">notifications_active</mat-icon>
            <span class="empty-title">No watchlist signals</span>
            <span class="empty-detail">Add preferred symbols to monitor price drift.</span>
          </div>
        </ng-template>
      </mat-card>

      <mat-card class="activity-card" *ngIf="!loading && !error">
        <div class="card-header">
          <h2>Recent Activity</h2>
          <span class="position-count">{{ transactions.length }} event{{ transactions.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="activity-grid" *ngIf="transactions.length; else emptyTransactions">
          <div class="activity-row" *ngFor="let transaction of transactions">
            <span class="activity-date">{{ transaction.date }}</span>
            <span class="activity-type">{{ transaction.type }}</span>
            <span class="activity-symbol" *ngIf="transaction.symbol">{{ transaction.symbol }}</span>
            <span class="activity-description">{{ transaction.description }}</span>
            <span class="activity-amount" [class.debit]="transaction.type === 'Buy' || transaction.type === 'Withdrawal' || transaction.type === 'Deposit'">{{ transaction.type === 'Dividend' ? '+' : '' }}{{ formatCurrency(transaction.amount) }}</span>
          </div>
        </div>

        <ng-template #emptyTransactions>
          <div class="empty-state compact-empty">
            <mat-icon class="empty-icon">receipt_long</mat-icon>
            <span class="empty-title">No activity yet</span>
            <span class="empty-detail">Cash and trade activity will appear here.</span>
          </div>
        </ng-template>
      </mat-card>

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

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      background: linear-gradient(135deg, var(--app-light-surface) 0%, var(--app-white) 100%);
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--app-border);
      transition: all 0.2s ease;
    }

    .summary-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .risk-card {
      border-left: 4px solid var(--app-info);
    }

    .risk-detail {
      color: var(--app-muted-text);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
    }

    .divider {
      font-weight: 700;
    }

    .risk-value {
      font-size: 24px;
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
      color: var(--app-muted-text);
      font-weight: 600;
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
    }

    .allocation-card,
    .holdings-card,
    .watchlist-card,
    .recommendations-card,
    .activity-card {
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--app-border);
      margin-bottom: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--app-border);
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

    .table-wrapper {
      overflow-x: auto;
    }

    .holdings-table {
      width: 100%;
      border-collapse: collapse;
    }

    .holdings-table th {
      background-color: var(--app-table-header);
      border-bottom: 2px solid var(--app-border);
      padding: 12px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--app-muted-text);
    }

    .holdings-table td {
      border-bottom: 1px solid var(--app-border);
      padding: 14px 16px;
      color: var(--app-table-text);
      font-size: 14px;
    }

    .table-row:hover {
      background-color: var(--app-table-header);
    }

    .recommendation-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .rec-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--app-subtle-border);
    }

    .rec-row:last-child {
      border-bottom: none;
    }

    .rec-status {
      font-weight: 700;
      font-size: 13px;
      color: var(--app-primary);
    }

    .rec-status.add-action {
      color: var(--app-success);
    }

    .rec-status.trim-action {
      color: var(--app-danger);
    }

    .rec-meta {
      color: var(--app-muted-text);
      font-size: 12px;
    }

    .activity-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .activity-row {
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--app-subtle-border);
      padding: 10px 0;
    }

    .activity-row:last-child {
      border-bottom: none;
    }

    .activity-date {
      color: var(--app-muted-text);
      font-size: 12px;
      min-width: 90px;
    }

    .activity-type {
      font-size: 13px;
      font-weight: 700;
      color: var(--app-primary);
      min-width: 70px;
    }

    .activity-symbol {
      background: var(--app-muted-background);
      padding: 4px 9px;
      border-radius: 6px;
      color: var(--app-info);
      font-size: 12px;
      font-weight: 700;
    }

    .activity-description {
      flex: 1;
      font-size: 13px;
      color: var(--app-chart-legend-text);
    }

    .activity-amount {
      font-weight: 700;
      color: var(--app-success);
    }

    .activity-amount.debit {
      color: var(--app-danger);
    }

    .watchlist-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .watch-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 0;
      border-bottom: 1px solid var(--app-subtle-border);
    }

    .watch-row:last-child {
      border-bottom: none;
    }

    .watch-price {
      font-weight: 700;
      color: var(--app-primary);
    }

    .watch-direction {
      color: var(--app-muted-text);
      font-size: 13px;
    }

    .watch-direction.up {
      color: var(--app-success);
    }

    .watch-direction.down {
      color: var(--app-danger);
    }

    .alert-chip {
      background: var(--app-warning);
      color: #fff;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .compact-empty {
      padding: 26px 24px;
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
      stroke: var(--app-chart-track);
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
      border-bottom: 1px solid var(--app-subtle-border);
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
      color: var(--app-primary);
      font-size: 14px;
    }

    .legend-value {
      color: var(--app-muted-text);
      font-size: 13px;
    }

    .symbol-badge {
      display: inline-block;
      background: var(--app-muted-background);
      color: var(--app-info);
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
    }

    .gain {
      color: var(--app-success);
      font-weight: 600;
    }

    .loss {
      color: var(--app-danger);
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
      color: var(--app-muted-text);
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--app-border);
      margin-bottom: 8px;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--app-chart-legend-text);
    }

    .empty-detail {
      font-size: 14px;
      color: var(--app-muted-text);
    }
  `]
})
export class DashboardComponent implements OnInit {
  private portfolioService = inject(PortfolioService);

  summary: PortfolioSummary | null = null;
  holdings: HoldingRow[] = [];
  riskSummary: RiskExposureSummary | null = null;
  recommendations: RebalanceRecommendation[] = [];
  watchlist: WatchlistItem[] = [];
  transactions: TransactionItem[] = [];
  allocation: Array<AllocationItem & { color: string }> = [];
  chartSegments: ChartSegment[] = [];
  displayedColumns = ['symbol', 'shares', 'avg_price', 'current_price', 'gain_loss'];
  loading = true;
  error = '';

  ngOnInit() {
    this.loadSummary();
    this.loadHoldings();
    this.loadRisk();
    this.loadRecommendations();
    this.loadWatchlist();
    this.loadTransactions();
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

  loadRisk() {
    this.portfolioService.getRisk().subscribe({
      next: (riskSummary) => {
        this.riskSummary = riskSummary;
      },
      error: () => {
        this.riskSummary = {
          risk_level: 'Moderate',
          concentration_pct: 0,
          diversification_score: 0,
          largest_position_symbol: 'N/A',
          largest_position_value: 0
        };
      }
    });
  }

  loadRecommendations() {
    this.portfolioService.getRecommendations().subscribe({
      next: (summary: RebalanceSummary) => {
        this.recommendations = summary.recommendations;
      },
      error: () => {
        this.recommendations = [];
      }
    });
  }

  loadWatchlist() {
    this.portfolioService.getWatchlist().subscribe({
      next: (watchlist) => {
        this.watchlist = watchlist;
      },
      error: () => {
        this.watchlist = [];
      }
    });
  }

  loadTransactions() {
    this.portfolioService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
      },
      error: () => {
        this.transactions = [];
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
    const colors = [appColors.primary, appColors.secondary, appColors.accent, appColors.warning, appColors.danger, appColors.purple];
    return colors[index % colors.length];
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}
