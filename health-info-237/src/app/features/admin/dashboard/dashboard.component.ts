import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonRefresher, IonDatetime, IonModal } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Chart, ChartConfiguration, ChartTypeRegistry, ChartData } from 'chart.js/auto';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { formatDate } from '@angular/common';
import { Point, BubbleDataPoint } from 'chart.js';

interface DashboardMetrics {
  totalCases: number;
  activeUsers: number;
  systemHealth: number;
  responseTime: number;
  recentAlerts: number;
  databaseStatus: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

interface CaseTrend {
  date: Date;
  malaria: number;
  diabetes: number;
}

interface LocationData {
  location: string;
  malaria: number;
  diabetes: number;
  lat: number;
  lng: number;
}

interface UserActivity {
  user: string;
  action: string;
  timestamp: Date;
  details: string;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface DiseaseDistribution {
  disease: string;
  count: number;
  percentage: number;
}

interface DrillDownData {
  location: string;
  cases: {
    malaria: number;
    diabetes: number;
  };
  demographics: {
    ageGroups: { [key: string]: number };
    gender: { male: number; female: number };
  };
}

interface CorrelationData {
  factor1: string;
  factor2: string;
  correlation: number;
}

interface TimeSeriesData {
  date: Date;
  trend: number;
  seasonal: number;
  residual: number;
  actual: number;
}

interface DemographicPyramid {
  ageGroup: string;
  male: number;
  female: number;
}

interface TreatmentEffectiveness {
  treatment: string;
  successRate: number;
  recoveryTime: number;
  cost: number;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface SystemAlert {
  id: number;
  title: string;
  message: string;
  type: 'disease' | 'safety' | 'system' | 'user';
  severity: 'error' | 'warning' | 'success' | 'info';
  status: 'active' | 'resolved' | 'acknowledged';
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  assigned_to?: string;
}

// Extend Leaflet types to include heat layer
declare module 'leaflet' {
  function heatLayer(
    latlngs: [number, number, number][],
    options?: {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: { [key: number]: string };
    }
  ): any;
}

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-content class="ion-padding">
      <!-- Date Range Filter -->
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="openDateRangeModal()">
            <ion-icon name="calendar-outline" slot="start"></ion-icon>
            {{ formatDateRange(dateRange) }}
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button (click)="exportDashboardData()">
            <ion-icon name="download-outline" slot="start"></ion-icon>
            Export
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-refresher slot="fixed" (ionRefresh)="refreshDashboard($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid>
        <!-- Quick Stats -->
        <ion-row>
          <ion-col size="12" size-md="6" size-lg="3" *ngFor="let stat of quickStats">
            <ion-card [class]="stat.status">
              <ion-card-header>
                <ion-card-subtitle>{{ stat.label }}</ion-card-subtitle>
                <ion-card-title>
                  {{ stat.value }}
                  <ion-icon 
                    [name]="stat.trend === 'up' ? 'arrow-up' : stat.trend === 'down' ? 'arrow-down' : 'remove'"
                    [color]="stat.trend === 'up' ? 'success' : stat.trend === 'down' ? 'danger' : 'medium'">
                  </ion-icon>
                </ion-card-title>
              </ion-card-header>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Main Content -->
        <ion-row>
          <ion-col size="12" size-lg="8">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Disease Spread Map</ion-card-title>
                <ion-card-subtitle>Real-time visualization of disease spread</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div #mapContainer style="height: 400px;"></div>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="12" size-lg="4">
            <ion-card>
              <ion-card-header>
                <ion-card-title>System Metrics</ion-card-title>
                <ion-card-subtitle>Current system performance</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item *ngFor="let metric of systemMetrics">
                    <ion-label>
                      <h2>{{ metric.name }}</h2>
                      <p>{{ metric.value }}{{ metric.unit }}</p>
                    </ion-label>
                    <ion-badge [color]="metric.status" slot="end">
                      {{ metric.status }}
                    </ion-badge>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Charts -->
        <ion-row>
          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Cases Over Time</ion-card-title>
                <ion-card-subtitle>Daily case count trends</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <canvas #casesChart></canvas>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Resource Utilization</ion-card-title>
                <ion-card-subtitle>Hospital and ICU capacity</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <canvas #resourcesChart></canvas>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Recent Alerts -->
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Recent Alerts</ion-card-title>
                <ion-button fill="clear" size="small" routerLink="/admin/alerts">
                  View All
                </ion-button>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item *ngFor="let alert of recentAlerts">
                    <ion-icon [name]="getAlertIcon(alert.severity)" 
                             [color]="getAlertColor(alert.severity)" 
                             slot="start">
                    </ion-icon>
                    <ion-label>
                      <h3>{{ alert.title }}</h3>
                      <p>{{ alert.message }}</p>
                      <p class="alert-meta">
                        {{ alert.timestamp | date:'short' }}
                        <ion-badge [color]="getAlertColor(alert.severity)">
                          {{ alert.severity }}
                        </ion-badge>
                      </p>
                    </ion-label>
                  </ion-item>
                  <ion-item *ngIf="!recentAlerts.length">
                    <ion-label>No recent alerts</ion-label>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Geographical Distribution -->
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Geographical Distribution</ion-card-title>
                <ion-card-subtitle>Disease cases by location</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div #mapContainer class="map-container"></div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- System Status and Performance -->
        <ion-row>
          <!-- System Status -->
          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>System Status</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item>
                    <ion-icon name="hardware-chip-outline" slot="start"></ion-icon>
                    <ion-label>
                      <h3>CPU Usage</h3>
                      <ion-progress-bar [value]="metrics.cpuUsage / 100" 
                                      [color]="getUsageColor(metrics.cpuUsage)">
                      </ion-progress-bar>
                      <p>{{ metrics.cpuUsage }}%</p>
                    </ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-icon name="save-outline" slot="start"></ion-icon>
                    <ion-label>
                      <h3>Memory Usage</h3>
                      <ion-progress-bar [value]="metrics.memoryUsage / 100"
                                      [color]="getUsageColor(metrics.memoryUsage)">
                      </ion-progress-bar>
                      <p>{{ metrics.memoryUsage }}%</p>
                    </ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-icon name="disc-outline" slot="start"></ion-icon>
                    <ion-label>
                      <h3>Disk Usage</h3>
                      <ion-progress-bar [value]="metrics.diskUsage / 100"
                                      [color]="getUsageColor(metrics.diskUsage)">
                      </ion-progress-bar>
                      <p>{{ metrics.diskUsage }}%</p>
                    </ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-icon name="wifi-outline" slot="start"></ion-icon>
                    <ion-label>
                      <h3>Network Latency</h3>
                      <p>{{ metrics.networkLatency }}ms</p>
                    </ion-label>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Performance Metrics -->
          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Performance Metrics</ion-card-title>
                <ion-card-subtitle>Last hour</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <canvas #performanceChart></canvas>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- User Activity Timeline -->
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Recent User Activity</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-timeline>
                  <ion-item *ngFor="let activity of userActivities">
                    <ion-icon [name]="getActivityIcon(activity.action)" 
                             [color]="getActivityColor(activity.action)"
                             slot="start">
                    </ion-icon>
                    <ion-label>
                      <h3>{{ activity.user }}</h3>
                      <p>{{ activity.action }}</p>
                      <p class="activity-meta">
                        {{ activity.timestamp | date:'short' }}
                        <span *ngIf="activity.details">• {{ activity.details }}</span>
                      </p>
                    </ion-label>
                  </ion-item>
                </ion-timeline>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Quick Actions -->
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Quick Actions</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-grid>
                  <ion-row>
                    <ion-col size="6" size-md="3" *ngFor="let action of quickActions">
                      <ion-button expand="block" [routerLink]="action.route" [color]="action.color">
                        <ion-icon [name]="action.icon" slot="start"></ion-icon>
                        {{ action.label }}
                      </ion-button>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Disease Distribution -->
        <ion-row>
          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Disease Distribution</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <canvas #diseaseDistributionChart></canvas>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Heat Map -->
          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Disease Heat Map</ion-card-title>
                <ion-card-subtitle>Case density visualization</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div #heatMapContainer class="map-container"></div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Additional Visualizations -->
        <ion-row>
          <!-- Correlation Matrix -->
          <ion-col size="12" size-lg="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Disease Factor Correlations</ion-card-title>
                <ion-card-subtitle>Relationship between different factors</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <canvas #correlationMatrixChart></canvas>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Time Series Decomposition -->
          <ion-col size="12" size-lg="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Case Trend Analysis</ion-card-title>
                <ion-card-subtitle>Time series decomposition</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <canvas #timeSeriesChart></canvas>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row>
          <!-- Demographic Pyramid -->
          <ion-col size="12" size-lg="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Demographic Distribution</ion-card-title>
                <ion-card-subtitle>Age and gender pyramid</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <canvas #demographicPyramidChart></canvas>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Treatment Effectiveness -->
          <ion-col size="12" size-lg="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Treatment Effectiveness</ion-card-title>
                <ion-card-subtitle>Success rates and recovery times</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <canvas #treatmentEffectivenessChart></canvas>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <!-- Drill Down Modal -->
        <ion-modal [isOpen]="showDrillDown" (didDismiss)="closeDrillDown()">
          <ng-template>
            <ion-header>
              <ion-toolbar>
                <ion-title>Location Details: {{ selectedLocation }}</ion-title>
                <ion-buttons slot="end">
                  <ion-button (click)="closeDrillDown()">Close</ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <ion-grid *ngIf="drillDownData">
                <ion-row>
                  <ion-col size="12" size-md="6">
                    <ion-card>
                      <ion-card-header>
                        <ion-card-title>Case Summary</ion-card-title>
                      </ion-card-header>
                      <ion-card-content>
                        <canvas #drillDownChart></canvas>
                      </ion-card-content>
                    </ion-card>
                  </ion-col>
                  <ion-col size="12" size-md="6">
                    <ion-card>
                      <ion-card-header>
                        <ion-card-title>Demographics</ion-card-title>
                      </ion-card-header>
                      <ion-card-content>
                        <canvas #demographicsChart></canvas>
                      </ion-card-content>
                    </ion-card>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-content>
          </ng-template>
        </ion-modal>

