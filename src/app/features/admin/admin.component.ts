import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  template: `
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Admin Panel</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item *ngFor="let item of menuItems" [routerLink]="item.url">
            <ion-icon [name]="item.icon" slot="start"></ion-icon>
            <ion-label>{{ item.title }}</ion-label>
          </ion-item>
        </ion-list>
        <ion-router-outlet></ion-router-outlet>
      </ion-content>
    </ion-page>
  `
})
export class AdminComponent {
  menuItems = [
    {
      title: 'Dashboard',
      icon: 'home',
      url: '/admin/dashboard'
    },
    {
      title: 'User Management',
      icon: 'people',
      url: '/admin/user-management'
    },
    {
      title: 'Report Generation',
      icon: 'document',
      url: '/admin/report-generation'
    }
  ];
} 