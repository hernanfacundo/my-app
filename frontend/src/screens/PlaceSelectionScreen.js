import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../screens/globalStyles';
import modernTheme from '../screens/modernTheme';

const PlaceSelectionScreen = ({ route, navigation }) => {
  const { mood, emotion } = route.params;

  useEffect(() => {
    console.log('Parámetros recibidos en PlaceSelectionScreen:', { mood, emotion });
  }, [mood, emotion]);

  // Lugares con iconos y colores únicos
  const places = [
    { name: 'Casa', emoji: '🏠', color: modernTheme.colors.turquoise },
    { name: 'Trabajo', emoji: '💼', color: modernTheme.colors.coral },
    { name: 'Parque', emoji: '🌳', color: '#A8E6CF' },
    { name: 'Escuela', emoji: '🎓', color: modernTheme.colors.pastelYellow },
    { name: 'Gimnasio', emoji: '💪', color: modernTheme.colors.coral },
    { name: 'Calle', emoji: '🚶', color: modernTheme.colors.lavender },
    { name: 'Café', emoji: '☕', color: '#D2B48C' },
    { name: 'Biblioteca', emoji: '📚', color: modernTheme.colors.turquoise },
    { name: 'Tienda', emoji: '🛍️', color: modernTheme.colors.pastelYellow },
  ];

  if (!places.length) {
    Alert.alert('Error', 'No se pueden cargar los lugares.');
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Error al cargar los lugares</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header moderno */}
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>¿Dónde estás ahora?</Text>
        <Text style={styles.subtitle}>
          Te sientes "{emotion}" - el lugar puede influir en tus emociones 📍
        </Text>
      </View>

      {/* Grid de lugares */}
      <View style={styles.placesGrid}>
        {places.map((place, index) => (
          <TouchableOpacity
            key={place.name}
            style={[
              styles.placeCard,
              { backgroundColor: place.color }
            ]}
            onPress={() => navigation.navigate('Comment', { mood, emotion, place: place.name })}
          >
            <View style={styles.placeIconContainer}>
              <Text style={styles.placeEmoji}>{place.emoji}</Text>
            </View>
            <Text style={styles.placeName}>{place.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer informativo */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          🌟 Sabías que: El entorno puede afectar hasta un 40% de tu estado de ánimo
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
  placesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  placeCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: modernTheme.borderRadius.small,
    padding: modernTheme.spacing.paddingSmall,
    marginBottom: modernTheme.spacing.marginTiny,
    alignItems: 'center',
    justifyContent: 'center',
    ...modernTheme.shadows.medium,
  },
  placeIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: modernTheme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: modernTheme.spacing.marginTiny,
  },
  placeEmoji: {
    fontSize: 20,
  },
  placeName: {
    fontSize: modernTheme.fontSizes.smallLabel,
    fontWeight: '600',
    color: modernTheme.colors.chartBackground,
    textAlign: 'center',
  },
  footerContainer: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginTop: modernTheme.spacing.marginLarge,
    borderWidth: 1,
    borderColor: modernTheme.colors.turquoise,
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

export default PlaceSelectionScreen;