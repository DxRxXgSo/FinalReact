// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // El frontend debe enviar el token en el header 'Authorization'
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ message: "No se proporcionó un token" });

  try {
    // Quitamos la palabra "Bearer " si el frontend la envía
    const tokenLimpio = token.split(" ")[1];
    const decodificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
    req.usuario = decodificado; // Guardamos los datos del usuario para usarlos en la ruta
    next(); // Pasa a la siguiente función (el CRUD)
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = verificarToken;