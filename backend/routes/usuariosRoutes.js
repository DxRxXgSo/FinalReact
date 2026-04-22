const express = require('express');
const router = express.Router();
const { 
  getUsuarios, 
  createUsuario, 
  updateUsuario, 
  deleteUsuario 
} = require('../controllers/usuariosController');

// Importamos el middleware de validación de token y el de permisos
const { verifyToken } = require('../controllers/authController');
const checkPermission = require('../middlewares/checkPermission');

/**
 * RUTAS DE GESTIÓN DE USUARIOS
 * Módulo: "Usuario" (Debe coincidir exactamente con strNombreModulo en la BD)
 */

// 1. Ver Usuarios (Requiere bitconsulta)
router.get('/', 
  verifyToken, 
  checkPermission('Usuario', 'bitconsulta'), 
  getUsuarios
);

// 2. Crear Usuario (Requiere bitagregar)
router.post('/', 
  verifyToken, 
  checkPermission('Usuario', 'bitagregar'), 
  createUsuario
);

// 3. Editar Usuario (Requiere biteditar)
router.put('/:id', 
  verifyToken, 
  checkPermission('Usuario', 'biteditar'), 
  updateUsuario
);

// 4. Eliminar Usuario (Requiere biteliminar)
router.delete('/:id', 
  verifyToken, 
  checkPermission('Usuario', 'biteliminar'), 
  deleteUsuario
);

module.exports = router;