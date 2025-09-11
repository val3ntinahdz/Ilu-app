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

// import { v4 as uuidv4 } from 'uuid';

// function simulateOpenPayments(senderWallet, receiverWallet, amount) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const pagoId = `OP_${uuidv4().slice(0, 8).toUpperCase()}`;
//       resolve({
//         id: pagoId,
//         status: 'COMPLETED',
//         senderWallet,
//         receiverWallet,
//         amount,
//         timestamp: new Date().toISOString(),
//         steps: [
//           { step: 'Wallet Discovery', status: 'COMPLETED' },
//           { step: 'Create Incoming Payment', status: 'COMPLETED' },
//           { step: 'Get Quote', status: 'COMPLETED' },
//           { step: 'Grant Authorization', status: 'COMPLETED' },
//           { step: 'Create Outgoing Payment', status: 'COMPLETED' }
//         ]
//       });
//     }, 2000);
//   });
// }

// export default { simulateOpenPayments };

// // Prueba de la función
// async function probarOpenPayments() {
//   console.log('Iniciando prueba de OpenPayments...');
//   try {
//     const resultado = await simulateOpenPayments(
//       'sender_wallet_123',
//       'receiver_wallet_456',
//       200
//     );
//     console.log('Resultado de OpenPayments:');
//     console.log(JSON.stringify(resultado, null, 2));
//   } catch (error) {
//     console.error('Error en la prueba:', error);
//   }
// }

// // Ejecutar prueba si se llama directamente
// if (require.main === module) {
//   probarOpenPayments();
// }


// utils/openPayments.js
import { createAuthenticatedClient, isFinalizedGrant } from '@interledger/open-payments';
import { readFileSync } from 'fs';
import path from 'path';

// Cache de clientes para evitar recrear
const clients = new Map();

async function getClient(userId) {
  if (clients.has(userId)) {
    return clients.get(userId);
  }

  const users = JSON.parse(readFileSync('./data/users.json'));
  console.log("Users in json: ", users);

  const user = users[userId];

  console.log("Extracted user", user);
  
  const client = await createAuthenticatedClient({
    walletAddressUrl: user.walletAddress,
    privateKey: user.privateKeyPath,
    keyId: user.keyId
  });

  clients.set(userId, client);
  return client;
}


async function getWalletInfo(userId) {
  const client = await getClient(userId);
  const users = JSON.parse(readFileSync(path.join('./data/users.json')));
  
  return await client.walletAddress.get({
    url: users[userId].walletAddress
  });
}

async function createIncomingPayment(receiverId, amount) {
  const client = await getClient(receiverId);
  const receivingWallet = await getWalletInfo(receiverId);
  
  // Obtener grant para incoming payment
  const incomingPaymentGrant = await client.grant.request(
    { url: receivingWallet.authServer },
    {
      access_token: {
        access: [{
          type: "incoming-payment",
          actions: ["read", "complete", "create"]
        }]
      }
    }
  );

  // Crear incoming payment
  const incomingPayment = await client.incomingPayment.create(
    {
      url: receivingWallet.resourceServer,
      accessToken: incomingPaymentGrant.access_token.value
    },
    {
      walletAddress: receivingWallet.id,
      incomingAmount: {
        assetCode: receivingWallet.assetCode,
        assetScale: receivingWallet.assetScale,
        value: (amount * Math.pow(10, receivingWallet.assetScale)).toString()
      }
    }
  );
  
  return incomingPayment;
}

async function createQuote(senderId, receiver, amount) {
  const client = await getClient(senderId);
  const sendingWallet = await getWalletInfo(senderId);
  
  // Grant para quote
  const quoteGrant = await client.grant.request(
    { url: sendingWallet.authServer },
    {
      access_token: {
        access: [{
          type: "quote",
          actions: ["create", "read"]
        }]
      }
    }
  );

  // Crear quote
  const quote = await client.quote.create(
    {
      url: sendingWallet.resourceServer,
      accessToken: quoteGrant.access_token.value
    },
    {
      walletAddress: sendingWallet.id,
      receiver: receiver,
      method: "ilp"
    }
  );
  
  return quote;
}

