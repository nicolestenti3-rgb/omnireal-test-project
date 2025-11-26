import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Coordinates } from '../../../models/address-search';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  constructor(private http: HttpClient) { }

  // OpenStreetMap Nominatim API endpoint for address-to-coordinates conversion
  private readonly API_URL = 'https://nominatim.openstreetmap.org/search';

  // Convert an address string to geographic coordinates (latitude/longitude)
  // Returns null if no matching address is found
  getCoordinates(indirizzo: string): Observable<Coordinates | null> {
    const params = {
      q: indirizzo, // Address query string
      format: 'json', // Request JSON response format
      limit: '1' // Return only the best match to reduce noise
    };

    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      // Transform API response: extract lat/lon from first result or return null
      map(results => {
        if (results && results.length > 0) {
          return {
            lat: parseFloat(results[0].lat),
            lon: parseFloat(results[0].lon),
            display_name: results[0].display_name
          };
        }
        return null;
      })
    );
  }
}