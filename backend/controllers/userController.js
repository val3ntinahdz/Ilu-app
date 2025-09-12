import { readFileSync } from 'fs';
import path from 'path';

const readDatabase = () => {
  try {
    const data = readFileSync(path.resolve('./data/users.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return {};
  }
};

export const getDashboard = (req, res) => {
  try {
    const { id } = req.params;
    const database = readDatabase();
    const user = database[id];
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "Usuario no encontrado" 
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          location: user.location,
          balance: user.currentBalance || 0,
          totalSaved: user.totalSaved || 0,
          totalSent: user.totalSent || 0,
          totalReceived: user.totalReceived || 0,
          avgSavingsRate: user.avgSavingsRate || 4.0
        },
        recentTransactions: (user.transactions || []).slice(-3).reverse(),
        quickStats: {
          monthlyIncome: user.totalReceived || 0,
          monthlyExpenses: user.totalSent || 0,
          savingsRate: 4
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};