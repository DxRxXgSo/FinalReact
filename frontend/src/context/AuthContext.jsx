import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// ✅ Usamos tu configuración centralizada de API
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

  // 🔄 FUNCIÓN DE SINCRONIZACIÓN (Envuela en useCallback para mayor estabilidad)
  const syncPermissions = useCallback(async () => {
    if (!token) return;

    try {
      // Llamada a Render usando tu instancia de 'api'
      const res = await api.get('/auth/me');
      
      const newData = JSON.stringify(res.data);
      const oldData = localStorage.getItem('user');
      
      // Solo actualizamos el estado si los datos cambiaron en la DB
      if (newData !== oldData) {
        console.log("🚀 Sincronización: Datos actualizados desde la BD");
        setUser(res.data);
        localStorage.setItem('user', newData);
      }
    } catch (error) {
      console.error("❌ Error en la sincronización:", error.response?.data || error.message);
      
      // Si el token expiró (401) o no tiene permisos (403), sacamos al usuario
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
    }
  }, [token]); // Se recrea solo si el token cambia

  // ✅ CONTROL DEL INTERVALO (3 SEGUNDOS)
  useEffect(() => {
    if (token) {
      // Ejecución inmediata al cargar o loguear
      syncPermissions();

      // Configuración del reloj
      const interval = setInterval(() => {
        syncPermissions();
      }, 3000);
      
      // Limpieza vital: detiene el reloj al cerrar sesión o salir de la app
      return () => clearInterval(interval);
    }
  }, [token, syncPermissions]);

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