const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Conexión a la Base de Datos
const pool = require('./config/db'); 

const app = express();

// 2. Middlewares Globales
app.use(cors({ origin: '*' })); 

// ✅ CORRECCIÓN: Aumentamos el límite para soportar imágenes en Base64 (Error 413)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 3. Definición de Endpoints Modulares
app.use('/api/perfiles', require('./routes/perfilesRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/permisos', require('./routes/permisosRoutes'));
app.use('/api/modulos', require('./routes/modulosRoutes'));

// 4. Rutas de Autenticación (LOGIN y TIEMPO REAL /ME)
app.use('/api/auth', require('./routes/authRoutes'));

// 5. Verificación de estado
app.get('/', (req, res) => {
  res.send('🚀 Servidor de Panel Corp Operando Correctamente');
});

// Comprobar la conexión a PostgreSQL al arrancar
pool.connect()
  .then(client => {
    console.log('✅ Base de datos conectada exitosamente');
    client.release();
  })
  .catch(err => console.error('❌ Error crítico de base de datos:', err.stack));

// 6. Iniciar Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📂 Rutas activas:`);
  console.log(`   - /api/auth (Login y Tiempo Real)`);
  console.log(`   - /api/perfiles, /api/usuarios, /api/modulos`);
  console.log(`==========================================\n`);
});

// ✅ VITAL PARA VERCEL
module.exports = app;