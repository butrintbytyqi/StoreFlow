import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification',
  template: `
    <div *ngIf="message" class="notification" [ngClass]="type">
      <div class="notification-content">
        {{ message }}
      </div>
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 30px;
      border-radius: 4px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .notification-content {
      display: flex;
      align-items: center;
      color: white;
      font-weight: 500;
    }

    .success {
      background-color: #4CAF50;
    }

    .error {
      background-color: #f44336;
    }

    .info {
      background-color: #2196F3;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  message: string = '';
  type: 'success' | 'error' | 'info' = 'info';
  private subscription?: Subscription;
  private timeout?: any;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(notification => {
      this.message = notification.message;
      this.type = notification.type;

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        this.message = '';
      }, notification.duration || 3000);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}
