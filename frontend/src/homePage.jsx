import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from './services/api'; // Importar tu servicio
import './homePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  // Estados existentes
  const [userData, setUserData] = useState(null);
  const [quickActions, setQuickActions] = useState([]);
  const [paymentServices, setPaymentServices] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [aiTools, setAiTools] = useState({});
  
  // Estados UI
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [activeAiTool, setActiveAiTool] = useState(null);
  const [error, setError] = useState(null);

  // CARGAR DATOS REALES DEL BACKEND
  useEffect(() => {
    const loadBackendData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Cargando datos de Miguel desde backend...');
        
        // Obtener datos reales del backend
        const dashboardResponse = await apiService.getDashboard('miguel');
        console.log('📊 Respuesta del backend:', dashboardResponse);
        
        if (dashboardResponse.success) {
          const { user, recentTransactions: backendTransactions, quickStats } = dashboardResponse.data;
          
          // Mapear datos del backend al formato del frontend
          setUserData({
            name: user.name,
            initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            availableBalance: user.balance,
            totalBalance: user.balance + (user.totalSaved || 0),
            currentSavings: user.totalSaved || 0,
            savingsGoal: 50000, // Meta fija para demo
            notifications: 2,
            accountNumber: '**** 4532',
            location: user.location,
            totalSent: user.totalSent || 0,
            totalReceived: user.totalReceived || 0
          });

          // Mapear transacciones del backend
          setRecentTransactions(backendTransactions.map(t => ({
            id: t.id || Math.random(),
            type: t.type === 'received' ? 'income' : 'expense',
            title: t.type === 'received' ? 
              `Recibido de ${t.from}` : 
              `Enviado a ${t.to}`,
            amount: Math.abs(t.amount),
            date: t.timestamp ? 
              new Date(t.timestamp).toLocaleDateString('es-MX') : 'Hoy',
            time: t.timestamp ? 
              new Date(t.timestamp).toLocaleTimeString('es-MX', { 
                hour: '2-digit', minute: '2-digit' 
              }) : '00:00',
            breakdown: t.breakdown
          })));

          // Stats mensuales con datos reales
          setMonthlyStats([
            { label: 'Recibido', value: user.totalReceived || 0, type: 'income' },
            { label: 'Enviado', value: user.totalSent || 0, type: 'expense' },
            { label: 'Ahorrado', value: user.totalSaved || 0, type: 'positive' }
          ]);

          console.log('✅ Datos cargados exitosamente del backend');
        }
      } catch (error) {
        console.error('❌ Error cargando datos del backend:', error);
        setError('Error conectando con el backend');
        
        // Fallback a datos de ejemplo
        loadFallbackData();
      }
      
      // Cargar datos estáticos (acciones, servicios, IA)
      loadStaticData();
      setIsLoading(false);
    };

    // Función de fallback si falla el backend
    const loadFallbackData = () => {
      console.log('⚠️  Usando datos de fallback');
      setUserData({
        name: 'Miguel García',
        initials: 'MG',
        availableBalance: 0,
        totalBalance: 0,
        currentSavings: 0,
        savingsGoal: 50000,
        notifications: 2,
        accountNumber: '**** 4532'
      });
    };

    // Datos que no vienen del backend (UI)
    const loadStaticData = () => {
      setQuickActions([
        { id: 'recharge', name: 'Recargar', icon: '💳', color: 'primary' },
        { id: 'send', name: 'Enviar', icon: '📤', color: 'accent' },
        { id: 'request', name: 'Solicitar', icon: '📥', color: 'secondary' },
        { id: 'history', name: 'Historial', icon: '📊', color: 'info' }
      ]);

      setPaymentServices([
        { id: 'internet', name: 'Internet', icon: '🌐', color: 'info' },
        { id: 'electricity', name: 'Electricidad', icon: '⚡', color: 'warning' },
        { id: 'phone', name: 'Telefonía', icon: '📱', color: 'primary' },
        { id: 'gas', name: 'Gas', icon: '🔥', color: 'danger' },
        { id: 'water', name: 'Agua', icon: '💧', color: 'success' },
        { id: 'insurance', name: 'Seguros', icon: '🛡️', color: 'secondary' }
      ]);

      setAiTools({
        advisor: {
          title: 'Consultor Financiero',
          description: 'Obtén consejos personalizados sobre tus finanzas',
          icon: '🤖',
          content: [
            {
              title: 'Optimiza tus gastos',
              description: 'Puedes ahorrar $300 mensuales reduciendo suscripciones no utilizadas.',
              priority: 'high'
            }
          ]
        }
      });
    };

    // Cargar datos iniciales
    loadBackendData();

    // Auto-refresh cada 15 segundos para ver cambios en tiempo real
    const interval = setInterval(() => {
      console.log('🔄 Refrescando datos...');
      loadBackendData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Funciones existentes
  const formatCurrency = useCallback(amount =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0), []);

  const calculateSavingsProgress = useCallback(() => {
    if (!userData) return 0;
    return Math.round((userData.currentSavings / userData.savingsGoal) * 100);
  }, [userData]);

  // Handlers existentes
  const toggleBalance = useCallback(() => setShowBalance(b => !b), []);
  const flipCard = useCallback(() => setIsCardFlipped(f => !f), []);
  const toggleAiSection = useCallback(() => setIsAiExpanded(e => !e), []);
  const selectAiTool = useCallback(toolKey => {
    setActiveAiTool(prev => (prev === toolKey ? null : toolKey));
  }, []);

  // Handler para enviar dinero
  const navigate = useNavigate();
  const handleSendMoney = () => {
    // Navegar a pantalla de envío usando react-router
    console.log('Navegando a pantalla de envío...');
    navigate('/send');
  };

  if (isLoading) {
    return (
      <div className="homepage-loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Cargando datos desde el backend...</p>
          {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="homepage-loading">
        <div className="loading-content">
          <p style={{ color: 'red' }}>Error: No se pudieron cargar los datos</p>
          <button onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Header con datos reales */}
      <header className="header">
        <div className="header-content">
          <div className="user-section">
            <div className="user-avatar">
              <span>{userData.initials}</span>
            </div>
            <div className="user-info">
              <h1>¡Hola, {userData.name}!</h1>
              <p>Bienvenido de vuelta</p>
              {userData.location && (
                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                  {userData.location}
                </small>
              )}
            </div>
          </div>
          <button className="notification-btn btn-secondary">
            <span className="notification-icon">🔔</span>
            {userData.notifications > 0 && (
              <span className="notification-badge">{userData.notifications}</span>
            )}
          </button>
        </div>
      </header>

      <main className="main-content">

        {/* Balance section con datos reales */}
        <section className="balance-section">
          <div className={`balance-card-container${isCardFlipped ? ' flipped' : ''}`}>
            <div className="balance-card-face front">
              <article className="balance-card primary">
                <div className="balance-header">
                  <span className="balance-label">Saldo disponible</span>
                  <button className="toggle-btn" onClick={toggleBalance}>
                    {showBalance ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <span className="balance-amount">
                  {showBalance ? formatCurrency(userData.availableBalance) : '••••••'}
                </span>
                <div className="account-info">Cuenta principal • {userData.accountNumber}</div>
                <button className="flip-btn" onClick={flipCard}>
                  <span className="flip-icon">🔄</span>
                  <span className="flip-text">
                    {isCardFlipped ? 'Ver saldo' : 'Ver detalles'}
                  </span>
                </button>
              </article>
            </div>

            {/* Cara trasera con datos reales */}
            <div className="balance-card-face back">
              <section className="balance-details balance-details-small">
                <div className="details-header">
                  <h3>Resumen financiero</h3>
                </div>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Total enviado</span>
                    <span className="detail-value">
                      {showBalance ? formatCurrency(userData.totalSent) : '••••••'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total recibido</span>
                    <span className="detail-value">
                      {showBalance ? formatCurrency(userData.totalReceived) : '••••••'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ahorros</span>
                    <span className="detail-value">
                      {showBalance ? formatCurrency(userData.currentSavings) : '••••••'}
                    </span>
                  </div>
                </div>
                <button className="flip-btn" onClick={flipCard}>
                  <span className="flip-icon">🔄</span>
                  <span className="flip-text">Ver saldo</span>
                </button>
              </section>
            </div>
          </div>
        </section>

        {/* Acciones rápidas - CONECTAR BOTÓN ENVIAR */}
        <section className="quick-actions">
          <div className="actions-grid">
            {quickActions.map(action => (
              <button
                key={action.id}
                className="action-btn"
                data-color={action.color}
                onClick={action.id === 'send' ? handleSendMoney : undefined}
              >
                <div className="action-icon">{action.icon}</div>
                <span className="action-text">{action.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Resto de tu código existente... */}
        <div className="content-layout">
          <div className="main-column">
            {/* Transacciones con datos reales */}
            <section className="transactions-section">
              <div className="section-header">
                <h2>Movimientos recientes</h2>
                <button className="see-all-btn btn-outline">Ver todos</button>
              </div>
              <div className="transactions-list">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map(transaction => (
                    <div key={transaction.id} className="transaction-item">
                      <div className={`transaction-icon ${transaction.type}`}>
                        {transaction.type === 'income' ? '↓' : '↑'}
                      </div>
                      <div className="transaction-info">
                        <span className="transaction-title">{transaction.title}</span>
                        <span className="transaction-date">{transaction.date}, {transaction.time}</span>
                      </div>
                      <span className={`transaction-amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="no-transactions" style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#666' 
                  }}>
                    <p>No hay transacciones recientes</p>
                    <p style={{ fontSize: '0.8rem' }}>
                      Las transacciones aparecerán aquí después de enviar dinero
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Estadísticas con datos reales */}
            <section className="stats-section">
              <div className="section-header">
                <h2>Estadísticas del mes</h2>
              </div>
              <div className="stats-list">
                {monthlyStats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <span className="stat-label">{stat.label}</span>
                    <span className={`stat-value ${stat.type}`}>
                      {stat.type === 'income' ? '+' : stat.type === 'expense' ? '-' : '+'}
                      {formatCurrency(stat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Calculadora de finanzas */}
            <section className="finance-calculator">
              <div className="section-header">
                <h2>Calculadora de Finanzas</h2>
              </div>
              <div className="calculator-content">
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Meta de ahorro</span>
                    <span className="progress-percentage">
                      {calculateSavingsProgress()}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${calculateSavingsProgress()}%` }}
                    ></div>
                  </div>
                  <div className="progress-info">
                    <span>
                      {showBalance ? formatCurrency(userData.currentSavings) : '••••••'} 
                      de {formatCurrency(userData.savingsGoal)}
                    </span>
                  </div>
                </div>
                
                <div className="calculator-tips">
                  <div className="tip-item">
                    <span className="tip-icon">💡</span>
                    <div className="tip-content">
                      <span className="tip-title">Consejo Smart</span>
                      <span className="tip-description">
                        Ahorra {formatCurrency(Math.round((userData.savingsGoal - userData.currentSavings) / 12))} 
                        mensuales para alcanzar tu meta en 1 año
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Columna lateral */}
          <div className="side-column">
            {/* Servicios de pago */}
            <section className="payment-services">
              <div className="section-header">
                <h2>Servicios</h2>
                <button className="see-all-btn btn-outline">Ver todos</button>
              </div>
              <div className="services-grid">
                {paymentServices.map(service => (
                  <button
                    key={service.id}
                    className="service-btn"
                    data-color={service.color}
                  >
                    <div className="service-icon">{service.icon}</div>
                    <span className="service-name">{service.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Sección de IA */}
            <section className="ai-section">
              <div className="section-header">
                <h2>Asistente IA</h2>
                <button 
                  className="expand-btn"
                  onClick={toggleAiSection}
                >
                  {isAiExpanded ? '−' : '+'}
                </button>
              </div>
              
              <div className={`ai-content ${isAiExpanded ? 'expanded' : ''}`}>
                <div className="ai-tools">
                  {Object.entries(aiTools).map(([toolKey, tool]) => (
                    <div key={toolKey} className="ai-tool">
                      <button
                        className={`ai-tool-header ${activeAiTool === toolKey ? 'active' : ''}`}
                        onClick={() => selectAiTool(toolKey)}
                      >
                        <div className="ai-tool-info">
                          <span className="ai-tool-icon">{tool.icon}</span>
                          <div className="ai-tool-text">
                            <span className="ai-tool-title">{tool.title}</span>
                            <span className="ai-tool-description">{tool.description}</span>
                          </div>
                        </div>
                        <span className="ai-tool-arrow">
                          {activeAiTool === toolKey ? '↑' : '↓'}
                        </span>
                      </button>
                      
                      {activeAiTool === toolKey && (
                        <div className="ai-tool-content">
                          {tool.content.map((item, index) => (
                            <div key={index} className={`ai-advice ${item.priority}`}>
                              <div className="advice-header">
                                <span className="advice-title">{item.title}</span>
                                <span className={`priority-badge ${item.priority}`}>
                                  {item.priority === 'high' ? '🔴' : '🟡'}
                                </span>
                              </div>
                              <p className="advice-description">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;