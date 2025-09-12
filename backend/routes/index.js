import { Router } from 'express';
import userRoutes from './users.js';
import transactionRoutes from './transactions.js';

const router = Router();

// this is where we define the routes config:
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);

// health route to verify the port is running
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running!',
    timestamp: new Date().toISOString()
  });
});

export default router;