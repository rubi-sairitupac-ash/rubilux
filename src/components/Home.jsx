import React, { useEffect, useState } from 'react';

export default function Home({ usuario, onSelectMenu }) {
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalMonto: '0.00',
    totalClientes: 0,
    totalProductos: 0
  });

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container-fluid py-3">
      <div className="jumbotron bg-light p-4 rounded shadow-sm border mb-4">
        <h1 className="display-6 text-info">¡Bienvenido, {usuario?.nombres}!</h1>
        <p className="lead text-secondary">
          Sistema de Ventas Web Sairitupac desarrollado con <strong>React JS</strong> conectado a la base de datos MySQL <code>mi_base</code>.
        </p>
        <hr className="my-3" />
        <p>Selecciona una opción del menú superior o utiliza los accesos directos rápidos:</p>
        <button className="btn btn-info text-white me-2" onClick={() => onSelectMenu('RegistrarVenta')}>
          ⚡ Registrar Nueva Venta
        </button>
        <button className="btn btn-outline-info me-2" onClick={() => onSelectMenu('Producto')}>
          📦 Ver Productos
        </button>
        <button className="btn btn-outline-info" onClick={() => onSelectMenu('Clientes')}>
          👥 Ver Clientes
        </button>
      </div>

      <div className="row g-3">
        <div className="col-md-3">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Ventas Totales</h5>
              <p className="card-text fs-4 font-weight-bold">S/. {stats.totalMonto}</p>
              <small>{stats.totalVentas} comprobantes emitidos</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white bg-primary shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Clientes</h5>
              <p className="card-text fs-4 font-weight-bold">{stats.totalClientes}</p>
              <small>Clientes registrados</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white bg-info shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Productos</h5>
              <p className="card-text fs-4 font-weight-bold">{stats.totalProductos}</p>
              <small>Items en catálogo</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white bg-secondary shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Base de Datos</h5>
              <p className="card-text fs-4 font-weight-bold">MySQL 3306</p>
              <small>mi_base activa</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