        <!-- Date Range Modal -->
        <ion-modal [isOpen]="showDateRangeModal" (didDismiss)="closeDateRangeModal()">
          <ng-template>
            <ion-header>
              <ion-toolbar>
                <ion-title>Select Date Range</ion-title>
                <ion-buttons slot="end">
                  <ion-button (click)="closeDateRangeModal()">Close</ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <ion-datetime
                presentation="date"
                [(ngModel)]="dateRange.start"
                (ionChange)="onDateRangeChange()"
              ></ion-datetime>
              <ion-datetime
                presentation="date"
                [(ngModel)]="dateRange.end"
                (ionChange)="onDateRangeChange()"
              ></ion-datetime>
              <ion-button expand="block" (click)="applyDateRange()">
                Apply Range
              </ion-button>
            </ion-content>
          </ng-template>
        </ion-modal>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    .stat-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .stat-title {
      margin-left: 0.5rem;
      color: var(--ion-color-medium);
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0.5rem 0;
    }

    .stat-trend {
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .up {
      border-left: 4px solid var(--ion-color-success);
    }

    .down {
      border-left: 4px solid var(--ion-color-danger);
    }

    .alert-meta, .activity-meta {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    ion-badge {
      text-transform: capitalize;
    }

    canvas {
      width: 100% !important;
      height: 300px !important;
    }

    .map-container {
      height: 400px;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
    }

    .heat-map-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      background: white;
      padding: 5px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    ion-datetime {
      width: 100%;
      margin-bottom: 1rem;
    }

    ion-timeline {
      padding: 0;
    }

    ion-timeline ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
    }

    ion-progress-bar {
      margin: 0.5rem 0;
    }

    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legend-color {
      width: 1rem;
      height: 1rem;
      border-radius: 2px;
    }

    ion-card {
      margin: 1rem 0;
    }
    ion-card.normal {
      --background: var(--ion-color-success-tint);
    }
    ion-card.warning {
      --background: var(--ion-color-warning-tint);
    }
    ion-card.critical {
      --background: var(--ion-color-danger-tint);
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('casesChart') casesChart!: ElementRef;
  @ViewChild('resourcesChart') resourcesChart!: ElementRef;
  @ViewChild('performanceChart') performanceChartRef!: ElementRef;
  @ViewChild('heatMapContainer') heatMapContainerRef!: ElementRef;
  @ViewChild('drillDownChart') drillDownChartRef!: ElementRef;
  @ViewChild('demographicsChart') demographicsChartRef!: ElementRef;
  @ViewChild('correlationMatrixChart') correlationMatrixChartRef!: ElementRef;
  @ViewChild('timeSeriesChart') timeSeriesChartRef!: ElementRef;
  @ViewChild('demographicPyramidChart') demographicPyramidChartRef!: ElementRef;
  @ViewChild('treatmentEffectivenessChart') treatmentEffectivenessChartRef!: ElementRef;

  metrics: DashboardMetrics = {
    totalCases: 0,
    activeUsers: 0,
    systemHealth: 0,
    responseTime: 0,
    recentAlerts: 0,
    databaseStatus: 'unknown',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0
  };

  quickStats = [
    { label: 'Total Cases', value: '0', status: 'normal', trend: 'up' },
    { label: 'Active Cases', value: '0', status: 'warning', trend: 'down' },
    { label: 'Recovered', value: '0', status: 'normal', trend: 'up' },
    { label: 'Deaths', value: '0', status: 'critical', trend: 'stable' }
  ];

  systemMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      value: 0,
      unit: '%',
      status: 'normal',
      trend: 'stable'
    },
    {
      name: 'Memory Usage',
      value: 0,
      unit: '%',
      status: 'normal',
      trend: 'stable'
    },
    {
      name: 'Disk Space',
      value: 0,
      unit: '%',
      status: 'normal',
      trend: 'stable'
    },
    {
      name: 'Network Traffic',
      value: 0,
      unit: 'MB/s',
      status: 'normal',
      trend: 'stable'
    }
  ];

