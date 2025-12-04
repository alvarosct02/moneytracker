import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from '../src/db/database';
import { Expense } from '../src/types';

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
    switch (req.method) {
      case 'PUT':
        return handlePut(req, res, expenseId);
      case 'DELETE':
        return handleDelete(req, res, expenseId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function handlePut(req: VercelRequest, res: VercelResponse, id: number) {
  try {
    const { amount, currency, category, subcategory, owner, description, date } = req.body;

    if (currency && currency !== 'PEN' && currency !== 'USD') {
      return res.status(400).json({ error: 'Invalid currency. Must be PEN or USD' });
    }

    // Check if expense exists
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as Expense | undefined;
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
    db.prepare(query).run(...params);

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as Expense;
    return res.status(200).json(expense);
  } catch (error) {
    console.error('Error in handlePut:', error);
    return res.status(500).json({ 
      error: 'Failed to update expense', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

function handleDelete(req: VercelRequest, res: VercelResponse, id: number) {
  try {
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as Expense | undefined;
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    return res.status(204).end();
  } catch (error) {
    console.error('Error in handleDelete:', error);
    return res.status(500).json({ 
      error: 'Failed to delete expense', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

