import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          setUser({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name,
          });
        }
      } catch (error) {
        console.error('Error al cargar el usuario:', error);
      }
    };
    loadUser();
  }, []);

  const login = async (token) => {
    await AsyncStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setUser({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};