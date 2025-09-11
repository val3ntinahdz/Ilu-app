/////////////FUNCIONAMIENTO DE AIMOCK.JS/////////////
/////////DEBE TENER EL MISMO NOMBRE DE LA FUNCION EN EL FRONTEND/////////
/////////SE PIDEN 2 PARAMETROS: amount, familyProfile/////////
/////////amount: es el monto total disponible para asignar/////////
/////////familyProfile: es un objeto con el perfil familiar (opcional)/////////
/////////SE DEVUELVE UN OBJETO CON LAS SIGUIENTES PROPIEDADES: allocations, insights/////////
/////////allocations: es un array con las categorías y sus asignaciones/////////
/////////insights: es un array con recomendaciones adicionales/////////
/////////Cada allocation tiene: category, amount, percentage, priority, suggestion/////////
/////////category: nombre de la categoría (Alimentación, Medicina, etc.)/////////
/////////amount: monto asignado en esa categoría/////////
/////////percentage: porcentaje del total/////////
/////////priority: prioridad (high, medium, low)/////////
/////////suggestion: sugerencia específica para esa categoría/////////
/////////////////////////////////////////////////////

// Mock de recomendaciones de IA
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
          category: 'Alimentación', 
          amount: parseFloat((amount * baseAllocations.food).toFixed(2)),
          percentage: 40,
          priority: 'high',
          suggestion: 'Suficiente para 2 semanas de despensa básica'
        },
        {
          category: 'Medicina',
          amount: parseFloat((amount * baseAllocations.health).toFixed(2)),
          percentage: 25,
          priority: 'high', 
          suggestion: 'Cubre consulta médica + medicamentos básicos'
        },
        {
          category: 'Educación',
          amount: parseFloat((amount * baseAllocations.education).toFixed(2)),
          percentage: 20,
          priority: 'medium',
          suggestion: 'Útiles escolares y libros para 2 niños'
        },
        {
          category: 'Emergencias',
          amount: parseFloat((amount * baseAllocations.emergency).toFixed(2)),
          percentage: 15,
          priority: 'low',
          suggestion: 'Fondo para gastos inesperados'
        }
      ],
      insights: [
        "Tu ahorro automático equivale a 2 días de alimentación",
        "Considera usar farmacia partner para 2% cashback en medicina"
      ]
    };
  }
  
  export default { generateBudgetRecommendations };

// Prueba de la función
function probarAiMock() {
  console.log('Iniciando prueba de AI Mock...');
  
  const montoPrueba = 200;
  const perfilFamilia = {
    miembros: 4,
    hijos: 2,
    ingresos: 'bajo'
  };
  
  try {
    const resultado = generateBudgetRecommendations(montoPrueba, perfilFamilia);
    console.log('Resultado de AI Mock:');
    console.log(JSON.stringify(resultado, null, 2));
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

// Ejecutar prueba si se llama directamente
if (require.main === module) {
  probarAiMock();
}