  recentAlerts: any[] = [];
  caseTrends: CaseTrend[] = [];
  locationData: LocationData[] = [];
  userActivities: UserActivity[] = [];
  private caseTrendsChart: Chart | null = null;
  private performanceChart: Chart | null = null;
  private map: L.Map | null = null;
  private refreshInterval: any;

  quickActions = [
    {
      label: 'Generate Report',
      icon: 'document-text-outline',
      route: '/admin/reports',
      color: 'primary'
    },
    {
      label: 'Manage Users',
      icon: 'people-outline',
      route: '/admin/users',
      color: 'success'
    },
    {
      label: 'View Alerts',
      icon: 'notifications-outline',
      route: '/admin/alerts',
      color: 'warning'
    },
    {
      label: 'System Monitor',
      icon: 'stats-chart-outline',
      route: '/admin/monitor',
      color: 'danger'
    }
  ];

  dateRange: DateRange = {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  };

  showDrillDown = false;
  showDateRangeModal = false;
  selectedLocation = '';
  drillDownData: DrillDownData | null = null;
  private heatMap: any = null;
  private diseaseDistributionChart: Chart | null = null;
  private drillDownChart: Chart | null = null;
  private demographicsChart: Chart | null = null;
  private correlationMatrixChart: Chart | null = null;
  private timeSeriesChart: Chart | null = null;
  private demographicPyramidChart: Chart | null = null;
  private treatmentEffectivenessChart: Chart | null = null;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadDashboardData();
    // Refresh dashboard data every 5 minutes
    this.refreshInterval = setInterval(() => this.loadDashboardData(), 300000);
  }

