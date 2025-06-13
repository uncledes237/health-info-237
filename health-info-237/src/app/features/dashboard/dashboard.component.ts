import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { AuthService, UserProfile } from '../../core/services/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, SidebarComponent]
})
export class DashboardComponent implements OnInit {
  user: UserProfile = {
    id: '1',
    email: 'john.doe@example.com',
    role: 'Health Official',
    full_name: 'John Doe',
    avatar_url: 'assets/default-avatar.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phone: '+1234567890',
    location: 'New York',
    status: 'active',
    last_login: new Date().toISOString()
  };
  sidebarCollapsed = false;
  sidebarMobileOpen = false;
  isMobile = false;
  activeRoute = '';
  notificationCount = 3;
  menuItems = [
    { label: 'Home', icon: 'home-outline', route: '/dashboard/home' },
    { label: 'Infectious Disease', icon: 'bug-outline', route: '/dashboard/infectious-disease' },
    { label: 'Chronic Disease', icon: 'heart-outline', route: '/dashboard/chronic-disease' },
    { label: 'Safety Measures', icon: 'shield-checkmark-outline', route: '/dashboard/safety-measures' },
    { label: 'Report A Case', icon: 'alert-circle-outline', route: '/dashboard/report-case' },
    { label: 'Notifications', icon: 'notifications-outline', route: '/dashboard/notifications', badge: 3 },
    { label: 'User Management', icon: 'people-outline', route: '/dashboard/admin/user-management', adminOnly: true },
    { label: 'Logout', icon: 'log-out-outline', route: '/logout' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.activeRoute = this.router.url;
    this.updateSidebarMode();
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.updateSidebarMode();
  }

  updateSidebarMode() {
    this.isMobile = window.innerWidth <= 900;
    if (this.isMobile) {
      this.sidebarCollapsed = false;
      this.sidebarMobileOpen = false;
    }
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.sidebarMobileOpen = !this.sidebarMobileOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeMobileSidebar() {
    this.sidebarMobileOpen = false;
  }

  async openProfile() {
    const modal = await this.modalCtrl.create({
      component: 'ProfileModalComponent',
      componentProps: { user: this.user }
    });
    await modal.present();
  }

  async logout() {
    try {
      await this.authService.signOut();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
} 