export type Currency = 'PEN' | 'USD';

export interface Expense {
  id: number;
  amount: number;
  currency: Currency;
  category: string;
  subcategory: string;
  owner: string;
  description?: string;
  date: string;
}

export interface ExpenseSummary {
  totalPEN: number;
  totalUSD: number;
  byCategory: Record<string, { PEN: number; USD: number }>;
  bySubcategory: Record<string, { PEN: number; USD: number }>;
  byOwner: Record<string, { PEN: number; USD: number }>;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  display_order: number;
  created_at?: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  display_order: number;
  created_at?: string;
  category_name?: string;
}

export const OWNERS = ['Alvaro', 'Maryam'] as const;

export type Owner = typeof OWNERS[number];

