import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from './services/api.js';
import './sendScreen.css';

/**
 * Componente reutilizable para mostrar el saldo disponible
 */
function BalanceInfo({ amount, loading, isUpdated }) {
  const formatCurrency = useCallback(
    amt =>
      new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(amt),
    []
  );
  return (
    <div className="send-balance">
      <span>Dinero disponible:</span>
      <span className={`send-balance-amount ${isUpdated ? 'updated' : ''}`}>
        {loading ? <span className="sending-loader"></span> : formatCurrency(amount)}
      </span>
    </div>
  );
}

/**
 * Componente reutilizable para un input de formulario
 */
function FormField({ label, name, type = 'text', value, onChange, placeholder, required, disabled, children, ...rest }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label} {required && <span>*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        {...rest}
      />
      {children}
    </div>
  );
}

/**
 * Componente para mostrar el estado de autorización
 */
function AuthorizationPanel({ authData, onRetry, onCancel }) {
  const [authWindow, setAuthWindow] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleAuthorize = () => {
    // Abrir ventana de autorización
    const newWindow = window.open(
      authData.authorizationUrl,
      'authorization',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );
    setAuthWindow(newWindow);

    // Monitorear si la ventana se cierra
    const checkClosed = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(checkClosed);
        setAuthWindow(null);
        // Dar tiempo para que el pago se procese
        setIsChecking(true);
        setTimeout(() => {
          setIsChecking(false);
          onRetry(); // Verificar estado del pago
        }, 3000);
      }
    }, 1000);
  };

  return (
    <div className="authorization-panel">
      <div className="auth-header">
        <h3>Autorización Requerida</h3>
        <p>Miguel necesita autorizar este pago en su wallet.</p>
      </div>
      
      <div className="payment-details">
        <div className="detail-row">
          <span>Monto a enviar:</span>
          <span>${authData.breakdown.toFamily}</span>
        </div>
        <div className="detail-row">
          <span>Monto que se debitará:</span>
          <span>{authData.paymentDetails.debitAmount}</span>
        </div>
        <div className="detail-row">
          <span>Monto que recibirá:</span>
          <span>{authData.paymentDetails.receiveAmount}</span>
        </div>
      </div>

      <div className="auth-actions">
        <button 
          onClick={handleAuthorize} 
          className="auth-button primary"
          disabled={isChecking}
        >
          {isChecking ? 'Verificando...' : 'Abrir Autorización'}
        </button>
        <button 
          onClick={onCancel} 
          className="auth-button secondary"
          disabled={isChecking}
        >
          Cancelar
        </button>
      </div>

      <div className="auth-instructions">
        <p>
          <strong>Instrucciones:</strong>
        </p>
        <ol>
          <li>Haz clic en "Abrir Autorización"</li>
          <li>Se abrirá una nueva ventana</li>
          <li>Autoriza el pago en tu wallet</li>
          <li>Cierra la ventana cuando veas "Accepted"</li>
          <li>El pago se procesará automáticamente</li>
        </ol>
      </div>

      {authWindow && !authWindow.closed && (
        <div className="auth-status">
          <span className="status-indicator"></span>
          <span>Ventana de autorización abierta...</span>
        </div>
      )}
    </div>
  );
}

const DEFAULT_FORM = {
  destinatario: 'dominga', // Pre-filled for demo
  concepto: '',
  cantidad: '',
};

// Map wallet addresses to user-friendly names
const RECIPIENTS = {
  'dominga': 'Dominga García (Oaxaca)',
  'miguel': 'Miguel García (Los Angeles)'
};

