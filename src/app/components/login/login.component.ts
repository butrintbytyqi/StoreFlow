import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = null;
      
      const { email, password } = this.loginForm.value;
      console.log('Login attempt with:', { email, password });
      
      this.authService.login(email, password).subscribe({
        next: (user) => {
          console.log('Login successful:', user);
          this.isLoading = false;
          this.notificationService.success('Login successful! Welcome back.');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          const errorMessage = error.message || 'Invalid email or password';
          this.error = errorMessage;
          this.notificationService.error(errorMessage);
        }
      });
    } else {
      const errorMessage = 'Please fill in all required fields correctly';
      this.error = errorMessage;
      this.notificationService.error(errorMessage);
    }
  }
}
