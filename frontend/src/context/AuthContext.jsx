import React, { createContext, useState, useContext, useEffect } from 'react';
// ✅ 1. IMPORTANTE: Usamos TU configuración de api, no axios directamente
import api from '../api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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
      // ✅ 2. Usamos 'api.get'. 
      // Ya no necesitas poner '/api' ni enviar los headers manualmente, 
      // porque tu archivo api.js YA LO HACE por ti.
      const res = await api.get('/auth/me');
      
      const newData = JSON.stringify(res.data);
      const oldData = localStorage.getItem('user');
      
      if (newData !== oldData) {
        console.log("🚀 Sincronización: Permisos actualizados desde la BD");
        setUser(res.data);
        localStorage.setItem('user', newData);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
    }
  };

  useEffect(() => {
    if (token) {
      syncPermissions();
      const interval = setInterval(syncPermissions, 3000);
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