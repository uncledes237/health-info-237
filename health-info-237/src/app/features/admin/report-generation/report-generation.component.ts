import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-report-generation',
  template: `
    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Report Generation</ion-card-title>
                <ion-card-subtitle>Generate reports for disease and user data</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p>Report generation functionality will be implemented here.</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 1rem 0;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ReportGenerationComponent {
  constructor() {
    console.log('ReportGenerationComponent: Constructor called');
  }
} 