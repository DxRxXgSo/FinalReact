import React, { useState, useEffect } from 'react';
import { Layers, Edit, Trash2, PlusCircle, X, Save, MapPin } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Modulos = () => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({ strnombremodulo: '', ubicacion: 'Principal' });

  // ✅ Mejoramos la búsqueda para que no falle por una letra o acento
  const permisos = user?.permisos?.find(p => {
    const nombreBD = p.strnombremodulo?.trim().toLowerCase();
    return nombreBD === 'modulo' || nombreBD === 'modulos' || nombreBD === 'módulos';
  }) || {};

  const fetchModulos = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/modulos', config);
      setModulos(res.data);
    } catch (error) {
      console.error("Error al cargar módulos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchModulos();
  }, [token]);

  const abrirModalCrear = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ strnombremodulo: '', ubicacion: 'Principal' }); 
    setShowModal(true);
  };

  const abrirModalEditar = (modulo) => {
    setIsEditing(true);
    setCurrentId(modulo.id);
    setFormData({ 
      strnombremodulo: modulo.strnombremodulo, 
      ubicacion: modulo.ubicacion || 'Principal' 
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setFormData({ strnombremodulo: '', ubicacion: 'Principal' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.strnombremodulo.trim()) return alert("El nombre del módulo es obligatorio");

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (isEditing) {
        await axios.put(`/api/modulos/${currentId}`, formData, config);
      } else {
        await axios.post('/api/modulos', formData, config);
      }
      
      cerrarModal();
      fetchModulos(); 
    } catch (error) {
      alert("Error al guardar. Verifica que el módulo exista.");
    }
  };

  const handleEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`⚠️ ¿Deseas eliminar el módulo "${nombre}"?`);
    if (!confirmar) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // ✅ URL RELATIVA PARA VERCEL
      await axios.delete(`/api/modulos/${id}`, config);
      fetchModulos(); 
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error 404: No se pudo encontrar la ruta de borrado. Verifica el backend.");
    }
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-info"></div></div>;

  return (
    <div className="container-fluid animate__animated animate__fadeIn position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Gestión de Módulos</h3>
          <p className="text-muted small">Configura las secciones y su ubicación en el menú.</p>
        </div>
        {permisos.bitagregar && (
          <button 
            className="btn text-white px-4 shadow-sm fw-bold rounded-pill d-flex align-items-center" 
            style={{ backgroundColor: 'var(--btn-pastel-blue)' }}
            onClick={abrirModalCrear}
          >
            <PlusCircle size={18} className="me-2" /> Nuevo Módulo
          </button>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                {/* ID TOTALMENTE OCULTO */}
                <th className="ps-4 py-3">Módulo</th>
                <th>Ubicación</th>
                <th className="text-center">Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modulos.map((m) => (
                <tr key={m.id} className="border-bottom">
                  {/* ID TOTALMENTE OCULTO */}
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 rounded-3 bg-light text-primary"><Layers size={18} /></div>
                      <div className="fw-bold text-dark">{m.strnombremodulo}</div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-secondary border d-inline-flex align-items-center">
                      <MapPin size={12} className="me-1" /> {m.ubicacion || 'Principal'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-success-subtle text-success rounded-pill px-3">Activo</span>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      {permisos.biteditar && (
                        <button className="btn btn-sm btn-light text-warning border shadow-sm" onClick={() => abrirModalEditar(m)}>
                          <Edit size={16} />
                        </button>
                      )}
                      {permisos.biteliminar && (
                        <button className="btn btn-sm btn-light text-danger border shadow-sm" onClick={() => handleEliminar(m.id, m.strnombremodulo)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card border-0 shadow-lg rounded-4 animate__animated animate__zoomIn" style={{ width: '400px', maxWidth: '90%' }}>
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">{isEditing ? 'Editar Módulo' : 'Crear Módulo'}</h5>
              <button className="btn btn-sm btn-light rounded-circle" onClick={cerrarModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Nombre del Módulo</label>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0 p-3 rounded-3 mb-3" 
                    placeholder="Ej. Principal 1.3"
                    value={formData.strnombremodulo}
                    onChange={(e) => setFormData({ ...formData, strnombremodulo: e.target.value })}
                    required
                  />
                  <label className="form-label text-muted small fw-bold">Ubicación en el Menú</label>
                  <select 
                    className="form-select bg-light border-0 p-3 rounded-3"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  >
                    <option value="Principal">Nivel Principal</option>
                    <option value="Seguridad">Menú Seguridad</option>
                    <option value="Principal 1">Principal 1</option>
                    <option value="Principal 2">Principal 2</option>
                  </select>
                </div>
              </div>
              <div className="card-footer bg-white border-top-0 pb-4 px-4 d-flex gap-2">
                <button type="button" className="btn btn-light w-50 rounded-pill fw-bold" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn text-white w-50 rounded-pill fw-bold d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--btn-pastel-blue)' }}>
                  <Save size={18} className="me-2"/> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modulos;