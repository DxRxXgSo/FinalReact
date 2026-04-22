import React, { useState } from 'react';
import { Eye, Pencil, Trash2, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // <-- Importamos para leer permisos

const StaticTable = ({ title, moduloName }) => {
  const { user } = useAuth();

  // Buscar los permisos específicos para este módulo
  const permisos = user?.permisos?.find(
    p => p.strnombremodulo.toLowerCase() === moduloName?.toLowerCase()
  ) || {};

  const [data] = useState([
    { id: '101', nombre: 'Elemento Alpha', desc: 'Descripción del componente Alpha', fecha: '2026-04-01', estado: 'Activo' },
    { id: '102', nombre: 'Elemento Beta', desc: 'Descripción del componente Beta', fecha: '2026-04-02', estado: 'Activo' },
    { id: '103', nombre: 'Elemento Gamma', desc: 'Descripción del componente Gamma', fecha: '2026-04-03', estado: 'Inactivo' },
    { id: '104', nombre: 'Elemento Delta', desc: 'Descripción del componente Delta', fecha: '2026-04-04', estado: 'Activo' },
    { id: '105', nombre: 'Elemento Epsilon', desc: 'Descripción del componente Epsilon', fecha: '2026-04-05', estado: 'Activo' },
  ]);

  return (
    <div className="animate__animated animate__fadeIn">
      {/* Encabezado de la Vista */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0" style={{ color: 'var(--btn-pastel-blue)' }}>{title}</h3>
          <p className="text-muted small">Visualización de datos estáticos del módulo.</p>
        </div>
        
        {/* REQUISITO: Mostrar botón CREAR solo si bitagregar es true */}
        {permisos.bitagregar && (
          <button className="btn btn-pastel-pink text-white fw-bold px-4 py-2 shadow-sm border-0 d-flex align-items-center">
            <Plus size={18} className="me-2" /> Nuevo Elemento
          </button>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white border-bottom p-3">
          <div className="d-flex justify-content-end">
            <div className="input-group w-25">
              <span className="input-group-text bg-light border-0"><Search size={16} className="text-muted"/></span>
              <input type="text" className="form-control bg-light border-0 small" placeholder="Buscar..." />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">#</th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id} className="border-bottom">
                  <td className="ps-4 text-muted small">{index + 1}</td>
                  <td className="fw-bold">{item.id}</td>
                  <td>{item.nombre}</td>
                  <td className="text-muted small">{item.desc}</td>
                  <td className="small">{item.fecha}</td>
                  <td className="text-center">
                    <span className={`badge rounded-pill px-3 py-2 ${item.estado === 'Activo' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      {/* REQUISITO: Mostrar botones según los bits de permiso */}
                      {permisos.bitdetalle && (
                        <button className="btn btn-sm btn-light text-primary shadow-sm rounded-circle p-2 border-0" title="Ver Detalle"><Eye size={16} /></button>
                      )}
                      {permisos.biteditar && (
                        <button className="btn btn-sm btn-light text-warning shadow-sm rounded-circle p-2 border-0" title="Editar"><Pencil size={16} /></button>
                      )}
                      {permisos.biteliminar && (
                        <button className="btn btn-sm btn-light text-danger shadow-sm rounded-circle p-2 border-0" title="Eliminar"><Trash2 size={16} /></button>
                      )}
                      
                      {/* Mensaje por si no tiene ningún permiso de acción */}
                      {(!permisos.bitdetalle && !permisos.biteditar && !permisos.biteliminar) && (
                        <span className="text-muted small">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación Fija */}
        <div className="card-footer bg-white border-0 p-3 d-flex justify-content-between align-items-center">
          <span className="text-muted small">Mostrando 5 de 5 registros</span>
        </div>
      </div>
    </div>
  );
};

export default StaticTable;