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

export const CATEGORIES = {
  Comida: ['Supermercado', 'Restaurantes', 'Delivery', 'Cafetería'],
  Transporte: ['Gasolina', 'Estacionamiento', 'Transporte público', 'Mantenimiento'],
  Hogar: ['Servicios (luz, agua, gas)', 'Mantenimiento', 'Decoración', 'Limpieza'],
  Salud: ['Farmacia', 'Médico', 'Seguro médico', 'Gimnasio'],
  Entretenimiento: ['Cine', 'Streaming', 'Eventos', 'Hobbies'],
  Otros: ['Varios', 'Regalos', 'Donaciones'],
} as const;

export const OWNERS = ['Alvaro', 'Maryam'] as const;

export type Category = keyof typeof CATEGORIES;
export type Owner = typeof OWNERS[number];

