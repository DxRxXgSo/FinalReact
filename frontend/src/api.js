import axios from 'axios';

const api = axios.create({
  // Si estamos en desarrollo usa localhost, si no, usa la ruta relativa
  baseURL: import.meta.env.MODE === 'development' 
    ? 'http://localhost:4000/api' 
    : '/api'
});

export default api;