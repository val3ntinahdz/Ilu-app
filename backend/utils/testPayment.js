import { getClient, getWalletInfo, createQuote, createOutgoingPayment, sendPayment } from './openPayments.js';

async function testIndividualFunctions() {
  try {
  // test connection
  console.log('1. testing connection...');
  const miguelClient = await getClient('miguel');
  const domingaClient = await getClient('dominga')
  console.log('miguel client connected', miguelClient);
  console.log('dominga client connected', domingaClient);
    
  // test wallet info
  console.log('2. getting wallet info...');
  const miguelWalletInfo = await getWalletInfo(miguelClient);
  console.log('Miguel wallet info:', miguelWalletInfo);

  const domingaWalletInfo = await getWalletInfo(domingaClient);
  console.log('Dominga wallet info:', domingaWalletInfo);

  // create quote
  console.log('3. creating quote for outgoing payment...');
  const quote = await createQuote(client, domingaWalletInfo, 5);
  console.log('created quote: ', quote);

  // create the outgoing payment
  console.log('4. creating outgoing payment...');
  const outgoingPayment = await createOutgoingPayment(client, quote.id);
  console.log('created outgoing payment: ', outgoingPayment);

    
  } catch (error) {
  console.error('error:', error.message);
  }
}

// async function testFullPayment() {
//   const result = await sendPayment('miguel', 'dominga', 25);
//   console.log('full result:', result);
  
//   if (result.grantUrl) {
//     console.log('\nauthorize at:', result.grantUrl);
//   }
// }

// uncomment the one you want to test:
testIndividualFunctions();
// testFullPayment();