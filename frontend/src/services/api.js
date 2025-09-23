// the backend connects with frontend through the "api" endpoint
const API_BASE = 'http://localhost:3000/api';

export const apiService = {
  // user dashboard
  getDashboard: async (userId) => {
    const response = await fetch(`${API_BASE}/users/${userId}/dashboard`);
    console.log("dashboard response:", response)


    if (!response.ok) throw new Error('Error obteniendo dashboard');
    return response.json();
  },

  // get user balance
  getUserBalance: async (userId) => {
    const response = await fetch(`${API_BASE}/users/${userId}/dashboard`);

    if (!response.ok) throw new Error('Error obteniendo balance');
    const data = await response.json();

    return data.data.user.balance;
  },

  // send money
  sendMoney: async (senderId, receiverId, amount) => {

    const payload = { senderId, receiverId, amount };
    console.log('Enviando al backend:', payload); // Debug


    const response = await fetch(`${API_BASE}/transactions/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status); // Debug
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error enviando dinero');
    }
      
    return response.json();
  },
  
  completePayment: async (paymentData) => {
    try {
      console.log('API: Completing payment with data:', paymentData);
      console.log('Payment details:', paymentData.paymentDetails);
      
      // validate that all required fields are present
      const requiredFields = {
        senderId: paymentData.sender,
        receiverId: paymentData.receiver,
        amount: paymentData.amount,
        quoteId: paymentData.paymentDetails.quoteId,
        continueUri: paymentData.paymentDetails?.continueUri,
        continueToken: paymentData.paymentDetails?.continueToken
      };
      
      console.log('Fields being sent to backend:', requiredFields);
      
      // // checking for missing fields
      // const missingFields = Object.entries(requiredFields)
      //   .filter(([key, value]) => !value)
      //   .map(([key]) => key);
      
      // if (missingFields.length > 0) {
      //   throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      // }
      
      const response = await fetch(`${API_BASE}/transactions/complete-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requiredFields),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('API: Payment completion result:', result);
      return result;
    } catch (error) {
      console.error('Error completing payment:', error);
      throw error;
    }
  },

  // [FEATURES TO BE IMPLEMENTED, COMMENTED FOR NOW]
  // AI recommendations
  //   getAIBudget: async (amount, userId) => {
  //     const response = await fetch(`${API_BASE}/transactions/ia-budget`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ amount, userId })
  //     });
  //     if (!response.ok) throw new Error('Error obteniendo recomendaciones IA');
  //     return response.json();
  //   },

  //   // breakdown calculation
  //   calculateBreakdown: async (amount) => {
  //     const response = await fetch(`${API_BASE}/transactions/calculate-breakdown`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ amount })
  //     });
  //     if (!response.ok) throw new Error('Error calculando breakdown');
  //     return response.json();
  //   }
};