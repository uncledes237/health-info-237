import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-alerts',
  template: `
    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Alerts</ion-card-title>
                <ion-card-subtitle>View and manage system alerts</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item *ngFor="let alert of alerts">
                    <ion-icon [name]="getIconName(alert.severity)" slot="start" [color]="getIconColor(alert.severity)"></ion-icon>
                    <ion-label>
                      <h2>{{ alert.title }}</h2>
                      <p>{{ alert.message }}</p>
                      <p class="timestamp">{{ alert.timestamp | date:'medium' }}</p>
                    </ion-label>
                    <ion-button fill="clear" slot="end" (click)="markAsResolved(alert)">
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                    </ion-button>
                  </ion-item>
                </ion-list>
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
    .timestamp {
      font-size: 0.8em;
      color: var(--ion-color-medium);
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AlertsComponent implements OnInit {
  alerts: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadAlerts();
  }

  async loadAlerts() {
    const { data, error } = await this.supabaseService.getSystemAlerts();
    if (error) {
      console.error('Error loading alerts:', error);
    } else {
      this.alerts = data || [];
    }
  }

  async markAsResolved(alert: any) {
    const { error } = await this.supabaseService.updateAlert(alert.id, { status: 'resolved' });
    if (error) {
      console.error('Error marking alert as resolved:', error);
    } else {
      alert.status = 'resolved';
    }
  }

  getIconName(severity: string): string {
    switch (severity) {
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      case 'success': return 'checkmark-circle';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  }

  getIconColor(severity: string): string {
    switch (severity) {
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'info': return 'primary';
      default: return 'medium';
    }
  }
} 