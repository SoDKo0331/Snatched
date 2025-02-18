import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html'
})
export class ChatsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private toaster: ToastService,
    private route: ActivatedRoute,
  ) { }
  readonly APIUrl = 'https://localhost:7252/WeatherForecast';
  public chatsForm!: FormGroup;
  ngOnInit() {
    this.chatsForm = this.formBuilder.group({
      sender_id: [localStorage.getItem('id')],
      Username: [localStorage.getItem('username')],
      text: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }
  showSuccessToasters() {
    this.toaster.success('Sent!');
  }
  showSuccessToasterf() {
    this.toaster.error('Send Failed!');
  }
  sendChat() {
    this.http.post(`${this.APIUrl}/login`, this.chatsForm.value).subscribe({
      next: (response: any) => {
        this.showSuccessToasters();
      },
      error: (err) => {
        console.log(err);
        this.showSuccessToasterf();
      },
    });
  }
}
