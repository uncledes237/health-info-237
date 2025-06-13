import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-custom-report-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Create Custom Report</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label position="stacked">Report Title</ion-label>
          <ion-input [(ngModel)]="reportTitle" placeholder="e.g., Monthly Disease Trends"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Data Fields</ion-label>
          <ion-select [(ngModel)]="selectedFields" multiple="true" placeholder="Select fields">
            <ion-select-option value="cases">Cases</ion-select-option>
            <ion-select-option value="deaths">Deaths</ion-select-option>
            <ion-select-option value="location">Location</ion-select-option>
            <ion-select-option value="ageGroup">Age Group</ion-select-option>
            <ion-select-option value="gender">Gender</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Filter Criteria</ion-label>
          <ion-textarea [(ngModel)]="filterCriteria" rows="3" placeholder="e.g., disease = 'Malaria' AND location = 'Central'"></ion-textarea>
        </ion-item>
        <ion-item>
          <ion-label>Report Format</ion-label>
          <ion-select [(ngModel)]="reportFormat">
            <ion-select-option value="pdf">PDF</ion-select-option>
            <ion-select-option value="excel">Excel</ion-select-option>
            <ion-select-option value="csv">CSV</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <ion-button expand="block" class="ion-margin-top" (click)="generateCustomReport()">
        Generate Custom Report
      </ion-button>
    </ion-content>
  `,
  styles: [`
    ion-list {
      margin-top: 1rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class CustomReportModalComponent implements OnInit {
  reportTitle: string = '';
  selectedFields: string[] = [];
  filterCriteria: string = '';
  reportFormat: string = 'pdf';

  constructor(private modalCtrl: ModalController, private toastCtrl: ToastController, private loadingCtrl: LoadingController, private reportService: ReportService) { }

  ngOnInit() { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async generateCustomReport() {
    const loading = await this.loadingCtrl.create({
      message: 'Generating custom report...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const response = await this.reportService.generateReport({
        templateId: 'custom_report', // A generic ID for custom reports
        startDate: new Date().toISOString(), // You might want to add date pickers to custom report modal
        endDate: new Date().toISOString()    // or derive from filterCriteria
      }).toPromise();

      if (response && response.success) {
        this.toastCtrl.create({
          message: response.message,
          duration: 3000,
          position: 'bottom',
          color: 'success'
        }).then(toast => toast.present());

        if (response.reportUrl) {
          window.open(response.reportUrl, '_blank');
        }
        this.modalCtrl.dismiss(null, 'confirm'); // Dismiss with 'confirm' role
      } else {
        this.toastCtrl.create({
          message: response?.message || 'Failed to generate custom report.',
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        }).then(toast => toast.present());
      }
    } catch (error) {
      console.error('Error generating custom report:', error);
      this.toastCtrl.create({
        message: 'Failed to generate custom report due to an error.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      }).then(toast => toast.present());
    } finally {
      loading.dismiss();
    }
  }
} 