import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html',
})
export class FetchDataComponent implements OnInit {
  readonly APIUrl = 'https://localhost:7252/WeatherForecast';

  public items: items[] = [];
  public infoForm!: FormGroup;
  public accForm!: FormGroup;
  public isData: boolean = false;
  public isAdmin: boolean = false;

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.getItems();
  }

  ngOnInit() {
    this.accForm = this.formBuilder.group({
      id: [0],
      fname: ['', [Validators.maxLength(10)]],
      lname: ['', [Validators.maxLength(10)]],
      password: [
        '',
        [
          Validators.maxLength(15),
          Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$'),
        ],
      ],
      roleid: ['', [Validators.maxLength(1)]],
    });
  }

  getItems() {
    // Retrieve the token from local storage
    const token = localStorage.getItem('token');
    var roleIdString = localStorage.getItem('roleid') || '-1';
    var roleId = parseInt(roleIdString);
    var Idstring = localStorage.getItem('id') || '-1';
    var ID = parseInt(Idstring);
    console.log('   token:  ' + token);
    if (token != null) {
      this.isData = true;
      // Include the token in the HTTP headers for authorization
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      console.log('Role ID:', roleId);
      if (roleId != 1) {
        this.isAdmin = false;
        this.http.get<items[]>(`${this.APIUrl}/user`, { headers, params: { ID } })
          .subscribe({
            next: (value) => {
              this.items = value;
            },
            error: (err) => {
              console.log(err);
            },
          }
          );
      }
      else {
        this.isAdmin = true;
        this.http.get<items[]>(`${this.APIUrl}/info`, { headers }).subscribe({
          next: (value) => {
            this.items = value;
            console.log(value);
          },
          error: (err) => {
            console.log(err);
          },
        });
      }

    } else this.isData = false;
  }

  openEditModal(item: items) {
    this.accForm.patchValue(item);
  }

  openpostModal() {
    console.log('karakum: ' + this.infoForm.value.fname);
  }

  updating() {
    if (this.accForm.valid) {
      this.http.put(`${this.APIUrl}`, this.accForm.value).subscribe({
        next: () => {
          console.log(`Updated by ID: ${this.accForm.value.ID}`);
          this.getItems();
          this.closeEditModal(); // Close the modal
        },
        error: (err) => {
          console.log(err);
          console.log('error here!');
        },
      });
    }
  }

  closeEditModal() {
    const modal = document.getElementById('exampleModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove();
      }
    }
  }

  deleteInfo(ID: number) {
    // Retrieve the token from local storage
    const token = localStorage.getItem('token');
    if (token) {
      // Include the token in the HTTP headers for authorization
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      // Make an authenticated request to delete data
      this.http.delete(`${this.APIUrl}?ID=${ID}`, { headers }).subscribe({
        next: () => {
          console.log(`Deleted by ID: ${ID}`);
          this.getItems();
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}

interface items {
  id: number;
  fname: string;
  lname: string;
  password: string;
  roleid: number;
}
