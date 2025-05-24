// src/context/AuthContext.js
import React, { 
  createContext, 
  useState, 
  useEffect, 
  useContext       // ← Asegúrate de importar useContext
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode'; // Asegúrate de instalar: npm install jwt-decode

export const AuthContext = createContext();
// Hook que expone user/login/logout
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar token al inicio
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Limpiar el token al iniciar la app (temporal)
        await AsyncStorage.removeItem('userToken');
        setUser(null);
      } catch (error) {
        console.error('Error inicializando auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (token) => {
    try {
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      // Decodificar el token JWT
      const decodedToken = jwt_decode(token);
      
      // Verificar si el token ha expirado
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        throw new Error('Token expirado');
      }

      // Guardar el token
      await AsyncStorage.setItem('userToken', token);
      
      // Guardar la información del usuario
      const userData = {
        id: decodedToken.id,
        email: decodedToken.email,
        role: decodedToken.role,
        name: decodedToken.name,
        token
      };

      console.log('Información del usuario:', userData);
      setUser(userData);

    } catch (error) {
      console.error('Error durante login:', error);
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setUser(null);
    } catch (error) {
      console.error('Error durante logout:', error);
      throw error;
    }
  };

  // Agregamos loading al valor del contexto
  const value = {
    user,
    login,
    logout,
    loading
  };

  console.log('AuthProvider - Estado actual:', { 
    isAuthenticated: !!user,
    userRole: user?.role,
    loading 
  });

  if (loading) {
    return null; // o un componente de carga
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};