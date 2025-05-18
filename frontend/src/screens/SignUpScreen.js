import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';
import config from '../config';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const { login } = useContext(AuthContext);

  const handleSignUp = async () => {
    console.log('Datos enviados al registro:', { email, password, name, role });
    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/signup`, { email, password, name, role });
      const { token } = response.data;
      await login(token);
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el usuario. Verifica los datos.');
      console.error('Error al registrar usuario:', error);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Registrarse</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor={theme.colors.secondaryText}
        value={name}
        onChangeText={setName}
      />
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
      <Picker
        selectedValue={role}
        style={styles.picker}
        onValueChange={(itemValue) => setRole(itemValue)}
      >
        <Picker.Item label="Estudiante" value="student" />
        <Picker.Item label="Docente" value="teacher" />
      </Picker>
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
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
  picker: {
    width: '90%',
    backgroundColor: theme.colors.chartBackground,
    borderRadius: 8,
    marginBottom: theme.spacing.marginMedium,
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

export default SignUpScreen;