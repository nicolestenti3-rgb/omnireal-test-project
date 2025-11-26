import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../../services/loading/loading.service';

// HTTP interceptor that shows a loading indicator for all HTTP requests
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Inject the loading service to control the loading state
  const loadingService = inject(LoadingService);
  
  // Display the loading indicator when the request starts
  loadingService.show();
  
  return next(req).pipe(
    // finalize() ensures the loading indicator is hidden whether the request succeeds or fails
    finalize(() => {
      loadingService.hide();
    })
  );
};