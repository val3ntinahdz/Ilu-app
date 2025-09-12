///////////// calculations.js functionality /////////////
///////// must have the same function name as in the frontend /////////
///////// requires 1 parameter: amount /////////
///////// amount: is the payment amount /////////
///////// returns an object with the following data: success, breakdown /////////
///////// success: is true if the function executed correctly /////////
///////// breakdown: is an object with the following data: amount, savingsPercent, toFamily, toSavings, toIlu, totalFee /////////
///////// amount: is the payment amount /////////
///////// savingsPercent: is the savings percentage /////////


const calculateBreakdown = (amount) => {
  const savingsPercent = 4;
  const iluPercent = 2;

  const toSavings = (amount * savingsPercent) / 100;
  const toIlu = (amount * iluPercent) / 100;
  const toFamily = amount - toSavings - toIlu;
  const totalFee = toSavings + toIlu;

  return {
    success: true,
    breakdown: {
      amount: amount,
      savingsPercent: savingsPercent,
      toFamily: toFamily,
      toSavings: toSavings,
      toIlu: toIlu,
      totalFee: totalFee
    }
  };
};


// remove or change this later
// test with amount 200
const testResult = calculateBreakdown(200);
console.log('test result with amount 200:');
console.log(JSON.stringify(testResult, null, 2));

// export the function for use in other files
export default { calculateBreakdown };
