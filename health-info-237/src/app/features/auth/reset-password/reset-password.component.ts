import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AuthError } from '@supabase/supabase-js';

interface PasswordResetError {
  message?: string;
  status?: number;
  name?: string;
}

@Component({
  selector: 'app-reset-password',
  template: `
    <ion-content class="ion-padding">
      <ion-grid class="ion-align-items-center ion-justify-content-center" style="height: 100%">
        <ion-row>
          <ion-col size="12" sizeMd="6" sizeLg="4">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Reset Password</ion-card-title>
                <ion-card-subtitle>Enter your new password</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <form [formGroup]="form" (ngSubmit)="onSubmit()">
                  <ion-item>
                    <ion-label position="floating">New Password</ion-label>
                    <ion-input type="password" formControlName="password"></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-label position="floating">Confirm Password</ion-label>
                    <ion-input type="password" formControlName="confirmPassword"></ion-input>
                  </ion-item>

                  <div class="ion-padding-top">
                    <ion-button expand="block" type="submit" [disabled]="!form.valid || isSubmitting">
                      {{ isSubmitting ? 'Updating...' : 'Update Password' }}
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
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 0;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Check if we have a valid reset token in the URL
    this.route.queryParams.subscribe(params => {
      if (!params['token']) {
        this.errorMessage = 'Invalid or missing reset token';
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  async onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { password } = this.form.value;
        const { error } = await this.supabaseService.updateUserPassword(password);

        if (error) {
          const typedError = error as PasswordResetError;
          console.error('Error updating password:', typedError);
          this.errorMessage = typedError.message || 'Failed to update password';
        } else {
          console.log('Password updated successfully');
          this.successMessage = 'Password updated successfully. Redirecting to login...';
          // Redirect to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      } catch (error: any) {
        const typedError = error as PasswordResetError;
        console.error('Error in password reset:', typedError);
        this.errorMessage = typedError.message || 'An unexpected error occurred';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
} 