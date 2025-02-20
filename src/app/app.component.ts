import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Product Manager';
  isLoggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.currentUser.subscribe(
      user => this.isLoggedIn = !!user
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
