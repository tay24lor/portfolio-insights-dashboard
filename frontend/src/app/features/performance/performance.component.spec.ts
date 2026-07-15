import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PerformanceComponent } from './performance.component';
import { PortfolioService } from '../../core/services/portfolio.service';

describe('PerformanceComponent', () => {
  let component: PerformanceComponent;
  let fixture: ComponentFixture<PerformanceComponent>;

  beforeEach(async () => {
    const portfolioServiceSpy = jasmine.createSpyObj('PortfolioService', ['getPerformance']);
    portfolioServiceSpy.getPerformance.and.returnValue(of({
      total_return: 20000,
      return_rate: 20,
      trend: [{ label: 'Jan', value: 60 }]
    }));

    await TestBed.configureTestingModule({
      imports: [PerformanceComponent],
      providers: [{ provide: PortfolioService, useValue: portfolioServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(PerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the performance summary and trend data from the API', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Performance');
    expect(compiled.textContent).toContain('Portfolio Value Trend');
    expect(compiled.textContent).toContain('Jan');
  });
});
