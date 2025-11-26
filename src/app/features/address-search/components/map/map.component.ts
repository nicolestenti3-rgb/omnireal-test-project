import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  // Latitude coordinate of the location to display on the map
  @Input() latitude: number | null = null;

  // Longitude coordinate of the location to display on the map
  @Input() longitude: number | null = null;

  // Address string to display in the marker popup
  @Input() address: string = '';

  // Reference to the DOM element where the map will be rendered
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;

  // Leaflet map instance
  public map: L.Map | null = null;

  // Leaflet marker instance
  public marker: L.Marker | null = null;

  // Flag to track if the map has been initialized
  public isMapInitialized = false;

  // Initialize the map after the component view is initialized
  ngAfterViewInit(): void {
    if (this.latitude && this.longitude) {
      this.initMap();
    }
  }

  // Handle input property changes (latitude, longitude, address)
  ngOnChanges(changes: SimpleChanges): void {
    const latChange = changes['latitude'];
    const lonChange = changes['longitude'];

    // Check if coordinates have changed and are valid
    if ((latChange || lonChange) && this.latitude && this.longitude) {

      // Initialize the map on first coordinate update or update existing map
      if (!this.isMapInitialized) {
        // Use setTimeout to wait for Angular's next rendering cycle
        // ensuring the DOM element is fully available
        setTimeout(() => {
          this.initMap();
        }, 0);
      } else {
        // Map already exists, just update the position
        this.updateMapPosition();
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up the map when the component is destroyed
    if (this.map) {
      this.map.remove();
    }
  }

  // Create and add a marker with popup to the map
  addMarker(): void {
    // Create a custom red marker icon
    const customIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add marker to the map at the specified coordinates
    this.marker = L.marker([this.latitude!, this.longitude!], {
      icon: customIcon
    }).addTo(this.map!);

    // Bind a popup with the address text to the marker
    if (this.address) {
      this.marker.bindPopup(`<b>Indirizzo trovato:</b><br>${this.address}`).openPopup();
    }
  }

  // Initialize the Leaflet map with OpenStreetMap tiles and marker
  initMap(): void {
    if (!this.latitude || !this.longitude || this.isMapInitialized) return;

    try {
      // Create the map centered on the provided coordinates with zoom level 15
      this.map = L.map('map').setView(
        [this.latitude, this.longitude],
        15
      );

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Add marker and popup to the map
      this.addMarker();

      // Mark the map as initialized
      this.isMapInitialized = true;

      // Trigger map resize to render correctly
      this.map.invalidateSize();

    } catch (error) {
      console.error('Errore nell\'inizializzazione della mappa:', error);
    }
  }

  // Update the map view to show new coordinates and update the marker
  updateMapPosition(): void {
    if (!this.map || !this.latitude || !this.longitude) return;

    // Pan the map to the new coordinates
    const newLatLng = L.latLng(this.latitude, this.longitude);
    this.map.setView(newLatLng, 15);

    // Remove the old marker
    if (this.marker) {
      this.marker.remove();
    }

    // Add a new marker at the updated location
    this.addMarker();
  }
}
