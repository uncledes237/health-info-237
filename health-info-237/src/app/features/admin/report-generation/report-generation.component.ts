import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { HttpClientModule } from '@angular/common/http';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'disease' | 'user'; // Simplified types
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
                <ion-card-subtitle>Generate and information about disease data and user data</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <!-- Report Type Selection -->
                <ion-item>
                  <ion-label>Report Type</ion-label>
                  <ion-select [(ngModel)]="selectedType" (ionChange)="updateTemplates()">
                    <ion-select-option value="disease">Disease Data</ion-select-option>
                    <ion-select-option value="user">User Data</ion-select-option>
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
                <ion-list *ngIf="availableTemplates.length > 0; else noTemplates">
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
                <ng-template #noTemplates>
                  <p class="ion-padding">No report templates available for the selected type.</p>
                </ng-template>
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
  imports: [CommonModule, IonicModule, FormsModule, HttpClientModule]
})
export class ReportGenerationComponent implements OnInit {
  selectedType: string = 'disease';
  startDate: string = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  endDate: string = new Date().toISOString();
  maxDate: string = new Date().toISOString();
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
      id: 'user_activity',
      name: 'User Activity Report',
      description: 'Summary of user login and activity',
      type: 'user',
      format: 'csv'
    }
  ];

  constructor(private toastCtrl: ToastController, private reportService: ReportService) {
    console.log('ReportGenerationComponent: Constructor called');
  }

  ngOnInit() {
    console.log('ReportGenerationComponent: ngOnInit called');
    this.updateTemplates();
    this.validateDates();
  }

  updateTemplates() {
    this.availableTemplates = this.allTemplates.filter(
      template => template.type === this.selectedType
    );
    console.log('ReportGenerationComponent: Available templates updated:', this.availableTemplates);
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

    // Simplified loading indicator (using toast only)
    this.showToast('Generating report...', 'primary');

    try {
      const response = await this.reportService.generateReport({
        templateId: template.id,
        startDate: this.startDate,
        endDate: this.endDate
      }).toPromise();

      if (response && response.success) {
        this.showToast(response.message, 'success');
        if (response.reportUrl) {
          window.open(response.reportUrl, '_blank');
        }
      } else {
        this.showToast(response?.message || 'Failed to generate report.', 'danger');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      this.showToast('Failed to generate report due to an error.', 'danger');
    }
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