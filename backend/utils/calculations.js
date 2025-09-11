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
//////////////cambiar esto despues/borrarlo/////////
// Prueba con monto de 200
const resultadoPrueba = calculateBreakdown(250);
console.log('Resultado de la prueba con monto 250:');
console.log(JSON.stringify(resultadoPrueba, null, 2));

// Exportar la función para uso en otros archivos
module.exports = { calculateBreakdown };
