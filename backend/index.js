const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Conexión a la Base de Datos
const pool = require('./config/db'); 

const app = express();

// 2. Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// 3. Rutas API
app.use('/api/perfiles', require('./routes/perfilesRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/permisos', require('./routes/permisosRoutes'));
app.use('/api/modulos', require('./routes/modulosRoutes'));

// 4. Auth
const { login } = require('./controllers/authController');
app.post('/api/auth/login', login);

// 5. Health check
app.get('/', (req, res) => {
  res.send('🚀 API funcionando correctamente');
});

// 6. Conexión DB (sin bloquear ejecución)
pool.connect()
  .then(client => {
    console.log('✅ DB conectada');
    client.release();
  })
  .catch(err => console.error('❌ Error DB:', err));

// ❌ NO usar app.listen en Vercel
// SOLO usarlo en local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local en http://localhost:${PORT}`);
  });
}

// ✅ Export obligatorio
module.exports = app;