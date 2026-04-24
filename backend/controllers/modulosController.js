const pool = require('../config/db');

// 1. Obtener todos los módulos (Respetando tus alias y tabla "Modulo")
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

// 2. Crear un nuevo módulo + Permisos automáticos para Admin
const createModulo = async (req, res) => {
  const { strNombreModulo, strnombremodulo, ubicacion } = req.body;
  const nombreFinal = strNombreModulo || strnombremodulo;
  
  const client = await pool.connect(); 

  try {
    await client.query('BEGIN'); // Iniciamos transacción

    // PASO A: Insertar el nuevo módulo
    const queryModulo = `
      INSERT INTO Modulo (strNombreModulo, ubicacion) 
      VALUES ($1, $2) 
      RETURNING id, strNombreModulo as strnombremodulo, ubicacion
    `;
    const resultModulo = await client.query(queryModulo, [nombreFinal, ubicacion || 'Principal']);
    const nuevoModulo = resultModulo.rows[0];

    // PASO B: Asignar permisos totales al perfil ADMIN (ID 1)
    // ✅ CORRECCIÓN: Usamos bitConsulta en lugar de bitLeer
    const queryPermisos = `
      INSERT INTO PermisosPerfil (idPerfil, idModulo, bitConsulta, bitAgregar, bitEditar, bitEliminar) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    // Asignamos todo en true para el Admin (ID 1)
    await client.query(queryPermisos, [1, nuevoModulo.id, true, true, true, true]);

    await client.query('COMMIT'); 
    res.status(201).json(nuevoModulo);

  } catch (error) {
    await client.query('ROLLBACK'); 
    console.error("Error crítico al crear módulo:", error);
    res.status(500).json({ message: "No se pudo crear el módulo. Revisa los nombres de las columnas." });
  } finally {
    client.release();
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

// 4. Eliminar un módulo (Manteniendo tu Fix de dependencias)
const deleteModulo = async (req, res) => {
  const { id } = req.params;
  try {
    // Borramos primero la dependencia en PermisosPerfil
    await pool.query('DELETE FROM PermisosPerfil WHERE idModulo = $1', [id]);

    // Borramos el módulo de la tabla principal
    const result = await pool.query('DELETE FROM Modulo WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Módulo no encontrado" });
    }

    res.json({ message: "Módulo y sus permisos eliminados correctamente" });
  } catch (error) {
    console.error("Error crítico al eliminar módulo:", error);
    res.status(500).json({ message: "No se pudo eliminar el módulo." });
  }
};

module.exports = {
  getModulos,
  createModulo,
  updateModulo,
  deleteModulo
};