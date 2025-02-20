import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './auth.service';

export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  details: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [];
  private activities: UserActivity[] = [];
  private usersSubject: BehaviorSubject<User[]>;
  public users$: Observable<User[]>;

  constructor() {
    this.loadUsers();
    this.loadActivities();
    this.usersSubject = new BehaviorSubject<User[]>(this.users);
    this.users$ = this.usersSubject.asObservable();
  }

  private loadUsers() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
    }
  }

  private loadActivities() {
    const savedActivities = localStorage.getItem('userActivities');
    if (savedActivities) {
      this.activities = JSON.parse(savedActivities);
    }
  }

  private saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
    this.usersSubject.next(this.users);
  }

  private saveActivities() {
    localStorage.setItem('userActivities', JSON.stringify(this.activities));
  }

  getAllUsers(): User[] {
    return this.users;
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  updateUser(id: number, updates: Partial<User>): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;

    this.users[index] = { ...this.users[index], ...updates };
    this.saveUsers();
    return true;
  }

  deleteUser(id: number): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    
    if (this.users.length !== initialLength) {
      this.saveUsers();
      return true;
    }
    return false;
  }

  logActivity(userId: number, action: string, details: string) {
    const activity: UserActivity = {
      id: this.activities.length + 1,
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    this.activities.push(activity);
    this.saveActivities();
  }

  getUserActivities(userId: number): UserActivity[] {
    return this.activities.filter(activity => activity.userId === userId);
  }

  getAllActivities(): UserActivity[] {
    return this.activities;
  }

  getRecentActivities(limit: number = 10): UserActivity[] {
    return [...this.activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  searchUsers(query: string): User[] {
    query = query.toLowerCase();
    return this.users.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query)
    );
  }

  getUsersByRole(role: string): User[] {
    return this.users.filter(user => user.role === role);
  }

  getActiveUsers(): User[] {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    return this.users.filter(user => {
      if (!user.lastLogin) return false;
      return new Date(user.lastLogin) > twentyFourHoursAgo;
    });
  }
}
