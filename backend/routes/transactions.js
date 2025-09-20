import { Router } from 'express';
import {
  sendPayment,

  // generateIABudget,
  // calculateBreakdown
} from '../controllers/transactionController.js';

const router = Router();

// send payment (with Open Payments flow implemented)
router.post('/send', sendPayment);

// router.post('/ia-budget', generateIABudget); // generate the AI budget
// router.post('/calculate-breakdown', calculateBreakdown); // calculate transaction breakdown!

export default router;