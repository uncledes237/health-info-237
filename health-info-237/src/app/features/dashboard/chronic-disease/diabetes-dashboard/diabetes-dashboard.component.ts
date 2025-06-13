import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { DiseaseDataService } from '../../../../core/services/disease-data.service';
import { DiseaseData } from '../../../../core/models/disease-data.model';
import { firstValueFrom } from 'rxjs';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface RiskFactors {
  obesity: number;
  physical_inactivity: number;
  poor_diet: number;
  family_history: number;
}

interface TreatmentMetrics {
  medication_adherence: number;
  glucose_control: number;
  complication_rate: number;
}

@Component({
  selector: 'app-diabetes-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    NgxChartsModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Overview Cards -->
      <div class="overview-cards">
        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Total Cases</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ totalCases }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Type 1 Diabetes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ type1Cases }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Type 2 Diabetes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ type2Cases }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Gestational Diabetes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ gestationalCases }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Complication Rate</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ complicationRate }}%</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Treatment Success</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ treatmentSuccessRate }}%</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Type Distribution Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Diabetes Type Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ngx-charts-pie-chart
              [results]="typeDistributionData"
              [gradient]="true"
              [legend]="true"
              [labels]="true">
            </ngx-charts-pie-chart>
          </mat-card-content>
        </mat-card>

        <!-- Age Distribution Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Age Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ngx-charts-bar-vertical
              [results]="ageDistributionData"
              [gradient]="true"
              [xAxis]="true"
              [yAxis]="true"
              [legend]="true"
              [showXAxisLabel]="true"
              [showYAxisLabel]="true"
              xAxisLabel="Age Group"
              yAxisLabel="Number of Cases">
            </ngx-charts-bar-vertical>
          </mat-card-content>
        </mat-card>

        <!-- Geographic Distribution Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Geographic Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ngx-charts-pie-chart
              [results]="geographicDistributionData"
              [gradient]="true"
              [legend]="true"
              [labels]="true">
            </ngx-charts-pie-chart>
          </mat-card-content>
        </mat-card>

        <!-- Risk Factors Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Risk Factors Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ngx-charts-bar-vertical
              [results]="riskFactorsData"
              [gradient]="true"
              [xAxis]="true"
              [yAxis]="true"
              [legend]="true"
              [showXAxisLabel]="true"
              [showYAxisLabel]="true"
              xAxisLabel="Risk Factor"
              yAxisLabel="Percentage">
            </ngx-charts-bar-vertical>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .metric-card {
      text-align: center;
    }

    .metric-value {
      font-size: 2em;
      font-weight: bold;
      color: #1976d2;
    }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .chart-card {
      height: 400px;
    }

    mat-card-content {
      height: calc(100% - 48px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class DiabetesDashboardComponent implements OnInit {
  // Metrics
  totalCases: number = 0;
  type1Cases: number = 0;
  type2Cases: number = 0;
  gestationalCases: number = 0;
  complicationRate: number = 0;
  treatmentSuccessRate: number = 0;

  // Chart Data
  typeDistributionData: ChartDataPoint[] = [];
  ageDistributionData: ChartDataPoint[] = [];
  geographicDistributionData: ChartDataPoint[] = [];
  riskFactorsData: ChartDataPoint[] = [];

  constructor(private supabaseService: SupabaseService, private diseaseDataService: DiseaseDataService) {}

  ngOnInit() {
    this.loadDiabetesData();
  }

  private async loadDiabetesData() {
    try {
      // Load diabetes statistics
      const diabetesData = await firstValueFrom(this.diseaseDataService.getDiabetesStats());

      if (diabetesData) {
        this.totalCases = diabetesData.total_cases || 0;
        this.type1Cases = diabetesData.type1 || 0;
        this.type2Cases = diabetesData.type2 || 0;
        this.gestationalCases = diabetesData.gestational || 0;

        // Calculate rates - assuming you have data for these in DiseaseData or can derive them
        // Placeholder calculations - adjust as per your data model
        this.complicationRate = 15; // Example
        this.treatmentSuccessRate = 70; // Example

        // Chart Data Mapping
        this.typeDistributionData = [
          { name: 'Type 1', value: diabetesData.type1 || 0 },
          { name: 'Type 2', value: diabetesData.type2 || 0 },
          { name: 'Gestational', value: diabetesData.gestational || 0 },
        ].filter(d => d.value > 0); // Filter out zero values for better chart display

        this.ageDistributionData = Object.entries(diabetesData.age_distribution || {}).map(([name, value]) => ({ name, value: value as number }));
        this.geographicDistributionData = Object.entries(diabetesData.geographic_distribution || {}).map(([name, value]) => ({ name, value: value as number }));
        this.riskFactorsData = Object.entries(diabetesData.risk_factors || {}).map(([name, value]) => ({ name, value: value as number }));

      }
    } catch (error: any) {
      console.error('Error loading diabetes data:', error);
    }
  }
} 