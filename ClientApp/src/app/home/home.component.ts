import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  city: string = '';
  weatherData: any;

  constructor(private weatherService: WeatherService) { }
  getWeather() {
    if (this.city.trim()) {
      this.weatherService.getWeatherByCity(this.city).subscribe(
        data => {
          this.weatherData = data;
          data.main.temp = data.main.temp - 273.15;
          data.main.temp = Math.round(data.main.temp)
          console.log(this.weatherData);
        },
        error => {
          console.error('Error fetching weather data:', error);
        }
      );
    }
  }
}