import { Router } from 'express';
const router = Router();

// GET /api/users/:id/dashboard
router.get('/:id/dashboard', (req, res) => {
  // Dashboard con métricas del usuario
  // - Total saved, received, sent
  // - Recent transactions
  // - Savings growth
});

// GET /api/users/:id/profile
router.get('/:id/profile', (req, res) => {
  // Información básica del usuario
});

export default router;