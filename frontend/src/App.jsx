import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import { LayoutGrid, AlertCircle } from 'lucide-react'; 

// Contexto y Layout
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Páginas del Proyecto
import Login from './pages/Login';
import PermisosPerfil from './pages/PermisosPerfil';
import Usuarios from './pages/Usuarios'; 
import Perfiles from './pages/Perfiles';
import Modulos from './pages/Modulos'; 
import StaticTable from './components/StaticTable'; 

/**
 * Componente para proteger rutas (RBAC Dinámico)
 */
const PrivateRoute = ({ children, moduloRequerido }) => {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" />;
  
  // Si no se requiere un módulo específico (como el Dashboard), solo mostramos el Layout
  if (!moduloRequerido) return <Layout>{children}</Layout>;

  // ✅ BUSCADOR DE PERMISOS INTELIGENTE
  const permiso = user?.permisos?.find((p) => {
    const nombreBD = p.strnombremodulo?.trim().toLowerCase();
    const nombreBuscado = moduloRequerido.trim().toLowerCase();
    
    // Comparación exacta o con 's' al final (Usuario vs Usuarios)
    return nombreBD === nombreBuscado || 
           nombreBD === nombreBuscado + 's' || 
           nombreBD + 's' === nombreBuscado;
  });

  if (!permiso || !permiso.bitconsulta) {
    console.warn(`🔒 Acceso denegado: No tienes permiso 'bitconsulta' para ${moduloRequerido}`);
    return <Navigate to="/" replace />; 
  }

  return <Layout>{children}</Layout>;
};

/**
 * ✅ VISTA DINÁMICA (EL COMODÍN)
 * Atrapa "Principal 1.3" y cualquier otro módulo futuro.
 */
const VistaDinamica = () => {
  const { nombreModulo } = useParams();
  const nombreReal = decodeURIComponent(nombreModulo); 

  return (
    <PrivateRoute moduloRequerido={nombreReal}>
      {/* Se renderiza la tabla genérica con el nombre del módulo */}
      <StaticTable title={nombreReal.toUpperCase()} moduloName={nombreReal} />
    </PrivateRoute>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  // Contamos cuántos módulos tiene permitidos ver el usuario
  const totalModulos = user?.permisos?.filter(p => p.bitconsulta).length || 0;

  return (
    <div className="card border-0 shadow-sm p-5 rounded-4 bg-white text-center animate__animated animate__fadeIn">
      <div className="p-3 bg-light d-inline-block rounded-circle mb-4 mx-auto" style={{ width: '80px' }}>
        <LayoutGrid size={40} className="text-primary" />
      </div>
      <h2 className="fw-bold" style={{ color: 'var(--btn-pastel-blue)' }}>Panel de Control Corp</h2>
      <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
        Bienvenido, <b>{user?.strnombreusuario}</b>. Tienes acceso a {totalModulos} secciones del sistema.
      </p>
      <div className="d-flex justify-content-center gap-3 mt-4">
        <div className="p-4 rounded-4 bg-white border shadow-sm" style={{ width: '180px' }}>
          <h3 className="fw-bold m-0 text-primary">{totalModulos}</h3>
          <span className="small text-muted text-uppercase fw-bold" style={{ fontSize: '10px' }}>Módulos Activos</span>
        </div>
        <div className="p-4 rounded-4 bg-white border shadow-sm" style={{ width: '180px' }}>
          <h3 className="fw-bold m-0 text-success">Online</h3>
          <span className="small text-muted text-uppercase fw-bold" style={{ fontSize: '10px' }}>Estado Sesión</span>
        </div>
      </div>
    </div>
  );
};

const NotFound = () => (
  <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-white">
    <AlertCircle size={60} className="text-danger mb-3" />
    <h2 className="fw-bold">404 - Ruta no encontrada</h2>
    <Link to="/" className="btn btn-primary rounded-pill px-4 mt-3">Volver al Inicio</Link>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Rutas Base */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

          {/* Rutas Estáticas (Seguridad) */}
          <Route path="/perfiles" element={<PrivateRoute moduloRequerido="Perfil"><Perfiles /></PrivateRoute>} /> 
          <Route path="/usuarios" element={<PrivateRoute moduloRequerido="Usuario"><Usuarios /></PrivateRoute>} />
          <Route path="/modulos" element={<PrivateRoute moduloRequerido="Modulo"><Modulos /></PrivateRoute>} />
          <Route path="/permisos" element={<PrivateRoute moduloRequerido="PermisosPerfil"><PermisosPerfil /></PrivateRoute>} />

          {/* ✅ RUTAS DINÁMICAS (Para Principal 1.3 y otros) */}
          <Route path="/d/:nombreModulo" element={<VistaDinamica />} />
          <Route path="/vista/:nombreModulo" element={<VistaDinamica />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;