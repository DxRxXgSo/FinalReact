const pool = require('../config/db');

// Obtener todos los módulos
const getModulos = async (req, res) => {
  try {
    const query = `
      SELECT id, strnombremodulo, ubicacion 
      FROM modulo 
      ORDER BY id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener módulos:", error);
    res.status(500).json({ message: "Error interno al obtener los módulos" });
  }
};

// Crear un nuevo módulo
const createModulo = async (req, res) => {
  // ✅ CORRECCIÓN: Aceptamos strNombreModulo (del Front) o strnombremodulo (de la BD)
  const { strNombreModulo, strnombremodulo, ubicacion } = req.body;
  const nombreFinal = strNombreModulo || strnombremodulo;

  try {
    const query = `
      INSERT INTO modulo (strnombremodulo, ubicacion) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    // Si no mandan ubicación, por defecto será 'Principal'
    const result = await pool.query(query, [nombreFinal, ubicacion || 'Principal']);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear módulo:", error);
    res.status(500).json({ message: "Error al crear el módulo en la base de datos" });
  }
};

// Actualizar un módulo
const updateModulo = async (req, res) => {
  const { id } = req.params;
  const { strNombreModulo, strnombremodulo, ubicacion } = req.body;
  const nombreFinal = strNombreModulo || strnombremodulo;

  try {
    const query = `
      UPDATE modulo 
      SET strnombremodulo = $1, ubicacion = $2
      WHERE id = $3 
      RETURNING *
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

// Eliminar un módulo
const deleteModulo = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `DELETE FROM modulo WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Módulo no encontrado" });
    }
    res.json({ message: "Módulo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar módulo:", error);
    res.status(500).json({ message: "Error: El módulo podría estar vinculado a la Matriz de Permisos" });
  }
};

module.exports = {
  getModulos,
  createModulo,
  updateModulo,
  deleteModulo
};