const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { strNombreUsuario, strPwd, captchaToken } = req.body;

  try {
    // 1. Validación de Captcha
    if (!captchaToken) {
      return res.status(400).json({ message: "Por favor, completa el captcha" });
    }

    const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaResponse = await fetch(googleVerifyUrl, { method: 'POST' });
    const captchaData = await captchaResponse.json();

    if (!captchaData.success) {
      return res.status(401).json({ message: "Fallo la validación del Captcha de Google" });
    }

    // 2. Buscar usuario
    const userQuery = `
      SELECT u.id, u.strNombreUsuario, u.strPwd, u.idPerfil, u.idEstadoUsuario,
             p.strNombrePerfil, p.bitAdministrador 
      FROM Usuario u 
      JOIN Perfil p ON u.idPerfil = p.id 
      WHERE u.strNombreUsuario = $1
    `;
    const userResult = await pool.query(userQuery, [strNombreUsuario]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];

    // Verificación de estado (Postgres devuelve todo en minúsculas)
    if (!user.idestadousuario) {
      return res.status(401).json({ message: "El usuario se encuentra inactivo" });
    }

    if (user.strpwd !== strPwd) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 3. Obtener Permisos con Ubicación
    const permisosQuery = `
      SELECT 
        m.strNombreModulo AS strnombremodulo, 
        m.ubicacion AS ubicacion,
        pp.bitAgregar AS bitagregar, 
        pp.bitEditar AS biteditar, 
        pp.bitConsulta AS bitconsulta, 
        pp.bitEliminar AS biteliminar, 
        pp.bitDetalle AS bitdetalle
      FROM PermisosPerfil pp
      JOIN Modulo m ON pp.idModulo = m.id
      WHERE pp.idPerfil = $1
    `;
    const permisosResult = await pool.query(permisosQuery, [user.idperfil]);

    // ✅ CAMBIO CLAVE: Metemos 'bitadministrador' en el payload del JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        idperfil: user.idperfil, // Coincide con lo que busca checkPermission
        nombre: user.strnombreusuario,
        bitadministrador: user.bitadministrador // <--- ESTO ES VITAL
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.strnombreusuario,
        perfil: user.strnombreperfil,
        esAdmin: user.bitadministrador,
        permisos: permisosResult.rows 
      }
    });

  } catch (error) {
    console.error('❌ Error en Login:', error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "Acceso denegado: No hay token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
    // 'decoded' ahora contendrá idperfil y bitadministrador
    req.user = decoded; 
    next(); 
  });
};

module.exports = { login, verifyToken };