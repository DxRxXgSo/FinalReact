const express = require('express');
const router = express.Router();
const { 
  getUsuarios, 
  createUsuario, 
  updateUsuario, 
  deleteUsuario,
  updateOwnProfile 
} = require('../controllers/usuariosController');

// Importamos el middleware de seguridad
const { verifyToken } = require('../controllers/authController');
const checkPermission = require('../middlewares/checkPermission');

/**
 * 👤 RUTA DE AUTOGESTIÓN (Mi Perfil)
 * Esta ruta NO lleva checkPermission porque cualquier usuario 
 * logueado debe poder editar su propia información.
 * IMPORTANTE: Debe ir antes de las rutas con parámetros dinámicos (/:id)
 */
router.put('/perfil/update', verifyToken, updateOwnProfile);

/**
 * ⚙️ RUTAS DE GESTIÓN ADMINISTRATIVA
 * Módulo: "Usuario"
 */

// 1. Ver Usuarios (bitconsulta)
router.get('/', 
  verifyToken, 
  checkPermission('Usuario', 'bitconsulta'), 
  getUsuarios
);

// 2. Crear Usuario (bitagregar)
router.post('/', 
  verifyToken, 
  checkPermission('Usuario', 'bitagregar'), 
  createUsuario
);

// 3. Editar Usuario ajeno (biteditar)
router.put('/:id', 
  verifyToken, 
  checkPermission('Usuario', 'biteditar'), 
  updateUsuario
);

// 4. Eliminar Usuario (biteliminar)
router.delete('/:id', 
  verifyToken, 
  checkPermission('Usuario', 'biteliminar'), 
  deleteUsuario
);

module.exports = router;