/////////////FUNCIONAMIENTO DE CALCULATIONS.JS/////////////
/////////DEBE TENER EL MISMO NOMBRE DE LA FUNCION EN EL FRONTEND/////////
/////////SE PIDEN 1 PARAMETRO: monto/////////
/////////monto: es el monto del pago/////////
/////////SE DEVUELVE UN OBJETO CON LOS SIGUIENTES DATOS: success, breakdown/////////
/////////success: es true si la funcion se ejecuto correctamente/////////
/////////breakdown: es un objeto con los siguientes datos: amount, savingsPercent, toFamily, toSavings, toIlu, totalFee/////////
/////////amount: es el monto del pago/////////
/////////savingsPercent: es el porcentaje de ahorros/////////


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
const resultadoPrueba = calculateBreakdown(200);
console.log('Resultado de la prueba con monto 200:');
console.log(JSON.stringify(resultadoPrueba, null, 2));

// Exportar la función para uso en otros archivos
module.exports = { calculateBreakdown };
