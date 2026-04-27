import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Camera, UserCheck, UserX, Eye, Mail, Shield, Phone, User as UserIcon, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ✅ 1. Importamos nuestra API configurada
import api from '../api'; 

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  
  // ✅ 2. Ya no sacamos el 'token', el interceptor se encarga
  const { user: loggedUser } = useAuth(); 

  // ✅ 3. LÓGICA DE BLOQUEO CORREGIDA (Busca en singular y plural a prueba de errores)
  const perms = loggedUser?.permisos?.find(p => {
    const nombre = p.strnombremodulo?.trim().toLowerCase();
    return nombre === 'usuario' || nombre === 'usuarios';
  }) || {};

  const [formData, setFormData] = useState({
    strNombreUsuario: '',
    strPwd: '',
    idPerfil: '',
    strCorreo: '',
    strNumeroCelular: '',
    idEstadoUsuario: true,
    imgURL: ''
  });
  
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const closeModalBtn = useRef(null);
  
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // ✅ 4. Peticiones súper limpias usando Promise.all
      const [resUsers, resProfiles] = await Promise.all([
        api.get('/usuarios'),
        api.get('/perfiles')
      ]);
      setUsuarios(resUsers.data);
      setPerfiles(resProfiles.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []); // ✅ Ya no dependemos de token aquí

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); 
        setFormData({ ...formData, imgURL: reader.result }); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // ✅ 5. Peticiones PUT y POST sin la variable config
      if (editingId) {
        await api.put(`/usuarios/${editingId}`, formData);
        
        // Aviso si el Admin se editó a sí mismo
        if (loggedUser && editingId === loggedUser.id) {
          alert("Has editado tu propio perfil. Cierra sesión y vuelve a entrar para ver tu foto/nombre en el menú principal.");
        }
      } else {
        await api.post('/usuarios', formData);
      }
      
      fetchData();
      closeModalBtn.current.click();
      resetForm();
    } catch (error) {
      alert("Error al guardar usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este usuario?")) {
      try {
        // ✅ 6. Petición DELETE limpia
        await api.delete(`/usuarios/${id}`);
        fetchData();
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        strNombreUsuario: user.strnombreusuario || user.strNombreUsuario,
        strPwd: '', 
        idPerfil: user.idperfil || user.idPerfil,
        strCorreo: user.strcorreo || user.strCorreo,
        strNumeroCelular: user.strnumerocelular || user.strNumeroCelular || '',
        idEstadoUsuario: user.idestadousuario ?? user.idEstadoUsuario,
        imgURL: user.imgurl || user.imgURL || ''
      });
      setPreview(user.imgurl || user.imgURL || null);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setPreview(null);
    setFormData({ strNombreUsuario: '', strPwd: '', idPerfil: '', strCorreo: '', strNumeroCelular: '', idEstadoUsuario: true, imgURL: '' });
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const currentRows = usuarios.slice(indexOfLastRow - rowsPerPage, indexOfLastRow);
  const totalPages = Math.ceil(usuarios.length / rowsPerPage);

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0" style={{ color: 'var(--btn-pastel-blue)' }}>Gestión de Usuarios</h3>
          <p className="text-muted small">Administra los colaboradores y su información personal.</p>
        </div>
        
        {/* ✅ CAMBIO DE COLOR: btn-pastel-blue | CONDICIÓN: bitagregar */}
        {perms.bitagregar && (
          <button className="btn btn-pastel-blue text-white fw-bold px-4 py-2 shadow-sm border-0 d-flex align-items-center" 
                  data-bs-toggle="modal" data-bs-target="#userModal" onClick={() => openModal()}>
            <UserPlus size={18} className="me-2" /> Nuevo Usuario
          </button>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">Usuario</th>
                <th>Correo</th>
                <th>Perfil</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((u) => (
                <tr key={u.id} className="border-bottom">
                  <td className="ps-4">
                    <div className="d-flex align-items-center">
                      <img src={u.imgurl || u.imgURL || 'https://via.placeholder.com/40'} className="rounded-circle me-3 shadow-sm" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                      <span className="fw-bold text-dark">{u.strnombreusuario || u.strNombreUsuario}</span>
                    </div>
                  </td>
                  <td>{u.strcorreo || u.strCorreo}</td>
                  <td><span className="badge bg-light text-dark border px-3">{u.strnombreperfil || u.strNombrePerfil}</span></td>
                  <td className="text-center">
                    {(u.idestadousuario ?? u.idEstadoUsuario) ? <span className="text-success small"><UserCheck size={14}/> Activo</span> : <span className="text-danger small"><UserX size={14}/> Inactivo</span>}
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      
                      {/* ✅ USANDO bitdetalle PARA EL OJITO */}
                      {perms.bitdetalle && (
                        <button className="btn btn-sm btn-light text-primary rounded-circle p-2" data-bs-toggle="modal" data-bs-target="#detailsModal" onClick={() => setSelectedUser(u)}><Eye size={16} /></button>
                      )}
                      
                      {/* ✅ CONDICIÓN: biteditar */}
                      {perms.biteditar && (
                        <button className="btn btn-sm btn-light text-warning rounded-circle p-2" data-bs-toggle="modal" data-bs-target="#userModal" onClick={() => openModal(u)}><Edit2 size={16} /></button>
                      )}
                      
                      {/* ✅ CONDICIÓN: biteliminar */}
                      {perms.biteliminar && (
                        <button className="btn btn-sm btn-light text-danger rounded-circle p-2" onClick={() => handleDelete(u.id)}><Trash2 size={16} /></button>
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

      {/* --- MODAL FORMULARIO --- */}
      <div className="modal fade" id="userModal" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="fw-bold" style={{color: 'var(--btn-pastel-blue)'}}>{editingId ? 'Editar Colaborador' : 'Nuevo Colaborador'}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" ref={closeModalBtn} onClick={resetForm}></button>
            </div>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-12 text-center mb-2">
                   <div className="position-relative d-inline-block">
                      <div 
                        className="rounded-circle border border-3 border-pastel-blue shadow-sm overflow-hidden bg-light" 
                        style={{ width: '90px', height: '90px', cursor: 'pointer' }}
                        onClick={() => fileInputRef.current.click()} 
                      >
                        {preview ? <img src={preview} className="w-100 h-100 object-fit-cover" /> : <UserIcon size={40} className="mt-3 text-muted"/>}
                      </div>
                      <div 
                        className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm p-1 border" 
                        style={{cursor: 'pointer'}}
                        onClick={() => fileInputRef.current.click()} 
                      >
                        <Camera size={16} className="text-primary"/>
                      </div>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="d-none" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                      />
                   </div>
                </div>

                <div className="col-6"><label className="form-label small fw-bold text-muted">Usuario</label><input type="text" className="form-control form-control-sm shadow-none" value={formData.strNombreUsuario} onChange={e => setFormData({...formData, strNombreUsuario: e.target.value})} /></div>
                
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Contraseña</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0"><Lock size={14}/></span>
                    <input type="password" 
                           className="form-control border-start-0 shadow-none" 
                           placeholder={editingId ? "Escribe para cambiar" : "••••••••"}
                           value={formData.strPwd} 
                           onChange={e => setFormData({...formData, strPwd: e.target.value})} />
                  </div>
                </div>

                <div className="col-6"><label className="form-label small fw-bold text-muted">Email</label><input type="email" className="form-control form-control-sm shadow-none" value={formData.strCorreo} onChange={e => setFormData({...formData, strCorreo: e.target.value})} /></div>
                
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Teléfono</label>
                  <input type="text" className="form-control form-control-sm shadow-none" value={formData.strNumeroCelular} onChange={e => setFormData({...formData, strNumeroCelular: e.target.value})} placeholder="773..." />
                </div>

                <div className="col-12"><label className="form-label small fw-bold text-muted">Perfil</label>
                  <select className="form-select form-select-sm shadow-none" value={formData.idPerfil} onChange={e => setFormData({...formData, idPerfil: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {perfiles.map(p => <option key={p.id} value={p.id}>{p.strnombreperfil}</option>)}
                  </select>
                </div>

                <div className="col-12 mt-4">
                  <div className="d-flex align-items-center justify-content-between p-3 rounded-4 border bg-white shadow-sm" style={{borderLeft: '4px solid var(--btn-pastel-blue) !important'}}>
                    <div>
                      <div className="fw-bold small">Estado del Usuario</div>
                      <div className="text-muted" style={{fontSize: '11px'}}>Habilita o deshabilita el acceso</div>
                    </div>
                    <div className="form-check form-switch custom-switch-md">
                      <input className="form-check-input" 
                             type="checkbox" 
                             role="switch" 
                             checked={formData.idEstadoUsuario} 
                             onChange={e => setFormData({...formData, idEstadoUsuario: e.target.checked})} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button className="btn btn-pastel-blue text-white w-100 fw-bold py-2 shadow-sm" onClick={handleSave} disabled={loading}>
                {loading ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DETALLES --- */}
      <div className="modal fade" id="detailsModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header text-white p-4 border-0" style={{ backgroundColor: 'var(--btn-pastel-blue)' }}>
              <h5 className="modal-title fw-bold">Información del Colaborador</h5>
              <button type="button" className="btn-close btn-close-white shadow-none" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4 text-center">
              <div className="rounded-circle border border-4 border-white shadow-sm mx-auto mb-3 overflow-hidden" style={{ width: '100px', height: '100px' }}>
                 {selectedUser?.imgurl || selectedUser?.imgURL ? <img src={selectedUser.imgurl || selectedUser.imgURL} className="w-100 h-100 object-fit-cover" /> : <UserIcon size={50} className="text-muted mt-3" />}
              </div>
              <h4 className="fw-bold mb-1">@{selectedUser?.strnombreusuario || selectedUser?.strNombreUsuario}</h4>
              <div className="row g-3 text-start bg-light p-3 rounded-4 mt-2">
                <div className="col-6"><label className="text-muted fw-bold small d-block">PERFIL</label><div className="small fw-medium text-dark"><Shield size={14} className="text-primary me-1"/> {selectedUser?.strnombreperfil || selectedUser?.strNombrePerfil}</div></div>
                <div className="col-6"><label className="text-muted fw-bold small d-block">ESTADO</label><div className="small fw-bold">{(selectedUser?.idestadousuario ?? selectedUser?.idEstadoUsuario) ? <span className="text-success"><UserCheck size={14}/> Activo</span> : <span className="text-danger"><UserX size={14}/> Inactivo</span>}</div></div>
                <div className="col-12 border-top pt-2"><label className="text-muted fw-bold small d-block">CORREO</label><div className="small text-dark"><Mail size={14} className="text-info me-1"/> {selectedUser?.strcorreo || selectedUser?.strCorreo}</div></div>
                <div className="col-12 border-top pt-2"><label className="text-muted fw-bold small d-block">TELÉFONO</label><div className="small text-dark"><Phone size={14} className="text-success me-1"/> {selectedUser?.strnumerocelular || selectedUser?.strNumeroCelular || 'N/A'}</div></div>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button className="btn btn-pastel-blue text-white w-100 rounded-3 fw-bold" data-bs-dismiss="modal">Entendido</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-switch-md .form-check-input { width: 3em; height: 1.5em; cursor: pointer; }
        .form-check-input:checked { background-color: #2ecc71 !important; border-color: #2ecc71 !important; }
        .border-pastel-blue { border-color: var(--btn-pastel-blue) !important; }
        .page-link:hover { background-color: #f8f9fa; }
      `}</style>
    </div>
  );
};

export default Usuarios;