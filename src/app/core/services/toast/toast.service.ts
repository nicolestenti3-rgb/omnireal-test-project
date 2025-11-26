import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast } from '../../../models/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Subject to emit toast notifications to subscribers
  public toastSubject = new Subject<Toast>();
  public toast$ = this.toastSubject.asObservable();

  // Auto-increment counter to generate unique IDs for each toast
  public idCounter = 0;

  // Generic method to show a toast with customizable type and auto-dismiss duration
  show(message: string, type: Toast['type'] = 'info', duration: number = 5000) {
    const toast: Toast = {
      id: this.idCounter++,
      message,
      type,
      duration // Set to 0 for persistent toasts that require manual dismissal
    };
    this.toastSubject.next(toast);
  }

  // Convenience methods for specific toast types
  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }
}