const db = require('../config/db');

// 1. Obtener todos los perfiles
const getPerfiles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Perfil ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener perfiles:", error);
        res.status(500).json({ message: "Error al obtener perfiles" });
    }
};

// 2. Crear un nuevo perfil
const createPerfil = async (req, res) => {
    // ✅ Compatibilidad: Aceptamos bitAdministrador (Frontend viejo) o bitadministrador (Frontend nuevo/DB)
    const { strNombrePerfil, bitAdministrador, bitadministrador } = req.body;
    const isAdmin = bitadministrador !== undefined ? bitadministrador : (bitAdministrador || false);

    try {
        const result = await db.query(
            'INSERT INTO Perfil (strNombrePerfil, bitAdministrador) VALUES ($1, $2) RETURNING *',
            [strNombrePerfil, isAdmin]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear perfil:", error);
        res.status(500).json({ message: "Error al crear perfil" });
    }
};

// 3. Actualizar un perfil
const updatePerfil = async (req, res) => {
    const { id } = req.params;
    const { strNombrePerfil, bitAdministrador, bitadministrador } = req.body;
    const isAdmin = bitadministrador !== undefined ? bitadministrador : (bitAdministrador || false);

    try {
        const result = await db.query(
            'UPDATE Perfil SET strNombrePerfil = $1, bitAdministrador = $2 WHERE id = $3 RETURNING *',
            [strNombrePerfil, isAdmin, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Perfil no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ message: "Error al actualizar perfil" });
    }
};

// 4. Eliminar un perfil (FIX: Error de llave foránea permisosperfil)
const deletePerfil = async (req, res) => {
    const { id } = req.params;
    try {
        // ✅ PASO A: Borrar primero las dependencias en la tabla permisosperfil
        // Esto evita el error 500 que te salió antes
        await db.query('DELETE FROM permisosperfil WHERE idperfil = $1', [id]);

        // ✅ PASO B: Ahora sí borrar el perfil
        const result = await db.query('DELETE FROM Perfil WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Perfil no encontrado" });
        }

        res.json({ message: "Perfil y sus permisos asociados eliminados correctamente" });
    } catch (error) {
        console.error("Error al eliminar perfil:", error);
        
        // Si el error es porque un USUARIO aún tiene este perfil
        if (error.code === '23503') {
            return res.status(500).json({ 
                message: "No se puede eliminar: Hay usuarios asignados a este perfil." 
            });
        }
        
        res.status(500).json({ message: "Error al eliminar perfil" });
    }
};

module.exports = { getPerfiles, createPerfil, updatePerfil, deletePerfil };