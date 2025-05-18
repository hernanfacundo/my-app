import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadStoredUser = async () => {
      const storedToken = await AsyncStorage.getItem('userToken'); // Usa 'userToken'
      if (storedToken) {
        setUser({ token: storedToken });
      }
    };
    loadStoredUser();
  }, []);

  const login = async (token) => {
    console.log('Guardando token:', token);
    await AsyncStorage.setItem('userToken', token); // Usa 'userToken'
    setUser({ token });
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