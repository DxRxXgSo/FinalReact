
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

/**
 * 🔐 PROVIDER DE AUTENTICACIÓN (VERSIÓN PRO)
 */
export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 clave para evitar errores

  /**
   * 🔄 Cargar sesión al iniciar app
   */
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken) setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));

    } catch (error) {
      console.error('❌ Error leyendo sesión:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false); // ✅ importante
    }
  }, []);

  /**
   * 🔓 Login
   */
  const login = (userData, userToken) => {
    try {
      setToken(userToken);
      setUser(userData);

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error) {
      console.error('❌ Error guardando sesión:', error);
    }
  };

  /**
   * 🔒 Logout
   */
  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading, // 🔥 ahora disponible en toda la app
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 🎯 Hook personalizado
 */
export const useAuth = () => useContext(AuthContext);
