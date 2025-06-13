import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'disease' | 'safety' | 'user' | 'system';
  format: 'pdf' | 'excel' | 'csv';
}

interface ReportGenerationRequest {
  templateId: string;
  startDate: string;
  endDate: string;
}

interface ReportGenerationResponse {
  success: boolean;
  message: string;
  reportUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = environment.apiUrl; // Assuming you have an API_URL in your environment

  private mockReportTemplates: ReportTemplate[] = [
    {
      id: 'disease_summary',
      name: 'Disease Summary Report',
      description: 'Summary of disease cases by type and location',
      type: 'disease',
      format: 'pdf'
    },
    {
      id: 'safety_compliance',
      name: 'Safety Compliance Report',
      description: 'Safety measures compliance by location',
      type: 'safety',
      format: 'excel'
    },
    {
      id: 'user_activity',
      name: 'User Activity Report',
      description: 'User login and activity summary',
      type: 'user',
      format: 'csv'
    },
    {
      id: 'system_health',
      name: 'System Health Report',
      description: 'System performance and usage metrics',
      type: 'system',
      format: 'pdf'
    }
  ];

  constructor(private http: HttpClient) { }

  generateReport(request: ReportGenerationRequest): Observable<ReportGenerationResponse> {
    console.log('ReportService: Sending report generation request to backend', request);
    // In a real application, you would make an HTTP POST request here:
    // return this.http.post<ReportGenerationResponse>(`${this.apiUrl}/reports/generate`, request);

    // Simulating a backend API call
    return of({
      success: true,
      message: `Report for ${request.templateId} generated successfully.`,
      reportUrl: `assets/sample_report_${request.templateId}.pdf` // Placeholder URL
    }).pipe(delay(2000), tap(() => console.log('ReportService: Report generation simulation complete')));
  }

  getReportTemplates(): Observable<ReportTemplate[]> {
    console.log('ReportService: Fetching report templates from backend');
    // In a real application, you would make an HTTP GET request here:
    // return this.http.get<ReportTemplate[]>(`${this.apiUrl}/reports/templates`);

    // Simulating a backend API call
    return of(this.mockReportTemplates).pipe(delay(500), tap(() => console.log('ReportService: Report templates fetched successfully')));
  }

  // You might also have methods for:
  // createCustomReport(customReportData: any): Observable<any> { ... }
} 