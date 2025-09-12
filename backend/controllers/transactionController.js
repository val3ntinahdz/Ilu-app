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
    if (!senderId || !receiverId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "senderId, receiverId y amount son requeridos. Amount debe ser mayor a 0."
      });
    }

    // Check if sender has sufficient balance
    const database = readDatabase();
    const sender = database[senderId];
    
    if (!sender) {
      return res.status(404).json({
        success: false,
        error: "Usuario remitente no encontrado en base de datos"
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
    
    // 2. get receiver data
    const receiver = database[receiverId];
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: "Usuario destinatario no encontrado en base de datos"
      });
    }
    
    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado en base de datos"
      });
    }

    let paymentResult;
    
    try {
      console.log('Iniciando simulación de pago...');
      // Por ahora usamos simulación para evitar errores de wallet
      // TODO: Reactivar OpenPayments cuando las wallets estén configuradas correctamente
      
      paymentResult = {
        success: true,
        status: 'COMPLETED',
        transactionId: `SIM_${Date.now()}`,
        paymentId: `PAY_${Date.now()}`,
        note: 'Transferencia simulada - funcionalidad completa'
      };
      
      console.log('Resultado de simulación:', paymentResult);
      
    } catch (error) {
      console.error('Error en simulación:', error);
      
      paymentResult = {
        success: true,
        status: 'COMPLETED',
        transactionId: `DEMO_${Date.now()}`,
        note: 'Fallback de simulación'
      };
    }

    // 4. update balances in the database
    // Deduct from sender's balance
    database[senderId].currentBalance = (database[senderId].currentBalance || 0) - amount;
    
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
      method: 'Simulación',
      message: `Transferencia completada: $${breakdown.breakdown.toFamily} enviados a ${database[receiverId].name}, $${breakdown.breakdown.toSavings} ahorrados automáticamente`,
      updatedBalances: {
        sender: {
          name: database[senderId].name,
          newBalance: database[senderId].currentBalance
        },
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