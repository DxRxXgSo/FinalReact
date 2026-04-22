import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Download, CheckCircle, Zap } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PermisosPerfil = () => {
  const [perfiles, setPerfiles] = useState([]);
  const [modulos, setModulos] = useState([]); // ✅ NUEVO: Para traer la lista maestra
  const [selectedPerfil, setSelectedPerfil] = useState(""); 
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; 
  
  const { token, user } = useAuth();

  const permisosUsuario = user?.permisos?.find(p => {
    const nombreBD = p.strnombremodulo?.trim().toLowerCase();
    return nombreBD === 'permisosperfil' || nombreBD === 'permisos';
  }) || {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // ✅ Actualizado: Traemos Permisos, Perfiles y Módulos
      const [resPermisos, resPerfiles, resModulos] = await Promise.all([
        axios.get('/api/permisos', config),
        axios.get('/api/perfiles', config),
        axios.get('/api/modulos', config)
      ]);

      setPermisos(resPermisos.data);
      setPerfiles(resPerfiles.data);
      setModulos(resModulos.data); // ✅ Guardamos los módulos reales

      if (resPerfiles.data.length > 0 && !selectedPerfil) {
        setSelectedPerfil(resPerfiles.data[0].id);
      }
    } catch (error) {
      console.error("Error al cargar la matriz SaaS:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // ✅ Actualizado: Ahora busca por idmodulo para soportar registros nuevos (virtuales)
  const handleTogglePermiso = (idModulo, campo) => {
    setPermisos(prev => {
      const index = prev.findIndex(p => Number(p.idmodulo) === Number(idModulo) && Number(p.idperfil) === Number(selectedPerfil));
      
      if (index >= 0) {
        const newPermisos = [...prev];
        newPermisos[index] = { ...newPermisos[index], [campo]: !newPermisos[index][campo] };
        return newPermisos;
      } else {
        // Si no existe el permiso para este perfil aún, creamos el objeto en memoria
        return [...prev, {
          idperfil: selectedPerfil,
          idmodulo: idModulo,
          bitconsulta: false, bitagregar: false, biteditar: false, biteliminar: false, bitdetalle: false,
          [campo]: true,
          isVirtual: true 
        }];
      }
    });
  };

  const handleSave = async (p) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        idperfil: Number(selectedPerfil),
        idmodulo: Number(p.idmodulo),
        bitconsulta: !!p.bitconsulta,
        bitagregar: !!p.bitagregar,
        biteditar: !!p.biteditar,
        biteliminar: !!p.biteliminar,
        bitdetalle: !!p.bitdetalle
      };

      if (p.id && !p.isVirtual) {
        // Actualizar existente
        await axios.put(`/api/permisos/${p.id}`, payload, config);
      } else {
        // Crear nueva asignación (POST)
        await axios.post(`/api/permisos`, payload, config);
        await fetchData(); // Recargamos para obtener el ID real
      }
      alert(`Permisos de "${p.strnombremodulo}" actualizados.`);
    } catch (error) {
      alert("Error al guardar en la base de datos.");
    }
  };

  // ✅ LA MAGIA: Cruzamos la lista de todos los módulos con los permisos existentes
  const permisosFiltrados = modulos.map(m => {
    const permisoExistente = permisos.find(
      p => Number(p.idmodulo) === Number(m.id) && Number(p.idperfil) === Number(selectedPerfil)
    );

    return permisoExistente ? { ...permisoExistente, strnombremodulo: m.strnombremodulo } : {
      isVirtual: true,
      idmodulo: m.id,
      idperfil: selectedPerfil,
      strnombremodulo: m.strnombremodulo,
      bitconsulta: false, bitagregar: false, biteditar: false, biteliminar: false, bitdetalle: false
    };
  });

  const totalPages = Math.ceil(permisosFiltrados.length / rowsPerPage);
  const currentRows = permisosFiltrados.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-info"></div></div>;

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>Matriz de Permisos (RBAC)</h3>
          <p className="text-muted small mb-0">Configuración avanzada de privilegios por rol.</p>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4 p-3 bg-white rounded-4 shadow-sm border border-light">
        <div className="input-group" style={{ width: 'auto' }}>
          <span className="input-group-text bg-white border-danger text-danger"><Zap size={16} /></span>
          <select 
            className="form-select border-danger text-danger fw-bold shadow-none" 
            value={selectedPerfil} 
            onChange={(e) => { setSelectedPerfil(e.target.value); setCurrentPage(1); }}
          >
            {perfiles.map(perf => (
              <option key={perf.id} value={perf.id}>{perf.strnombreperfil}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-light text-success border small fw-bold ms-auto"><Download size={14} className="me-2" /> Exportar</button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-white text-muted small text-uppercase">
              <tr className="border-bottom">
                <th className="ps-4 py-3">Módulo</th>
                <th className="text-center" style={{color: 'var(--cb-green)'}}>Ver</th>
                <th className="text-center" style={{color: 'var(--cb-blue)'}}>Crear</th>
                <th className="text-center" style={{color: 'var(--cb-yellow)'}}>Editar</th>
                <th className="text-center" style={{color: 'var(--cb-pink)'}}>Eliminar</th>
                <th className="text-center" style={{color: 'var(--cb-purple)'}}>Detalle</th>
                <th className="text-end pe-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((p) => (
                <tr key={p.idmodulo} className="border-bottom">
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-2">
                      <ShieldCheck size={16} className={p.isVirtual ? "text-warning" : "text-muted"} />
                      <div className="fw-bold text-dark">{p.strnombremodulo}</div>
                      {p.isVirtual && <span className="badge bg-warning text-dark ms-1" style={{fontSize: '9px'}}>NUEVO</span>}
                    </div>
                  </td>
                  
                  <td className="text-center">
                    <input type="checkbox" className="custom-cb cb-green" checked={p.bitconsulta || false} onChange={() => handleTogglePermiso(p.idmodulo, 'bitconsulta')} disabled={!permisosUsuario.biteditar} />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" className="custom-cb cb-blue" checked={p.bitagregar || false} onChange={() => handleTogglePermiso(p.idmodulo, 'bitagregar')} disabled={!permisosUsuario.biteditar} />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" className="custom-cb cb-yellow" checked={p.biteditar || false} onChange={() => handleTogglePermiso(p.idmodulo, 'biteditar')} disabled={!permisosUsuario.biteditar} />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" className="custom-cb cb-pink" checked={p.biteliminar || false} onChange={() => handleTogglePermiso(p.idmodulo, 'biteliminar')} disabled={!permisosUsuario.biteditar} />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" className="custom-cb cb-purple" checked={p.bitdetalle || false} onChange={() => handleTogglePermiso(p.idmodulo, 'bitdetalle')} disabled={!permisosUsuario.biteditar} />
                  </td>
                  
                  <td className="text-end pe-4">
                    {permisosUsuario.biteditar ? (
                      <button className="btn btn-sm text-white rounded-pill px-3 shadow-sm fw-bold" style={{ backgroundColor: p.isVirtual ? '#f39c12' : 'var(--btn-pastel-blue)' }} onClick={() => handleSave(p)}>
                        {p.isVirtual ? 'Asignar' : 'Guardar'}
                      </button>
                    ) : (
                      <span className="text-muted small px-2">Solo Lectura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-0 p-3 d-flex justify-content-between align-items-center">
          <span className="text-muted small">Mostrando {currentRows.length} de {permisosFiltrados.length} módulos</span>
          <nav>
            <ul className="pagination pagination-sm mb-0 gap-1">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link rounded-circle border-0 text-dark shadow-none" onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft size={16}/>
                </button>
              </li>
              <li className="page-item active">
                <span className="page-link rounded-circle border-0 px-3 fw-bold" style={{ backgroundColor: 'var(--btn-pastel-pink)', color: 'white' }}>{currentPage}</span>
              </li>
              <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                <button className="page-link rounded-circle border-0 text-dark shadow-none" onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight size={16}/>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <style>{`
        :root { --cb-green: #2ecc71; --cb-blue: #74b9ff; --cb-yellow: #f1c40f; --cb-pink: #ff7675; --cb-purple: #a29bfe; }
        .custom-cb { appearance: none; width: 22px; height: 22px; border: 2px solid #e0e0e0; border-radius: 6px; cursor: pointer; position: relative; transition: all 0.2s ease; background-color: #f8f9fa; }
        .custom-cb:checked::after { content: '✔'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 13px; font-weight: bold; }
        .cb-green:checked { background-color: var(--cb-green); border-color: var(--cb-green); }
        .cb-blue:checked { background-color: var(--cb-blue); border-color: var(--cb-blue); }
        .cb-yellow:checked { background-color: var(--cb-yellow); border-color: var(--cb-yellow); }
        .cb-pink:checked { background-color: var(--cb-pink); border-color: var(--cb-pink); }
        .cb-purple:checked { background-color: var(--cb-purple); border-color: var(--cb-purple); }
        .custom-cb:disabled { opacity: 0.4; cursor: not-allowed; background-color: #e9ecef; }
        .page-link:hover { background-color: #f0f7f9; }
      `}</style>
    </div>
  );
};

export default PermisosPerfil;