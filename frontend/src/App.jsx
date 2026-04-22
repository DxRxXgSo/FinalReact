
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import { LayoutGrid, AlertCircle } from 'lucide-react';

// Contexto y Layout
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Páginas
import Login from './pages/Login';
import PermisosPerfil from './pages/PermisosPerfil';
import Usuarios from './pages/Usuarios';
import Perfiles from './pages/Perfiles';
import Modulos from './pages/Modulos';
import StaticTable from './components/StaticTable';

/**
 * 🔧 Normalizador de nombres (evita errores: Usuario vs Usuarios)
 */
const normalizar = (str) =>
  str?.toLowerCase().replace(/s$/, '').trim();

/**
 * 🔐 RUTA PRIVADA (RBAC dinámico)
 */
const PrivateRoute = ({ children, moduloRequerido }) => {
  const { token, user, loading } = useAuth();

  // ⏳ Esperar a que cargue el contexto
  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <span className="text-muted">Cargando sesión...</span>
      </div>
    );
  }

  // 🔒 No autenticado
  if (!token) return <Navigate to="/login" replace />;

  // ✅ Si no requiere módulo específico (dashboard)
  if (!moduloRequerido) return <Layout>{children}</Layout>;

  const permisos = user?.permisos || [];

  const permiso = permisos.find((p) => {
    const nombreBD = normalizar(p.strnombremodulo);
    const nombreBuscado = normalizar(moduloRequerido);
    return nombreBD === nombreBuscado;
  });

  if (!permiso || !permiso.bitconsulta) {
    console.warn(`🔒 Acceso denegado a ${moduloRequerido}`);
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

/**
 * 📦 Vista dinámica para módulos (ej: "Principal 1.3")
 */
const VistaDinamica = () => {
  const { nombreModulo } = useParams();
  const nombreReal = decodeURIComponent(nombreModulo);

  return (
    <PrivateRoute moduloRequerido={nombreReal}>
      <StaticTable
        title={nombreReal.toUpperCase()}
        moduloName={nombreReal}
      />
    </PrivateRoute>
  );
};

/**
 * 📊 Dashboard principal
 */
const Dashboard = () => {
  const { user } = useAuth();
  const totalModulos = user?.permisos?.filter(p => p.bitconsulta).length || 0;

  return (
    <div className="card border-0 shadow-sm p-5 rounded-4 bg-white text-center">
      <div className="p-3 bg-light d-inline-block rounded-circle mb-4 mx-auto" style={{ width: '80px' }}>
        <LayoutGrid size={40} className="text-primary" />
      </div>

      <h2 className="fw-bold text-primary">Panel de Control Corp</h2>

      <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
        Bienvenido, <b>{user?.strnombreusuario}</b>. 
        Tienes acceso a {totalModulos} secciones del sistema.
      </p>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <div className="p-4 rounded-4 bg-white border shadow-sm" style={{ width: '180px' }}>
          <h3 className="fw-bold m-0 text-primary">{totalModulos}</h3>
          <span className="small text-muted text-uppercase fw-bold">
            Módulos Activos
          </span>
        </div>

        <div className="p-4 rounded-4 bg-white border shadow-sm" style={{ width: '180px' }}>
          <h3 className="fw-bold m-0 text-success">Online</h3>
          <span className="small text-muted text-uppercase fw-bold">
            Estado Sesión
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * ❌ Página 404
 */
const NotFound = () => (
  <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-white">
    <AlertCircle size={60} className="text-danger mb-3" />
    <h2 className="fw-bold">404 - Ruta no encontrada</h2>
    <Link to="/" className="btn btn-primary rounded-pill px-4 mt-3">
      Volver al Inicio
    </Link>
  </div>
);

/**
 * 🚀 APP PRINCIPAL
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* 🔓 Público */}
          <Route path="/login" element={<Login />} />

          {/* 🏠 Base */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

          {/* 🔐 Rutas protegidas */}
          <Route path="/perfiles" element={<PrivateRoute moduloRequerido="Perfil"><Perfiles /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute moduloRequerido="Usuario"><Usuarios /></PrivateRoute>} />
          <Route path="/modulos" element={<PrivateRoute moduloRequerido="Modulo"><Modulos /></PrivateRoute>} />
          <Route path="/permisos" element={<PrivateRoute moduloRequerido="PermisosPerfil"><PermisosPerfil /></PrivateRoute>} />

          {/* ⚡ Rutas dinámicas */}
          <Route path="/d/:nombreModulo" element={<VistaDinamica />} />
          <Route path="/vista/:nombreModulo" element={<VistaDinamica />} />

          {/* ❌ 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
