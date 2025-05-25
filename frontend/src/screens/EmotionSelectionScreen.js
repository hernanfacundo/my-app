import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../screens/globalStyles';
import modernTheme from '../screens/modernTheme';
import config from '../config';

const EmotionSelectionScreen = ({ route, navigation }) => {
  const { mood } = route.params;

  useEffect(() => {
    console.log('Mood recibido en EmotionSelectionScreen:', mood);
  }, [mood]);

  // Emociones con iconos y colores únicos
  const emotions = [
    { name: 'Feliz', emoji: '😊', color: modernTheme.colors.turquoise },
    { name: 'Entusiasmado', emoji: '🤩', color: modernTheme.colors.coral },
    { name: 'Alegre', emoji: '😄', color: modernTheme.colors.pastelYellow },
    { name: 'Contento', emoji: '😌', color: modernTheme.colors.lavender },
    { name: 'Satisfecho', emoji: '😇', color: '#A8E6CF' },
    { name: 'Optimista', emoji: '🌟', color: modernTheme.colors.turquoise },
    { name: 'Tranquilo', emoji: '😊', color: modernTheme.colors.lavender },
    { name: 'Neutral', emoji: '😐', color: '#B0B0B0' },
    { name: 'Relajado', emoji: '😌', color: '#A8E6CF' },
    { name: 'Confundido', emoji: '😕', color: modernTheme.colors.pastelYellow },
    { name: 'Inseguro', emoji: '😰', color: '#FFB3B3' },
    { name: 'Cansado', emoji: '😴', color: modernTheme.colors.lavender },
    { name: 'Triste', emoji: '😢', color: '#B0B0B0' },
    { name: 'Ansioso', emoji: '😟', color: '#FFB3B3' },
    { name: 'Enojado', emoji: '😠', color: modernTheme.colors.coral },
  ];

  if (!emotions.length) {
    Alert.alert('Error', 'No se pudieron cargar las emociones.');
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Error al cargar las emociones</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header moderno */}
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>¿Cómo te sientes exactamente?</Text>
        <Text style={styles.subtitle}>
          Elegiste "{mood}" - ahora sé más específico 🎯
        </Text>
      </View>

      {/* Grid de emociones */}
      <View style={styles.emotionsGrid}>
        {emotions.map((emotion, index) => (
          <TouchableOpacity
            key={emotion.name}
            style={[
              styles.emotionCard,
              { backgroundColor: emotion.color }
            ]}
            onPress={() => navigation.navigate('PlaceSelection', { mood, emotion: emotion.name })}
          >
            <View style={styles.emotionIconContainer}>
              <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
            </View>
            <Text style={styles.emotionName}>{emotion.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer motivacional */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          💡 Tip: Ser específico te ayuda a entender mejor tus emociones
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
    padding: modernTheme.spacing.paddingMedium,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginSmall,
    paddingVertical: 0,
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
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  emotionCard: {
    width: '22%',
    aspectRatio: 0.7,
    borderRadius: modernTheme.borderRadius.small,
    padding: modernTheme.spacing.paddingSmall,
    marginBottom: modernTheme.spacing.marginTiny,
    alignItems: 'center',
    justifyContent: 'center',
    ...modernTheme.shadows.medium,
  },
  emotionIconContainer: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: modernTheme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: modernTheme.spacing.marginTiny,
  },
  emotionEmoji: {
    fontSize: 18,
  },
  emotionName: {
    fontSize: modernTheme.fontSizes.smallLabel,
    fontWeight: '600',
    color: modernTheme.colors.chartBackground,
    textAlign: 'center',
  },
  footerContainer: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginTop: modernTheme.spacing.marginTiny,
    borderWidth: 1,
    borderColor: modernTheme.colors.lavender,
  },
  footerText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: '700',
    color: modernTheme.colors.error,
    textAlign: 'center',
  },
});

export default EmotionSelectionScreen;