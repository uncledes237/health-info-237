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

  selectedRegion = 'Southwest';
  regions = ['Southwest', 'Northwest', 'Littoral', 'Central', 'East', 'West', 'South', 'Far North', 'Adamawa', 'North'];
  
  private casesOverTimeChart: Chart | null = null;
  private ageDistributionChart: Chart | null = null;
  private preventionMeasuresChart: Chart | null = null;
  private map: L.Map | null = null;

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
    console.log('InfectiousDiseaseComponent: ngOnInit called.');
    this.loadData();
  }

  ngAfterViewInit() {
    console.log('InfectiousDiseaseComponent: ngAfterViewInit called.');
    // Charts and map initialization should ideally happen after data is loaded
    // and view children are guaranteed to be ready. The setTimeout is a safeguard.
    setTimeout(() => {
      console.log('InfectiousDiseaseComponent: Checking ViewChild refs in setTimeout...');
      console.log('InfectiousDiseaseComponent: mapContainerRef:', this.mapContainerRef);
      console.log('InfectiousDiseaseComponent: casesOverTimeChartRef:', this.casesOverTimeChartRef);
      // Initialize map and charts if data is already loaded, otherwise loadData will handle it
      if (!this.loading && !this.error) {
        this.initializeMap();
        // The charts are updated via updateCharts(data) when data arrives.
        // No direct call to renderCharts here, as it's data-driven.
      } else {
        console.log('InfectiousDiseaseComponent: Not initializing map/charts in ngAfterViewInit, loading still true or error exists.');
      }
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.casesOverTimeChart) this.casesOverTimeChart.destroy();
    if (this.ageDistributionChart) this.ageDistributionChart.destroy();
    if (this.preventionMeasuresChart) this.preventionMeasuresChart.destroy();
    if (this.map) this.map.remove();
    console.log('InfectiousDiseaseComponent: ngOnDestroy called. Charts and map destroyed.');
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

    // Load malaria data
    this.subscriptions.push(
      this.diseaseDataService.malariaData.subscribe({
        next: data => {
          console.log('InfectiousDiseaseComponent: Malaria data received (malariaData$ subscription):', data);
          if (data && data.length > 0) {
            this.updateCharts(data);
            this.updateMap(data);
            this.loading = false;
            console.log('InfectiousDiseaseComponent: Data processed, loading set to false.');
          } else {
            console.warn('InfectiousDiseaseComponent: No malaria data received or empty array.', data);
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
      this.diseaseDataService.getMalariaStats().subscribe({
        next: stats => {
          console.log('InfectiousDiseaseComponent: Malaria stats received:', stats);
          this.stats = {
            total: stats.total,
            active: stats.active,
            recovered: stats.recovered,
            deaths: stats.deaths
          };
        },
        error: error => {
          this.error = 'Failed to load malaria statistics. Please try again.';
          console.error('InfectiousDiseaseComponent: Error loading malaria stats:', error);
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

  private updateCharts(data: DiseaseData[]) {
    console.log('InfectiousDiseaseComponent: updateCharts called with data:', data);
    this.updateCasesOverTimeChart(data);
    this.updateAgeDistributionChart(data);
    this.updatePreventionMeasuresChart(data);
  }

  private updateCasesOverTimeChart(data: DiseaseData[]) {
    console.log('InfectiousDiseaseComponent: updateCasesOverTimeChart called. Ref status:', this.casesOverTimeChartRef);
    if (this.casesOverTimeChart) {
      this.casesOverTimeChart.destroy();
      console.log('InfectiousDiseaseComponent: Destroyed existing casesOverTimeChart.');
    }

    if (this.casesOverTimeChartRef && this.casesOverTimeChartRef.nativeElement) {
      const ctx = this.casesOverTimeChartRef.nativeElement.getContext('2d');
      if (!ctx) { console.error('InfectiousDiseaseComponent: Cases Over Time Chart canvas context not found.'); return; }
      console.log('InfectiousDiseaseComponent: Cases Over Time Chart canvas context found.');

      const chartData = {
        labels: data.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
          label: 'Malaria Cases',
          data: data.map(d => d.total_cases),
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
      console.log('InfectiousDiseaseComponent: Cases Over Time Chart rendered.');
    } else {
      console.warn('InfectiousDiseaseComponent: Cases Over Time Chart ref or nativeElement not ready.', this.casesOverTimeChartRef);
    }
  }

  private updateAgeDistributionChart(data: DiseaseData[]) {
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

      const chartData = {
        labels: Object.keys(ageData).length > 0 ? Object.keys(ageData) : ['0-5', '6-12', '13-18', '19-30', '31-50', '50+'], // Fallback labels
        datasets: [{
          label: 'Cases by Age Group',
          data: Object.values(ageData).length > 0 ? Object.values(ageData) : [30, 45, 25, 40, 35, 20], // Fallback data
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

  private updatePreventionMeasuresChart(data: DiseaseData[]) {
    console.log('InfectiousDiseaseComponent: updatePreventionMeasuresChart called. Ref status:', this.preventionMeasuresChartRef);
    if (this.preventionMeasuresChart) {
      this.preventionMeasuresChart.destroy();
      console.log('InfectiousDiseaseComponent: Destroyed existing preventionMeasuresChart.');
    }

    if (this.preventionMeasuresChartRef && this.preventionMeasuresChartRef.nativeElement) {
      const ctx = this.preventionMeasuresChartRef.nativeElement.getContext('2d');
      if (!ctx) { console.error('InfectiousDiseaseComponent: Prevention Measures Chart canvas context not found.'); return; }
      console.log('InfectiousDiseaseComponent: Prevention Measures Chart canvas context found.');

      const latestData = data[data.length - 1];
      const preventionData = {
        'ITN Usage': latestData.preventive_measures_data?.itn_usage || 0,
        'Spraying Coverage': latestData.preventive_measures_data?.spraying_coverage || 0,
        'Larviciding': latestData.vector_control_data?.larviciding || 0,
        'Fogging': latestData.vector_control_data?.fogging || 0
      };

      const chartData = {
        labels: Object.keys(preventionData),
        datasets: [{
          data: Object.values(preventionData),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ]
        }]
      };

      this.preventionMeasuresChart = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Malaria Prevention Measures Coverage'
            },
            legend: { display: true, position: 'bottom' } // Added legend for doughnut chart
          }
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

  private updateMap(data: DiseaseData[]) {
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

    const latestData = data[data.length - 1]; // Get latest data for location
    const geographicData = latestData.geographic_distribution;

    if (geographicData) {
      Object.entries(geographicData).forEach(([locationName, caseCount]) => {
        const coordinates = this.getCoordinatesForLocation(locationName);
        if (coordinates && caseCount > 0) {
          L.marker(coordinates)
            .bindPopup(`<b>${locationName}</b><br/>Malaria Cases: ${caseCount}`)
            .addTo(this.map!); // Assert map is not null
          console.log('InfectiousDiseaseComponent: Added marker for ', locationName, ':', caseCount);
        }
      });
      console.log('InfectiousDiseaseComponent: Map markers updated with geographic data.');
    } else {
      console.warn('InfectiousDiseaseComponent: No geographic_distribution data available to update map.');
      // Add fallback markers or a message if no data
      if (this.map && data.length > 0) {
        // Example: Add a central marker or a message indicating no specific geo data
        L.marker([0, 0])
          .bindPopup('No detailed geographic distribution data.')
          .addTo(this.map);
      }
    }
  }

  // This is a placeholder. You would replace this with actual coordinate lookup logic.
  private getCoordinatesForLocation(location: string): [number, number] | null {
    // Example coordinates for demonstration. Replace with actual mapping.
    const coords: { [key: string]: [number, number] } = {
      'Southwest': [4.75, 9.25],
      'Northwest': [6.00, 10.25],
      'Littoral': [4.00, 9.70],
      'Central': [3.85, 11.50],
      'East': [4.00, 14.00],
      'West': [5.50, 10.50],
      'South': [2.50, 10.50],
      'Far North': [10.50, 14.00],
      'Adamawa': [7.50, 12.50],
      'North': [8.50, 13.50]
    };
    return coords[location] || null;
  }

  // Helper to ensure chart data is available (for when data might be null/undefined initially)
  private getSafeChartData(dataArray: any[], property: string, fallbackValue: any = 0) {
    return dataArray.map(d => d[property] || fallbackValue);
  }
}
