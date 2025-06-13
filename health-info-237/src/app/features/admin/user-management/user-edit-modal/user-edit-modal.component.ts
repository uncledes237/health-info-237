import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalController, ToastController, IonicModule } from '@ionic/angular';
import { AuthService, UserProfile } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'app-user-edit-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="close()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Edit User</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="editUserForm" (ngSubmit)="updateUser()">
        <ion-list lines="full" class="ion-no-margin ion-no-padding">
          <ion-item>
            <ion-input label="Full Name" type="text" formControlName="fullName" placeholder="Enter full name"></ion-input>
          </ion-item>

          <ion-item>
            <ion-input label="Email" type="email" formControlName="email" placeholder="Enter email" readonly></ion-input>
          </ion-item>

          <ion-item>
            <ion-select label="Role" formControlName="role" interface="popover">
              <ion-select-option *ngFor="let role of roles" [value]="role">{{ role | titlecase }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-input label="Phone (Optional)" type="text" formControlName="phone" placeholder="Enter phone number"></ion-input>
          </ion-item>

          <ion-item>
            <ion-input label="Location (Optional)" type="text" formControlName="location" placeholder="Enter location"></ion-input>
          </ion-item>

          <ion-item>
            <ion-select label="Status" formControlName="status" interface="popover">
              <ion-select-option value="active">Active</ion-select-option>
              <ion-select-option value="inactive">Inactive</ion-select-option>
              <ion-select-option value="pending">Pending</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>

        <ion-button expand="block" type="submit" class="ion-margin-top" [disabled]="!editUserForm.valid || editUserForm.pristine">
          Save Changes
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: [`
    /* Add any specific styles for the modal here if needed */
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule]
})
export class UserEditModalComponent implements OnInit {
  @Input() user!: UserProfile;
  editUserForm!: FormGroup;
  roles: string[] = ['health_official', 'public_user', 'admin'];

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.editUserForm = this.fb.group({
      fullName: [this.user.full_name || '', Validators.required],
      email: [{ value: this.user.email, disabled: true }, [Validators.required, Validators.email]], // Email is read-only
      role: [this.user.role, Validators.required],
      phone: [this.user.phone || ''],
      location: [this.user.location || ''],
      status: [this.user.status || 'active']
    });
  }

  async updateUser() {
    if (this.editUserForm.invalid) {
      this.showToast('Please fill in all required fields correctly.', 'danger');
      return;
    }
    if (this.editUserForm.pristine) {
      this.showToast('No changes to save.', 'info');
      this.modalCtrl.dismiss();
      return;
    }

    const { fullName, role, phone, location, status } = this.editUserForm.value;

    try {
      // Update profile details (full_name, phone, location)
      const { error: profileError } = await this.supabaseService.updateUserProfile(
        this.user.id,
        {
          full_name: fullName,
          phone: phone,
          location: location
        }
      );

      if (profileError) {
        throw new Error(profileError.message || 'Failed to update user profile');
      }

      // Update user role if it has changed
      if (role !== this.user.role) {
        const { error: roleError } = await this.supabaseService.updateUserRole(this.user.id, role);
        if (roleError) {
          throw new Error(roleError.message || 'Failed to update user role');
        }
      }

      // Update user status if it has changed
      if (status !== this.user.status) {
        const { error: statusError } = await this.supabaseService.updateUserStatus(this.user.id, status);
        if (statusError) {
          throw new Error(statusError.message || 'Failed to update user status');
        }
      }

      this.showToast('User updated successfully!', 'success');
      this.modalCtrl.dismiss(true); // Dismiss modal and indicate success
    } catch (error: any) {
      console.error('Error updating user:', error);
      this.showToast(error.message || 'Error updating user.', 'danger');
    }
  }

  async close() {
    await this.modalCtrl.dismiss();
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