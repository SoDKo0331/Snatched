import { Component } from '@angular/core';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
})
export class NavMenuComponent {
  constructor(private toaster: ToastService) {}
  isExpanded = false;

  showSuccessToaster() {
    this.toaster.success('Registered!');
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
  isLoggedin = false;

  checker() {
    if(localStorage.getItem('token') != null) this.isLoggedin = true;
    else this.isLoggedin = false;
  }

  logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('roleID');
    this.isLoggedin = false;
  }
}
