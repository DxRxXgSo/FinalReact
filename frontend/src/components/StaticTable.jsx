import React, { useState } from 'react';
import { Eye, Pencil, Trash2, Plus, Search, X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StaticTable = ({ title, moduloName }) => {
  const { user } = useAuth();

  const permisos = user?.permisos?.find(
    p => p.strnombremodulo.toLowerCase() === moduloName?.toLowerCase()
  ) || {};

  // --- ESTADOS PARA SIMULACIÓN ---
  // Mantengo el ID interno para que la lógica de editar/eliminar funcione
  const [data, setData] = useState([
    { id: 1, nombre: 'Elemento Alpha', desc: 'Descripción del componente Alpha', fecha: '2026-04-01', estado: 'Activo' },
    { id: 2, nombre: 'Elemento Beta', desc: 'Descripción del componente Beta', fecha: '2026-04-02', estado: 'Activo' },
    { id: 3, nombre: 'Elemento Gamma', desc: 'Descripción del componente Gamma', fecha: '2026-04-03', estado: 'Inactivo' },
    { id: 4, nombre: 'Elemento Delta', desc: 'Descripción del componente Delta', fecha: '2026-04-04', estado: 'Activo' },
    { id: 5, nombre: 'Elemento Epsilon', desc: 'Descripción del componente Epsilon', fecha: '2026-04-05', estado: 'Activo' },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', desc: '', estado: 'Activo' });

  // --- LÓGICA SIMULADA ---

  // 🔍 Buscar
  const filteredData = data.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🗑️ Eliminar
  const handleDelete = (id) => {
    if (window.confirm("¿Simular eliminación de este registro?")) {
      setData(data.filter(item => item.id !== id));
    }
  };

  // ➕ Abrir Modal
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ nombre: item.nombre, desc: item.desc, estado: item.estado });
    } else {
      setEditingItem(null);
      setFormData({ nombre: '', desc: '', estado: 'Activo' });
    }
    setShowModal(true);
  };

  // 💾 Guardar
  const handleSave = (e) => {
    e.preventDefault();
    if (editingItem) {
      setData(data.map(item => item.id === editingItem.id ? { ...item, ...formData } : item));
    } else {
      const newItem = {
        ...formData,
        id: Date.now(), 
        fecha: new Date().toISOString().split('T')[0]
      };
      setData([...data, newItem]);
    }
    setShowModal(false);
  };

  return (
    <div className="animate__animated animate__fadeIn position-relative">
      
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0" style={{ color: 'var(--btn-pastel-blue)' }}>{title}</h3>
          <p className="text-muted small">Módulo: <strong>{moduloName}</strong> (Vista de Colaborador)</p>
        </div>
        
        {permisos.bitagregar && (
          <button 
            className="btn btn-pastel-pink text-white fw-bold px-4 py-2 shadow-sm border-0 d-flex align-items-center"
            onClick={() => openModal()}
          >
            <Plus size={18} className="me-2" /> Nuevo Elemento
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white border-bottom p-3">
          <div className="d-flex justify-content-end">
            <div className="input-group" style={{ width: '300px' }}>
              <span className="input-group-text bg-light border-0"><Search size={16} className="text-muted"/></span>
              <input 
                type="text" 
                className="form-control bg-light border-0 small shadow-none" 
                placeholder="Buscar por nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4 py-3">Nombre</th>
                <th>Descripción</th>
                <th className="text-center">Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item) => (
                <tr key={item.id} className="border-bottom">
                  <td className="ps-4">
                    <div className="fw-bold text-dark">{item.nombre}</div>
                    <div className="text-muted" style={{ fontSize: '10px' }}>Ref: {item.id}</div>
                  </td>
                  <td className="text-muted small" style={{ maxWidth: '300px' }}>{item.desc}</td>
                  <td className="text-center">
                    <span className={`badge rounded-pill px-3 py-2 ${item.estado === 'Activo' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      {permisos.bitdetalle && (
                        <button className="btn btn-sm btn-light text-primary rounded-circle p-2 border-0 shadow-sm" title="Ver Detalle" onClick={() => alert(`Detalle: ${item.desc}`)}><Eye size={16} /></button>
                      )}
                      {permisos.biteditar && (
                        <button className="btn btn-sm btn-light text-warning rounded-circle p-2 border-0 shadow-sm" title="Editar" onClick={() => openModal(item)}><Pencil size={16} /></button>
                      )}
                      {permisos.biteliminar && (
                        <button className="btn btn-sm btn-light text-danger rounded-circle p-2 border-0 shadow-sm" title="Eliminar" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="text-center p-5 text-muted">No se encontraron elementos</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white border-0 p-3">
          <span className="text-muted small">Registros encontrados: {filteredData.length}</span>
        </div>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000 }}>
          <div className="card border-0 shadow-lg rounded-4 animate__animated animate__zoomIn" style={{ width: '400px' }}>
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between">
              <h5 className="fw-bold">{editingItem ? 'Editar' : 'Nuevo'}</h5>
              <button className="btn btn-sm btn-light rounded-circle" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="card-body p-4">
                <label className="form-label small fw-bold">Nombre</label>
                <input type="text" className="form-control mb-3 bg-light border-0 shadow-none" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                
                <label className="form-label small fw-bold">Descripción</label>
                <textarea className="form-control mb-3 bg-light border-0 shadow-none" rows="3" value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} />

                {/* ✅ Switch Estilizado en lugar del Select */}
                <div className="d-flex align-items-center justify-content-between p-3 rounded-4 border bg-white shadow-sm mt-3" style={{borderLeft: '4px solid var(--btn-pastel-blue) !important'}}>
                  <div>
                    <div className="fw-bold small">Estado del Elemento</div>
                    <div className="text-muted" style={{fontSize: '11px'}}>Habilita o deshabilita este registro</div>
                  </div>
                  <div className="form-check form-switch custom-switch-md mb-0">
                    <input className="form-check-input" 
                           type="checkbox" 
                           role="switch" 
                           checked={formData.estado === 'Activo'} 
                           onChange={e => setFormData({...formData, estado: e.target.checked ? 'Activo' : 'Inactivo'})} />
                  </div>
                </div>

              </div>
              <div className="card-footer bg-white border-0 pb-4 px-4 d-flex gap-2">
                <button type="button" className="btn btn-light w-50 rounded-pill fw-bold" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-pastel-blue text-white w-50 rounded-pill fw-bold"><Save size={16} className="me-2"/> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estilos para el switch */}
      <style>{`
        .custom-switch-md .form-check-input { width: 3em; height: 1.5em; cursor: pointer; margin-top: 0; }
        .form-check-input:checked { background-color: #2ecc71 !important; border-color: #2ecc71 !important; }
      `}</style>

    </div>
  );
};

export default StaticTable;