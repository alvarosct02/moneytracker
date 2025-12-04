import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Expense } from '../types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const expenseId = id ? parseInt(id as string) : null;

  if (!expenseId || isNaN(expenseId)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    // Import database lazily
    const getDb = (await import('../db/database.js')).default;
    const db = await getDb();
    
    switch (req.method) {
      case 'PUT':
        return handlePut(req, res, expenseId, db);
      case 'DELETE':
        return handleDelete(req, res, expenseId, db);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in handler:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: errorMessage
    });
  }
}

async function handlePut(req: VercelRequest, res: VercelResponse, id: number, db: any) {
  try {
    const { amount, currency, category, subcategory, owner, description, date } = req.body;

    if (currency && currency !== 'PEN' && currency !== 'USD') {
      return res.status(400).json({ error: 'Invalid currency. Must be PEN or USD' });
    }

    // Check if expense exists
    const existing = await db.get('SELECT * FROM expenses WHERE id = ?', [id]) as Expense | null;
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }
    if (currency !== undefined) {
      updates.push('currency = ?');
      params.push(currency);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (subcategory !== undefined) {
      updates.push('subcategory = ?');
      params.push(subcategory);
    }
    if (owner !== undefined) {
      updates.push('owner = ?');
      params.push(owner);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description || null);
    }
    if (date !== undefined) {
      updates.push('date = ?');
      params.push(date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(query, params);

    const expense = await db.get('SELECT * FROM expenses WHERE id = ?', [id]) as Expense;
    return res.status(200).json(expense);
  } catch (error) {
    console.error('Error in handlePut:', error);
    return res.status(500).json({ 
      error: 'Failed to update expense', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

async function handleDelete(req: VercelRequest, res: VercelResponse, id: number, db: any) {
  try {
    const existing = await db.get('SELECT * FROM expenses WHERE id = ?', [id]) as Expense | null;
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await db.execute('DELETE FROM expenses WHERE id = ?', [id]);
    return res.status(204).end();
  } catch (error) {
    console.error('Error in handleDelete:', error);
    return res.status(500).json({ 
      error: 'Failed to delete expense', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}
