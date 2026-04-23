import axios from 'axios';

const api = axios.create({
  // En desarrollo usa localhost, en producción usa tu servidor de Render
  baseURL: import.meta.env.MODE === 'development' 
    ? 'http://localhost:4000/api' 
    : 'https://backend-final-uttt.onrender.com/api' 
});

// ✅ INTERCEPTOR: Inyecta el token automáticamente en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;