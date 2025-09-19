// // 1. A function that first creates a grant for the outgoing payment (an authorization from the sender)
// // 2. create a function for outgoing payments only: sender -> authorization (grant) -> receiver
//     // -> the function should receive an argument with the receiver wallet address to continue with transaction 
//     // add validations to make sure the wallet address exists and the amoun is in the right format 
// // 3. Make auth url for the receiver (grant)

// // async function createNewPayment(receiverId, amount, receiverWalletAddress) {
// //   // get the receiver id 
// //   // receive the amount 
// //   // make it match with the receiver wallet address (payment pointer)
// // }

// // THIS IS A SECOND VERSION OF THE FIRST OPEN PAYMENTS IMPLEMENTATION FROM THE openPayments.js file! 

import { createAuthenticatedClient, isFinalizedGrant } from '@interledger/open-payments';
import { readFileSync } from 'fs';

import readline from 'readline/promises'
import path from 'path';

// Client cache to avoid recreating
const clients = new Map();

async function getClient(userId) {
  if (clients.has(userId)) {
    return clients.get(userId);
  }

  try {
    const users = JSON.parse(readFileSync('./data/users.json'));
    console.log("Users in json: ", users);
  
    const user = users[userId];
    if (!user) {
      throw new Error(`User ${userId} not found in users.json`);
    }

    console.log("Extracted user", user);

    // Read the private key from the file
    const privateKey = readFileSync(user.privateKeyPath, 'utf8');
    
    // Create an authenticated client
    const client = await createAuthenticatedClient({
      walletAddressUrl: user.walletAddress,
      privateKey: privateKey,
      keyId: user.keyId
    });

    clients.set(userId, client);
    return client;

  } catch (error) {
    console.error(`Error creating client for ${userId}:`, error);
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
    console.error(`Error getting wallet info for ${userId}:`, error);
    throw error;
  }
}

async function createIncomingPayment(receiverId, amount, description) {
  try {
    const receiverClient = await getClient(receiverId);
    const receiverWallet = await getWalletInfo(receiverId);

    console.log(`${receiverId} creating incoming payment for ${amount} ${receiverWallet.assetCode}`);

    // Obtener grant para crear incoming payment
    const incomingGrant = await receiverClient.grant.request(
      {
        url: receiverWallet.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "incoming-payment",
              actions: ["read", "complete", "create"],
            },
          ],
        },
      },
    );

    if (!isFinalizedGrant(incomingGrant)) {
      throw new Error('Expected finalized incoming payment grant')
    }

    console.log("Incoming payment grant created");

    // Crear incoming payment
    const incomingPayment = await receiverClient.incomingPayment.create(
      {
        url: receiverWallet.resourceServer,
        accessToken: incomingGrant.access_token.value,
      },
      {
        walletAddress: receiverWallet.id,
        incomingAmount: {
          value: Math.round(amount * Math.pow(10, receiverWallet.assetScale)).toString(),
          assetCode: receiverWallet.assetCode,
          assetScale: receiverWallet.assetScale,
        },
        //expiresAt: new Date(Date.now() + 60_000 * 10).toISOString(),
        metadata: {
          description: description || 'Payment request'
        }
      }
    );

    console.log("Created incoming payment:", incomingPayment.id);
    return incomingPayment;

  } catch (error) {
    console.error("Error creating incoming payment:", error);
    throw error;
  }
}

// create quote with proper grant handling
async function createQuote(senderId, incomingPaymentUrl) {
  try {
    const client = await getClient(senderId);
    const sendingWallet = await getWalletInfo(senderId);

    console.log(`Creating quote for sender ${senderId} to incoming payment ${incomingPaymentUrl}`);

    // CORRECTED: Request quote grant from SENDER's auth server
    const quoteGrant = await client.grant.request(
      {
        url: sendingWallet.authServer, 
      },
      {
        access_token: {
          access: [
            {
              type: "quote",
              actions: ["create", "read"],
            },
          ],
        },
      },
    );

    if (!isFinalizedGrant(quoteGrant)) {
      throw new Error("Expected finalized quote grant");
    }

    console.log("Quote grant created", quoteGrant);

    // CORRECTED: Create quote using sender's resource server and finalized grant
    const quote = await client.quote.create(
      {
        url: sendingWallet.resourceServer,
        accessToken: quoteGrant.access_token.value,
      }, 
      {
        method: "ilp",
        walletAddress: sendingWallet.id,
        receiver: incomingPaymentUrl, // THE INCOMING PAYMENT URL, NOT THE WALLET ADDRESS
      }
    );

    console.log("Created quote: ", quote.id);
    return quote;

  } catch (error) {
    console.error("Error creating quote: ", error);
    throw error;
  }
}

