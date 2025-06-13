import { ErrorHandler, Injectable } from '@angular/core';
import { ErrorReportingService } from '../services/error-reporting.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private errorReportingService: ErrorReportingService) {}

  handleError(error: Error): void {
    // Log error in development
    if (!environment.production) {
      console.error('An error occurred:', error);
    }

    // Report error to monitoring service
    this.errorReportingService.captureError(error);

    // You could also show a user-friendly error message here
    // For example, using a toast notification service
  }
} 