const pool = require('../config/db');

// Obtener todos los usuarios con el nombre de su perfil
const getUsuarios = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.strNombreUsuario, u.idPerfil, u.idEstadoUsuario, 
                   u.strCorreo, u.strNumeroCelular, u.imgURL, p.strNombrePerfil
            FROM Usuario u
            JOIN Perfil p ON u.idPerfil = p.id
            ORDER BY u.id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

// Crear usuario (Incluye password obligatorio)
const createUsuario = async (req, res) => {
    const { strNombreUsuario, idPerfil, strPwd, idEstadoUsuario, strCorreo, strNumeroCelular, imgURL } = req.body;
    try {
        const query = `
            INSERT INTO Usuario (strNombreUsuario, idPerfil, strPwd, idEstadoUsuario, strCorreo, strNumeroCelular, imgURL)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const result = await pool.query(query, [
            strNombreUsuario, 
            idPerfil, 
            strPwd, 
            idEstadoUsuario, 
            strCorreo, 
            strNumeroCelular, 
            imgURL
        ]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: "Error al crear usuario" });
    }
};

// Actualizar usuario (Lógica de password opcional funcional)
const updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { strNombreUsuario, idPerfil, idEstadoUsuario, strCorreo, strNumeroCelular, imgURL, strPwd } = req.body;
    
    try {
        let query;
        let params;

        // Si strPwd existe y no está vacío, actualizamos la contraseña también
        if (strPwd && strPwd.trim() !== "") {
            query = `
                UPDATE Usuario 
                SET strNombreUsuario = $1, idPerfil = $2, idEstadoUsuario = $3, 
                    strCorreo = $4, strNumeroCelular = $5, imgURL = $6, strPwd = $7
                WHERE id = $8 RETURNING *
            `;
            params = [strNombreUsuario, idPerfil, idEstadoUsuario, strCorreo, strNumeroCelular, imgURL, strPwd, id];
        } else {
            // Si strPwd viene vacío, ignoramos ese campo para mantener la anterior
            query = `
                UPDATE Usuario 
                SET strNombreUsuario = $1, idPerfil = $2, idEstadoUsuario = $3, 
                    strCorreo = $4, strNumeroCelular = $5, imgURL = $6
                WHERE id = $7 RETURNING *
            `;
            params = [strNombreUsuario, idPerfil, idEstadoUsuario, strCorreo, strNumeroCelular, imgURL, id];
        }

        const result = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};

// Eliminar usuario
const deleteUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Usuario WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: "Error al eliminar usuario (puede tener dependencias)" });
    }
};

module.exports = { getUsuarios, createUsuario, updateUsuario, deleteUsuario };