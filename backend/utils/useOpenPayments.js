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
async function createQuote (senderId, receiverWalletAddress, amount) {

    const client = getClient(senderId);
    const sendingWalletAddress = getWalletInfo(senderId);

    // to do: create new quote to request an outgoing payment

    
}

async function createTransactionGrant () {

}


async function createOutgoingPayment () {

}

async function completePayment () {

}


