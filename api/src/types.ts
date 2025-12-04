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

