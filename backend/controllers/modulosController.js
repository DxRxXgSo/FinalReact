const pool = require('../config/db');

// 1. Obtener todos los módulos
const getModulos = async (req, res) => {
  try {
    const query = `
      SELECT id, strNombreModulo as strnombremodulo, ubicacion 
      FROM Modulo 
      ORDER BY id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener módulos:", error);
    res.status(500).json({ message: "Error interno al obtener los módulos" });
  }
};

// 2. Crear un nuevo módulo
const createModulo = async (req, res) => {
  const { strNombreModulo, strnombremodulo, ubicacion } = req.body;
  const nombreFinal = strNombreModulo || strnombremodulo;

  try {
    const query = `
      INSERT INTO Modulo (strNombreModulo, ubicacion) 
      VALUES ($1, $2) 
      RETURNING id, strNombreModulo as strnombremodulo, ubicacion
    `;
    const result = await pool.query(query, [nombreFinal, ubicacion || 'Principal']);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear módulo:", error);
    res.status(500).json({ message: "Error al crear el módulo" });
  }
};

// 3. Actualizar un módulo
const updateModulo = async (req, res) => {
  const { id } = req.params;
  const { strNombreModulo, strnombremodulo, ubicacion } = req.body;
  const nombreFinal = strNombreModulo || strnombremodulo;

  try {
    const query = `
      UPDATE Modulo 
      SET strNombreModulo = $1, ubicacion = $2
      WHERE id = $3 
      RETURNING id, strNombreModulo as strnombremodulo, ubicacion
    `;
    const result = await pool.query(query, [nombreFinal, ubicacion || 'Principal', id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Módulo no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar módulo:", error);
    res.status(500).json({ message: "Error al actualizar el módulo" });
  }
};

// 4. Eliminar un módulo (FIX ERROR 500)
const deleteModulo = async (req, res) => {
  const { id } = req.params;
  try {
    // ✅ PASO A: Borramos primero la dependencia en PermisosPerfil
    // Esto evita que Postgres lance el error de llave foránea (Error 500)
    await pool.query('DELETE FROM PermisosPerfil WHERE idModulo = $1', [id]);

    // ✅ PASO B: Ahora sí borramos el módulo de la tabla principal
    const result = await pool.query('DELETE FROM Modulo WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Módulo no encontrado" });
    }

    res.json({ message: "Módulo y sus permisos eliminados correctamente" });
  } catch (error) {
    console.error("Error crítico al eliminar módulo:", error);
    res.status(500).json({ message: "No se pudo eliminar el módulo. Revisa los logs del servidor." });
  }
};

module.exports = {
  getModulos,
  createModulo,
  updateModulo,
  deleteModulo
};