import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="profile-container">
        <div class="profile-header">
          <div class="avatar-container">
            <img [src]="user.avatar_url" [alt]="user.full_name" class="avatar">
            <ion-button fill="clear" class="edit-avatar">
              <ion-icon name="camera-outline"></ion-icon>
            </ion-button>
          </div>
          <h2>{{ user.full_name }}</h2>
          <p class="role">{{ user.role }}</p>
        </div>

        <ion-list>
          <ion-item>
            <ion-label position="stacked">Email</ion-label>
            <ion-input [(ngModel)]="user.email" type="email"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Phone</ion-label>
            <ion-input [(ngModel)]="user.phone" type="tel"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Location</ion-label>
            <ion-input [(ngModel)]="user.location"></ion-input>
          </ion-item>
        </ion-list>

        <div class="profile-actions">
          <ion-button expand="block" (click)="saveProfile()">
            Save Changes
          </ion-button>
          <ion-button expand="block" fill="outline" (click)="changePassword()">
            Change Password
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .avatar-container {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto 1rem;
    }

    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .edit-avatar {
      position: absolute;
      bottom: 0;
      right: 0;
      --padding-start: 8px;
      --padding-end: 8px;
    }

    .role {
      color: var(--ion-color-medium);
      margin-top: 0.5rem;
    }

    .profile-actions {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ProfileModalComponent {
  @Input() user!: UserProfile;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async saveProfile() {
    // TODO: Implement profile update
    this.dismiss();
  }

  async changePassword() {
    // TODO: Implement password change
  }
} 