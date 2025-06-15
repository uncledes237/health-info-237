import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  template: `
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Dashboard</ion-title>
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
export class DashboardComponent {
  menuItems = [
    {
      title: 'Dashboard',
      icon: 'home',
      url: '/dashboard'
    },
    {
      title: 'Login as Health Official',
      icon: 'log-in',
      url: '/login'
    }
  ];
} 