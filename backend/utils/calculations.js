///////////// calculations.js functionality /////////////
///////// must have the same function name as in the frontend /////////
///////// requires 1 parameter: amount /////////
///////// amount: is the payment amount /////////
///////// returns an object with the following data: success, breakdown /////////
///////// success: is true if the function executed correctly /////////
///////// breakdown: is an object with the following data: amount, savingsPercent, toFamily, toSavings, toIlu, totalFee /////////
///////// amount: is the payment amount /////////
///////// savingsPercent: is the savings percentage /////////


const calculateBreakdown = (monto) => {
  const porcentajeAhorros = 4;
  const porcentajeIlu = 2;
  
  const paraAhorros = (monto * porcentajeAhorros) / 100;
  const paraIlu = (monto * porcentajeIlu) / 100;
  const paraFamilia = monto - paraAhorros - paraIlu;
  const comisionTotal = paraAhorros + paraIlu;
  
  return {
    success: true,
    breakdown: {
      amount: monto,
      savingsPercent: porcentajeAhorros,
      toFamily: paraFamilia,
      toSavings: paraAhorros,
      toIlu: paraIlu,
      totalFee: comisionTotal
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
