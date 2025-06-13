import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { Chart } from 'chart.js/auto';
import { SupabaseService } from '../../../core/services/supabase.service';
import { DiseaseData } from '../../../core/models/disease-data.model';
import { CaseReport } from '../../../core/models/case-report.model';
import { DiseaseStatistics } from '../../../core/models/disease-statistics.model';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface EnvironmentalFactors {
  rainfall: string;
  temperature: string;
  humidity: string;
}

interface PreventiveMeasures {
  itn_usage: number;
  spraying_coverage: number;
}

interface VectorControl {
  larviciding: number;
  fogging: number;
}

@Component({
  selector: 'app-malaria-dashboard',
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
    FormsModule
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
            <mat-card-title>Incidence Rate</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ incidenceRate }}%</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Prevalence Rate</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ prevalenceRate }}%</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Mortality Rate</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ mortalityRate }}%</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Detection Rate</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ detectionRate }}%</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Hospitalization Rate</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ hospitalizationRate }}%</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Treatment Adherence</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ treatmentAdherenceRate }}%</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-header>
            <mat-card-title>Community Awareness</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{ communityAwarenessLevel }}%</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Age Distribution Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Age Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas #ageDistributionChart></canvas>
          </mat-card-content>
        </mat-card>

        <!-- Gender Distribution Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Gender Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas #genderDistributionChart></canvas>
          </mat-card-content>
        </mat-card>

        <!-- Geographic Distribution Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Geographic Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas #geographicDistributionChart></canvas>
          </mat-card-content>
        </mat-card>

        <!-- Parasite Species Distribution Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Parasite Species Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas #parasiteSpeciesChart></canvas>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Prevention and Control Section -->
      <div class="prevention-section">
        <mat-card class="prevention-card">
          <mat-card-header>
            <mat-card-title>Preventive Measures</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="prevention-metrics">
              <div class="prevention-metric">
                <span>ITN Usage</span>
                <mat-progress-bar
                  mode="determinate"
                  [value]="itnUsage"
                  [color]="'primary'">
                </mat-progress-bar>
                <span>{{ itnUsage }}%</span>
              </div>
              <div class="prevention-metric">
                <span>Spraying Coverage</span>
                <mat-progress-bar
                  mode="determinate"
                  [value]="sprayingCoverage"
                  [color]="'accent'">
                </mat-progress-bar>
                <span>{{ sprayingCoverage }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="prevention-card">
          <mat-card-header>
            <mat-card-title>Vector Control</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="prevention-metrics">
              <div class="prevention-metric">
                <span>Larviciding Coverage</span>
                <mat-progress-bar
                  mode="determinate"
                  [value]="larvicidingCoverage"
                  [color]="'primary'">
                </mat-progress-bar>
                <span>{{ larvicidingCoverage }}%</span>
              </div>
              <div class="prevention-metric">
                <span>Fogging Coverage</span>
                <mat-progress-bar
                  mode="determinate"
                  [value]="foggingCoverage"
                  [color]="'accent'">
                </mat-progress-bar>
                <span>{{ foggingCoverage }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Environmental Factors Section -->
      <mat-card class="environmental-card">
        <mat-card-header>
          <mat-card-title>Environmental Factors</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="environmental-factors">
            <div class="environmental-factor">
              <span>Rainfall</span>
              <span class="factor-value">{{ environmentalFactors.rainfall }}</span>
            </div>
            <div class="environmental-factor">
              <span>Temperature</span>
              <span class="factor-value">{{ environmentalFactors.temperature }}</span>
            </div>
            <div class="environmental-factor">
              <span>Humidity</span>
              <span class="factor-value">{{ environmentalFactors.humidity }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
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

    .prevention-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .prevention-metrics {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .prevention-metric {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .environmental-factors {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .environmental-factor {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .factor-value {
      font-weight: bold;
      color: #1976d2;
    }
  `]
})
export class MalariaDashboardComponent implements OnInit {
  // Basic metrics
  totalCases: number = 0;
  incidenceRate: number = 0;
  prevalenceRate: number = 0;
  mortalityRate: number = 0;
  detectionRate: number = 0;
  hospitalizationRate: number = 0;
  treatmentAdherenceRate: number = 0;
  communityAwarenessLevel: number = 0;
  
  // Distribution data
  ageDistributionData: ChartDataPoint[] = [];
  genderDistributionData: ChartDataPoint[] = [];
  geographicDistributionData: ChartDataPoint[] = [];
  parasiteSpeciesData: ChartDataPoint[] = [];
  
  // Prevention metrics
  itnUsage: number = 0;
  sprayingCoverage: number = 0;
  larvicidingCoverage: number = 0;
  foggingCoverage: number = 0;
  
  // Environmental factors
  environmentalFactors: EnvironmentalFactors = {
    rainfall: '',
    temperature: '',
    humidity: ''
  };

  @ViewChild('ageDistributionChart') ageDistributionChart!: ElementRef;
  @ViewChild('genderDistributionChart') genderDistributionChart!: ElementRef;
  @ViewChild('geographicDistributionChart') geographicDistributionChart!: ElementRef;
  @ViewChild('parasiteSpeciesChart') parasiteSpeciesChart!: ElementRef;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadMalariaData();
  }

  private async loadMalariaData() {
    try {
      const { data: diseaseData, error } = await this.supabaseService
        .getDiseaseData('malaria', 'southwest');

      if (error) throw error;
      if (!diseaseData || diseaseData.length === 0) {
        console.warn('No malaria data available');
        return;
      }

      // Process the latest data
      const latestData = diseaseData[0];
      
      // Update basic metrics
      this.totalCases = latestData.total_cases || 0;
      this.incidenceRate = latestData.incidence || 0;
      this.prevalenceRate = latestData.prevalence || 0;
      this.mortalityRate = latestData.mortality_rate || 0;
      this.detectionRate = latestData.detection_rate || 0;
      this.hospitalizationRate = latestData.hospitalization_rate || 0;
      this.treatmentAdherenceRate = latestData.treatment_adherence_rate || 0;
      this.communityAwarenessLevel = latestData.community_awareness_level || 0;

      // Process distribution data
      this.ageDistributionData = this.processDistributionData(latestData.age_distribution);
      this.genderDistributionData = this.processDistributionData(latestData.gender_distribution);
      this.geographicDistributionData = this.processDistributionData(latestData.geographic_distribution);
      this.parasiteSpeciesData = this.processDistributionData(latestData.parasite_species_distribution);

      // Process preventive measures
      const preventiveMeasures = latestData.preventive_measures_data || {};
      this.itnUsage = preventiveMeasures.itn_usage || 0;
      this.sprayingCoverage = preventiveMeasures.spraying_coverage || 0;

      // Process vector control data
      const vectorControl = latestData.vector_control_data || {};
      this.larvicidingCoverage = vectorControl.larviciding || 0;
      this.foggingCoverage = vectorControl.fogging || 0;

      // Process environmental factors
      this.environmentalFactors = latestData.environmental_factors || {
        rainfall: '',
        temperature: '',
        humidity: ''
      };

      this.renderCharts();

    } catch (error) {
      console.error('Error loading malaria data:', error);
    }
  }

  private processDistributionData(data: any): ChartDataPoint[] {
    if (!data) return [];
    return Object.entries(data)
      .map(([name, value]) => ({
        name,
        value: Number(value) || 0
      }))
      .filter(point => point.value > 0);
  }

  private renderCharts() {
    this.renderAgeDistributionChart();
    this.renderGenderDistributionChart();
    this.renderGeographicDistributionChart();
    this.renderParasiteSpeciesChart();
  }

  private renderAgeDistributionChart() {
    const ctx = this.ageDistributionChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.ageDistributionData.map(d => d.name),
        datasets: [{
          label: 'Number of Cases',
          data: this.ageDistributionData.map(d => d.value),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private renderGenderDistributionChart() {
    const ctx = this.genderDistributionChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.genderDistributionData.map(d => d.name),
        datasets: [{
          data: this.genderDistributionData.map(d => d.value),
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Gender Distribution'
          }
        }
      }
    });
  }

  private renderGeographicDistributionChart() {
    const ctx = this.geographicDistributionChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.geographicDistributionData.map(d => d.name),
        datasets: [{
          data: this.geographicDistributionData.map(d => d.value),
          backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Geographic Distribution'
          }
        }
      }
    });
  }

  private renderParasiteSpeciesChart() {
    const ctx = this.parasiteSpeciesChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.parasiteSpeciesData.map(d => d.name),
        datasets: [{
          data: this.parasiteSpeciesData.map(d => d.value),
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(153, 102, 255, 0.2)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)', 'rgba(153, 102, 255, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Parasite Species Distribution'
          }
        }
      }
    });
  }
} 