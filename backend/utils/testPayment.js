import { getClient, getWalletInfo, createIncomingPayment, sendPayment } from './openPayments.js';

async function testIndividualFunctions() {
  try {
  // test connection
  console.log('1. testing connection...');
    const client = await getClient('miguel');
  console.log('client connected', client);
    
  // test wallet info
  console.log('2. getting wallet info...');
    const walletInfo = await getWalletInfo('miguel');
  console.log('wallet info:', walletInfo.id);
    
  // test incoming payment
  console.log('3. creating incoming payment...');
    const incomingPayment = await createIncomingPayment('dominga', 10);
  console.log('incoming payment:', incomingPayment.id);
    
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