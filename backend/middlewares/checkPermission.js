const pool = require('../config/db');

const checkPermission = (modulo, accion) => {
  return async (req, res, next) => {
    // 1. Extraemos el ID del perfil de manera segura (cubre diferentes nombres del JWT)
    const idPerfil = req.user?.idperfil || req.user?.idPerfil || req.user?.perfil;

    if (!idPerfil) {
      console.error("❌ Error RBAC: No se encontró el ID del perfil en el token.");
      return res.status(403).json({ message: "Token inválido o sin perfil asociado." });
    }

    try {
      // 2. Consulta flexible: Ignora mayúsculas y diferencias de plural/singular (Usuario vs Usuarios)
      const query = `
        SELECT pp.*, m.strNombreModulo 
        FROM PermisosPerfil pp
        JOIN Modulo m ON pp.idModulo = m.id
        WHERE pp.idPerfil = $1 
        AND (
          LOWER(m.strNombreModulo) = LOWER($2) OR 
          LOWER(m.strNombreModulo) = LOWER($2) || 's' OR 
          LOWER(m.strNombreModulo) || 's' = LOWER($2)
        )
      `;
      const result = await pool.query(query, [idPerfil, modulo]);

      if (result.rows.length === 0) {
        console.warn(`❌ Acceso denegado: El perfil [${idPerfil}] no tiene asignado el módulo [${modulo}].`);
        return res.status(403).json({ message: "Acceso denegado a este módulo" });
      }

      // 3. Normalizamos las columnas a minúsculas
      // Si Postgres devuelve "bitConsulta", lo convertimos a "bitconsulta" para evitar fallos
      const permisosBD = result.rows[0];
      const permisosNormalizados = {};
      for (let key in permisosBD) {
        permisosNormalizados[key.toLowerCase()] = permisosBD[key];
      }

      // 4. Verificamos la acción solicitada
      const accionBuscada = accion.toLowerCase();
      
      // En bases de datos, los booleanos pueden llegar como true/false o como 1/0
      if (permisosNormalizados[accionBuscada] == true || permisosNormalizados[accionBuscada] === 1) {
        next(); // ✅ Permiso concedido, pasa al controlador
      } else {
        console.warn(`❌ Acción denegada: Perfil [${idPerfil}] intentó [${accion}] en [${modulo}].`);
        return res.status(403).json({ message: `No tienes permiso para ${accion} en ${modulo}` });
      }

    } catch (error) {
      console.error("❌ Error en middleware checkPermission:", error);
      res.status(500).json({ message: "Error interno al verificar privilegios" });
    }
  };
};

module.exports = checkPermission;