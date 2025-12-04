// Script to manually run the seed
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
try {
  // Try to load .env.local from project root
  const envPath = join(process.cwd(), '..', '.env.local');
  if (existsSync(envPath)) {
    config({ path: envPath });
    console.log('✅ Loaded .env.local from project root');
  } else {
    // Try from api directory
    const envPathApi = join(process.cwd(), '.env.local');
    if (existsSync(envPathApi)) {
      config({ path: envPathApi });
      console.log('✅ Loaded .env.local from api directory');
    } else {
      console.log('ℹ️  No .env.local found, using environment variables');
    }
  }
} catch (error) {
  console.warn('⚠️ Could not load .env.local:', error);
}

import getDb from './database.js';
import { seedCategories } from './seed.js';

async function runSeed() {
  try {
    console.log('🌱 Starting seed...');
    const db = await getDb();
    await seedCategories(db);
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();

