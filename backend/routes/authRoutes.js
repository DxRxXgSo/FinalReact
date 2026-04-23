const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. Ruta de Login (Pública)
// Esta ruta permite que los alumnos/admin entren al sistema
router.post('/login', authController.login);

// 2. Ruta /me (Protegida)
// ✅ Esta es la clave para el "Tiempo Real" y la persistencia
// Usamos verifyToken y getMe del mismo controlador
router.get('/me', authController.verifyToken, authController.getMe);

module.exports = router;