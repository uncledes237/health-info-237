import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-admin',
  template: `
    <ion-app>
      <ion-header class="ion-no-border header">
        <ion-toolbar class="glass-effect">
          <ion-buttons slot="start" *ngIf="isMobile">
            <ion-button class="menu-toggle-btn" (click)="toggleSidebar()">
              <ion-icon name="menu-outline" class="menu-icon"></ion-icon>
              <span class="menu-text">Menu</span>
            </ion-button>
          </ion-buttons>
          
          <div class="header-title">
            <img src="assets/logo.png" alt="Health Info 237 Logo" class="header-logo">
            <ion-title class="ion-text-center">Admin Dashboard</ion-title>
          </div>

          <ion-buttons slot="end">
            <ion-button class="notification-btn">
              <ion-icon name="notifications-outline"></ion-icon>
              <ion-badge color="danger" *ngIf="notificationCount > 0">{{notificationCount}}</ion-badge>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <div class="admin-shell">
        <div *ngIf="isMobile && sidebarMobileOpen" class="sidebar-overlay" [class.active]="sidebarMobileOpen" (click)="closeMobileSidebar()"></div>
        <app-sidebar
          [collapsed]="sidebarCollapsed"
          [menuItems]="menuItems"
          [activeRoute]="activeRoute"
          [user]="user"
          (toggleSidebar)="toggleSidebar()"
          class="sidebar"
          [class.mobile-open]="sidebarMobileOpen"
          [isMobile]="isMobile"
        ></app-sidebar>
        <div class="admin-main" [class.sidebar-collapsed]="sidebarCollapsed">
          <ion-content class="ion-padding">
            <router-outlet></router-outlet>
          </ion-content>
        </div>
      </div>
    </ion-app>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--glass-background);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
    }

    .header-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex: 1;
      margin-left: var(--sidebar-width);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      @media (max-width: 900px) {
        margin-left: 0;
      }

      .header-logo {
        height: 32px;
        width: auto;
        object-fit: contain;
      }

      ion-title {
        font-size: 1.2rem;
        font-weight: 600;
        padding: 0;
      }
    }

    .admin-shell {
      display: flex;
      flex-direction: row;
      min-height: 100vh;
      background: var(--ion-color-light);
      flex-wrap: nowrap;
      overflow-x: auto;
      position: relative;
    }

    .sidebar {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      max-width: var(--sidebar-width);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: var(--sidebar-background);
      border-right: var(--sidebar-border);
      box-shadow: var(--sidebar-shadow);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      flex-shrink: 0;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;

      &.collapsed {
        width: var(--sidebar-collapsed-width);
        min-width: var(--sidebar-collapsed-width);
        max-width: var(--sidebar-collapsed-width);
      }

      &.mobile-open {
        transform: translateX(0);
      }

      @media (max-width: 900px) {
        transform: translateX(-100%);
      }
    }

    .admin-main {
      flex: 1 1 0;
      min-width: 0;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-left: var(--sidebar-width);
      width: 100%;

      &.sidebar-collapsed {
        margin-left: var(--sidebar-collapsed-width);
      }

      @media (max-width: 900px) {
        margin-left: 0;
      }
    }

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: none;

      @media (max-width: 900px) {
        &.active {
          display: block;
        }
      }
    }

    .menu-toggle-btn {
      --background: rgba(255, 255, 255, 0.2);
      --background-hover: rgba(255, 255, 255, 0.3);
      --background-activated: rgba(255, 255, 255, 0.4);
      --border-radius: 8px;
      --padding-start: 12px;
      --padding-end: 12px;
      height: 40px;
      margin: 0 8px;
      display: flex;
      align-items: center;
      gap: 8px;

      .menu-icon {
        font-size: 24px;
      }

      .menu-text {
        font-size: 14px;
        font-weight: 500;
      }

      @media (max-width: 900px) {
        --padding-start: 16px;
        --padding-end: 16px;
        height: 44px;
        margin: 0 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .notification-btn {
      position: relative;
      ion-badge {
        position: absolute;
        top: 0;
        right: 0;
        --padding-start: 4px;
        --padding-end: 4px;
        font-size: 10px;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterOutlet, SidebarComponent]
})
export class AdminComponent implements OnInit {
  sidebarCollapsed = false;
  sidebarMobileOpen = false;
  isMobile = false;
  activeRoute = '';
  notificationCount = 0;
  user = {
    id: 'admin',
    email: 'admin@example.com',
    role: 'Admin',
    full_name: 'Admin User',
    avatar_url: 'assets/default-avatar.png',
  };
  menuItems = [
    { label: 'Data Upload', icon: 'cloud-upload-outline', route: '/admin/data-upload' },
    { label: 'User Management', icon: 'people-outline', route: '/admin/user-management' },
    { label: 'Report Generation', icon: 'document-text-outline', route: '/admin/report-generation' },
    { label: 'System Monitoring', icon: 'analytics-outline', route: '/admin/system-monitoring' },
    { label: 'Alerts', icon: 'notifications-outline', route: '/admin/alerts' },
    { label: 'Logout', icon: 'log-out-outline', route: '/logout' }
  ];
  userProfile: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private toastCtrl: ToastController
  ) {
    console.log('AdminComponent: Constructor called');
    this.activeRoute = this.router.url;
    this.updateSidebarMode();
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

  async ngOnInit() {
    console.log('AdminComponent: ngOnInit called');
    this.loadUserProfile();
    this.loadNotifications();
    this.setupNotificationSubscription();
  }

  async loadUserProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const { data } = await this.supabaseService.getUserProfile(currentUser.id);
      this.userProfile = data;
    }
  }

  async loadNotifications() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const count = await this.supabaseService.getUnreadNotificationCount(currentUser.id);
      this.notificationCount = count || 0;
    }
  }

  setupNotificationSubscription() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.supabaseService.subscribeToNotifications(currentUser.id, () => {
        this.loadNotifications();
        this.showNotificationToast();
      });
    }
  }

  async showNotificationToast() {
    const toast = await this.toastCtrl.create({
      message: 'You have a new notification',
      duration: 3000,
      position: 'bottom',
      color: 'primary'
    });
    await toast.present();
  }

  async signOut() {
    await this.authService.signOut();
  }
} 