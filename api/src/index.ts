import express from 'express';
import cors from 'cors';
import expensesHandler from '../expenses';
import summaryHandler from '../summary';
import expensesIdHandler from '../handlers/expensesId';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Convert Express req/res to Vercel format
const adaptHandler = (handler: (req: VercelRequest, res: VercelResponse) => Promise<any>) => {
  return async (req: express.Request, res: express.Response) => {
    try {
      // Convert Express request to Vercel format
      const vercelReq = {
        ...req,
        query: { ...req.query, ...req.params },
        body: req.body,
        method: req.method,
        headers: req.headers,
      } as unknown as VercelRequest;

      const vercelRes = {
        ...res,
        status: (code: number) => {
          res.status(code);
          return vercelRes;
        },
        json: (data: any) => {
          res.json(data);
          return vercelRes;
        },
        end: () => {
          res.end();
          return vercelRes;
        },
        setHeader: (name: string, value: string) => {
          res.setHeader(name, value);
          return vercelRes;
        },
      } as unknown as VercelResponse;

      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
    }
  };
};

// Routes - support both /api/* (from Vite proxy) and direct routes
// Direct routes (for development)
app.get('/expenses', adaptHandler(expensesHandler));
app.post('/expenses', adaptHandler(expensesHandler));
app.put('/expenses/:id', adaptHandler(expensesIdHandler));
app.delete('/expenses/:id', adaptHandler(expensesIdHandler));
app.get('/summary', adaptHandler(summaryHandler));

// Routes with /api prefix (for Vite proxy)
app.get('/api/expenses', adaptHandler(expensesHandler));
app.post('/api/expenses', adaptHandler(expensesHandler));
app.put('/api/expenses/:id', adaptHandler(expensesIdHandler));
app.delete('/api/expenses/:id', adaptHandler(expensesIdHandler));
app.get('/api/summary', adaptHandler(summaryHandler));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use. Please stop the process using this port or change the port.`);
    console.error(`   You can kill the process with: lsof -ti:${port} | xargs kill -9`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