const SendScreen = () => {
  const navigate = useNavigate();
  
  // Estado para los campos del formulario
  const [form, setForm] = useState(DEFAULT_FORM);
  const [paymentState, setPaymentState] = useState('idle'); // idle, processing, authorization, completed, error
  const [errorMsg, setErrorMsg] = useState('');
  const [availableBalance, setAvailableBalance] = useState(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [balanceUpdated, setBalanceUpdated] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // Backend connection
  useEffect(() => {
    const fetchUserBalance = async () => {
      setIsBalanceLoading(true);
      try {
        const balance = await apiService.getUserBalance('miguel');
        setAvailableBalance(balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setErrorMsg('Error al cargar el saldo. Verifica que el backend esté funcionando en puerto 3000.');
      } finally {
        setIsBalanceLoading(false);
      }
    };

    fetchUserBalance();
  }, []);

  // Form validation
  function validateForm(fields, availableBalance) {
    if (!fields.destinatario || !fields.cantidad) {
      return 'Todos los campos obligatorios deben ser llenados.';
    }
    if (Number(fields.cantidad) <= 0) {
      return 'La cantidad debe ser mayor a cero.';
    }
    if (Number(fields.cantidad) > Number(availableBalance)) {
      return 'No tienes saldo suficiente para esta transferencia.';
    }
    return '';
  }

  // Handle changes in form fields
  const handleChange = useCallback(e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrorMsg('');
  }, []);

  // Handle navigation
  const handleGoBack = () => {
    navigate('/home');
  };

  // Reset payment state
  const handleReset = () => {
    setPaymentState('idle');
    setPaymentResult(null);
    setErrorMsg('');
    setForm(DEFAULT_FORM);
  };

  // Retry/check payment status
  const handleRetry = async () => {
    if (paymentResult?.transactionId) {
      try {
        setPaymentState('processing');
        const status = await apiService.checkPaymentStatus(paymentResult.transactionId);
        
        if (status.success && status.status === 'COMPLETED') {
          setPaymentState('completed');
          // Update balance
          const newBalance = await apiService.getUserBalance('miguel');
          setAvailableBalance(newBalance);
          setBalanceUpdated(true);
          setTimeout(() => setBalanceUpdated(false), 600);
        } else {
          setPaymentState('authorization');
        }
      } catch (error) {
        setPaymentState('error');
        setErrorMsg('Error verificando el estado del pago');
      }
    }
  };

  // Real payment with backend
  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    setPaymentState('processing');

    // Validación
    const validation = validateForm(form, availableBalance);
    if (validation) {
      setErrorMsg(validation);
      setPaymentState('idle');
      return;
    }

    const amountToSend = Number(form.cantidad);

    try {
      // real backend calling to execute transactions
      const result = await apiService.sendMoney('miguel', form.destinatario, amountToSend);
      
      // debug
      console.log('Resultado del backend:', result);
      
      if (result.success) {
        setPaymentResult(result);
        
        if (result.status === 'PENDING_AUTHORIZATION') {
          setPaymentState('authorization');
          
          // FIX: Check if we have a valid authorization URL
          if (result.authorizationUrl) {
            const authUrl = result.authorizationUrl;
            console.log('Opening authorization window with URL:', authUrl);
            
            // Open authorization window immediately
            const authWindow = window.open(authUrl, 'authorization', 'width=600,height=700');

            // Check if window opened successfully
            if (!authWindow) {
              setErrorMsg('No se pudo abrir la ventana de autorización. Verifica que no esté bloqueada por el navegador.');
              setPaymentState('error');
              return;
            }

            // Monitor when the window closes
            const checkClosed = setInterval(() => {
              if (authWindow.closed) {
                clearInterval(checkClosed);
                
                console.log('Authorization window closed, checking payment status...');
                // After closing, verify payment status
                setPaymentState('processing');
                
                setTimeout(async () => {
                  try {
                    console.log('Completing payment with data:', result);
                    const completionResult = await apiService.completePayment(result);
                    console.log('Payment completion result:', completionResult);

                    if (completionResult.success) {
                      console.log('Payment completed successfully!');
                      // Check if payment completed by checking balance
                      const newBalance = await apiService.getUserBalance('miguel');
                      console.log('Updated balance:', newBalance);

                      setPaymentState('completed');
                      setAvailableBalance(newBalance);
                      setBalanceUpdated(true);
                      setTimeout(() => setBalanceUpdated(false), 600);

                    } else {
                      setPaymentState('error');
                      setErrorMsg('El pago no se completó. Por favor verifica si autorizaste correctamente e intenta de nuevo.');
                    }
                    
                  } catch (error) {
                    console.error('Error checking payment status:', error);
                    setPaymentState('error');
                    setErrorMsg('Error verificando el estado del pago. Por favor verifica tu saldo manualmente.');
                  }
                }, 2000); // Wait 3 seconds for payment to process
              }
            }, 1000);
            
          } else {
            setPaymentState('error');
            setErrorMsg('No se recibió URL de autorización del servidor.');
          }
          
        } else if (result.status === 'COMPLETED') {
          // Payment completed immediately
          setPaymentState('completed');
          
          // Update balance
          setAvailableBalance(prev => prev - amountToSend);
          setBalanceUpdated(true);
          setTimeout(() => setBalanceUpdated(false), 600);
        }
      } else {
        setPaymentState('error');
        setErrorMsg(result.error || 'Error al procesar la transferencia');
      }
    } catch (error) {
      console.error('Error enviando dinero:', error);
      setPaymentState('error');
      
      // Mensajes de error más específicos
      if (error.message.includes('fetch')) {
        setErrorMsg('Error de conexión con el servidor. Verifica que el backend esté funcionando.');
      } else if (error.message.includes('404')) {
        setErrorMsg('Servicio no encontrado. Verifica la configuración del servidor.');
      } else if (error.message.includes('500')) {
        setErrorMsg('Error interno del servidor. Intenta de nuevo en unos momentos.');
      } else {
        setErrorMsg('Error inesperado. Por favor intenta de nuevo.');
      }
    }
  };

  return (
    <div className="send-screen">
      <header className="send-header">
        <button className="back-button" onClick={handleGoBack} type="button">
          <span className="back-arrow">←</span>
          <span>Regresar</span>
        </button>
        <h1>Enviar Dinero</h1>
        <p>Transfiere fácilmente usando Open Payments</p>
        <BalanceInfo amount={availableBalance} loading={isBalanceLoading} isUpdated={balanceUpdated} />
      </header>

      <main className="send-main">
        {paymentState === 'idle' && (
          <form className="send-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label htmlFor="destinatario">
                Destinatario <span>*</span>
              </label>
              <select
                id="destinatario"
                name="destinatario"
                value={form.destinatario}
                onChange={handleChange}
                required
                disabled={paymentState === 'processing'}
              >
                <option value="">Selecciona un destinatario</option>
                {Object.entries(RECIPIENTS).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <FormField
              label="Concepto"
              name="concepto"
              value={form.concepto}
              onChange={handleChange}
              placeholder="¿Para qué es este envío?"
              maxLength={50}
              disabled={paymentState === 'processing'}
            />
            
            <FormField
              label="Cantidad"
              name="cantidad"
              type="number"
              value={form.cantidad}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              disabled={paymentState === 'processing'}
            />
            
            {errorMsg && <div className="form-error">{errorMsg}</div>}
            
            <button
              type="submit"
              className="send-btn"
              disabled={paymentState === 'processing' || isBalanceLoading}
            >
              {paymentState === 'processing' ? (
                <span className="sending-loader"></span>
              ) : (
                <span>Transferir con Open Payments</span>
              )}
            </button>
          </form>
        )}

        {paymentState === 'processing' && (
          <div className="processing-panel">
            <div className="sending-loader large"></div>
            <h3>Procesando pago...</h3>
            <p>Configurando la transferencia con Open Payments</p>
          </div>
        )}

        {paymentState === 'authorization' && paymentResult && (
          <div className="authorization-panel">
            <div className="auth-header">
              <h3>Autorizando Transferencia</h3>
              <p>Se ha abierto una ventana para que Miguel autorice el pago.</p>
            </div>
            
            <div className="payment-details">
              <div className="detail-row">
                <span>Monto a enviar:</span>
                <span>${form.cantidad}</span>
              </div>
              <div className="detail-row">
                <span>Destinatario:</span>
                <span>{RECIPIENTS[form.destinatario]}</span>
              </div>
              {paymentResult.breakdown && (
                <>
                  <div className="detail-row">
                    <span>A la familia:</span>
                    <span>${paymentResult.breakdown.toFamily}</span>
                  </div>
                  <div className="detail-row">
                    <span>A ahorros:</span>
                    <span>${paymentResult.breakdown.toSavings}</span>
                  </div>
                </>
              )}
            </div>

            <div className="auth-instructions">
              <p>
                <strong>Instrucciones:</strong>
              </p>
              <ol>
                <li>Se abrió automáticamente una ventana de autorización</li>
                <li>Haz clic en "Accept" en esa ventana</li>
                <li>Verás la palabra "Accepted"</li>
                <li>Cierra esa ventana</li>
                <li>La transferencia se completará automáticamente</li>
              </ol>
            </div>

            <div className="auth-status">
              <span className="status-indicator pulsing"></span>
              <span>Esperando autorización de Miguel...</span>
            </div>

            <div className="auth-actions">
              <button onClick={handleReset} className="auth-button secondary">
                Cancelar transferencia
              </button>
            </div>
          </div>
        )}

        {paymentState === 'completed' && paymentResult && (
          <div className="success-panel">
            <div className="success-icon">✓</div>
            <h3>¡Transferencia Completada!</h3>
            
            <div className="success-details">
              <div className="detail-row">
                <span>Destinatario:</span>
                <span>{RECIPIENTS[form.destinatario]}</span>
              </div>
              <div className="detail-row">
                <span>Cantidad enviada:</span>
                <span>${form.cantidad}</span>
              </div>
              {paymentResult.breakdown && (
                <>
                  <div className="detail-row">
                    <span>A la familia:</span>
                    <span>${paymentResult.breakdown.toFamily}</span>
                  </div>
                  <div className="detail-row">
                    <span>A ahorros:</span>
                    <span>${paymentResult.breakdown.toSavings}</span>
                  </div>
                </>
              )}
              <div className="detail-row">
                <span>ID de transacción:</span>
                <span className="transaction-id">{paymentResult.transactionId}</span>
              </div>
            </div>
            
            <div className="success-actions">
              <button onClick={handleReset} className="send-btn">
                Realizar otra transferencia
              </button>
              <button onClick={handleGoBack} className="send-btn secondary">
                Volver al inicio
              </button>
            </div>
          </div>
        )}

        {paymentState === 'error' && (
          <div className="error-panel">
            <div className="error-icon">⚠</div>
            <h3>Error en la transferencia</h3>
            <p>{errorMsg}</p>
            <div className="error-actions">
              <button onClick={handleReset} className="send-btn">
                Intentar de nuevo
              </button>
              <button onClick={handleGoBack} className="send-btn secondary">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SendScreen;