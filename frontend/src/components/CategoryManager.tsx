import { useState, useEffect } from 'react';
import { Category, Subcategory } from '../types';
import { api } from '../services/api';

interface CategoryManagerProps {
  onClose: () => void;
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', icon: '' });
  const [subcategoryFormData, setSubcategoryFormData] = useState({ name: '' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory.id);
    }
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const cats = await api.getCategories();
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (categoryId: number) => {
    try {
      const subs = await api.getSubcategories(categoryId);
      setSubcategories(subs);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await api.createCategory({
        name: categoryFormData.name,
        icon: categoryFormData.icon || undefined,
        display_order: categories.length,
      });
      setCategoryFormData({ name: '', icon: '' });
      setShowCategoryForm(false);
      await loadData();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear categoría');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      await api.updateCategory(editingCategory.id, {
        name: categoryFormData.name,
        icon: categoryFormData.icon || undefined,
        display_order: editingCategory.display_order,
      });
      setEditingCategory(null);
      setCategoryFormData({ name: '', icon: '' });
      setShowCategoryForm(false);
      await loadData();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error al actualizar categoría');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? No se puede eliminar si tiene gastos asociados.')) {
      return;
    }
    try {
      await api.deleteCategory(id);
      await loadData();
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar categoría. Asegúrate de que no tenga gastos asociados.');
    }
  };

  const handleCreateSubcategory = async () => {
    if (!selectedCategory) return;
    try {
      await api.createSubcategory({
        category_id: selectedCategory.id,
        name: subcategoryFormData.name,
        display_order: subcategories.length,
      });
      setSubcategoryFormData({ name: '' });
      setShowSubcategoryForm(false);
      await loadSubcategories(selectedCategory.id);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      alert('Error al crear subcategoría');
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory || !selectedCategory) return;
    try {
      await api.updateSubcategory(editingSubcategory.id, {
        category_id: selectedCategory.id,
        name: subcategoryFormData.name,
        display_order: editingSubcategory.display_order,
      });
      setEditingSubcategory(null);
      setSubcategoryFormData({ name: '' });
      setShowSubcategoryForm(false);
      await loadSubcategories(selectedCategory.id);
    } catch (error) {
      console.error('Error updating subcategory:', error);
      alert('Error al actualizar subcategoría');
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta subcategoría? No se puede eliminar si tiene gastos asociados.')) {
      return;
    }
    try {
      await api.deleteSubcategory(id);
      if (selectedCategory) {
        await loadSubcategories(selectedCategory.id);
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('Error al eliminar subcategoría. Asegúrate de que no tenga gastos asociados.');
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({ name: category.name, icon: category.icon || '' });
    setShowCategoryForm(true);
  };

  const startEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({ name: subcategory.name });
    setShowSubcategoryForm(true);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditingSubcategory(null);
    setCategoryFormData({ name: '', icon: '' });
    setSubcategoryFormData({ name: '' });
    setShowCategoryForm(false);
    setShowSubcategoryForm(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl p-8">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Gestionar Categorías</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Categories Panel */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => {
                  cancelEdit();
                  setShowCategoryForm(true);
                }}
                className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
              >
                + Nueva Categoría
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCategory?.id === cat.id
                      ? 'bg-emerald-50 border-2 border-emerald-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon || '📂'}</span>
                      <span className="font-medium text-gray-800">{cat.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditCategory(cat);
                        }}
                        className="text-gray-400 hover:text-emerald-600"
                        aria-label="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                        aria-label="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subcategories Panel */}
          <div className="flex-1 flex flex-col">
            {selectedCategory ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {selectedCategory.icon} {selectedCategory.name}
                  </h3>
                  <button
                    onClick={() => {
                      cancelEdit();
                      setShowSubcategoryForm(true);
                    }}
                    className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                  >
                    + Nueva Subcategoría
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-800">{sub.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditSubcategory(sub)}
                          className="text-gray-400 hover:text-emerald-600"
                          aria-label="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSubcategory(sub.id)}
                          className="text-gray-400 hover:text-red-600"
                          aria-label="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Selecciona una categoría para ver sus subcategorías
              </div>
            )}
          </div>
        </div>

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: Casa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono (emoji)
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.icon}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: 🏠"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                    className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subcategory Form Modal */}
        {showSubcategoryForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingSubcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={subcategoryFormData.name}
                    onChange={(e) => setSubcategoryFormData({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: Alquiler Depa"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingSubcategory ? handleUpdateSubcategory : handleCreateSubcategory}
                    className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    {editingSubcategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

