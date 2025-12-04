import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Get database path - use /tmp in Vercel for writable storage
const isVercel = process.env.VERCEL === '1';
// In development, process.cwd() is already in the api/ directory
// In Vercel, we need to use /tmp
const dbDir = isVercel ? '/tmp' : join(process.cwd(), 'db');
const dbPath = join(dbDir, 'expenses.db');

// For Vercel, ensure /tmp exists (it should, but just in case)
if (isVercel && !existsSync('/tmp')) {
  console.warn('/tmp directory does not exist in Vercel environment');
}

// Ensure directory exists
if (!existsSync(dbDir)) {
  try {
    mkdirSync(dbDir, { recursive: true });
    console.log(`✅ Database directory created: ${dbDir}`);
  } catch (error) {
    console.error(`❌ Failed to create database directory: ${dbDir}`, error);
    throw error;
  }
}

let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  try {
    console.log(`🔌 Attempting to connect to database at: ${dbPath}`);
    console.log(`📁 Database directory exists: ${existsSync(dbDir)}`);
    console.log(`🌍 Vercel environment: ${isVercel}`);
    
    db = new Database(dbPath);
    console.log(`✅ Database connected: ${dbPath}`);
    
    // Initialize schema
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          currency TEXT NOT NULL DEFAULT 'PEN',
          category TEXT NOT NULL,
          subcategory TEXT NOT NULL,
          owner TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_date ON expenses(date);
        CREATE INDEX IF NOT EXISTS idx_category ON expenses(category);
        CREATE INDEX IF NOT EXISTS idx_subcategory ON expenses(subcategory);
        CREATE INDEX IF NOT EXISTS idx_owner ON expenses(owner);
      `);
      console.log('✅ Database schema initialized');
      
      // Run migrations
      try {
        const tableInfo = db.prepare("PRAGMA table_info(expenses)").all() as Array<{ name: string }>;
        const hasCurrency = tableInfo.some(col => col.name === 'currency');
        
        if (!hasCurrency) {
          console.log('🔄 Migrating: Adding currency column...');
          db.exec(`ALTER TABLE expenses ADD COLUMN currency TEXT NOT NULL DEFAULT 'PEN'`);
          console.log('✅ Migration completed: currency column added');
        }
      } catch (migrationError) {
        console.warn('⚠️ Migration warning:', migrationError);
      }
    } catch (schemaError) {
      console.error('❌ Failed to initialize database schema:', schemaError);
      throw schemaError;
    }
    
    return db;
  } catch (error) {
    console.error(`❌ Failed to connect to database: ${dbPath}`, error);
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : String(error);
    console.error('Error details:', errorDetails);
    throw error;
  }
}

export default getDatabase();
