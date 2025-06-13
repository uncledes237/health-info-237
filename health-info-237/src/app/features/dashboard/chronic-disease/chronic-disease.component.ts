import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { DiseaseDataService } from '../../../core/services/disease-data.service';
import { Subscription } from 'rxjs';
import { ChartData, ChartOptions } from 'chart.js';
import { DiseaseData } from '../../../core/models/disease-data.model';

Chart.register(...registerables);

@Component({
  selector: 'app-chronic-disease',
  templateUrl: './chronic-disease.component.html',
  styleUrls: ['./chronic-disease.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class ChronicDiseaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('casesOverTimeChart') casesOverTimeChartRef!: ElementRef;
  @ViewChild('typeDistributionChart') typeDistributionChartRef!: ElementRef;
  @ViewChild('ageDistributionChart') ageDistributionChartRef!: ElementRef;
  @ViewChild('riskFactorsChart') riskFactorsChartRef!: ElementRef;

  selectedRegion = 'Southwest';
  regions = ['Southwest', 'Northwest', 'Littoral', 'Central', 'East', 'West', 'South', 'Far North', 'Adamawa', 'North'];
  
  private casesOverTimeChart: Chart | null = null;
  private typeDistributionChart: Chart | null = null;
  private ageDistributionChart: Chart | null = null;
  private riskFactorsChart: Chart | null = null;

  stats: Partial<DiseaseData> = {
    total: 0,
    active: 0,
    recovered: 0,
    deaths: 0
  };

  loading = true;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(private diseaseDataService: DiseaseDataService) {}

  ngOnInit() {
    console.log('ChronicDiseaseComponent: ngOnInit called.');
    this.loadData();
  }

  ngAfterViewInit() {
    console.log('ChronicDiseaseComponent: ngAfterViewInit called.');
    // Charts initialization should ideally happen after data is loaded
    setTimeout(() => {
      console.log('ChronicDiseaseComponent: Checking ViewChild refs in setTimeout...');
      console.log('ChronicDiseaseComponent: casesOverTimeChartRef:', this.casesOverTimeChartRef);
      if (!this.loading && !this.error) {
        // Charts are updated via updateCharts(data) when data arrives.
      } else {
        console.log('ChronicDiseaseComponent: Not initializing charts in ngAfterViewInit, loading still true or error exists.');
      }
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.casesOverTimeChart) this.casesOverTimeChart.destroy();
    if (this.typeDistributionChart) this.typeDistributionChart.destroy();
    if (this.ageDistributionChart) this.ageDistributionChart.destroy();
    if (this.riskFactorsChart) this.riskFactorsChart.destroy();
    console.log('ChronicDiseaseComponent: ngOnDestroy called. Charts destroyed.');
  }

  onRegionChange() {
    console.log('ChronicDiseaseComponent: Region changed to:', this.selectedRegion);
    this.loading = true;
    this.error = null;
    this.diseaseDataService.updateSelectedRegion(this.selectedRegion);
    this.loadData();
  }

  private loadData() {
    console.log('ChronicDiseaseComponent: Starting loadData...');
    this.loading = true;
    this.error = null;

    // Load diabetes data
    this.subscriptions.push(
      this.diseaseDataService.diabetesData.subscribe({
        next: data => {
          console.log('ChronicDiseaseComponent: Diabetes data received (diabetesData$ subscription):', data);
          if (data && data.length > 0) {
            this.updateCharts(data);
            this.loading = false;
            console.log('ChronicDiseaseComponent: Data processed, loading set to false.');
          } else {
            console.warn('ChronicDiseaseComponent: No diabetes data received or empty array.', data);
            this.error = 'No diabetes data available for the selected region.';
            this.loading = false;
          }
        },
        error: error => {
          this.error = 'Failed to load diabetes data. Please try again.';
          this.loading = false;
          console.error('ChronicDiseaseComponent: Error loading diabetes data:', error);
        }
      })
    );

    // Load statistics
    this.subscriptions.push(
      this.diseaseDataService.getDiabetesStats().subscribe({
        next: stats => {
          console.log('ChronicDiseaseComponent: Diabetes stats received:', stats);
          this.stats = {
            total: stats.total,
            active: stats.active,
            recovered: stats.recovered,
            deaths: stats.deaths
          };
        },
        error: error => {
          this.error = 'Failed to load diabetes statistics. Please try again.';
          console.error('ChronicDiseaseComponent: Error loading diabetes stats:', error);
        }
      })
    );

    // Subscribe to region changes
    this.subscriptions.push(
      this.diseaseDataService.selectedRegion.subscribe(region => {
        console.log('ChronicDiseaseComponent: Selected region updated by service:', region);
        this.selectedRegion = region;
      })
    );
  }

  private updateCharts(data: DiseaseData[]) {
    console.log('ChronicDiseaseComponent: updateCharts called with data:', data);
    this.updateCasesOverTimeChart(data);
    this.updateTypeDistributionChart(data);
    this.updateAgeDistributionChart(data);
    this.updateRiskFactorsChart(data);
  }

  private updateCasesOverTimeChart(data: DiseaseData[]) {
    console.log('ChronicDiseaseComponent: updateCasesOverTimeChart called. Ref status:', this.casesOverTimeChartRef);
    if (this.casesOverTimeChart) {
      this.casesOverTimeChart.destroy();
      console.log('ChronicDiseaseComponent: Destroyed existing casesOverTimeChart.');
    }

    if (this.casesOverTimeChartRef && this.casesOverTimeChartRef.nativeElement) {
      const ctx = this.casesOverTimeChartRef.nativeElement.getContext('2d');
      if (!ctx) { console.error('ChronicDiseaseComponent: Cases Over Time Chart canvas context not found.'); return; }
      console.log('ChronicDiseaseComponent: Cases Over Time Chart canvas context found.');

      const chartData: ChartData<'line'> = {
        labels: data.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
          label: 'Diabetes Cases',
          data: data.map(d => d.total_cases),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };

      this.casesOverTimeChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Diabetes Cases Over Time'
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
      console.log('ChronicDiseaseComponent: Cases Over Time Chart rendered.');
    } else {
      console.warn('ChronicDiseaseComponent: Cases Over Time Chart ref or nativeElement not ready.', this.casesOverTimeChartRef);
    }
  }

  private updateTypeDistributionChart(data: DiseaseData[]) {
    console.log('ChronicDiseaseComponent: updateTypeDistributionChart called. Ref status:', this.typeDistributionChartRef);
    if (this.typeDistributionChart) {
      this.typeDistributionChart.destroy();
      console.log('ChronicDiseaseComponent: Destroyed existing typeDistributionChart.');
    }

    if (this.typeDistributionChartRef && this.typeDistributionChartRef.nativeElement) {
      const ctx = this.typeDistributionChartRef.nativeElement.getContext('2d');
      if (!ctx) { console.error('ChronicDiseaseComponent: Type Distribution Chart canvas context not found.'); return; }
      console.log('ChronicDiseaseComponent: Type Distribution Chart canvas context found.');

      const latestData = data[data.length - 1];
      
      const chartData: ChartData<'pie'> = {
        labels: ['Type 1', 'Type 2', 'Gestational'],
        datasets: [{
          data: [
            latestData.type1 || 0,
            latestData.type2 || 0,
            latestData.gestational || 0
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)'
          ]
        }]
      };

      this.typeDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Diabetes Type Distribution'
            },
            legend: { display: true, position: 'bottom' } // Added legend
          }
        }
      });
      console.log('ChronicDiseaseComponent: Type Distribution Chart rendered.');
    } else {
      console.warn('ChronicDiseaseComponent: Type Distribution Chart ref or nativeElement not ready.', this.typeDistributionChartRef);
    }
  }

  private updateAgeDistributionChart(data: DiseaseData[]) {
    console.log('ChronicDiseaseComponent: updateAgeDistributionChart called. Ref status:', this.ageDistributionChartRef);
    if (this.ageDistributionChart) {
      this.ageDistributionChart.destroy();
      console.log('ChronicDiseaseComponent: Destroyed existing ageDistributionChart.');
    }

    if (this.ageDistributionChartRef && this.ageDistributionChartRef.nativeElement) {
      const ctx = this.ageDistributionChartRef.nativeElement.getContext('2d');
      if (!ctx) { console.error('ChronicDiseaseComponent: Age Distribution Chart canvas context not found.'); return; }
      console.log('ChronicDiseaseComponent: Age Distribution Chart canvas context found.');

      const latestData = data[data.length - 1];
      const ageData = latestData.age_distribution || {};

      const chartData: ChartData<'bar'> = {
        labels: Object.keys(ageData).length > 0 ? Object.keys(ageData) : ['0-5', '6-12', '13-18', '19-30', '31-50', '50+'], // Fallback labels
        datasets: [{
          label: 'Cases by Age Group',
          data: Object.values(ageData).length > 0 ? Object.values(ageData) : [20, 30, 40, 50, 35, 25], // Fallback data
          backgroundColor: 'rgba(75, 192, 192, 0.5)'
        }]
      };

      this.ageDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Age Distribution of Diabetes Cases'
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
      console.log('ChronicDiseaseComponent: Age Distribution Chart rendered.');
    } else {
      console.warn('ChronicDiseaseComponent: Age Distribution Chart ref or nativeElement not ready.', this.ageDistributionChartRef);
    }
  }

  private updateRiskFactorsChart(data: DiseaseData[]) {
    console.log('ChronicDiseaseComponent: updateRiskFactorsChart called. Ref status:', this.riskFactorsChartRef);
    if (this.riskFactorsChart) {
      this.riskFactorsChart.destroy();
      console.log('ChronicDiseaseComponent: Destroyed existing riskFactorsChart.');
    }

    if (this.riskFactorsChartRef && this.riskFactorsChartRef.nativeElement) {
      const ctx = this.riskFactorsChartRef.nativeElement.getContext('2d');
      if (!ctx) { console.error('ChronicDiseaseComponent: Risk Factors Chart canvas context not found.'); return; }
      console.log('ChronicDiseaseComponent: Risk Factors Chart canvas context found.');

      const latestData = data[data.length - 1];
      const riskFactorsData = {
        'Hypertension': latestData.risk_factors?.hypertension || 0,
        'Obesity': latestData.risk_factors?.obesity || 0,
        'Smoking': latestData.risk_factors?.smoking || 0,
        'Physical Inactivity': latestData.risk_factors?.physical_inactivity || 0
      };

      const chartData: ChartData<'bar'> = {
        labels: Object.keys(riskFactorsData),
        datasets: [{
          label: 'Cases by Risk Factor',
          data: Object.values(riskFactorsData),
          backgroundColor: [
            'rgba(255, 159, 64, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(201, 203, 207, 0.5)',
            'rgba(255, 99, 132, 0.5)'
          ]
        }]
      };

      this.riskFactorsChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Risk Factors for Diabetes'
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
      console.log('ChronicDiseaseComponent: Risk Factors Chart rendered.');
    } else {
      console.warn('ChronicDiseaseComponent: Risk Factors Chart ref or nativeElement not ready.', this.riskFactorsChartRef);
    }
  }

  // Helper to ensure chart data is available (for when data might be null/undefined initially)
  private getSafeChartData(dataArray: any[], property: string, fallbackValue: any = 0) {
    return dataArray.map(d => d[property] || fallbackValue);
  }
} 