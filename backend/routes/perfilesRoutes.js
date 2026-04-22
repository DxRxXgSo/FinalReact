const express = require('express');
const router = express.Router();
// Usamos destructuring para evitar errores de referencia y que sea más limpio
const { 
  getPerfiles, 
  createPerfil, 
  updatePerfil, 
  deletePerfil 
} = require('../controllers/perfilesController');
const { verifyToken } = require('../controllers/authController');

/**
 * RUTAS DE PERFILES
 * URL Base: /api/perfiles
 */

// Obtener la lista completa para la tabla
router.get('/', verifyToken, getPerfiles);

// Insertar un nuevo rol en la base de datos
router.post('/', verifyToken, createPerfil);

// Actualizar un rol existente mediante su ID
router.put('/:id', verifyToken, updatePerfil);

// Eliminar un rol (Ten cuidado con las llaves foráneas en PostgreSQL)
router.delete('/:id', verifyToken, deletePerfil);

module.exports = router;