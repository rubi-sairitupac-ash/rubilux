import { app } from './app.js';
import { testConnection } from './db.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor API de Ventas iniciado en http://localhost:${PORT}`);
  await testConnection();
});
