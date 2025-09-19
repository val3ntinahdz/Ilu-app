import { sendPayment } from './openPayments.js';

async function testPayment() {
  try {
    console.log('=== Testing Push Payment Flow ===');
    
    // Test the recommended push payment approach
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

testPayment();