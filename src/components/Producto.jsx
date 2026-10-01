import React, { useState, useEffect } from 'react';

export default function Producto() {
  const [productos, setProductos] = useState([]);
  const [id, setId] = useState(null);
  const [nombres, setNombres] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [estado, setEstado] = useState('1');
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  const cargarProductos = async () => {
    try {
      const res = await fetch('/api/productos');
      const data = await res.json();
      if (data.success) {
        setProductos(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const limpiarForm = () => {
    setId(null);
    setNombres('');
    setPrecio('');
    setStock('');
    setEstado('1');
  };

  // Agregar Producto (accion=Agregar)
  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nombres.trim() || !precio || !stock) {
      setMensaje({ text: 'Todos los campos son obligatorios.', type: 'warning' });
      return;
    }

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombres, precio: parseFloat(precio), stock: parseInt(stock, 10), estado })
      });
      const data = await res.json();

      if (data.success) {
        setMensaje({ text: 'Producto registrado exitosamente.', type: 'success' });
        limpiarForm();
        cargarProductos();
      } else {
        setMensaje({ text: data.message, type: 'danger' });
      }
    } catch (err) {
      setMensaje({ text: 'Error al agregar: ' + err.message, type: 'danger' });
    }
  };

  // Editar Producto (accion=Editar)
  const handleEditar = (p) => {
    setId(p.IdProducto);
    setNombres(p.Nombres);
    setPrecio(p.Precio);
    setStock(p.Stock);
    setEstado(p.Estado || '1');
    setMensaje({ text: `Editando producto #${p.IdProducto}`, type: 'info' });
  };

  // Actualizar Producto (accion=Actualizar)
  const handleActualizar = async (e) => {
    e.preventDefault();
    if (!id) {
      setMensaje({ text: 'Seleccione un producto de la tabla para editar.', type: 'warning' });
      return;
    }

    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombres, precio: parseFloat(precio), stock: parseInt(stock, 10), estado })
      });
      const data = await res.json();

      if (data.success) {
        setMensaje({ text: 'Producto actualizado exitosamente.', type: 'success' });
        limpiarForm();
        cargarProductos();
      } else {
        setMensaje({ text: data.message, type: 'danger' });
      }
    } catch (err) {
      setMensaje({ text: 'Error al actualizar: ' + err.message, type: 'danger' });
    }
  };

  // Eliminar Producto (accion=Delete)
  const handleEliminar = async (idProd) => {
    if (!window.confirm(`¿Está seguro de eliminar el producto #${idProd}?`)) return;

    try {
      const res = await fetch(`/api/productos/${idProd}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMensaje({ text: 'Producto eliminado.', type: 'success' });
        if (id === idProd) limpiarForm();
        cargarProductos();
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

      {/* Estructura d-flex idéntica al diseño del proyecto */}
      <div className="d-flex flex-wrap">
        {/* Formulario col-sm-5 */}
        <div className="col-lg-5 col-md-12 pe-lg-3 mb-3">
          <div className="card shadow-sm border">
            <div className="card-body">
              <form>
                <div className="form-group mb-3">
                  <label className="form-label font-weight-bold">Nombres</label>
                  <input
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    name="txtNombres"
                    className="form-control"
                    placeholder="Descripción del Producto"
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label font-weight-bold">Precio (S/.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    name="txtPre"
                    className="form-control"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label font-weight-bold">Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    name="txtStock"
                    className="form-control"
                    placeholder="Cantidad disponible"
                    required
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
                      <th>NOMBRES</th>
                      <th>PRECIO</th>
                      <th>STOCK</th>
                      <th>ESTADO</th>
                      <th className="text-center">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No hay productos registrados.
                        </td>
                      </tr>
                    ) : (
                      productos.map((prod) => (
                        <tr key={prod.IdProducto}>
                          <td>{prod.IdProducto}</td>
                          <td><strong>{prod.Nombres}</strong></td>
                          <td>S/. {Number(prod.Precio).toFixed(2)}</td>
                          <td>
                            <span className={`badge ${prod.Stock < 10 ? 'bg-warning text-dark' : 'bg-primary'}`}>
                              {prod.Stock} unid.
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${prod.Estado === '1' ? 'bg-success' : 'bg-secondary'}`}>
                              {prod.Estado === '1' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => handleEditar(prod)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleEliminar(prod.IdProducto)}
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
