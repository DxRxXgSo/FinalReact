const pool = require('../config/db');

// 1. Obtener todos los módulos
const getModulos = async (req, res) => {
  try {
    // ✅ Añadimos bitactivo a la consulta
    const query = `
      SELECT id, strNombreModulo as strnombremodulo, ubicacion, bitactivo 
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

// ✅ NUEVO: 1.5 Obtener lista simple (Para que la matriz de permisos no se bloquee)
const getSimpleModulos = async (req, res) => {
  try {
    const query = `
      SELECT id, strNombreModulo as strnombremodulo 
      FROM Modulo 
      ORDER BY id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener lista simple de módulos:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// 2. Crear un nuevo módulo + Permisos automáticos para Admin
const createModulo = async (req, res) => {
  // ✅ Recibimos bitactivo desde el frontend
  const { strNombreModulo, strnombremodulo, ubicacion, bitactivo } = req.body;
  const nombreFinal = strNombreModulo || strnombremodulo;
  const isActivo = bitactivo !== undefined ? bitactivo : true; // Por defecto true
  
  const client = await pool.connect(); 

  try {
    await client.query('BEGIN'); // Iniciamos transacción

    // PASO A: Insertar el nuevo módulo con bitactivo
    const queryModulo = `
      INSERT INTO Modulo (strNombreModulo, ubicacion, bitactivo) 
      VALUES ($1, $2, $3) 
      RETURNING id, strNombreModulo as strnombremodulo, ubicacion, bitactivo
    `;
    const resultModulo = await client.query(queryModulo, [nombreFinal, ubicacion || 'Principal', isActivo]);
    const nuevoModulo = resultModulo.rows[0];

    // PASO B: Asignar permisos totales al perfil ADMIN (ID 1)
    // ✅ CORRECCIÓN: Ahora también insertamos bitDetalle
    const queryPermisos = `
      INSERT INTO PermisosPerfil (idPerfil, idModulo, bitConsulta, bitAgregar, bitEditar, bitEliminar, bitDetalle) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    // Asignamos todo en true para el Admin (ID 1), incluyendo el 7mo parámetro (bitDetalle)
    await client.query(queryPermisos, [1, nuevoModulo.id, true, true, true, true, true]);

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
  // ✅ Recibimos bitactivo
  const { strNombreModulo, strnombremodulo, ubicacion, bitactivo } = req.body;
  const nombreFinal = strNombreModulo || strnombremodulo;
  const isActivo = bitactivo !== undefined ? bitactivo : true;

  try {
    // ✅ Actualizamos bitactivo en la base de datos
    const query = `
      UPDATE Modulo 
      SET strNombreModulo = $1, ubicacion = $2, bitactivo = $3
      WHERE id = $4 
      RETURNING id, strNombreModulo as strnombremodulo, ubicacion, bitactivo
    `;
    const result = await pool.query(query, [nombreFinal, ubicacion || 'Principal', isActivo, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Módulo no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar módulo:", error);
    res.status(500).json({ message: "Error al actualizar el módulo" });
  }
};

// 4. Eliminar un módulo
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
  getSimpleModulos, // Exportamos la nueva función
  createModulo,
  updateModulo,
  deleteModulo
};