const db = require('../config/db');

// Obtener todos los perfiles
const getPerfiles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Perfil ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener perfiles" });
    }
};

// Crear un nuevo perfil
const createPerfil = async (req, res) => {
    const { strNombrePerfil, bitAdministrador } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO Perfil (strNombrePerfil, bitAdministrador) VALUES ($1, $2) RETURNING *',
            [strNombrePerfil, bitAdministrador]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error al crear perfil" });
    }
};

// Actualizar un perfil
const updatePerfil = async (req, res) => {
    const { id } = req.params;
    const { strNombrePerfil, bitAdministrador } = req.body;
    try {
        const result = await db.query(
            'UPDATE Perfil SET strNombrePerfil = $1, bitAdministrador = $2 WHERE id = $3 RETURNING *',
            [strNombrePerfil, bitAdministrador, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar perfil" });
    }
};

// Eliminar un perfil
const deletePerfil = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Perfil WHERE id = $1', [id]);
        res.json({ message: "Perfil eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar perfil" });
    }
};

module.exports = { getPerfiles, createPerfil, updatePerfil, deletePerfil };