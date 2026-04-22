const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Conexión a la Base de Datos
const pool = require('./config/db'); 

const app = express();

// 2. Middlewares Globales
// Agregamos configuración de CORS explícita para evitar bloqueos con React
app.use(cors({ origin: '*' })); 
app.use(express.json());

// 3. Definición de Endpoints
// IMPORTANTE: Si aquí usas '/api/perfiles', en el archivo perfilesRoutes.js 
// el router.get debe ser '/' y NO '/api/perfiles'.
app.use('/api/perfiles', require('./routes/perfilesRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/permisos', require('./routes/permisosRoutes'));

// ✅ NUEVA RUTA: Agregada para la gestión de Módulos
app.use('/api/modulos', require('./routes/modulosRoutes'));

// 4. Rutas de Autenticación
const { login } = require('./controllers/authController');
app.post('/api/auth/login', login);

// 5. Verificación de estado y Base de Datos
app.get('/', (req, res) => {
  res.send('🚀 Servidor de Panel Corp Operando Correctamente');
});

// Comprobar la conexión a PostgreSQL al arrancar
pool.connect()
  .then(client => {
    console.log('✅ Base de datos conectada exitosamente a Render/Postgres');
    client.release();
  })
  .catch(err => console.error('❌ Error crítico de base de datos:', err.stack));

// 6. Iniciar Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📂 Rutas cargadas: /api/perfiles, /api/usuarios, /api/permisos, /api/modulos`);
  console.log(`==========================================\n`);
});

// ✅ VITAL PARA VERCEL: Exportar la app
module.exports = app;