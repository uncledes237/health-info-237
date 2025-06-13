import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

interface Alert {
  id: number;
  title: string;
  message: string;
  type: 'disease' | 'safety' | 'system' | 'user';
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved';
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-alert-details-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Alert Details</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ alert.title }}</ion-card-title>
          <ion-card-subtitle>
            <ion-badge [color]="getAlertColor(alert.severity)">{{ alert.severity }}</ion-badge>
            <ion-badge [color]="getStatusColor(alert.status)">{{ alert.status }}</ion-badge>
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <!-- Alert Information -->
          <ion-list>
            <ion-item>
              <ion-icon [name]="getAlertIcon(alert.type)" slot="start" [color]="getAlertColor(alert.severity)"></ion-icon>
              <ion-label>
                <h3>Type</h3>
                <p>{{ alert.type | titlecase }}</p>
              </ion-label>
            </ion-item>

            <ion-item *ngIf="alert.location">
              <ion-icon name="location-outline" slot="start"></ion-icon>
              <ion-label>
                <h3>Location</h3>
                <p>{{ alert.location }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon name="time-outline" slot="start"></ion-icon>
              <ion-label>
                <h3>Created</h3>
                <p>{{ alert.createdAt | date:'medium' }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon name="refresh-outline" slot="start"></ion-icon>
              <ion-label>
                <h3>Last Updated</h3>
                <p>{{ alert.updatedAt | date:'medium' }}</p>
              </ion-label>
            </ion-item>
          </ion-list>

          <!-- Alert Message -->
          <ion-item-divider>
            <ion-label>Message</ion-label>
          </ion-item-divider>
          <div class="message-content">
            {{ alert.message }}
          </div>

          <!-- Action Buttons -->
          <div class="ion-padding-top">
            <ion-button expand="block" [color]="getActionButtonColor(alert.status)" (click)="updateStatus()">
              <ion-icon [name]="getActionButtonIcon(alert.status)" slot="start"></ion-icon>
              {{ getActionButtonText(alert.status) }}
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 0;
    }
    ion-badge {
      margin-right: 0.5rem;
    }
    .message-content {
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 4px;
      margin: 1rem 0;
      white-space: pre-wrap;
    }
    ion-item-divider {
      margin-top: 1rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AlertDetailsModalComponent {
  @Input() alert!: Alert;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  getAlertIcon(type: string): string {
    switch (type) {
      case 'disease':
        return 'bug-outline';
      case 'safety':
        return 'shield-checkmark-outline';
      case 'system':
        return 'server-outline';
      case 'user':
        return 'person-outline';
      default:
        return 'alert-circle-outline';
    }
  }

  getAlertColor(severity: string): string {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'medium';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'danger';
      case 'acknowledged':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'medium';
    }
  }

  getActionButtonColor(status: string): string {
    switch (status) {
      case 'active':
        return 'warning';
      case 'acknowledged':
        return 'success';
      default:
        return 'medium';
    }
  }

  getActionButtonIcon(status: string): string {
    switch (status) {
      case 'active':
        return 'checkmark-circle-outline';
      case 'acknowledged':
        return 'checkmark-done-circle-outline';
      default:
        return 'refresh-outline';
    }
  }

  getActionButtonText(status: string): string {
    switch (status) {
      case 'active':
        return 'Acknowledge Alert';
      case 'acknowledged':
        return 'Resolve Alert';
      default:
        return 'Reactivate Alert';
    }
  }

  async updateStatus() {
    try {
      // TODO: Implement alert status update logic
      switch (this.alert.status) {
        case 'active':
          this.alert.status = 'acknowledged';
          break;
        case 'acknowledged':
          this.alert.status = 'resolved';
          break;
        default:
          this.alert.status = 'active';
      }
      this.alert.updatedAt = new Date();
      this.showToast(`Alert ${this.alert.status} successfully`);
      this.dismiss(true); // Dismiss with update flag
    } catch (error) {
      console.error('Error updating alert status:', error);
      this.showToast('Failed to update alert status');
    }
  }

  dismiss(updated: boolean = false) {
    this.modalCtrl.dismiss(updated);
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