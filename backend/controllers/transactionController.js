import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import calculations from '../utils/calculations.js';
import { sendPayment as sendOpenPayment, completePaymentAfterAuth } from '../utils/openPayments.js';
// import aiMock from '../utils/aiMock.js';


// this function reads/extracts data from our json database
const readDatabase = () => {
  try {
    const data = readFileSync(path.resolve('./data/users.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return {};
  }
};


const writeDatabase = (data) => {
  try {
    writeFileSync(path.resolve('./data/users.json'), JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
  }
};


export const sendPayment = async (req, res) => {
  try {
    
    const { senderId, receiverId, amount } = req.body;
    
    // validate data entry
    if (!senderId || !receiverId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "senderId, receiverId, amount son requeridos. Amount debe ser mayor a 0."
      });
    }

    // check if sender has sufficient balance
    const database = readDatabase();
    const sender = database[senderId];
    // get receiver data
    const receiver = database[receiverId];
    
    if (!sender) {
      return res.status(404).json({
        success: false,
        error: "Usuario remitente no encontrado en base de datos"
      });
    }
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: "Usuario destinatario no encontrado en base de datos"
      });
    }

    const senderBalance = sender.currentBalance || 0;
    if (senderBalance < amount) {
      return res.status(400).json({
        success: false,
        error: "Saldo insuficiente para realizar la transferencia"
      });
    }

    // 1. calculate breakdown
    const breakdown = calculations.calculateBreakdown(amount);
    
    
    
    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado en base de datos"
      });
    }
    
    
    try {
      console.log('Iniciando simulación de pago...');

      const paymentResult = await sendOpenPayment(senderId, receiverId, amount);
      
      if (paymentResult.success && paymentResult.requiresInteraction) {

        return res.json({
          success: true,
          status: 'PENDING_AUTHORIZATION',
          requiresInteraction: true,
          authorizationUrl: paymentResult.authorizationUrl,
          sender: senderId,
          receiver: receiverId,  
          amount: amount,
          breakdown: breakdown.breakdown,
          paymentDetails: {
            quoteId: paymentResult.quoteId,
            incomingPaymentId: paymentResult.incomingPaymentId,
            debitAmount: paymentResult.debitAmount,
            receiveAmount: paymentResult.receiveAmount,
            continueUri: paymentResult.continueUri,
            continueToken: paymentResult.continueToken
          },

          message: `Authorization required. The sender needs to approve the payment.`
        })
      }

      if (paymentResult.success && paymentResult.status === 'COMPLETED') {
        await updateDatabase(senderId, receiverId, amount, breakdown, paymentResult);


        return res.json({
          success: true,
          status: 'COMPLETED',
          transactionId: paymentResult.paymentId,
          breakdown: breakdown.breakdown,
          message: `Payment completed successfully`
        });

      }

      // When payment fails...
      return res.status(400).json({
        success: false,
        error: paymentResult.error || 'Payment failed',
        details: paymentResult.details
      });
      
    } catch (error) {
      console.error('Open Payments error:', error);

      return res.status(500).json({
        success: false,
        error: 'Payment processing failed',
        details: error.message
      });
    }

  } catch (error) {
    console.error('Error en sendPayment:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// This is a helper function to update database after the successful payment
async function updateDatabase(senderId, receiverId, amount, breakdown, paymentResult) {

  const database = readDatabase();

  // update balances
  database[senderId].currentBalance = (database[senderId].currentBalance) - amount;
  database[receiverId].currentBalance = (database[receiverId].currentBalance) + breakdown.breakdown.toFamily;

  // add transactions made
  const timestamp = new Date().toISOString();
  const transactionId = paymentResult.paymentId;

  // -------------------- sender transaction
  if (!database[senderId].transactions) database[senderId].transactions = [];

  database[senderId].transactions.push({
    id: transactionId,
    senderWalletAddress: database[senderId].walletAddress,
    type: 'sent',
    amount: amount,
    to: database[receiverId].name,
    breakdown: breakdown.breakdown,
    timestamp,
    status: 'completed',
  })

  // -------------------- receiver transaction
  if (!database[receiverId].transactions) database[receiverId].transactions = [];

  database[receiverId].transactions.push({
    id: transactionId,
    receiverWalletAddress: database[receiverId].walletAddress,
    type: 'received', 
    amount: breakdown.breakdown.toFamily,
    from: database[senderId].name,
    timestamp,
    status: 'completed',
  });


  // updating totals
  database[senderId].totalSent = (database[senderId].totalSent) + amount; // sender's
  database[receiverId].totalReceived = (database[receiverId].totalReceived) + breakdown.breakdown.toFamily; // receiver's
  database[receiverId].totalSaved = (database[receiverId].totalSaved) + breakdown.breakdown.toSavings;

  writeDatabase(database);

}

export const completePayment = async (req, res) => {
  try {
    const { senderId, receiverId, amount, quoteId, continueUri, continueToken } = req.body;
    
    console.log('=== COMPLETING PAYMENT AFTER AUTHORIZATION ===');
    console.log('Sender:', senderId);
    console.log('Receiver:', receiverId);
    console.log('Amount:', amount);
    console.log('Quote ID:', quoteId);
    
    // Validate required fields
    if (!senderId || !receiverId || !amount || !quoteId || !continueUri || !continueToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for payment completion'
      });
    }
    
    // Complete the payment in Open Payments
    const paymentResult = await completePaymentAfterAuth(
      senderId, 
      quoteId, 
      continueUri, 
      continueToken
    );
    
    console.log('Payment completion result:', paymentResult);
    
    if (paymentResult.success) {
      // Calculate breakdown for database update
      const breakdown = calculations.calculateBreakdown(amount);
      
      // Update database with completed payment
      await updateDatabase(senderId, receiverId, amount, breakdown, paymentResult);
      
      console.log('Database updated successfully');
      
      return res.json({
        success: true,
        status: 'COMPLETED',
        transactionId: paymentResult.paymentId,
        breakdown: breakdown.breakdown,
        message: 'Payment completed successfully after authorization'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: paymentResult.error || 'Failed to complete payment',
        details: paymentResult
      });
    }
    
  } catch (error) {
    console.error('Error in completePayment controller:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Error completing payment after authorization'
    });
  }
};


