/////////////FUNCIONAMIENTO DE OPENPAYMENTS.JS/////////////
/////////DEBE TENER EL MISMO NOMBRE DE LA FUNCION EN EL FRONTEND/////////
/////////SE PIDEN 3 PARAMETROS: senderWallet, receiverWallet, amount/////////
/////////senderWallet: es la wallet del usuario que envia el pago/////////
/////////receiverWallet: es la wallet del usuario que recibe el pago/////////
/////////amount: es el monto del pago/////////
/////////SE DEVUELVE UN OBJETO CON LOS SIGUIENTES DATOS: id, status, 
///////// senderWallet, receiverWallet, amount, timestamp, steps/////////
/////////id: es el id del pago/////////
/////////status: es el estado del pago/////////
/////////senderWallet: es la wallet del usuario que envia el pago/////////
/////////receiverWallet: es la wallet del usuario que recibe el pago/////////
/////////amount: es el monto del pago/////////
/////////timestamp: es la fecha y hora del pago/////////
/////////steps: es el paso A paso el pago/////////
/////////status: es el estado del pago y pueden ser: COMPLETED, PENDING, FAILED/////////
/////////////////////////////////////////////////////

const { v4: uuidv4 } = require('uuid');

function simulateOpenPayments(senderWallet, receiverWallet, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pagoId = `OP_${uuidv4().slice(0, 8).toUpperCase()}`;
      resolve({
        id: pagoId,
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

// Prueba de la función
async function probarOpenPayments() {
  console.log('Iniciando prueba de OpenPayments...');
  try {
    const resultado = await simulateOpenPayments(
      'sender_wallet_123',
      'receiver_wallet_456',
      200
    );
    console.log('Resultado de OpenPayments:');
    console.log(JSON.stringify(resultado, null, 2));
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

// Ejecutar prueba si se llama directamente
if (require.main === module) {
  probarOpenPayments();
}