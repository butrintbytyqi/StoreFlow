import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  showModal = false;
  isEditing = false;
  currentId: number | null = null;
  searchTerm = '';
  
  categoryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.currentId = null;
    this.categoryForm.reset();
    this.showModal = true;
  }

  openEditModal(category: Category) {
    this.isEditing = true;
    this.currentId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.categoryForm.reset();
  }

  saveCategory() {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      
      if (this.isEditing && this.currentId) {
        this.categoryService.updateCategory(this.currentId, formValue);
      } else {
        this.categoryService.addCategory(formValue);
      }
      
      this.closeModal();
    }
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id);
    }
  }

  get filteredCategories(): Category[] {
    return this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
