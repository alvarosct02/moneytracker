// Script to seed categories and subcategories
// This can be run manually or as part of initialization

const CATEGORIES_DATA = [
  {
    name: 'Casa',
    icon: '🏠',
    subcategories: [
      'Alquiler Depa',
      'Mantenimiento',
      'Servicios',
      'Arreglos / Mejoras',
      'Supermercado',
      'Rappi',
      'Trabajadora del Hogar',
      'Otros',
      'Subtotal',
    ],
  },
  {
    name: 'Auto',
    icon: '🚗',
    subcategories: [
      'Gasolina',
      'Parking',
      'Mantenimiento',
      'Seguro',
      'Impuestos',
      'Limpieza',
      'Otros',
      'Subtotal',
    ],
  },
  {
    name: 'Arya',
    icon: '👶',
    subcategories: [
      'Educación',
      'Nanita',
      'Aseo Personal',
      'Ropa',
      'Salud',
      'Juguetes',
      'Cumpleaños',
      'Otros',
      'Subtotal',
    ],
  },
  {
    name: 'Familia',
    icon: '👨‍👩‍👧',
    subcategories: [
      'Viajes',
      'Salidas',
      'Citas',
      'Salud',
      'Cumple Álvaro',
      'Cumple Maryam',
      'Otros',
      'Subtotal',
    ],
  },
  {
    name: 'Inversiones',
    icon: '💰',
    subcategories: [
      'Ahorros',
      'Crédito Hipotecario',
      'Seguros',
      'Otros',
      'Subtotal',
    ],
  },
  {
    name: 'Alvaro',
    icon: '👨',
    subcategories: [
      'Papás',
      'Muñecos',
      'Tenis',
      'Ropa',
      'Belleza',
      'Trabajo',
      'Dulces',
      'Otros',
      'Subtotal',
    ],
  },
  {
    name: 'Maryam',
    icon: '👩',
    subcategories: [
      'Taxis',
      'Comida',
      'Belleza',
      'Ropa',
      'Teléfono',
      'Netflix',
      'Coquitas',
      'Otros',
      'Subtotal',
    ],
  },
];

export async function seedCategories(db: any) {
  try {
    console.log('🌱 Seeding categories and subcategories...');

    for (let i = 0; i < CATEGORIES_DATA.length; i++) {
      const categoryData = CATEGORIES_DATA[i];

      // Check if category already exists
      const existingCategory = await db.get(
        'SELECT * FROM categories WHERE name = ?',
        [categoryData.name]
      );

      let categoryId: number;

      if (existingCategory) {
        categoryId = existingCategory.id;
        console.log(`✅ Category "${categoryData.name}" already exists`);
      } else {
        // Create category
        const result = await db.run(
          `INSERT INTO categories (name, icon, display_order)
           VALUES (?, ?, ?)`,
          [categoryData.name, categoryData.icon, i]
        );
        categoryId = Number(result.lastInsertRowid);
        console.log(`✅ Created category: ${categoryData.name}`);
      }

      // Create subcategories
      for (let j = 0; j < categoryData.subcategories.length; j++) {
        const subcategoryName = categoryData.subcategories[j];

        // Check if subcategory already exists
        const existingSubcategory = await db.get(
          'SELECT * FROM subcategories WHERE category_id = ? AND name = ?',
          [categoryId, subcategoryName]
        );

        if (!existingSubcategory) {
          await db.run(
            `INSERT INTO subcategories (category_id, name, display_order)
             VALUES (?, ?, ?)`,
            [categoryId, subcategoryName, j]
          );
          console.log(`  ✅ Created subcategory: ${subcategoryName}`);
        }
      }
    }

    console.log('✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

