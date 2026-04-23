import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, LayoutGrid, Home, ChevronRight, Folder, Settings } from 'lucide-react';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // console.log("📋 Permisos de este usuario:", user?.permisos);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ 1. DICCIONARIO DE RUTAS
  const getRuta = (nombre) => {
    const key = nombre.trim().toLowerCase();
    const rutasFijas = {
      'perfil': '/perfiles',
      'usuario': '/usuarios',
      'modulo': '/modulos',
      'permisosperfil': '/permisos'
    };
    return rutasFijas[key] || `/d/${encodeURIComponent(nombre)}`;
  };

  // ✅ 2. LÓGICA DE AGRUPACIÓN POR CARPETAS
  const menuSaaS = {
    'Seguridad': [],
    'Principal 1': [],
    'Principal 2': []
  };

  const modulosSeguridad = ['perfil', 'usuario', 'modulo', 'permisosperfil'];

  if (user?.permisos) {
    user.permisos.forEach(p => {
      if (!p.bitconsulta) return; 

      const nombreLow = p.strnombremodulo?.trim().toLowerCase();
      const ubi = p.ubicacion?.trim();

      // Regla 1: Seguridad
      if (modulosSeguridad.includes(nombreLow)) {
        menuSaaS['Seguridad'].push(p);
      } 
      // Regla 2: Coincidencia exacta
      else if (ubi === 'Principal 1') {
        menuSaaS['Principal 1'].push(p);
      } 
      else if (ubi === 'Principal 2') {
        menuSaaS['Principal 2'].push(p);
      }
      // Regla 3: Carpeta dinámica
      else {
        if (!menuSaaS[ubi]) menuSaaS[ubi] = [];
        menuSaaS[ubi].push(p);
      }
    });
  }

  const breadcrumbNombres = {
    'perfiles': 'Gestión de Perfiles',
    'usuarios': 'Gestión de Usuarios',
    'modulos': 'Módulos del Sistema',
    'permisos': 'Matriz de Permisos',
    'mi-perfil': 'Mi Configuración'
  };

  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <div className="min-vh-100 d-flex flex-column bg-light" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top py-2">
        <div className="container-fluid px-4">
          
          <Link className="navbar-brand fw-bold d-flex align-items-center me-4" to="/" style={{ color: 'var(--btn-pastel-blue)' }}>
            <div className="p-2 rounded-3 me-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f0f7f9' }}>
              <LayoutGrid size={22} />
            </div>
            <span className="fs-5">PANEL CORP</span>
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
              <li className="nav-item">
                <Link className="nav-link px-3 fw-medium d-flex align-items-center" to="/dashboard">
                  <Home size={18} className="me-2" /> Inicio
                </Link>
              </li>

              {/* ✅ RENDERIZADO DINÁMICO DE CARPETAS */}
              {Object.entries(menuSaaS).map(([nombreCarpeta, modulos]) => {
                if (modulos.length === 0) return null;

                return (
                  <li className="nav-item dropdown" key={nombreCarpeta}>
                    <a className="nav-link dropdown-toggle px-3 fw-medium text-secondary d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                      {nombreCarpeta === 'Seguridad' ? <Shield size={18} className="me-2" /> : <Folder size={18} className="me-2 text-muted" />}
                      {nombreCarpeta}
                    </a>
                    <ul className="dropdown-menu border-0 shadow mt-2">
                      {modulos.map((m) => (
                        <li key={m.idmodulo || m.strnombremodulo}>
                          <Link className="dropdown-item py-2" to={getRuta(m.strnombremodulo)}>
                            {m.strnombremodulo}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>

            {/* SECCIÓN IDENTIDAD USUARIO CORREGIDA */}
            <div className="d-flex align-items-center gap-3 ms-auto border-start ps-4">
              <div className="text-end d-none d-md-block">
                <div className="fw-bold small" style={{ color: 'var(--btn-pastel-blue)' }}>
                  {/* Lee el nombre del usuario */}
                  {user?.strnombreusuario || user?.nombre || 'Usuario'}
                </div>
                <div className="text-muted text-uppercase" style={{ fontSize: '10px' }}>
                  {/* Lee el perfil del usuario */}
                  {user?.strnombreperfil || user?.perfil || 'Sin Perfil'}
                </div>
              </div>
              
              <div className="dropdown">
                {/* ✅ AVATAR DINÁMICO */}
                <div className="rounded-circle d-flex align-items-center justify-content-center cursor-pointer shadow-sm border overflow-hidden bg-light" 
                     style={{ width: '40px', height: '40px' }} 
                     data-bs-toggle="dropdown">
                  {(user?.imgurl || user?.imgURL) ? (
                    <img src={user.imgurl || user.imgURL} alt="Perfil" className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <User size={20} className="text-muted" />
                  )}
                </div>
                <ul className="dropdown-menu dropdown-menu-end border-0 shadow mt-3">
                  {/* ✅ OPCIÓN A MI CONFIGURACIÓN */}
                  <li>
                    <Link to="/mi-perfil" className="dropdown-item d-flex align-items-center py-2 fw-medium">
                      <Settings size={16} className="me-2 text-primary" /> Mi Configuración
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item text-danger fw-bold py-2 d-flex align-items-center">
                      <LogOut size={16} className="me-2" /> Salir
                    </button>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* ÁREA DE TRABAJO */}
      <main className="flex-grow-1 p-4">
        <div className="container-fluid px-md-5">
          {/* BREADCRUMBS AUTOMÁTICOS */}
          {pathnames.length > 0 && (
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb bg-white px-3 py-2 rounded-pill shadow-sm d-inline-flex align-items-center">
                <li className="breadcrumb-item"><Link to="/dashboard" className="text-decoration-none text-muted"><Home size={14} className="mb-1"/></Link></li>
                {pathnames.map((value, index) => {
                  const isLast = index === pathnames.length - 1;
                  if (value === 'd') return null;

                  const nombreLimpio = decodeURIComponent(value);
                  const nombreDisplay = breadcrumbNombres[nombreLimpio] || (nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1));

                  return isLast ? (
                    <li key={value} className="breadcrumb-item active fw-bold px-2 d-flex align-items-center" style={{ color: 'var(--btn-pastel-blue)' }} aria-current="page">
                      <ChevronRight size={14} className="text-muted mx-1" /> {nombreDisplay}
                    </li>
                  ) : (
                    <li key={value} className="breadcrumb-item px-2 d-flex align-items-center">
                      <ChevronRight size={14} className="text-muted mx-1" /> <span className="text-muted">{nombreDisplay}</span>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          {children}
        </div>
      </main>

      <footer className="py-3 bg-white border-top text-center text-muted small mt-auto">
        Desarrollo Web Profesional | 2026
      </footer>

      <style>{`
        .nav-link:hover { color: var(--btn-pastel-blue) !important; }
        .dropdown-item:hover { background-color: #f8fbff; color: var(--btn-pastel-blue); }
        .active { color: var(--btn-pastel-blue) !important; font-weight: 700 !important; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
      
    </div>
  );
};

export default Layout;