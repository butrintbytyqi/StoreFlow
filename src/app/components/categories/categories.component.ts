import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
  createdAt: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  showModal = false;
  isEdit = false;
  currentId: number | null = null;
  searchTerm = '';
  sortBy: 'name' | 'productCount' | 'date' = 'name';
  
  categoryForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load categories from localStorage or use default data
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      this.categories = JSON.parse(savedCategories);
    } else {
      // Default categories
      this.categories = [
        {
          id: 1,
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          productCount: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Clothing',
          description: 'Apparel and fashion items',
          productCount: 0,
          createdAt: new Date().toISOString()
        }
      ];
      this.saveToLocalStorage();
    }
    this.updateProductCounts();
    this.filterCategories();
  }

  private updateProductCounts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    this.categories.forEach(category => {
      category.productCount = products.filter((p: any) => p.category === category.name).length;
    });
    this.saveToLocalStorage();
  }

  filterCategories() {
    let filtered = [...this.categories];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(search) ||
        category.description.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'productCount':
          return b.productCount - a.productCount;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    this.filteredCategories = filtered;
  }

  openAddModal() {
    this.isEdit = false;
    this.currentId = null;
    this.categoryForm.reset();
    this.showModal = true;
  }

  editCategory(id: number) {
    this.isEdit = true;
    this.currentId = id;
    const category = this.categories.find(c => c.id === id);
    if (category) {
      this.categoryForm.patchValue({
        name: category.name,
        description: category.description
      });
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.categoryForm.reset();
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      
      if (this.isEdit && this.currentId) {
        // Update existing category
        const index = this.categories.findIndex(c => c.id === this.currentId);
        if (index !== -1) {
          this.categories[index] = {
            ...this.categories[index],
            ...formValue
          };
        }
      } else {
        // Add new category
        const newCategory: Category = {
          id: Math.max(0, ...this.categories.map(c => c.id)) + 1,
          name: formValue.name,
          description: formValue.description,
          productCount: 0,
          createdAt: new Date().toISOString()
        };
        this.categories.unshift(newCategory);
      }

      this.saveToLocalStorage();
      this.updateProductCounts();
      this.filterCategories();
      this.closeModal();
    }
  }

  deleteCategory(id: number) {
    const category = this.categories.find(c => c.id === id);
    if (category && category.productCount > 0) {
      if (!confirm(`This category contains ${category.productCount} products. Are you sure you want to delete it?`)) {
        return;
      }
    }

    this.categories = this.categories.filter(c => c.id !== id);
    this.saveToLocalStorage();
    this.filterCategories();
  }

  private saveToLocalStorage() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }
}
