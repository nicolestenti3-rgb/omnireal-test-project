import { Component, EventEmitter, Output } from '@angular/core';
import { InputComponent } from "../../../../shared/components/input/input.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { GeocodingService } from '../../../../core/services/geocoding/geocoding.service';
import { Coordinates } from '../../../../models/address-search';
import { ToastService } from '../../../../core/services/toast/toast.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [InputComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent {
  constructor(private fb: FormBuilder, private geocodingService: GeocodingService, private toastService: ToastService) {
    // Initialize the reactive form with required validators for all fields
    this.addressFormGroup = this.fb.group({
      address: [null, Validators.required],
      addressNumber: [null, Validators.required],
      postalCode: [null, Validators.required],
      city: [null, Validators.required],
      country: [null, Validators.required]
    })
  }

  // Emit event when coordinates are successfully found
  @Output() coordinatesFound = new EventEmitter<{ latitude: number, longitude: number, fullAddress: string }>();

  // Reactive form group for address input fields
  public addressFormGroup!: FormGroup;

  // Emit the coordinates to the parent component
  handleCoordinates(coordinates: Coordinates, fullAddress: string): void {
    const addressData = {
      latitude: coordinates.lat,
      longitude: coordinates.lon,
      fullAddress: fullAddress
    };

    this.coordinatesFound.emit(addressData);
  }

  // Combine all form fields into a single address string
  createFullAddress(): string {
    const formValues = this.addressFormGroup.value;

    // Filter out empty values and join with commas
    const parts = [
      formValues.address,
      formValues.addressNumber,
      formValues.postalCode,
      formValues.city,
      formValues.country
    ].filter(part => part && part.trim());

    return parts.join(', ');
  }

  // Handle form submission: validate and geocode the address
  handleSubmitForm() {
    // Validation check: only proceed if all fields are filled
    if (this.addressFormGroup.invalid) return;

    const fullAddress = this.createFullAddress();

    // Call geocoding service to convert address to coordinates
    this.geocodingService.getCoordinates(fullAddress).subscribe({
      next: (coordinates: Coordinates | null) => {

        if (coordinates) {
          // Address found - emit event to parent component
          this.handleCoordinates(coordinates, fullAddress);
        } else {
          // Address not found - show error toast
          this.toastService.error('Address not found. Please check the entered data');
        }
      },
      error: (error) => {
        // Geocoding service error - show error toast with retry suggestion
+        this.toastService.error(`Error: ${error}. Try agian later`);
      }
    });
  }
}
