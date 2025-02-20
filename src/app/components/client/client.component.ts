import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { CategoryService } from '../../services/category.service';
import { Order, OrderItem } from '../../interfaces/order';

interface CartItem {
  product: any;
  quantity: number;
}

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: string[] = [];
  selectedCategory: string | null = null;
  searchQuery: string = '';
  cart: CartItem[] = [];
  showOrderModal: boolean = false;
  orderForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private categoryService: CategoryService
  ) {
    this.orderForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      this.products = JSON.parse(savedProducts);
      this.filteredProducts = [...this.products];
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories.map(cat => cat.name);
    });
  }

  get totalAmount(): number {
    return this.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  addToCart(product: any) {
    const existingItem = this.cart.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.notificationService.success('Product added to cart', 'Success');
  }

  updateQuantity(index: number, change: number) {
    const item = this.cart[index];
    item.quantity += change;
    if (item.quantity <= 0) {
      this.cart.splice(index, 1);
      this.notificationService.info('Item removed from cart', 'Cart Updated');
    } else {
      this.notificationService.info('Quantity updated', 'Cart Updated');
    }
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    this.notificationService.info('Item removed from cart', 'Cart Updated');
  }

  openOrderModal() {
    if (this.cart.length === 0) {
      this.notificationService.error('Your cart is empty', 'Error');
      return;
    }
    this.showOrderModal = true;
  }

  closeOrderModal() {
    this.showOrderModal = false;
    this.orderForm.reset();
  }

  async placeOrder() {
    if (this.orderForm.invalid) {
      this.notificationService.error('Please fill in all required fields', 'Error');
      return;
    }

    // Create order items
    const items: OrderItem[] = this.cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));

    // Create the order
    const order: Order = {
      id: Date.now(),
      items: items,
      totalAmount: this.totalAmount,
      status: 'Pending',
      customerName: this.orderForm.value.name,
      customerEmail: this.orderForm.value.email,
      customerAddress: this.orderForm.value.address,
      customerPhone: this.orderForm.value.phone,
      orderDate: new Date()
    };

    // Get existing orders or initialize empty array
    const existingOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Add new order
    existingOrders.push(order);
    
    // Save back to localStorage
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    // Clear cart and close modal
    this.cart = [];
    this.closeOrderModal();

    // Show success notification
    await this.notificationService.orderSuccess(order);
  }
}
