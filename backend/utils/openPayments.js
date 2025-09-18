// 1. A function that first creates a grant for the outgoing payment (an authorization from the sender)
// 2. create a function for outgoing payments only: sender -> authorization (grant) -> receiver
    // -> the function should receive an argument with the receiver wallet address to continue with transaction 
    // add validations to make sure the wallet address exists and the amoun is in the right format 
// 3. Make auth url for the receiver (grant)

// async function createNewPayment(receiverId, amount, receiverWalletAddress) {
//   // get the receiver id 
//   // receive the amount 
//   // make it match with the receiver wallet address (payment pointer)
// }

// THIS IS A SECOND VERSION OF THE FIRST OPEN PAYMENTS IMPLEMENTATION FROM THE openPayments.js file! 


// 1. First, get the client and their wallet address info
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
    console.log("What is the private key?", privateKey);
    
    // create an authenticated client first
    const client = await createAuthenticatedClient({
      walletAddressUrl: user.walletAddress,
      privateKey: privateKey, // get the content, not the route
      keyId: user.keyId
    });

    clients.set(userId, client);
    return client;
  } catch (error) {
    console.error(`Error creando cliente para ${userId}:`, error);
    throw error;
  }
}

// 2. Get the client´s wallet info
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

// 3. After we got the client wallet info, we create the quote for an outgoing payment
async function createQuote (senderId, receiverPaymentPointer, amount) {

  try {
    const client = getClient(senderId);
    const sendingWallet = getWalletInfo(senderId);

    console.log(`Creating quote for sender ${senderId} to receiver ${receiverPaymentPointer} for the amount of ${amount}`);


    // Here, we get the grant for quote creation
    const quoteGrant = await client.grant.request(
      {
        url: receiverPaymentPointer.authServer,
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

    console.log("Quote grant successfully created");

    // Now, we create quote with receiver's payment pointer
    const quote = await client.quote.create(
      {
        url: sendingWallet.resourceServer,
        accessToken: quoteGrant.access_token.value,
      }, 
      {
        method: "ilp",
        walletAddress: sendingWallet.id,
        receiver: receiverPaymentPointer,
        debitAmount: {
          value: (amount * Math.pow(10, sendingWallet.assetScale)).toString(),
          assetCode: sendingWallet.assetCode,
          assetScale: sendingWallet.assetScale,
        }
        
      }
    )

    console.log("Created quote: ", quote);
    return quote;

  } catch (error) {
    console.log("There was an error creating the quote: ", error);
  }
    
}



async function createOutgoingPayment (senderId, quoteId) {

  try {

    const client = await getClient(senderId);
    const sendingWallet = await getWalletInfo(senderId);

    console.log(`Creating outgoing payment for quote: ${quoteId}`);

    // Generate grant for outgoing payment
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
              actions: ["list", "list-all", "read", "read-all", "create"]
            },
          ],
        },
      },
    );

    console.log("The grant for outgoing payment was created: ", outgoingPaymentGrant);


    // Create the actual outgoing payment
    const outgoingPayment = await client.outgoingPayment.create(
      {
        url: sendingWallet.resourceServer,
        accessToken: outgoingPaymentGrant.access_token.value,
      },
      {
        walletAddress: sendingWallet.id,
        quoteId: quoteId,
      },
    );

    console.log('Created outgoing payment:', outgoingPayment.id);
    return outgoingPayment;
    
  } catch (error) {
    console.error('Error in createOutgoingPayment:', error);
    
  }

}

async function sendPayment(senderId, receiverPaymentPointer, amount) {
  try {
    console.log(`Iniciando pago: ${senderId} -> ${receiverPaymentPointer}, ${amount}`);
    
  // step 1: create quote
  console.log('step 1: creating quote...');
  const quote = await createQuote(senderId, receiverPaymentPointer, amount);
  console.log('✓ Created quote');
    
  // step 2: create the outgoing payment
  console.log('step 3: requesting grant...');
  const outgoingPayment = await createOutgoingPayment(senderId, quote.id);
  console.log('✓ Created outgoing payment');

  return {
    success: true,
    status: outgoingPayment.state,
    paymentId: outgoingPayment.id,
    amount: amount,
    receiver: receiverPaymentPointer,
    message: 'Payment initiated successfully'
  };
    
    
  } catch (error) {
    console.error('Error in sending payment:', error);

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
  createQuote,
  createOutgoingPayment,
  sendPayment
};
