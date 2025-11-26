// core/services/loading/loading.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // BehaviorSubject to track loading state (emits current state immediately to new subscribers)
  public loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  // Counter to handle multiple concurrent HTTP requests
  // Loading spinner shows only when count > 0, ensuring all requests complete before hiding
  public requestCount = 0;

  // Increment counter and show loading indicator
  show(): void {
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  // Decrement counter and hide loading indicator only when all requests are done
  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next(false);
    }
  }

  // Emergency reset method to clear loading state (useful for cleanup or error scenarios)
  reset(): void {
    this.requestCount = 0;
    this.loadingSubject.next(false);
  }
}