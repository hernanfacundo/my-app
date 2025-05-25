import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import modernTheme from './modernTheme';
import config from '../config';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('¡Faltan datos! 📝', 'Por favor completa todos los campos para crear tu cuenta');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña muy corta 🔒', 'Tu contraseña debe tener al menos 6 caracteres para mayor seguridad');
      return;
    }

    setIsLoading(true);
    console.log('Datos enviados al registro:', { email, password, name, role });
    
    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/signup`, { email, password, name, role });
      const { token } = response.data;
      await login(token);
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error al registrarse 😕', 'No pudimos crear tu cuenta. ¿Ya existe una cuenta con este email?');
      console.error('Error al registrar usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleEmoji = (selectedRole) => {
    return selectedRole === 'student' ? '🎓' : '👩‍🏫';
  };

  const getRoleDescription = (selectedRole) => {
    return selectedRole === 'student' 
      ? 'Explora, aprende y registra tus emociones' 
      : 'Guía y acompaña a tus estudiantes';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header juvenil */}
      <View style={styles.header}>
        <Text style={styles.welcomeEmoji}>✨</Text>
        <Text style={styles.title}>¡Únete a nosotros!</Text>
        <Text style={styles.subtitle}>Crea tu cuenta y comienza tu viaje emocional</Text>
      </View>

      {/* Formulario moderno */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>👤 ¿Cómo te llamas?</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre completo"
            placeholderTextColor={modernTheme.colors.secondaryText}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

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
          <Text style={styles.inputLabel}>🔒 Crea una contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={modernTheme.colors.secondaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Selector de rol moderno */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>🎯 ¿Cuál es tu rol?</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'student' && styles.roleOptionSelected,
                { backgroundColor: role === 'student' ? modernTheme.colors.turquoise : modernTheme.colors.chartBackground }
              ]}
              onPress={() => setRole('student')}
            >
              <Text style={[
                styles.roleEmoji,
                { opacity: role === 'student' ? 1 : 0.6 }
              ]}>🎓</Text>
              <Text style={[
                styles.roleTitle,
                { color: role === 'student' ? '#FFFFFF' : modernTheme.colors.primaryText }
              ]}>Estudiante</Text>
              <Text style={[
                styles.roleDescription,
                { color: role === 'student' ? '#FFFFFF' : modernTheme.colors.secondaryText }
              ]}>Explora y aprende</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'teacher' && styles.roleOptionSelected,
                { backgroundColor: role === 'teacher' ? modernTheme.colors.coral : modernTheme.colors.chartBackground }
              ]}
              onPress={() => setRole('teacher')}
            >
              <Text style={[
                styles.roleEmoji,
                { opacity: role === 'teacher' ? 1 : 0.6 }
              ]}>👩‍🏫</Text>
              <Text style={[
                styles.roleTitle,
                { color: role === 'teacher' ? '#FFFFFF' : modernTheme.colors.primaryText }
              ]}>Docente</Text>
              <Text style={[
                styles.roleDescription,
                { color: role === 'teacher' ? '#FFFFFF' : modernTheme.colors.secondaryText }
              ]}>Guía y acompaña</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón principal */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? '⏳ Creando cuenta...' : `${getRoleEmoji(role)} ¡Crear mi cuenta!`}
          </Text>
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Link a login */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.linkText}>
            🔑 ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer motivacional */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🌟 Al registrarte, comenzarás un viaje increíble de autoconocimiento
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
  roleContainer: {
    flexDirection: 'row',
    gap: modernTheme.spacing.marginMedium,
  },
  roleOption: {
    flex: 1,
    padding: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...modernTheme.shadows.small,
  },
  roleOptionSelected: {
    borderColor: modernTheme.colors.primaryText,
    ...modernTheme.shadows.medium,
  },
  roleEmoji: {
    fontSize: 32,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  roleTitle: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    marginBottom: modernTheme.spacing.marginTiny,
  },
  roleDescription: {
    fontSize: modernTheme.fontSizes.caption,
    textAlign: 'center',
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
  linkButton: {
    alignItems: 'center',
    padding: modernTheme.spacing.paddingSmall,
  },
  linkText: {
    color: modernTheme.colors.coral,
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

export default SignUpScreen;