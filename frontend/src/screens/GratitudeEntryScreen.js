import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';
import config from '../config';

const GratitudeEntryScreen = ({ navigation }) => {
  const [gratitudeText, setGratitudeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const saveGratitude = async () => {
    const trimmedText = (gratitudeText || '').trim();

    if (!trimmedText) {
      Alert.alert('Error', 'Por favor, escribe algo antes de guardar. 🌟');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Por favor, inicia sesión nuevamente');
        navigation.navigate('SignIn');
        return;
      }

      console.log('Token enviado al backend:', token);
      console.log('URL de la solicitud:', `${config.API_BASE_URL}/gratitude`);
      console.log('Enviando al backend:', { text: trimmedText });

      const response = await axios.post(
        `${config.API_BASE_URL}/gratitude`,
        { text: trimmedText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Respuesta del backend:', response.data);

      Alert.alert('¡Genial!', 'Hoy sumaste gratitud 🌟', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      setGratitudeText('');
    } catch (error) {
      console.error('Error al enviar la solicitud al backend:', error.message);
      console.error('Detalles del error:', error.response?.data || error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo guardar tu gratitud. Intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Hoy me siento agradecido por... 🌈</Text>
      <TextInput
        style={[globalStyles.input, styles.textInput]}
        placeholder="Escribe algo sencillo… 💬"
        placeholderTextColor={theme.colors.secondaryText}
        value={gratitudeText}
        onChangeText={(text) => setGratitudeText(text || '')}
        multiline
        numberOfLines={4}
        maxLength={200}
      />
      <TouchableOpacity
        style={[globalStyles.button, styles.button]}
        onPress={saveGratitude}
        disabled={isLoading}
      >
        <Text style={globalStyles.buttonText}>
          {isLoading ? 'Guardando...' : 'Guardar 🌟'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    height: 100,
    textAlignVertical: 'top',
    marginVertical: theme.spacing.marginMedium,
    borderColor: theme.colors.accent,
    borderWidth: 1,
    borderRadius: 8,
    padding: theme.spacing.paddingSmall,
  },
  button: {
    backgroundColor: theme.colors.accent,
  },
});

export default GratitudeEntryScreen;