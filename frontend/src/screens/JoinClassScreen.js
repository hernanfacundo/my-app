// ./src/screens/JoinClassScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import modernTheme from './modernTheme';
import CustomModal from '../components/CustomModal';
import useCustomModal from '../hooks/useCustomModal';

const JoinClassScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { modalState, showModal, hideModal } = useCustomModal();

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      showModal({
        title: '¡Oops! 📝',
        message: 'Por favor ingresa el código de la clase para continuar',
        emoji: '📝',
        buttonText: 'Entendido'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/classes/${classCode}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      console.log('Respuesta del servidor:', response.data);
      
      showModal({
        title: '¡Bienvenido! 🎉',
        message: `Te has unido exitosamente a la clase "${response.data.data.className}". ¡Comienza tu aventura de aprendizaje!`,
        emoji: '🎉',
        buttonText: '¡Genial!'
      });
      
      setClassCode('');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error al unirse a la clase:', error);
      
      const errorMessage = error.response?.data?.message || 'No pudimos unirte a la clase. ¿Verificaste el código?';
      const errorEmoji = error.response?.status === 404 ? '🔍' : 
                        error.response?.status === 409 ? '👥' : '😕';
      
      showModal({
        title: `${errorEmoji} Información`,
        message: errorMessage,
        emoji: errorEmoji,
        buttonText: 'Intentar de nuevo'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header juvenil */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🎓</Text>
          <Text style={styles.title}>¡Únete a una clase!</Text>
          <Text style={styles.subtitle}>Conecta con tu profesor y compañeros</Text>
        </View>

        {/* Botón para ver clases actuales */}
        <TouchableOpacity
          style={styles.myClassesButton}
          onPress={() => navigation.navigate('ClassList')}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonEmoji}>📚</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Ver mis clases</Text>
              <Text style={styles.buttonSubtitle}>Revisa tus clases actuales</Text>
            </View>
            <Text style={styles.buttonArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Tarjeta de instrucciones */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 ¿Cómo funciona?</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Pide el código a tu profesor</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Escríbelo en el campo de abajo</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>¡Presiona unirse y listo!</Text>
            </View>
          </View>
        </View>

        {/* Formulario de código */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>🔑 Código de la clase</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: ABC123 o MATE2024"
            placeholderTextColor={modernTheme.colors.secondaryText}
            value={classCode}
            onChangeText={setClassCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
          />
          
          <TouchableOpacity
            style={[styles.joinButton, loading && styles.buttonDisabled]}
            onPress={handleJoinClass}
            disabled={loading}
          >
            <Text style={styles.joinButtonText}>
              {loading ? '⏳ Uniéndome...' : '🚀 ¡Unirme a la clase!'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer motivacional */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tip: Los códigos de clase suelen tener entre 4-8 caracteres
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
};

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
  myClassesButton: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.turquoise,
    ...modernTheme.shadows.medium,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonEmoji: {
    fontSize: 24,
    marginRight: modernTheme.spacing.marginMedium,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  buttonSubtitle: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
  },
  buttonArrow: {
    fontSize: modernTheme.fontSizes.title,
    color: modernTheme.colors.turquoise,
    fontWeight: 'bold',
  },
  instructionsCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.coral,
    ...modernTheme.shadows.small,
  },
  instructionsTitle: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  stepContainer: {
    gap: modernTheme.spacing.marginMedium,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: modernTheme.colors.coral,
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.caption,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: modernTheme.spacing.marginMedium,
  },
  stepText: {
    fontSize: modernTheme.fontSizes.label,
    color: modernTheme.colors.secondaryText,
    flex: 1,
  },
  formContainer: {
    marginBottom: modernTheme.spacing.marginXLarge,
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
    marginBottom: modernTheme.spacing.marginLarge,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 2,
    ...modernTheme.shadows.small,
  },
  joinButton: {
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    ...modernTheme.shadows.medium,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
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

export default JoinClassScreen;
