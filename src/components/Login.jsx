import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [user, setUser] = useState('emp01');
  const [pass, setPass] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });
      const data = await res.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Usuario o Contraseña incorrectos.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 col-lg-4">
      <div className="card col-sm-10 mx-auto shadow-sm">
        <div className="card-body">
          <form className="form-sign" onSubmit={handleSubmit}>
            <div className="form-group text-center mb-3">
              <h3 className="mb-2">Login</h3>
              <img src="/img/logo.png" height="70" width="70" alt="Logo" className="mb-2" />
              <div>
                <label className="text-muted font-weight-bold">Bienvenido al Sistema</label>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 text-center" role="alert" style={{ fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <div className="form-group mb-3">
              <label className="form-label">Usuario:</label>
              <input
                className="form-control"
                type="text"
                name="txtuser"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Ingrese su Usuario"
                required
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Contraseña:</label>
              <div className="input-group">
                <input
                  id="txtpass"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  name="txtpass"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Ingrese su Contraseña (DNI)"
                  required
                />
                <button
                  id="show_password"
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title="Mostrar / Ocultar Contraseña"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <small className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
                * Clave por defecto en MySQL: DNI del empleado
              </small>
            </div>

            <div className="form-group mt-4">
              <input
                className="btn btn-primary btn-block w-100"
                type="submit"
                name="accion"
                value={loading ? 'Verificando...' : 'Ingresar'}
                disabled={loading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
