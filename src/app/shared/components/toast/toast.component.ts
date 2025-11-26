import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast/toast.service';
import { Toast } from '../../../models/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  // Inject the toast service to subscribe to toast notifications
  private toastService = inject(ToastService);

  // Array to store active toast notifications
  public toasts: Toast[] = [];

  ngOnInit() {
    // Subscribe to the toast observable and add new toasts to the array
    this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
    });
  }

  // Remove a toast from the array by its ID
  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
