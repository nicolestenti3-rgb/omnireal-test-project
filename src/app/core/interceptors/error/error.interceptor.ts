import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, retry, timer } from 'rxjs';
import { ToastService } from '../../services/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    // Retry failed requests up to 2 times for transient errors.
    // The delay increases with each retry attempt using a timer.
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount) => {
        // If network error (status 0) or server error (>=500) -> retry.
        if (error.status === 0 || error.status >= 500) {
          // delay grows with retryCount (in milliseconds)
          return timer(retryCount * 1000);
        }
        // For client errors (4xx) don't retry — rethrow to be handled downstream.
        throw error;
      }
    }),
    // Catch any error that escapes retry and show a toast with a friendly message.
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error: provide a concise connection message.
        errorMessage = `Connection error: ${error.error.message}`;
      } else {
         // Server-side error: build a contextual message based on the request URL.
        errorMessage = getServerErrorMessage(error);
      }

      // Notify the user via toast service.
      toastService.error(errorMessage);

      // Rethrow a normalized Error to keep observable error contract consistent.
      return throwError(() => new Error(errorMessage));
    })
  );
};

function getServerErrorMessage(error: HttpErrorResponse): string {
  const url = error.url || '';

  // Provide service-specific messages to make errors clearer for the user.
  if (url.includes('nominatim.openstreetmap.org')) {
    // Error related to geocoding/address lookup service.
    return `Error during address lookup (${error})`;
  }

  if (url.includes('open-meteo.com')) {
    // Error related to weather data service.
    return `Error retrieving weather data (${error})`;
  }

  // Fallback generic message including HTTP status and message.
  return `Error ${error.status}: ${error.message}`;
}
