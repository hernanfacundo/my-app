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

const CreateClassScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateClass = async () => {
    if (!className.trim()) {
      Alert.alert('¡Oops! 📝', 'Por favor ingresa un nombre para tu clase');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/classes`,
        {
          name: className,
          description: description
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      const classCode = response.data.code || 'ABC123'; // Fallback si no viene el código

      Alert.alert(
        '¡Clase creada! 🎉',
        `Tu clase "${className}" está lista.\n\nCódigo: ${classCode}\n\nComparte este código con tus estudiantes para que se unan.`,
        [
          {
            text: 'Ver mis clases',
            onPress: () => navigation.navigate('ClassList')
          }
        ]
      );
    } catch (error) {
      console.error('Error creando clase:', error);
      Alert.alert('Error al crear clase 😕', 'No pudimos crear tu clase. ¿Intentas de nuevo?');
    } finally {
      setIsLoading(false);
    }
  };

  const getClassNameSuggestions = () => [
    'Matemáticas 2024',
    'Historia Universal',
    'Ciencias Naturales',
    'Literatura Mexicana',
    'Inglés Básico'
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header juvenil */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>👩‍🏫</Text>
        <Text style={styles.title}>¡Crea tu clase!</Text>
        <Text style={styles.subtitle}>Conecta con tus estudiantes de manera moderna</Text>
      </View>

      {/* Tarjeta de beneficios */}
      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>✨ ¿Qué puedes hacer?</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>📊</Text>
            <Text style={styles.benefitText}>Monitorear el estado emocional</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🎯</Text>
            <Text style={styles.benefitText}>Asignar rutas de aprendizaje</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>💬</Text>
            <Text style={styles.benefitText}>Comunicarte directamente</Text>
          </View>
        </View>
      </View>

      {/* Formulario moderno */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>📚 Nombre de tu clase</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Matemáticas 3° A"
            placeholderTextColor={modernTheme.colors.secondaryText}
            value={className}
            onChangeText={setClassName}
            maxLength={50}
          />
          <Text style={styles.inputHint}>
            💡 Usa un nombre claro que tus estudiantes reconozcan fácilmente
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>📝 Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe de qué trata tu clase, objetivos, horarios, etc."
            placeholderTextColor={modernTheme.colors.secondaryText}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.inputHint}>
            ✍️ Ayuda a tus estudiantes a entender mejor tu clase
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.buttonDisabled]}
          onPress={handleCreateClass}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? '⏳ Creando clase...' : '🚀 ¡Crear mi clase!'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sugerencias */}
      <View style={styles.suggestionsCard}>
        <Text style={styles.suggestionsTitle}>💭 Ideas para nombres:</Text>
        <View style={styles.suggestionsList}>
          {getClassNameSuggestions().map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => setClassName(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer motivacional */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🌟 Una vez creada, recibirás un código único para compartir con tus estudiantes
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
  benefitsCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.coral,
    ...modernTheme.shadows.small,
  },
  benefitsTitle: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  benefitsList: {
    gap: modernTheme.spacing.marginMedium,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: modernTheme.spacing.marginMedium,
  },
  benefitText: {
    fontSize: modernTheme.fontSizes.label,
    color: modernTheme.colors.secondaryText,
    flex: 1,
  },
  formContainer: {
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
  textArea: {
    height: 100,
    paddingTop: modernTheme.spacing.padding,
  },
  inputHint: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginTop: modernTheme.spacing.marginSmall,
    fontStyle: 'italic',
  },
  createButton: {
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    ...modernTheme.shadows.medium,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  suggestionsCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.pastelYellow,
    ...modernTheme.shadows.small,
  },
  suggestionsTitle: {
    fontSize: modernTheme.fontSizes.label,
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
    backgroundColor: modernTheme.colors.pastelYellow,
    paddingHorizontal: modernTheme.spacing.paddingSmall,
    paddingVertical: modernTheme.spacing.marginTiny,
    borderRadius: modernTheme.borderRadius.small,
  },
  suggestionText: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.primaryText,
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

export default CreateClassScreen;
