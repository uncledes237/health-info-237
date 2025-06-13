import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ErrorReportingService } from '../services/error-reporting.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private errorReportingService: ErrorReportingService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 401:
              errorMessage = 'Unauthorized access. Please login again.';
              this.router.navigate(['/auth/login']);
              break;
            case 403:
              errorMessage = 'Access forbidden. You do not have permission to access this resource.';
              break;
            case 404:
              errorMessage = 'Resource not found.';
              break;
            case 500:
              errorMessage = 'Internal server error. Please try again later.';
              break;
            default:
              errorMessage = error.error?.message || 'An unexpected error occurred.';
          }
        }

        // Log error in development
        if (!environment.production) {
          console.error('Error details:', {
            message: errorMessage,
            status: error.status,
            url: request.url,
            method: request.method
          });
        }

        // Report error to monitoring service
        this.errorReportingService.captureError(error, {
          url: request.url,
          method: request.method,
          status: error.status
        });

        return throwError(() => new Error(errorMessage));
      })
    );
  }
} 