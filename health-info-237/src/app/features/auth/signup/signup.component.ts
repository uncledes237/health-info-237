import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  template: `
    <ion-content class="ion-padding">
      <div class="signup-container">
        <ion-card>
          <ion-card-header>
            <div class="ion-text-center">
              <ion-icon name="medkit-outline" class="logo-icon"></ion-icon>
              <ion-card-title>Join Health Dashboard</ion-card-title>
              <ion-card-subtitle>Create your account to access health information and services</ion-card-subtitle>
            </div>
          </ion-card-header>
          <ion-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <!-- Personal Information -->
              <ion-item-divider>
                <ion-label>Personal Information</ion-label>
              </ion-item-divider>
              
              <ion-item>
                <ion-label position="floating">Full Name</ion-label>
                <ion-input type="text" formControlName="full_name"></ion-input>
                <ion-note slot="error" *ngIf="form.get('full_name')?.errors?.['required'] && form.get('full_name')?.touched">
                  Full name is required
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Email</ion-label>
                <ion-input type="email" formControlName="email"></ion-input>
                <ion-note slot="error" *ngIf="form.get('email')?.errors?.['required'] && form.get('email')?.touched">
                  Email is required
                </ion-note>
                <ion-note slot="error" *ngIf="form.get('email')?.errors?.['email'] && form.get('email')?.touched">
                  Please enter a valid email
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Location</ion-label>
                <ion-input type="text" formControlName="location" placeholder="Town, Region"></ion-input>
              </ion-item>

              <!-- Account Security -->
              <ion-item-divider>
                <ion-label>Account Security</ion-label>
              </ion-item-divider>

              <ion-item>
                <ion-label position="floating">Password</ion-label>
                <ion-input type="password" formControlName="password"></ion-input>
                <ion-note slot="error" *ngIf="form.get('password')?.errors?.['required'] && form.get('password')?.touched">
                  Password is required
                </ion-note>
                <ion-note slot="error" *ngIf="form.get('password')?.errors?.['minlength'] && form.get('password')?.touched">
                  Password must be at least 8 characters
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Confirm Password</ion-label>
                <ion-input type="password" formControlName="confirmPassword"></ion-input>
                <ion-note slot="error" *ngIf="form.get('confirmPassword')?.errors?.['required'] && form.get('confirmPassword')?.touched">
                  Please confirm your password
                </ion-note>
                <ion-note slot="error" *ngIf="form.errors?.['passwordMismatch'] && form.get('confirmPassword')?.touched">
                  Passwords do not match
                </ion-note>
              </ion-item>

              <div class="ion-padding-top">
                <ion-button expand="block" type="submit" [disabled]="!form.valid || isSubmitting">
                  {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
                </ion-button>
              </div>

              <div class="ion-padding-top ion-text-center">
                <ion-text color="medium">Already have an account?</ion-text>
                <ion-button fill="clear" routerLink="/login">
                  Login
                </ion-button>
              </div>

              <div *ngIf="errorMessage" class="ion-padding-top ion-text-center">
                <ion-text color="danger">{{ errorMessage }}</ion-text>
              </div>

              <div *ngIf="successMessage" class="ion-padding-top ion-text-center">
                <ion-text color="success">{{ successMessage }}</ion-text>
              </div>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .signup-container {
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

    ion-item-divider {
      --background: var(--ion-color-light);
      --color: var(--ion-color-medium);
      font-size: 0.9em;
      margin-top: 16px;
    }

    ion-note {
      font-size: 0.8em;
    }

    @media (max-width: 576px) {
      .signup-container {
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
export class SignupComponent {
  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      location: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['public_user']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { email, password, full_name, location } = this.form.value;
        const { error } = await this.authService.signUp(email, password, {
          full_name,
          role: 'public_user',
          location,
          status: 'active'
        });

        if (error) {
          console.error('Error signing up:', error);
          this.errorMessage = error.message || 'Failed to create account';
        } else {
          console.log('Account created successfully');
          this.successMessage = 'Account created successfully! Redirecting to login...';
          // Redirect to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error in signup:', error);
        this.errorMessage = error.message || 'An unexpected error occurred';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
} 