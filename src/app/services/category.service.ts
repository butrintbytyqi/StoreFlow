import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: BehaviorSubject<Category[]>;

  constructor() {
    const savedCategories = localStorage.getItem('categories');
    this.categories = new BehaviorSubject<Category[]>(
      savedCategories ? JSON.parse(savedCategories) : []
    );
  }

  getCategories(): Observable<Category[]> {
    return this.categories.asObservable();
  }

  getCategoryNames(): Observable<string[]> {
    return new Observable(subscriber => {
      this.categories.subscribe(categories => {
        subscriber.next(categories.map(cat => cat.name));
      });
    });
  }

  addCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): void {
    const currentCategories = this.categories.value;
    const newCategory: Category = {
      id: Date.now(),
      ...category,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    currentCategories.push(newCategory);
    this.saveCategories(currentCategories);
  }

  updateCategory(id: number, category: Partial<Category>): void {
    const currentCategories = this.categories.value;
    const index = currentCategories.findIndex(c => c.id === id);
    
    if (index !== -1) {
      currentCategories[index] = {
        ...currentCategories[index],
        ...category,
        updatedAt: new Date()
      };
      this.saveCategories(currentCategories);
    }
  }

  deleteCategory(id: number): void {
    const currentCategories = this.categories.value;
    const filteredCategories = currentCategories.filter(c => c.id !== id);
    this.saveCategories(filteredCategories);
  }

  private saveCategories(categories: Category[]): void {
    localStorage.setItem('categories', JSON.stringify(categories));
    this.categories.next(categories);
  }
}
