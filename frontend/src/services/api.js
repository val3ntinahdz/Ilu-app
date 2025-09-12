// Aquí es cuando el backend conecta con el front
const API_BASE = 'http://localhost:3000/api';

export const apiService = {
  // user dashboard
  getDashboard: async (userId) => {
    const response = await fetch(`${API_BASE}/users/${userId}/dashboard`);
    if (!response.ok) throw new Error('Error obteniendo dashboard');
    return response.json();
  },

  // send money
  sendMoney: async (senderId, receiverId, amount) => {
    const response = await fetch(`${API_BASE}/transactions/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, receiverId, amount })
    });
    if (!response.ok) throw new Error('Error enviando dinero');
    return response.json();
  },

  // AI recommendations
  getAIBudget: async (amount, userId) => {
    const response = await fetch(`${API_BASE}/transactions/ia-budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, userId })
    });
    if (!response.ok) throw new Error('Error obteniendo recomendaciones IA');
    return response.json();
  },

  // breakdown calculation
  calculateBreakdown: async (amount) => {
    const response = await fetch(`${API_BASE}/transactions/calculate-breakdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    if (!response.ok) throw new Error('Error calculando breakdown');
    return response.json();
  }
};