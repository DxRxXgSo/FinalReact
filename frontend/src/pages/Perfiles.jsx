import React, { useState, useEffect, useRef } from 'react';
import { Shield, Plus, Edit3, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

// ✅ 1. Importamos nuestra API en lugar de axios
import api from '../api'; 

const Perfiles = () => {
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // ✅ 2. Ya no necesitamos extraer el token manualmente
  const [formData, setFormData] = useState({ strNombrePerfil: '', bitAdministrador: false });
  const [editingId, setEditingId] = useState(null); 
  const [filtroTexto, setFiltroTexto] = useState(''); 

  const closeModalBtn = useRef(null);

  const fetchPerfiles = async () => {
    try {
      setLoading(true);
      // ✅ 3. Petición GET súper limpia
      const response = await api.get('/perfiles');
      setPerfiles(response.data);
    } catch (error) {
      console.error("Error al obtener perfiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfiles();
  }, []); // ✅ 4. Ya no dependemos del token en el useEffect

  const handleSave = async () => {
    if (!formData.strNombrePerfil.trim()) {
      alert("El nombre del perfil es obligatorio");
      return;
    }

    try {
      // ✅ 5. Peticiones PUT y POST limpias y directas
      if (editingId) {
        await api.put(`/perfiles/${editingId}`, formData);
      } else {
        await api.post('/perfiles', formData);
      }
      fetchPerfiles();
      closeModalBtn.current.click();
      resetForm();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el perfil.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este perfil? Esto podría afectar a los usuarios que lo tengan asignado.")) {
      try {
        // ✅ 6. Petición DELETE limpia
        await api.delete(`/perfiles/${id}`);
        fetchPerfiles();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar. Es posible que haya usuarios asociados a este perfil.");
      }
    }
  };

  const openModal = (perfil = null) => {
    if (perfil) {
      setEditingId(perfil.id);
      setFormData({ 
        strNombrePerfil: perfil.strnombreperfil, 
        bitAdministrador: perfil.bitadministrador 
      });
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ strNombrePerfil: '', bitAdministrador: false });
  };

  const perfilesFiltrados = perfiles.filter(p => 
    p.strnombreperfil.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = perfilesFiltrados.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(perfilesFiltrados.length / rowsPerPage);

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0" style={{ color: 'var(--btn-pastel-pink)' }}>
            <Shield className="me-2" /> Gestión de Perfiles
          </h3>
          <p className="text-muted small">Define los roles y niveles de seguridad para los usuarios.</p>
        </div>
        <button 
          className="btn btn-pastel-blue text-white fw-bold px-4 py-2 shadow-sm border-0 d-flex align-items-center"
          data-bs-toggle="modal" 
          data-bs-target="#perfilModal"
          onClick={() => openModal()}
        >
          <Plus size={18} className="me-2" /> Nuevo Perfil
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white border-bottom p-3">
          <div className="input-group w-25 ms-auto">
            <span className="input-group-text bg-light border-0"><Search size={16} className="text-muted"/></span>
            <input 
              type="text" 
              className="form-control bg-light border-0 small" 
              placeholder="Filtrar roles..." 
              value={filtroTexto}
              onChange={(e) => {
                setFiltroTexto(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">Nombre del Perfil</th>
                <th className="text-center">Admin Global</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((p) => (
                  <tr key={p.id} className="border-bottom">
                    <td className="ps-4"><span className="fw-bold text-dark">{p.strnombreperfil}</span></td>
                    <td className="text-center">
                      {p.bitadministrador ? 
                        <span className="badge bg-primary-subtle text-primary border-0 px-3">SÍ</span> : 
                        <span className="badge bg-light text-muted border-0 px-3">NO</span>
                      }
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button 
                          className="btn btn-sm btn-light text-warning rounded-circle p-2 border-0 shadow-sm"
                          data-bs-toggle="modal" 
                          data-bs-target="#perfilModal"
                          onClick={() => openModal(p)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-light text-danger rounded-circle p-2 border-0 shadow-sm"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center p-4 text-muted">No se encontraron perfiles.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-0 p-3 d-flex justify-content-between align-items-center">
          <span className="text-muted small">Mostrando {currentRows.length} de {perfilesFiltrados.length} roles</span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link border-0 rounded-circle" onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18}/></button>
              </li>
              <li className="page-item active">
                <span className="page-link border-0 rounded-circle px-3" style={{ backgroundColor: 'var(--btn-pastel-pink)' }}>{currentPage}</span>
              </li>
              <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                <button className="page-link border-0 rounded-circle" onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18}/></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* MODAL */}
      <div className="modal fade" id="perfilModal" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="fw-bold" style={{ color: 'var(--btn-pastel-pink)' }}>
                {editingId ? 'Editar Perfil' : 'Crear Nuevo Rol'}
              </h5>
              <button type="button" className="btn-close shadow-none" data-bs-dismiss="modal" ref={closeModalBtn} onClick={resetForm}></button>
            </div>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">Nombre del Perfil</label>
                  <input 
                    type="text" 
                    className="form-control rounded-3" 
                    placeholder="Ej. Gerente de TI" 
                    value={formData.strNombrePerfil}
                    onChange={(e) => setFormData({ ...formData, strNombrePerfil: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      role="switch" 
                      id="isAdmin" 
                      checked={formData.bitAdministrador}
                      onChange={(e) => setFormData({ ...formData, bitAdministrador: e.target.checked })}
                    />
                    <label className="form-check-label small fw-bold" htmlFor="isAdmin">¿Es Administrador Global?</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 pt-0 px-4 pb-4">
              <button type="button" className="btn btn-light rounded-3 px-4 fw-bold" data-bs-dismiss="modal" onClick={resetForm}>Cancelar</button>
              <button 
                type="button" 
                className="btn btn-pastel-pink text-white rounded-3 px-4 shadow-sm fw-bold"
                onClick={handleSave}
              >
                {editingId ? 'Actualizar Cambios' : 'Guardar Perfil'}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Perfiles;