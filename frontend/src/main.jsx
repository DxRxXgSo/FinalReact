// 1. Librerías principales de React
import React from 'react';
import ReactDOM from 'react-dom/client';

// 2. Componente raíz de tu aplicación
import App from './App.jsx';

// 3. Estilos y Scripts globales (Terceros primero, luego los tuyos)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Necesario para Modales y Dropdowns
import './index.css'; // Tus colores pastel y modo oscuro al final para que tengan prioridad

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);