// ---------> TODO Function: check the payment status endpoint and query Open Payments system (for now, local database in json)


// AI & calculation features [TO BE IMPLEMENTED, COMMENTED FOR NOW]
  // export const generateIABudget = (req, res) => {
  //   try {
  //     const { amount, userId } = req.body;
      
  //     if (!amount) {
  //       return res.status(400).json({
  //         success: false,
  //         error: "El parámetro 'amount' es requerido"
  //       });
  //     }
      
  //     // get user's profile to customize recommendations
  //     const database = readDatabase();
  //     const user = database[userId];
      
  //     // family profile based on location (financial education for communities)
  //     const familyProfile = {
  //       miembros: user?.location?.includes('Oaxaca') ? 4 : 2,
  //       hijos: user?.location?.includes('Oaxaca') ? 2 : 0,
  //       ingresos: 'bajo', // asumming low-income communities
  //       region: user?.location || 'Mexico'
  //     };
      
  //     const recommendations = aiMock.generateBudgetRecommendations(amount, familyProfile);
      
  //     res.json({
  //       success: true,
  //       data: {
  //         ...recommendations,
  //         userContext: {
  //           name: user?.name,
  //           location: user?.location,
  //           personalizedMessage: `Recomendaciones para ${user?.name} en ${user?.location}`
  //         }
  //       }
  //     });
      
  //   } catch (error) {
  //     console.error('Error en generateIABudget:', error);
  //     res.status(500).json({ 
  //       success: false, 
  //       error: error.message 
  //     });
  //   }
  // };

  // export const calculateBreakdown = (req, res) => {
  //   try {
  //     const { amount } = req.body;
      
  //     if (!amount) {
  //       return res.status(400).json({
  //         success: false,
  //         error: "El parámetro 'amount' es requerido"
  //       });
  //     }
      
  //     const result = calculations.calculateBreakdown(amount);
  //     res.json(result);
      
  //   } catch (error) {
  //     res.status(500).json({ success: false, error: error.message });
  //   }
  // };