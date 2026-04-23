const pool = require('../config/db');

// 1. Obtener todos los usuarios (Administrativo)
const getUsuarios = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.strNombreUsuario as strnombreusuario, u.idPerfil as idperfil, 
                   u.idEstadoUsuario as idestadousuario, u.strCorreo as strcorreo, 
                   u.strNumeroCelular as strnumerocelular, u.imgURL as imgurl, 
                   p.strNombrePerfil as strnombreperfil
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

// 2. Crear usuario
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

// 3. Actualizar usuario (Administrativo)
const updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { strNombreUsuario, idPerfil, idEstadoUsuario, strCorreo, strNumeroCelular, imgURL, strPwd } = req.body;
    
    try {
        let query;
        let params;

        if (strPwd && strPwd.trim() !== "") {
            query = `
                UPDATE Usuario 
                SET strNombreUsuario = $1, idPerfil = $2, idEstadoUsuario = $3, 
                    strCorreo = $4, strNumeroCelular = $5, imgURL = $6, strPwd = $7
                WHERE id = $8 RETURNING *
            `;
            params = [strNombreUsuario, idPerfil, idEstadoUsuario, strCorreo, strNumeroCelular, imgURL, strPwd, id];
        } else {
            query = `
                UPDATE Usuario 
                SET strNombreUsuario = $1, idPerfil = $2, idEstadoUsuario = $3, 
                    strCorreo = $4, strNumeroCelular = $5, imgURL = $6
                WHERE id = $7 RETURNING *
            `;
            params = [strNombreUsuario, idPerfil, idEstadoUsuario, strCorreo, strNumeroCelular, imgURL, id];
        }

        const result = await pool.query(query, params);
        if (result.rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};

// 4. ✅ Actualizar perfil propio (Autogestión)
// Permite que cualquier usuario cambie su foto y datos sin ser admin
const updateOwnProfile = async (req, res) => {
    const userId = req.user.id; // Viene del token decodificado (verifyToken)
    const { strNombreUsuario, strCorreo, strNumeroCelular, imgURL, strPwd } = req.body;

    try {
        let query;
        let params;

        // Si incluye contraseña, la actualizamos
        if (strPwd && strPwd.trim() !== "") {
            query = `
                UPDATE Usuario 
                SET strNombreUsuario = $1, strCorreo = $2, strNumeroCelular = $3, imgURL = $4, strPwd = $5
                WHERE id = $6 RETURNING id, strNombreUsuario, strCorreo, imgURL as imgurl`;
            params = [strNombreUsuario, strCorreo, strNumeroCelular, imgURL, strPwd, userId];
        } else {
            // Si la deja en blanco, la conservamos
            query = `
                UPDATE Usuario 
                SET strNombreUsuario = $1, strCorreo = $2, strNumeroCelular = $3, imgURL = $4
                WHERE id = $5 RETURNING id, strNombreUsuario, strCorreo, imgURL as imgurl`;
            params = [strNombreUsuario, strCorreo, strNumeroCelular, imgURL, userId];
        }

        const result = await pool.query(query, params);
        res.json({ message: "Tu perfil ha sido actualizado", user: result.rows[0] });
    } catch (error) {
        console.error('Error en updateOwnProfile:', error);
        res.status(500).json({ message: "Error al actualizar tu perfil" });
    }
};

// 5. Eliminar usuario
const deleteUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Usuario WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ message: "Usuario no encontrado" });

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: "Error al eliminar usuario (tiene registros asociados)" });
    }
};

module.exports = { 
    getUsuarios, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario,
    updateOwnProfile // Exportada correctamente
};