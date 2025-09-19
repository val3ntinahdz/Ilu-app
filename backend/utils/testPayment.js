import { getClient, getWalletInfo, createIncomingPayment, createQuote, createOutgoingPayment, sendPayment } from './openPayments.js';

async function testIndividualFunctions() {
  try {
    // Test connection using the user IDs
    console.log('1. Testing connection...');
    const miguelClient = await getClient('miguel');
    const domingaClient = await getClient('dominga');
    console.log('Miguel client connected:', !!miguelClient);
    console.log('Dominga client connected:', !!domingaClient);
    
    // Testing the wallet info
    console.log('2. Getting wallet info...');
    const miguelWalletInfo = await getWalletInfo('miguel');
    console.log('Miguel wallet info:', miguelWalletInfo);

    const domingaWalletInfo = await getWalletInfo('dominga');
    console.log('Dominga wallet info:', domingaWalletInfo);

    // Create quote - this step is now done within sendPushPayment

    console.log('3. Creating incoming payment first...');
    const incomingPayment = await createIncomingPayment('dominga', 50, 'Test payment');
    console.log('4. Creating quote for outgoing payment...');
    const quote = await createQuote('miguel', incomingPayment.id);
    console.log('Created quote:', quote);

    // Create the outgoing payment - this step is now done within sendPushPayment  
    console.log('4. Creating outgoing payment...');
    const outgoingPayment = await createOutgoingPayment('miguel', quote);
    console.log('Created outgoing payment:', outgoingPayment);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

async function testPushPayment() {
  try {
    console.log('=== Testing Push Payment Flow ===');
    
    // Test the recommended push payment approach
    const domingaWalletInfo = await getWalletInfo('dominga');
    const result = await sendPayment('miguel', 'dominga', 5);
    console.log('Push payment result:', result);
    
    if (result.success && result.requiresInteraction) {
      console.log('\n🔗 NEXT STEPS:');
      console.log('1. Open this URL in your browser:', result.interactionUrl);
      console.log('2. Complete the authorization flow');
      console.log('3. The payment will be processed automatically');
      console.log('\nPayment Details:');
      console.log('- Amount: $5 USD → ~500 MXN');
      console.log('- Quote ID:', result.quoteId);
      console.log('- Incoming Payment ID:', result.incomingPaymentId);
      
      return; // Don't try alternative approaches if interaction is required
    }
    
  } catch (error) {
    console.error('Error in push payment test:', error);
  }
}

// Uncomment the one you want to test:
testIndividualFunctions();
testPushPayment();