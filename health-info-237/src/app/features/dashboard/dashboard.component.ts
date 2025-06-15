import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { AuthService, UserProfile } from '../../core/services/auth.service';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, SidebarComponent]
})
export class DashboardComponent implements OnInit {
  user: UserProfile | null = null; // User can be null for public access
  sidebarCollapsed = false;
  sidebarMobileOpen = false;
  isMobile = false;
  activeRoute = '';
  notificationCount = 0;
  notifications: Notification[] = [];
  menuItems = [
    { label: 'Home', icon: 'home-outline', route: '/dashboard/home' },
    { label: 'Infectious Disease', icon: 'bug-outline', route: '/dashboard/infectious-disease' },
    { label: 'Chronic Disease', icon: 'heart-outline', route: '/dashboard/chronic-disease' },
    { label: 'Safety Measures', icon: 'shield-checkmark-outline', route: '/dashboard/safety-measures' },
    { label: 'Report A Case', icon: 'alert-circle-outline', route: '/dashboard/report-case' },
    { label: 'Notifications', icon: 'notifications-outline', route: '/dashboard/notifications', badge: 0 },
    { label: 'Login as Health Official', icon: 'log-in-outline', route: '/login' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.activeRoute = this.router.url;
    this.updateSidebarMode();
    
    // Subscribe to user updates
    this.authService.currentUser$.subscribe(user => {
      this.user = user; // Set user to null if not logged in
    });

    // Subscribe to notification updates
    this.notificationService.getUnreadCount().subscribe(count => {
      this.notificationCount = count;
      this.updateMenuBadge();
    });

    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  private updateMenuBadge() {
    const notificationsItem = this.menuItems.find(item => item.label === 'Notifications');
    if (notificationsItem) {
      notificationsItem.badge = this.notificationCount;
    }
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

  async loginAsHealthOfficial() {
    await this.router.navigate(['/login']);
  }

  async openNotifications() {
    await this.router.navigate(['/dashboard/notifications']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
} 