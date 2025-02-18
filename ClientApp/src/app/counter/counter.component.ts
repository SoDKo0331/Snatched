import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { ToastService } from 'angular-toastify';
import { Router, ActivatedRoute } from '@angular/router';
import { Token } from '@angular/compiler';
@Component({
  selector: 'app-counter-component',
  templateUrl: './counter.component.html',
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition('* <=> *', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class CounterComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private toaster: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  readonly APIUrl = 'https://localhost:7252/WeatherForecast';
  navigateToHomePage(ID: number) {
    const numericID = +ID;
    const url = `/home/${numericID}`;
    this.router.navigateByUrl(url);
  }

  public items: items[] = [];
  public datas: data[] = [];
  public infoForm!: FormGroup;
  public loginForm!: FormGroup;
  public isRegistration: boolean = true;
  showSuccessToaster() {
    this.toaster.success('Registered!');
  }
  showSuccessToasterl() {
    this.toaster.info('Valid!');
  }
  showErrorToaster() {
    this.toaster.error('Validation error!!!');
  }
  showErrorToastern() {
    this.toaster.error('Wrong Username or Password !!!');
  }
  showErrorToasterli() {
    this.toaster.success('User Logged in!');
  }
  navigateToAccountsPage() {
    this.router.navigate(['/fetch-data']);
    this.showErrorToasterli();
  }
  showErrorToasterla() {
    this.toaster.success('Admin Logged in!');
  }

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
      ID: [0],
      FName: ['', [Validators.required, Validators.maxLength(15)]],
      Username: ['', [Validators.required, Validators.maxLength(10)]],
      Password: [
        '',
        [
          Validators.required,
          Validators.maxLength(15),
          Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$'),
        ],
      ],
      roleID: [0],
    });

    this.loginForm = this.formBuilder.group({
      Username: ['', [Validators.required, Validators.maxLength(10)]],
      Password: [
        '',
        [
          Validators.required,
          Validators.maxLength(15),
          Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$'),
        ],
      ],
    });
  }

  openpostModal() {
    console.log('karakum: ' + this.infoForm.value.FName);
  }

  onSubmit() {
    if (this.isRegistration) {
      if (this.infoForm.valid) {
        this.http.post(`${this.APIUrl}`, this.infoForm.value).subscribe({
          next: () => {
            console.log(`Posted: ${this.infoForm.value.Username}`);
            this.showSuccessToaster();
            this.ngOnInit();
          },
          error: (err) => {
            console.log(`Posted: ${this.infoForm.value.Username}`);
            console.log(err);
            console.log('error here!');
          },
        });
      } else this.showErrorToaster();
    } else {
      if (this.loginForm.valid) {
        this.http.post(`${this.APIUrl}/login`, this.loginForm.value).subscribe({
          next: (response: any) => {
            if (response.token) {
              // Store the token in local storage
              localStorage.setItem('token', response.token);
              localStorage.setItem('id', response.id);
              localStorage.setItem('username', response.username);
              localStorage.setItem('roleID', response.roleID);
              console.log(response);
              if(response.roleID == 1) {
                this.showErrorToasterla();
              }
              else this.showErrorToasterli();
              // Display a success message
            } else {
              this.showErrorToastern(); // No matching user found (null response)
            }
          },
          error: (err) => {
            console.log(err);
            this.showErrorToastern(); // Handle the error
          },
        });
      } else {
        this.showErrorToaster(); // Invalid form
      }
    }
  }

  toggleForm() {
    this.isRegistration = !this.isRegistration;
    this.infoForm.reset();
    this.loginForm.reset();
  }
  toggleChatbot(): void {
    const chatbotIframe = document.getElementById("chatbot-iframe") as HTMLElement;

    const currentDisplay = chatbotIframe.style.display || getComputedStyle(chatbotIframe).display;

    chatbotIframe.style.display = (currentDisplay === "none" || currentDisplay === "") ? "block" : "none";
  }

}

interface data {
  ID: number;
  Username: string;
  Password: string;
}

interface items {
  ID: number;
  FName: string;
  Username: string;
  Password: string;
  roleID: number;
}
