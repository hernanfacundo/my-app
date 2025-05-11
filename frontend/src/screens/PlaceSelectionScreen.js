import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import globalStyles from '../screens/globalStyles'; // Ajustamos la ruta
import theme from '../screens/theme'; // Ajustamos la ruta

const PlaceSelectionScreen = ({ route, navigation }) => {
  const { mood, emotion } = route.params;

  useEffect(() => {
    console.log('Parámetros recibidos en PlaceSelectionScreen:', { mood, emotion });
  }, [mood, emotion]);

  const places = [
    'Casa',
    'Trabajo',
    'Parque',
    'Escuela',
    'Gimnasio',
    'Calle',
    'Café',
    'Biblioteca',
    'Tienda',
    'Otro',
  ];

  if (!places.length) {
    Alert.alert('Error', 'No se pueden cargar los lugares.');
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Error al cargar los lugares</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>¿Dónde estás?</Text>
      <View style={styles.placeContainer}>
        {places.map((place) => (
          <TouchableOpacity
            key={place}
            style={styles.placeButton}
            onPress={() => navigation.navigate('Comment', { mood, emotion, place })}
          >
            <Text style={styles.placeText}>{place}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  placeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  placeButton: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 10,
    margin: theme.spacing.marginSmall,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  placeText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
});

export default PlaceSelectionScreen;