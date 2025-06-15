import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { DiseaseDataService } from '../../../core/services/disease-data.service';
import { DiseaseData } from '../../../core/models/disease-data.model';
import { MalariaSurveillanceData } from '../../../core/models/malaria-surveillance-data.model'; // Import the new interface
import { firstValueFrom } from 'rxjs';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatOptionModule
  ],
  template: `
    <div class="home-dashboard">
      <div class="page-header">
        <h1>Health Dashboard</h1>
      </div>

      <mat-card class="dashboard-summary-card">
        <mat-card-header>
          <mat-card-title>Overview</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>This Health Dashboard provides a comprehensive overview of various disease statistics across different regions. Here you can see a quick summary of total cases for key diseases. For in-depth analysis and visualization trends, please navigate to the specific disease tabs.</p>
        </mat-card-content>
      </mat-card>

      <div class="disease-overview">
        <mat-card class="overview-card">
          <mat-card-header>
            <mat-card-title>Malaria</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{totalAnnualMalariaCases | number}}</div>
            <div class="stat-label">Total Cases (Annual Aggregated)</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="overview-card">
          <mat-card-header>
            <mat-card-title>Diabetes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{diabetesData.total_cases | number}}</div>
            <div class="stat-label">Total Cases</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="guidance-message">
        <p>Click on the <strong>Infectious Disease</strong> tab to see detailed visualization trends for Malaria, and the <strong>Chronic Disease</strong> tab for Diabetes visualizations.</p>
      </div>

      <mat-card class="safety-measures-summary-card">
        <mat-card-header>
          <mat-card-title>Safety Measures Summary</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Effective safety measures are crucial in managing disease outbreaks. These include practices like proper sanitation, vector control, and adherence to medical guidelines. Always stay informed about local health advisories.</p>
          <p>For more detailed safety measures and comprehensive management strategies for Malaria and Diabetes, please visit the <strong>Safety Measures</strong> tab.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .home-dashboard {
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .page-header h1 {
      font-size: 2.8em;
      font-weight: 800;
      color: #1a237e;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .dashboard-summary-card {
      margin-bottom: 25px;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 6px 12px rgba(0,0,0,0.1);
      background-color: #ffffff;
      border-left: 6px solid #42a5f5;
    }

    .dashboard-summary-card .mat-card-title {
      font-size: 1.8em;
      color: #2c3e50;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .dashboard-summary-card p {
      font-size: 1.1em;
      line-height: 1.8;
      color: #4a4a4a;
      margin-bottom: 10px;
    }

    .disease-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
      margin-bottom: 30px;
    }

    .overview-card {
      text-align: center;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      background: linear-gradient(145deg, #e0e0e0, #f8f8f8);
      transition: all 0.4s ease-in-out;
      border: 2px solid #64b5f6;
      cursor: pointer;
    }

    .overview-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 12px 24px rgba(0,0,0,0.3);
    }

    .overview-card .mat-card-title {
      font-size: 1.6em;
      color: #1a237e;
      margin-bottom: 15px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 4em;
      font-weight: 900;
      color: #ff5722;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .stat-label {
      color: #424242;
      font-size: 1.2em;
      font-weight: 500;
    }

    .guidance-message {
      background-color: #e8f5e9;
      border-left: 6px solid #4caf50;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
      color: #2e7d32;
      font-size: 1.1em;
      line-height: 1.6;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .guidance-message strong {
      color: #1b5e20;
      font-weight: 700;
    }

    .safety-measures-summary-card {
      margin-bottom: 25px;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 6px 12px rgba(0,0,0,0.1);
      background-color: #ffffff;
      border-left: 6px solid #ffb300;
    }

    .safety-measures-summary-card .mat-card-title {
      font-size: 1.8em;
      color: #2c3e50;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .safety-measures-summary-card p {
      font-size: 1.1em;
      line-height: 1.8;
      color: #4a4a4a;
      margin-bottom: 10px;
    }

    @media (max-width: 768px) {
      .disease-overview {
        grid-template-columns: 1fr;
      }
      .page-header h1 {
        font-size: 2.2em;
      }
      .dashboard-summary-card, .safety-measures-summary-card {
        padding: 15px;
      }
      .overview-card {
        padding: 20px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  selectedRegion = 'all';
  regions = ['North', 'South', 'East', 'West', 'Central', 'Far North', 'Adamawa', 'Littoral', 'Northwest', 'Southwest'];

  malariaData: MalariaSurveillanceData = {
    id: '',
    region: '',
    date: new Date(),
    confirmed_cases: 0,
    deaths: 0, // Deaths is used in the service getMalariaStats() call.
    created_at: new Date(),
    updated_at: new Date()
  };
  diabetesData: Partial<DiseaseData> = {
    total_cases: 0,
    active_cases: 0,
    recovered_cases: 0,
    type1: 0,
    type2: 0,
    gestational: 0
  };

  totalAnnualMalariaCases: number = 0; // New property for aggregated annual cases

  constructor(private diseaseDataService: DiseaseDataService) {}

  async ngOnInit() {
    await this.loadData();
  }

  onRegionChange() {
    // No specific region change logic for home component overview stats
    // as they are global/aggregated. The detailed views handle region filtering.
  }

  private async loadData() {
    try {
      // Fetch the latest single malaria data record (for other dashboard components if needed)
      this.malariaData = await firstValueFrom(this.diseaseDataService.getMalariaStats());
      // Fetch annual aggregated malaria cases for the home card
      this.totalAnnualMalariaCases = await firstValueFrom(this.diseaseDataService.getAggregatedAnnualMalariaCases());
      this.diabetesData = await firstValueFrom(this.diseaseDataService.getDiabetesStats());
    } catch (error) {
      console.error('Error loading home dashboard data:', error);
    }
  }
}

  // getCoordinatesForLocation is no longer needed in home.component as map is removed
  // private getCoordinatesForLocation(location: string): [number, number] | null {
  //   const coords: { [key: string]: [number, number] } = {
  //     'Southwest': [4.75, 9.25],
  //     'Northwest': [6.00, 10.25],
  //     'Littoral': [4.00, 9.70],
  //     'Central': [3.85, 11.50],
  //     'East': [4.00, 14.00],
  //     'West': [5.50, 10.50],
  //     'South': [2.50, 10.50],
  //     'Far North': [10.50, 14.00],
  //     'Adamawa': [7.50, 12.50],
  //     'North': [8.50, 13.50]
  //   };
  //   return coords[location] || null;
  // }