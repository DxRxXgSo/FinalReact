const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// --- LOGIN ---
const login = async (req, res) => {
  const { strNombreUsuario, strPwd, captchaToken } = req.body;

  try {
    if (!captchaToken) {
      return res.status(400).json({ message: "Por favor, completa el captcha" });
    }

    const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaResponse = await fetch(googleVerifyUrl, { method: 'POST' });
    const captchaData = await captchaResponse.json();

    if (!captchaData.success) {
      return res.status(401).json({ message: "Fallo la validación del Captcha de Google" });
    }

    // ✅ CORRECCIÓN: Agregamos correo y celular al SELECT
    const userQuery = `
      SELECT u.id, u.strNombreUsuario, u.strPwd, u.idPerfil, u.idEstadoUsuario, u.imgURL, 
             u.strCorreo, u.strNumeroCelular,
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

    if (!user.idestadousuario) {
      return res.status(401).json({ message: "El usuario se encuentra inactivo" });
    }

    if (user.strpwd !== strPwd) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // ✅ CORRECCIÓN: Agregamos m.bitactivo AS bitactivo a la consulta
    const permisosQuery = `
      SELECT 
        m.strNombreModulo AS strnombremodulo, 
        m.ubicacion AS ubicacion,
        m.bitactivo AS bitactivo,
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

    const token = jwt.sign(
      { id: user.id, perfil: user.idperfil, nombre: user.strnombreusuario },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // ✅ CORRECCIÓN: Mandamos correo y celular al Frontend
    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.strnombreusuario,
        strnombreusuario: user.strnombreusuario,
        perfil: user.strnombreperfil,
        strnombreperfil: user.strnombreperfil,
        imgurl: user.imgurl,
        strcorreo: user.strcorreo,             // <--- Faltaba esto
        strnumerocelular: user.strnumerocelular, // <--- Faltaba esto
        esAdmin: user.bitadministrador,
        permisos: permisosResult.rows
      }
    });

  } catch (error) {
    console.error('Error en Login:', error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// --- GET ME (Para actualización en tiempo real) ---
const getMe = async (req, res) => {
  try {
    // ✅ CORRECCIÓN: Agregamos correo y celular también aquí
    const userQuery = `
      SELECT u.id, u.strNombreUsuario as nombre, u.strNombreUsuario as strnombreusuario, 
             u.idPerfil, u.imgURL as imgurl, u.strCorreo as strcorreo, u.strNumeroCelular as strnumerocelular,
             p.strNombrePerfil as perfil, p.strNombrePerfil as strnombreperfil, p.bitAdministrador as esadmin
      FROM Usuario u
      JOIN Perfil p ON u.idPerfil = p.id
      WHERE u.id = $1
    `;
    const userResult = await pool.query(userQuery, [req.user.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];

    // ✅ CORRECCIÓN: Agregamos m.bitactivo AS bitactivo a la consulta
    const permisosQuery = `
      SELECT 
        m.strNombreModulo AS strnombremodulo, 
        m.ubicacion AS ubicacion,
        m.bitactivo AS bitactivo,
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

    // ✅ CORRECCIÓN: Aseguramos la misma estructura
    res.json({
      id: user.id,
      nombre: user.nombre,
      strnombreusuario: user.strnombreusuario,
      perfil: user.perfil,
      strnombreperfil: user.strnombreperfil,
      imgurl: user.imgurl,
      strcorreo: user.strcorreo,             // <--- Faltaba esto
      strnumerocelular: user.strnumerocelular, // <--- Faltaba esto
      esAdmin: user.esadmin,
      permisos: permisosResult.rows
    });

  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ message: "Error al sincronizar datos en tiempo real" });
  }
};

// --- MIDDLEWARE: verifyToken ---
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
    req.user = decoded; 
    next(); 
  });
};

module.exports = { login, getMe, verifyToken };