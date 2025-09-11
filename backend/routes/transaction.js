import { Router } from 'express';
const router = Router(); // This is a dependency to create the routes

import { calculateBreakdown } from '../utils/calculations.js';

import { simulateOpenPayments } from '../utils/openPayments';
import { v4 as uuidv4 } from 'uuid';

// POST /api/transactions/calculate
router.post('/calculate', (req, res) => {
    calculateBreakdown();
  // Tu lógica de calculadora aquí
});

// POST /api/transactions/send
router.post('/send', async (req, res) => {
  // Tu lógica de envío de dinero aquí
});