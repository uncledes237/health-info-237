import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalController, ToastController, IonicModule } from '@ionic/angular';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-add-modal',
  templateUrl: './user-add-modal.component.html',
  styleUrls: ['./user-add-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule]
})
export class UserAddModalComponent implements OnInit {
  addUserForm!: FormGroup;
  roles: string[] = ['health_official', 'public_user', 'admin'];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public modalCtrl: ModalController,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.addUserForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['public_user', Validators.required],
      phone: [''],
      location: [''],
      status: ['active']
    });
  }

  async createUser() {
    if (this.addUserForm.invalid) {
      this.showToast('Please fill in all required fields correctly.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const { fullName, email, password, role, phone, location, status } = this.addUserForm.value;

    try {
      const { error } = await this.authService.signUp(email, password, {
        full_name: fullName,
        role: role,
        phone: phone,
        location: location,
        status: status
      });

      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }

      this.showToast('User created successfully!', 'success');
      this.modalCtrl.dismiss(true);
    } catch (error: any) {
      console.error('Error creating user:', error);
      this.showToast(error.message || 'Error creating user.', 'danger');
    } finally {
      this.isSubmitting = false;
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