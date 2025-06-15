import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircleOutline,
  checkmarkCircle,
  homeOutline,
  notificationsOutline,
  bugOutline,
  heartOutline,
  shieldCheckmarkOutline,
  alertCircleOutline,
  documentTextOutline,
  peopleOutline,
  analyticsOutline,
  cloudUploadOutline,
  logInOutline,
  menuOutline,
  chevronBack
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AppComponent {
  constructor() {
    // Register all icons used in the application
    addIcons({
      checkmarkCircleOutline,
      checkmarkCircle,
      homeOutline,
      notificationsOutline,
      bugOutline,
      heartOutline,
      shieldCheckmarkOutline,
      alertCircleOutline,
      documentTextOutline,
      peopleOutline,
      analyticsOutline,
      cloudUploadOutline,
      logInOutline,
      menuOutline,
      chevronBack
    });
  }
}
