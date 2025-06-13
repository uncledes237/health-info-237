import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface SystemAlert {
  id: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

@Component({
  selector: 'app-system-monitoring',
  template: `
    <ion-content class="ion-padding">
      <ion-grid>
        <!-- System Metrics -->
        <ion-row>
          <ion-col size="12" sizeMd="6" sizeLg="3" *ngFor="let metric of systemMetrics">
            <ion-card [class]="metric.status">
              <ion-card-header>
                <ion-card-subtitle>{{ metric.name }}</ion-card-subtitle>
                <ion-card-title>
                  {{ metric.value }} {{ metric.unit }}
                  <ion-icon 
                    [name]="metric.trend === 'up' ? 'arrow-up' : metric.trend === 'down' ? 'arrow-down' : 'remove'"
                    [color]="metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'danger' : 'medium'">
                  </ion-icon>
                </ion-card-title>
              </ion-card-header>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- System Alerts -->
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>System Alerts</ion-card-title>
                <ion-card-subtitle>Recent system events and alerts</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item *ngFor="let alert of systemAlerts" [class]="alert.type">
                    <ion-icon 
                      [name]="alert.type === 'error' ? 'alert-circle' : alert.type === 'warning' ? 'warning' : 'information-circle'"
                      slot="start"
                      [color]="alert.type">
                    </ion-icon>
                    <ion-label>
                      <h2>{{ alert.message }}</h2>
                      <p>{{ alert.timestamp | date:'medium' }}</p>
                    </ion-label>
                    <ion-button 
                      fill="clear" 
                      slot="end" 
                      *ngIf="!alert.resolved"
                      (click)="resolveAlert(alert)">
                      Resolve
                    </ion-button>
                    <ion-badge 
                      *ngIf="alert.resolved" 
                      color="success" 
                      slot="end">
                      Resolved
                    </ion-badge>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- System Health -->
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>System Health</ion-card-title>
                <ion-card-subtitle>Overall system status and performance</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>Database Status</ion-label>
                    <ion-badge slot="end" color="success">Healthy</ion-badge>
                  </ion-item>
                  <ion-item>
                    <ion-label>API Response Time</ion-label>
                    <ion-badge slot="end" color="warning">200ms</ion-badge>
                  </ion-item>
                  <ion-item>
                    <ion-label>Active Users</ion-label>
                    <ion-badge slot="end" color="primary">42</ion-badge>
                  </ion-item>
                  <ion-item>
                    <ion-label>Storage Usage</ion-label>
                    <ion-badge slot="end" color="success">65%</ion-badge>
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
    ion-card.normal {
      --background: var(--ion-color-success-tint);
    }
    ion-card.warning {
      --background: var(--ion-color-warning-tint);
    }
    ion-card.critical {
      --background: var(--ion-color-danger-tint);
    }
    ion-item.error {
      --background: var(--ion-color-danger-tint);
    }
    ion-item.warning {
      --background: var(--ion-color-warning-tint);
    }
    ion-item.info {
      --background: var(--ion-color-info-tint);
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SystemMonitoringComponent implements OnInit {
  systemMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'normal',
      trend: 'stable'
    },
    {
      name: 'Memory Usage',
      value: 78,
      unit: '%',
      status: 'warning',
      trend: 'up'
    },
    {
      name: 'Disk Space',
      value: 65,
      unit: '%',
      status: 'normal',
      trend: 'up'
    },
    {
      name: 'Network Traffic',
      value: 2.5,
      unit: 'MB/s',
      status: 'normal',
      trend: 'down'
    }
  ];

  systemAlerts: SystemAlert[] = [
    {
      id: 1,
      type: 'warning',
      message: 'High memory usage detected',
      timestamp: new Date(Date.now() - 3600000),
      resolved: false
    },
    {
      id: 2,
      type: 'error',
      message: 'Database connection timeout',
      timestamp: new Date(Date.now() - 7200000),
      resolved: true
    },
    {
      id: 3,
      type: 'info',
      message: 'System backup completed',
      timestamp: new Date(Date.now() - 86400000),
      resolved: true
    }
  ];

  constructor(private toastCtrl: ToastController) {}

  ngOnInit() {
    // TODO: Implement real-time system monitoring
    this.startMonitoring();
  }

  private startMonitoring() {
    // TODO: Implement real-time monitoring logic
    setInterval(() => {
      this.updateMetrics();
    }, 30000); // Update every 30 seconds
  }

  private updateMetrics() {
    // TODO: Implement metric updates from backend
    console.log('Updating system metrics...');
  }

  async resolveAlert(alert: SystemAlert) {
    try {
      // TODO: Implement alert resolution logic
      alert.resolved = true;
      this.showToast('Alert resolved successfully');
    } catch (error) {
      console.error('Error resolving alert:', error);
      this.showToast('Failed to resolve alert');
    }
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