// CORRECTED: Improved outgoing payment creation
async function createOutgoingPayment(senderId, quote) {
  try {
    const client = await getClient(senderId);
    const sendingWallet = await getWalletInfo(senderId);

    console.log(`Creating outgoing payment for quote: ${quote.id}`);

    // Request grant for outgoing payment
    const outgoingPaymentGrant = await client.grant.request(
      {
        url: sendingWallet.authServer,
      },
      {
        access_token: {
          access: [
            {
              identifier: sendingWallet.id,
              type: "outgoing-payment",
              actions: ["read", "create"],
              limits: {
                debitAmount: {
                  value: quote.debitAmount,
                }
              }
            },
          ],
        },
        interact: { 
          start: ["redirect"]
        }
      },
    );

    console.log(
    '\ngot pending outgoing payment grant',
    outgoingPaymentGrant
    )
    console.log(
      'Please navigate to the following URL, to accept the interaction from the sending wallet:'
    )
    console.log(outgoingPaymentGrant.interact.redirect)

    await readline
    .createInterface({ input: process.stdin, output: process.stdout })
    .question('\nPlease accept grant and press enter...')

    let finalizedOutgoingPaymentGrant;

    const grantContinuationErrorMessage =
      '\nThere was an error continuing the grant. You probably have not accepted the grant at the url (or it has already been used up, in which case, rerun the script).'

      try {
        finalizedOutgoingPaymentGrant = await client.grant.continue({
          url: outgoingPaymentGrant.continue.uri,
          accessToken: outgoingPaymentGrant.continue.access_token.value
        })
      } catch (err) {
        if (err instanceof OpenPaymentsClientError) {
          console.log(grantContinuationErrorMessage)
          process.exit()
        }

        throw err
      }

      if (!isFinalizedGrant(finalizedOutgoingPaymentGrant)) {
        console.log(
          'There was an error continuing the grant. You probably have not accepted the grant at the url.'
        )
        process.exit()
      }

      console.log(
        '\nStep 6: got finalized outgoing payment grant',
        finalizedOutgoingPaymentGrant
      )

    // Create the outgoing payment
    const outgoingPayment = await client.outgoingPayment.create(
      {
        url: sendingWallet.resourceServer,
        accessToken: finalizedOutgoingPaymentGrant.access_token.value,
      },
      {
        walletAddress: sendingWallet.id,
        quoteId: quote.id,
      },
    );

    console.log("Created outgoing payment: ", outgoingPayment.id);
    return {
      success: true,
      paymentId: outgoingPayment.id,
      state: outgoingPayment.state
    };
    
  } catch (error) {
    console.error("Error in createOutgoingPayment: ", error);
    throw error;
  }
}

// main payment function
async function sendPayment(senderId, receiverId, amount) {
  try {
    console.log(`Starting payment: ${senderId} -> ${receiverId}, ${amount}`);

    // PASO 1: Receptor crea incoming payment
    console.log("Step 1: Receiver creating incoming payment...");
    const incomingPayment = await createIncomingPayment(
      receiverId, 
      amount, 
      `Payment from ${senderId}`
    );
    console.log("✓ Incoming payment created", incomingPayment);
    
    // Step 1: Create quote
    console.log("Step 2: Creating quote...");
    const quote = await createQuote(senderId, incomingPayment.id);
    console.log("✓ Created quote:", quote.id);
      
    // Step 3: Create the outgoing payment
    console.log("Step 2: Creating outgoing payment...");
    const outgoingPayment = await createOutgoingPayment(senderId, quote.id);
    console.log("✓ Created outgoing payment:", outgoingPayment.id);

    if (outgoingPayment.requiresInteraction) {
      return {
        success: true,
        status: 'pending_interaction',
        requiresInteraction: true,
        interactionUrl: outgoingPayment.interactionUrl,
        continueToken: outgoingPayment.continueToken,
        continueUri: outgoingPayment.continueUri,
        quoteId: quote.id,
        incomingPaymentId: incomingPayment.id,
        amount: amount,
        sender: senderId,
        receiver: receiverId,
        debitAmount: `${quote.debitAmount.value/Math.pow(10, quote.debitAmount.assetScale)} ${quote.debitAmount.assetCode}`,
        receiveAmount: `${quote.receiveAmount.value/Math.pow(10, quote.receiveAmount.assetScale)} ${quote.receiveAmount.assetCode}`,
        message: 'Payment setup complete - user authorization required'
      };
    }
    
    console.log("✓ Payment completed");


    return {
      success: true,
      status: outgoingPayment.state,
      paymentId: outgoingPayment.id,
      incomingPaymentId: incomingPayment.id,
      quoteId: quote.id,
      amount: amount,
      sender: senderId,
      receiver: receiverId,
      debitAmount: `${quote.debitAmount.value/Math.pow(10, quote.debitAmount.assetScale)} ${quote.debitAmount.assetCode}`,
      receiveAmount: `${quote.receiveAmount.value/Math.pow(10, quote.receiveAmount.assetScale)} ${quote.receiveAmount.assetCode}`,
      message: 'Payment completed successfully'
    };
    
  } catch (error) {
    console.error("Error in sending payment: ", error);

    return {
      success: false,
      error: error.message,
      details: {
        description: error.description || "No description available",
        status: error.status || "Unknown status",
        code: error.code || "Unknown code",
        // ADDED: More detailed error context
        timestamp: new Date().toISOString(),
        sender: senderId,
        receiver: receiverId
      }
    };
  }
}

// async function continueGrant(continueUri, continueToken, interactRef) {
//   try {
//     const response = await fetch(continueUri, {
//       method: 'POST',
//       headers: {
//         'Authorization': `GNAP ${continueToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         interact_ref: interactRef
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}: ${await response.text()}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error continuing grant:', error);
//     throw error;
//   }
// }

// // Función para completar pago después de autorización
// async function completePaymentAfterAuth(senderId, quoteId, accessToken) {
//   try {
//     const client = await getClient(senderId);
//     const sendingWallet = await getWalletInfo(senderId);

//     const outgoingPayment = await client.outgoingPayment.create(
//       {
//         url: sendingWallet.resourceServer,
//         accessToken: accessToken,
//       },
//       {
//         walletAddress: sendingWallet.id,
//         quoteId: quoteId,
//       },
//     );

//     return {
//       success: true,
//       paymentId: outgoingPayment.id,
//       state: outgoingPayment.state
//     };
//   } catch (error) {
//     console.error('Error completing payment:', error);
//     throw error;
//   }
// }

export {
  getClient,
  getWalletInfo,
  createQuote,
  createIncomingPayment,
  createOutgoingPayment,
  sendPayment,
  // continueGrant,
  // completePaymentAfterAuth,
};

