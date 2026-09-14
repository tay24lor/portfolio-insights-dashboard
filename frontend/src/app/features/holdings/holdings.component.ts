import { Component, inject, OnInit } from '@angular/core';
import { NgIf, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HoldingInput, HoldingRow } from '../../core/services/portfolio.service';
import { PortfolioStateService } from '../../core/services/portfolio-state.service';
import { appColors } from '../../shared/theme/colors';

@Component({
  standalone: true,
  selector: 'app-holdings',
  imports: [NgIf, CurrencyPipe, ReactiveFormsModule, MatCardModule, MatProgressSpinnerModule, MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
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

      <mat-card class="editor-card" *ngIf="!loading">
        <div class="card-header">
          <div>
            <h2>{{ editingId === null ? 'Add a holding' : 'Edit holding' }}</h2>
            <span class="position-count">Changes are saved to your portfolio</span>
          </div>
          <button mat-button type="button" *ngIf="editingId !== null" (click)="cancelEdit()">Cancel</button>
        </div>

        <form class="holding-form" [formGroup]="holdingForm" (ngSubmit)="saveHolding()">
          <mat-form-field appearance="outline">
            <mat-label>Symbol</mat-label>
            <input matInput formControlName="symbol" maxlength="12" placeholder="AAPL">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Shares</mat-label>
            <input matInput type="number" min="0" step="0.000001" formControlName="shares">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Average cost</mat-label>
            <input matInput type="number" min="0" step="0.01" formControlName="avg_price">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Current price</mat-label>
            <input matInput type="number" min="0" step="0.01" formControlName="current_price">
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit" [disabled]="holdingForm.invalid || saving">
            {{ saving ? 'Saving…' : editingId === null ? 'Add holding' : 'Save changes' }}
          </button>
        </form>
      </mat-card>

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

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let holding">
                <button mat-button type="button" (click)="startEdit(holding)" [disabled]="saving">Edit</button>
                <button mat-button type="button" class="delete-button" (click)="deleteHolding(holding)" [disabled]="saving">Delete</button>
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

    .holdings-card {
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--app-border);
    }

    .editor-card {
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid var(--app-border);
    }

    .holding-form {
      display: grid;
      grid-template-columns: repeat(4, minmax(140px, 1fr)) auto;
      gap: 12px;
      align-items: start;
    }

    .holding-form button {
      min-height: 56px;
    }

    .delete-button {
      color: var(--app-danger);
    }

    @media (max-width: 900px) {
      .holding-form {
        grid-template-columns: repeat(2, minmax(140px, 1fr));
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--app-border);
    }

    .card-header h2 {
      margin: 0 0 4px;
      font-size: 20px;
      font-weight: 600;
      color: var(--app-primary);
    }

    .position-count {
      display: inline-block;
      color: var(--app-muted-text);
      font-size: 13px;
      background: var(--app-muted-background);
      padding: 4px 12px;
      border-radius: 6px;
    }

    .header-icon {
      color: var(--app-primary);
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
      background-color: var(--app-table-header-blue);
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

    .symbol-badge {
      display: inline-block;
      background: var(--app-muted-background);
      color: var(--app-info);
      padding: 6px 12px;
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

    .total-value {
      font-weight: 600;
      color: var(--app-primary);
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
export class HoldingsComponent implements OnInit {
  private portfolioState = inject(PortfolioStateService);
  private formBuilder = inject(FormBuilder);

  displayedColumns = ['symbol', 'shares', 'avg_price', 'current_price', 'gain_loss', 'total_value', 'actions'];
  editingId: number | null = null;
  holdingForm = this.formBuilder.nonNullable.group({
    symbol: ['', [Validators.required, Validators.pattern(/^[A-Za-z.]{1,12}$/)]],
    shares: [0, [Validators.required, Validators.min(0)]],
    avg_price: [0, [Validators.required, Validators.min(0)]],
    current_price: [0, [Validators.required, Validators.min(0)]]
  });

  get holdings() { return this.portfolioState.holdings(); }
  get loading() { return this.portfolioState.loading(); }
  get saving() { return this.portfolioState.saving(); }
  get error() { return this.portfolioState.error() ?? ''; }

  ngOnInit() {
    this.portfolioState.loadHoldings();
  }

  saveHolding() {
    if (this.holdingForm.invalid) return;
    const input: HoldingInput = this.holdingForm.getRawValue();
    const onSuccess = () => this.cancelEdit();

    if (this.editingId === null) {
      this.portfolioState.createHolding(input, onSuccess);
    } else {
      this.portfolioState.updateHolding(this.editingId, input, onSuccess);
    }
  }

  startEdit(holding: HoldingRow) {
    this.editingId = holding.id;
    this.holdingForm.setValue({
      symbol: holding.symbol,
      shares: holding.shares,
      avg_price: holding.avg_price,
      current_price: holding.current_price
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.holdingForm.reset({ symbol: '', shares: 0, avg_price: 0, current_price: 0 });
  }

  deleteHolding(holding: HoldingRow) {
    if (!confirm(`Delete ${holding.symbol} from your portfolio?`)) return;
    this.portfolioState.deleteHolding(holding.id, () => {
      if (this.editingId === holding.id) this.cancelEdit();
    });
  }
}

