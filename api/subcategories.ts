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
    console.error('Error in subcategories handler:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: errorMessage
    });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse, db: any) {
  try {
    const { category_id } = req.query;

    let query = `
      SELECT s.*, c.name as category_name 
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
    `;
    const params: any[] = [];

    if (category_id) {
      query += ' WHERE s.category_id = ?';
      params.push(category_id);
    }

    query += ' ORDER BY s.display_order, s.name';

    const subcategories = await db.query(query, params);
    return res.status(200).json(subcategories);
  } catch (error) {
    console.error('Error in handleGet:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch subcategories', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

async function handlePost(req: VercelRequest, res: VercelResponse, db: any) {
  try {
    const { category_id, name, display_order } = req.body;

    if (!category_id || !name) {
      return res.status(400).json({ error: 'Category ID and name are required' });
    }

    const result = await db.run(
      `INSERT INTO subcategories (category_id, name, display_order)
       VALUES (?, ?, ?)`,
      [category_id, name, display_order || 0]
    );

    const subcategory = await db.get('SELECT * FROM subcategories WHERE id = ?', [result.lastInsertRowid]);
    return res.status(201).json(subcategory);
  } catch (error) {
    console.error('Error in handlePost:', error);
    return res.status(500).json({ 
      error: 'Failed to create subcategory', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

async function handlePut(req: VercelRequest, res: VercelResponse, db: any) {
  try {
    const { id } = req.query;
    const { category_id, name, display_order } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Subcategory ID is required' });
    }

    if (!category_id || !name) {
      return res.status(400).json({ error: 'Category ID and name are required' });
    }

    await db.execute(
      `UPDATE subcategories 
       SET category_id = ?, name = ?, display_order = ? 
       WHERE id = ?`,
      [category_id, name, display_order || 0, id]
    );

    const subcategory = await db.get('SELECT * FROM subcategories WHERE id = ?', [id]);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    return res.status(200).json(subcategory);
  } catch (error) {
    console.error('Error in handlePut:', error);
    return res.status(500).json({ 
      error: 'Failed to update subcategory', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

async function handleDelete(req: VercelRequest, res: VercelResponse, db: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Subcategory ID is required' });
    }

    // Check if subcategory has expenses
    const expenses = await db.query(
      'SELECT COUNT(*) as count FROM expenses WHERE subcategory_id = ?',
      [id]
    );

    const count = typeof expenses[0]?.count === 'string' 
      ? parseInt(expenses[0].count, 10) 
      : expenses[0]?.count || 0;

    if (count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete subcategory with existing expenses' 
      });
    }

    await db.execute('DELETE FROM subcategories WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error in handleDelete:', error);
    return res.status(500).json({ 
      error: 'Failed to delete subcategory', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

