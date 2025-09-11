import { Router } from 'express';
const router = Router();
import QRCode from 'qrcode';

// POST /api/qr/generate
router.post('/generate', async (req, res) => {
  // Generar QR para retiro y mostrarlo
});

export default router;