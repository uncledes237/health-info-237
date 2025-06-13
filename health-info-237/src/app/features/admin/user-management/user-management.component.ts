import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService, UserProfile } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { UserAddModalComponent } from './user-add-modal/user-add-modal.component';
import { UserEditModalComponent } from './user-edit-modal/user-edit-modal.component';

@Component({
  selector: 'app-user-management',
  template: `
    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>User Management</ion-card-title>
                <ion-card-subtitle>Manage system users and their roles</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <!-- Loading State -->
                <div *ngIf="loading" class="ion-text-center ion-padding">
                  <ion-spinner></ion-spinner>
                  <p>Loading users...</p>
                </div>

                <!-- Error State -->
                <div *ngIf="error" class="ion-text-center ion-padding">
                  <ion-icon name="alert-circle-outline" color="danger" size="large"></ion-icon>
                  <p>{{ error }}</p>
                  <ion-button (click)="loadUsers()">Retry</ion-button>
                </div>

                <!-- User List -->
                <ion-list *ngIf="!loading && !error">
                  <ion-item *ngFor="let user of users">
                    <ion-avatar slot="start">
                      <img [src]="user.avatar_url || 'assets/default-avatar.png'" alt="User avatar">
                    </ion-avatar>
                    <ion-label>
                      <h2>{{ user.full_name || 'Unnamed User' }}</h2>
                      <p>{{ user.email }}</p>
                      <p class="role-badge" [class]="user.role">
                        {{ user.role | titlecase }}
                      </p>
                    </ion-label>
                    <ion-button fill="clear" slot="end" (click)="editUser(user)">
                      <ion-icon name="create-outline"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" color="danger" slot="end" (click)="confirmDeleteUser(user)">
                      <ion-icon name="trash-outline"></ion-icon>
                    </ion-button>
                  </ion-item>
                </ion-list>

                <!-- Empty State -->
                <div *ngIf="!loading && !error && users.length === 0" class="ion-text-center ion-padding">
                  <ion-icon name="people-outline" size="large"></ion-icon>
                  <p>No users found</p>
                </div>

                <!-- Add User Button -->
                <div class="ion-padding">
                  <ion-button expand="block" (click)="addUser()">
                    <ion-icon name="person-add-outline" slot="start"></ion-icon>
                    Add New User
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
    .role-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      margin-top: 4px;
    }
    .role-badge.admin {
      background: var(--ion-color-primary);
      color: white;
    }
    .role-badge.health_official {
      background: var(--ion-color-success);
      color: white;
    }
    .role-badge.public_user {
      background: var(--ion-color-medium);
      color: white;
    }
    ion-spinner {
      margin: 20px auto;
    }
    .ion-text-center {
      padding: 20px;
    }
    ion-icon[size="large"] {
      font-size: 48px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, UserAddModalComponent]
})
export class UserManagementComponent implements OnInit {
  users: UserProfile[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    this.error = null;
    try {
      const { data: users, error } = await this.supabaseService.getAllUsers();
      if (error) throw error;
      this.users = users || [];
    } catch (error: any) {
      console.error('Error loading users:', error);
      this.error = error.message || 'Failed to load users';
      this.showToast(this.error || 'Failed to load users', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async editUser(user: UserProfile) {
    const modal = await this.modalCtrl.create({
      component: UserEditModalComponent,
      componentProps: {
        user
      }
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (role === 'backdrop') {
      return;
    }
    if (data) {
      this.loadUsers();
    }
  }

  async addUser() {
    const modal = await this.modalCtrl.create({
      component: UserAddModalComponent
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (role === 'backdrop') {
      return;
    }
    if (data) {
      this.loadUsers();
    }
  }

  async confirmDeleteUser(user: UserProfile) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete user <strong>${user.full_name || user.email}</strong>? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            await this.deleteUser(user);
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteUser(user: UserProfile) {
    try {
      const { error } = await this.supabaseService.deleteUser(user.id);
      if (error) {
        throw new Error(error.message || 'Failed to delete user.');
      }

      this.showToast('User deleted successfully!', 'success');
      this.loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      this.showToast(error.message || 'Error deleting user.', 'danger');
    }
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
} 