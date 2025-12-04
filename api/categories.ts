import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    const getDb = (await import('./db/database.js')).default;
    const db = await getDb();
    
    switch (req.method) {
      case 'GET':
        return handleGet(req, res, db);
      case 'POST':
        return handlePost(req, res, db);
      case 'PUT':
        return handlePut(req, res, db);
      case 'DELETE':
        return handleDelete(req, res, db);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in categories handler:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: errorMessage
    });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse, db: any) {
  try {
    const categories = await db.query(
      'SELECT * FROM categories ORDER BY display_order, name'
    );
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error in handleGet:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch categories', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

async function handlePost(req: VercelRequest, res: VercelResponse, db: any) {
  try {
    const { name, icon, display_order } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await db.run(
      `INSERT INTO categories (name, icon, display_order)
       VALUES (?, ?, ?)`,
      [name, icon || null, display_order || 0]
    );

    const category = await db.get('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid]);
    return res.status(201).json(category);
  } catch (error) {
    console.error('Error in handlePost:', error);
    return res.status(500).json({ 
      error: 'Failed to create category', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

async function handlePut(req: VercelRequest, res: VercelResponse, db: any) {
  try {
    const { id } = req.query;
    const { name, icon, display_order } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    await db.execute(
      `UPDATE categories 
       SET name = ?, icon = ?, display_order = ? 
       WHERE id = ?`,
      [name, icon || null, display_order || 0, id]
    );

    const category = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error('Error in handlePut:', error);
    return res.status(500).json({ 
      error: 'Failed to update category', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

async function handleDelete(req: VercelRequest, res: VercelResponse, db: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    // Check if category has expenses
    const expenses = await db.query(
      'SELECT COUNT(*) as count FROM expenses WHERE category_id = ?',
      [id]
    );

    const count = typeof expenses[0]?.count === 'string' 
      ? parseInt(expenses[0].count, 10) 
      : expenses[0]?.count || 0;

    if (count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing expenses' 
      });
    }

    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error in handleDelete:', error);
    return res.status(500).json({ 
      error: 'Failed to delete category', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

