import React, { useState, useEffect } from 'react';
import { Layers, Edit, Trash2, PlusCircle, X, Save, MapPin, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ✅ 1. Importamos nuestra API configurada
import api from '../api'; 

const Modulos = () => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ 2. Ya no sacamos el token de aquí, solo necesitamos al usuario para sus permisos
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({ strnombremodulo: '', ubicacion: 'Principal' });
  
  // ✅ ESTADO NUEVO: Para guardar el módulo seleccionado para ver detalles
  const [selectedModulo, setSelectedModulo] = useState(null);

  const permisos = user?.permisos?.find(p => {
    const nombreBD = p.strnombremodulo?.trim().toLowerCase();
    return nombreBD === 'modulo' || nombreBD === 'modulos';
  }) || {};

  const carpetasExistentes = [...new Set(modulos.map(m => m.ubicacion || 'Principal'))];

  const fetchModulos = async () => {
    try {
      // ✅ 3. Petición súper limpia usando api.get
      const res = await api.get('/modulos');
      setModulos(res.data);
    } catch (error) {
      console.error("Error al cargar módulos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModulos();
  }, []); // Ya no dependemos del token en el useEffect

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = modulos.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(modulos.length / rowsPerPage);

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
    
    const ubicacionFinal = formData.ubicacion;

    try {
      const dataToSend = { ...formData, ubicacion: ubicacionFinal };

      // ✅ 4. Peticiones PUT y POST limpias, sin variables config
      if (isEditing) {
        await api.put(`/modulos/${currentId}`, dataToSend);
      } else {
        await api.post('/modulos', dataToSend);
      }
      
      cerrarModal();
      fetchModulos(); 
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar.");
    }
  };

  const handleEliminar = async (id, nombre) => {
    const confirmar = window.confirm(`⚠️ ¿Deseas eliminar el módulo "${nombre}"?`);
    if (!confirmar) return;
    try {
      // ✅ 5. Petición DELETE limpia
      await api.delete(`/modulos/${id}`);
      
      fetchModulos(); 
      if (currentRows.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
    } catch (error) {
      alert("No se pudo eliminar el módulo.");
    }
  };

  // ✅ FUNCIÓN NUEVA: Genera una descripción dinámica según el nombre del módulo
  const generarDescripcion = (nombre) => {
    if (!nombre) return '';
    const n = nombre.toLowerCase();
    if (n.includes('usuario')) return 'Este módulo gestiona las credenciales, información personal y el estado activo/inactivo de todos los colaboradores registrados en el sistema.';
    if (n.includes('perfil') || n.includes('permiso')) return 'Se encarga de administrar la seguridad jerárquica (RBAC). Aquí se definen los roles y se otorgan o revocan privilegios específicos a cada pantalla.';
    if (n.includes('modulo')) return 'Actúa como el configurador del sistema. Permite dar de alta nuevas secciones, pantallas y agruparlas en carpetas para construir el menú dinámico.';
    return `Este módulo proporciona las herramientas necesarias para la captura, visualización y administración de los registros correspondientes al área de ${nombre}.`;
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-info"></div></div>;

  return (
    <div className="container-fluid animate__animated animate__fadeIn position-relative">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Gestión de Módulos</h3>
          <p className="text-muted small">Configura las secciones y sus carpetas en el menú.</p>
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
                <th className="ps-4 py-3">Módulo</th>
                <th>Carpeta / Ubicación</th>
                <th className="text-center">Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((m) => (
                <tr key={m.id} className="border-bottom">
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
                      
                      {/* ✅ CONDICIÓN NUEVA: bitdetalle */}
                      {permisos.bitdetalle && (
                        <button className="btn btn-sm btn-light text-primary border shadow-sm" 
                                data-bs-toggle="modal" data-bs-target="#moduloDetalleModal" 
                                onClick={() => setSelectedModulo(m)}>
                          <Eye size={16} />
                        </button>
                      )}

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

        {/* PAGINACIÓN */}
        <div className="card-footer bg-white border-0 p-3 d-flex justify-content-between align-items-center">
          <div className="d-flex gap-1">
            <button className="btn btn-outline-secondary btn-sm rounded-circle border-0" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}><ChevronsLeft size={18}/></button>
            <button className="btn btn-outline-secondary btn-sm rounded-circle border-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18}/></button>
          </div>
          <span className="badge rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                style={{ backgroundColor: 'var(--btn-pastel-blue)', color: 'white', width: '32px', height: '32px', fontSize: '14px' }}>
            {currentPage}
          </span>
          <div className="d-flex gap-1">
            <button className="btn btn-outline-secondary btn-sm rounded-circle border-0" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18}/></button>
            <button className="btn btn-outline-secondary btn-sm rounded-circle border-0" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(totalPages)}><ChevronsRight size={18}/></button>
          </div>
        </div>
      </div>

      {/* --- MODAL CREAR/EDITAR DINÁMICO --- */}
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
                  <label className="form-label text-muted small fw-bold">Nombre del Módulo (Pantalla)</label>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0 p-3 rounded-3 mb-3" 
                    placeholder="Ej. Reportes de Ventas"
                    value={formData.strnombremodulo}
                    onChange={(e) => setFormData({ ...formData, strnombremodulo: e.target.value })}
                    required
                  />

                  <label className="form-label text-muted small fw-bold">Carpeta (Ubicación)</label>
                  <select 
                    className="form-select bg-light border-0 p-3 rounded-3 mb-2"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  >
                    {carpetasExistentes.map(carpeta => (
                      <option key={carpeta} value={carpeta}>{carpeta}</option>
                    ))}
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

      {/* --- MODAL DETALLES DEL MÓDULO --- */}
      <div className="modal fade" id="moduloDetalleModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header text-white p-4 border-0" style={{ backgroundColor: 'var(--btn-pastel-blue)' }}>
              <h5 className="modal-title fw-bold d-flex align-items-center">
                <Info size={22} className="me-2" />
                Detalles del Módulo
              </h5>
              <button type="button" className="btn-close btn-close-white shadow-none" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4">
              <div className="text-center mb-4">
                <div className="d-inline-flex p-3 rounded-circle bg-light text-primary mb-3 shadow-sm">
                  <Layers size={40} />
                </div>
                <h4 className="fw-bold text-dark">{selectedModulo?.strnombremodulo}</h4>
                <span className="badge bg-light text-secondary border px-3 py-2">
                  <MapPin size={14} className="me-1" /> {selectedModulo?.ubicacion || 'Principal'}
                </span>
              </div>
              
              <div className="bg-light p-4 rounded-4 text-center">
                <h6 className="fw-bold text-muted mb-2 text-uppercase" style={{ fontSize: '12px' }}>¿Qué hace este módulo?</h6>
                <p className="small text-dark mb-0 lh-lg">
                  {generarDescripcion(selectedModulo?.strnombremodulo)}
                </p>
              </div>
            </div>
            <div className="modal-footer border-0 p-3 bg-white">
              <button className="btn btn-pastel-blue text-white w-100 rounded-pill fw-bold" data-bs-dismiss="modal">
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Modulos;