import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';

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
                        [max]="endDate"
                        (ionChange)="validateDates()">
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
                        [min]="startDate"
                        [max]="maxDate"
                        (ionChange)="validateDates()">
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
                    <ion-button fill="clear" slot="end" (click)="generateReport(template)" [disabled]="!areDatesValid">
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
  maxDate: string = new Date().toISOString(); // Max date for end date picker
  availableTemplates: ReportTemplate[] = [];
  areDatesValid: boolean = true;

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

  constructor(private toastCtrl: ToastController, private loadingCtrl: LoadingController, private reportService: ReportService) {}

  ngOnInit() {
    this.updateTemplates();
    this.validateDates();
  }

  updateTemplates() {
    this.availableTemplates = this.allTemplates.filter(
      template => template.type === this.selectedType
    );
  }

  validateDates() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    this.areDatesValid = start <= end;
    if (!this.areDatesValid) {
      this.showToast('End date cannot be before start date.', 'danger');
    }
  }

  async generateReport(template: ReportTemplate) {
    if (!this.areDatesValid) {
      this.showToast('Please select a valid date range first.', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Generating report...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const response = await this.reportService.generateReport({
        templateId: template.id,
        startDate: this.startDate,
        endDate: this.endDate
      }).toPromise(); // Convert Observable to Promise

      if (response && response.success) {
        this.showToast(response.message, 'success');
        if (response.reportUrl) {
          // In a real app, you might trigger a download or open in a new tab
          window.open(response.reportUrl, '_blank');
        }
      } else {
        this.showToast(response?.message || 'Failed to generate report.', 'danger');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      this.showToast('Failed to generate report due to an error.', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async createCustomReport() {
    this.showToast('Custom report creation not implemented yet', 'warning');
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
} 