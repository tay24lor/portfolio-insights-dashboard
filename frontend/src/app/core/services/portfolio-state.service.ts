import { Injectable, computed, inject, signal } from '@angular/core';
import { HoldingInput, HoldingRow, PortfolioService } from './portfolio.service';

@Injectable({ providedIn: 'root' })
export class PortfolioStateService {
  private portfolioService = inject(PortfolioService);

  readonly holdings = signal<HoldingRow[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalValue = computed(() => this.holdings().reduce(
    (total, holding) => total + holding.shares * holding.current_price,
    0
  ));

  loadHoldings(onComplete?: () => void) {
    this.loading.set(true);
    this.error.set(null);
    this.portfolioService.getHoldings().subscribe({
      next: holdings => {
        this.holdings.set(holdings);
        this.loading.set(false);
        onComplete?.();
      },
      error: () => {
        this.error.set('Unable to load holdings.');
        this.loading.set(false);
        onComplete?.();
      }
    });
  }

  createHolding(input: HoldingInput, onSuccess?: () => void) {
    this.saving.set(true);
    this.error.set(null);
    this.portfolioService.createHolding(input).subscribe({
      next: holding => {
        this.holdings.update(current => [...current, holding].sort((a, b) => a.symbol.localeCompare(b.symbol)));
        this.saving.set(false);
        onSuccess?.();
      },
      error: () => {
        this.error.set('Unable to save the holding. Please try again.');
        this.saving.set(false);
      }
    });
  }

  updateHolding(id: number, input: Partial<HoldingInput>, onSuccess?: () => void) {
    this.saving.set(true);
    this.error.set(null);
    this.portfolioService.updateHolding(id, input).subscribe({
      next: holding => {
        this.holdings.update(current => current.map(item => item.id === id ? holding : item));
        this.saving.set(false);
        onSuccess?.();
      },
      error: () => {
        this.error.set('Unable to save changes. Please try again.');
        this.saving.set(false);
      }
    });
  }

  deleteHolding(id: number, onSuccess?: () => void) {
    this.saving.set(true);
    this.error.set(null);
    this.portfolioService.deleteHolding(id).subscribe({
      next: () => {
        this.holdings.update(current => current.filter(item => item.id !== id));
        this.saving.set(false);
        onSuccess?.();
      },
      error: () => {
        this.error.set('Unable to delete the holding. Please try again.');
        this.saving.set(false);
      }
    });
  }
}
