///////////// aimock.js functionality /////////////
///////// must have the same function name as in the frontend /////////
///////// requires 2 parameters: amount, familyProfile /////////
///////// amount: is the total amount available to allocate /////////
///////// familyProfile: is an object with the family profile (optional) /////////
///////// returns an object with the following properties: allocations, insights /////////
///////// allocations: is an array with the categories and their allocations /////////
///////// insights: is an array with additional recommendations /////////
///////// each allocation has: category, amount, percentage, priority, suggestion /////////
///////// category: name of the category (food, health, etc.) /////////
///////// amount: amount allocated in that category /////////
///////// percentage: percentage of the total /////////
///////// priority: priority (high, medium, low) /////////
///////// suggestion: specific suggestion for that category /////////

// ai recommendations mock
function generateBudgetRecommendations(amount, familyProfile = {}) {
  const baseAllocations = {
    food: 0.4,
    health: 0.25,        
    education: 0.2,
    emergency: 0.15
  };
    
  return {
    allocations: [
      {
  category: 'food',
        amount: parseFloat((amount * baseAllocations.food).toFixed(2)),
        percentage: 40,
        priority: 'high',
  suggestion: 'enough for 2 weeks of basic groceries'
      },
      {
  category: 'health',
        amount: parseFloat((amount * baseAllocations.health).toFixed(2)),
        percentage: 25,
        priority: 'high',
  suggestion: 'covers medical consultation + basic medicines'
      },
      {
  category: 'education',
        amount: parseFloat((amount * baseAllocations.education).toFixed(2)),
        percentage: 20,
        priority: 'medium',
  suggestion: 'school supplies and books for 2 children'
      },
      {
  category: 'emergency',
        amount: parseFloat((amount * baseAllocations.emergency).toFixed(2)),
        percentage: 15,
        priority: 'low',
  suggestion: 'fund for unexpected expenses'
      }
    ],
    insights: [
      "your automatic savings are equivalent to 2 days of food",
      "consider using partner pharmacy for 2% cashback on health expenses"
    ]
  };
}

export default { generateBudgetRecommendations };