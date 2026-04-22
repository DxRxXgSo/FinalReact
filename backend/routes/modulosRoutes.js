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
 * Módulo requerido en la BD: "Modulo"
 */

// 1. Ver Módulos (Requiere bitconsulta)
router.get('/', 
  verifyToken, 
  checkPermission('Modulo', 'bitconsulta'), 
  getModulos
);

// 2. Crear Módulo (Requiere bitagregar)
router.post('/', 
  verifyToken, 
  checkPermission('Modulo', 'bitagregar'), 
  createModulo
);

// 3. Editar Módulo (Requiere biteditar)
router.put('/:id', 
  verifyToken, 
  checkPermission('Modulo', 'biteditar'), 
  updateModulo
);

// 4. Eliminar Módulo (Requiere biteliminar)
router.delete('/:id', 
  verifyToken, 
  checkPermission('Modulo', 'biteliminar'), 
  deleteModulo
);

module.exports = router;