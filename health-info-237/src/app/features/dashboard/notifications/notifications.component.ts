import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  template: `
    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Notifications</ion-card-title>
                <ion-card-subtitle>View and manage your notifications</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item *ngFor="let notification of notifications">
                    <ion-icon [name]="getIconName(notification.type)" slot="start" [color]="getIconColor(notification.type)"></ion-icon>
                    <ion-label>
                      <h2>{{ notification.title }}</h2>
                      <p>{{ notification.message }}</p>
                      <p class="timestamp">{{ notification.created_at | date:'medium' }}</p>
                    </ion-label>
                    <ion-button fill="clear" slot="end" (click)="markAsRead(notification)">
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
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  async loadNotifications() {
    const session = await this.supabaseService.getSession();
    if (session?.user?.id) {
      const { data, error } = await this.supabaseService.getNotifications(session.user.id);
      if (error) {
        console.error('Error loading notifications:', error);
      } else {
        this.notifications = data || [];
      }
    }
  }

  async markAsRead(notification: Notification) {
    const { error } = await this.supabaseService.markNotificationAsRead(notification.id);
    if (error) {
      console.error('Error marking notification as read:', error);
    } else {
      notification.read = true;
    }
  }

  async createAlert(title: string, message: string, severity: 'error' | 'warning' | 'success' | 'info') {
    const alert = {
      title,
      message,
      severity,
      type: 'system' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active' as 'active' | 'resolved' | 'acknowledged'
    };
    const { error } = await this.supabaseService.createAlert(alert);
    if (error) {
      console.error('Error creating alert:', error);
    } else {
      console.log('Alert created successfully');
    }
  }

  getIconName(type: string): string {
    switch (type) {
      case 'alert': return 'alert-circle';
      case 'info': return 'information-circle';
      case 'warning': return 'warning';
      case 'success': return 'checkmark-circle';
      default: return 'notifications';
    }
  }

  getIconColor(type: string): string {
    switch (type) {
      case 'alert': return 'danger';
      case 'info': return 'primary';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'medium';
    }
  }
} 