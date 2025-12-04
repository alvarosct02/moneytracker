import { useState, useEffect } from 'react';
import { Expense } from './types';
import { api } from './services/api';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import { ExpenseSummary as SummaryType } from './types';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<SummaryType>({
    totalPEN: 0,
    totalUSD: 0,
    byCategory: {},
    bySubcategory: {},
    byOwner: {},
  });
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<{
    category?: string;
    subcategory?: string;
    owner?: string;
  }>({});
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await api.getExpenses(filters);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar los gastos';
      alert(`Error al cargar los gastos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await api.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  useEffect(() => {
    loadExpenses();
    loadSummary();
  }, [filters]);

  const handleCreate = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await api.createExpense(expenseData);
      // Reload both expenses and summary to ensure UI is updated
      await Promise.all([loadExpenses(), loadSummary()]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Error al crear el gasto');
    }
  };

  const handleUpdate = async (id: number, expenseData: Partial<Expense>) => {
    try {
      await api.updateExpense(id, expenseData);
      await loadExpenses();
      await loadSummary();
      setEditingExpense(undefined);
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Error al actualizar el gasto');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteExpense(id);
      await loadExpenses();
      await loadSummary();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error al eliminar el gasto');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormSubmit = (expenseData: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      handleUpdate(editingExpense.id, expenseData);
    } else {
      handleCreate(expenseData);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              M
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-emerald-600">MoneyTracker</h1>
              <p className="text-xs text-gray-400">Gastos Diarios</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-xl font-light hover:bg-emerald-600 transition-colors shadow-sm"
                aria-label="Nuevo gasto"
              >
                +
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 pb-20">
        {!showForm ? (
          <>
            <ExpenseSummary summary={summary} expensesCount={expenses.length} />

            {loading ? (
              <div className="text-center py-12 text-gray-400">Cargando...</div>
            ) : (
              <ExpenseList
                expenses={expenses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                filters={filters}
                onFilterChange={setFilters}
              />
            )}
          </>
        ) : (
          <ExpenseForm
            expense={editingExpense}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
}

export default App;

