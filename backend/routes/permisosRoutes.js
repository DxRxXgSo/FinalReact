const express = require('express');
const router = express.Router();

// ✅ CORRECCIÓN: Agregamos 'createPermiso' al destructuring
const { getPermisos, updatePermiso, createPermiso } = require('../controllers/permisosController');
const { verifyToken } = require('../controllers/authController');

/**
 * RUTAS DE MATRIZ DE PERMISOS (RBAC)
 * URL Final: http://localhost:4000/api/permisos
 */

// 1. Obtener todos los permisos (GET /api/permisos)
router.get('/', verifyToken, getPermisos);

// 2. ✅ NUEVA RUTA: Crear/Asignar permiso a un módulo nuevo (POST /api/permisos)
// Esta es la ruta que activa el botón "Asignar" en tu tabla de React
router.post('/', verifyToken, createPermiso);

// 3. Actualizar privilegios de un módulo existente (PUT /api/permisos/:id)
router.put('/:id', verifyToken, updatePermiso);

module.exports = router;