const { v4: uuidv4 } = require('uuid');

function simulateOpenPayments(senderWallet, receiverWallet, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const paymentId = `OP_${uuidv4().slice(0, 8).toUpperCase()}`;
      resolve({
        id: paymentId,
        status: 'COMPLETED',
        senderWallet,
        receiverWallet,
        amount,
        timestamp: new Date().toISOString(),
        steps: [
          { step: 'Wallet Discovery', status: 'COMPLETED' },
          { step: 'Create Incoming Payment', status: 'COMPLETED' },
          { step: 'Get Quote', status: 'COMPLETED' },
          { step: 'Grant Authorization', status: 'COMPLETED' },
          { step: 'Create Outgoing Payment', status: 'COMPLETED' }
        ]
      });
    }, 2000);
  });
}

module.exports = { simulateOpenPayments };