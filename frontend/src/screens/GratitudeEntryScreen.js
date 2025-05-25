// frontend/src/screens/GratitudeEntryScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, StyleSheet, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import modernTheme from './modernTheme';
import config from '../config';

export default function GratitudeEntryScreen({ navigation }) {
  const [gratitudeText, setGratitudeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const saveGratitude = async () => {
    const trimmed = (gratitudeText || '').trim();
    if (!trimmed) {
      Alert.alert('¡Oops! 💭', 'Por favor, escribe algo hermoso antes de guardar. Tu gratitud es importante para nosotros 🌟');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Sesión expirada 🔐', 'Por favor, inicia sesión nuevamente para continuar');
        navigation.navigate('SignIn');
        return;
      }

      console.log('Token enviado al backend:', token);
      console.log('URL de la solicitud:', `${config.API_BASE_URL}/gratitude`);
      console.log('Enviando al backend:', { text: trimmed });

      const response = await axios.post(
        `${config.API_BASE_URL}/gratitude`,
        { text: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Respuesta del backend:', response.data);

      // Extraemos la reflexión generada por OpenAI
      const { reflect } = response.data;

      // Mostramos esa reflexión en lugar de un mensaje genérico
      Alert.alert(
        '¡Increíble! 🌟 ¿Quieres profundizar en tu gratitud?',
        reflect,
        [
          {
            text: '💬 ¡Charlemos!',
            onPress: () => navigation.navigate('Chatbot', { initialPrompt: reflect })
          },
          {
            text: '✨ Perfecto así',
            style: 'cancel',
            onPress: () => navigation.goBack()
          }
        ],
        { cancelable: false }
      );

      setGratitudeText('');
    } catch (error) {
      console.error('Error al enviar la solicitud al backend:', error.message);
      console.error('Detalles del error:', error.response?.data || error);
      Alert.alert(
        'Error al guardar 😕',
        error.response?.data?.message || 'No pudimos guardar tu gratitud. ¿Intentas de nuevo?'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderSuggestion = () => {
    const suggestions = [
      'Mi familia que siempre me apoya...',
      'Ese momento especial de hoy...',
      'La persona que me hizo sonreír...',
      'Algo pequeño pero significativo...',
      'Una oportunidad que tuve...',
      'Un lugar que me da paz...'
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const getCharacterCount = () => {
    return gratitudeText.length;
  };

  const getCharacterColor = () => {
    const count = getCharacterCount();
    if (count < 50) return modernTheme.colors.secondaryText;
    if (count < 150) return modernTheme.colors.turquoise;
    if (count < 200) return modernTheme.colors.coral;
    return modernTheme.colors.error;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header inspiracional */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🙏</Text>
        <Text style={styles.title}>Momento de Gratitud</Text>
        <Text style={styles.subtitle}>Tómate un momento para reflexionar sobre lo bueno de tu día</Text>
      </View>

      {/* Tarjeta motivacional */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationTitle}>💡 ¿Sabías que?</Text>
        <Text style={styles.motivationText}>
          Practicar gratitud por solo 5 minutos al día puede mejorar tu bienestar emocional y reducir el estrés. ¡Cada pequeño momento cuenta!
        </Text>
      </View>

      {/* Formulario principal */}
      <View style={styles.formContainer}>
        <Text style={styles.inputLabel}>✨ Hoy me siento agradecido/a por...</Text>
        
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={getPlaceholderSuggestion()}
            placeholderTextColor={modernTheme.colors.secondaryText}
            value={gratitudeText}
            onChangeText={setGratitudeText}
            multiline
            numberOfLines={6}
            maxLength={200}
            editable={!isLoading}
            textAlignVertical="top"
          />
          <View style={styles.characterCounter}>
            <Text style={[styles.characterText, { color: getCharacterColor() }]}>
              {getCharacterCount()}/200
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={saveGratitude}
          disabled={isLoading || !gratitudeText.trim()}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? '⏳ Guardando tu gratitud...' : '🌟 Guardar mi gratitud'}
          </Text>
        </TouchableOpacity>

        {/* Botón para ver historial */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('GratitudeHistory')}
        >
          <Text style={styles.historyButtonText}>📖 Ver mi historial de gratitud</Text>
        </TouchableOpacity>
      </View>

      {/* Sugerencias de gratitud */}
      <View style={styles.suggestionsCard}>
        <Text style={styles.suggestionsTitle}>💭 Ideas para inspirarte:</Text>
        <View style={styles.suggestionsList}>
          {[
            '👨‍👩‍👧‍👦 Familia y amigos',
            '🌅 Momentos del día',
            '🎯 Logros personales',
            '🌱 Oportunidades',
            '💪 Tu fortaleza',
            '🌈 Pequeños detalles'
          ].map((suggestion, index) => (
            <View key={index} style={styles.suggestionChip}>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer motivacional */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🌟 Cada momento de gratitud es una semilla de felicidad que plantas en tu corazón
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingVertical: modernTheme.spacing.paddingXLarge,
  },
  header: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  headerEmoji: {
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
  motivationCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.pastelYellow,
    ...modernTheme.shadows.small,
  },
  motivationTitle: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  motivationText: {
    fontSize: modernTheme.fontSizes.label,
    color: modernTheme.colors.secondaryText,
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  inputLabel: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
    textAlign: 'center',
  },
  textInputContainer: {
    position: 'relative',
    marginBottom: modernTheme.spacing.marginLarge,
  },
  textInput: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.primaryText,
    borderWidth: 2,
    borderColor: modernTheme.colors.turquoise,
    minHeight: 120,
    ...modernTheme.shadows.small,
  },
  characterCounter: {
    position: 'absolute',
    bottom: modernTheme.spacing.marginSmall,
    right: modernTheme.spacing.marginMedium,
    backgroundColor: modernTheme.colors.primaryBackground,
    paddingHorizontal: modernTheme.spacing.marginSmall,
    borderRadius: modernTheme.borderRadius.small,
  },
  characterText: {
    fontSize: modernTheme.fontSizes.caption,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    ...modernTheme.shadows.medium,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  historyButton: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    marginTop: modernTheme.spacing.marginMedium,
    borderWidth: 2,
    borderColor: modernTheme.colors.turquoise,
    ...modernTheme.shadows.small,
  },
  historyButtonText: {
    color: modernTheme.colors.turquoise,
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  suggestionsCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.lavender,
    ...modernTheme.shadows.small,
  },
  suggestionsTitle: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: modernTheme.spacing.marginSmall,
  },
  suggestionChip: {
    backgroundColor: modernTheme.colors.lavender,
    paddingHorizontal: modernTheme.spacing.paddingSmall,
    paddingVertical: modernTheme.spacing.marginTiny,
    borderRadius: modernTheme.borderRadius.small,
    opacity: 0.8,
  },
  suggestionText: {
    fontSize: modernTheme.fontSizes.caption,
    color: '#FFFFFF',
    fontWeight: '500',
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
