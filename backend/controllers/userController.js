import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readDatabase = () => {
  try {
    const dataPath = path.join(__dirname, '../data/users.json');
    const data = readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return {};
  }
};

export const getDashboard = (req, res) => {
  try {
    console.log('Dashboard request for user:', req.params.id);
    const { id } = req.params;
    const database = readDatabase();
    const user = database[id];
    
    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ 
        success: false, 
        error: "Usuario no encontrado" 
      });
    }
    
    console.log('User found:', user);
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
          totalReceived: user.totalReceived || 0
        },
        recentTransactions: user.transactions || [],
        quickStats: {
          monthlyIncome: user.totalReceived || 0,
          monthlyExpenses: user.totalSent || 0,
          savingsRate: 4
        }
      }
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};