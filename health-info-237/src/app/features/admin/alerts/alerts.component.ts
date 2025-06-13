import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AlertDetailsModalComponent } from './alert-details-modal/alert-details-modal.component';
import { CreateAlertModalComponent } from './create-alert-modal/create-alert-modal.component';
import { SupabaseService } from '../../../core/services/supabase.service';

interface Alert {
  id: number;
  title: string;
  message: string;
  type: 'disease' | 'safety' | 'system' | 'user';
  severity: 'error' | 'warning' | 'success' | 'info';
  status: 'active' | 'resolved' | 'acknowledged';
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  assigned_to?: string;
}

@Component({
  selector: 'app-alerts',
  template: `
    <ion-content class="ion-padding">
      <ion-grid>
        <!-- Alert Filters -->
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-content>
                <ion-grid>
                  <ion-row>
                    <ion-col size="12" sizeMd="4">
                      <ion-item>
                        <ion-label>Alert Type</ion-label>
                        <ion-select [(ngModel)]="filters.type" (ionChange)="applyFilters()">
                          <ion-select-option value="">All Types</ion-select-option>
                          <ion-select-option value="disease">Disease</ion-select-option>
                          <ion-select-option value="safety">Safety</ion-select-option>
                          <ion-select-option value="system">System</ion-select-option>
                          <ion-select-option value="user">User</ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-col>
                    <ion-col size="12" sizeMd="4">
                      <ion-item>
                        <ion-label>Severity</ion-label>
                        <ion-select [(ngModel)]="filters.severity" (ionChange)="applyFilters()">
                          <ion-select-option value="">All Severities</ion-select-option>
                          <ion-select-option value="error">Error</ion-select-option>
                          <ion-select-option value="warning">Warning</ion-select-option>
                          <ion-select-option value="success">Success</ion-select-option>
                          <ion-select-option value="info">Info</ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-col>
                    <ion-col size="12" sizeMd="4">
                      <ion-item>
                        <ion-label>Status</ion-label>
                        <ion-select [(ngModel)]="filters.status" (ionChange)="applyFilters()">
                          <ion-select-option value="">All Statuses</ion-select-option>
                          <ion-select-option value="active">Active</ion-select-option>
                          <ion-select-option value="acknowledged">Acknowledged</ion-select-option>
                          <ion-select-option value="resolved">Resolved</ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Alerts List -->
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Alerts</ion-card-title>
                <ion-card-subtitle>Manage system alerts and notifications</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item *ngFor="let alert of filteredAlerts" [class]="alert.severity">
                    <ion-icon 
                      [name]="getAlertIcon(alert.type)" 
                      slot="start"
                      [color]="getAlertColor(alert.severity)">
                    </ion-icon>
                    <ion-label>
                      <h2>{{ alert.title }}</h2>
                      <p>{{ alert.message }}</p>
                      <p class="alert-meta">
                        <ion-badge [color]="getAlertColor(alert.severity)">{{ alert.severity }}</ion-badge>
                        <ion-badge [color]="getStatusColor(alert.status)">{{ alert.status }}</ion-badge>
                        <span *ngIf="alert.location">
                          <ion-icon name="location-outline"></ion-icon>
                          {{ alert.location }}
                        </span>
                        <span class="alert-time">
                          {{ alert.createdAt | date:'medium' }}
                        </span>
                      </p>
                    </ion-label>
                    <ion-buttons slot="end">
                      <ion-button (click)="viewAlertDetails(alert)">
                        <ion-icon name="eye-outline"></ion-icon>
                      </ion-button>
                      <ion-button (click)="updateAlertStatus(alert)" [color]="getActionButtonColor(alert.status)">
                        <ion-icon [name]="getActionButtonIcon(alert.status)"></ion-icon>
                      </ion-button>
                    </ion-buttons>
                  </ion-item>
                </ion-list>

                <!-- Create Alert Button -->
                <div class="ion-padding">
                  <ion-button expand="block" (click)="createAlert()">
                    <ion-icon name="add-circle-outline" slot="start"></ion-icon>
                    Create New Alert
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 1rem 0;
    }
    .alert-meta {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      margin-top: 0.5rem;
    }
    .alert-meta ion-badge {
      margin-right: 0.5rem;
    }
    .alert-meta span {
      margin-right: 1rem;
      display: inline-flex;
      align-items: center;
    }
    .alert-meta ion-icon {
      margin-right: 0.25rem;
    }
    .alert-time {
      color: var(--ion-color-medium);
    }
    ion-item.error {
      --background: var(--ion-color-danger-tint);
    }
    ion-item.warning {
      --background: var(--ion-color-warning-tint);
    }
    ion-item.success {
      --background: var(--ion-color-success-tint);
    }
    ion-item.info {
      --background: var(--ion-color-primary-tint);
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AlertsComponent implements OnInit {
  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  filters = {
    type: '',
    severity: '',
    status: ''
  };

  constructor(
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.loadAlerts();
  }

  async loadAlerts() {
    const { data, error } = await this.supabaseService.getSystemAlerts();
    if (error) {
      console.error('Error loading alerts:', error);
    } else {
      this.alerts = data || [];
      this.applyFilters();
    }
  }

  applyFilters() {
    this.filteredAlerts = this.alerts.filter(alert => {
      const matchesType = !this.filters.type || alert.type === this.filters.type;
      const matchesSeverity = !this.filters.severity || alert.severity === this.filters.severity;
      const matchesStatus = !this.filters.status || alert.status === this.filters.status;
      return matchesType && matchesSeverity && matchesStatus;
    });
  }

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
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
        return 'primary';
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
        return 'success';
      case 'acknowledged':
        return 'success';
      case 'resolved':
        return 'medium';
      default:
        return 'medium';
    }
  }

  getActionButtonIcon(status: string): string {
    switch (status) {
      case 'active':
        return 'checkmark-circle-outline';
      case 'acknowledged':
        return 'checkmark-circle-outline';
      case 'resolved':
        return 'close-circle-outline';
      default:
        return 'alert-circle-outline';
    }
  }

  async viewAlertDetails(alert: Alert) {
    const modal = await this.modalCtrl.create({
      component: AlertDetailsModalComponent,
      componentProps: { alert }
    });
    await modal.present();
  }

  async updateAlertStatus(alert: Alert) {
    const newStatus = alert.status === 'active' ? 'acknowledged' : 'resolved';
    const { error } = await this.supabaseService.updateAlert(alert.id, { 
      status: newStatus,
      updatedAt: new Date()
    });
    if (error) {
      console.error('Error updating alert status:', error);
    } else {
      alert.status = newStatus;
      alert.updatedAt = new Date();
      this.showToast(`Alert ${newStatus}`);
    }
  }

  async createAlert() {
    const modal = await this.modalCtrl.create({
      component: CreateAlertModalComponent
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      const alertData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const { error } = await this.supabaseService.createAlert(alertData);
      if (error) {
        console.error('Error creating alert:', error);
      } else {
        this.showToast('Alert created successfully');
        this.loadAlerts();
      }
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
} 