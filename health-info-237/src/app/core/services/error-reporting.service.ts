import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ErrorReport {
  message: string;
  stack?: string;
  url?: string;
  status?: number;
  timestamp: Date;
  userAgent?: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorReportingService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {}

  async reportError(error: ErrorReport): Promise<void> {
    if (!environment.monitoring?.enabled) {
      return;
    }

    let retryCount = 0;
    while (retryCount < this.maxRetries) {
      try {
        const response = await fetch(environment.monitoring.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...error,
            environment: environment.production ? 'production' : 'development',
            version: '1.0.0' // TODO: Get from package.json
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to report error: ${response.statusText}`);
        }

        return;
      } catch (err) {
        retryCount++;
        if (retryCount === this.maxRetries) {
          console.error('Failed to report error after multiple retries:', err);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * retryCount));
      }
    }
  }

  captureError(error: Error, context?: any): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      ...context
    };

    this.reportError(errorReport).catch(err => {
      console.error('Error reporting failed:', err);
    });
  }
} 