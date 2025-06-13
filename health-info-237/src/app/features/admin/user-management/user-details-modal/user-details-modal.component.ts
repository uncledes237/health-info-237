import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { SupabaseService } from '../../../../core/services/supabase.service';

interface UserActivity {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

@Component({
  selector: 'app-user-details-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>User Details</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-grid>
        <!-- User Profile Section -->
        <ion-row>
          <ion-col size="12" size-md="4">
            <ion-card>
              <ion-card-content class="ion-text-center">
                <ion-avatar class="profile-avatar">
                  <img [src]="user.profile?.avatar_url || 'assets/default-avatar.png'" alt="Profile">
                </ion-avatar>
                <h2>{{ user.full_name }}</h2>
                <p>{{ user.email }}</p>
                <ion-badge [color]="user.status === 'active' ? 'success' : 'danger'" class="ion-margin-top">
                  {{ user.status }}
                </ion-badge>
              </ion-card-content>
            </ion-card>

            <ion-card>
              <ion-card-header>
                <ion-card-title>Contact Information</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-icon name="call-outline" slot="start"></ion-icon>
                    <ion-label>
                      <h3>Phone</h3>
                      <p>{{ user.profile?.phone || 'Not provided' }}</p>
                    </ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-icon name="location-outline" slot="start"></ion-icon>
                    <ion-label>
                      <h3>Location</h3>
                      <p>{{ user.profile?.location || 'Not provided' }}</p>
                    </ion-label>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="8">
            <!-- Account Information -->
            <ion-card>
              <ion-card-header>
                <ion-card-title>Account Information</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-label>
                      <h3>Role</h3>
                      <p>{{ user.role | titlecase }}</p>
                    </ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-label>
                      <h3>Member Since</h3>
                      <p>{{ user.created_at | date:'medium' }}</p>
                    </ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-label>
                      <h3>Last Login</h3>
                      <p>{{ user.last_login | date:'medium' || 'Never' }}</p>
                    </ion-label>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>

            <!-- Recent Activity -->
            <ion-card>
              <ion-card-header>
                <ion-card-title>Recent Activity</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item *ngFor="let activity of userActivity">
                    <ion-icon [name]="getActivityIcon(activity.action)" slot="start"></ion-icon>
                    <ion-label>
                      <h3>{{ activity.action }}</h3>
                      <p>{{ activity.details }}</p>
                      <p class="activity-time">{{ activity.created_at | date:'medium' }}</p>
                    </ion-label>
                  </ion-item>
                  <ion-item *ngIf="!userActivity.length">
                    <ion-label>
                      <p>No recent activity</p>
                    </ion-label>
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
    .profile-avatar {
      width: 120px;
      height: 120px;
      margin: 0 auto;
    }

    ion-card {
      margin-bottom: 1rem;
    }

    .activity-time {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
    }

    ion-badge {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class UserDetailsModalComponent implements OnInit {
  @Input() user: any;
  userActivity: UserActivity[] = [];

  constructor(
    private modalCtrl: ModalController,
    private supabaseService: SupabaseService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.loadUserActivity();
  }

  private async loadUserActivity() {
    try {
      // TODO: Implement user activity tracking in Supabase
      // For now, we'll use mock data
      this.userActivity = [
        {
          id: '1',
          action: 'Login',
          details: 'Logged in from Chrome on Windows',
          created_at: this.user.last_login || new Date().toISOString()
        },
        {
          id: '2',
          action: 'Profile Update',
          details: 'Updated contact information',
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      ];
    } catch (error) {
      console.error('Error loading user activity:', error);
      this.showToast('Error loading user activity');
    }
  }

  getActivityIcon(action: string): string {
    switch (action.toLowerCase()) {
      case 'login':
        return 'log-in-outline';
      case 'profile update':
        return 'person-outline';
      case 'report':
        return 'document-text-outline';
      default:
        return 'ellipsis-horizontal-outline';
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
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