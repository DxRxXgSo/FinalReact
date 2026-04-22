import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
    <h1 className="display-1 fw-bold text-pastel-pink" style={{ fontSize: '120px', color: '#FFB7B2' }}>404</h1>
    <h2 className="mb-4">¡Ups! Página no encontrada</h2>
    <p className="text-muted mb-4">Lo sentimos, la url a la que intentas acceder no existe o no tienes permisos.</p>
    <Link to="/" className="btn btn-pastel-blue text-white px-5 py-2 fw-bold shadow-sm">
      Volver al Inicio
    </Link>
  </div>
);

export default NotFound;