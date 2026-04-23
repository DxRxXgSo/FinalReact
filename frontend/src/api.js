import axios from 'axios';

const api = axios.create({
  // Si estamos en desarrollo usa localhost, si no, usa la ruta relativa
  baseURL: import.meta.env.MODE === 'development' 
    ? 'http://localhost:4000/api' 
    : '/api'
});

// ✅ INTERCEPTOR: Se ejecuta ANTES de cada petición al backend
api.interceptors.request.use(
  (config) => {
    // Buscamos el token en el almacenamiento local
    const token = localStorage.getItem('token');
    if (token) {
      // Si hay token, se lo pegamos a los headers automáticamente
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;