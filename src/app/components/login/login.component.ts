import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  pass = '';
  data = [];
  loginData = false;
  constructor(private router: Router){}
  
  async login() {
    this.email = (document.getElementById('email') as HTMLInputElement).value;
    this.pass = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const response = await fetch('http://localhost:3000/users');
      const data = await response.json();
      this.data = data;

      for (let key in this.data) {
        const user: any = this.data[key];
        if (user.email === this.email && user.password === this.pass) {
          this.loginData = true;
          this.router.navigate(['/home'])
          break;
        }
      }

      if (this.loginData) {
        window.alert('Jeni kyqur me sukses!!!');
      } else {
        window.alert('error');
      }
    } catch (error) {
      console.error('An error occurred while logging in:', error);
    }
  }
}
