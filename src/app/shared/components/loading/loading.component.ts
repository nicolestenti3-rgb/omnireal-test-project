import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  // Inject the loading service to access the loading state observable
  loadingService = inject(LoadingService);
}
