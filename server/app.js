import express from 'express';
import cors from 'cors';
import { pool } from './db.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Helper para formatear número de serie a 8 dígitos (idéntico a Config.GenerarSerie.java)
function formatNumeroSerie(num) {
  return String(num).padStart(8, '0');
}

// -------------------------------------------------------------
// 1. AUTENTICACIÓN (Equivalente a Controlador/Validar.java y EmpleadoDAO.validar)
// -------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { user, pass } = req.body;
    if (!user || !pass) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
    }

    const [rows] = await pool.query(
      'SELECT IdEmpleado, Dni, Nombres, Telefono, Estado, User FROM empleado WHERE User = ? AND Dni = ?',
      [user.trim(), pass.trim()]
    );

    if (rows.length > 0) {
      const empleado = rows[0];
      return res.json({
        success: true,
        user: {
          id: empleado.IdEmpleado,
          dni: empleado.Dni,
          nombres: empleado.Nombres,
          telefono: empleado.Telefono,
          estado: empleado.Estado,
          user: empleado.User
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Comprueba tu Usuario y DNI (Contraseña).'
      });
    }
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor: ' + error.message });
  }
});

// -------------------------------------------------------------
// 2. DASHBOARD / RESUMEN
// -------------------------------------------------------------
app.get('/api/dashboard', async (req, res) => {
  try {
    const [[ventasStats]] = await pool.query(
      'SELECT COUNT(*) as totalVentas, COALESCE(SUM(Monto), 0) as totalMonto FROM ventas'
    );
    const [[clientesStats]] = await pool.query(
      'SELECT COUNT(*) as totalClientes FROM cliente'
    );
    const [[productosStats]] = await pool.query(
      'SELECT COUNT(*) as totalProductos, COALESCE(SUM(Stock), 0) as totalStock FROM producto'
    );
    const [[empleadosStats]] = await pool.query(
      "SELECT COUNT(*) as totalEmpleados FROM empleado WHERE Nombres != ''"
    );

    const [ultimasVentas] = await pool.query(`
      SELECT v.IdVentas, v.NumeroSerie, v.FechaVentas, v.Monto, v.Estado,
             COALESCE(c.Nombres, 'Consumidor Final') AS ClienteNombre,
             COALESCE(e.Nombres, 'Vendedor') AS EmpleadoNombre
      FROM ventas v
      LEFT JOIN cliente c ON v.IdCliente = c.IdCliente
      LEFT JOIN empleado e ON v.IdEmpleado = e.IdEmpleado
      ORDER BY v.IdVentas DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        totalVentas: ventasStats.totalVentas,
        totalMonto: Number(ventasStats.totalMonto).toFixed(2),
        totalClientes: clientesStats.totalClientes,
        totalProductos: productosStats.totalProductos,
        totalStock: productosStats.totalStock,
        totalEmpleados: empleadosStats.totalEmpleados
      },
      ultimasVentas
    });
  } catch (error) {
    console.error('Error en /api/dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------------------------------
// 3. EMPLEADOS (Equivalente a EmpleadoDAO.java)
// -------------------------------------------------------------
app.get('/api/empleados', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT IdEmpleado, Dni, Nombres, Telefono, Estado, User FROM empleado WHERE Nombres IS NOT NULL AND Nombres != '' ORDER BY IdEmpleado ASC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/empleados/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT IdEmpleado, Dni, Nombres, Telefono, Estado, User FROM empleado WHERE IdEmpleado = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/empleados', async (req, res) => {
  try {
    const { dni, nombres, telefono, estado, user } = req.body;
    const [result] = await pool.query(
      'INSERT INTO empleado (Dni, Nombres, Telefono, Estado, User) VALUES (?, ?, ?, ?, ?)',
      [dni, nombres, telefono, estado || '1', user]
    );
    res.json({ success: true, message: 'Empleado agregado exitosamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/empleados/:id', async (req, res) => {
  try {
    const { dni, nombres, telefono, estado, user } = req.body;
    await pool.query(
      'UPDATE empleado SET Dni = ?, Nombres = ?, Telefono = ?, Estado = ?, User = ? WHERE IdEmpleado = ?',
      [dni, nombres, telefono, estado, user, req.params.id]
    );
    res.json({ success: true, message: 'Empleado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/empleados/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM empleado WHERE IdEmpleado = ?', [req.params.id]);
    res.json({ success: true, message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'No se puede eliminar porque tiene ventas o registros asociados' });
  }
});

// -------------------------------------------------------------
// 4. CLIENTES (Equivalente a ClienteDAO.java)
// -------------------------------------------------------------
app.get('/api/clientes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cliente ORDER BY IdCliente ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/clientes/buscar/:dni', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cliente WHERE Dni = ? LIMIT 1', [req.params.dni.trim()]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/clientes/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cliente WHERE IdCliente = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const { dni, nombres, direccion, estado } = req.body;
    const [result] = await pool.query(
      'INSERT INTO cliente (Dni, Nombres, Direccion, Estado) VALUES (?, ?, ?, ?)',
      [dni, nombres, direccion, estado || '1']
    );
    res.json({ success: true, message: 'Cliente registrado exitosamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { dni, nombres, direccion, estado } = req.body;
    await pool.query(
      'UPDATE cliente SET Dni = ?, Nombres = ?, Direccion = ?, Estado = ? WHERE IdCliente = ?',
      [dni, nombres, direccion, estado, req.params.id]
    );
    res.json({ success: true, message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cliente WHERE IdCliente = ?', [req.params.id]);
    res.json({ success: true, message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'No se puede eliminar porque tiene ventas asociadas' });
  }
});

// -------------------------------------------------------------
// 5. PRODUCTOS (Equivalente a ProductoDAO.java)
// -------------------------------------------------------------
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM producto ORDER BY IdProducto ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/productos/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM producto WHERE IdProducto = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/productos', async (req, res) => {
  try {
    const { nombres, precio, stock, estado } = req.body;
    const [result] = await pool.query(
      'INSERT INTO producto (Nombres, Precio, Stock, Estado) VALUES (?, ?, ?, ?)',
      [nombres, Number(precio), Number(stock), estado || '1']
    );
    res.json({ success: true, message: 'Producto registrado con éxito', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/productos/:id', async (req, res) => {
  try {
    const { nombres, precio, stock, estado } = req.body;
    await pool.query(
      'UPDATE producto SET Nombres = ?, Precio = ?, Stock = ?, Estado = ? WHERE IdProducto = ?',
      [nombres, Number(precio), Number(stock), estado, req.params.id]
    );
    res.json({ success: true, message: 'Producto actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM producto WHERE IdProducto = ?', [req.params.id]);
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'No se puede eliminar porque forma parte de ventas registradas' });
  }
});

// -------------------------------------------------------------
// 6. VENTAS Y REGISTRO (Equivalente a VentaDAO.java y Controlador.java)
// -------------------------------------------------------------
app.get('/api/ventas/serie', async (req, res) => {
  try {
    const [[maxRow]] = await pool.query('SELECT MAX(NumeroSerie) as maxSerie FROM ventas');
    let siguienteSerie = '00000001';
    if (maxRow && maxRow.maxSerie) {
      const numActual = parseInt(maxRow.maxSerie, 10);
      siguienteSerie = formatNumeroSerie(isNaN(numActual) ? 1 : numActual + 1);
    }
    res.json({ success: true, serie: siguienteSerie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/ventas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.IdVentas, v.NumeroSerie, v.FechaVentas, v.Monto, v.Estado,
             v.IdCliente, COALESCE(c.Nombres, 'Consumidor Final') AS ClienteNombre, c.Dni AS ClienteDni,
             v.IdEmpleado, COALESCE(e.Nombres, 'Empleado') AS EmpleadoNombre
      FROM ventas v
      LEFT JOIN cliente c ON v.IdCliente = c.IdCliente
      LEFT JOIN empleado e ON v.IdEmpleado = e.IdEmpleado
      ORDER BY v.IdVentas DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/ventas/:id', async (req, res) => {
  try {
    const [ventaRows] = await pool.query(`
      SELECT v.IdVentas, v.NumeroSerie, v.FechaVentas, v.Monto, v.Estado,
             c.IdCliente, c.Nombres AS ClienteNombre, c.Dni AS ClienteDni, c.Direccion AS ClienteDireccion,
             e.IdEmpleado, e.Nombres AS EmpleadoNombre
      FROM ventas v
      LEFT JOIN cliente c ON v.IdCliente = c.IdCliente
      LEFT JOIN empleado e ON v.IdEmpleado = e.IdEmpleado
      WHERE v.IdVentas = ?
    `, [req.params.id]);

    if (ventaRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    const [detalles] = await pool.query(`
      SELECT d.IdDetalleVentas, d.IdVentas, d.IdProducto, d.Cantidad, d.PrecioVenta,
             p.Nombres AS ProductoNombre
      FROM detalle_ventas d
      LEFT JOIN producto p ON d.IdProducto = p.IdProducto
      WHERE d.IdVentas = ?
    `, [req.params.id]);

    res.json({
      success: true,
      venta: ventaRows[0],
      detalles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/ventas', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { idCliente, idEmpleado, numeroSerie, items } = req.body;

    if (!idCliente || !idEmpleado || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Datos incompletos para registrar la venta.' });
    }

    await connection.beginTransaction();

    // 1. Validar y actualizar stock de cada producto
    let totalCalculado = 0;
    for (const item of items) {
      const [pRows] = await connection.query(
        'SELECT IdProducto, Nombres, Stock, Precio FROM producto WHERE IdProducto = ? FOR UPDATE',
        [item.idProducto]
      );
      if (pRows.length === 0) {
        throw new Error(`El producto con ID ${item.idProducto} no existe.`);
      }
      const prod = pRows[0];
      const cantidad = parseInt(item.cantidad, 10);
      if (prod.Stock < cantidad) {
        throw new Error(`Stock insuficiente para "${prod.Nombres}". Disponible: ${prod.Stock}, Solicitado: ${cantidad}`);
      }

      const nuevoStock = prod.Stock - cantidad;
      await connection.query('UPDATE producto SET Stock = ? WHERE IdProducto = ?', [nuevoStock, item.idProducto]);

      const precio = parseFloat(item.precio);
      totalCalculado += precio * cantidad;
    }

    // 2. Determinar número de serie
    let serieFinal = numeroSerie;
    if (!serieFinal) {
      const [[maxRow]] = await connection.query('SELECT MAX(NumeroSerie) as maxSerie FROM ventas');
      const numActual = maxRow && maxRow.maxSerie ? parseInt(maxRow.maxSerie, 10) : 0;
      serieFinal = formatNumeroSerie(isNaN(numActual) ? 1 : numActual + 1);
    }

    // 3. Insertar encabezado de la venta en la tabla `ventas`
    const fechaActual = new Date().toISOString().slice(0, 10);
    const [ventaResult] = await connection.query(
      'INSERT INTO ventas (IdCliente, IdEmpleado, NumeroSerie, FechaVentas, Monto, Estado) VALUES (?, ?, ?, ?, ?, ?)',
      [idCliente, idEmpleado, serieFinal, fechaActual, totalCalculado, '1']
    );

    const idVentaGenerada = ventaResult.insertId;

    // 4. Insertar cada línea en `detalle_ventas`
    for (const item of items) {
      await connection.query(
        'INSERT INTO detalle_ventas (IdVentas, IdProducto, Cantidad, PrecioVenta) VALUES (?, ?, ?, ?)',
        [idVentaGenerada, item.idProducto, item.cantidad, item.precio]
      );
    }

    await connection.commit();

    const siguienteNum = parseInt(serieFinal, 10) + 1;
    const siguienteSerie = formatNumeroSerie(siguienteNum);

    res.json({
      success: true,
      message: 'Venta registrada exitosamente',
      idVentas: idVentaGenerada,
      numeroSerie: serieFinal,
      siguienteSerie,
      total: totalCalculado
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error registrando venta:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});
