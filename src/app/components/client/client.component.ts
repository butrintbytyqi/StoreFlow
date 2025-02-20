import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

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
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  showOrderModal: boolean = false;
  selectedProduct: Product | null = null;
  orderForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    // Initialize with default products directly
    this.products = [
      {
        id: 1,
        name: 'iPhone 13',
        category: 'Electronics',
        price: 999,
        description: 'A high-end smartphone',
        image: 'https://example.com/iphone13.jpg'
      },
      {
        id: 2,
        name: 'MacBook Pro',
        category: 'Electronics',
        price: 1299,
        description: 'Powerful laptop for professionals',
        image: 'https://example.com/macbook.jpg'
      },
      {
        id: 3,
        name: 'AirPods Pro',
        category: 'Electronics',
        price: 249,
        description: 'Premium wireless earbuds',
        image: 'https://example.com/airpods.jpg'
      }
    ];
    
    this.filteredProducts = [...this.products];
    
    this.orderForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      customerEmail: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Load categories from service
    this.categoryService.getCategoryNames().subscribe(categories => {
      this.categories = categories;
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  openOrderModal(product: Product): void {
    this.selectedProduct = product;
    this.showOrderModal = true;
    this.orderForm.reset({ quantity: 1 });
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedProduct = null;
    this.orderForm.reset();
  }

  getTotalPrice(): number {
    if (!this.selectedProduct || !this.orderForm.get('quantity')?.value) return 0;
    return this.selectedProduct.price * this.orderForm.get('quantity')?.value;
  }

  placeOrder() {
    if (this.orderForm.valid && this.selectedProduct) {
      const formValue = this.orderForm.value;
      
      // Create new order
      const order: Order = {
        id: Date.now(),
        productId: this.selectedProduct.id,
        productName: this.selectedProduct.name,
        quantity: formValue.quantity,
        totalPrice: this.getTotalPrice(),
        status: 'Pending',
        customerName: formValue.customerName,
        customerEmail: formValue.customerEmail,
        orderDate: new Date().toISOString()
      };

      // Save to localStorage
      const savedOrders = localStorage.getItem('orders');
      const orders = savedOrders ? JSON.parse(savedOrders) : [];
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));

      // Close modal and show success message
      this.closeOrderModal();
      alert('Order placed successfully!');
    }
  }
}
