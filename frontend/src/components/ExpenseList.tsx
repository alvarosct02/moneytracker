import { useState, useEffect } from 'react';
import { Expense, OWNERS, Category, Subcategory } from '../types';
import { api } from '../services/api';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  filters: {
    category?: string;
    subcategory?: string;
    owner?: string;
  };
  onFilterChange: (filters: {
    category?: string;
    subcategory?: string;
    owner?: string;
  }) => void;
}

const formatCurrency = (amount: number, currency: 'PEN' | 'USD'): string => {
  if (currency === 'PEN') {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
};

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  filters,
  onFilterChange,
}: ExpenseListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadSubcategories = async () => {
      if (!filters.category) {
        setSubcategories([]);
        return;
      }
      try {
        const selectedCategory = categories.find(c => c.name === filters.category);
        if (selectedCategory) {
          const subs = await api.getSubcategories(selectedCategory.id);
          setSubcategories(subs);
        }
      } catch (error) {
        console.error('Error loading subcategories:', error);
      }
    };
    loadSubcategories();
  }, [filters.category, categories]);

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      onDelete(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.icon || '💰';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
        <p className="text-gray-400 text-sm">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros - Compactos */}
      <div className="bg-white rounded-2xl p-3 mb-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          <select
            value={filters.category || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                category: e.target.value || undefined,
                subcategory: undefined,
              })
            }
            className="text-xs px-2 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-700"
          >
            <option value="" className="text-gray-700">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name} className="text-gray-700">
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filters.subcategory || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                subcategory: e.target.value || undefined,
              })
            }
            disabled={!filters.category}
            className="text-xs px-2 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="" className="text-gray-700">Todas</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.name} className="text-gray-700">
                {sub.name}
              </option>
            ))}
          </select>

          <select
            value={filters.owner || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                owner: e.target.value || undefined,
              })
            }
            className="text-xs px-2 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-700"
          >
            <option value="" className="text-gray-700">Todos</option>
            {OWNERS.map((own) => (
              <option key={own} value={own} className="text-gray-700">
                {own}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de gastos */}
      {expenses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No hay gastos registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Icono */}
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                  {getCategoryIcon(expense.category)}
                </div>
                
                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-semibold text-emerald-600">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEdit(expense)}
                        className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        aria-label="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {expense.category} • {expense.subcategory} • {expense.owner}
                  </div>
                  {expense.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {expense.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(expense.date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
