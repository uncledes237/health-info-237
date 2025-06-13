import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard, HealthOfficialGuard } from './core/guards/auth.guard';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { ReportCaseComponent } from './features/dashboard/report-case/report-case.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    // Temporarily removed AuthGuard for development
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./features/dashboard/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'infectious-disease',
        loadComponent: () => import('./features/dashboard/infectious-disease/infectious-disease.component').then(m => m.InfectiousDiseaseComponent)
      },
      {
        path: 'chronic-disease',
        loadComponent: () => import('./features/dashboard/chronic-disease/chronic-disease.component').then(m => m.ChronicDiseaseComponent)
      },
      {
        path: 'safety-measures',
        loadComponent: () => import('./features/dashboard/safety-measures/safety-measures.component').then(m => m.SafetyMeasuresComponent)
      },
      {
        path: 'report-case',
        component: ReportCaseComponent
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/dashboard/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    // Temporarily removed AdminGuard for development
    // canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'data-upload',
        pathMatch: 'full'
      },
      {
        path: 'data-upload',
        loadComponent: () => import('./features/admin/data-upload/data-upload.component').then(m => m.DataUploadComponent)
      },
      {
        path: 'user-management',
        loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'report-generation',
        loadComponent: () => import('./features/admin/report-generation/report-generation.component').then(m => m.ReportGenerationComponent)
      },
      {
        path: 'system-monitoring',
        loadComponent: () => import('./features/admin/system-monitoring/system-monitoring.component').then(m => m.SystemMonitoringComponent)
      },
      {
        path: 'alerts',
        loadComponent: () => import('./features/admin/alerts/alerts.component').then(m => m.AlertsComponent)
      },
      {
        path: '**',
        redirectTo: 'data-upload'
      }
    ]
  },
  {
    path: 'not-found',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: 'auth/reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'auth/signup',
    component: SignupComponent
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
