import React, { useState, useEffect, useCallback } from 'react';
import './homePage.css';

const HomePage = () => {
  // === Estado proveniente del backend ===
  const [userData, setUserData] = useState(null);
  const [quickActions, setQuickActions] = useState([]);
  const [paymentServices, setPaymentServices] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [aiTools, setAiTools] = useState({});
  // UI
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [activeAiTool, setActiveAiTool] = useState(null);

  // === PREPARAR: aquí irá la lógica del backend ===
  useEffect(() => {
    setIsLoading(true);
    // Simulación, reemplazar por fetch/axios a backend
    setTimeout(() => {
      setUserData({
        name: 'María González',
        initials: 'MG',
        availableBalance: 12450.54,
        totalBalance: 21350.54,
        currentSavings: 12500,
        savingsGoal: 50000,
        notifications: 2,
        accountNumber: '**** 4532'
      });
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
      setRecentTransactions([
        { id: 1, type: 'income', title: 'Depósito bancario', amount: 2500, date: 'Hoy', time: '14:30' },
        { id: 2, type: 'expense', title: 'Pago servicios', amount: -199, date: 'Ayer', time: '09:15' },
        { id: 3, type: 'expense', title: 'Transferencia', amount: -1250, date: '28 Ago', time: '16:45' }
      ]);
      setMonthlyStats([
        { label: 'Ingresos', value: 18548.99, type: 'income' },
        { label: 'Gastos', value: 1445.93, type: 'expense' },
        { label: 'Balance', value: 17103.06, type: 'positive' }
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
      });
      setIsLoading(false);
    }, 800);
  }, []);

  // === UTILIDADES ESCALABLES ===
  const formatCurrency = useCallback(amount =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount), []);

  const calculateSavingsProgress = useCallback(() => {
    if (!userData) return 0;
    return Math.round((userData.currentSavings / userData.savingsGoal) * 100);
  }, [userData]);

  // === HANDLERS REUTILIZABLES ===
  const toggleBalance = useCallback(() => setShowBalance(b => !b), []);
  const flipCard = useCallback(() => setIsCardFlipped(f => !f), []);
  const toggleAiSection = useCallback(() => setIsAiExpanded(e => !e), []);
  const selectAiTool = useCallback(toolKey => {
    setActiveAiTool(prev => (prev === toolKey ? null : toolKey));
  }, []);

  if (isLoading || !userData) {
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
          <button className="notification-btn btn-secondary">
            <span className="notification-icon">🔔</span>
            {userData.notifications > 0 && (
              <span className="notification-badge">{userData.notifications}</span>
            )}
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Tarjeta de saldo animada y minimalista */}
        <section className="balance-section">
          <div className={`balance-card-container${isCardFlipped ? ' flipped' : ''}`}>
            {/* Cara frontal */}
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
            {/* Cara trasera */}
            <div className="balance-card-face back">
              <section className="balance-details balance-details-small">
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
                    <span className="detail-value">
                      {calculateSavingsProgress()}%
                    </span>
                  </div>
                </div>
                <button className="flip-btn" onClick={flipCard}>
                  <span className="flip-icon">🔄</span>
                  <span className="flip-text">
                    {isCardFlipped ? 'Ver saldo' : 'Ver detalles'}
                  </span>
                </button>
              </section>
            </div>
          </div>
        </section>

        {/* Acciones rápidas */}
        <section className="quick-actions">
          <div className="actions-grid">
            {quickActions.map(action => (
              <button
                key={action.id}
                className="action-btn"
                data-color={action.color}
                // TODO: Implementar onClick para acción rápida
              >
                <div className="action-icon">{action.icon}</div>
                <span className="action-text">{action.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Layout principal */}
        <div className="content-layout">
          <div className="main-column">
            {/* Herramientas de IA */}
            <section className="ai-section">
              <div className="ai-header" onClick={toggleAiSection}>
                <div className="ai-header-content">
                  <h2>🤖 Asistente Financiero IA</h2>
                  <p>Herramientas inteligentes para optimizar tus finanzas</p>
                </div>
                <button className={`expand-btn btn-secondary${isAiExpanded ? ' expanded' : ''}`}>
                  <span className="expand-icon">▼</span>
                </button>
              </div>
              <div className={`ai-content${isAiExpanded ? ' expanded' : ''}`}>
                <div className="ai-tools-selector">
                  {Object.entries(aiTools).map(([key, tool]) => (
                    <button
                      key={key}
                      className={`tool-btn btn-secondary${activeAiTool === key ? ' active' : ''}`}
                      onClick={() => selectAiTool(key)}
                      type="button"
                    >
                      <span className="tool-icon">{tool.icon}</span>
                      <div className="tool-info">
                        <span className="tool-title">{tool.title}</span>
                        <span className="tool-description">{tool.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
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
                          {/* TODO: Acción de IA */}
                          <button className="item-action-btn btn-secondary">
                            {activeAiTool === 'calculator' ? 'Calcular' : 'Ver más'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="ai-main-actions">
                  <button className="ai-action-btn btn-primary">
                    <span className="btn-icon">💬</span>
                    <span>Chat con IA</span>
                  </button>
                  <button className="ai-action-btn btn-secondary">
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
                {paymentServices.map(service => (
                  <button
                    key={service.id}
                    className="service-btn"
                    data-color={service.color}
                    // TODO: Acción para servicio
                  >
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
                <button className="see-all-btn btn-outline">
                  Ver todos
                  {/* TODO: Implementar onClick para historial */}
                </button>
              </div>
              <div className="transactions-list">
                {recentTransactions.map(transaction => (
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
              <button className="savings-btn btn-outline">
                Ir a ahorros
                {/* TODO: Acción Ir a ahorros */}
              </button>
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
        ].map(item => (
          <button key={item.id} className={`nav-item btn${item.active ? ' active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default HomePage;