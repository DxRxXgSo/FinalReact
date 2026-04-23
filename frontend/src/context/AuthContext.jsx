import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Inicialización de estados desde localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // 🔄 FUNCIÓN DE SINCRONIZACIÓN EN TIEMPO REAL
  const syncPermissions = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newData = JSON.stringify(res.data);
      const oldData = localStorage.getItem('user');
      
      // Solo actualizamos si hay cambios reales para evitar bucles de renderizado
      if (newData !== oldData) {
        console.log("🚀 Sincronización: Permisos actualizados desde la BD");
        setUser(res.data);
        localStorage.setItem('user', newData);
      }
    } catch (error) {
      // Si el servidor responde 401 (token expirado) o 403, sacamos al usuario
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
    }
  };

  // ✅ EFECTO PARA TIEMPO REAL (REVISIÓN CADA 3 SEGUNDOS)
  useEffect(() => {
    if (token) {
      // Sincroniza de inmediato al cargar
      syncPermissions();

      // Crea el intervalo para revisar cada 3 segundos
      const interval = setInterval(syncPermissions, 3000);
      
      // Limpia el intervalo cuando el componente se destruye
      return () => clearInterval(interval);
    }
  }, [token]);

  const login = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);