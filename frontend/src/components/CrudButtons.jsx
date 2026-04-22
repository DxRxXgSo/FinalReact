const CrudButtons = ({ moduloName }) => {
  const { user } = useAuth();
  
  // Buscamos los permisos de este módulo específico
  const p = user?.permisos?.find(perm => perm.strnombremodulo === moduloName);

  if (!p) return null; // Si no tiene permisos, no ve nada

  return (
    <div className="d-flex gap-2">
      {p.bitagregar && <button className="btn btn-pastel-blue">Crear</button>}
      {p.bitconsultar && <button className="btn btn-info">Consultar</button>}
      {p.biteditar && <button className="btn btn-pastel-pink">Editar</button>}
      {p.biteliminar && <button className="btn btn-danger">Eliminar</button>}
    </div>
  );
};