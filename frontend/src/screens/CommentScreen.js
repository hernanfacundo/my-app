import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../screens/globalStyles';
import modernTheme from '../screens/modernTheme';
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
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token found');
  
      const decodedToken = decodeToken(token);
      const userEmail = decodedToken.email || 'Usuario';
      const userName = userEmail.split('@')[0];
  
      const url = `${config.API_BASE_URL.replace(/\/api$/, '')}/api/moods`;
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
        '✨ Estado Guardado',
        `${personalizedMessage}\n\n¿Te gustaría hablar con nuestro asistente virtual?`,
        [
          { text: 'Ahora no', style: 'cancel', onPress: () => navigation.navigate('Dashboard') },
          { text: 'Sí, hablemos 💬', onPress: () => navigation.navigate('Chatbot', { analysis: personalizedMessage }) },
        ]
      );
    } catch (error) {
      console.error('Error al guardar mood o analizar emociones:', error);
      Alert.alert('Error', 'No se pudo guardar el estado o analizar las emociones');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header moderno */}
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>¡Casi terminamos! 🎉</Text>
        <Text style={styles.subtitle}>
          Agrega un comentario para completar tu registro emocional
        </Text>
      </View>

      {/* Resumen de selección */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Tu selección:</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Estado</Text>
            <Text style={styles.summaryValue}>{mood}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Emoción</Text>
            <Text style={styles.summaryValue}>{emotion}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Lugar</Text>
            <Text style={styles.summaryValue}>{place}</Text>
          </View>
        </View>
      </View>

      {/* Input de comentario moderno */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>¿Algo más que quieras agregar? 💭</Text>
        <TextInput
          style={styles.modernInput}
          placeholder="Cuéntanos más sobre cómo te sientes... (opcional)"
          placeholderTextColor={modernTheme.colors.secondaryText}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.inputHint}>
          💡 Tip: Escribir sobre tus emociones puede ayudarte a procesarlas mejor
        </Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveMood}
        >
          <View style={styles.saveButtonIcon}>
            <Text style={styles.saveButtonIconText}>💾</Text>
          </View>
          <View style={styles.saveButtonContent}>
            <Text style={styles.saveButtonTitle}>Guardar mi Estado</Text>
            <Text style={styles.saveButtonSubtitle}>Y obtener análisis personalizado</Text>
          </View>
          <View style={styles.saveButtonArrow}>
            <Text style={styles.saveButtonArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => handleSaveMood()}
        >
          <Text style={styles.skipButtonText}>Guardar sin comentario</Text>
        </TouchableOpacity>
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
    padding: modernTheme.spacing.paddingLarge,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginXLarge,
    paddingVertical: modernTheme.spacing.paddingMedium,
  },
  mainTitle: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  subtitle: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: modernTheme.spacing.paddingMedium,
  },
  summaryContainer: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.large,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderWidth: 1,
    borderColor: modernTheme.colors.turquoise,
    ...modernTheme.shadows.small,
  },
  summaryTitle: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  summaryValue: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '600',
    color: modernTheme.colors.turquoise,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  inputLabel: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  modernInput: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.primaryText,
    minHeight: 120,
    borderWidth: 2,
    borderColor: modernTheme.colors.lavender,
    ...modernTheme.shadows.small,
  },
  inputHint: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginTop: modernTheme.spacing.marginSmall,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: modernTheme.spacing.marginMedium,
    ...modernTheme.shadows.medium,
  },
  saveButtonIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: modernTheme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.marginMedium,
  },
  saveButtonIconText: {
    fontSize: 16,
  },
  saveButtonContent: {
    flex: 1,
  },
  saveButtonTitle: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
    marginBottom: 2,
  },
  saveButtonSubtitle: {
    fontSize: modernTheme.fontSizes.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  saveButtonArrow: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonArrowText: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
  },
  skipButton: {
    backgroundColor: 'transparent',
    padding: modernTheme.spacing.paddingSmall,
    borderRadius: modernTheme.borderRadius.small,
    borderWidth: 1,
    borderColor: modernTheme.colors.secondaryText,
    width: '100%',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    fontWeight: '500',
  },
});

export default CommentScreen;