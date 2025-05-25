import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import modernTheme from './modernTheme';
import config from '../config';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('¡Oops! 📝', 'Por favor llena todos los campos para continuar');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Iniciando proceso de login...');
      const response = await axios.post(`${config.API_BASE_URL}/auth/signin`, { email, password });
      const { token } = response.data;
      
      console.log('Token recibido del servidor:', token);
      await login(token);
      
      console.log('Login completado en SignInScreen');
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert('Error de acceso 🔐', 'No pudimos encontrar tu cuenta. ¿Verificaste tu email y contraseña?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header juvenil */}
      <View style={styles.header}>
        <Text style={styles.welcomeEmoji}>👋</Text>
        <Text style={styles.title}>¡Hola de nuevo!</Text>
        <Text style={styles.subtitle}>Nos da mucho gusto verte por aquí</Text>
      </View>

      {/* Formulario moderno */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>📧 Tu email</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={modernTheme.colors.secondaryText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>🔒 Tu contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu contraseña súper secreta"
            placeholderTextColor={modernTheme.colors.secondaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Botón principal */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? '⏳ Entrando...' : '🚀 ¡Entrar!'}
          </Text>
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botón secundario */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.secondaryButtonText}>
            ✨ Crear cuenta nueva
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer motivacional */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 ¿Sabías que? Registrar tus emociones te ayuda a conocerte mejor
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingVertical: modernTheme.spacing.paddingXLarge,
  },
  header: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  title: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  subtitle: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  inputContainer: {
    marginBottom: modernTheme.spacing.marginLarge,
  },
  inputLabel: {
    fontSize: modernTheme.fontSizes.label,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  input: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.padding,
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.primaryText,
    borderWidth: 2,
    borderColor: 'transparent',
    ...modernTheme.shadows.small,
  },
  primaryButton: {
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginLarge,
    ...modernTheme.shadows.medium,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginLarge,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: modernTheme.colors.secondaryText,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: modernTheme.spacing.paddingMedium,
    fontSize: modernTheme.fontSizes.label,
    color: modernTheme.colors.secondaryText,
  },
  secondaryButton: {
    backgroundColor: modernTheme.colors.coral,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    ...modernTheme.shadows.small,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: modernTheme.spacing.paddingLarge,
  },
  footerText: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default SignInScreen;