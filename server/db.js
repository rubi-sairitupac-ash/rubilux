import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Determinar si se requiere SSL (obligatorio para TiDB Cloud y bases de datos en la nube)
const useSSL = process.env.DB_SSL === 'true' || 
               (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud')) ||
               (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('tidbcloud'));

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mi_base',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (useSSL) {
  poolConfig.ssl = {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  };
}

export const pool = mysql.createPool(poolConfig);

// Probar conexión y verificar tablas
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const dbName = poolConfig.database;
    const host = poolConfig.host;
    console.log(`✅ Conexión exitosa a MySQL/TiDB Cloud: "${dbName}" en ${host}${useSSL ? ' (con SSL activo)' : ''}`);
    
    // Validar que existan las tablas principales
    const [tables] = await connection.query("SHOW TABLES LIKE 'empleado'");
    if (tables.length === 0) {
      console.warn('⚠️ La tabla "empleado" no fue encontrada. Asegúrate de importar base/db_ventas.sql o base/mi_base.sql.');
    } else {
      console.log(`✅ Tablas verificadas correctamente en "${dbName}".`);
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
}
