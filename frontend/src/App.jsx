import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, rememberMe });

  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-logo">
          <h1>ilu</h1>
          <p>Tu app financiera de confianza</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-floating">
            <input
              type="email"
              className="form-control"
              id="floatingInput"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="floatingInput">Correo electrónico</label>
          </div>

          <div className="form-floating">
            <input
              type="password"
              className="form-control"
              id="floatingPassword"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="floatingPassword">Contraseña</label>
          </div>

          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Recordarme
            </label>
          </div>

          <button className="btn btn-primary btn-login w-100" type="submit">
            Iniciar Sesión
          </button>

          <div className="login-footer">
            <p>
              <a href="#forgot" className="forgot-link">¿Olvidaste tu contraseña?</a>
            </p>
            <p>
              ¿No tienes cuenta? <a href="#register" className="register-link">Regístrate</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;