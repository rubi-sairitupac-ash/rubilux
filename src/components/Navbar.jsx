import React, { useState } from 'react';

export default function Navbar({ usuario, activeMenu, onSelectMenu, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-info shadow-sm px-3">
      <div className="container-fluid">
        <span className="navbar-brand font-weight-bold text-white me-4" style={{ cursor: 'pointer' }} onClick={() => onSelectMenu('Home')}>
          <img src="/img/logo.png" height="35" width="35" alt="Logo" className="me-2 rounded" />
          Sistema de Ventas
        </span>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className={`nav-item ${activeMenu === 'Home' ? 'active' : ''}`}>
              <button
                className={`btn ${activeMenu === 'Home' ? 'btn-light text-info font-weight-bold' : 'btn-outline-light'} me-2`}
                style={{ border: 'none' }}
                onClick={() => onSelectMenu('Home')}
              >
                Home
              </button>
            </li>
            <li className={`nav-item ${activeMenu === 'Producto' ? 'active' : ''}`}>
              <button
                className={`btn ${activeMenu === 'Producto' ? 'btn-light text-info font-weight-bold' : 'btn-outline-light'} me-2`}
                style={{ border: 'none' }}
                onClick={() => onSelectMenu('Producto')}
              >
                Producto
              </button>
            </li>
            <li className={`nav-item ${activeMenu === 'Empleado' ? 'active' : ''}`}>
              <button
                className={`btn ${activeMenu === 'Empleado' ? 'btn-light text-info font-weight-bold' : 'btn-outline-light'} me-2`}
                style={{ border: 'none' }}
                onClick={() => onSelectMenu('Empleado')}
              >
                Empleado
              </button>
            </li>
            <li className={`nav-item ${activeMenu === 'Clientes' ? 'active' : ''}`}>
              <button
                className={`btn ${activeMenu === 'Clientes' ? 'btn-light text-info font-weight-bold' : 'btn-outline-light'} me-2`}
                style={{ border: 'none' }}
                onClick={() => onSelectMenu('Clientes')}
              >
                Clientes
              </button>
            </li>
            <li className={`nav-item ${activeMenu === 'RegistrarVenta' ? 'active' : ''}`}>
              <button
                className={`btn ${activeMenu === 'RegistrarVenta' ? 'btn-light text-info font-weight-bold' : 'btn-outline-light'} me-2`}
                style={{ border: 'none' }}
                onClick={() => onSelectMenu('RegistrarVenta')}
              >
                Nueva Venta
              </button>
            </li>
          </ul>
        </div>

        {/* Dropdown de Usuario exactamente como en Principal.jsp */}
        <div className="dropdown position-relative">
          <button
            style={{ border: 'none' }}
            className="btn btn-outline-light dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            👤 {usuario?.nombres || usuario?.user || 'Usuario'}
          </button>

          {dropdownOpen && (
            <div
              className="dropdown-menu dropdown-menu-end text-center show shadow"
              style={{ position: 'absolute', right: 0, top: '100%', minWidth: '200px', zIndex: 1050 }}
            >
              <div className="dropdown-item py-2">
                <img src="/img/logo.png" height="60" width="60" alt="Logo" className="rounded-circle" />
              </div>
              <div className="dropdown-item font-weight-bold text-dark">@{usuario?.user}</div>
              <div className="dropdown-item text-muted small">Tel: {usuario?.telefono || 'N/A'}</div>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item text-danger font-weight-bold"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
              >
                🚪 Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
