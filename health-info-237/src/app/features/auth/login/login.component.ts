import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <ion-content class="ion-padding">
      <div class="login-container">
        <ion-card>
          <ion-card-header>
            <div class="ion-text-center">
              <ion-icon name="medkit-outline" class="logo-icon"></ion-icon>
              <ion-card-title>Welcome to Health Dashboard 237</ion-card-title>
              <ion-card-subtitle>Access your health information and services</ion-card-subtitle>
            </div>
          </ion-card-header>
          <ion-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <ion-item>
                <ion-label position="floating">Email</ion-label>
                <ion-input type="email" formControlName="email" autocomplete="email"></ion-input>
                <ion-note slot="error" *ngIf="form.get('email')?.errors?.['required'] && form.get('email')?.touched">
                  Email is required
                </ion-note>
                <ion-note slot="error" *ngIf="form.get('email')?.errors?.['email'] && form.get('email')?.touched">
                  Please enter a valid email
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Password</ion-label>
                <ion-input 
                  [type]="showPassword ? 'text' : 'password'" 
                  formControlName="password"
                  autocomplete="current-password">
                </ion-input>
                <ion-button fill="clear" slot="end" (click)="togglePasswordVisibility()">
                  <ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                </ion-button>
                <ion-note slot="error" *ngIf="form.get('password')?.errors?.['required'] && form.get('password')?.touched">
                  Password is required
                </ion-note>
              </ion-item>

              <div class="ion-padding-top">
                <ion-button expand="block" type="submit" [disabled]="!form.valid || isSubmitting">
                  {{ isSubmitting ? 'Logging in...' : 'Login' }}
                </ion-button>
              </div>

              <div class="ion-padding-top ion-text-center">
                <ion-button fill="clear" (click)="requestPasswordReset()">
                  Forgot Password?
                </ion-button>
              </div>

              <div class="ion-padding-top ion-text-center">
                <ion-text color="medium">Don't have an account?</ion-text>
                <ion-button fill="clear" routerLink="/signup">
                  Sign Up
                </ion-button>
              </div>

              <div *ngIf="errorMessage" class="ion-padding-top ion-text-center">
                <ion-text color="danger">{{ errorMessage }}</ion-text>
              </div>

              <div *ngIf="successMessage" class="ion-padding-top ion-text-center">
                <ion-text color="success">{{ successMessage }}</ion-text>
              </div>
            </form>

            <!-- Role-based Information -->
            <div class="ion-padding-top ion-text-center role-info">
              <ion-text color="medium">
                <p>This platform provides different access levels:</p>
                <ul class="ion-text-start">
                  <li><strong>General Public:</strong> Access to health information, disease statistics, and public health updates</li>
                  <li><strong>Health Officials:</strong> Access to health monitoring, reporting tools, and disease management systems</li>
                </ul>
              </ion-text>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    ion-card {
      width: 100%;
      max-width: 500px;
      margin: 0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .logo-icon {
      font-size: 48px;
      color: var(--ion-color-primary);
      margin-bottom: 16px;
    }

    ion-button[fill="clear"] {
      --color: var(--ion-color-primary);
      font-size: 0.9em;
    }

    ion-text[color="medium"] {
      font-size: 0.9em;
      margin-right: 4px;
    }

    .role-info {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--ion-color-light);
    }

    .role-info ul {
      list-style-type: none;
      padding-left: 0;
      margin: 8px 0;
    }

    .role-info li {
      margin: 8px 0;
      font-size: 0.9em;
    }

    ion-note {
      font-size: 0.8em;
    }

    @media (max-width: 576px) {
      .login-container {
        padding: 16px;
      }

      ion-card {
        margin: 0;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule]
})
export class LoginComponent {
  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async requestPasswordReset() {
    const email = this.form.get('email')?.value;
    if (!email) {
      this.errorMessage = 'Please enter your email address first';
      return;
    }

    try {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { error } = await this.authService.requestPasswordReset(email);
      if (error) {
        console.error('Error requesting password reset:', error);
        this.errorMessage = error.message || 'Failed to send reset email';
      } else {
        console.log('Password reset email sent successfully');
        this.successMessage = 'Password reset instructions have been sent to your email';
      }
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      this.errorMessage = error.message || 'An unexpected error occurred';
    } finally {
      this.isSubmitting = false;
    }
  }

  async onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { email, password } = this.form.value;
        const { error } = await this.authService.signIn(email, password);
        if (error) throw error;

        const user = this.authService.getCurrentUser();
        if (user?.role === 'admin') {
          await this.router.navigate(['/admin']);
        } else if (user?.role === 'health_official') {
          await this.router.navigate(['/health-official']);
        } else {
          await this.router.navigate(['/dashboard']);
        }
      } catch (error: any) {
        console.error('Error logging in:', error);
        this.errorMessage = error.message || 'Failed to login. Please check your credentials and try again.';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
} 