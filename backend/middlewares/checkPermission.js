const pool = require('../config/db');

const checkPermission = (modulo, accion) => {
  return async (req, res, next) => {
    // 1. Extraemos el ID del perfil y el flag de administrador del token (JWT)
    const idPerfil = req.user?.idperfil || req.user?.idPerfil || req.user?.perfil;
    const esAdmin = req.user?.bitadministrador || req.user?.bitAdministrador;

    // ✅ REGLA DE ORO: Si es administrador global, pasa directo sin consultar
    if (esAdmin === true || esAdmin === 1) {
      return next();
    }

    if (!idPerfil) {
      console.error("❌ RBAC Error: No hay perfil en el token.");
      return res.status(403).json({ message: "Sesión inválida." });
    }

    try {
      // 2. Consulta ultra-flexible
      // Buscamos el permiso ignorando acentos (opcional), mayúsculas y plurales
      const query = `
        SELECT pp.* FROM PermisosPerfil pp
        JOIN Modulo m ON pp.idModulo = m.id
        WHERE pp.idPerfil = $1 
        AND (
          LOWER(m.strNombreModulo) = LOWER($2) OR 
          LOWER(m.strNombreModulo) = LOWER($2) || 's' OR 
          LOWER(m.strNombreModulo) || 's' = LOWER($2) OR
          LOWER(m.strNombreModulo) = REPLACE(LOWER($2), 'ó', 'o') -- Por si acaso el acento
        )
      `;
      
      const result = await pool.query(query, [idPerfil, modulo]);

      if (result.rows.length === 0) {
        console.warn(`❌ Acceso denegado: Perfil ${idPerfil} no tiene el módulo [${modulo}].`);
        return res.status(403).json({ message: `No tienes acceso al módulo: ${modulo}` });
      }

      // 3. Normalización de columnas a minúsculas
      const permisosBD = result.rows[0];
      const permisosNormalizados = {};
      for (let key in permisosBD) {
        permisosNormalizados[key.toLowerCase()] = permisosBD[key];
      }

      // 4. Verificación de la acción (Consulta, Agregar, Editar, Eliminar)
      const accionBuscada = accion.toLowerCase();
      
      // Verificamos si el bit es true o 1
      if (permisosNormalizados[accionBuscada] == true || permisosNormalizados[accionBuscada] === 1) {
        return next(); 
      } else {
        console.warn(`❌ Acción denegada: Perfil ${idPerfil} no puede [${accion}] en [${modulo}].`);
        return res.status(403).json({ message: `No tienes permiso para ${accion} en este módulo.` });
      }

    } catch (error) {
      console.error("❌ Error crítico en checkPermission:", error);
      res.status(500).json({ message: "Error interno de seguridad." });
    }
  };
};

module.exports = checkPermission;