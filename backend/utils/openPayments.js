///////////// openpayments.js functionality /////////////
///////// must have the same function name as in the frontend /////////
///////// requires 3 parameters: senderWallet, receiverWallet, amount /////////
///////// senderWallet: is the wallet of the user sending the payment /////////
///////// receiverWallet: is the wallet of the user receiving the payment /////////
///////// amount: is the payment amount /////////
///////// returns an object with the following data: id, status, 
///////// senderWallet, receiverWallet, amount, timestamp, steps /////////
///////// id: is the payment id /////////
///////// status: is the payment status /////////
///////// senderWallet: is the wallet of the user sending the payment /////////
///////// receiverWallet: is the wallet of the user receiving the payment /////////
///////// amount: is the payment amount /////////
///////// timestamp: is the payment date and time /////////
///////// steps: is the step by step of the payment /////////
///////// status: is the payment status and can be: completed, pending, failed /////////


import { createAuthenticatedClient, isFinalizedGrant } from '@interledger/open-payments';
import { readFileSync } from 'fs';
import path from 'path';

// client cache to avoid recreating
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
  // read the private key from the file
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


// this is a function for incoming payments
// we need outgoing payments 
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

    // get grant for incoming payment
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

    // calculate the correct value
    const scaledValue = Math.round(amount * Math.pow(10, receivingWallet.assetScale));
    
    // create incoming payment
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
      resourceServer: sendingWallet.resourceServer,
      debitAmount: {
        value: amount, // this is the amount the user will send to the receiver 
        assetCode: walletAddress.assetCode,
        assetScale: walletAddress.assetScale,
    },

    });
    console.log('Receiver wallet address:', receiver.walletAddress);

  // grant for quote
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

  // create quote
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
    
  // continue grant
    const finalizedGrant = await client.grant.continue({
      url: grantContinueUrl,
      accessToken: grantAccessToken
    });

    if (!isFinalizedGrant(finalizedGrant)) {
      throw new Error('Grant no finalizado correctamente');
    }

    console.log('Grant finalizado correctamente');

  // create outgoing payment
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

async function sendPayment(senderId, receiverId, amount, receiverWalletAddress) {
  try {
    console.log(`Iniciando pago: ${senderId} -> ${receiverId}, ${amount}`);
    
  // step 1: create incoming payment
  console.log('step 1: creating incoming payment...');
    const incomingPayment = await createIncomingPayment(receiverId, amount);
    console.log('✓ Incoming payment creado');
    
  // step 2: create quote
  console.log('step 2: creating quote...');
    const quote = await createQuote(senderId, incomingPayment.id, amount);
    console.log('✓ Quote creado');
    
  // step 3: request grant for outgoing payment
  console.log('step 3: requesting grant...');
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
  message: 'user must authorize the payment at the provided url'
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

export {
  getClient,
  getWalletInfo,
  createIncomingPayment,
  createQuote,
  requestOutgoingPaymentGrant,
  completeOutgoingPayment,
  sendPayment,
  completePayment,
};