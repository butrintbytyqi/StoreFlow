import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  date: string;
  image?: string;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['Fruits', 'Electronics', 'Accessories', 'Parts'];
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm: string = '';
  selectedCategory: string = '';
  sortBy: string = 'name';
  showModal: boolean = false;
  isEdit: boolean = false;
  currentId: number | null = null;
  productForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      image: ['']
    });
  }

  ngOnInit(): void {
    // Load products from localStorage or use default data
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      this.products = JSON.parse(savedProducts);
    } else {
      // Default products
      this.products = [
        {
          id: 1,
          name: 'Apple iPhone 13',
          category: 'Electronics',
          price: 999,
          date: new Date().toISOString().split('T')[0],
          image: 'https://example.com/iphone13.jpg'
        },
        // Add more default products as needed
      ];
      this.saveToLocalStorage();
    }
    this.filterProducts();
  }

  filterProducts() {
    let filtered = [...this.products];

    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => 
        product.category === this.selectedCategory
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        default:
          return 0;
      }
    });

    this.filteredProducts = filtered;
  }

  openAddModal() {
    this.isEdit = false;
    this.currentId = null;
    this.productForm.reset();
    this.showModal = true;
  }

  editData(id: number) {
    this.isEdit = true;
    this.currentId = id;
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.productForm.patchValue({
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image
      });
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.productForm.reset();
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      if (this.isEdit && this.currentId) {
        // Update existing product
        const index = this.products.findIndex(p => p.id === this.currentId);
        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            ...formValue
          };
        }
      } else {
        // Add new product
        const newProduct: Product = {
          id: Math.max(0, ...this.products.map(p => p.id)) + 1,
          ...formValue,
          date: new Date().toISOString().split('T')[0]
        };
        this.products.unshift(newProduct);
      }
      
      this.saveToLocalStorage();
      this.filterProducts();
      this.closeModal();
    }
  }

  deleteData(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(product => product.id !== id);
      this.saveToLocalStorage();
      this.filterProducts();
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }
}
