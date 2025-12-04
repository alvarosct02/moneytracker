import Database from 'better-sqlite3';
import { Pool, Client } from 'pg';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Check if PostgreSQL is configured
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// PostgreSQL connection pool
let pgPool: Pool | null = null;

// SQLite database instance
let sqliteDb: Database.Database | null = null;

// Database interface to abstract SQLite and PostgreSQL
export interface DatabaseAdapter {
  query(sql: string, params?: any[]): Promise<any[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  get(sql: string, params?: any[]): Promise<any>;
  run(sql: string, params?: any[]): Promise<{ lastInsertRowid?: number | bigint }>;
}

// Helper function to convert SQLite syntax to PostgreSQL
function convertSQLiteToPostgreSQL(sql: string, params?: any[]): { sql: string; params?: any[] } {
  let pgSql = sql
    .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
    .replace(/REAL/g, 'NUMERIC')
    .replace(/TEXT/g, 'VARCHAR(255)')
    .replace(/CREATE INDEX IF NOT EXISTS/g, 'CREATE INDEX IF NOT EXISTS');

  // Convert ? placeholders to $1, $2, etc.
  if (params && params.length > 0) {
    let paramIndex = 1;
    pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
  }

  return { sql: pgSql, params };
}

// PostgreSQL adapter
class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    const { sql: pgSql, params: pgParams } = convertSQLiteToPostgreSQL(sql, params);
    const result = await this.pool.query(pgSql, pgParams);
    return result.rows;
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    const { sql: pgSql, params: pgParams } = convertSQLiteToPostgreSQL(sql, params);
    await this.pool.query(pgSql, pgParams);
  }

  async get(sql: string, params?: any[]): Promise<any> {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  }

  async run(sql: string, params?: any[]): Promise<{ lastInsertRowid?: number | bigint }> {
    // For INSERT, we need to return the inserted ID
    if (sql.trim().toUpperCase().startsWith('INSERT')) {
      const { sql: pgSql, params: pgParams } = convertSQLiteToPostgreSQL(sql, params);
      const result = await this.pool.query(pgSql + ' RETURNING id', pgParams);
      return { lastInsertRowid: result.rows[0]?.id };
    }
    await this.execute(sql, params);
    return {};
  }
}

// SQLite adapter wrapper
class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    const stmt = this.db.prepare(sql);
    return stmt.all(...(params || [])) as any[];
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    this.db.exec(sql);
  }

  async get(sql: string, params?: any[]): Promise<any> {
    const stmt = this.db.prepare(sql);
    return stmt.get(...(params || [])) || null;
  }

  async run(sql: string, params?: any[]): Promise<{ lastInsertRowid?: number | bigint }> {
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...(params || []));
    return { lastInsertRowid: result.lastInsertRowid };
  }

}

let dbAdapter: DatabaseAdapter | null = null;

async function getDatabase(): Promise<DatabaseAdapter> {
  if (dbAdapter) {
    return dbAdapter;
  }

  // Use PostgreSQL if available
  if (postgresUrl) {
    try {
      console.log('🔌 Connecting to PostgreSQL...');
      pgPool = new Pool({
        connectionString: postgresUrl,
        ssl: postgresUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
      });
      
      dbAdapter = new PostgreSQLAdapter(pgPool);
      console.log('✅ Connected to PostgreSQL');
      
      // Initialize schema
      await initializePostgreSQLSchema();
      
      if (!dbAdapter) {
        throw new Error('Database not initialized');
      }
      
      return dbAdapter;
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error);
      console.log('⚠️ Falling back to SQLite...');
    }
  }

  // Fallback to SQLite
  try {
    console.log('🔌 Connecting to SQLite...');
    const isVercel = process.env.VERCEL === '1';
    const dbDir = isVercel ? '/tmp' : join(process.cwd(), 'db');
    const dbPath = join(dbDir, 'expenses.db');

    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
      console.log(`✅ Database directory created: ${dbDir}`);
    }

    sqliteDb = new Database(dbPath);
    console.log(`✅ Connected to SQLite: ${dbPath}`);
    
    dbAdapter = new SQLiteAdapter(sqliteDb);
    
    // Initialize schema
    initializeSQLiteSchema();
    
    if (!dbAdapter) {
      throw new Error('Database not initialized');
    }
    
    return dbAdapter;
  } catch (error) {
    console.error('❌ Failed to connect to SQLite:', error);
    throw error;
  }
}

async function initializePostgreSQLSchema() {
  if (!pgPool) return;
  
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount NUMERIC NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'PEN',
        category VARCHAR(255) NOT NULL,
        subcategory VARCHAR(255) NOT NULL,
        owner VARCHAR(255) NOT NULL,
        description TEXT,
        date VARCHAR(255) NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_category ON expenses(category);
      CREATE INDEX IF NOT EXISTS idx_subcategory ON expenses(subcategory);
      CREATE INDEX IF NOT EXISTS idx_owner ON expenses(owner);
    `);
    console.log('✅ PostgreSQL schema initialized');
    
    // Check if currency column exists (migration)
    const columns = await pgPool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'expenses' AND column_name = 'currency'
    `);
    
    if (columns.rows.length === 0) {
      console.log('🔄 Migrating: Adding currency column...');
      await pgPool.query(`ALTER TABLE expenses ADD COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'PEN'`);
      console.log('✅ Migration completed: currency column added');
    }
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL schema:', error);
    throw error;
  }
}

function initializeSQLiteSchema() {
  if (!sqliteDb) return;
  
  try {
    sqliteDb.exec(`
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
    console.log('✅ SQLite schema initialized');
    
    // Run migrations
    try {
      const tableInfo = sqliteDb.prepare("PRAGMA table_info(expenses)").all() as Array<{ name: string }>;
      const hasCurrency = tableInfo.some(col => col.name === 'currency');
      
      if (!hasCurrency) {
        console.log('🔄 Migrating: Adding currency column...');
        sqliteDb.exec(`ALTER TABLE expenses ADD COLUMN currency TEXT NOT NULL DEFAULT 'PEN'`);
        console.log('✅ Migration completed: currency column added');
      }
    } catch (migrationError) {
      console.warn('⚠️ Migration warning:', migrationError);
    }
  } catch (schemaError) {
    console.error('❌ Failed to initialize SQLite schema:', schemaError);
    throw schemaError;
  }
}

// Export a function that returns a promise
export default async function getDb() {
  return await getDatabase();
};
