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

  try {
    // Read the private key from the file
    const privateKey = readFileSync(user.privateKeyPath, 'utf8');
    
    const client = await createAuthenticatedClient({
      walletAddressUrl: user.walletAddress,
      privateKey: privateKey, // Pasar el contenido, no la ruta
      keyId: user.keyId
    });

    clients.set(userId, client);
    return client;
  } catch (error) {
    console.error(`Error creando cliente para ${userId}:`, error);
    throw error;
  }
}

async function getWalletInfo(userId) {
  const client = await getClient(userId);
  const users = JSON.parse(readFileSync(path.join('./data/users.json')));
  
  try {
    const walletInfo = await client.walletAddress.get({
      url: users[userId].walletAddress
    });
    console.log(`Wallet info for ${userId}:`, walletInfo);
    return walletInfo;
  } catch (error) {
    console.error(`Error obteniendo wallet info para ${userId}:`, error);
    throw error;
  }
}

async function createIncomingPayment(receiverId, amount) {
  try {
    const client = await getClient(receiverId);
    const receivingWallet = await getWalletInfo(receiverId);
    
    console.log(`Creating incoming payment for ${receiverId}, amount: ${amount}`);
    console.log('Receiving wallet info:', {
      id: receivingWallet.id,
      assetCode: receivingWallet.assetCode,
      assetScale: receivingWallet.assetScale
    });

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

    console.log('Incoming payment grant obtenido');

    // Calcular el valor correcto
    const scaledValue = Math.round(amount * Math.pow(10, receivingWallet.assetScale));
    
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
          value: scaledValue.toString()
        }
      }
    );
    
    console.log('Incoming payment creado:', incomingPayment.id);
    return incomingPayment;
  } catch (error) {
    console.error('Error en createIncomingPayment:', error);
    throw error;
  }
}

async function createQuote(senderId, receiver, amount) {
  try {
    const client = await getClient(senderId);
    const sendingWallet = await getWalletInfo(senderId);
    
    console.log(`Creating quote for sender ${senderId}`);
    console.log('Sending wallet info:', {
      id: sendingWallet.id,
      authServer: sendingWallet.authServer,
      resourceServer: sendingWallet.resourceServer
    });
    console.log('Receiver:', receiver);

    // Grant para quote
    const quoteGrant = await client.grant.request(
      { 
        url: sendingWallet.authServer,
      },
      {
        access_token: {
          access: [{
            type: "quote",
            actions: ["create", "read", "read-all"],
          }]
        }
      }
    );

    console.log('Quote grant obtenido', quoteGrant);

    // Crear quote
    const quote = await client.quote.create(
      {
        url: sendingWallet.resourceServer,
        accessToken: quoteGrant.access_token.value,
      },
      {
        walletAddress: sendingWallet.id,
        receiver: receiver,
        method: "ilp",
      }
    );
    
    console.log('Quote creado:', quote.id);
    return quote;
  } catch (error) {
    console.error('Error en createQuote:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      description: error.description
    });
    throw error;
  }
}

async function requestOutgoingPaymentGrant(senderId, quote) {
  try {
    const client = await getClient(senderId);
    const sendingWallet = await getWalletInfo(senderId);
    
    console.log('Requesting outgoing payment grant');
    console.log('Quote details:', {
      id: quote.id,
      debitAmount: quote.debitAmount
    });

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
    
    console.log('Outgoing payment grant solicitado');
    return outgoingPaymentGrant;
  } catch (error) {
    console.error('Error en requestOutgoingPaymentGrant:', error);
    throw error;
  }
}

async function completeOutgoingPayment(senderId, grantContinueUrl, grantAccessToken, quoteId) {
  try {
    const client = await getClient(senderId);
    const sendingWallet = await getWalletInfo(senderId);
    
    console.log('Completing outgoing payment');
    
    // Continuar grant
    const finalizedGrant = await client.grant.continue({
      url: grantContinueUrl,
      accessToken: grantAccessToken
    });

    if (!isFinalizedGrant(finalizedGrant)) {
      throw new Error('Grant no finalizado correctamente');
    }

    console.log('Grant finalizado correctamente');

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
    
    console.log('Outgoing payment completado:', outgoingPayment.id);
    return outgoingPayment;
  } catch (error) {
    console.error('Error en completeOutgoingPayment:', error);
    throw error;
  }
}

async function sendPayment(senderId, receiverId, amount) {
  try {
    console.log(`Iniciando pago: ${senderId} -> ${receiverId}, ${amount}`);
    
    // Paso 1: Crear incoming payment
    console.log('Paso 1: Creando incoming payment...');
    const incomingPayment = await createIncomingPayment(receiverId, amount);
    console.log('✓ Incoming payment creado');
    
    // Paso 2: Crear quote
    console.log('Paso 2: Creando quote...');
    const quote = await createQuote(senderId, incomingPayment.id, amount);
    console.log('✓ Quote creado');
    
    // Paso 3: Solicitar grant para outgoing payment
    console.log('Paso 3: Solicitando grant...');
    const outgoingPaymentGrant = await requestOutgoingPaymentGrant(senderId, quote);
    console.log('✓ Grant solicitado');
    
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
      error: error.message,
      details: {
        description: error.description,
        status: error.status,
        code: error.code
      }
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
      error: error.message,
      details: {
        description: error.description,
        status: error.status,
        code: error.code
      }
    };
  }
}

// Función de debugging para verificar configuración
async function debugWalletConfiguration(userId) {
  try {
    console.log(`\n=== DEBUG: Verificando configuración para ${userId} ===`);
    
    const users = JSON.parse(readFileSync('./data/users.json'));
    const user = users[userId];
    
    console.log('1. Usuario encontrado:', {
      name: user.name,
      walletAddress: user.walletAddress,
      keyId: user.keyId,
      privateKeyPath: user.privateKeyPath
    });
    
    // Verificar que el archivo de clave privada existe
    try {
      const privateKey = readFileSync(user.privateKeyPath, 'utf8');
      console.log('2. ✓ Archivo de clave privada encontrado');
      console.log('   Longitud de clave:', privateKey.length);
      console.log('   Comienza con:', privateKey.substring(0, 50) + '...');
    } catch (keyError) {
      console.log('2. ✗ Error leyendo clave privada:', keyError.message);
      return false;
    }
    
    // Probar crear cliente
    try {
      const client = await getClient(userId);
      console.log('3. ✓ Cliente creado exitosamente');
    } catch (clientError) {
      console.log('3. ✗ Error creando cliente:', clientError.message);
      return false;
    }
    
    // Probar obtener wallet info
    try {
      const walletInfo = await getWalletInfo(userId);
      console.log('4. ✓ Wallet info obtenida exitosamente');
      console.log('   ID:', walletInfo.id);
      console.log('   Asset Code:', walletInfo.assetCode);
      console.log('   Asset Scale:', walletInfo.assetScale);
      console.log('   Auth Server:', walletInfo.authServer);
      console.log('   Resource Server:', walletInfo.resourceServer);
    } catch (walletError) {
      console.log('4. ✗ Error obteniendo wallet info:', walletError.message);
      return false;
    }
    
    console.log('=== Configuración OK ===\n');
    return true;
    
  } catch (error) {
    console.log('Error en debug:', error.message);
    return false;
  }
}

export {
  getClient,
  getWalletInfo,
  createIncomingPayment,
  createQuote,
  requestOutgoingPaymentGrant,
  completeOutgoingPayment,
  sendPayment,
  completePayment,
  debugWalletConfiguration
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

