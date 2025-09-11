import React, { useState, useEffect } from 'react';
import './HomePage.css';

const HomePage = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [activeAiTool, setActiveAiTool] = useState(null);

  // Datos del usuario optimizados
  const userData = {
    name: 'María González',
    initials: 'MG',
    availableBalance: 12450.54,
    totalBalance: 21350.54,
    currentSavings: 12500,
    savingsGoal: 50000,
    notifications: 2,
    accountNumber: '**** 4532'
  };

  // Configuración de acciones rápidas
  const quickActions = [
    { id: 'recharge', name: 'Recargar', icon: '💳', color: 'primary' },
    { id: 'send', name: 'Enviar', icon: '📤', color: 'accent' },
    { id: 'request', name: 'Solicitar', icon: '📥', color: 'secondary' },
    { id: 'history', name: 'Historial', icon: '📊', color: 'info' }
  ];

  // Servicios de pago optimizados
  const paymentServices = [
    { id: 'internet', name: 'Internet', icon: '🌐', color: 'info' },
    { id: 'electricity', name: 'Electricidad', icon: '⚡', color: 'warning' },
    { id: 'phone', name: 'Telefonía', icon: '📱', color: 'primary' },
    { id: 'gas', name: 'Gas', icon: '🔥', color: 'danger' },
    { id: 'water', name: 'Agua', icon: '💧', color: 'success' },
    { id: 'insurance', name: 'Seguros', icon: '🛡️', color: 'secondary' }
  ];

  // Transacciones recientes
  const recentTransactions = [
    { id: 1, type: 'income', title: 'Depósito bancario', amount: 2500, date: 'Hoy', time: '14:30' },
    { id: 2, type: 'expense', title: 'Pago servicios', amount: -199, date: 'Ayer', time: '09:15' },
    { id: 3, type: 'expense', title: 'Transferencia', amount: -1250, date: '28 Ago', time: '16:45' }
  ];

  // Estadísticas del mes
  const monthlyStats = [
    { label: 'Ingresos', value: 18548.99, type: 'income' },
    { label: 'Gastos', value: 1445.93, type: 'expense' },
    { label: 'Balance', value: 17103.06, type: 'positive' }
  ];

  // Herramientas de IA financiera
  const aiTools = {
    advisor: {
      title: 'Consultor Financiero',
      description: 'Obtén consejos personalizados sobre tus finanzas',
      icon: '🤖',
      content: [
        {
          title: 'Optimiza tus gastos',
          description: 'Puedes ahorrar $300 mensuales reduciendo suscripciones no utilizadas.',
          priority: 'high'
        },
        {
          title: 'Estrategia de inversión',
          description: 'Con tu saldo actual, considera invertir en fondos de bajo riesgo.',
          priority: 'medium'
        },
        {
          title: 'Meta alcanzable',
          description: 'Estás a solo 3 meses de alcanzar tu meta de ahorro actual.',
          priority: 'low'
        }
      ]
    },
    calculator: {
      title: 'Calculadora Financiera',
      description: 'Calcula préstamos, inversiones y proyecciones',
      icon: '🧮',
      content: [
        {
          title: 'Calculadora de préstamos',
          description: 'Simula cuotas y intereses de créditos',
          action: 'calculate'
        },
        {
          title: 'Proyección de ahorros',
          description: 'Calcula cuánto ahorrarás en el tiempo',
          action: 'project'
        },
        {
          title: 'Rentabilidad de inversiones',
          description: 'Analiza el rendimiento de tus inversiones',
          action: 'analyze'
        }
      ]
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Utilidades
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateSavingsProgress = () => {
    return Math.round((userData.currentSavings / userData.savingsGoal) * 100);
  };

  // Handlers
  const toggleBalance = () => setShowBalance(!showBalance);
  const flipCard = () => setIsCardFlipped(!isCardFlipped);
  const toggleAiSection = () => setIsAiExpanded(!isAiExpanded);
  const selectAiTool = (toolKey) => {
    setActiveAiTool(activeAiTool === toolKey ? null : toolKey);
  };

  if (isLoading) {
    return (
      <div className="homepage-loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Cargando tu información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="user-section">
            <div className="user-avatar">
              <span>{userData.initials}</span>
            </div>
            <div className="user-info">
              <h1>¡Hola, {userData.name}!</h1>
              <p>Bienvenida de vuelta</p>
            </div>
          </div>
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
            {userData.notifications > 0 && (
              <span className="notification-badge">{userData.notifications}</span>
            )}
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="main-content">
        {/* Sección de saldo con flip card mejorado */}
        <section className="balance-section">
          <div className={`balance-card-container ${isCardFlipped ? 'flipped' : ''}`}>
            {/* Botón flip mejorado */}
            <button className="flip-btn mobile-only" onClick={flipCard}>
              <span className="flip-icon">🔄</span>
              <span className="flip-text">
                {isCardFlipped ? 'Ver saldo' : 'Ver detalles'}
              </span>
            </button>

            {/* Cara frontal */}
            <div className="balance-card-face front">
              <div className="balance-card primary">
                <div className="balance-header">
                  <span className="balance-label">Saldo disponible</span>
                  <button className="toggle-btn" onClick={toggleBalance}>
                    {showBalance ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <div className="balance-amount">
                  {showBalance ? formatCurrency(userData.availableBalance) : '••••••'}
                </div>
                <div className="account-info">Cuenta principal • {userData.accountNumber}</div>
              </div>
            </div>

            {/* Cara trasera mejorada */}
            <div className="balance-card-face back">
              <div className="balance-details">
                <div className="details-header">
                  <h3>Resumen financiero</h3>
                </div>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Saldo total</span>
                    <span className="detail-value">
                      {showBalance ? formatCurrency(userData.totalBalance) : '••••••'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ahorros</span>
                    <span className="detail-value">
                      {showBalance ? formatCurrency(userData.currentSavings) : '••••••'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Progreso meta</span>
                    <span className="detail-value progress">
                      {calculateSavingsProgress()}%
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Crecimiento</span>
                    <span className="detail-value growth">+2.5% este mes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta secundaria (solo desktop) */}
            <div className="balance-card secondary desktop-only">
              <div className="balance-header">
                <span className="balance-label">Saldo total</span>
              </div>
              <div className="balance-amount">
                {showBalance ? formatCurrency(userData.totalBalance) : '••••••'}
              </div>
              <div className="growth-info">+2.5% este mes</div>
            </div>
          </div>
        </section>

        {/* Acciones rápidas */}
        <section className="quick-actions">
          <div className="actions-grid">
            {quickActions.map((action) => (
              <button key={action.id} className="action-btn" data-color={action.color}>
                <div className="action-icon">{action.icon}</div>
                <span className="action-text">{action.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Layout principal */}
        <div className="content-layout">
          <div className="main-column">
            {/* Herramientas de IA desplegables */}
            <section className="ai-section">
              <div className="ai-header" onClick={toggleAiSection}>
                <div className="ai-header-content">
                  <h2>🤖 Asistente Financiero IA</h2>
                  <p>Herramientas inteligentes para optimizar tus finanzas</p>
                </div>
                <button className={`expand-btn ${isAiExpanded ? 'expanded' : ''}`}>
                  <span className="expand-icon">▼</span>
                </button>
              </div>

              <div className={`ai-content ${isAiExpanded ? 'expanded' : ''}`}>
                {/* Selector de herramientas */}
                <div className="ai-tools-selector">
                  {Object.entries(aiTools).map(([key, tool]) => (
                    <button
                      key={key}
                      className={`tool-btn ${activeAiTool === key ? 'active' : ''}`}
                      onClick={() => selectAiTool(key)}
                    >
                      <span className="tool-icon">{tool.icon}</span>
                      <div className="tool-info">
                        <span className="tool-title">{tool.title}</span>
                        <span className="tool-description">{tool.description}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Contenido de la herramienta activa */}
                {activeAiTool && (
                  <div className="ai-tool-content">
                    <div className="tool-content-header">
                      <h4>{aiTools[activeAiTool].title}</h4>
                    </div>
                    <div className="tool-items">
                      {aiTools[activeAiTool].content.map((item, index) => (
                        <div key={index} className="tool-item">
                          <div className="item-content">
                            <h5 className="item-title">{item.title}</h5>
                            <p className="item-description">{item.description}</p>
                          </div>
                          <button className="item-action-btn">
                            {activeAiTool === 'calculator' ? 'Calcular' : 'Ver más'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones principales */}
                <div className="ai-main-actions">
                  <button className="ai-action-btn primary">
                    <span className="btn-icon">💬</span>
                    <span>Chat con IA</span>
                  </button>
                  <button className="ai-action-btn secondary">
                    <span className="btn-icon">📊</span>
                    <span>Reporte completo</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Servicios de pago */}
            <section className="services-section">
              <div className="section-header">
                <h2>Servicios de pago</h2>
              </div>
              <div className="services-grid">
                {paymentServices.map((service) => (
                  <button key={service.id} className="service-btn" data-color={service.color}>
                    <div className="service-icon">{service.icon}</div>
                    <span className="service-name">{service.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Movimientos recientes */}
            <section className="transactions-section">
              <div className="section-header">
                <h2>Movimientos recientes</h2>
                <button className="see-all-btn">Ver todos</button>
              </div>
              <div className="transactions-list">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className={`transaction-icon ${transaction.type}`}>
                      {transaction.type === 'income' ? '↓' : '↑'}
                    </div>
                    <div className="transaction-info">
                      <span className="transaction-title">{transaction.title}</span>
                      <span className="transaction-date">{transaction.date}, {transaction.time}</span>
                    </div>
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : ''}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Promociones */}
            <section className="promo-section">
              <div className="section-header">
                <h2>Ofertas especiales</h2>
              </div>
              <div className="promo-card">
                <div className="promo-content">
                  <h3>Transferencias sin costo</h3>
                  <p>Realiza transferencias gratuitas a cualquier banco durante todo septiembre</p>
                  <button className="promo-btn">Aprovechar oferta</button>
                </div>
                <div className="promo-visual">💸</div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="sidebar desktop-only">
            {/* Meta de ahorros */}
            <div className="savings-widget">
              <h3>Meta de ahorros</h3>
              <div className="savings-info">
                <div className="savings-amounts">
                  <span className="current-amount">{formatCurrency(userData.currentSavings)}</span>
                  <span className="goal-amount">de {formatCurrency(userData.savingsGoal)}</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ '--progress': `${calculateSavingsProgress()}%` }}
                  >
                    <div className="progress-fill"></div>
                  </div>
                  <span className="progress-text">
                    {calculateSavingsProgress()}% completado
                  </span>
                </div>
              </div>
              <button className="savings-btn">Ir a ahorros</button>
            </div>

            {/* Estadísticas */}
            <div className="stats-widget">
              <h3>Este mes</h3>
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
            </div>
          </aside>
        </div>
      </main>

      {/* Navegación inferior */}
      <nav className="bottom-nav mobile-tablet-only">
        {[
          { id: 'home', icon: '🏠', label: 'Inicio', active: true },
          { id: 'cards', icon: '💳', label: 'Tarjetas' },
          { id: 'savings', icon: '💰', label: 'Ahorros' },
          { id: 'analytics', icon: '📊', label: 'Análisis' },
          { id: 'profile', icon: '👤', label: 'Perfil' }
        ].map((item) => (
          <button key={item.id} className={`nav-item ${item.active ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default HomePage;