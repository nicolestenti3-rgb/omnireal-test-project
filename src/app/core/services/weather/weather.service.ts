import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Coordinates, RangeDate } from '../../../models/address-search';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor(private http: HttpClient) { }

  // Open-Meteo historical weather API endpoint
  private readonly API_URL = 'https://archive-api.open-meteo.com/v1/archive';

  // Fetch historical weather data for a given location and date range
  getHistoricalWeather(coordinates: Coordinates, date: RangeDate): Observable<any> {    
    const params: any = {
      latitude: coordinates.lat.toString(),
      longitude: coordinates.lon.toString(),
      start_date: date.startDate, 
      end_date: date.endDate,
      // Daily metrics: weather condition code, max/min temperatures, and precipitation
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
      // Hourly metrics: temperature, humidity, and wind speed
      hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
      // Set timezone to Rome for consistent time representation
      timezone: 'Europe/Rome'
    };
    
    return this.http.get(this.API_URL, { params });
  }
}