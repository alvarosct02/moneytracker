import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './src/db/database';
import { ExpenseSummary } from './src/types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current month start and end
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
    const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];

    // Get all expenses for current month
    const expenses = db
      .prepare('SELECT * FROM expenses WHERE date >= ? AND date <= ?')
      .all(monthStart, monthEnd) as Array<{
      amount: number;
      currency: 'PEN' | 'USD';
      category: string;
      subcategory: string;
      owner: string;
    }>;

    const summary: ExpenseSummary = {
      totalPEN: 0,
      totalUSD: 0,
      byCategory: {},
      bySubcategory: {},
      byOwner: {},
    };

    expenses.forEach((expense) => {
      // Totales por moneda
      if (expense.currency === 'PEN') {
        summary.totalPEN += expense.amount;
      } else {
        summary.totalUSD += expense.amount;
      }

      // Por categoría
      if (!summary.byCategory[expense.category]) {
        summary.byCategory[expense.category] = { PEN: 0, USD: 0 };
      }
      summary.byCategory[expense.category][expense.currency] += expense.amount;

      // Por subcategoría
      if (!summary.bySubcategory[expense.subcategory]) {
        summary.bySubcategory[expense.subcategory] = { PEN: 0, USD: 0 };
      }
      summary.bySubcategory[expense.subcategory][expense.currency] += expense.amount;

      // Por owner
      if (!summary.byOwner[expense.owner]) {
        summary.byOwner[expense.owner] = { PEN: 0, USD: 0 };
      }
      summary.byOwner[expense.owner][expense.currency] += expense.amount;
    });

    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