async function requestOutgoingPaymentGrant(senderId, quote) {
  const client = await getClient(senderId);
  const sendingWallet = await getWalletInfo(senderId);
  
  const outgoingPaymentGrant = await client.grant.request(
    { url: sendingWallet.authServer },
    {
      access_token: {
        access: [{
          type: "outgoing-payment",
          actions: ["read", "create"],
          limits: {
            debitAmount: {
              assetCode: quote.debitAmount.assetCode,
              assetScale: quote.debitAmount.assetScale,
              value: quote.debitAmount.value
            }
          },
          identifier: sendingWallet.id
        }]
      },
      interact: {
        start: ["redirect"]
      }
    }
  );
  
  return outgoingPaymentGrant;
}

async function completeOutgoingPayment(senderId, grantContinueUrl, grantAccessToken, quoteId) {
  const client = await getClient(senderId);
  const sendingWallet = await getWalletInfo(senderId);
  
  // Continuar grant
  const finalizedGrant = await client.grant.continue({
    url: grantContinueUrl,
    accessToken: grantAccessToken
  });

  if (!isFinalizedGrant(finalizedGrant)) {
    throw new Error('Grant no finalizado correctamente');
  }

  // Crear outgoing payment
  const outgoingPayment = await client.outgoingPayment.create(
    {
      url: sendingWallet.resourceServer,
      accessToken: finalizedGrant.access_token.value
    },
    {
      walletAddress: sendingWallet.id,
      quoteId: quoteId
    }
  );
  
  return outgoingPayment;
}


async function sendPayment(senderId, receiverId, amount) {
  try {
    console.log(`Iniciando pago: ${senderId} -> ${receiverId}, $${amount}`);
    
    // Paso 1: Crear incoming payment
    const incomingPayment = await createIncomingPayment(receiverId, amount);
    console.log('Incoming payment creado');
    
    // Paso 2: Crear quote
    const quote = await createQuote(senderId, incomingPayment.id, amount);
    console.log('Quote creado');
    
    // Paso 3: Solicitar grant para outgoing payment
    const outgoingPaymentGrant = await requestOutgoingPaymentGrant(senderId, quote);
    console.log('Grant solicitado');
    
    return {
      success: true,
      status: 'PENDING_AUTHORIZATION',
      grantUrl: outgoingPaymentGrant.interact.redirect,
      grantContinueUrl: outgoingPaymentGrant.continue.uri,
      grantAccessToken: outgoingPaymentGrant.continue.access_token.value,
      quote,
      incomingPayment,
      message: 'Usuario debe autorizar el pago en la URL proporcionada'
    };
    
  } catch (error) {
    console.error('Error en sendPayment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function completePayment(senderId, grantContinueUrl, grantAccessToken, quoteId) {
  try {
    const outgoingPayment = await completeOutgoingPayment(
      senderId, 
      grantContinueUrl, 
      grantAccessToken, 
      quoteId
    );
    
    return {
      success: true,
      status: 'COMPLETED',
      outgoingPayment,
      paymentId: outgoingPayment.id
    };
    
  } catch (error) {
    console.error('Error completando pago:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// En lugar de module.exports = { ... }
export {
  getClient,
  getWalletInfo,
  createIncomingPayment,
  createQuote,
  requestOutgoingPaymentGrant,
  completeOutgoingPayment,
  sendPayment,
  completePayment
};
// async function createIncomingPayment(receiverId, amount) {
//   const client = await getClient(receiverId);
//   const users = JSON.parse(readFileSync('./data/users.json'));
  
//   // lógica específica...
//   return incomingPayment;
// }

// async function createQuote(senderId, receiver, amount) {
//   const client = await getClient(senderId);
//   // lógica específica...
//   return quote;
// }

// async function sendPayment(senderId, receiverId, amount) {
//   try {
//     const incomingPayment = await createIncomingPayment(receiverId, amount);
//     const quote = await createQuote(senderId, incomingPayment.id, amount);
//     // continúa el flujo...
    
//     return { success: true, quote, incomingPayment };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }

// export default {
//   getClient,
//   createIncomingPayment,
//   createQuote, 
//   sendPayment
// };

