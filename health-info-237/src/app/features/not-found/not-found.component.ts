import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  template: `
    <ion-content class="ion-padding">
      <div class="not-found-container">
        <ion-icon name="alert-circle-outline" class="error-icon"></ion-icon>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <ion-button routerLink="/dashboard" expand="block" class="ion-margin-top">
          <ion-icon name="home-outline" slot="start"></ion-icon>
          Return to Dashboard
        </ion-button>
        <ion-button routerLink="/login" expand="block" fill="outline" class="ion-margin-top">
          <ion-icon name="log-in-outline" slot="start"></ion-icon>
          Go to Login
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
      padding: 2rem;
    }

    .error-icon {
      font-size: 8rem;
      color: var(--ion-color-danger);
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2rem;
      color: var(--ion-color-dark);
      margin-bottom: 1rem;
    }

    p {
      color: var(--ion-color-medium);
      max-width: 600px;
      margin-bottom: 2rem;
    }

    ion-button {
      max-width: 300px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class NotFoundComponent {} 