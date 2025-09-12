import { Router } from 'express';
import {
  sendPayment,
  completePayment, 
  generateIABudget,
  calculateBreakdown
} from '../controllers/transactionController.js';

const router = Router();

router.post('/send', sendPayment); // route to send payment
router.post('/complete', completePayment);  // complete pending payments
router.post('/ia-budget', generateIABudget); // generate the AI budget
router.post('/calculate-breakdown', calculateBreakdown); // calculate transaction breakdown!

export default router;