import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables, ChartData } from 'chart.js';
import { DiseaseDataService } from '../../../core/services/disease-data.service';
import { Subscription } from 'rxjs';
import { ChartOptions } from 'chart.js';
import { DiseaseData } from '../../../core/models/disease-data.model';
import { MalariaSurveillanceData } from '../../../core/models/malaria-surveillance-data.model';
import * as L from 'leaflet';

Chart.register(...registerables);

@Component({
  selector: 'app-infectious-disease',
  templateUrl: './infectious-disease.component.html',
  styleUrls: ['./infectious-disease.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class InfectiousDiseaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('casesOverTimeChart') casesOverTimeChartRef!: ElementRef;
  @ViewChild('ageDistributionChart') ageDistributionChartRef!: ElementRef;
  @ViewChild('preventionMeasuresChart') preventionMeasuresChartRef!: ElementRef;
  @ViewChild('mapContainer') mapContainerRef!: ElementRef;
  @ViewChild('apiChart') apiChartRef!: ElementRef;
  @ViewChild('pfRateChart') pfRateChartRef!: ElementRef;
  @ViewChild('treatmentChart') treatmentChartRef!: ElementRef;
  @ViewChild('genderDistributionChart') genderDistributionChartRef!: ElementRef;
  @ViewChild('geographicDistributionChart') geographicDistributionChartRef!: ElementRef;
  @ViewChild('parasiteSpeciesChart') parasiteSpeciesChartRef!: ElementRef;
  @ViewChild('monthlyCasesChart') monthlyCasesChartRef!: ElementRef;
  @ViewChild('annualCasesChart') annualCasesChartRef!: ElementRef;
  @ViewChild('testPositivityRateChart') testPositivityRateChartRef!: ElementRef;
  @ViewChild('caseFatalityRateChart') caseFatalityRateChartRef!: ElementRef;

  selectedRegion = 'Southwest';
  regions = ['Southwest', 'Northwest', 'Littoral', 'Central', 'East', 'West', 'South', 'Far North', 'Adamawa', 'North'];
  
  private casesOverTimeChart: Chart | null = null;
  private ageDistributionChart: Chart | null = null;
  private preventionMeasuresChart: Chart | null = null;
  private apiChart: Chart | null = null;
  private pfRateChart: Chart | null = null;
  private treatmentChart: Chart | null = null;
  private map: L.Map | null = null;
  private genderDistributionChart: Chart | null = null;
  private geographicDistributionChart: Chart | null = null;
  private parasiteSpeciesChart: Chart | null = null;
  private monthlyCasesChart: Chart | null = null;
  private annualCasesChart: Chart | null = null;
  private testPositivityRateChart: Chart | null = null;
  private caseFatalityRateChart: Chart | null = null;

  stats: Partial<DiseaseData> = {
    deaths: 0
  };

  loading = true;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  // Add new properties for chart data
  ageGroupDistribution: { name: string; value: number }[] = [];
  genderDistribution: { name: string; value: number }[] = [];
  geographicDistribution: { name: string; value: number }[] = [];
  parasiteSpeciesDistribution: { name: string; value: number }[] = [];
  monthlyCases: { month: string; cases: number }[] = [];
  annualCases: { year: number; cases: number }[] = [];
  testPositivityRateData: { month: string; rate: number }[] = [];
  caseFatalityRateData: { month: string; rate: number }[] = [];

  // Add new properties for aggregated totals
  totalCases: number = 0;
  activeCases: number = 0;

  constructor(private diseaseDataService: DiseaseDataService) {}

  ngOnInit() {
    console.log('InfectiousDiseaseComponent: ngOnInit called.');
    this.loadData();
  }

  ngAfterViewInit() {
    console.log('InfectiousDiseaseComponent: ngAfterViewInit called.');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.casesOverTimeChart) this.casesOverTimeChart.destroy();
    if (this.ageDistributionChart) this.ageDistributionChart.destroy();
    if (this.preventionMeasuresChart) this.preventionMeasuresChart.destroy();
    if (this.apiChart) this.apiChart.destroy();
    if (this.pfRateChart) this.pfRateChart.destroy();
    if (this.treatmentChart) this.treatmentChart.destroy();
    if (this.map) this.map.remove();
    if (this.genderDistributionChart) this.genderDistributionChart.destroy();
    if (this.geographicDistributionChart) this.geographicDistributionChart.destroy();
    if (this.parasiteSpeciesChart) this.parasiteSpeciesChart.destroy();
    if (this.monthlyCasesChart) this.monthlyCasesChart.destroy();
    if (this.annualCasesChart) this.annualCasesChart.destroy();
    if (this.testPositivityRateChart) this.testPositivityRateChart.destroy();
    if (this.caseFatalityRateChart) this.caseFatalityRateChart.destroy();
  }

  onRegionChange() {
    console.log('InfectiousDiseaseComponent: Region changed to:', this.selectedRegion);
    this.loading = true;
    this.error = null;
    this.diseaseDataService.updateSelectedRegion(this.selectedRegion);
    this.loadData();
  }

  private loadData() {
    console.log('InfectiousDiseaseComponent: Starting loadData...');
    this.loading = true;
    this.error = null;

    // Load malaria surveillance data
    this.subscriptions.push(
      this.diseaseDataService.malariaData.subscribe({
        next: data => {
          console.log('InfectiousDiseaseComponent: Malaria data received:', data);
          if (data && data.length > 0) {
            this.processMalariaData(data); // Process data first
            this.loading = false; // Set loading to false *before* rendering charts/map
            // Ensure ViewChild references are updated by Angular
            setTimeout(() => { // Use setTimeout to ensure DOM is updated
              console.log('InfectiousDiseaseComponent: Calling updateCharts and updateMap...');
              this.updateCharts(data);
              this.updateMap(data);
            }, 0); // Use 0ms or a small delay
          } else {
            console.warn('InfectiousDiseaseComponent: No malaria data received or empty array for region:', this.selectedRegion);
            this.error = 'No malaria data available for the selected region.';
            this.loading = false;
          }
        },
        error: error => {
          this.error = 'Failed to load malaria data. Please try again.';
          this.loading = false;
          console.error('InfectiousDiseaseComponent: Error loading malaria data:', error);
        }
      })
    );

    // Load statistics
    this.subscriptions.push(
      this.diseaseDataService.getAggregatedMalariaDeaths().subscribe({
        next: stats => {
          console.log('InfectiousDiseaseComponent: Aggregated Malaria Deaths received:', stats);
          this.stats = {
            deaths: stats.deaths || 0,
          };
        },
        error: error => {
          this.error = 'Failed to load aggregated malaria statistics. Please try again.';
          console.error('InfectiousDiseaseComponent: Error loading aggregated malaria deaths:', error);
        }
      })
    );

    // Subscribe to region changes
    this.subscriptions.push(
      this.diseaseDataService.selectedRegion.subscribe(region => {
        console.log('InfectiousDiseaseComponent: Selected region updated by service:', region);
        this.selectedRegion = region;
      })
    );
  }

  private updateCharts(data: MalariaSurveillanceData[]) {
    this.updateCasesOverTimeChart(data);
    this.updateApiChart(data);
    this.updatePfRateChart(data);
    this.updateTreatmentChart(data);
    this.updateAgeDistributionChart(data);
    this.updatePreventionMeasuresChart(data);
    this.renderAgeDistributionChart();
    this.renderGenderDistributionChart();
    this.renderGeographicDistributionChart();
    this.renderParasiteSpeciesDistributionChart();
    this.renderMonthlyCasesChart();
    this.renderAnnualCasesChart();
    this.renderTestPositivityRateChart();
    this.renderCaseFatalityRateChart();
  }

  private updateCasesOverTimeChart(data: MalariaSurveillanceData[]) {
    if (this.casesOverTimeChart) {
      this.casesOverTimeChart.destroy();
    }

    if (this.casesOverTimeChartRef?.nativeElement) {
      const ctx = this.casesOverTimeChartRef.nativeElement.getContext('2d');
      if (!ctx) return;

      const chartData: ChartData = {
        labels: data.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
          label: 'Malaria Cases',
          data: data.map(d => d.confirmed_cases || 0) as number[],
          borderColor: 'rgb(255, 99, 132)',
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
              text: 'Malaria Cases Over Time'
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
  }

  private updateApiChart(data: MalariaSurveillanceData[]) {
    if (this.apiChart) {
      this.apiChart.destroy();
    }

    if (this.apiChartRef?.nativeElement) {
      const ctx = this.apiChartRef.nativeElement.getContext('2d');
      if (!ctx) return;

      const chartData: ChartData = {
        labels: data.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
          label: 'Annual Parasite Index',
          data: data.map(d => d.annual_parasite_index || 0) as number[],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };

      this.apiChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Annual Parasite Index (API)'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'API Value'
              }
            }
          }
        }
      });
    }
  }

  private updatePfRateChart(data: MalariaSurveillanceData[]) {
    if (this.pfRateChart) {
      this.pfRateChart.destroy();
    }

    if (this.pfRateChartRef?.nativeElement) {
      const ctx = this.pfRateChartRef.nativeElement.getContext('2d');
      const chartData: ChartData = {
        labels: data.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
          label: 'P. falciparum Rate',
          data: data.map(d => d.confirmed_cases_pf || 0) as number[], // Use confirmed_cases_pf
          borderColor: 'rgb(153, 102, 255)',
          tension: 0.1
        }]
      };
      this.pfRateChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'P. falciparum Rate' }
          },
          scales: { x: { beginAtZero: true }, y: { beginAtZero: true } }
        }
      });
    }
  }

  private updateTreatmentChart(data: MalariaSurveillanceData[]) {
    if (this.treatmentChart) {
      this.treatmentChart.destroy();
    }

    if (this.treatmentChartRef?.nativeElement) {
      const ctx = this.treatmentChartRef.nativeElement.getContext('2d');
      const latestData = data[data.length - 1];
      const totalTreatedCases = (latestData.act_treatment_courses || 0) + (latestData.cq_treatment_courses || 0);
      const chartData: ChartData = {
        labels: ['Tested', 'Positive', 'Treated'],
        datasets: [{
          label: 'Testing and Treatment',
          data: [
            latestData.tested_cases || 0,
            latestData.confirmed_cases || 0,
            totalTreatedCases
          ] as number[],
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ]
        }]
      };
      this.treatmentChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Testing and Treatment Overview' }
          },
          scales: { x: { beginAtZero: true }, y: { beginAtZero: true } }
        }
      });
    }
  }

  private updateAgeDistributionChart(data: MalariaSurveillanceData[]) {
    console.log('InfectiousDiseaseComponent: updateAgeDistributionChart called. Ref status:', this.ageDistributionChartRef);
    if (this.ageDistributionChart) {
      this.ageDistributionChart.destroy();
      console.log('InfectiousDiseaseComponent: Destroyed existing ageDistributionChart.');
    }

    if (this.ageDistributionChartRef && this.ageDistributionChartRef.nativeElement) {
      const ctx = this.ageDistributionChartRef.nativeElement.getContext('2d');
      if (!ctx) { console.error('InfectiousDiseaseComponent: Age Distribution Chart canvas context not found.'); return; }
      console.log('InfectiousDiseaseComponent: Age Distribution Chart canvas context found.');

      const latestData = data[data.length - 1];
      const ageData = latestData.age_distribution || {};

      const chartData: ChartData = {
        labels: Object.keys(ageData).length > 0 ? Object.keys(ageData) : ['0-5', '6-12', '13-18', '19-30', '31-50', '50+'], // Fallback labels
        datasets: [{
          label: 'Cases by Age Group',
          data: (Object.values(ageData).length > 0 ? Object.values(ageData) : [30, 45, 25, 40, 35, 20]) as number[], // Fallback data
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
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
              text: 'Age Distribution of Malaria Cases'
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
      console.log('InfectiousDiseaseComponent: Age Distribution Chart rendered.');
    } else {
      console.warn('InfectiousDiseaseComponent: Age Distribution Chart ref or nativeElement not ready.', this.ageDistributionChartRef);
    }
  }

  private updatePreventionMeasuresChart(data: MalariaSurveillanceData[]) {
    console.log('InfectiousDiseaseComponent: updatePreventionMeasuresChart called. Ref status:', this.preventionMeasuresChartRef);
    if (this.preventionMeasuresChart) {
      this.preventionMeasuresChart.destroy();
      console.log('InfectiousDiseaseComponent: Destroyed existing preventionMeasuresChart.');
    }

    if (this.preventionMeasuresChartRef && this.preventionMeasuresChartRef.nativeElement) {
      const ctx = this.preventionMeasuresChartRef.nativeElement.getContext('2d');
      const latestData = data[data.length - 1];
      const chartData: ChartData = {
        labels: ['ITN Usage', 'IRS Coverage', 'Larviciding', 'Fogging'],
        datasets: [{
          label: 'Prevention Measures',
          data: [
            latestData.itn_usage_rate || 0,
            latestData.irs_coverage || 0,
            latestData.larval_habitat_sites || 0, // Placeholder, adjust if different metric
            latestData.breeding_sites_treated || 0 // Placeholder, adjust if different metric
          ] as number[],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ]
        }]
      };
      this.preventionMeasuresChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Prevention Measures' }
          },
          scales: { x: { beginAtZero: true }, y: { beginAtZero: true } }
        }
      });
      console.log('InfectiousDiseaseComponent: Prevention Measures Chart rendered.');
    } else {
      console.warn('InfectiousDiseaseComponent: Prevention Measures Chart ref or nativeElement not ready.', this.preventionMeasuresChartRef);
    }
  }

  private initializeMap() {
    console.log('InfectiousDiseaseComponent: Initializing map.');
    if (this.mapContainerRef && this.mapContainerRef.nativeElement) {
      console.log('InfectiousDiseaseComponent: Map container ref found.', this.mapContainerRef.nativeElement);
      if (this.map) {
        (this.map as L.Map).remove(); // Type assertion
        console.log('InfectiousDiseaseComponent: Existing map removed.');
      }
      this.map = L.map(this.mapContainerRef.nativeElement).setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
      console.log('InfectiousDiseaseComponent: Map initialized with OpenStreetMap tiles.');
    } else {
      console.warn('InfectiousDiseaseComponent: Map container ref or nativeElement not ready.', this.mapContainerRef);
    }
  }

  private updateMap(data: MalariaSurveillanceData[]) {
    console.log('InfectiousDiseaseComponent: updateMap called with data:', data);
    if (!this.map) {
      console.warn('InfectiousDiseaseComponent: Map not initialized, cannot update.');
      return;
    }

    // Clear existing markers
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        this.map?.removeLayer(layer);
      }
    });
    console.log('InfectiousDiseaseComponent: Existing map markers cleared.');

    // Use the processed geographicDistribution property
    if (this.geographicDistribution && this.geographicDistribution.length > 0) {
      this.geographicDistribution.forEach(locationData => {
        const coordinates = this.getCoordinatesForLocation(locationData.name);
        if (coordinates && locationData.value > 0) {
          L.marker(coordinates)
            .bindPopup(`<b>${locationData.name}</b><br/>Malaria Cases: ${locationData.value}`)
            .addTo(this.map!); // Assert map is not null
          console.log('InfectiousDiseaseComponent: Added marker for ', locationData.name, ':', locationData.value);
        }
      });
      console.log('InfectiousDiseaseComponent: Map markers updated with geographic data.');
    } else {
      console.warn('InfectiousDiseaseComponent: No geographicDistribution data available to update map.');
      // Add fallback markers or a message if no data
    }
  }

  private getCoordinatesForLocation(location: string): [number, number] | null {
    // This is a placeholder. In a real application, you would use a geocoding service
    // or a predefined list of coordinates for your regions/districts.
    const coords: { [key: string]: [number, number] } = {
      'Southwest': [4.2185, 9.2567],
      'Northwest': [5.9575, 10.1558],
      'Littoral': [4.0511, 9.7679],
      'Central': [3.8480, 11.5021],
      'East': [4.1354, 13.6702],
      'West': [5.5000, 10.5000],
      'South': [2.5000, 10.5000],
      'Far North': [10.5000, 14.0000],
      'Adamawa': [7.5000, 12.5000],
      'North': [8.5000, 13.5000]
    };
    return coords[location] || null;
  }

  private processMalariaData(data: MalariaSurveillanceData[]) {
    // Calculate aggregated totals
    this.totalCases = data.reduce((sum, d) => sum + (d.confirmed_cases || 0), 0);
    this.activeCases = data.reduce((sum, d) => sum + ((d.confirmed_cases || 0) - (d.deaths || 0)), 0); // Active = Confirmed - Deaths

    // Process age group distribution
    this.ageGroupDistribution = [
      { name: '0-4', value: data.reduce((sum, d) => sum + (d.age_distribution?.under5 || 0), 0) },
      { name: '5-14', value: data.reduce((sum, d) => sum + (d.age_distribution?.['5-14'] || 0), 0) },
      { name: '15-24', value: data.reduce((sum, d) => sum + (d.age_distribution?.['15-49'] || 0), 0) }, // Assuming 15-24 is part of 15-49
      { name: '25-34', value: data.reduce((sum, d) => sum + (d.age_distribution?.['15-49'] || 0), 0) }, // Assuming 25-34 is part of 15-49
      { name: '35-44', value: data.reduce((sum, d) => sum + (d.age_distribution?.['15-49'] || 0), 0) }, // Assuming 35-44 is part of 15-49
      { name: '45-54', value: data.reduce((sum, d) => sum + (d.age_distribution?.['15-49'] || 0), 0) }, // Assuming 45-54 is part of 15-49
      { name: '55-64', value: data.reduce((sum, d) => sum + (d.age_distribution?.['50plus'] || 0), 0) }, // Assuming 55-64 is part of 50+
      { name: '65+', value: data.reduce((sum, d) => sum + (d.age_distribution?.['50plus'] || 0), 0) } // Assuming 65+ is part of 50+
    ];

    // Process gender distribution
    this.genderDistribution = [
      { name: 'Male', value: data.reduce((sum, d) => sum + (d.gender_distribution?.male || 0), 0) },
      { name: 'Female', value: data.reduce((sum, d) => sum + (d.gender_distribution?.female || 0), 0) }
    ];

    // Process geographic distribution
    const geographicDistributionMap = new Map<string, number>();
    data.forEach(d => {
      const region = d.region || 'Unknown Region';
      const cases = d.confirmed_cases || 0;
      geographicDistributionMap.set(region, (geographicDistributionMap.get(region) || 0) + cases);
    });
    this.geographicDistribution = Array.from(geographicDistributionMap.entries()).map(([name, value]) => ({ name, value }));

    // Process parasite species distribution
    this.parasiteSpeciesDistribution = [
      { name: 'P. falciparum', value: data.reduce((sum, d) => sum + (d.confirmed_cases_pf || 0), 0) },
      { name: 'P. vivax', value: data.reduce((sum, d) => sum + (d.confirmed_cases_pv || 0), 0) },
      { name: 'P. malariae', value: data.reduce((sum, d) => sum + (d.confirmed_cases_pm || 0), 0) },
      { name: 'P. ovale', value: data.reduce((sum, d) => sum + (d.confirmed_cases_po || 0), 0) }
    ];

    // Process monthly cases
    this.monthlyCases = data.map(d => ({
      month: new Date(d.date).toLocaleDateString('default', { month: 'short' }),
      cases: d.confirmed_cases || 0
    }));

    // Process annual cases
    const annualCasesMap = new Map<number, number>();
    data.forEach(d => {
      const year = new Date(d.date).getFullYear();
      const cases = d.confirmed_cases || 0;
      annualCasesMap.set(year, (annualCasesMap.get(year) || 0) + cases);
    });
    this.annualCases = Array.from(annualCasesMap.entries()).map(([year, cases]) => ({ year, cases }));

    // Process test positivity rate
    this.testPositivityRateData = data.map(d => ({
      month: new Date(d.date).toLocaleDateString('default', { month: 'short' }),
      rate: d.test_positivity_rate || 0
    }));

    // Process case fatality rate
    this.caseFatalityRateData = data.map(d => ({
      month: new Date(d.date).toLocaleDateString('default', { month: 'short' }),
      rate: d.case_fatality_rate || 0
    }));
  }

  private renderAgeDistributionChart() {
    if (this.ageDistributionChart) this.ageDistributionChart.destroy();
    if (this.ageDistributionChartRef?.nativeElement) {
      const ctx = this.ageDistributionChartRef.nativeElement.getContext('2d');
      const chartData: ChartData = {
        labels: this.ageGroupDistribution.map(d => d.name),
        datasets: [{
          label: 'Cases by Age Group',
          data: this.ageGroupDistribution.map(d => d.value) as number[],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(199, 199, 199, 0.5)',
            'rgba(83, 102, 255, 0.5)'
          ]
        }]
      };
      this.ageDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Age Group Distribution' }
          }
        }
      });
    }
  }

  private renderGenderDistributionChart() {
    if (this.genderDistributionChart) this.genderDistributionChart.destroy();
    if (this.genderDistributionChartRef?.nativeElement) {
      const ctx = this.genderDistributionChartRef.nativeElement.getContext('2d');
      const chartData: ChartData = {
        labels: this.genderDistribution.map(d => d.name),
        datasets: [{
          label: 'Cases by Gender',
          data: this.genderDistribution.map(d => d.value) as number[],
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)'
          ]
        }]
      };
      this.genderDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Gender Distribution' }
          }
        }
      });
    }
  }

  private renderGeographicDistributionChart() {
    if (this.geographicDistributionChart) this.geographicDistributionChart.destroy();
    if (this.geographicDistributionChartRef?.nativeElement) {
      const ctx = this.geographicDistributionChartRef.nativeElement.getContext('2d');
      const chartData: ChartData = {
        labels: this.geographicDistribution.map(d => d.name),
        datasets: [{
          label: 'Number of Cases',
          data: this.geographicDistribution.map(d => d.value) as number[],
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          borderWidth: 1
        }]
      };
      this.geographicDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Geographic Distribution of Cases' }
          },
          scales: { x: { beginAtZero: true }, y: { beginAtZero: true } }
        }
      });
    }
  }

  private renderParasiteSpeciesDistributionChart() {
    if (this.parasiteSpeciesChart) this.parasiteSpeciesChart.destroy();
    if (this.parasiteSpeciesChartRef?.nativeElement) {
      const ctx = this.parasiteSpeciesChartRef.nativeElement.getContext('2d');
      const chartData: ChartData = {
        labels: this.parasiteSpeciesDistribution.map(d => d.name),
        datasets: [{
          data: this.parasiteSpeciesDistribution.map(d => d.value) as number[],
          backgroundColor: [
            '#42A5F5',
            '#66BB6A',
            '#FFA726',
            '#EF5350'
          ]
        }]
      };
      this.parasiteSpeciesChart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'bottom' },
            title: { display: true, text: 'Parasite Species Distribution' }
          }
        }
      });
    }
  }

  private renderMonthlyCasesChart() {
    if (this.monthlyCasesChart) this.monthlyCasesChart.destroy();
    if (this.monthlyCasesChartRef?.nativeElement) {
      const ctx = this.monthlyCasesChartRef.nativeElement.getContext('2d');
      const chartData: ChartData = {
        labels: this.monthlyCases.map(d => d.month),
        datasets: [{
          label: 'Cases',
          data: this.monthlyCases.map(d => d.cases) as number[],
          borderColor: '#42A5F5',
          tension: 0.1
        }]
      };
      this.monthlyCasesChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Monthly Cases' }
          },
          scales: { x: { beginAtZero: true }, y: { beginAtZero: true } }
        }
      });
    }
  }

  private renderAnnualCasesChart() {
    if (this.annualCasesChart) this.annualCasesChart.destroy();
    if (this.annualCasesChartRef?.nativeElement) {
      const ctx = this.annualCasesChartRef.nativeElement.getContext('2d');
      const chartData: ChartData = {
        labels: this.annualCases.map(d => d.year.toString()),
        datasets: [{
          label: 'Cases',
          data: this.annualCases.map(d => d.cases) as number[],
          backgroundColor: '#42A5F5'
        }]
      };
      this.annualCasesChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Annual Cases' }
          },
          scales: { x: { beginAtZero: true }, y: { beginAtZero: true } }
        }
      });
    }
  }

  private renderTestPositivityRateChart() {
    if (this.testPositivityRateChart) this.testPositivityRateChart.destroy();
    if (this.testPositivityRateChartRef?.nativeElement) {
      const ctx = this.testPositivityRateChartRef.nativeElement.getContext('2d');
      const chartData: ChartData = {
        labels: this.testPositivityRateData.map(d => d.month),
        datasets: [{
          label: 'Test Positivity Rate',
          data: this.testPositivityRateData.map(d => d.rate) as number[],
          borderColor: '#42A5F5',
          tension: 0.1
        }]
      };
      this.testPositivityRateChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Test Positivity Rate' }
          },
          scales: { x: { beginAtZero: true }, y: { beginAtZero: true } }
        }
      });
    }
  }

  private renderCaseFatalityRateChart() {
    if (this.caseFatalityRateChart) this.caseFatalityRateChart.destroy();
    if (this.caseFatalityRateChartRef?.nativeElement) {
      const ctx = this.caseFatalityRateChartRef.nativeElement.getContext('2d');
      const chartData: ChartData = {
        labels: this.caseFatalityRateData.map(d => d.month),
        datasets: [{
          label: 'Case Fatality Rate',
          data: this.caseFatalityRateData.map(d => d.rate) as number[],
          borderColor: '#42A5F5',
          tension: 0.1
        }]
      };
      this.caseFatalityRateChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Case Fatality Rate' }
          },
          scales: { x: { beginAtZero: true }, y: { beginAtZero: true } }
        }
      });
    }
  }
}