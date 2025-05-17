import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';
import config from '../config';

const CommentScreen = ({ navigation, route }) => {
  const { mood, emotion, place } = route.params || {};
  const [comment, setComment] = useState('');

  // Función para decodificar el token manualmente
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return {};
    }
  };

  const handleSaveMood = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
  
      const decodedToken = decodeToken(token);
      const userEmail = decodedToken.email || 'Usuario';
      const userName = userEmail.split('@')[0];
  
      const url = `${config.API_BASE_URL.replace(/\/api$/, '')}/api/moods`; // Elimina /api duplicado
      console.log('Enviando solicitud a:', url, 'con datos:', { mood, emotion, place, comment });
      await axios.post(
        url,
        { mood, emotion, place, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const response = await axios.post(
        `${config.API_BASE_URL.replace(/\/api$/, '')}/api/analyze-emotions`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const personalizedMessage = response.data.analysis || 'Hola, no tengo suficiente info para charlar, pero estoy acá para vos. ¿Qué te gustaría contarme?';
  
      Alert.alert(
        'Estado Guardado',
        personalizedMessage,
        [
          { text: 'No', style: 'cancel' },
          { text: 'Sí', onPress: () => navigation.navigate('Chatbot', { analysis: personalizedMessage }) },
        ]
      );
    } catch (error) {
      console.error('Error al guardar mood o analizar emociones:', error);
      Alert.alert('Error', 'No se pudo guardar el estado o analizar las emociones');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Añadir Comentario</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe un comentario..."
        placeholderTextColor={theme.colors.secondaryText}
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveMood}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    flex: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  input: {
    height: 80,
    width: '90%',
    backgroundColor: theme.colors.chartBackground,
    borderRadius: 8,
    padding: theme.spacing.padding,
    marginBottom: theme.spacing.marginMedium,
    fontSize: theme.fontSizes.label,
    color: theme.colors.primaryText,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: theme.spacing.marginSmall,
    width: '90%',
  },
  buttonText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
});

export default CommentScreen;