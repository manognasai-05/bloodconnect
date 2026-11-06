import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, seedInitialData, db } from './backend/utils/databaseStore.js';
import authRoutes from './backend/routes/authRoutes.js';
import donorRoutes from './backend/routes/donorRoutes.js';
import requestRoutes from './backend/routes/requestRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';
import notificationRoutes from './backend/routes/notificationRoutes.js';
import donationRoutes from './backend/routes/donationRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Database connection / persistent memory store
  await initDatabase();

  // Public Platform Summary Stats (for homepage & landing without auth)
  app.get('/api/stats', async (req, res) => {
    try {
      const analytics = await db.getAnalytics();
      return res.json(analytics);
    } catch (err: any) {
      return res.status(500).json({ message: 'Error retrieving platform statistics' });
    }
  });

  // Reset/Re-seed Demo Data Endpoint
  app.post('/api/seed', async (req, res) => {
    try {
      await seedInitialData();
      return res.json({ message: 'Database reset and re-seeded with demo data successfully' });
    } catch (err: any) {
      return res.status(500).json({ message: 'Error re-seeding database', error: err.message });
    }
  });

  // Mount API Routers
  app.use('/api/auth', authRoutes);
  app.use('/api/donors', donorRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/donations', donationRoutes);

  // Serve static assets / Vite middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BloodConnect full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
