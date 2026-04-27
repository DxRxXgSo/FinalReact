import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Save, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api'; 

const PermisosPerfil = () => {
  const [perfiles, setPerfiles] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [selectedPerfil, setSelectedPerfil] = useState("");
  const [permisos, setPermisos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const { user } = useAuth();

  const permisosUsuario = user?.permisos?.find(p => {
    const nombreBD = p.strnombremodulo?.trim().toLowerCase();
    return nombreBD === 'permisosperfil' || nombreBD === 'permisos';
  }) || {};

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // ✅ 1. SOLUCIÓN AL BLOQUEO: Peticiones independientes
      // En lugar de Promise.all, hacemos peticiones separadas y atrapamos sus errores individualmente.
      // Así, si falla /modulos, de todas formas carga /perfiles y la página no "explota".
      
      let dataPermisos = [];
      let dataPerfiles = [];
      let dataModulos = [];

      try {
        const resPermisos = await api.get('/permisos');
        dataPermisos = resPermisos.data;
      } catch (e) { console.warn("No se pudieron cargar los permisos actuales."); }

      try {
        const resPerfiles = await api.get('/perfiles');
        dataPerfiles = resPerfiles.data;
      } catch (e) { console.warn("No se pudieron cargar los perfiles."); }

      try {
        const resModulos = await api.get('/modulos');
        dataModulos = resModulos.data;
      } catch (e) { console.warn("El backend bloqueó el acceso a /modulos."); }

      setPermisos(dataPermisos);
      setPerfiles(dataPerfiles);
      setModulos(dataModulos);

      if (dataPerfiles.length > 0 && !selectedPerfil) {
        setSelectedPerfil(dataPerfiles[0].id);
      }
    } catch (error) {
      console.error("Error crítico en la vista:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePermiso = (idModulo, campo) => {
    setPermisos(prev => {
      const index = prev.findIndex(p => Number(p.idmodulo) === Number(idModulo) && Number(p.idperfil) === Number(selectedPerfil));
      let newPermisos = [...prev];

      if (index >= 0) {
        const currentStatus = !newPermisos[index][campo];
        if (campo === 'bitconsulta' && currentStatus === false) {
          newPermisos[index] = { 
            ...newPermisos[index], 
            bitconsulta: false, bitagregar: false, biteditar: false, biteliminar: false, bitdetalle: false,
            hasChanged: true 
          };
        } else {
          newPermisos[index] = { ...newPermisos[index], [campo]: currentStatus, hasChanged: true };
        }
      } else {
        newPermisos.push({
          idperfil: selectedPerfil,
          idmodulo: idModulo,
          bitconsulta: campo === 'bitconsulta',
          bitagregar: campo === 'bitagregar',
          biteditar: campo === 'biteditar',
          biteliminar: campo === 'biteliminar',
          bitdetalle: campo === 'bitdetalle',
          isVirtual: true,
          hasChanged: true
        });
      }
      return newPermisos;
    });
  };

  const handleSaveAll = async () => {
    const cambiosPendientes = permisosFiltrados.filter(p => p.hasChanged);
    if (cambiosPendientes.length === 0) return;

    setSaving(true);
    try {
      const promesas = cambiosPendientes.map(p => {
        const payload = {
          idperfil: Number(selectedPerfil),
          idmodulo: Number(p.idmodulo),
          bitconsulta: !!p.bitconsulta,
          bitagregar: !!p.bitagregar,
          biteditar: !!p.biteditar,
          biteliminar: !!p.biteliminar,
          bitdetalle: !!p.bitdetalle
        };
        return (p.id && !p.isVirtual) 
          ? api.put(`/permisos/${p.id}`, payload)
          : api.post(`/permisos`, payload);
      });

      await Promise.all(promesas);
      alert("¡Todos los cambios han sido guardados exitosamente!");
      await fetchData();
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

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

  const currentRows = permisosFiltrados.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(permisosFiltrados.length / rowsPerPage);
  const hasChanges = permisosFiltrados.some(p => p.hasChanged);

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-info"></div></div>;

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>Matriz de Permisos</h3>
          <p className="text-muted small mb-0">Configura accesos granulares para el perfil seleccionado.</p>
        </div>
        
        {permisosUsuario.biteditar && (
          <button 
            className={`btn px-4 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2 transition-all ${hasChanges ? 'btn-pastel-blue text-white' : 'btn-light text-muted'}`}
            onClick={handleSaveAll}
            disabled={saving || !hasChanges}
          >
            {saving ? <span className="spinner-border spinner-border-sm"></span> : <Save size={18} />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        )}
      </div>

      {/* ✅ 2. MEJORA DE ESTILO: Selector más profesional, sin aspecto de "error rojo" */}
      <div className="d-flex flex-wrap gap-2 mb-4 p-3 bg-white rounded-4 shadow-sm border align-items-center">
        <div className="input-group" style={{ width: 'auto' }}>
          <span className="input-group-text bg-light border-end-0 text-secondary"><Zap size={16} /></span>
          <select 
            className="form-select border-start-0 text-dark fw-bold shadow-none bg-light" 
            value={selectedPerfil} 
            onChange={(e) => { setSelectedPerfil(e.target.value); setCurrentPage(1); }}
            style={{ cursor: 'pointer' }}
          >
            {perfiles.length > 0 ? (
               perfiles.map(perf => <option key={perf.id} value={perf.id}>{perf.strnombreperfil}</option>)
            ) : (
               <option disabled>No hay perfiles disponibles</option>
            )}
          </select>
        </div>
        
        {/* Mensaje si no cargaron los módulos */}
        {modulos.length === 0 && (
          <div className="ms-3 text-warning small fw-bold d-flex align-items-center">
            <AlertCircle size={14} className="me-1"/> Sin acceso a la lista de módulos
          </div>
        )}

        {hasChanges && (
          <div className="ms-auto d-flex align-items-center text-primary small fw-bold animate__animated animate__headShake">
            <AlertCircle size={14} className="me-1"/> Tienes cambios sin guardar
          </div>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4 py-3 fw-bold">Módulo</th>
                <th className="text-center fw-bold">Ver</th>
                <th className="text-center fw-bold">Crear</th>
                <th className="text-center fw-bold">Editar</th>
                <th className="text-center fw-bold">Eliminar</th>
                <th className="text-center fw-bold">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((p) => (
                <tr key={p.idmodulo} className={p.hasChanged ? "bg-primary-subtle bg-opacity-10" : "border-bottom"}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-2">
                      <ShieldCheck size={18} className={p.bitconsulta ? "text-success" : "text-secondary opacity-50"} />
                      <div className={`fw-bold ${p.hasChanged ? 'text-primary' : 'text-dark'}`}>
                        {p.strnombremodulo}
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <input type="checkbox" className="custom-cb cb-green" checked={p.bitconsulta || false} onChange={() => handleTogglePermiso(p.idmodulo, 'bitconsulta')} disabled={!permisosUsuario.biteditar} />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" className="custom-cb cb-blue" checked={p.bitagregar || false} onChange={() => handleTogglePermiso(p.idmodulo, 'bitagregar')} disabled={!permisosUsuario.biteditar || !p.bitconsulta} />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" className="custom-cb cb-yellow" checked={p.biteditar || false} onChange={() => handleTogglePermiso(p.idmodulo, 'biteditar')} disabled={!permisosUsuario.biteditar || !p.bitconsulta} />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" className="custom-cb cb-pink" checked={p.biteliminar || false} onChange={() => handleTogglePermiso(p.idmodulo, 'biteliminar')} disabled={!permisosUsuario.biteditar || !p.bitconsulta} />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" className="custom-cb cb-purple" checked={p.bitdetalle || false} onChange={() => handleTogglePermiso(p.idmodulo, 'bitdetalle')} disabled={!permisosUsuario.biteditar || !p.bitconsulta} />
                  </td>
                </tr>
              ))}
              {/* Fallback visual si no hay módulos */}
              {currentRows.length === 0 && !loading && (
                 <tr>
                   <td colSpan="6" className="text-center py-5 text-muted">
                     No se encontraron módulos para construir la matriz.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-0 p-3 d-flex justify-content-between align-items-center">
          <div className="d-flex gap-1">
            <button className="btn btn-outline-secondary btn-sm rounded-circle border-0" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
              <ChevronsLeft size={18}/>
            </button>
            <button className="btn btn-outline-secondary btn-sm rounded-circle border-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft size={18}/>
            </button>
          </div>

          <span className="badge rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                style={{ backgroundColor: 'var(--btn-pastel-blue)', color: 'white', width: '32px', height: '32px', fontSize: '14px' }}>
            {currentPage}
          </span>

          <div className="d-flex gap-1">
            <button className="btn btn-outline-secondary btn-sm rounded-circle border-0" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight size={18}/>
            </button>
            <button className="btn btn-outline-secondary btn-sm rounded-circle border-0" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(totalPages)}>
              <ChevronsRight size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* ✅ 3. MEJORA DE ESTILO: CSS Ajustado para Checkboxes deshabilitados */}
      <style>{`
        :root { --cb-green: #2ecc71; --cb-blue: #74b9ff; --cb-yellow: #f1c40f; --cb-pink: #ff7675; --cb-purple: #a29bfe; }
        .custom-cb { 
          appearance: none; width: 22px; height: 22px; border: 2px solid #ced4da; 
          border-radius: 6px; cursor: pointer; position: relative; 
          transition: all 0.2s ease; background-color: #ffffff; 
        }
        .custom-cb:checked::after { 
          content: '✔'; position: absolute; top: 50%; left: 50%; 
          transform: translate(-50%, -50%); color: white; font-size: 13px; font-weight: bold; 
        }
        .cb-green:checked { background-color: var(--cb-green); border-color: var(--cb-green); }
        .cb-blue:checked { background-color: var(--cb-blue); border-color: var(--cb-blue); }
        .cb-yellow:checked { background-color: var(--cb-yellow); border-color: var(--cb-yellow); }
        .cb-pink:checked { background-color: var(--cb-pink); border-color: var(--cb-pink); }
        .cb-purple:checked { background-color: var(--cb-purple); border-color: var(--cb-purple); }
        
        /* Ahora los cuadros bloqueados se ven grises pero visibles, no transparentes */
        .custom-cb:disabled { 
          opacity: 0.6; cursor: not-allowed; background-color: #e9ecef; border-color: #dee2e6; filter: grayscale(0.8);
        }
      `}</style>
    </div>
  );
};

export default PermisosPerfil;