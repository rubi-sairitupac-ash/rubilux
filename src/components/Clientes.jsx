import React, { useState, useEffect } from 'react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [id, setId] = useState(null);
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [dir, setDir] = useState('');
  const [estado, setEstado] = useState('1');
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  const cargarClientes = async () => {
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      if (data.success) {
        setClientes(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const limpiarForm = () => {
    setId(null);
    setDni('');
    setNombres('');
    setDir('');
    setEstado('1');
  };

  // Agregar Cliente (accion=Agregar)
  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!dni.trim() || !nombres.trim()) {
      setMensaje({ text: 'DNI y Nombres son campos obligatorios.', type: 'warning' });
      return;
    }

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, nombres, direccion: dir, estado })
      });
      const data = await res.json();

      if (data.success) {
        setMensaje({ text: 'Cliente registrado exitosamente.', type: 'success' });
        limpiarForm();
        cargarClientes();
      } else {
        setMensaje({ text: data.message, type: 'danger' });
      }
    } catch (err) {
      setMensaje({ text: 'Error al agregar: ' + err.message, type: 'danger' });
    }
  };

  // Editar Cliente (accion=Editar)
  const handleEditar = (clie) => {
    setId(clie.IdCliente);
    setDni(clie.Dni);
    setNombres(clie.Nombres);
    setDir(clie.Direccion || '');
    setEstado(clie.Estado || '1');
    setMensaje({ text: `Editando cliente #${clie.IdCliente}`, type: 'info' });
  };

  // Actualizar Cliente (accion=Actualizar)
  const handleActualizar = async (e) => {
    e.preventDefault();
    if (!id) {
      setMensaje({ text: 'Seleccione un cliente de la tabla para editar.', type: 'warning' });
      return;
    }

    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, nombres, direccion: dir, estado })
      });
      const data = await res.json();

      if (data.success) {
        setMensaje({ text: 'Cliente actualizado exitosamente.', type: 'success' });
        limpiarForm();
        cargarClientes();
      } else {
        setMensaje({ text: data.message, type: 'danger' });
      }
    } catch (err) {
      setMensaje({ text: 'Error al actualizar: ' + err.message, type: 'danger' });
    }
  };

  // Eliminar Cliente (accion=Delete)
  const handleEliminar = async (idCli) => {
    if (!window.confirm(`¿Está seguro de eliminar el cliente #${idCli}?`)) return;

    try {
      const res = await fetch(`/api/clientes/${idCli}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMensaje({ text: 'Cliente eliminado.', type: 'success' });
        if (id === idCli) limpiarForm();
        cargarClientes();
      } else {
        setMensaje({ text: data.message, type: 'danger' });
      }
    } catch (err) {
      setMensaje({ text: 'Error al eliminar: ' + err.message, type: 'danger' });
    }
  };

  return (
    <div className="container-fluid py-2">
      {mensaje.text && (
        <div className={`alert alert-${mensaje.type} py-2 alert-dismissible`} role="alert">
          {mensaje.text}
          <button type="button" className="btn-close float-end" onClick={() => setMensaje({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Estructura d-flex idéntica a Clientes.jsp */}
      <div className="d-flex flex-wrap">
        {/* Formulario col-sm-5 */}
        <div className="col-lg-5 col-md-12 pe-lg-3 mb-3">
          <div className="card shadow-sm border">
            <div className="card-body">
              <form>
                <div className="form-group mb-3">
                  <label className="form-label font-weight-bold">Dni</label>
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    name="txtDni"
                    className="form-control"
                    placeholder="Número de DNI"
                    maxLength={8}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label font-weight-bold">Nombres</label>
                  <input
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    name="txtNombres"
                    className="form-control"
                    placeholder="Nombres Completos"
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label font-weight-bold">Direccion</label>
                  <input
                    type="text"
                    value={dir}
                    onChange={(e) => setDir(e.target.value)}
                    name="txtDir"
                    className="form-control"
                    placeholder="Dirección del Cliente"
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="form-label font-weight-bold">Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    name="txtEstado"
                    className="form-control"
                  >
                    <option value="1">1 - Activo</option>
                    <option value="0">0 - Inactivo</option>
                  </select>
                </div>

                <div className="d-flex gap-2">
                  <button type="button" onClick={handleAgregar} className="btn btn-info text-white me-2">
                    Agregar
                  </button>
                  <button type="button" onClick={handleActualizar} className="btn btn-success me-2">
                    Actualizar
                  </button>
                  {id && (
                    <button type="button" onClick={limpiarForm} className="btn btn-secondary">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Tabla col-sm-7 */}
        <div className="col-lg-7 col-md-12">
          <div className="card shadow-sm border">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>DNI</th>
                      <th>NOMBRES</th>
                      <th>DIRECCION</th>
                      <th>ESTADO</th>
                      <th className="text-center">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No hay clientes registrados.
                        </td>
                      </tr>
                    ) : (
                      clientes.map((clie) => (
                        <tr key={clie.IdCliente}>
                          <td>{clie.IdCliente}</td>
                          <td><strong>{clie.Dni}</strong></td>
                          <td>{clie.Nombres}</td>
                          <td>{clie.Direccion || '---'}</td>
                          <td>
                            <span className={`badge ${clie.Estado === '1' ? 'bg-success' : 'bg-secondary'}`}>
                              {clie.Estado === '1' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => handleEditar(clie)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleEliminar(clie.IdCliente)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
