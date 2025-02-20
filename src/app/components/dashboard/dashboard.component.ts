import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  topProducts: any[];
  ordersByStatus: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    ordersByStatus: {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    },
    revenueByMonth: []
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  get user() {
    return this.authService.currentUserValue;
  }

  loadStats() {
    // Load products
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    this.stats.totalProducts = products.length;

    // Load categories
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    this.stats.totalCategories = categories.length;

    // Load orders
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    this.stats.totalOrders = orders.length;

    // Calculate total revenue and orders by status
    this.stats.totalRevenue = 0;
    this.stats.ordersByStatus = {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    };

    orders.forEach((order: any) => {
      this.stats.totalRevenue += order.totalAmount || 0;
      if (order.status) {
        this.stats.ordersByStatus[order.status as keyof typeof this.stats.ordersByStatus]++;
      }
    });

    // Get recent orders (last 5)
    this.stats.recentOrders = orders
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Calculate top products
    const productSales = new Map<string, { name: string; count: number; revenue: number }>();
    orders.forEach((order: any) => {
      order.products?.forEach((product: any) => {
        const existing = productSales.get(product.id) || { name: product.name, count: 0, revenue: 0 };
        existing.count += product.quantity || 1;
        existing.revenue += (product.price || 0) * (product.quantity || 1);
        productSales.set(product.id, existing);
      });
    });

    this.stats.topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate revenue by month (last 6 months)
    const monthlyRevenue = new Map<string, number>();
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyRevenue.set(monthKey, 0);
    }

    orders.forEach((order: any) => {
      const orderDate = new Date(order.date);
      const monthKey = orderDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (monthlyRevenue.has(monthKey)) {
        monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + (order.totalAmount || 0));
      }
    });

    this.stats.revenueByMonth = Array.from(monthlyRevenue.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .reverse();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  }
}
