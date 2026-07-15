import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { PortfolioService } from '../../core/services/portfolio.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const portfolioServiceSpy = jasmine.createSpyObj('PortfolioService', ['getSummary', 'getHoldings']);
    portfolioServiceSpy.getSummary.and.returnValue(of({
      total_value: 120000,
      holdings_count: 2,
      allocation: [{ symbol: 'AAPL', value: 60000, percentage: 50 }]
    }));
    portfolioServiceSpy.getHoldings.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: PortfolioService, useValue: portfolioServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the allocation chart and breakdown from the portfolio summary', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('svg.allocation-chart')).not.toBeNull();
    expect(compiled.textContent).toContain('Allocation');
    expect(compiled.textContent).toContain('AAPL');
    expect(compiled.textContent).toContain('50%');
  });
});
