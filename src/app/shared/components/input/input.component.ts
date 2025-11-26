import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  // Input properties to configure the input field
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() inputId: string = '';
  @Input() type: string = 'text';

  // Current value of the input field
  public value: string = '';

  // Flag to track if the input is disabled
  public isDisabled: boolean = false;

  // Callback function triggered when the input value changes
  onChange: (value: any) => void = () => {};

  // Callback function triggered when the input loses focus
  onTouched: () => void = () => {};

  // Write a value from the form control to the input component
  writeValue(value: any): void {
    this.value = value || '';
  }

  // Register callback function to be called when the input value changes
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Register callback function to be called when the input loses focus
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Update the disabled state of the input component
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // Handle input change event and notify the form control
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  // Handle blur event to mark the input as touched
  onBlur(): void {
    this.onTouched();
  }
}