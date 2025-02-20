import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() {}

  success(message: string, title: string = 'Success'): Promise<void> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#fff',
      iconColor: '#4CAF50',
      customClass: {
        popup: 'colored-toast'
      }
    }).then(() => {});
  }

  error(message: string, title: string = 'Error'): Promise<void> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      background: '#fff',
      iconColor: '#f44336',
      customClass: {
        popup: 'colored-toast'
      }
    }).then(() => {});
  }

  info(message: string, title: string = 'Information'): Promise<void> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'info',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#fff',
      iconColor: '#2196F3',
      customClass: {
        popup: 'colored-toast'
      }
    }).then(() => {});
  }

  confirm(message: string, title: string = 'Are you sure?'): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#f44336',
      background: '#fff',
      customClass: {
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    }).then((result) => result.isConfirmed);
  }

  orderSuccess(order: any): Promise<void> {
    return Swal.fire({
      title: 'Order Placed Successfully!',
      icon: 'success',
      html: `
        <div class="text-left">
          <p class="mb-2">Order #${order.id}</p>
          <p class="mb-2">Total Amount: $${order.totalAmount.toFixed(2)}</p>
          <p class="text-sm text-gray-600">Thank you for your purchase!</p>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'View Order Details',
      confirmButtonColor: '#4CAF50',
      background: '#fff',
      customClass: {
        confirmButton: 'swal2-confirm'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        return this.showOrderDetails(order);
      }
      return Promise.resolve();
    });
  }

  private showOrderDetails(order: any): Promise<void> {
    const itemsList = order.items.map((item: any) => `
      <div class="flex justify-between mb-2">
        <span>${item.product.name}</span>
        <span>${item.quantity} x $${item.product.price.toFixed(2)}</span>
      </div>
    `).join('');

    return Swal.fire({
      title: 'Order Details',
      icon: 'info',
      html: `
        <div class="text-left">
          <div class="mb-4">
            <h3 class="font-bold mb-2">Items:</h3>
            ${itemsList}
          </div>
          <div class="border-t pt-2">
            <p class="font-bold">Total: $${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Close',
      confirmButtonColor: '#4CAF50',
      background: '#fff',
      customClass: {
        confirmButton: 'swal2-confirm'
      }
    }).then(() => {});
  }
}
