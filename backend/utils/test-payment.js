// test-functions.js
import { getClient, getWalletInfo, createIncomingPayment, sendPayment } from './openPayments.js';

async function testIndividualFunctions() {
  try {
    // Probar conexión
    console.log('1. Probando conexión...');
    const client = await getClient('miguel');
    console.log('Cliente conectado');
    
    // Probar wallet info
    console.log('2. Obteniendo wallet info...');
    const walletInfo = await getWalletInfo('miguel');
    console.log('Wallet info:', walletInfo.id);
    
    // Probar incoming payment
    console.log('3. Creando incoming payment...');
    const incomingPayment = await createIncomingPayment('dominga', 10);
    console.log('Incoming payment:', incomingPayment.id);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testFullPayment() {
  const result = await sendPayment('miguel', 'dominga', 25);
  console.log('Resultado completo:', result);
  
  if (result.grantUrl) {
    console.log('\nAutoriza en:', result.grantUrl);
  }
}

// Descomenta la que quieras probar:
testIndividualFunctions();
// testFullPayment();