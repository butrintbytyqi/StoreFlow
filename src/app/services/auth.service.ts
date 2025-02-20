import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private users: User[] = [];
  private nextId = 1;

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();

    // Load stored users
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
      this.nextId = Math.max(...this.users.map(u => u.id)) + 1;
      console.log('Loaded existing users:', this.users);
    } else {
      // Create default admin user if no users exist
      this.users = [{
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        password: 'admin123'
      }];
      localStorage.setItem('users', JSON.stringify(this.users));
      console.log('Created default admin user:', this.users[0]);
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    console.log('Login attempt:', { email, password });
    console.log('Available users:', this.users);
    
    const user = this.users.find(u => {
      console.log('Comparing with user:', { 
        userEmail: u.email, 
        userPassword: u.password,
        matches: u.email === email && u.password === password 
      });
      return u.email === email && u.password === password;
    });
    
    if (!user) {
      console.log('Login failed: user not found or password mismatch');
      return throwError(() => new Error('Invalid email or password'));
    }

    console.log('Login successful:', user);
    const { password: _, ...secureUser } = user;
    localStorage.setItem('currentUser', JSON.stringify(secureUser));
    this.currentUserSubject.next(secureUser);
    return of(secureUser).pipe(delay(1000));
  }

  register(userData: Partial<User> & { password: string }): Observable<User> {
    console.log('Registration attempt:', userData);
    
    if (this.users.some(u => u.email === userData.email)) {
      console.log('Registration failed: email exists');
      return throwError(() => ({ status: 409, message: 'Email already exists' }));
    }

    const newUser: User = {
      id: this.nextId++,
      username: userData.username!,
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      role: 'user',
      password: userData.password
    };

    this.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(this.users));
    console.log('Registration successful:', newUser);
    console.log('Updated users list:', this.users);

    const { password: _, ...secureUser } = newUser;
    return of(secureUser).pipe(delay(1000));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    console.log('User logged out');
  }
}
