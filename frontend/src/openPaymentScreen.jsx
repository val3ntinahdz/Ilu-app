import React, { useState, useEffect, useCallback } from 'react';
import './sendScreen.css';

/**
 * Componente reutilizable para mostrar el saldo disponible
 */
function BalanceInfo({ amount, loading }) {
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
      <span className="send-balance-amount">
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
  // Estado para los campos del formulario
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [availableBalance, setAvailableBalance] = useState(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);

  // --- PREPARADO PARA EL BACKEND ---
  useEffect(() => {
    // TODO: Reemplaza por llamada real al backend
    setIsBalanceLoading(true);
    setTimeout(() => {
      setAvailableBalance(12450.54); // <-- reemplaza por valor real del backend
      setIsBalanceLoading(false);
    }, 400);
  }, []);

  // Validación de formulario centralizada (fácil de expandir)
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

  // Manejar cambios en los campos
  const handleChange = useCallback(e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrorMsg('');
  }, []);

  // Simulación de envío
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

    setIsSending(true);

    // TODO: Aquí implementar la llamada real al backend para realizar la transferencia
    setTimeout(() => {
      setIsSending(false);
      setSuccess(true);
      setForm(DEFAULT_FORM);
      // Opcional: refrescar el saldo disponible consultando de nuevo al backend
      // setAvailableBalance(availableBalance - Number(form.cantidad));
    }, 1200);
  };

  // Para futuras expansiones: hooks y handlers pueden dividirse en custom hooks
  // Ejemplo: useAvailableBalance, useSendMoney, etc.

  return (
    <div className="send-screen">
      <header className="send-header">
        <h1>Enviar Dinero</h1>
        <p>Transfiere fácilmente a tus contactos o cuentas</p>
        <BalanceInfo amount={availableBalance} loading={isBalanceLoading} />
      </header>

      <main className="send-main">
        <form className="send-form" onSubmit={handleSubmit} autoComplete="off">
          <FormField
            label="Destinatario"
            name="destinatario"
            value={form.destinatario}
            onChange={handleChange}
            placeholder="Nombre, correo o cuenta"
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
          {success && (
            <div className="form-success">
              ¡Transferencia realizada exitosamente!
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
                <span className="send-btn-icon">🚀</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default SendScreen;