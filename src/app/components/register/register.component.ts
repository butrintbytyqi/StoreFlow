import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : {'mismatch': true};
  }

  register() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = null;

      const { confirmPassword, ...userData } = this.registerForm.value;

      console.log('Submitting registration:', userData);

      this.authService.register(userData).subscribe({
        next: (user) => {
          console.log('Registration success:', user);
          this.isLoading = false;
          this.notificationService.success('Registration successful! Please login.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isLoading = false;
          let errorMessage: string;
          
          if (error.status === 409) {
            errorMessage = 'An account with this email already exists';
          } else {
            errorMessage = 'Registration failed. Please try again.';
          }
          
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
