export const calculateBreakdown = (monto) => {
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