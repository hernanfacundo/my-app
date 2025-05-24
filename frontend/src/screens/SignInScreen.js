import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';  // <- Asegúrate de que la ruta sea correcta
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';
import config from '../config';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSignIn = async () => {
    try {
      console.log('Iniciando proceso de login...');
      const response = await axios.post(`${config.API_BASE_URL}/auth/signin`, { email, password });
      const { token } = response.data;
      
      console.log('Token recibido del servidor:', token);
      await login(token); // Solo llamamos a login, que manejará todo
      
      console.log('Login completado en SignInScreen');
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.colors.secondaryText}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={theme.colors.secondaryText}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[globalStyles.button]}
        onPress={handleSignIn}
      >
        <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.button, globalStyles.buttonSecondary]}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={[globalStyles.buttonText, globalStyles.buttonSecondaryText]}>
          Registrarse
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '90%',
    backgroundColor: theme.colors.chartBackground,
    borderRadius: 8,
    padding: theme.spacing.padding,
    marginBottom: theme.spacing.marginMedium,
    fontSize: theme.fontSizes.label,
    color: theme.colors.primaryText,
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
    marginBottom: theme.spacing.marginMedium,
  },
  buttonText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
  link: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.body,
    marginTop: theme.spacing.marginSmall,
  },
});

export default SignInScreen;