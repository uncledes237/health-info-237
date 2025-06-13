import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { DiseaseDataService } from '../../../../core/services/disease-data.service';
import { Subscription } from 'rxjs';
import { ChartData, ChartOptions } from 'chart.js';
import { DiseaseData } from '../../../../core/models/disease-data.model';

Chart.register(...registerables);

@Component({
  selector: 'app-diabetes-data',
  templateUrl: './diabetes-data.component.html',
  styleUrls: ['./diabetes-data.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class DiabetesDataComponent implements OnInit, OnDestroy {
  selectedRegion = 'Southwest';
  regions = ['Southwest', 'Northwest', 'Littoral', 'Central', 'East', 'West', 'South', 'Far North', 'Adamawa', 'North'];
  
  chart: Chart | null = null;
  hba1cChart: Chart | null = null;
  treatmentChart: Chart | null = null;
  complicationsChart: Chart | null = null;
  riskFactorsChart: Chart | null = null;
  
  stats: Partial<DiseaseData> = {
    total: 0,
    type1: 0,
    type2: 0,
    gestational: 0
  };

  loading = true;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(private diseaseDataService: DiseaseDataService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.hba1cChart) this.hba1cChart.destroy();
    if (this.treatmentChart) this.treatmentChart.destroy();
    if (this.complicationsChart) this.complicationsChart.destroy();
    if (this.riskFactorsChart) this.riskFactorsChart.destroy();
  }

  onRegionChange() {
    this.loading = true;
    this.error = null;
    this.diseaseDataService.updateSelectedRegion(this.selectedRegion);
    this.loadData();
  }

  public loadData() {
    this.loading = true;
    this.error = null;
    // Subscribe to diabetes data updates using the public observable
    this.subscriptions.push(
      this.diseaseDataService.diabetesData.subscribe({
        next: data => {
          if (data && data.length > 0) {
            this.updateChart(data);
            this.loading = false;
          }
        },
        error: error => {
          this.error = 'Failed to load diabetes data. Please try again.';
          this.loading = false;
          console.error('Error loading diabetes data:', error);
        }
      })
    );

    // Subscribe to stats updates
    this.subscriptions.push(
      this.diseaseDataService.getDiabetesStats().subscribe({
        next: stats => {
          this.stats = {
            total: stats.total,
            type1: stats.type1,
            type2: stats.type2,
            gestational: stats.gestational
          };
        },
        error: error => {
          this.error = 'Failed to load diabetes statistics. Please try again.';
          console.error('Error loading diabetes stats:', error);
        }
      })
    );

    // Subscribe to region changes
    this.subscriptions.push(
      this.diseaseDataService.selectedRegion.subscribe(region => {
        this.selectedRegion = region;
      })
    );
  }

  private updateChart(data: any[]) {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('diabetesChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chartData = this.diseaseDataService.getTrendData('diabetes');
    this.subscriptions.push(
      chartData.subscribe({
        next: data => {
          const chartConfig = {
            type: 'bar' as const,
            data: data as ChartData<'bar'>,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Diabetes Cases Over Time'
                },
                legend: {
                  position: 'top' as const
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Cases'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date'
                  }
                }
              }
            } as ChartOptions<'bar'>
          };

          this.chart = new Chart(ctx, chartConfig);
        },
        error: error => {
          this.error = 'Failed to load chart data. Please try again.';
          console.error('Error loading chart data:', error);
        }
      })
    );
  }

  private updateHbA1cChart() {
    if (this.hba1cChart) {
      this.hba1cChart.destroy();
    }

    const ctx = document.getElementById('hba1cChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.hba1cChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Normal', 'Prediabetes', 'Diabetes'],
        datasets: [{
          data: [
            this.stats.hba1c_levels?.normal || 0,
            this.stats.hba1c_levels?.prediabetes || 0,
            this.stats.hba1c_levels?.diabetes || 0
          ],
          backgroundColor: ['#4BC0C0', '#FF9F40', '#9966FF']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'HbA1c Distribution'
          }
        }
      }
    });
  }

  private updateTreatmentChart() {
    if (this.treatmentChart) {
      this.treatmentChart.destroy();
    }

    const ctx = document.getElementById('treatmentChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.treatmentChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Medication', 'Diet', 'Exercise'],
        datasets: [{
          label: 'Treatment Adherence',
          data: [
            this.stats.treatment_adherence?.medication || 0,
            this.stats.treatment_adherence?.diet || 0,
            this.stats.treatment_adherence?.exercise || 0
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: '#36A2EB',
          pointBackgroundColor: '#36A2EB'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Treatment Adherence'
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  private updateComplicationsChart() {
    if (this.complicationsChart) {
      this.complicationsChart.destroy();
    }

    const ctx = document.getElementById('complicationsChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.complicationsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Cardiovascular', 'Renal', 'Neuropathy', 'Retinopathy'],
        datasets: [{
          label: 'Complications',
          data: [
            this.stats.complications?.cardiovascular || 0,
            this.stats.complications?.renal || 0,
            this.stats.complications?.neuropathy || 0,
            this.stats.complications?.retinopathy || 0
          ],
          backgroundColor: '#FF6384'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Diabetes Complications'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Cases'
            }
          }
        }
      }
    });
  }

  private updateRiskFactorsChart() {
    if (this.riskFactorsChart) {
      this.riskFactorsChart.destroy();
    }

    const ctx = document.getElementById('riskFactorsChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.riskFactorsChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Obesity', 'Hypertension', 'Smoking', 'Physical Inactivity'],
        datasets: [{
          data: [
            this.stats.risk_factors?.obesity || 0,
            this.stats.risk_factors?.hypertension || 0,
            this.stats.risk_factors?.smoking || 0,
            this.stats.risk_factors?.physical_inactivity || 0
          ],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Risk Factors Distribution'
          }
        }
      }
    });
  }
} 