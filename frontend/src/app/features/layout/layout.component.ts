import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    RouterModule
  ],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav mode="side" opened class="sidenav">
        <h3 class="logo">Portfolio Insights</h3>

        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>

          <a mat-list-item routerLink="/holdings">
            <mat-icon>table_chart</mat-icon>
            <span>Holdings</span>
          </a>

          <a mat-list-item routerLink="/performance">
            <mat-icon>show_chart</mat-icon>
            <span>Performance</span>
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

          <button mat-icon-button>
            <mat-icon>account_circle</mat-icon>
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
    }

    .logo {
      text-align: center;
      margin-bottom: 16px;
      font-weight: 600;
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
  toggle() {
    // For mobile later
  }
}
