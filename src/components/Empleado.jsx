import React, { useState, useEffect } from 'react';

export default function Empleado() {
  const [empleados, setEmpleados] = useState([]);
  const [id, setId] = useState(null);
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [tel, setTel] = useState('');
  const [estado, setEstado] = useState('1');
  const [user, setUser] = useState('');
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  const cargarEmpleados = async () => {
    try {
      const res = await fetch('/api/empleados');
      const data = await res.json();
      if (data.success) {
        setEmpleados(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const limpiarForm = () => {
    setId(null);
    setDni('');
    setNombres('');
    setTel('');
    setEstado('1');
    setUser('');
  };

  // Agregar Empleado (accion=Agregar)
  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!dni.trim() || !nombres.trim() || !user.trim()) {
      setMensaje({ text: 'DNI, Nombres y Usuario son obligatorios.', type: 'warning' });
      return;
    }

    try {
      const res = await fetch('/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, nombres, telefono: tel, estado, user })
      });
      const data = await res.json();

      if (data.success) {
        setMensaje({ text: 'Empleado registrado exitosamente.', type: 'success' });
        limpiarForm();
        cargarEmpleados();
      } else {
        setMensaje({ text: data.message, type: 'danger' });
      }
    } catch (err) {
      setMensaje({ text: 'Error al agregar: ' + err.message, type: 'danger' });
    }
  };

  // Editar Empleado (accion=Editar)
  const handleEditar = (em) => {
    setId(em.IdEmpleado);
    setDni(em.Dni);
    setNombres(em.Nombres);
    setTel(em.Telefono || '');
    setEstado(em.Estado || '1');
    setUser(em.User || '');
    setMensaje({ text: `Editando empleado #${em.IdEmpleado}`, type: 'info' });
  };

  // Actualizar Empleado (accion=Actualizar)
  const handleActualizar = async (e) => {
    e.preventDefault();
    if (!id) {
      setMensaje({ text: 'Seleccione un empleado de la tabla para editar.', type: 'warning' });
      return;
    }

    try {
      const res = await fetch(`/api/empleados/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, nombres, telefono: tel, estado, user })
      });
      const data = await res.json();

      if (data.success) {
        setMensaje({ text: 'Empleado actualizado exitosamente.', type: 'success' });
        limpiarForm();
        cargarEmpleados();
      } else {
        setMensaje({ text: data.message, type: 'danger' });
      }
    } catch (err) {
      setMensaje({ text: 'Error al actualizar: ' + err.message, type: 'danger' });
    }
  };

  // Eliminar Empleado (accion=Delete)
  const handleEliminar = async (idEmp) => {
    if (!window.confirm(`¿Está seguro de eliminar al empleado #${idEmp}?`)) return;

    try {
      const res = await fetch(`/api/empleados/${idEmp}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMensaje({ text: 'Empleado eliminado.', type: 'success' });
        if (id === idEmp) limpiarForm();
        cargarEmpleados();
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

      {/* Estructura d-flex idéntica a Empleado.jsp */}
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
                    placeholder="DNI (Contraseña)"
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
                    placeholder="Nombres y Apellidos"
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label font-weight-bold">Telefono</label>
                  <input
                    type="text"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    name="txtTel"
                    className="form-control"
                    placeholder="Teléfono o Celular"
                  />
                </div>

                <div className="form-group mb-3">
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

                <div className="form-group mb-4">
                  <label className="form-label font-weight-bold">Usuario</label>
                  <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    name="txtUser"
                    className="form-control"
                    placeholder="Nombre de Usuario de Acceso"
                    required
                  />
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
                      <th>TELEFONO</th>
                      <th>ESTADO</th>
                      <th>USUARIO</th>
                      <th className="text-center">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          No hay empleados registrados.
                        </td>
                      </tr>
                    ) : (
                      empleados.map((em) => (
                        <tr key={em.IdEmpleado}>
                          <td>{em.IdEmpleado}</td>
                          <td><strong>{em.Dni}</strong></td>
                          <td>{em.Nombres}</td>
                          <td>{em.Telefono || '---'}</td>
                          <td>
                            <span className={`badge ${em.Estado === '1' ? 'bg-success' : 'bg-secondary'}`}>
                              {em.Estado === '1' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td><code>@{em.User}</code></td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => handleEditar(em)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleEliminar(em.IdEmpleado)}
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
