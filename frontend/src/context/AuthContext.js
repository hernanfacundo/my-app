import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadStoredUser = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (storedToken) {
        setUser({ token: storedToken }); // Ajusta según la estructura de tu token
      }
    };
    loadStoredUser();
  }, []);

  const login = async (token) => {
    await AsyncStorage.setItem('userToken', token);
    setUser({ token }); // Asegúrate de que el token se actualice
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };