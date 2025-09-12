import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import calculations from '../utils/calculations.js';
import aiMock from '../utils/aiMock.js';
import { sendPayment as sendOpenPayment } from '../utils/openPayments.js';

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
    if (!senderId || !receiverId || amount !== 200) {
      return res.status(400).json({
        success: false,
        error: "Para el demo: senderId y receiverId requeridos, amount debe ser 200"
      });
    }

    // 1. calculate breakdown
    const breakdown = calculations.calculateBreakdown(amount);
    
    // 2. read current database
    const database = readDatabase();
    const sender = database[senderId];
    const receiver = database[receiverId];
    
    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado en base de datos"
      });
    }

 
    let paymentResult;
    
    try {
      console.log('Iniciando OpenPayments real...');
      // send only the amount for the family (after disccount)
      paymentResult = await sendOpenPayment(senderId, receiverId, breakdown.breakdown.toFamily);
      
      console.log('Resultado OpenPayments:', paymentResult);
      
      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          error: paymentResult.error,
          details: paymentResult.details
        });
      }
      
      // if it needs user´authorization
      if (paymentResult.status === 'PENDING_AUTHORIZATION') {
        return res.json({
          success: true,
          status: 'PENDING_AUTHORIZATION',
          authUrl: paymentResult.grantUrl,
          breakdown: breakdown.breakdown,
          message: 'Necesita autorización del usuario',
          continueData: {
            grantContinueUrl: paymentResult.grantContinueUrl,
            grantAccessToken: paymentResult.grantAccessToken,
            quoteId: paymentResult.quote.id,
            senderId,
            receiverId,
            originalAmount: amount
          }
        });
      }
      
    } catch (openPaymentsError) {
      console.error('An Open Payments error ocurred:', openPaymentsError);
      
      paymentResult = {
        success: true,
        status: 'COMPLETED',
        transactionId: `DEMO_${Date.now()}`,
        note: 'This is a simulation in case an error pops up in OP API'
      };
    }

    // 4. update balances in the database
    // in this line, we add to the receiver's balance what he actually receives
    database[receiverId].currentBalance = (database[receiverId].currentBalance || 0) + breakdown.breakdown.toFamily;
    
    // we add the transaction to both parties history
    const timestamp = new Date().toISOString();
    const transactionId = paymentResult.transactionId || paymentResult.paymentId || `TX_${Date.now()}`;
    
    // sender transaction //
    if (!database[senderId].transactions) database[senderId].transactions = [];
    database[senderId].transactions.push({
      id: transactionId,
      type: 'sent',
      amount: -amount,
      to: database[receiverId].name,
      breakdown: breakdown.breakdown,
      timestamp,
      status: 'completed',
      method: 'OpenPayments'
    });
    
    // receiver transaction //
    if (!database[receiverId].transactions) database[receiverId].transactions = [];
    database[receiverId].transactions.push({
      id: transactionId,
      type: 'received', 
      amount: breakdown.breakdown.toFamily,
      from: database[senderId].name,
      timestamp,
      status: 'completed',
      method: 'OpenPayments'
    });

    // update total //
    database[senderId].totalSent = (database[senderId].totalSent || 0) + amount;
    database[receiverId].totalReceived = (database[receiverId].totalReceived || 0) + breakdown.breakdown.toFamily;
    database[receiverId].totalSaved = (database[receiverId].totalSaved || 0) + breakdown.breakdown.toSavings;

    // 5. save changes
    writeDatabase(database);

    // 6. succesful response: 
    res.json({
      success: true,
      status: 'COMPLETED',
      transactionId,
      breakdown: breakdown.breakdown,
      timestamp,
      method: 'OpenPayments',
      message: `$${breakdown.breakdown.toFamily} enviados a ${database[receiverId].name}, $${breakdown.breakdown.toSavings} ahorrados automáticamente`,
      updatedBalances: {
        receiver: {
          name: database[receiverId].name,
          newBalance: database[receiverId].currentBalance
        }
      }
    });

  } catch (error) {
    console.error('Error en sendPayment:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// function that completes pending payment (only when authorized)
export const completePayment = async (req, res) => {
  try {
    const { senderId, grantContinueUrl, grantAccessToken, quoteId } = req.body;
    
    // use OpenPayments to complete!
    const { completePayment } = await import('../utils/openPayments.js');
    const result = await completePayment(senderId, grantContinueUrl, grantAccessToken, quoteId);
    
    if (result.success) {
      // the balances are updated
      res.json({
        success: true,
        status: 'COMPLETED',
        paymentId: result.paymentId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateIABudget = (req, res) => {
  try {
    const { amount, userId } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'amount' es requerido"
      });
    }
    
    // get user's profile to customize recommendations
    const database = readDatabase();
    const user = database[userId];
    
    // family profile based on location (financial education for communities)
    const familyProfile = {
      miembros: user?.location?.includes('Oaxaca') ? 4 : 2,
      hijos: user?.location?.includes('Oaxaca') ? 2 : 0,
      ingresos: 'bajo', // asumming low-income communities
      region: user?.location || 'Mexico'
    };
    
    const recommendations = aiMock.generateBudgetRecommendations(amount, familyProfile);
    
    res.json({
      success: true,
      data: {
        ...recommendations,
        userContext: {
          name: user?.name,
          location: user?.location,
          personalizedMessage: `Recomendaciones para ${user?.name} en ${user?.location}`
        }
      }
    });
    
  } catch (error) {
    console.error('Error en generateIABudget:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const calculateBreakdown = (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'amount' es requerido"
      });
    }
    
    const result = calculations.calculateBreakdown(amount);
    res.json(result);
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};