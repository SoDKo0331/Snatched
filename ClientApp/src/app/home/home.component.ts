import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { AuthService } from '../counter/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  city: string = '';
  weatherData: any;
  
  readonly APIUrl = 'https://localhost:7252/WeatherForecast';

  constructor(private weatherService: WeatherService,
      private http: HttpClient,
        private formBuilder: FormBuilder,
        private toaster: ToastService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
  ) { }

  public loginForm!: FormGroup;
  public infoForm!: FormGroup;
  
   ngOnInit() {
      this.http.get<items[]>(`${this.APIUrl}/info`)
      .subscribe({
        next: (value) => {
          console.log(value);;
        },
        error: (err) => {
          console.log(err);
          console.log('yyacvaaaa!');
        },
      }
      );
      this.infoForm = this.formBuilder.group({
        id: [0],
        fname: ['', [Validators.required, Validators.maxLength(15)]],
        lname: ['', [Validators.required, Validators.maxLength(10)]],
        password: [
          '',
          // [
          //   Validators.required,
          //   Validators.maxLength(15),
          //   Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$'),
          // ],
        ],
        roleID: [0],
      });
  
      this.loginForm = this.formBuilder.group({
        lname: ['', [Validators.required, Validators.maxLength(10)]],
        password: [
          '',
          // [
          //   Validators.required,
          //   Validators.maxLength(15),
          //   Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$'),
          // ],
        ],
      });
    }


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
interface items {
  ID: number;
  fname: string;
  lname: string;
}