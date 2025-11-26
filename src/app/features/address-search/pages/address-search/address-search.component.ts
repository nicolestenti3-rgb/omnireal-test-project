import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormComponent } from "../../components/form/form.component";
import { MapComponent } from '../../components/map/map.component';
import { Coordinates } from '../../../../models/address-search';
import { WeatherService } from '../../../../core/services/weather/weather.service';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../core/services/toast/toast.service';

@Component({
  selector: 'app-address-search',
  imports: [FormComponent, MapComponent, ButtonComponent, HighchartsChartComponent, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './address-search.component.html',
  styleUrl: './address-search.component.scss'
})
export class AddressSearchComponent {
  constructor(public weatherService: WeatherService, private toastService: ToastService) { }
  
   // Geographic coordinates of the searched address
  public latitude: number | null = null;
  public longitude: number | null = null;

  // Full address string of the searched location
  public address: string = '';

  // Chart configuration options for daily weather data
  public chartOptionsDaily: Highcharts.Options = {};

  // Chart configuration options for hourly weather data
  public chartOptionsHourly: Highcharts.Options = {};

  // Highcharts library reference for use in templates
  public Highcharts: typeof Highcharts = Highcharts;

  // Raw weather data received from the API
  public weatherData: any = null;

  handleCoordinates(event: { latitude: number, longitude: number, fullAddress: string }) {
    this.latitude = event.latitude;
    this.longitude = event.longitude;
    this.address = event.fullAddress;

    // Calculate the date range: last 7 days (excluding today)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    const endDateString = endDate.toISOString().split('T')[0];

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 7);
    const startDateString = startDate.toISOString().split('T')[0];

    // Fetch historical weather data from the weather service
    this.fetchWeatherData(event.latitude, event.longitude, startDateString, endDateString);
  }

  fetchWeatherData(latitude: number, longitude: number, startDate: string, endDate: string) {
    // Reset weather data while loading
    this.weatherData = null;

    const coords = { lat: latitude, lon: longitude } as Coordinates;
    const date = { startDate: startDate, endDate: endDate };

    this.weatherService.getHistoricalWeather(coords, date).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.initializeCharts();
      },
      error: (err: Error) => {
        this.weatherData = null;

        // Show error toast message to the user
+       this.toastService.error(`Error: ${err}. Try again`);
      }
    });
  }

  // Initialize daily and hourly charts based on weather data
  initializeCharts(): void {
    if (!this.weatherData) return;

    const dailyData = this.prepareDailyData(this.weatherData.daily);
    const hourlyData = this.prepareHourlyData(this.weatherData.hourly);

    this.chartOptionsDaily = this.createDailyChartOptions(dailyData);
    this.chartOptionsHourly = this.createHourlyChartOptions(hourlyData);
  }

  // Convert time strings and values into Highcharts-compatible [timestamp, value] pairs
  mapToHighchartsSeries(times: string[], values: number[]): [number, number][] {
    return times.map((timeStr, index) => {
      const timestamp = Date.parse(timeStr);
      return [timestamp, values[index]];
    });
  }

  // Prepare daily temperature and precipitation data for charting
  prepareDailyData(daily: any): any {
    const times = daily.time;

    // Build temperature range data: [timestamp, minTemp, maxTemp]
    const tempRange = times.map((timeStr: string, index: number) => {
      const timestamp = Date.parse(timeStr);
      const min = daily.temperature_2m_min[index];
      const max = daily.temperature_2m_max[index];
      return [timestamp, min, max];
    });

    // Convert precipitation data to Highcharts format
    const precipitation = this.mapToHighchartsSeries(times, daily.precipitation_sum);

    return { tempRange, precipitation };
  }

  // Prepare hourly weather data, optionally filtered to a specific day
  prepareHourlyData(hourly: any): any {
    let times = hourly.time;
    let temp = hourly.temperature_2m;
    let humidity = hourly.relative_humidity_2m;
    let wind = hourly.wind_speed_10m;

    return {
      temp: this.mapToHighchartsSeries(times, temp),
      humidity: this.mapToHighchartsSeries(times, humidity),
      wind: this.mapToHighchartsSeries(times, wind)
    };
  }

  // Create Highcharts configuration for daily weather trends (temperature and rain)
  createDailyChartOptions(data: any): Highcharts.Options {
    // Extract min and max temperature series from the temperature range data
    const tempMin = data.tempRange.map((point: [number, number, number]) => [point[0], point[1]]);
    const tempMax = data.tempRange.map((point: [number, number, number]) => [point[0], point[2]]);

    return {
      accessibility: { enabled: false },
      chart: { type: 'line' },
      title: { text: 'Weekly Trend: Temperature and Rain' },
      xAxis: { type: 'datetime' },
      yAxis: [
        { title: { text: 'Temperature (°C)' } },
        { title: { text: 'Rain (mm)' }, opposite: true }
      ],
      plotOptions: {
        series: {
          cursor: 'pointer',
        }
      },
      series: [
        {
          type: 'line',
          name: 'Min. Temp.',
          data: tempMin,
          tooltip: { valueSuffix: ' °C' },
          marker: { enabled: true }
        },
        {
          type: 'line',
          name: 'Max. Temp.',
          data: tempMax,
          tooltip: { valueSuffix: ' °C' },
          marker: { enabled: true }
        },
        {
          type: 'column',
          name: 'Tot. Rain',
          data: data.precipitation,
          yAxis: 1,
          tooltip: { valueSuffix: ' mm' },
        }
      ]
    };
  }

  // Create Highcharts configuration for hourly weather details (temperature, humidity, wind)
  createHourlyChartOptions(data: any): Highcharts.Options {
    return {
      accessibility: { enabled: false },
      chart: { zoomType: 'x' } as any,
      title: { text: 'Full Weekly Schedule Detail' },
      xAxis: { type: 'datetime' },
      yAxis: [
        { title: { text: 'Temp. (°C) / Humidity (%)' } },
        { title: { text: 'Wind (km/h)' }, opposite: true }
      ],
      series: [
        {
          type: 'line',
          name: 'Hourly Temp.',
          data: data.temp
        },
        {
          type: 'line',
          name: 'Relative Humidity',
          data: data.humidity
        },
        {
          type: 'line',
          name: 'Wind Speed',
          data: data.wind,
        }
      ]
    };
  }

  // Download the current weather data as a JSON file
  downloadWeatherData(): void {
    if (!this.weatherData) return;

    // Prepare data object with location info and weather data
    const dataToExport = {
      location: {
        address: this.address,
        latitude: this.latitude,
        longitude: this.longitude
      },
      weatherData: this.weatherData,
      exportDate: new Date().toISOString()
    };

    // Convert data to JSON string with pretty formatting
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-data-${this.formatFileName(this.address)}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up the temporary link and object URL
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Format address string into a valid filename (lowercase, no special chars, max 50 chars)
  formatFileName(address: string): string {
    return address
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) || 'location';
  }

  // Retry fetching weather data for the current location
  retry(): void {
    // Recalculate the date range and fetch data again
    if (this.latitude && this.longitude) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      const endDateString = endDate.toISOString().split('T')[0];

      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 7);
      const startDateString = startDate.toISOString().split('T')[0];

      this.fetchWeatherData(this.latitude, this.longitude, startDateString, endDateString);
    }
  }
}