  ngAfterViewInit() {
    this.initializeMap();
    this.initializeHeatMap();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.caseTrendsChart) {
      this.caseTrendsChart.destroy();
    }
    if (this.performanceChart) {
      this.performanceChart.destroy();
    }
    if (this.map) {
      this.map.remove();
    }
    if (this.diseaseDistributionChart) {
      this.diseaseDistributionChart.destroy();
    }
    if (this.drillDownChart) {
      this.drillDownChart.destroy();
    }
    if (this.demographicsChart) {
      this.demographicsChart.destroy();
    }
    if (this.heatMap) {
      this.heatMap.remove();
    }
    if (this.correlationMatrixChart) {
      this.correlationMatrixChart.destroy();
    }
    if (this.timeSeriesChart) {
      this.timeSeriesChart.destroy();
    }
    if (this.demographicPyramidChart) {
      this.demographicPyramidChart.destroy();
    }
    if (this.treatmentEffectivenessChart) {
      this.treatmentEffectivenessChart.destroy();
    }
  }

  private initializeMap() {
    if (!this.mapContainer?.nativeElement) return;

    this.map = L.map(this.mapContainer.nativeElement).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add markers when location data is available
    this.updateMapMarkers();
  }

  private updateMapMarkers() {
    if (!this.map) return;

    // Clear existing markers
    this.map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        this.map?.removeLayer(layer);
      }
    });

    // Add new markers
    this.locationData.forEach(location => {
      const marker = L.marker([location.lat, location.lng])
        .bindPopup(`
          <strong>${location.location}</strong><br>
          Malaria Cases: ${location.malaria}<br>
          Diabetes Cases: ${location.diabetes}
        `);
      marker.addTo(this.map!);
    });
  }

  async refreshDashboard(event: any) {
    await this.loadDashboardData();
    event.target.complete();
  }

  private async loadDashboardData() {
    try {
      // Load system metrics
      const metrics = await this.supabaseService.getSystemMetrics();
      if (metrics.connectionError) throw metrics.connectionError;

      if (metrics) {
        this.metrics = {
          ...this.metrics,
          totalCases: metrics.queryStats?.totalCases || 0,
          activeUsers: metrics.queryStats?.activeUsers || 0,
          systemHealth: 100 - (metrics.performanceData && metrics.performanceData.length > 0 ? metrics.performanceData[0].error_rate : 0),
          responseTime: metrics.performanceData && metrics.performanceData.length > 0 ? metrics.performanceData[0].response_time : 0,
          cpuUsage: Math.random() * 100, // TODO: Replace with real data
          memoryUsage: Math.random() * 100, // TODO: Replace with real data
          diskUsage: Math.random() * 100, // TODO: Replace with real data
          networkLatency: Math.random() * 100 // TODO: Replace with real data
        };

        // Update quick stats
        this.quickStats[0].value = (metrics.queryStats?.totalCases || 0).toString();
        this.quickStats[1].value = (metrics.queryStats?.activeUsers || 0).toString();
        this.quickStats[2].value = `${Math.round(this.metrics.systemHealth)}%`;
        this.quickStats[3].value = `${(metrics.performanceData && metrics.performanceData.length > 0 ? metrics.performanceData[0].response_time : 0)}ms`;
      }

      // Load recent alerts
      const { data: alerts, error: alertsError } = await this.supabaseService.getSystemAlerts();
      if (alertsError) throw alertsError;

      if (alerts) {
        this.recentAlerts = alerts.slice(0, 5);
        this.metrics.recentAlerts = alerts.length;
      }

      // Load database status
      const { data: dbStatus, error: dbError } = await this.supabaseService.getDatabaseStatus();
      if (dbError) throw dbError;

      if (dbStatus) {
        this.metrics.databaseStatus = dbStatus.connected ? 'healthy' : 'unhealthy';
      }

      // Load case trends
      await this.loadCaseTrends();

      // Load location data
      await this.loadLocationData();

      // Load performance metrics
      await this.loadPerformanceMetrics();

      // Load user activities
      await this.loadUserActivities();

      // Load additional visualizations
      await this.loadAdditionalVisualizations();

      // Update new visualizations
      if (this.map) { // Only update if map is initialized
        this.updateHeatMap();
      }
      this.updateDiseaseDistributionChart();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Additionally, create a system alert for this error
      await this.supabaseService.createAlert({
        title: 'Dashboard Load Error',
        message: `Failed to load dashboard data: ${error}`,
        severity: 'error',
        status: 'active',
        type: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  private async loadLocationData() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // Last 30 days

      const { data: malariaData, error: malariaError } = await this.supabaseService
        .getDiseaseReportData('malaria', { start: startDate, end: endDate });
      if (malariaError) throw malariaError;

      const { data: diabetesData, error: diabetesError } = await this.supabaseService
        .getDiseaseReportData('diabetes', { start: startDate, end: endDate });
      if (diabetesError) throw diabetesError;

      // Process location data
      const locationMap = new Map<string, LocationData>();
      
      malariaData?.forEach(case_ => {
        if (!case_.location) return;
        if (!locationMap.has(case_.location)) {
          locationMap.set(case_.location, {
            location: case_.location,
            malaria: 0,
            diabetes: 0,
            lat: 0, // TODO: Get real coordinates
            lng: 0  // TODO: Get real coordinates
          });
        }
        locationMap.get(case_.location)!.malaria++;
      });

      diabetesData?.forEach(case_ => {
        if (!case_.location) return;
        if (!locationMap.has(case_.location)) {
          locationMap.set(case_.location, {
            location: case_.location,
            malaria: 0,
            diabetes: 0,
            lat: 0, // TODO: Get real coordinates
            lng: 0  // TODO: Get real coordinates
          });
        }
        locationMap.get(case_.location)!.diabetes++;
      });

      this.locationData = Array.from(locationMap.values());
      this.updateMapMarkers();

    } catch (error) {
      console.error('Error loading location data:', error);
    }
  }

  private async loadPerformanceMetrics() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(endDate.getHours() - 1); // Last hour

      const { data: metrics, error } = await this.supabaseService
        .getPerformanceMetrics({ start: startDate, end: endDate });
      if (error) throw error;

      if (metrics) {
        this.updatePerformanceChart(metrics);
      }
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  }

  private updatePerformanceChart(metrics: any[]) {
    const ctx = this.performanceChartRef?.nativeElement;
    if (!ctx) return;

    if (this.performanceChart) {
      this.performanceChart.destroy();
    }

    this.performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: metrics.map(m => new Date(m.timestamp).toLocaleTimeString()),
        datasets: [
          {
            label: 'Response Time (ms)',
            data: metrics.map(m => m.response_time),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          },
          {
            label: 'Error Rate (%)',
            data: metrics.map(m => m.error_rate),
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private async loadUserActivities() {
    try {
      // TODO: Implement real user activity tracking
      this.userActivities = [
        {
          user: 'John Doe',
          action: 'login',
          timestamp: new Date(),
          details: 'Logged in from Chrome on Windows'
        },
        {
          user: 'Jane Smith',
          action: 'report',
          timestamp: new Date(Date.now() - 300000),
          details: 'Submitted malaria case report'
        },
        {
          user: 'Admin User',
          action: 'alert',
          timestamp: new Date(Date.now() - 600000),
          details: 'Created new system alert'
        }
      ];
    } catch (error) {
      console.error('Error loading user activities:', error);
    }
  }

  private async loadCaseTrends() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const { data: malariaData, error: malariaError } = await this.supabaseService
        .getDiseaseReportData('malaria', { start: startDate, end: endDate });
      if (malariaError) throw malariaError;

      const { data: diabetesData, error: diabetesError } = await this.supabaseService
        .getDiseaseReportData('diabetes', { start: startDate, end: endDate });
      if (diabetesError) throw diabetesError;

      // Process and aggregate data by date
      const trends = this.aggregateCaseData(malariaData || [], diabetesData || []);
      this.updateCaseTrendsChart(trends);

    } catch (error) {
      console.error('Error loading case trends:', error);
    }
  }

  private aggregateCaseData(malariaData: any[] | null, diabetesData: any[] | null): CaseTrend[] {
    const trends: { [key: string]: CaseTrend } = {};

    // Initialize trends for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      trends[dateKey] = {
        date: date,
        malaria: 0,
        diabetes: 0
      };
    }

    // Aggregate malaria cases
    malariaData?.forEach(case_ => {
      const dateKey = new Date(case_.case_date).toISOString().split('T')[0];
      if (trends[dateKey]) {
        trends[dateKey].malaria++;
      }
    });

    // Aggregate diabetes cases
    diabetesData?.forEach(case_ => {
      const dateKey = new Date(case_.case_date).toISOString().split('T')[0];
      if (trends[dateKey]) {
        trends[dateKey].diabetes++;
      }
    });

    return Object.values(trends);
  }

  private updateCaseTrendsChart(trends: CaseTrend[]) {
    if (!(this.casesChart?.nativeElement instanceof HTMLCanvasElement)) {
      console.error('Cases chart element is not a canvas');
      return;
    }

    const ctx = this.casesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.caseTrendsChart) {
      this.caseTrendsChart.destroy();
    }

    this.caseTrendsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trends.map(t => t.date.toLocaleDateString()),
        datasets: [
          {
            label: 'Malaria Cases',
            data: trends.map(t => t.malaria),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          },
          {
            label: 'Diabetes Cases',
            data: trends.map(t => t.diabetes),
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  getUsageColor(usage: number): string {
    if (usage >= 90) return 'danger';
    if (usage >= 70) return 'warning';
    return 'success';
  }

  getActivityIcon(action: string): string {
    switch (action) {
      case 'login':
        return 'log-in-outline';
      case 'report':
        return 'document-text-outline';
      case 'alert':
        return 'notifications-outline';
      default:
        return 'information-circle-outline';
    }
  }

  getActivityColor(action: string): string {
    switch (action) {
      case 'login':
        return 'success';
      case 'report':
        return 'primary';
      case 'alert':
        return 'warning';
      default:
        return 'medium';
    }
  }

  getAlertIcon(severity: string): string {
    switch (severity) {
      case 'error':
        return 'alert-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'success':
        return 'checkmark-circle-outline';
      default:
        return 'information-circle-outline';
    }
  }

  getAlertColor(severity: string): string {
    switch (severity) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  }

  private initializeHeatMap() {
    if (!this.heatMapContainerRef?.nativeElement) return;

    const map = L.map(this.heatMapContainerRef.nativeElement).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add heat map layer with proper typing
    this.heatMap = (L as any).heatLayer([], {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: {
        0.4: 'blue',
        0.6: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    // Add click handler for drill-down
    map.on('click', (e) => {
      const location = this.findNearestLocation(e.latlng);
      if (location) {
        this.showLocationDrillDown(location);
      }
    });
  }

  private updateHeatMap() {
    if (!this.heatMap) return;

    const points = this.locationData.map(loc => [
      loc.lat,
      loc.lng,
      loc.malaria + loc.diabetes // intensity based on total cases
    ]);

    this.heatMap.setLatLngs(points);
  }

  private findNearestLocation(latlng: L.LatLng): LocationData | null {
    let nearest: LocationData | null = null;
    let minDistance = Infinity;

    this.locationData.forEach(loc => {
      const distance = L.latLng(loc.lat, loc.lng).distanceTo(latlng);
      if (distance < minDistance && distance < 50000) { // 50km threshold
        minDistance = distance;
        nearest = loc;
      }
    });

    return nearest;
  }

  private async showLocationDrillDown(location: LocationData) {
    this.selectedLocation = location.location;
    this.showDrillDown = true;

    try {
      // Fetch detailed data for the location
      const { data, error } = await this.supabaseService.getLocationDetails(
        location.location,
        this.dateRange.start,
        this.dateRange.end
      );

      if (error) throw error;

      if (data) {
        this.drillDownData = {
          location: location.location,
          cases: {
            malaria: location.malaria,
            diabetes: location.diabetes
          },
          demographics: data.demographics
        };

        this.updateDrillDownCharts();
      }
    } catch (error) {
      console.error('Error loading location details:', error);
    }
  }

  private updateDrillDownCharts() {
    if (!this.drillDownData) return;

    // Update case distribution chart
    const caseCtx = this.drillDownChartRef?.nativeElement;
    if (caseCtx) {
      if (this.drillDownChart) {
        this.drillDownChart.destroy();
      }

      this.drillDownChart = new Chart(caseCtx, {
        type: 'bar',
        data: {
          labels: ['Malaria', 'Diabetes'],
          datasets: [{
            data: [
              this.drillDownData.cases.malaria,
              this.drillDownData.cases.diabetes
            ],
            backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Case Distribution'
            }
          }
        }
      });
    }

    // Update demographics chart
    const demoCtx = this.demographicsChartRef?.nativeElement;
    if (demoCtx) {
      if (this.demographicsChart) {
        this.demographicsChart.destroy();
      }

      const ageGroups = Object.entries(this.drillDownData.demographics.ageGroups);
      this.demographicsChart = new Chart(demoCtx, {
        type: 'pie',
        data: {
          labels: ageGroups.map(([age]) => age),
          datasets: [{
            data: ageGroups.map(([, count]) => count),
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 206, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Age Distribution'
            }
          }
        }
      });
    }
  }

  private updateDiseaseDistributionChart() {
    if (!(this.casesChart?.nativeElement instanceof HTMLCanvasElement)) {
      console.error('Cases chart element is not a canvas');
      return;
    }

    const ctx = this.casesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const totalCases = this.locationData.reduce(
      (sum, loc) => sum + loc.malaria + loc.diabetes,
      0
    );

    const distribution: DiseaseDistribution[] = [
      {
        disease: 'Malaria',
        count: this.locationData.reduce((sum, loc) => sum + loc.malaria, 0),
        percentage: 0
      },
      {
        disease: 'Diabetes',
        count: this.locationData.reduce((sum, loc) => sum + loc.diabetes, 0),
        percentage: 0
      }
    ];

    distribution.forEach(d => {
      d.percentage = (d.count / totalCases) * 100;
    });

    if (this.diseaseDistributionChart) {
      this.diseaseDistributionChart.destroy();
    }

    this.diseaseDistributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: distribution.map(d => d.disease),
        datasets: [{
          data: distribution.map(d => d.count),
          backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const d = distribution[context.dataIndex];
                return `${d.disease}: ${d.count} (${d.percentage.toFixed(1)}%)`;
              }
            }
          }
        }
      }
    });
  }

  async exportDashboardData() {
    try {
      const data = {
        metrics: this.metrics,
        caseTrends: this.caseTrends,
        locationData: this.locationData,
        dateRange: this.dateRange
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${formatDate(new Date(), 'yyyy-MM-dd', 'en-US')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting dashboard data:', error);
    }
  }

  formatDateRange(range: DateRange): string {
    return `${formatDate(range.start, 'MMM d, y', 'en-US')} - ${formatDate(range.end, 'MMM d, y', 'en-US')}`;
  }

  openDateRangeModal() {
    this.showDateRangeModal = true;
  }

  closeDateRangeModal() {
    this.showDateRangeModal = false;
  }

  closeDrillDown() {
    this.showDrillDown = false;
    this.drillDownData = null;
  }

  onDateRangeChange() {
    // Optional: Add validation or preview updates here
  }

  async applyDateRange() {
    await this.loadDashboardData();
    this.closeDateRangeModal();
  }

  private async loadAdditionalVisualizations() {
    try {
      // Load correlation data
      const { data: correlationData, error: correlationError } = await this.supabaseService
        .getCorrelationData(this.dateRange.start, this.dateRange.end);
      if (correlationError) throw correlationError;

      if (correlationData) {
        this.updateCorrelationMatrix(correlationData);
      }

      // Load time series data
      const { data: timeSeriesData, error: timeSeriesError } = await this.supabaseService
        .getTimeSeriesData(this.dateRange.start, this.dateRange.end);
      if (timeSeriesError) throw timeSeriesError;

      if (timeSeriesData) {
        this.updateTimeSeriesChart(timeSeriesData);
      }

      // Load demographic data
      const { data: demographicData, error: demographicError } = await this.supabaseService
        .getDemographicPyramid(this.dateRange.start, this.dateRange.end);
      if (demographicError) throw demographicError;

      if (demographicData) {
        this.updateDemographicPyramid(demographicData);
      }

      // Load treatment effectiveness data
      const { data: treatmentData, error: treatmentError } = await this.supabaseService
        .getTreatmentEffectiveness(this.dateRange.start, this.dateRange.end);
      if (treatmentError) throw treatmentError;

      if (treatmentData) {
        this.updateTreatmentEffectivenessChart(treatmentData);
      }

    } catch (error) {
      console.error('Error loading additional visualizations:', error);
    }
  }

  private updateCorrelationMatrix(data: CorrelationData[]) {
    const ctx = this.correlationMatrixChartRef?.nativeElement;
    if (!ctx) return;

    if (this.correlationMatrixChart) {
      this.correlationMatrixChart.destroy();
    }

    // Create correlation matrix
    const factors = [...new Set(data.map(d => [d.factor1, d.factor2]).flat())];
    const matrix = factors.map(f1 => 
      factors.map(f2 => {
        const correlation = data.find(d => 
          (d.factor1 === f1 && d.factor2 === f2) || 
          (d.factor1 === f2 && d.factor2 === f1)
        );
        return correlation?.correlation || 0;
      })
    );

    this.correlationMatrixChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        labels: factors,
        datasets: [{
          data: matrix.map((value, index) => ({
            x: typeof value === 'number' ? value : parseFloat(String(value)),
            y: typeof value === 'number' ? value : parseFloat(String(value)),
            value: value
          })),
          backgroundColor: (context: any) => {
            const value = context.raw.value;
            const alpha = Math.abs(value);
            return value >= 0 
              ? `rgba(54, 162, 235, ${alpha})`
              : `rgba(255, 99, 132, ${alpha})`;
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const value = context.raw.value;
                return `Correlation: ${value.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            labels: factors,
            offset: true,
            grid: { drawOnChartArea: false }
          },
          y: {
            type: 'category',
            labels: factors,
            offset: true,
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  private updateTimeSeriesChart(data: TimeSeriesData[]) {
    const ctx = this.timeSeriesChartRef?.nativeElement;
    if (!ctx) return;

    if (this.timeSeriesChart) {
      this.timeSeriesChart.destroy();
    }

    this.timeSeriesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date.toLocaleDateString()),
        datasets: [
          {
            label: 'Trend',
            data: data.map(d => d.trend),
            borderColor: 'rgb(75, 192, 192)',
            borderDash: [5, 5],
            fill: false
          },
          {
            label: 'Seasonal',
            data: data.map(d => d.seasonal),
            borderColor: 'rgb(255, 159, 64)',
            fill: false
          },
          {
            label: 'Residual',
            data: data.map(d => d.residual),
            borderColor: 'rgb(153, 102, 255)',
            fill: false
          },
          {
            label: 'Actual',
            data: data.map(d => d.actual),
            borderColor: 'rgb(54, 162, 235)',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: 'Time Series Decomposition'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private updateDemographicPyramid(data: DemographicPyramid[]) {
    const ctx = this.demographicPyramidChartRef?.nativeElement;
    if (!ctx) return;

    if (this.demographicPyramidChart) {
      this.demographicPyramidChart.destroy();
    }

    this.demographicPyramidChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ageGroup),
        datasets: [
          {
            label: 'Male',
            data: data.map(d => -d.male), // Negative for left side
            backgroundColor: 'rgb(54, 162, 235)'
          },
          {
            label: 'Female',
            data: data.map(d => d.female), // Positive for right side
            backgroundColor: 'rgb(255, 99, 132)'
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Age-Gender Distribution'
          }
        },
        scales: {
          x: {
            stacked: false,
            ticks: {
              callback: (value) => Math.abs(value as number)
            }
          },
          y: {
            stacked: false
          }
        }
      }
    });
  }

  private updateTreatmentEffectivenessChart(data: TreatmentEffectiveness[]) {
    const ctx = this.treatmentEffectivenessChartRef?.nativeElement;
    if (!ctx) return;

    if (this.treatmentEffectivenessChart) {
      this.treatmentEffectivenessChart.destroy();
    }

    this.treatmentEffectivenessChart = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: data.map(treatment => ({
          label: treatment.treatment,
          data: [{
            x: treatment.successRate,
            y: treatment.recoveryTime,
            r: treatment.cost / 100 // Scale bubble size
          }],
          backgroundColor: this.getRandomColor()
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Treatment Effectiveness Analysis'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const treatment = data[context.datasetIndex];
                return [
                  `Treatment: ${treatment.treatment}`,
                  `Success Rate: ${(treatment.successRate * 100).toFixed(1)}%`,
                  `Recovery Time: ${treatment.recoveryTime} days`,
                  `Cost: $${treatment.cost}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Success Rate'
            },
            min: 0,
            max: 1
          },
          y: {
            title: {
              display: true,
              text: 'Recovery Time (days)'
            },
            min: 0
          }
        }
      }
    });
  }

  private getRandomColor(): string {
    const colors = [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 206, 86)',
      'rgb(75, 192, 192)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  async createAlert(title: string, message: string, severity: 'error' | 'warning' | 'success' | 'info') {
    const alert: Omit<SystemAlert, 'id'> = {
      title,
      message,
      type: 'system',
      severity,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { error } = await this.supabaseService.createAlert(alert);
    if (error) {
      console.error('Error creating alert:', error);
    } else {
      console.log('Alert created successfully');
      this.loadDashboardData(); // Reload alerts
    }
  }

  async createMetricAlert(metric: SystemMetric) {
    const alert: Omit<SystemAlert, 'id'> = {
      title: `${metric.name} Alert`,
      message: `${metric.name} is ${metric.status} (${metric.value}${metric.unit})`,
      type: 'system',
      severity: metric.status === 'critical' ? 'error' : 'warning',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { error } = await this.supabaseService.createAlert(alert);
    if (error) {
      console.error('Error creating alert:', error);
    }
  }

  async updateAlert(id: number, updates: { status: 'active' | 'resolved' | 'acknowledged' }) {
    const { error } = await this.supabaseService.updateAlert(id, updates);
    if (error) {
      console.error('Error updating alert:', error);
    } else {
      console.log('Alert updated successfully');
      this.loadDashboardData(); // Reload alerts
    }
  }

  async deleteAlert(id: number) {
    const { error } = await this.supabaseService.deleteAlert(id);
    if (error) {
      console.error('Error deleting alert:', error);
    } else {
      console.log('Alert deleted successfully');
      this.loadDashboardData(); // Reload alerts
    }
  }

  private createScatterPlot(data: any[], container: HTMLElement) {
    if (!(container instanceof HTMLCanvasElement)) {
      console.error('Container is not a canvas element');
      return;
    }

    const ctx = container.getContext('2d');
    if (!ctx) return;

    const chartData: ChartData<'scatter'> = {
      datasets: [{
        label: 'Disease Spread',
        data: data.map(point => ({
          x: typeof point.x === 'number' ? point.x : parseFloat(point.x),
          y: typeof point.y === 'number' ? point.y : parseFloat(point.y)
        })),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    };

    const config: ChartConfiguration<'scatter'> = {
      type: 'scatter',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            type: 'linear'
          }
        }
      }
    };

    new Chart(ctx, config);
  }
} 