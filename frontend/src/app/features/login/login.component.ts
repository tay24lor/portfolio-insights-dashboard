import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgIf } from '@angular/common';
import { NgFor } from '@angular/common';


@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    NgIf,
    NgFor
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="login-container" @fadeIn>
      <mat-card class="login-card">
        <h2 class="title">Sign In</h2>

        <form #form="ngForm" (ngSubmit)="login(form)">
          
          <mat-form-field appearance="outline" class="full">
            <mat-label>Email</mat-label>
            <input 
              matInput 
              name="email" 
              [(ngModel)]="email" 
              required 
              email
              #emailCtrl="ngModel"
            >
            <mat-error *ngIf="emailCtrl.invalid && emailCtrl.touched">
              Please enter a valid email
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Password</mat-label>
            <input 
              matInput 
              type="password" 
              name="password" 
              [(ngModel)]="password" 
              required
              minlength="6"
              #passCtrl="ngModel"
            >
            <mat-error *ngIf="passCtrl.invalid && passCtrl.touched">
              Password must be at least 6 characters
            </mat-error>
          </mat-form-field>

          <button 
            mat-raised-button 
            color="primary" 
            class="full" 
            [disabled]="loading || form.invalid"
          >
            <ng-container *ngIf="!loading">Login</ng-container>
            <ng-container *ngIf="loading">
              <mat-spinner diameter="22"></mat-spinner>
            </ng-container>
          </button>

          <div class="forgot">
            <a (click)="forgotPassword()">Forgot password</a>
          </div>

        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #003057, #005a8d);
    }

    .login-card {
      width: 380px;
      padding: 28px;
      text-align: center;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      background: #ffffff;
    }

    .title {
      margin-bottom: 12px;
      font-size: 24px;
      font-weight: 600;
      color: #003057;
    }

    .full {
      width: 100%;
      margin-top: 16px;
    }

    .forgot {
      margin-top: 12px;
      text-align: right;
    }

    .forgot a {
      cursor: pointer;
      color: #005a8d;
      font-size: 14px;
      text-decoration: none;
    }

    .forgot a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  private auth = inject(AuthService);
  private router = inject(Router);

  login(form: NgForm) {
    if (form.invalid) return;

    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        alert('Invalid credentials');
      }
    });
  }

  forgotPassword() {
    alert('Password reset flow coming soon');
  }
}
