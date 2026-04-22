// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializamos con el token de localStorage si existe
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

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