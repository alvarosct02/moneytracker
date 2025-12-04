import { Expense, ExpenseSummary, Category, Subcategory } from '../types';

const API_BASE = '/api';

export const api = {
  async getExpenses(filters?: {
    category?: string;
    subcategory?: string;
    owner?: string;
  }): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.subcategory) params.append('subcategory', filters.subcategory);
    if (filters?.owner) params.append('owner', filters.owner);

    try {
      const response = await fetch(`${API_BASE}/expenses?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch expenses`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const response = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Failed to create expense');
    return response.json();
  },

  async updateExpense(id: number, expense: Partial<Expense>): Promise<Expense> {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Failed to update expense');
    return response.json();
  },

  async deleteExpense(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete expense');
  },

  async getSummary(): Promise<ExpenseSummary> {
    const response = await fetch(`${API_BASE}/summary`);
    if (!response.ok) throw new Error('Failed to fetch summary');
    return response.json();
  },

  // Categories API
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_BASE}/categories?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  async deleteCategory(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/categories?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete category');
  },

  // Subcategories API
  async getSubcategories(categoryId?: number): Promise<Subcategory[]> {
    const url = categoryId 
      ? `${API_BASE}/subcategories?category_id=${categoryId}`
      : `${API_BASE}/subcategories`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch subcategories');
    return response.json();
  },

  async createSubcategory(subcategory: Omit<Subcategory, 'id' | 'created_at' | 'category_name'>): Promise<Subcategory> {
    const response = await fetch(`${API_BASE}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subcategory),
    });
    if (!response.ok) throw new Error('Failed to create subcategory');
    return response.json();
  },

  async updateSubcategory(id: number, subcategory: Partial<Subcategory>): Promise<Subcategory> {
    const response = await fetch(`${API_BASE}/subcategories?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subcategory),
    });
    if (!response.ok) throw new Error('Failed to update subcategory');
    return response.json();
  },

  async deleteSubcategory(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/subcategories?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete subcategory');
  },
};

