const express = require('express');
const router = express.Router();
const { 
  getModulos, 
  createModulo, 
  updateModulo, 
  deleteModulo 
} = require('../controllers/modulosController');

// Importamos la seguridad
const { verifyToken } = require('../controllers/authController');
const checkPermission = require('../middlewares/checkPermission');

/**
 * RUTAS DE GESTIÓN DE MÓDULOS
 * Ajustamos el nombre a 'modulos' (minúsculas) para que coincida con 
 * el estándar de tu base de datos y evitar el error 404.
 */

// 1. Ver Módulos (Requiere bitconsulta)
router.get('/', 
  verifyToken, 
  checkPermission('modulos', 'bitconsulta'), // Cambiado a 'modulos'
  getModulos
);

// 2. Crear Módulo (Requiere bitagregar)
router.post('/', 
  verifyToken, 
  checkPermission('modulos', 'bitagregar'), // Cambiado a 'modulos'
  createModulo
);

// 3. Editar Módulo (Requiere biteditar)
router.put('/:id', 
  verifyToken, 
  checkPermission('modulos', 'biteditar'), // Cambiado a 'modulos'
  updateModulo
);

// 4. Eliminar Módulo (Requiere biteliminar)
router.delete('/:id', 
  verifyToken, 
  checkPermission('modulos', 'biteliminar'), // Cambiado a 'modulos'
  deleteModulo
);

module.exports = router;