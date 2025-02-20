import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Order {
  id: number;
  customerName: string;
  products: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  showModal = false;
  isEdit = false;
  currentId: number | null = null;
  searchTerm = '';
  statusFilter: string = 'all';
  sortBy: 'date' | 'amount' | 'status' = 'date';
  availableProducts: any[] = [];
  
  orderForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      products: [[], Validators.required],
      notes: [''],
      status: ['pending']
    });
  }

  ngOnInit(): void {
    // Load orders from localStorage or use default data
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders);
    } else {
      // Default orders
      this.orders = [
        {
          id: 1,
          customerName: 'John Doe',
          products: [
            { id: 1, name: 'Product 1', quantity: 2, price: 29.99 }
          ],
          totalAmount: 59.98,
          status: 'pending',
          createdAt: new Date().toISOString(),
          notes: 'First order'
        }
      ];
      this.saveToLocalStorage();
    }

    // Load available products
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      this.availableProducts = JSON.parse(savedProducts);
    }

    this.filterOrders();
  }

  filterOrders() {
    let filtered = [...this.orders];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(search) ||
        order.products.some(p => p.name.toLowerCase().includes(search))
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    this.filteredOrders = filtered;
  }

  openAddModal() {
    this.isEdit = false;
    this.currentId = null;
    this.orderForm.reset({
      status: 'pending',
      products: []
    });
    this.showModal = true;
  }

  editOrder(id: number) {
    this.isEdit = true;
    this.currentId = id;
    const order = this.orders.find(o => o.id === id);
    if (order) {
      this.orderForm.patchValue({
        customerName: order.customerName,
        products: order.products,
        notes: order.notes,
        status: order.status
      });
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.orderForm.reset();
  }

  calculateTotal(products: any[]): number {
    return products.reduce((total, p) => total + (p.quantity * p.price), 0);
  }

  onSubmit() {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;
      const total = this.calculateTotal(formValue.products);
      
      if (this.isEdit && this.currentId) {
        // Update existing order
        const index = this.orders.findIndex(o => o.id === this.currentId);
        if (index !== -1) {
          this.orders[index] = {
            ...this.orders[index],
            ...formValue,
            totalAmount: total
          };
        }
      } else {
        // Add new order
        const newOrder: Order = {
          id: Math.max(0, ...this.orders.map(o => o.id)) + 1,
          customerName: formValue.customerName,
          products: formValue.products,
          totalAmount: total,
          status: formValue.status,
          createdAt: new Date().toISOString(),
          notes: formValue.notes
        };
        this.orders.unshift(newOrder);
      }

      this.saveToLocalStorage();
      this.filterOrders();
      this.closeModal();
    }
  }

  updateOrderStatus(id: number, status: 'pending' | 'processing' | 'completed' | 'cancelled') {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.orders[index].status = status;
      this.saveToLocalStorage();
      this.filterOrders();
    }
  }

  deleteOrder(id: number) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orders = this.orders.filter(o => o.id !== id);
      this.saveToLocalStorage();
      this.filterOrders();
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return '';
    }
  }
}
