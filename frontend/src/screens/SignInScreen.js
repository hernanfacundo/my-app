import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';
import config from '../config';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSignIn = async () => {
    console.log('Datos enviados al backend:', { email, password });
    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/signin`, { email, password });
      const { token } = response.data;
      await login(token);
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar sesión. Verifica tus credenciales.');
      console.error('Error al iniciar sesión:', error);
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
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
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