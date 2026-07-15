import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NgIf } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { appColors } from '../../shared/theme/colors';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    RouterModule,
    NgIf
  ],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav mode="side" [opened]="isOpen" [class.collapsed]="!isOpen" class="sidenav">
        <div class="sidenav-header">
          <h3 class="logo">Portfolio Insights</h3>
          <button mat-icon-button class="collapse-button" (click)="toggle()" aria-label="Toggle sidebar">
            <mat-icon>{{ isOpen ? 'chevron_left' : 'chevron_right' }}</mat-icon>
          </button>
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon>dashboard</mat-icon>
            <span *ngIf="isOpen">Dashboard</span>
          </a>

          <a mat-list-item routerLink="/holdings" routerLinkActive="active-link">
            <mat-icon>table_chart</mat-icon>
            <span *ngIf="isOpen">Holdings</span>
          </a>

          <a mat-list-item routerLink="/performance" routerLinkActive="active-link">
            <mat-icon>show_chart</mat-icon>
            <span *ngIf="isOpen">Performance</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="toggle()">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="title">Portfolio Dashboard</span>

          <span class="spacer"></span>

          <button mat-icon-button (click)="logout()" aria-label="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .container {
      height: 100vh;
    }

    .sidenav {
      width: 240px;
      padding-top: 16px;
      transition: width 0.2s ease;
    }

    .sidenav.collapsed {
      width: 72px;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px 0 12px;
      margin-bottom: 8px;
    }

    .logo {
      margin: 0;
      font-weight: 600;
      font-size: 16px;
      white-space: nowrap;
    }

    .collapse-button {
      color: var(--app-primary);
    }

    .active-link {
      background: rgba(var(--app-primary-rgb), 0.08);
      border-radius: 8px;
    }

    .title {
      margin-left: 12px;
      font-size: 18px;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content {
      padding: 24px;
    }
  `]
})
export class LayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
