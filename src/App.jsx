import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Producto from './components/Producto';
import Empleado from './components/Empleado';
import Clientes from './components/Clientes';
import RegistrarVenta from './components/RegistrarVenta';

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('usuario_ventas_react');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeMenu, setActiveMenu] = useState('Home');

  const handleLoginSuccess = (user) => {
    setUsuario(user);
    localStorage.setItem('usuario_ventas_react', JSON.stringify(user));
    setActiveMenu('Home');
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario_ventas_react');
  };

  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-vh-100 bg-white">
      {/* Barra de Navegación idéntica a Principal.jsp */}
      <Navbar
        usuario={usuario}
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        onLogout={handleLogout}
      />

      {/* Contenedor principal idéntico a Principal.jsp: <div class="m-4"> */}
      <div className="m-4">
        {activeMenu === 'Home' && <Home usuario={usuario} onSelectMenu={setActiveMenu} />}
        {activeMenu === 'Producto' && <Producto />}
        {activeMenu === 'Empleado' && <Empleado />}
        {activeMenu === 'Clientes' && <Clientes />}
        {activeMenu === 'RegistrarVenta' && <RegistrarVenta usuario={usuario} />}
      </div>
    </div>
  );
}
