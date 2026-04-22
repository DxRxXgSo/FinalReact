const pool = require('../config/db');

// 1. Obtener todos los módulos
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
    console.error("❌ Error al obtener módulos:", error);
    res.status(500).json({ message: "Error interno al obtener los módulos" });
  }
};

// 2. Crear un nuevo módulo
const createModulo = async (req, res) => {
  // Aceptamos ambas nomenclaturas para evitar errores de redacción
  const { strNombreModulo, strnombremodulo, ubicacion } = req.body;
  const nombreFinal = strNombreModulo || strnombremodulo;

  if (!nombreFinal) {
    return res.status(400).json({ message: "El nombre del módulo es obligatorio" });
  }

  try {
    const query = `
      INSERT INTO modulo (strnombremodulo, ubicacion) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    const result = await pool.query(query, [nombreFinal, ubicacion || 'Principal']);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al crear módulo:", error);
    res.status(500).json({ message: "Error al insertar el módulo en la base de datos" });
  }
};

// 3. Actualizar un módulo
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
      return res.status(404).json({ message: "Módulo no encontrado para actualizar" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar módulo:", error);
    res.status(500).json({ message: "Error al actualizar el módulo" });
  }
};

// 4. Eliminar un módulo
const deleteModulo = async (req, res) => {
  const { id } = req.params;

  // Debug para ver qué ID está llegando a Vercel
  console.log(`Intentando eliminar módulo con ID: ${id}`);

  try {
    const query = `DELETE FROM modulo WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      // Si entra aquí, es que la ruta se encontró pero el ID no existe en la BD
      return res.status(404).json({ message: "El módulo con ese ID no existe." });
    }

    res.json({ message: "Módulo eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar módulo:", error);
    
    // Error 23503 es 'Foreign Key Violation' en PostgreSQL
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: "No se puede eliminar: Este módulo está siendo usado en la Matriz de Permisos. Primero borra los permisos asociados a este módulo." 
      });
    }
    
    res.status(500).json({ message: "Error interno al intentar eliminar el módulo" });
  }
};

module.exports = {
  getModulos,
  createModulo,
  updateModulo,
  deleteModulo
};