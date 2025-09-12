import { Router } from 'express';
import { generateQR, validateQR } from '../controllers/qrController.js';

const router = Router();

// POST /api/qr/generate
router.post('/generate', generateQR);