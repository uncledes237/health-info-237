import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-report-case',
  template: `
    <ion-content class="ion-padding">
      <div class="report-case-container">
        <ion-card>
          <ion-card-header>
            <div class="ion-text-center">
              <ion-icon name="alert-circle-outline" class="header-icon"></ion-icon>
              <ion-card-title>Report a Health Case</ion-card-title>
              <ion-card-subtitle>Help us track and respond to health concerns in your area</ion-card-subtitle>
            </div>
          </ion-card-header>
          <ion-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <!-- Case Information -->
              <ion-item-divider>
                <ion-label>Case Information</ion-label>
              </ion-item-divider>

              <ion-item>
                <ion-label position="floating">Case Type</ion-label>
                <ion-select formControlName="caseType" interface="popover">
                  <ion-select-option value="infectious">Infectious Disease</ion-select-option>
                  <ion-select-option value="chronic">Chronic Disease</ion-select-option>
                  <ion-select-option value="other">Other Health Concern</ion-select-option>
                </ion-select>
                <ion-note slot="error" *ngIf="form.get('caseType')?.errors?.['required'] && form.get('caseType')?.touched">
                  Please select a case type
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Title</ion-label>
                <ion-input type="text" formControlName="title" placeholder="Brief description of the case"></ion-input>
                <ion-note slot="error" *ngIf="form.get('title')?.errors?.['required'] && form.get('title')?.touched">
                  Title is required
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Description</ion-label>
                <ion-textarea 
                  formControlName="description" 
                  placeholder="Provide detailed information about the case"
                  rows="4">
                </ion-textarea>
                <ion-note slot="error" *ngIf="form.get('description')?.errors?.['required'] && form.get('description')?.touched">
                  Description is required
                </ion-note>
              </ion-item>

              <!-- Location Information -->
              <ion-item-divider>
                <ion-label>Location Information</ion-label>
              </ion-item-divider>

              <ion-item>
                <ion-label position="floating">Region</ion-label>
                <ion-input type="text" formControlName="region" placeholder="South West"></ion-input>
                <ion-note slot="error" *ngIf="form.get('region')?.errors?.['required'] && form.get('region')?.touched">
                  Region is required
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="floating">City/Town</ion-label>
                <ion-input type="text" formControlName="city" placeholder="City or Town"></ion-input>
                <ion-note slot="error" *ngIf="form.get('city')?.errors?.['required'] && form.get('city')?.touched">
                  City/Town is required
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Additional Location Details</ion-label>
                <ion-textarea 
                  formControlName="locationDetails" 
                  placeholder="Any additional location information (optional)"
                  rows="2">
                </ion-textarea>
              </ion-item>

              <!-- Contact Information -->
              <ion-item-divider>
                <ion-label>Contact Information</ion-label>
              </ion-item-divider>

              <ion-item>
                <ion-label position="floating">Phone Number</ion-label>
                <ion-input type="tel" formControlName="phone" placeholder="Your contact number"></ion-input>
                <ion-note slot="error" *ngIf="form.get('phone')?.errors?.['required'] && form.get('phone')?.touched">
                  Phone number is required
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Additional Contact Information</ion-label>
                <ion-textarea 
                  formControlName="additionalContact" 
                  placeholder="Any other way to reach you (optional)"
                  rows="2">
                </ion-textarea>
              </ion-item>

              <div class="ion-padding-top">
                <ion-button expand="block" type="submit" [disabled]="!form.valid || isSubmitting">
                  {{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
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
    .report-case-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 20px;
    }

    ion-card {
      width: 100%;
      max-width: 800px;
      margin: 0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .header-icon {
      font-size: 48px;
      color: var(--ion-color-primary);
      margin-bottom: 16px;
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
      .report-case-container {
        padding: 16px;
      }

      ion-card {
        margin: 0;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ReportCaseComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private toastCtrl: ToastController
  ) {
    this.form = this.fb.group({
      caseType: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      region: ['', Validators.required],
      city: ['', Validators.required],
      locationDetails: [''],
      phone: ['', [Validators.required, Validators.pattern('^[+]?[0-9]{8,15}$')]],
      additionalContact: ['']
    });
  }

  ngOnInit() {
    console.log('ReportCaseComponent: ngOnInit called.');
  }

  async onSubmit() {
    console.log('ReportCaseComponent: onSubmit called.');
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      console.warn('ReportCaseComponent: Form is invalid. Marking all fields as touched.');
      this.form.markAllAsTouched();
      this.isSubmitting = false;
      await this.presentToast('Please fill in all required fields.', 'danger');
      return;
    }

    try {
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser) {
        this.errorMessage = 'User not logged in.';
        await this.presentToast(this.errorMessage, 'danger');
        console.error('ReportCaseComponent: User not logged in when trying to submit case.');
        this.isSubmitting = false;
        return;
      }

      const formData = this.form.value;
      const caseReport = {
        user_id: currentUser.id,
        disease_type: formData.caseType,
        title: formData.title,
        symptoms: formData.description,
        location: `${formData.region}, ${formData.city}${formData.locationDetails ? ', ' + formData.locationDetails : ''}`,
        report_date: new Date().toISOString().split('T')[0],
        phone_number: formData.phone,
        additional_contact_info: formData.additionalContact,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      console.log('ReportCaseComponent: Attempting to insert case report:', caseReport);
      const { data, error } = await this.supabaseService.createCaseReport(caseReport);

      if (error) {
        console.error('ReportCaseComponent: Error creating case report:', (error as any).message);
        this.errorMessage = `Failed to report case: ${(error as any).message || 'Unknown error'}`;
        await this.presentToast(this.errorMessage, 'danger');
      } else {
        console.log('ReportCaseComponent: Case reported successfully:', data);
        this.successMessage = 'Case reported successfully!';
        await this.presentToast(this.successMessage, 'success');
        this.form.reset();
        // Reset validation states
        Object.keys(this.form.controls).forEach(key => {
          this.form.get(key)?.setErrors(null);
        });
        this.form.markAsPristine();
        this.form.markAsUntouched();
      }
    } catch (err: any) {
      console.error('ReportCaseComponent: Unexpected error during submission:', err);
      this.errorMessage = `An unexpected error occurred: ${err.message || err}`;
      await this.presentToast(this.errorMessage, 'danger');
    } finally {
      this.isSubmitting = false;
      console.log('ReportCaseComponent: Submission process finished. isSubmitting set to false.');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    toast.present();
  }
}