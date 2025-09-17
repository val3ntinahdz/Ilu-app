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

const DEFAULT_FORM = {
  destinatario: '',
  concepto: '',
  cantidad: '',
};

const SendScreen = () => {
  const navigate = useNavigate();
  
  // Estado para los campos del formulario
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [availableBalance, setAvailableBalance] = useState(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [lastSentAmount, setLastSentAmount] = useState(null);
  const [balanceUpdated, setBalanceUpdated] = useState(false);

  // backend connection
  useEffect(() => {
    const fetchUserBalance = async () => {
      setIsBalanceLoading(true);
      try {
        // Asumiendo que el usuario logueado es 'miguel' - en una app real vendría del contexto de autenticación
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

  // form validation
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

  // handle changes in form fields
  const handleChange = useCallback(e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrorMsg('');
  }, []);

  // handle navigation
  const handleGoBack = () => {
    navigate('/home');
  };

  // real payment with backend
  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    // Validación
    const validation = validateForm(form, availableBalance);
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    const amountToSend = Number(form.cantidad);
    const receiverWalletAddress = form.destinatario;
    setIsSending(true);

    try {
      // Llamada real al backend para realizar la transferencia
      // get the receiver wallet address
      const result = await apiService.sendMoney('miguel', 'dominga', amountToSend, receiverWalletAddress);
      
      // if (receiverWalletAddress != )
      if (result.success) {
        setIsSending(false);
        setSuccess(true);
        setLastSentAmount(amountToSend);
        
        // Actualizar el saldo con los datos reales del backend
        // El backend ya actualiza la base de datos, solo actualizamos la UI
        setAvailableBalance(prev => prev - amountToSend);
        setBalanceUpdated(true);
        
        // Remover la clase de animación después de que termine
        setTimeout(() => setBalanceUpdated(false), 600);
        
        setForm(DEFAULT_FORM);
        
        // Usuario puede navegar manualmente usando el botón de regresar
      } else {
        setIsSending(false);
        setErrorMsg(result.error || 'Error al procesar la transferencia');
      }
    } catch (error) {
      console.error('Error enviando dinero:', error);
      setIsSending(false);
      
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

  // Para futuras expansiones: hooks y handlers pueden dividirse en custom hooks
  // Ejemplo: useAvailableBalance, useSendMoney, etc.

  return (
    <div className="send-screen">
      <header className="send-header">
        <button className="back-button" onClick={handleGoBack} type="button">
          <span className="back-arrow">←</span>
          <span>Regresar</span>
        </button>
        <h1>Enviar Dinero</h1>
        <p>Transfiere fácilmente a tus contactos o cuentas</p>
        <BalanceInfo amount={availableBalance} loading={isBalanceLoading} isUpdated={balanceUpdated} />
      </header>

      <main className="send-main">
        <form className="send-form" onSubmit={handleSubmit} autoComplete="off">
          <FormField
            label="Destinatario"
            name="destinatario"
            value={form.destinatario}
            onChange={handleChange}
            placeholder="Ejemplo: $ilp-interledger-test.dev/..."
            required
            disabled={isSending}
          />
          <FormField
            label="Concepto"
            name="concepto"
            value={form.concepto}
            onChange={handleChange}
            placeholder="¿Para qué es este envío?"
            maxLength={50}
            disabled={isSending}
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
            disabled={isSending}
          />
          {errorMsg && <div className="form-error">{errorMsg}</div>}
          {success && lastSentAmount && (
            <div className="form-success">
              <div className="success-title">¡Transferencia realizada exitosamente!</div>
              <div className="success-amount">
                Cantidad enviada: {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                }).format(lastSentAmount)}
              </div>
              <div className="success-note">El dinero ha sido transferido y tu saldo actualizado.</div>
            </div>
          )}
          <button
            type="submit"
            className="send-btn"
            disabled={isSending || isBalanceLoading}
          >
            {isSending ? (
              <span className="sending-loader"></span>
            ) : (
              <>
                <span>Transferir</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default SendScreen;