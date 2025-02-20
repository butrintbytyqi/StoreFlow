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
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    // In a real app, we would verify the password here
    const response = { ...user };
    localStorage.setItem('currentUser', JSON.stringify(response));
    this.currentUserSubject.next(response);
    return of(response).pipe(delay(1000)); // Simulate API delay
  }

  register(userData: Partial<User>): Observable<User> {
    // Check if email already exists
    if (this.users.some(u => u.email === userData.email)) {
      return throwError(() => ({ status: 409, message: 'Email already exists' }));
    }

    const newUser: User = {
      id: this.nextId++,
      username: userData.username!,
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      role: 'user'
    };

    this.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(this.users));

    return of(newUser).pipe(delay(1000)); // Simulate API delay
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
