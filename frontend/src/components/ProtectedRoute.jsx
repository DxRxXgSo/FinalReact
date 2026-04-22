import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ moduloRequerido }) => {
  const { user } = useAuth();

  // Buscamos si el perfil del usuario tiene permiso de ver este módulo
  const permiso = user?.permisos?.find(p => p.strnombremodulo === moduloRequerido);

  if (!permiso || !permiso.bitconsulta) {
    // Si no tiene permiso o el bit es false, lo mandamos al Dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo está bien, renderiza la página solicitada
  return <Outlet />;
};

export default ProtectedRoute;