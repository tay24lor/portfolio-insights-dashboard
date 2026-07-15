import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PerformanceComponent } from './performance.component';
import { PortfolioService } from '../../core/services/portfolio.service';

describe('PerformanceComponent', () => {
  let component: PerformanceComponent;
  let fixture: ComponentFixture<PerformanceComponent>;

  beforeEach(async () => {
    const portfolioServiceSpy = jasmine.createSpyObj('PortfolioService', ['getSummary']);
    portfolioServiceSpy.getSummary.and.returnValue(of({
      total_value: 120000,
      holdings_count: 2,
      allocation: []
    }));

    await TestBed.configureTestingModule({
      imports: [PerformanceComponent],
      providers: [{ provide: PortfolioService, useValue: portfolioServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(PerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the performance summary and trend section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Performance');
    expect(compiled.textContent).toContain('Portfolio Value Trend');
  });
});
