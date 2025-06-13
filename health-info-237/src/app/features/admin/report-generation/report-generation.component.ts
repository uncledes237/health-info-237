import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'disease' | 'safety' | 'user' | 'system';
  format: 'pdf' | 'excel' | 'csv';
}

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
                <ion-card-subtitle>Generate and manage system reports</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <!-- Report Type Selection -->
                <ion-item>
                  <ion-label>Report Type</ion-label>
                  <ion-select [(ngModel)]="selectedType" (ionChange)="updateTemplates()">
                    <ion-select-option value="disease">Disease Reports</ion-select-option>
                    <ion-select-option value="safety">Safety Measures</ion-select-option>
                    <ion-select-option value="user">User Activity</ion-select-option>
                    <ion-select-option value="system">System Reports</ion-select-option>
                  </ion-select>
                </ion-item>

                <!-- Date Range Selection -->
                <ion-item>
                  <ion-label>Date Range</ion-label>
                  <ion-datetime-button datetime="startDate"></ion-datetime-button>
                  <ion-modal [keepContentsMounted]="true">
                    <ng-template>
                      <ion-datetime
                        id="startDate"
                        [(ngModel)]="startDate"
                        presentation="date"
                        [showDefaultButtons]="true"
                        (ionChange)="updateTemplates()">
                      </ion-datetime>
                    </ng-template>
                  </ion-modal>
                  <ion-label class="ion-padding-start">to</ion-label>
                  <ion-datetime-button datetime="endDate"></ion-datetime-button>
                  <ion-modal [keepContentsMounted]="true">
                    <ng-template>
                      <ion-datetime
                        id="endDate"
                        [(ngModel)]="endDate"
                        presentation="date"
                        [showDefaultButtons]="true"
                        (ionChange)="updateTemplates()">
                      </ion-datetime>
                    </ng-template>
                  </ion-modal>
                </ion-item>

                <!-- Report Templates -->
                <ion-list>
                  <ion-item *ngFor="let template of availableTemplates">
                    <ion-label>
                      <h2>{{ template.name }}</h2>
                      <p>{{ template.description }}</p>
                    </ion-label>
                    <ion-button fill="clear" slot="end" (click)="generateReport(template)">
                      <ion-icon name="download-outline" slot="start"></ion-icon>
                      Generate
                    </ion-button>
                  </ion-item>
                </ion-list>

                <!-- Custom Report -->
                <div class="ion-padding">
                  <ion-button expand="block" (click)="createCustomReport()">
                    <ion-icon name="add-circle-outline" slot="start"></ion-icon>
                    Create Custom Report
                  </ion-button>
                </div>
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
    ion-item {
      --padding-start: 0;
    }
    ion-datetime-button {
      margin: 0 0.5rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ReportGenerationComponent implements OnInit {
  selectedType: string = 'disease';
  startDate: string = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  endDate: string = new Date().toISOString();
  availableTemplates: ReportTemplate[] = [];

  private allTemplates: ReportTemplate[] = [
    {
      id: 'disease_summary',
      name: 'Disease Summary Report',
      description: 'Summary of disease cases by type and location',
      type: 'disease',
      format: 'pdf'
    },
    {
      id: 'safety_compliance',
      name: 'Safety Compliance Report',
      description: 'Safety measures compliance by location',
      type: 'safety',
      format: 'excel'
    },
    {
      id: 'user_activity',
      name: 'User Activity Report',
      description: 'User login and activity summary',
      type: 'user',
      format: 'csv'
    },
    {
      id: 'system_health',
      name: 'System Health Report',
      description: 'System performance and usage metrics',
      type: 'system',
      format: 'pdf'
    }
  ];

  constructor(private toastCtrl: ToastController) {}

  ngOnInit() {
    this.updateTemplates();
  }

  updateTemplates() {
    this.availableTemplates = this.allTemplates.filter(
      template => template.type === this.selectedType
    );
  }

  async generateReport(template: ReportTemplate) {
    try {
      // TODO: Implement report generation logic
      console.log('Generating report:', {
        template,
        startDate: this.startDate,
        endDate: this.endDate
      });
      
      this.showToast('Report generation started');
    } catch (error) {
      console.error('Error generating report:', error);
      this.showToast('Failed to generate report');
    }
  }

  async createCustomReport() {
    // TODO: Implement custom report creation
    this.showToast('Custom report creation not implemented yet');
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
} 