import { Pool } from 'pg';

// PostgreSQL connection pool
let pgPool: Pool | null = null;

// Database interface
export interface DatabaseAdapter {
  query(sql: string, params?: any[]): Promise<any[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  get(sql: string, params?: any[]): Promise<any>;
  run(sql: string, params?: any[]): Promise<{ lastInsertRowid?: number | bigint }>;
}

// Helper function to convert ? placeholders to PostgreSQL $1, $2, etc.
function convertToPostgreSQL(sql: string, params?: any[]): { sql: string; params?: any[] } {
  if (!params || params.length === 0) {
    return { sql };
  }

  let paramIndex = 1;
  const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  
  return { sql: pgSql, params };
}

// PostgreSQL adapter
class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    const { sql: pgSql, params: pgParams } = convertToPostgreSQL(sql, params);
    const result = await this.pool.query(pgSql, pgParams);
    return result.rows;
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    const { sql: pgSql, params: pgParams } = convertToPostgreSQL(sql, params);
    await this.pool.query(pgSql, pgParams);
  }

  async get(sql: string, params?: any[]): Promise<any> {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  }

  async run(sql: string, params?: any[]): Promise<{ lastInsertRowid?: number | bigint }> {
    // For INSERT, we need to return the inserted ID
    if (sql.trim().toUpperCase().startsWith('INSERT')) {
      const { sql: pgSql, params: pgParams } = convertToPostgreSQL(sql, params);
      const result = await this.pool.query(pgSql + ' RETURNING id', pgParams);
      return { lastInsertRowid: result.rows[0]?.id };
    }
    await this.execute(sql, params);
    return {};
  }
}

let dbAdapter: DatabaseAdapter | null = null;

async function getDatabase(): Promise<DatabaseAdapter> {
  if (dbAdapter) {
    return dbAdapter;
  }

  // Check if PostgreSQL is configured
  const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!postgresUrl) {
    throw new Error('❌ POSTGRES_URL or DATABASE_URL environment variable is required');
  }

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    pgPool = new Pool({
      connectionString: postgresUrl,
      ssl: postgresUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    });
    
    dbAdapter = new PostgreSQLAdapter(pgPool);
    console.log('✅ Connected to PostgreSQL');
    
    // Initialize schema
    await initializeSchema();
    
    // Seed categories and subcategories
    try {
      const { seedCategories } = await import('./seed.js');
      await seedCategories(dbAdapter);
    } catch (seedError) {
      console.warn('⚠️ Warning: Could not seed categories:', seedError);
    }
    
    if (!dbAdapter) {
      throw new Error('Database not initialized');
    }
    
    return dbAdapter;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

async function initializeSchema() {
  if (!pgPool) return;
  
  try {
    // Create categories table
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(10),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create subcategories table
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category_id, name)
      );
    `);

    // Create expenses table
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount NUMERIC NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'PEN',
        category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
        category VARCHAR(255) NOT NULL,
        subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE RESTRICT,
        subcategory VARCHAR(255) NOT NULL,
        owner VARCHAR(255) NOT NULL,
        description TEXT,
        date VARCHAR(255) NOT NULL
      );
    `);

    // Create basic indexes (always safe)
    await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_date ON expenses(date);`);
    await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_category ON expenses(category);`);
    await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_subcategory ON expenses(subcategory);`);
    await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_owner ON expenses(owner);`);
    
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

    // Check if category_id and subcategory_id columns exist (migration)
    const categoryIdColumn = await pgPool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'expenses' AND column_name = 'category_id'
    `);
    
    if (categoryIdColumn.rows.length === 0) {
      console.log('🔄 Migrating: Adding category_id and subcategory_id columns...');
      await pgPool.query(`ALTER TABLE expenses ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT`);
      await pgPool.query(`ALTER TABLE expenses ADD COLUMN subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE RESTRICT`);
      console.log('✅ Migration completed: category_id and subcategory_id columns added');
    }
    
    // Create indexes for category_id and subcategory_id (safe to run even if columns already exist)
    try {
      await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_category_id ON expenses(category_id);`);
      await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_subcategory_id ON expenses(subcategory_id);`);
    } catch (indexError) {
      // Index creation might fail if columns don't exist, but that's ok
      console.warn('⚠️ Could not create category indexes (columns may not exist yet):', indexError);
    }
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL schema:', error);
    throw error;
  }
}

// Export a function that returns a promise
export default async function getDb() {
  return await getDatabase();
};
