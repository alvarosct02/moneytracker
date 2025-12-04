import db from './database';

// Migration: Add currency column to expenses table
try {
  // Check if currency column exists
  const tableInfo = db.prepare("PRAGMA table_info(expenses)").all() as Array<{ name: string }>;
  const hasCurrency = tableInfo.some(col => col.name === 'currency');

  if (!hasCurrency) {
    console.log('🔄 Migrating: Adding currency column...');
    db.exec(`
      ALTER TABLE expenses ADD COLUMN currency TEXT NOT NULL DEFAULT 'PEN';
    `);
    console.log('✅ Migration completed: currency column added');
  } else {
    console.log('✅ Currency column already exists');
  }
} catch (error) {
  console.error('❌ Migration error:', error);
}

