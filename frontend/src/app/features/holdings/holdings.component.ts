import { Component, inject, OnInit } from '@angular/core';
import { NgIf, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { PortfolioService, HoldingRow } from '../../core/services/portfolio.service';

@Component({
  standalone: true,
  selector: 'app-holdings',
  imports: [NgIf, CurrencyPipe, MatCardModule, MatProgressSpinnerModule, MatTableModule, MatIconModule],
  template: `
    <div class="holdings-shell">
      <div class="header">
        <h1>Holdings</h1>
        <p>Your full list of positions and allocations.</p>
      </div>

      <div class="state loading-state" *ngIf="loading">
        <mat-spinner diameter="28"></mat-spinner>
        <span>Loading holdings…</span>
      </div>

      <div class="state error-state" *ngIf="error && !loading">
        <mat-icon>error_outline</mat-icon>
        <div class="error-content">
          <span class="error-title">Unable to load</span>
          <span class="error-detail">{{ error }}</span>
        </div>
      </div>

      <mat-card class="holdings-card" *ngIf="!loading && !error">
        <div class="card-header">
          <div>
            <h2>All Positions</h2>
            <span class="position-count">{{ holdings.length }} position{{ holdings.length !== 1 ? 's' : '' }}</span>
          </div>
          <mat-icon class="header-icon">show_chart</mat-icon>
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
              <td mat-cell *matCellDef="let holding">{{ holding.avg_price | currency:'USD':'symbol':'1.0-2' }}</td>
            </ng-container>

            <ng-container matColumnDef="current_price">
              <th mat-header-cell *matHeaderCellDef>Current Price</th>
              <td mat-cell *matCellDef="let holding">{{ holding.current_price | currency:'USD':'symbol':'1.0-2' }}</td>
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

            <ng-container matColumnDef="total_value">
              <th mat-header-cell *matHeaderCellDef>Total Value</th>
              <td mat-cell *matCellDef="let holding" class="total-value">
                {{ (holding.shares * holding.current_price) | currency:'USD':'symbol':'1.0-0' }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
          </table>
        </div>

        <ng-template #emptyState>
          <div class="empty-state">
            <mat-icon class="empty-icon">folder_open</mat-icon>
            <span class="empty-title">No holdings yet</span>
            <span class="empty-detail">Start building your portfolio by adding positions.</span>
          </div>
        </ng-template>
      </mat-card>
    </div>
  `,
  styles: [`
    .holdings-shell {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
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

    .holdings-card {
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .card-header h2 {
      margin: 0 0 4px;
      font-size: 20px;
      font-weight: 600;
      color: #003057;
    }

    .position-count {
      display: inline-block;
      color: #6b7280;
      font-size: 13px;
      background: #f3f4f6;
      padding: 4px 12px;
      border-radius: 6px;
    }

    .header-icon {
      color: #003057;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .holdings-table {
      width: 100%;
      border-collapse: collapse;
    }

    .holdings-table th {
      background-color: #a6c3df;
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
      color: #546e94;
      font-size: 14px;
    }

    .table-row:hover {
      background-color: #f9fafb;
    }

    .symbol-badge {
      display: inline-block;
      background: #e0e7ff;
      color: #3730a3;
      padding: 6px 12px;
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

    .total-value {
      font-weight: 600;
      color: #003057;
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
export class HoldingsComponent implements OnInit {
  private portfolioService = inject(PortfolioService);

  holdings: HoldingRow[] = [];
  displayedColumns = ['symbol', 'shares', 'avg_price', 'current_price', 'gain_loss', 'total_value'];
  loading = true;
  error = '';

  ngOnInit() {
    this.loadHoldings();
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
}

