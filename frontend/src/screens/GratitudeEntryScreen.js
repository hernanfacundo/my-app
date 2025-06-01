// frontend/src/screens/GratitudeEntryScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import modernTheme from './modernTheme';
import config from '../config';
import CustomModal from '../components/CustomModal';
import useCustomModal from '../hooks/useCustomModal';

export default function GratitudeEntryScreen({ navigation }) {
  const [gratitude, setGratitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const { modalState, showModal, hideModal } = useCustomModal();

  const saveGratitude = async () => {
    const trimmed = (gratitude || '').trim();
    if (!trimmed) {
      showModal({
        title: '¡Oops! 💭',
        message: 'Por favor, escribe algo hermoso antes de guardar. Tu gratitud es importante para nosotros 🌟',
        emoji: '💭',
        buttonText: 'Entendido'
      });
      return;
    }

    try {
      setLoading(true);
      setLoadingStep('🔐 Verificando tu sesión...');

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setLoading(false);
        setLoadingStep('');
        showModal({
          title: 'Sesión expirada 🔐',
          message: 'Por favor, inicia sesión nuevamente para continuar',
          emoji: '🔐',
          buttonText: 'Ir a inicio'
        });
        navigation.navigate('SignIn');
        return;
      }

      setLoadingStep('💾 Guardando tu momento de gratitud...');

      console.log('Token enviado al backend:', token);
      console.log('URL de la solicitud:', `${config.API_BASE_URL}/gratitude`);
      console.log('Enviando al backend:', { text: trimmed });

      const response = await axios.post(
        `${config.API_BASE_URL}/gratitude`,
        { text: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Respuesta del servidor:', response.data);

      setLoadingStep('🧠 Generando reflexión personalizada...');

      // Pequeña pausa para mostrar el progreso
      setTimeout(() => {
        setLoadingStep('🏆 Verificando logros alcanzados...');
        
        setTimeout(() => {
          setLoadingStep('✨ Finalizando...');
          
          setTimeout(() => {
            setLoading(false);
            setLoadingStep('');

            // Extraemos la reflexión generada por OpenAI y las nuevas insignias
            const { reflect, newBadges = [] } = response.data;

            // Si hay nuevas insignias, mostrarlas primero
            if (newBadges && newBadges.length > 0) {
              const badgeText = newBadges.map(badge => `${badge.emoji} ${badge.name}`).join('\n');
              Alert.alert(
                '🎉 ¡Insignias Desbloqueadas!',
                `¡Felicidades! Has conseguido:\n\n${badgeText}\n\n${reflect}`,
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
            } else {
              // Sin nuevas insignias, mostrar solo la reflexión
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
            }

            showModal({
              title: '¡Gratitud guardada! ✨',
              message: 'Tu momento de gratitud se guardó con amor. ¡Sigue cultivando la positividad! 🌱💚',
              emoji: '✨',
              buttonText: '¡Genial!'
            });

            setGratitude('');
          }, 600);
        }, 800);
      }, 800);

    } catch (error) {
      console.error('Error al enviar la solicitud al backend:', error.message);
      setLoading(false);
      setLoadingStep('');
      
      if (error.response?.status === 401) {
        showModal({
          title: 'Sesión expirada 🔐',
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
          emoji: '🔐',
          buttonText: 'Ir a inicio'
        });
        navigation.navigate('SignIn');
      } else {
        showModal({
          title: 'Error al guardar 😕',
          message: 'No pudimos guardar tu gratitud en este momento. ¿Intentas de nuevo?',
          emoji: '😕',
          buttonText: 'Intentar de nuevo'
        });
      }
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
    return gratitude.length;
  };

  const getCharacterColor = () => {
    const count = getCharacterCount();
    if (count < 50) return modernTheme.colors.secondaryText;
    if (count < 150) return modernTheme.colors.turquoise;
    if (count < 200) return modernTheme.colors.coral;
    return modernTheme.colors.error;
  };

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={modernTheme.colors.turquoise} />
            <Text style={styles.loadingTitle}>Procesando tu gratitud</Text>
            <Text style={styles.loadingStep}>{loadingStep}</Text>
            <View style={styles.loadingBar}>
              <View style={[styles.loadingProgress, { 
                width: loadingStep.includes('Verificando') ? '20%' : 
                       loadingStep.includes('Guardando') ? '40%' :
                       loadingStep.includes('Generando') ? '70%' :
                       loadingStep.includes('Verificando logros') ? '90%' : '100%'
              }]} />
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header inspiracional */}
        <View style={[styles.header, loading && styles.disabledContainer]}>
          <Text style={styles.headerEmoji}>🙏</Text>
          <Text style={styles.title}>Momento de Gratitud</Text>
          <Text style={styles.subtitle}>Tómate un momento para reflexionar sobre lo bueno de tu día</Text>
        </View>

        {/* Tarjeta motivacional */}
        <View style={[styles.motivationCard, loading && styles.disabledContainer]}>
          <Text style={styles.motivationTitle}>💡 ¿Sabías que?</Text>
          <Text style={styles.motivationText}>
            Practicar gratitud por solo 5 minutos al día puede mejorar tu bienestar emocional y reducir el estrés. ¡Cada pequeño momento cuenta!
          </Text>
        </View>

        {/* Formulario principal */}
        <View style={[styles.formContainer, loading && styles.disabledContainer]}>
          <Text style={styles.inputLabel}>✨ Hoy me siento agradecido/a por...</Text>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={[styles.textInput, loading && styles.disabledInput]}
              placeholder={getPlaceholderSuggestion()}
              placeholderTextColor={modernTheme.colors.secondaryText}
              value={gratitude}
              onChangeText={setGratitude}
              multiline
              numberOfLines={6}
              maxLength={200}
              editable={!loading}
              textAlignVertical="top"
            />
            <View style={styles.characterCounter}>
              <Text style={[styles.characterText, { color: getCharacterColor() }]}>
                {getCharacterCount()}/200
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, (loading || !gratitude.trim()) && styles.buttonDisabled]}
            onPress={saveGratitude}
            disabled={loading || !gratitude.trim()}
          >
            {loading ? (
              <View style={styles.loadingButtonContent}>
                <ActivityIndicator size="small" color="white" style={{ marginRight: 10 }} />
                <Text style={styles.saveButtonText}>Guardando tu gratitud...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>🌟 Guardar mi gratitud</Text>
            )}
          </TouchableOpacity>

          {/* Botón para ver historial */}
          <TouchableOpacity
            style={[styles.historyButton, loading && styles.buttonDisabled]}
            onPress={() => navigation.navigate('GratitudeHistory')}
            disabled={loading}
          >
            <Text style={[styles.historyButtonText, loading && styles.disabledText]}>
              📖 Ver mi historial de gratitud
            </Text>
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
      
      {/* Modal personalizado */}
      <CustomModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        emoji={modalState.emoji}
        buttonText={modalState.buttonText}
        onClose={hideModal}
      />
    </View>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: modernTheme.colors.primaryBackground,
    padding: modernTheme.spacing.paddingXLarge,
    borderRadius: modernTheme.borderRadius.medium,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  loadingStep: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  loadingBar: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.small,
    height: 20,
    width: '100%',
    overflow: 'hidden',
  },
  loadingProgress: {
    backgroundColor: modernTheme.colors.turquoise,
    height: '100%',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  disabledInput: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});
