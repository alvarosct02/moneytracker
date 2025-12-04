import { useState, useEffect } from 'react';
import { Expense, OWNERS, Currency, Category, Subcategory } from '../types';
import { api } from '../services/api';
import SelectPopup from './SelectPopup';
import DatePopup from './DatePopup';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

export default function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const [amount, setAmount] = useState(expense?.amount.toString() || '');
  const [currency, setCurrency] = useState<Currency>(expense?.currency || 'PEN');
  const [category, setCategory] = useState<string>(expense?.category || '');
  const [subcategory, setSubcategory] = useState(expense?.subcategory || '');
  const [owner, setOwner] = useState(expense?.owner || OWNERS[0]);
  const [description, setDescription] = useState(expense?.description || '');
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);
  
  // Categories and subcategories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Popup states
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showSubcategoryPopup, setShowSubcategoryPopup] = useState(false);
  const [showOwnerPopup, setShowOwnerPopup] = useState(false);
  const [showDatePopup, setShowDatePopup] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const cats = await api.getCategories();
        setCategories(cats);
        
        // Set default category if not editing
        if (!expense && cats.length > 0 && !category) {
          setCategory(cats[0].name);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!category) return;
      
      try {
        const selectedCategory = categories.find(c => c.name === category);
        if (!selectedCategory) return;
        
        const subs = await api.getSubcategories(selectedCategory.id);
        setSubcategories(subs);
        
        // Set default subcategory if not editing and subcategories exist
        if (!expense && subs.length > 0 && !subcategory) {
          setSubcategory(subs[0].name);
        } else if (expense && subs.length > 0 && !subs.find(s => s.name === subcategory)) {
          // If current subcategory doesn't exist in new category, set first one
          setSubcategory(subs[0].name);
        }
      } catch (error) {
        console.error('Error loading subcategories:', error);
      }
    };
    
    loadSubcategories();
  }, [category, categories]);

  const getCategoryIcon = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    return cat?.icon || '📂';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = dateString.split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const yesterdayOnly = yesterday.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];

    if (dateOnly === todayOnly) return 'Hoy';
    if (dateOnly === yesterdayOnly) return 'Ayer';
    if (dateOnly === tomorrowOnly) return 'Mañana';

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subcategory) {
      alert('Por favor selecciona una categoría y subcategoría');
      return;
    }
    onSubmit({
      amount: parseFloat(amount),
      currency,
      category,
      subcategory,
      owner,
      description: description || undefined,
      date,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setAmount(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-gray-500">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">
          {expense ? 'Editar Gasto' : 'Nuevo Gasto'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Amount Display - Editable */}
      <div className="px-6 py-8 text-center bg-emerald-50">
        {/* Currency Chips */}
        <div className="flex gap-2 justify-center mb-4">
          <button
            type="button"
            onClick={() => setCurrency('PEN')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              currency === 'PEN'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            S/.
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              currency === 'USD'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            $
          </button>
        </div>
        
        {/* Editable Amount */}
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0"
          required
          className="w-full bg-transparent border-none text-5xl font-bold text-emerald-600 tracking-tight text-center focus:outline-none focus:ring-0 placeholder:text-emerald-300"
          style={{ caretColor: '#059669' }}
        />
      </div>

      {/* Hidden inputs for form validation */}
      <input type="hidden" name="date" value={date} required />
      <input type="hidden" name="category" value={category} required />
      <input type="hidden" name="subcategory" value={subcategory} required />
      <input type="hidden" name="owner" value={owner} required />

      {/* Fields as Cards */}
      <div className="px-6 py-4 space-y-3">
        {/* Fecha */}
        <button
          type="button"
          onClick={() => setShowDatePopup(true)}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
        >
          <div className="text-2xl">📅</div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Fecha</div>
            <div className="text-base font-medium text-gray-800">{formatDate(date)}</div>
          </div>
          <div className="text-gray-400">›</div>
        </button>

        {/* Categoría */}
        <button
          type="button"
          onClick={() => setShowCategoryPopup(true)}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
        >
          <div className="text-2xl">{getCategoryIcon(category)}</div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Categoría</div>
            <div className="text-base font-medium text-gray-800">{category || 'Seleccionar...'}</div>
          </div>
          <div className="text-gray-400">›</div>
        </button>

        {/* Subcategoría */}
        <button
          type="button"
          onClick={() => setShowSubcategoryPopup(true)}
          disabled={!category || subcategories.length === 0}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="text-2xl">🏷️</div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Subcategoría</div>
            <div className="text-base font-medium text-gray-800">{subcategory || 'Seleccionar...'}</div>
          </div>
          <div className="text-gray-400">›</div>
        </button>

        {/* Owner */}
        <button
          type="button"
          onClick={() => setShowOwnerPopup(true)}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
        >
          <div className="text-2xl">👤</div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Quien hace el gasto</div>
            <div className="text-base font-medium text-gray-800">{owner}</div>
          </div>
          <div className="text-gray-400">›</div>
        </button>

        {/* Descripción */}
        {description && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl mt-1">📝</div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Descripción</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Agregar nota..."
                className="w-full bg-transparent border-none p-0 text-base text-gray-800 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}
        {!description && (
          <button
            type="button"
            onClick={() => setDescription(' ')}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
          >
            <div className="text-2xl">📝</div>
            <div className="text-sm text-gray-500">Agregar descripción (opcional)</div>
          </button>
        )}
      </div>

      {/* Footer with Actions */}
      <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 bg-emerald-500 text-white py-2.5 px-4 rounded-xl hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold transition-colors text-sm"
        >
          {expense ? 'Actualizar' : 'Crear'}
        </button>
      </div>

      {/* Popups */}
      <DatePopup
        isOpen={showDatePopup}
        onClose={() => setShowDatePopup(false)}
        selectedDate={date}
        onSelect={setDate}
      />

      <SelectPopup
        isOpen={showCategoryPopup}
        onClose={() => setShowCategoryPopup(false)}
        title="Seleccionar Categoría"
        options={categories.map((cat) => ({
          value: cat.name,
          label: cat.name,
          icon: cat.icon,
        }))}
        selectedValue={category}
        onSelect={(value) => setCategory(value as string)}
      />

      <SelectPopup
        isOpen={showSubcategoryPopup}
        onClose={() => setShowSubcategoryPopup(false)}
        title="Seleccionar Subcategoría"
        options={subcategories.map((sub) => ({
          value: sub.name,
          label: sub.name,
        }))}
        selectedValue={subcategory}
        onSelect={setSubcategory}
      />

      <SelectPopup
        isOpen={showOwnerPopup}
        onClose={() => setShowOwnerPopup(false)}
        title="Quien hace el gasto"
        options={OWNERS.map((own) => ({
          value: own,
          label: own,
          icon: '👤',
        }))}
        selectedValue={owner}
        onSelect={setOwner}
      />
    </form>
  );
}
