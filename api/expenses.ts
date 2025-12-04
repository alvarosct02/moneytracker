import type { VercelRequest, VercelResponse } from '@vercel/node';
import type Database from 'better-sqlite3';
import { Expense } from './types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Import database lazily
    const db = (await import('./db/database')).default;
    
    switch (req.method) {
      case 'GET':
        return handleGet(req, res, db);
      case 'POST':
        return handlePost(req, res, db);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in handler:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return res.status(500).json({ 
      error: 'Internal server error',
      details: errorMessage
    });
  }
}

function handleGet(req: VercelRequest, res: VercelResponse, db: Database.Database) {
  try {
    const { category, subcategory, owner } = req.query;

    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (subcategory) {
      query += ' AND subcategory = ?';
      params.push(subcategory);
    }
    if (owner) {
      query += ' AND owner = ?';
      params.push(owner);
    }

    query += ' ORDER BY date DESC, id DESC';

    const expenses = db.prepare(query).all(...params) as Expense[];
    return res.status(200).json(expenses);
  } catch (error) {
    console.error('Error in handleGet:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch expenses', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

function handlePost(req: VercelRequest, res: VercelResponse, db: Database.Database) {
  try {
    const { amount, currency, category, subcategory, owner, description, date } = req.body;

    if (!amount || !currency || !category || !subcategory || !owner || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (currency !== 'PEN' && currency !== 'USD') {
      return res.status(400).json({ error: 'Invalid currency. Must be PEN or USD' });
    }

    const stmt = db.prepare(`
      INSERT INTO expenses (amount, currency, category, subcategory, owner, description, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(amount, currency, category, subcategory, owner, description || null, date);
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid) as Expense;

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Error in handlePost:', error);
    return res.status(500).json({ 
      error: 'Failed to create expense', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

