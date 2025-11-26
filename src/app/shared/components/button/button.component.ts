import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  // Text displayed on the button
  @Input() text: string = '';

  // Flag to disable the button and prevent click events
  @Input() isDisabled: boolean = false;

  // Event emitted when the button is clicked
  @Output() buttonSubmitted = new EventEmitter();

  // Handle button click and emit the event
  onButtonClick() {
    this.buttonSubmitted.emit();
  }
}
