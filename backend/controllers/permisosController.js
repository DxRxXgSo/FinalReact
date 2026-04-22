const pool = require('../config/db');

// 1. Obtener la matriz de permisos completa
const getPermisos = async (req, res) => {
    try {
        const query = `
            SELECT 
                pp.id, 
                pp.idperfil, 
                pp.idmodulo, 
                pp.bitagregar, 
                pp.biteditar, 
                pp.biteliminar, 
                pp.bitconsulta, 
                pp.bitdetalle,
                m.strnombremodulo
            FROM permisosperfil pp
            JOIN modulo m ON pp.idmodulo = m.id
            ORDER BY pp.idperfil ASC, m.strnombremodulo ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error al obtener matriz de permisos:', error.message);
        res.status(500).json({ message: "Error al obtener la matriz de permisos" });
    }
};

// 2. CREAR un nuevo registro de permiso (PARA MÓDULOS NUEVOS)
// Esta es la función que te faltaba para que el botón "Asignar" funcione.
const createPermiso = async (req, res) => {
    const { 
        idperfil, 
        idmodulo, 
        bitagregar, 
        biteditar, 
        biteliminar, 
        bitconsulta, 
        bitdetalle 
    } = req.body;

    try {
        const query = `
            INSERT INTO permisosperfil 
            (idperfil, idmodulo, bitagregar, biteditar, biteliminar, bitconsulta, bitdetalle) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *
        `;
        
        const values = [
            idperfil, 
            idmodulo, 
            bitagregar ?? false, 
            biteditar ?? false, 
            biteliminar ?? false, 
            bitconsulta ?? false, 
            bitdetalle ?? false
        ];

        const result = await pool.query(query, values);
        res.status(201).json({
            message: "Permiso asignado con éxito",
            data: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Error al crear permiso:', error.message);
        res.status(500).json({ message: "Error al asignar el permiso" });
    }
};

// 3. Actualizar un renglón de permisos existente
const updatePermiso = async (req, res) => {
    const { id } = req.params;
    const { 
        bitagregar, 
        biteditar, 
        biteliminar, 
        bitconsulta, 
        bitdetalle 
    } = req.body;

    try {
        const query = `
            UPDATE permisosperfil 
            SET 
                bitagregar = $1, 
                biteditar = $2, 
                biteliminar = $3, 
                bitconsulta = $4, 
                bitdetalle = $5
            WHERE id = $6
            RETURNING *
        `;
        
        const values = [
            bitagregar ?? false, 
            biteditar ?? false, 
            biteliminar ?? false, 
            bitconsulta ?? false, 
            bitdetalle ?? false, 
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No se encontró el registro para actualizar" });
        }

        res.json({ 
            message: "Permisos actualizados con éxito", 
            data: result.rows[0] 
        });

    } catch (error) {
        console.error('❌ Error al actualizar permisos:', error.message);
        res.status(500).json({ message: "Error interno al actualizar" });
    }
};

// No olvides exportar la nueva función
module.exports = { getPermisos, createPermiso, updatePermiso };