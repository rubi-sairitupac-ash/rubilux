import React, { useState, useEffect } from 'react';

export default function RegistrarVenta({ usuario }) {
  // Estados para Cliente
  const [codCliente, setCodCliente] = useState('1');
  const [nomCliente, setNomCliente] = useState('');
  const [clienteActual, setClienteActual] = useState(null);

  // Estados para Producto
  const [codProducto, setCodProducto] = useState('1');
  const [nomProducto, setNomProducto] = useState('');
  const [precio, setPrecio] = useState('');
  const [cant, setCant] = useState(1);
  const [stock, setStock] = useState('');
  const [productoActual, setProductoActual] = useState(null);

  // Serie y Detalle de la Venta
  const [nserie, setNserie] = useState('00000001');
  const [lista, setLista] = useState([]);
  const [totalPagar, setTotalPagar] = useState(0);
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  // Cargar serie actual desde la base de datos
  useEffect(() => {
    fetch('/api/ventas/serie')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.serie) {
          setNserie(data.serie);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // 1. Buscar Cliente (Equivalente a Controlador?menu=RegistrarVenta&accion=BuscarCliente)
  const handleBuscarCliente = async (e) => {
    if (e) e.preventDefault();
    if (!codCliente.trim()) {
      setMensaje({ text: 'Ingrese el DNI del cliente a buscar', type: 'warning' });
      return;
    }

    try {
      const res = await fetch(`/api/clientes/buscar/${encodeURIComponent(codCliente.trim())}`);
      const data = await res.json();
      if (data.success && data.data) {
        setClienteActual(data.data);
        setNomCliente(data.data.Nombres);
        setMensaje({ text: `Cliente encontrado: ${data.data.Nombres}`, type: 'success' });
      } else {
        setClienteActual(null);
        setNomCliente('');
        setMensaje({ text: 'Cliente no encontrado en la base de datos.', type: 'danger' });
      }
    } catch (err) {
      setMensaje({ text: 'Error al buscar cliente: ' + err.message, type: 'danger' });
    }
  };

  // 2. Buscar Producto (Equivalente a Controlador?menu=RegistrarVenta&accion=BuscarProducto)
  const handleBuscarProducto = async (e) => {
    if (e) e.preventDefault();
    if (!codProducto.trim()) {
      setMensaje({ text: 'Ingrese el código ID del producto', type: 'warning' });
      return;
    }

    try {
      const res = await fetch(`/api/productos/${codProducto.trim()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setProductoActual(data.data);
        setNomProducto(data.data.Nombres);
        setPrecio(Number(data.data.Precio).toFixed(2));
        setStock(data.data.Stock);
        setMensaje({ text: `Producto: ${data.data.Nombres}`, type: 'success' });
      } else {
        setProductoActual(null);
        setNomProducto('');
        setPrecio('');
        setStock('');
        setMensaje({ text: 'Producto no encontrado.', type: 'danger' });
      }
    } catch (err) {
      setMensaje({ text: 'Error al buscar producto: ' + err.message, type: 'danger' });
    }
  };

  // 3. Agregar Producto a la tabla (Equivalente a accion=Agregar en Controlador.java)
  const handleAgregarProducto = (e) => {
    e.preventDefault();
    if (!productoActual) {
      setMensaje({ text: 'Busque y seleccione un producto primero.', type: 'warning' });
      return;
    }

    const cantidadNum = parseInt(cant, 10);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setMensaje({ text: 'Ingrese una cantidad válida mayor a cero.', type: 'warning' });
      return;
    }

    // Validar disponibilidad de stock
    const itemExistente = lista.find(item => item.idproducto === productoActual.IdProducto);
    const cantidadTotal = (itemExistente ? itemExistente.cantidad : 0) + cantidadNum;

    if (cantidadTotal > productoActual.Stock) {
      setMensaje({
        text: `Stock insuficiente. Disponible: ${productoActual.Stock}, Solicitado: ${cantidadTotal}`,
        type: 'danger'
      });
      return;
    }

    const precioNum = parseFloat(productoActual.Precio);
    let nuevaLista = [...lista];

    if (itemExistente) {
      itemExistente.cantidad += cantidadNum;
      itemExistente.subtotal = itemExistente.cantidad * precioNum;
    } else {
      const nuevoItem = {
        item: lista.length + 1,
        idproducto: productoActual.IdProducto,
        descripcionP: productoActual.Nombres,
        precio: precioNum,
        cantidad: cantidadNum,
        subtotal: cantidadNum * precioNum
      };
      nuevaLista.push(nuevoItem);
    }

    // Calcular total
    const nuevoTotal = nuevaLista.reduce((acc, curr) => acc + curr.subtotal, 0);
    setLista(nuevaLista);
    setTotalPagar(nuevoTotal);
    setMensaje({ text: `"${productoActual.Nombres}" agregado a la lista.`, type: 'success' });
  };

  // Eliminar item de la tabla
  const handleEliminarItem = (idproducto) => {
    const filtrada = lista.filter(item => item.idproducto !== idproducto);
    const reindexada = filtrada.map((item, idx) => ({ ...item, item: idx + 1 }));
    const nuevoTotal = reindexada.reduce((acc, curr) => acc + curr.subtotal, 0);
    setLista(reindexada);
    setTotalPagar(nuevoTotal);
    setMensaje({ text: 'Producto eliminado de la lista.', type: 'info' });
  };

  // 4. Generar Venta (Equivalente a accion=GenerarVenta en Controlador.java)
  const handleGenerarVenta = async (e) => {
    e.preventDefault();
    if (lista.length === 0) {
      setMensaje({ text: 'Debe agregar al menos un producto para generar la venta.', type: 'warning' });
      return;
    }

    // Si no buscó cliente, asignar cliente por defecto (IdCliente = 18 o primer cliente)
    let idClienteFinal = clienteActual ? clienteActual.IdCliente : 18;

    const payload = {
      idCliente: idClienteFinal,
      idEmpleado: usuario?.id || 2,
      numeroSerie: nserie,
      items: lista.map(item => ({
        idProducto: item.idproducto,
        cantidad: item.cantidad,
        precio: item.precio
      }))
    };

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        // Ejecutar impresión idéntico a onclick="print()" de RegistrarVenta.jsp
        window.print();

        alert(`¡Venta #${data.numeroSerie} registrada con éxito en MySQL! Total: S/. ${data.total.toFixed(2)}`);

        // Reiniciar formulario con la nueva serie
        setLista([]);
        setTotalPagar(0);
        setNserie(data.siguienteSerie || '00000001');
        setNomProducto('');
        setPrecio('');
        setStock('');
        setCant(1);
        setProductoActual(null);
        setMensaje({ text: `Venta #${data.numeroSerie} completada. Siguiente serie: ${data.siguienteSerie}`, type: 'success' });
      } else {
        setMensaje({ text: data.message || 'Error al registrar venta', type: 'danger' });
      }
    } catch (err) {
      setMensaje({ text: 'Error de conexión: ' + err.message, type: 'danger' });
    }
  };

  // Cancelar venta
  const handleCancelar = () => {
    setLista([]);
    setTotalPagar(0);
    setMensaje({ text: 'Venta cancelada.', type: 'info' });
  };

  return (
    <div className="container-fluid py-2">
      {/* Alertas informativas */}
      {mensaje.text && (
        <div className={`alert alert-${mensaje.type} py-2 alert-dismissible`} role="alert">
          {mensaje.text}
          <button type="button" className="btn-close float-end" onClick={() => setMensaje({ text: '', type: '' })}></button>
        </div>
      )}

      <div className="d-flex flex-wrap">
        {/* PARTE 01: PANEL IZQUIERDO (Datos Cliente y Producto) - col-sm-5 */}
        <div className="col-lg-5 col-md-12 pe-lg-3 mb-3">
          <div className="card shadow-sm border">
            <form onSubmit={handleAgregarProducto}>
              <div className="card-body">
                {/* Datos del Cliente */}
                <div className="form-group mb-2">
                  <label className="font-weight-bold text-dark">Datos del Cliente</label>
                </div>
                <div className="form-group row g-2 mb-3">
                  <div className="col-sm-6 d-flex">
                    <input
                      type="text"
                      name="codigocliente"
                      value={codCliente}
                      onChange={(e) => setCodCliente(e.target.value)}
                      className="form-control"
                      placeholder="Código / DNI"
                    />
                    <button
                      type="button"
                      onClick={handleBuscarCliente}
                      className="btn btn-outline-info ms-1"
                    >
                      Buscar
                    </button>
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      name="nombrescliente"
                      value={nomCliente}
                      readOnly
                      placeholder="Datos Cliente"
                      className="form-control bg-light"
                    />
                  </div>
                </div>

                {/* Datos del Producto */}
                <div className="form-group mb-2">
                  <label className="font-weight-bold text-dark">Datos del Producto</label>
                </div>
                <div className="form-group row g-2 mb-3">
                  <div className="col-sm-6 d-flex">
                    <input
                      type="text"
                      name="codigoproducto"
                      value={codProducto}
                      onChange={(e) => setCodProducto(e.target.value)}
                      className="form-control"
                      placeholder="Código ID"
                    />
                    <button
                      type="button"
                      onClick={handleBuscarProducto}
                      className="btn btn-outline-info ms-1"
                    >
                      Buscar
                    </button>
                  </div>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      name="nomproducto"
                      value={nomProducto}
                      readOnly
                      placeholder="Datos Producto"
                      className="form-control bg-light"
                    />
                  </div>
                </div>

                {/* Precio, Cantidad y Stock */}
                <div className="form-group row g-2 mb-3">
                  <div className="col-sm-6">
                    <label className="small text-muted">Precio:</label>
                    <input
                      type="text"
                      name="precio"
                      value={precio ? `S/. ${precio}` : ''}
                      readOnly
                      className="form-control bg-light"
                      placeholder="S/. 0.00"
                    />
                  </div>
                  <div className="col-sm-3">
                    <label className="small text-muted">Cantidad:</label>
                    <input
                      type="number"
                      name="cant"
                      value={cant}
                      min="1"
                      onChange={(e) => setCant(e.target.value)}
                      className="form-control text-center font-weight-bold"
                    />
                  </div>
                  <div className="col-sm-3">
                    <label className="small text-muted">Stock:</label>
                    <input
                      type="text"
                      name="stock"
                      value={stock}
                      readOnly
                      placeholder="Stock"
                      className="form-control bg-light text-center"
                    />
                  </div>
                </div>

                {/* Botón Agregar Producto */}
                <div className="form-group mt-3">
                  <button type="submit" className="btn btn-outline-primary w-100">
                    ➕ Agregar Producto
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* PARTE 02: PANEL DERECHO (Tabla de Carrito y Totales) - col-sm-7 */}
        <div className="col-lg-7 col-md-12">
          <div className="card shadow-sm border">
            <div className="card-body">
              {/* Nro de Serie exactamente como RegistrarVenta.jsp */}
              <div className="d-flex col-sm-6 ms-auto mb-3 align-items-center">
                <label className="me-2 text-nowrap font-weight-bold">Nro de Serie: </label>
                <input
                  type="text"
                  name="NroSerie"
                  value={nserie}
                  readOnly
                  className="form-control text-center font-weight-bold bg-light"
                />
              </div>

              {/* Tabla de Items */}
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr className="text-center">
                      <th>Nro</th>
                      <th>Codigo</th>
                      <th>Descripcion</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>SubTotal</th>
                      <th className="parte02">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No hay productos agregados a la venta.
                        </td>
                      </tr>
                    ) : (
                      lista.map((list) => (
                        <tr key={list.idproducto} className="text-center">
                          <td>{list.item}</td>
                          <td><code>#{list.idproducto}</code></td>
                          <td className="text-start">{list.descripcionP}</td>
                          <td>S/. {list.precio.toFixed(2)}</td>
                          <td><strong>{list.cantidad}</strong></td>
                          <td>S/. {list.subtotal.toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleEliminarItem(list.idproducto)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer de la tarjeta con Total y botones Generar Venta y Cancelar */}
            <div className="card-footer d-flex flex-wrap align-items-center bg-white border-top py-3">
              <div className="col-sm-6 mb-2 mb-sm-0">
                <button
                  type="button"
                  onClick={handleGenerarVenta}
                  className="btn btn-success me-2"
                >
                  Generar Venta
                </button>
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="btn btn-danger"
                >
                  Cancelar
                </button>
              </div>
              <div className="col-sm-4 ms-auto">
                <div className="input-group">
                  <span className="input-group-text bg-light font-weight-bold">Total:</span>
                  <input
                    type="text"
                    name="txtTotal"
                    value={`S/. ${totalPagar.toFixed(2)}`}
                    readOnly
                    className="form-control text-center font-weight-bold text-success fs-5 bg-light"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
