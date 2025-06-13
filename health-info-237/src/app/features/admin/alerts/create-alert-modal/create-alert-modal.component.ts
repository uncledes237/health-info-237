import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface AlertForm {
  title: string;
  message: string;
  type: 'disease' | 'safety' | 'system' | 'user';
  severity: 'high' | 'medium' | 'low';
  location?: string;
}

@Component({
  selector: 'app-create-alert-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Create New Alert</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="alertForm" (ngSubmit)="createAlert()">
        <ion-card>
          <ion-card-content>
            <!-- Alert Type -->
            <ion-item>
              <ion-label position="stacked">Alert Type</ion-label>
              <ion-select formControlName="type" interface="popover">
                <ion-select-option value="disease">Disease</ion-select-option>
                <ion-select-option value="safety">Safety</ion-select-option>
                <ion-select-option value="system">System</ion-select-option>
                <ion-select-option value="user">User</ion-select-option>
              </ion-select>
              <ion-note slot="error" *ngIf="alertForm.get('type')?.errors?.['required'] && alertForm.get('type')?.touched">
                Alert type is required
              </ion-note>
            </ion-item>

            <!-- Alert Title -->
            <ion-item>
              <ion-label position="stacked">Title</ion-label>
              <ion-input formControlName="title" placeholder="Enter alert title"></ion-input>
              <ion-note slot="error" *ngIf="alertForm.get('title')?.errors?.['required'] && alertForm.get('title')?.touched">
                Title is required
              </ion-note>
              <ion-note slot="error" *ngIf="alertForm.get('title')?.errors?.['minlength'] && alertForm.get('title')?.touched">
                Title must be at least 3 characters
              </ion-note>
            </ion-item>

            <!-- Alert Message -->
            <ion-item>
              <ion-label position="stacked">Message</ion-label>
              <ion-textarea
                formControlName="message"
                placeholder="Enter alert message"
                rows="4"
                autoGrow="true">
              </ion-textarea>
              <ion-note slot="error" *ngIf="alertForm.get('message')?.errors?.['required'] && alertForm.get('message')?.touched">
                Message is required
              </ion-note>
              <ion-note slot="error" *ngIf="alertForm.get('message')?.errors?.['minlength'] && alertForm.get('message')?.touched">
                Message must be at least 10 characters
              </ion-note>
            </ion-item>

            <!-- Severity -->
            <ion-item>
              <ion-label position="stacked">Severity</ion-label>
              <ion-select formControlName="severity" interface="popover">
                <ion-select-option value="high">High</ion-select-option>
                <ion-select-option value="medium">Medium</ion-select-option>
                <ion-select-option value="low">Low</ion-select-option>
              </ion-select>
              <ion-note slot="error" *ngIf="alertForm.get('severity')?.errors?.['required'] && alertForm.get('severity')?.touched">
                Severity is required
              </ion-note>
            </ion-item>

            <!-- Location (Optional) -->
            <ion-item>
              <ion-label position="stacked">Location (Optional)</ion-label>
              <ion-input formControlName="location" placeholder="Enter location"></ion-input>
            </ion-item>

            <!-- Submit Button -->
            <div class="ion-padding-top">
              <ion-button expand="block" type="submit" [disabled]="!alertForm.valid">
                <ion-icon name="add-circle-outline" slot="start"></ion-icon>
                Create Alert
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </form>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 0;
    }
    ion-item {
      --padding-start: 0;
    }
    ion-note {
      font-size: 0.8rem;
      color: var(--ion-color-danger);
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule]
})
export class CreateAlertModalComponent {
  alertForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    this.alertForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      severity: ['medium', Validators.required],
      location: ['']
    });
  }

  async createAlert() {
    if (this.alertForm.valid) {
      try {
        const alertData: AlertForm = this.alertForm.value;
        // TODO: Implement alert creation logic
        console.log('Creating alert:', alertData);
        
        this.showToast('Alert created successfully');
        this.dismiss(true); // Dismiss with success flag
      } catch (error) {
        console.error('Error creating alert:', error);
        this.showToast('Failed to create alert');
      }
    } else {
      this.showToast('Please fill in all required fields');
    }
  }

  dismiss(success: boolean = false) {
    this.modalCtrl.dismiss(success);
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
} 