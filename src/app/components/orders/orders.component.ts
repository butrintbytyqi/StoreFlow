import { Component, OnInit } from '@angular/core';

interface Order {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  customerName: string;
  customerEmail: string;
  orderDate: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm: string = '';
  statusFilter: string = '';

  constructor() { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders);
      this.filterOrders();
    }
  }

  filterOrders() {
    let filtered = [...this.orders];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.productName.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerEmail.toLowerCase().includes(search)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    this.filteredOrders = filtered;
  }

  updateOrderStatus(orderId: number, newStatus: 'Pending' | 'Processing' | 'Completed' | 'Cancelled') {
    const index = this.orders.findIndex(order => order.id === orderId);
    if (index !== -1) {
      this.orders[index].status = newStatus;
      localStorage.setItem('orders', JSON.stringify(this.orders));
      this.filterOrders();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  deleteOrder(orderId: number) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orders = this.orders.filter(order => order.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(this.orders));
      this.filterOrders();
    }
  }
}
